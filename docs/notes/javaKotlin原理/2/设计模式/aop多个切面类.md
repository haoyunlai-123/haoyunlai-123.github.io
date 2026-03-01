为什么多个切面类能匹配同一个方法？aop不是生成的代理类吗？那autowired的时候是如何注入多个类的？

非常棒👏——你已经进入了 **Spring AOP 底层代理与切面链织入机制** 的核心问题。
 你说得完全对：AOP 确实是通过 **代理类** 实现的，但**多个切面能作用在同一个方法**，是因为 Spring 在代理对象内部维护了一条“责任链（Advice Chain）”，而不是多个代理层层嵌套地去注入。

我们来一步步剖开这个机制。

------

## 🧩 一、多个切面能匹配同一个方法？——可以，而且很常见！

假设我们有两个切面：

```java
@Aspect
@Component
public class LogAspect {
    @Before("execution(* com.itheima.service.*.*(..))")
    public void logBefore() {
        System.out.println("【LogAspect】方法执行前");
    }
}
@Aspect
@Component
public class TimeAspect {
    @Around("execution(* com.itheima.service.*.*(..))")
    public Object recordTime(ProceedingJoinPoint jp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = jp.proceed();
        System.out.println("【TimeAspect】耗时：" + (System.currentTimeMillis() - start));
        return result;
    }
}
```

两者都匹配 `UserService.save()`。

运行时输出可能是：

```
【LogAspect】方法执行前
【TimeAspect】耗时：5ms
```

👉 即使它们都指向同一个目标方法，Spring 依然能保证有序执行。

------

## ⚙️ 二、AOP 的本质：一个代理对象 + 一条切面链（不是多个代理）

### ❌ 错误想象：

> 很多人以为多个切面会生成多个代理：
>
> ```
> 原始对象 → 代理1(LogAspect) → 代理2(TimeAspect)
> ```

这在早期 Spring 1.x 的 JDK 动态代理阶段部分情况下确实可能，但在现代 Spring（尤其是 CGLIB 模式下）中，
 **Spring 只会创建一个代理对象！**

------

### ✅ 真正情况：

Spring 会在容器启动时：

1. 找出所有符合 AOP 的切面；
2. 将这些切面对应的通知（Advice）组成一个**有序链（InterceptorChain）**；
3. 给目标 Bean 创建 **一个代理类**；
4. 这个代理类内部在调用目标方法时，依次执行整条链。

图示如下：

```
┌────────────────────────┐
│      UserServiceImpl    │
└────────────┬───────────┘
             │（被代理）
             ▼
┌────────────────────────┐
│   Proxy(UserService)   │
│  - adviceChain = [Log, Time] 
│  - invoke() {          │
│       chain.proceed(); │
│  }                     │
└────────────────────────┘
```

每个 advice（切面通知）都相当于链中的一环：

```
LogAdvice → TimeAdvice → (最终执行目标方法)
```

执行顺序按切面优先级（`@Order` 或定义顺序）决定。

------

## 🧠 三、那 `@Autowired` 注入时是谁被注入的？

当你写：

```java
@Autowired
private UserService userService;
```

Spring 容器中实际上存在两个东西：

1. **原始 Bean**（UserServiceImpl）
2. **代理 Bean**（Proxy of UserServiceImpl）

👉 但是容器在启动时会**用代理 Bean 替换原始 Bean 的引用**。

即：

- 原始的 `UserServiceImpl` 先被创建；
- 然后经过 AOP 的 `BeanPostProcessor`（例如 `AnnotationAwareAspectJAutoProxyCreator`）处理；
- 最终容器把“代理对象”放进单例池，覆盖原 Bean。

当你 `@Autowired` 时：

- 实际注入的是那个 **代理对象**；
- 它内部持有原始对象引用和切面链；
- 调用方法时走代理逻辑，最终再调用原对象的方法。

------

## 🔍 四、多个切面的顺序是谁决定的？

Spring 有明确规则：

1. 你可以用 `@Order` 指定切面优先级：

   ```java
   @Order(1)
   @Aspect
   public class LogAspect {}
   ```

   值越小优先级越高，先执行。

2. 如果没指定：

   - 默认按切面类名或注册顺序；
   - 或由 `Ordered` 接口控制。

------

## ⚙️ 五、底层关键类：`AnnotationAwareAspectJAutoProxyCreator`

这是 AOP 的核心处理器：

- 它实现了 `BeanPostProcessor`；

- 在每个 Bean 初始化后判断：

  > 是否匹配任何切点表达式？

- 如果匹配：

  > 就构造一个 **ProxyFactory**，把所有匹配的 Advisor（即切面通知）加入进来；

- 生成一个代理类（通常是 CGLIB）。

------

## ✅ 六、总结一下关键点

| 问题                        | 结论                                            |
| --------------------------- | ----------------------------------------------- |
| 多个切面能匹配同一方法吗？  | ✅ 可以，按优先级依次执行                        |
| 是多个代理类嵌套的吗？      | ❌ 不是，Spring 合并为一条切面链，一个代理对象   |
| @Autowired 注入时注入哪个？ | ✅ 注入的是“代理对象”                            |
| 代理类内部如何调多个切面？  | ✅ 维护一个 `MethodInterceptor` 链（责任链模式） |
| 顺序如何控制？              | 用 `@Order` 或实现 `Ordered` 接口               |

------

## 📘 七、类比一下更容易理解：

假设你有：

```java
@Order(1) SecurityAspect
@Order(2) LogAspect
@Order(3) TimeAspect
```

执行链如下：

```
代理.invoke() →
   Security.before() →
      Log.before() →
         Time.around() →
            目标方法 →
         Time.after() →
      Log.after() →
   Security.after()
```

一整个代理对象就像一个“过滤器链”或“拦截器管道”。

------

如果你愿意，我可以帮你画一张图（类似 Spring 内部的 `MethodInterceptor` 调用栈），展示“一个代理对象执行多切面”的完整执行链，要我画出来吗？