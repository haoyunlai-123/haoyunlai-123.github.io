```java
configration类中的@bean方法是如何通过参数依赖注入的？如@Configuration
public class CommonConfig {

    @Bean
    public Logger getLogger(Test1 test1) {
        return (Logger) LoggerFactory.getLogger("com.itheima");
    }

}，Logger类是final的，它是如何注入的？
```
你问的这个问题涉及 **Spring 的 `@Configuration` + `@Bean` 方法参数依赖注入机制**，以及为什么即使 `Logger` 是 `final` 类，也能被“注入”。我给你详细梳理一下原理。

---

## 1. `@Bean` 方法的参数依赖注入机制

在 Spring 中，`@Bean` 方法不仅仅是简单的工厂方法，Spring 会对它进行 **增强（CGLIB 代理）**，并支持 **方法参数注入**。

### 关键点

1. 当 Spring 创建 `@Configuration` 注解的配置类时，会生成该类的 **CGLIB 代理对象**。
2. 当 Spring 扫描到 `@Bean` 方法时，会注册这个方法为一个 Bean 的定义。
3. 如果 `@Bean` 方法有参数，比如：

```java
@Bean
public Logger getLogger(Test1 test1) { ... }
```

Spring 会自动尝试去 **容器中查找与参数类型匹配的 Bean** 并注入：

* 容器中有 `Test1` 类型的 Bean，则直接注入。
* 如果没有，则会报 `NoSuchBeanDefinitionException`。

> 换句话说，`@Bean` 方法的参数依赖注入 **不是注入返回值类型的 Bean**，而是 **注入方法参数所需要的 Bean**。

---

## 2. Logger 是 final 的，也能注入吗？

在你的例子中：

```java
@Bean
public Logger getLogger(Test1 test1) {
    return (Logger) LoggerFactory.getLogger("com.itheima");
}
```

注意：

1. `Logger` 是 final，Spring **不会直接创建 Logger Bean 并注入它**，而是你在方法里手动创建了它。
2. Spring 并不需要通过反射修改 `Logger` 的构造器或做代理，因为这里你是 **手动返回 Logger 实例**。
3. Spring 只负责：

   * 解析 `Test1 test1` 参数，并从容器中注入。
   * 调用 `getLogger(test1)` 方法。
   * 将返回的 `Logger` 实例注册到 Spring 容器中（作为一个 Bean）。

所以这里没有什么“注入 final 类”的问题，final 并不会阻止 Spring 注入 Bean，因为：

* 注入的是方法参数（Test1）。
* 方法返回值（Logger）是手动创建的，不依赖 Spring 的动态代理。

---

## 3. 总结流程

以你的例子：

```java
@Configuration
public class CommonConfig {

    @Bean
    public Logger getLogger(Test1 test1) {
        return LoggerFactory.getLogger("com.itheima");
    }
}
```

**Spring 执行顺序：**

1. 扫描 `@Configuration` -> 生成 CGLIB 代理 `CommonConfig$$EnhancerBySpringCGLIB`。
2. 遇到 `@Bean getLogger(Test1 test1)` 方法：

   * 查看 `Test1` 类型的 Bean 是否存在。
   * 如果存在，将它注入到 `test1` 参数。
3. 调用 `getLogger(test1)` 方法。
4. 获取返回的 `Logger` 实例。
5. 将 `Logger` 实例注册到容器中，类型为 `Logger`。
6. 以后在其他地方依赖 `Logger` 时，Spring 会注入这个实例。

---

## 🔑 核心结论

* **`@Bean` 方法的参数是由 Spring 自动注入的 Bean 类型**。
* **返回值类型即使是 final，也没问题**，因为是你自己在方法里手动创建的，不需要 Spring 去实例化 final 类。
* Spring 管理的其实是整个 Bean 生命周期，包括依赖解析和注册，不会破坏类的 final 特性。

---

如果你想，我可以画一个**图解 Spring `@Bean` 参数注入流程**，把 Test1 -> getLogger -> Logger 的依赖顺序画出来，会更直观。

你希望我画吗？
