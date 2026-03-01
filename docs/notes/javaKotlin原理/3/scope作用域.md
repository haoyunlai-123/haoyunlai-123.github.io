@Scope(value = "prototype")这个属性配置后通过getBean获取对象时是不是通过原型模式实现的？

非常好的问题 👍

Spring 中的

```java
@Scope(value = "prototype")
```

确实与 **“原型模式（Prototype Pattern）”** 的思想一致，但要注意 —— 它 **不是通过 GoF 设计模式中的原型模式（即 clone()）机制实现的**，而是 **通过 Spring 容器的实例创建逻辑实现类似效果**。

------

### 🌱 一、`@Scope("prototype")` 的真正含义

在 Spring 中，`@Scope("prototype")` 表示：

> 每次从容器中调用 `getBean()` 获取该 Bean 时，**都会创建一个新的实例**。

与之相对的默认值是 `@Scope("singleton")`，即整个容器中只创建一个单例对象。

例如：

```java
@Component
@Scope("prototype")
public class UserService {
}
```

测试：

```java
ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
UserService u1 = ctx.getBean(UserService.class);
UserService u2 = ctx.getBean(UserService.class);

System.out.println(u1 == u2); // false
```

每次 `getBean()` 得到的都是新对象。

------

### ⚙️ 二、Spring 内部是怎么实现的？

Spring **不是调用 `clone()` 方法** 或者使用 “对象原型” 模式来复制已有实例。
 它的实现逻辑更接近 “**工厂方法模式**”：

- 对于 `singleton`：容器启动时就创建好，后续直接返回同一个对象。
- 对于 `prototype`：每次 `getBean()` 时，容器都会：
  1. 调用 `createBean()`；
  2. 实例化对象（反射调用构造函数）；
  3. 依赖注入；
  4. 调用初始化方法；
  5. 返回新对象；
  6. **容器不再跟踪它的生命周期**（销毁由调用方负责）。

因此，Spring 的 “原型作用域” 是一种 **原型式创建策略**，但 **实现方式并不是 GoF 原型模式的 `clone()` 复制**，而是通过容器的 **BeanDefinition → 实例化 → 装配** 流程完成。

------

### 🧩 三、与 GoF 原型模式的区别

| 项目     | Spring 原型作用域                         | GoF 原型模式                           |
| -------- | ----------------------------------------- | -------------------------------------- |
| 目的     | 每次获取新实例                            | 快速复制已有对象                       |
| 实现方式 | 重新 new 一个实例                         | 调用对象的 `clone()`                   |
| 生命周期 | Spring 管理创建，不管理销毁               | 完全由调用者控制                       |
| 优点     | 解耦、灵活                                | 创建速度快，可动态复制状态             |
| 典型使用 | 无状态 Bean（例如 Controller 层辅助对象） | 有复杂状态的对象复制（如缓存模板对象） |

------

### 🧠 四、结论

> ✅ `@Scope("prototype")` 并非真正意义上的 GoF 原型模式实现，
>  而是 **实现了“每次创建新实例”的效果**，与原型模式的思想一致。
>  Spring 底层是通过 **反射 + BeanFactory 的创建逻辑** 来实现这种行为。

------

如果你想在 Spring 中**真正使用原型模式（clone）**，你可以结合：

```java
@Component
public class PrototypeBean implements Cloneable {
    @Override
    protected PrototypeBean clone() throws CloneNotSupportedException {
        return (PrototypeBean) super.clone();
    }
}
```

然后通过单例工厂类手动管理克隆，这样就是正统的 **原型设计模式**。

------

是否希望我帮你画一张「singleton vs prototype 作用域的创建流程图」？那样会更清楚整个 Bean 生命周期区别。