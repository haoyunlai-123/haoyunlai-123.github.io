jdk25新加了哪些特性？

很好，这里给你整理一下 JDK 25（Java 25）中的 **主要新特性**，方便你复习或面试用。若要细节（每个 JEP 的说明）我也可以再给你。

------

## 🎯 Java 25 的定位

- Java 25 是一个 **长期支持 (LTS)** 版本。 ([Oracle](https://www.oracle.com/news/announcement/oracle-releases-java-25-2025-09-16/?utm_source=chatgpt.com))
- 本次版本中共包含约 **18 项 JDK Enhancement Proposals (JEPs)**，涵盖语言、库、运行时、虚拟机改进。 ([Baeldung on Kotlin](https://www.baeldung.com/java-25-features?utm_source=chatgpt.com))
- 特别强调对**启动性能、内存占用、云原生/容器环境**和**AI 相关能力**的提升。 ([InfoWorld](https://www.infoworld.com/article/4057212/the-three-game-changing-features-of-jdk-25.html?utm_source=chatgpt.com))

------

## 🧩 主要新特性（节选）

下面列出一些最值得关注的特性（语言特性 + 运行时/VM特性）：

### 语言/编译器/API方面

- JEP 507: **Primitive Types in Patterns, instanceof, and switch**（第三预览）——模式匹配里支持原始类型。 ([Baeldung on Kotlin](https://www.baeldung.com/java-25-features?utm_source=chatgpt.com))
- JEP 511: **Module Import Declarations** —— 在 Java 源文件中，可以直接声明模块导入。 ([Baeldung on Kotlin](https://www.baeldung.com/java-25-features?utm_source=chatgpt.com))
- JEP 512: **Compact Source Files and Instance Main Methods** —— 简化 Java 程序最小启动形式，比如允许 `void main()`、源文件无需显式类声明。 ([jvm-weekly.com](https://www.jvm-weekly.com/p/feature-freeze-for-jdk-25-what-will?utm_source=chatgpt.com))
- JEP 513: **Flexible Constructor Bodies** —— 构造器体中可更灵活地编写、在 super()/this() 之前执行逻辑。 ([jrebel.com](https://www.jrebel.com/blog/java-25?utm_source=chatgpt.com))
- JEP 502: **Stable Values (Preview)** —— 为某些 API 提供不可变“值”类型支持。 ([openjdk.org](https://openjdk.org/projects/jdk/25/?utm_source=chatgpt.com))
- JEP 506: **Scoped Values** —— 一个改进的线程局部变量 (thread-local) 或作用域值机制，尤其适配虚拟线程。 ([The JetBrains Blog](https://blog.jetbrains.com/idea/2025/09/java-25-lts-and-intellij-idea/?utm_source=chatgpt.com))
- 安全/加密增强：如 JEP 470: **PEM Encodings of Cryptographic Objects (Preview)**、 JEP 510: **Key Derivation Function API**。 ([InfoQ](https://www.infoq.com/news/2025/08/java-25-so-far/?utm_source=chatgpt.com))

### 运行时/虚拟机/性能方面

- JEP 519: **Compact Object Headers** —— 物件头缩减（在 64 位平台上），降低对象内存开销。 ([InfoQ](https://www.infoq.com/news/2025/09/java25-released/?utm_source=chatgpt.com))
- JEP 515: **Ahead-of-Time Method Profiling** —— 利用之前运行记录的方法执行统计，在启动时就优化热路径，加快暖机。 ([InfoWorld](https://www.infoworld.com/article/3846172/jdk-25-the-new-features-in-java-25.html?utm_source=chatgpt.com))
- JEP 509: **JFR CPU-Time Profiling (Experimental)** —— 在 Linux 上通过内核 CPU 计时器增强 JFR (Flight Recorder) 的 CPU 时间分析。 ([Reddit](https://www.reddit.com/r/programming/comments/1l6xwja/the_new_features_in_jdk_25/?utm_source=chatgpt.com))
- JEP 521: **Generational Shenandoah** —— Shenandoah GC 引入分代模式，进一步降低暂停。 ([InfoQ](https://www.infoq.com/news/2025/09/java25-released/?utm_source=chatgpt.com))

------

## 🔍 面试/实用角度总结

- 如果你是面试后端/JVM方向，这些特性里尤其值得提的有：**启动性能优化 (AOT profiling)、内存头部优化 (Compact Object Headers)、语言简化特性 (Compact Source Files)、以及并发/线程改进 (Scoped Values, Structured Concurrency)**。
- 记得区分：**哪些是稳定特性**（已正式交付） vs **哪些是预览/孵化特性**。例如 JEP 507 还在预览状态。
- 若你团队还在使用旧版（如 JDK 17/21），可强调：升级到 JDK 25 不仅语言更简洁，还能带来 **性能、内存、初始启动** 多方好处。

------

如果你愿意，我可以 **为你整理一份完整的 “JDK 25 全部 18 项 JEP + 状态” 清单**（附状态：已交付/预览/孵化）并按优先级标注哪些是马上可用、哪些要等未来版本。你要我做吗？

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

有没有语法上的改变？我看你提到了”在 super()/this() 之前执行逻辑“，这个不怕有危险吗？比如提前用到父类未初始化数据

🌟非常好的问题，这个问题非常“内行”——你注意到了 JEP 513 （**Flexible Constructor Bodies**）这一点！
 它确实是 JDK 25 中**最具争议也最底层的语言语义变更之一**。
 我们来精讲一下：

------

## ✅ 一、JEP 513 是什么

JEP 513（**Flexible Constructor Bodies**）是 Java 25 引入的一个语言语法增强（目前状态是 **preview 特性**，尚未默认启用）。

它的目的是：

> 允许在构造函数 `super()` 或 `this()` 调用之前，编写少量受限制的语句，用于初始化、校验、或捕获构造参数。

也就是说，以前 Java 规定：

```java
public class Child extends Parent {
    Child(int x) {
        super(x); // 必须是第一行
        ...
    }
}
```

你**必须在第一行调用** `super(...)` 或 `this(...)`。
 而在 JDK 25 中，你可以写：

```java
public class Child extends Parent {
    Child(int x) {
        int safe = Math.max(0, x); // ✅ 在 super() 之前做一些计算
        super(safe);
        System.out.println("constructed");
    }
}
```

------

## ⚙️ 二、为什么要这样改？

在大型类层次结构中，**参数检查**、**转换**、或**安全包装**非常常见：

```java
super(Objects.requireNonNull(name));
```

但现行语法不允许在 `super()` 前有任何逻辑，
 导致开发者必须把逻辑写进静态辅助方法或父类中，反而更不清晰。

JEP 513 的目标就是：

- 让构造函数更灵活；
- 保持类型安全；
- 不破坏已有的初始化语义。

------

## 🧩 三、那安全吗？（你问得非常关键）

你说的担忧**完全合理**：

> “在 super() 之前执行逻辑，会不会访问到还没初始化的父类字段，从而导致未定义行为？”

答案是——**不会**。
 JEP 513 的设计明确禁止这一点。

### 它的约束非常严格：

在 `super()` 或 `this()` 调用前，
 你只能执行：

- 局部变量声明与赋值；
- 参数检查；
- 抛出异常；
- 调用 `static` 方法；
- 调用 `final` 方法；
- 调用外部纯函数；
- **不能访问 this，也不能访问任何实例字段或方法。**

也就是说：

```java
Child(int x) {
    System.out.println(this.value); // ❌ 编译错误：this 未初始化
    super(x);
}
```

仍然会被编译器禁止。

### 背后原理：

编译器会将 `super()` 调用前的语句放入一个 **前置初始化阶段 (pre-constructor phase)**，
 这个阶段没有 `this` 上下文。
 只有在 `super()` 调用完成后， `this` 才正式变为可用。
 从语义上相当于：

```java
// 阶段1：静态上下文中准备参数
// 阶段2：调用 super()
// 阶段3：执行剩余构造逻辑
```

------

## 🧠 四、设计者为什么不担心安全问题？

因为 JVM 的对象生命周期严格分为三步：

1. **分配内存**；
2. **调用父类构造函数**；
3. **调用子类构造函数剩余部分**。

在第 2 步之前，虽然对象已经有地址，但 JVM 会标记为“**未初始化 (uninitializedThis)**”。
 编译器和字节码验证器都会阻止任何对该对象的访问。
 因此哪怕你写了不安全的语句，也根本过不了编译。

------

## 🧱 五、举个实际例子（可以的 vs 不可以的）

✅ 合法的：

```java
class A { A(int x) {} }
class B extends A {
    B(int x) {
        int safe = Math.max(0, x); // 允许
        super(safe);
    }
}
```

❌ 非法的：

```java
class A { int value; A(int x) { value = x; } }
class B extends A {
    int y = value; // ❌ 父类还没初始化
    B(int x) {
        System.out.println(this.y); // ❌ 访问 this
        super(x);
    }
}
```

------

## 🚀 六、这个改动的意义（总结）

| 目标               | 说明                                         |
| ------------------ | -------------------------------------------- |
| ✅ 可读性           | 不用为小逻辑创建静态辅助函数                 |
| ✅ 可维护性         | 逻辑更接近使用处                             |
| ✅ 安全性           | 编译器和 verifier 仍然阻止任何对 this 的使用 |
| 🚫 不影响字节码结构 | 字节码仍旧会在 super() 之前禁用 this 引用    |

------

## 🔚 七、一句话总结

> JDK 25 的 **Flexible Constructor Bodies** 确实允许在 `super()` / `this()` 之前写逻辑，
>  但它引入了一个“前置阶段”，
>  这个阶段没有 `this` 上下文、无法访问实例状态，
>  所以**仍然完全安全，不会出现访问未初始化父类数据的风险**。

------

如果你愿意，我可以给你展示这类构造器在 JDK 25 编译后字节码中的结构变化，
 包括 `<init>` 方法在 `aload_0` 之前插入前置逻辑的方式。要我展示一段真实的 JDK 25 编译字节码吗？