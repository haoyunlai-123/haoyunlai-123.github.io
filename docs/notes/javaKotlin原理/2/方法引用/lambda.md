TimerTask timetask = () -> {
            log.info("hello");
        };这里为什么不能写lambda?

非常棒的问题 👍 ——你踩中了一个**Java 语法层面的陷阱**：

> `TimerTask` 是一个 **抽象类**，而不是一个 **函数式接口 (Functional Interface)**，
>  所以不能用 lambda 表达式来直接创建它的实例。

------

## 🧩 一、问题代码

```java
TimerTask timetask = () -> {
    log.info("hello");
};
```

编译错误大致会是：

```
error: incompatible types: bad return type in lambda expression
```

或

```
error: TimerTask is not a functional interface
```

------

## 🧠 二、原因：lambda 只能实现函数式接口

在 Java 中，lambda 表达式的底层是通过**实现一个只有一个抽象方法的接口（functional interface）**来实现的。

而 `TimerTask` 的定义是：

```java
public abstract class TimerTask implements Runnable {
    ...
}
```

- 它是一个 **抽象类**；
- 不是接口；
- 并且有**多个可继承成员**；
- 所以 lambda 无法表示它的实例化方式。

------

## ✅ 三、正确写法：使用匿名内部类

```java
TimerTask timetask = new TimerTask() {
    @Override
    public void run() {
        log.info("hello");
    }
};
```

这样才是合法的写法。

------

## ✅ 四、如果你想用 lambda，那就用 `Runnable`

`Runnable` 是一个函数式接口（只有一个抽象方法 `run()`），
 所以可以直接写 lambda：

```java
Runnable task = () -> log.info("hello");
new Timer().schedule(new TimerTask() {
    @Override
    public void run() {
        task.run();
    }
}, 1000);
```

或者更简洁地：

```java
new Timer().schedule(
    new TimerTask() {
        @Override
        public void run() {
            log.info("hello");
        }
    },
    1000
);
```

------

## 🧩 五、如果你真的想用 lambda + Timer，推荐替代方案

更现代的写法是用 `ScheduledExecutorService`（比 `Timer` 更安全、更可控）：

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(
    () -> log.info("hello"), // ✅ lambda 合法，因为是 Runnable
    0, 1, TimeUnit.SECONDS
);
```

------

## ✅ 六、总结一句话

| 写法                                | 是否可用 | 原因                                 |
| ----------------------------------- | -------- | ------------------------------------ |
| `TimerTask task = () -> {...}`      | ❌        | `TimerTask` 是抽象类，不是函数式接口 |
| `Runnable task = () -> {...}`       | ✅        | `Runnable` 是函数式接口              |
| `new TimerTask() { ... }`           | ✅        | 匿名内部类实现抽象类                 |
| `ScheduledExecutorService` + lambda | ✅        | 推荐方式                             |

------

👉 **一句话总结：**

> lambda 只能用于接口（特别是函数式接口），不能直接实例化抽象类，所以 `TimerTask` 只能用匿名内部类或改用 `Runnable`。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

@FunctionalInterface加了这个注解的接口才能用lambda替换吗？

非常好的问题 👍，你已经问到了 **Java λ（lambda）底层类型系统的关键点**。

我们来讲清楚这个细节：

> ✅ **不是** 只有加了 `@FunctionalInterface` 注解的接口才能用 lambda；
>  但 **lambda 只能用在“函数式接口”（即只有一个抽象方法的接口）上**。
>  `@FunctionalInterface` 只是一个 *编译期的检查辅助注解*，不是语法必需的。

------

## 🧩 一、什么是函数式接口（Functional Interface）

**定义：**

> 一个接口中只有一个抽象方法（不包括 `default`、`static`、`Object` 中的方法）。

例如：

```java
public interface MyFunc {
    void test(); // 只有一个抽象方法
}
```

这就是一个函数式接口。
 即使你没加 `@FunctionalInterface`，下面的代码也是合法的：

```java
MyFunc f = () -> System.out.println("hello");
f.test();
```

✅ **可以正常编译执行**。

------

## 🧠 二、那 `@FunctionalInterface` 起什么作用？

它只是告诉编译器：“这个接口我打算当函数式接口用”。
 于是编译器会帮你**强制检查**——如果接口不满足“只有一个抽象方法”，就报错。

示例：

```java
@FunctionalInterface
public interface MyFunc {
    void test();
    void test2(); // ❌ 再写一个抽象方法，编译错误
}
```

编译器错误：

```
Unexpected @FunctionalInterface annotation
MyFunc is not a functional interface
```

所以这个注解的作用是：
 👉 “让编译器帮我保证它真的是函数式接口”，
 而不是 “必须有这个注解才能用 lambda”。

------

## ✅ 三、举几个例子对比

| 接口                  | 是否加注解 | 是否能用 lambda | 原因                             |
| --------------------- | ---------- | --------------- | -------------------------------- |
| `Runnable`            | ❌ 无注解   | ✅ 可以          | 只有一个 `void run()` 抽象方法   |
| `Callable<V>`         | ❌ 无注解   | ✅ 可以          | 只有一个 `V call()` 抽象方法     |
| `Comparator<T>`       | ✅ 有注解   | ✅ 可以          | 只有一个 `compare(T,T)` 抽象方法 |
| `Function<T,R>`       | ✅ 有注解   | ✅ 可以          | 只有一个 `R apply(T)` 抽象方法   |
| `TimerTask`（抽象类） | ❌ 抽象类   | ❌ 不行          | 不是接口、不是函数式接口         |
| `MouseListener`       | ❌ 无注解   | ❌ 不行          | 有多个抽象方法                   |

------

## 🧩 四、底层原理：lambda 的类型推断

Java 编译器在看到 lambda 时，比如：

```java
x -> x + 1
```

它会尝试推断目标类型（target type）是谁。

```java
Function<Integer, Integer> f = x -> x + 1;
```

这里的目标类型是 `Function<Integer, Integer>`，
 编译器看到它是接口，并且只有一个抽象方法 `apply`，
 于是就能把 lambda 编译成 `apply` 的实现。

如果目标类型是：

- 抽象类 → ❌ 不行
- 多个抽象方法的接口 → ❌ 不行
- 单个抽象方法接口 → ✅ 可以

------

## ✅ 五、结论总结

| 说法                                        | 是否正确 | 说明                |
| ------------------------------------------- | -------- | ------------------- |
| “只有加 @FunctionalInterface 才能用 lambda” | ❌ 错误   | 注解只是辅助检查    |
| “lambda 只能用在函数式接口上”               | ✅ 正确   | 语法规则要求        |
| “函数式接口必须只有一个抽象方法”            | ✅ 正确   | 核心定义            |
| “抽象类不能用 lambda”                       | ✅ 正确   | lambda 只能实现接口 |

------

## 🧩 六、一句话记忆

> ✅ lambda 的关键不是 `@FunctionalInterface`，
>  而是 “只有一个抽象方法的接口” —— 有注解更安全，无注解也一样能用。

------

例如，这个没加注解的接口也完全能用：

```java
public interface Action {
    void execute();
}

Action a = () -> System.out.println("Run!");
a.execute();
```

而下面这个即使加了注解，也不能用 lambda：

```java
@FunctionalInterface
public interface Bad {
    void a();
    void b(); // ❌ 多个抽象方法
}
```

编译仍然会报错。

------

是否希望我帮你画一张图，直观展示 Java lambda 的编译流程（从源代码 → 目标类型推断 → invokedynamic → 实际方法绑定）？那张图非常有助于你理解 lambda 是怎么在 JVM 层实现的。