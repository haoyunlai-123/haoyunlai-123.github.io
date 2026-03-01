full gc何时触发？当方法区满了时吗？

非常好的问题 👍，这是很多人对 JVM GC 机制最容易“混为一谈”的地方。
 你提到的 Full GC（又叫 **Major GC** 或 **老年代 GC**）确实有时与方法区（Metaspace）有关，但这只是众多触发条件之一。
 我们来系统地梳理一下 👇

------

## 🧩 一、先明确概念层次

| 名称         | 作用范围                        | 是否回收老年代 | 是否回收元空间（方法区） | 是否停顿所有线程       |
| ------------ | ------------------------------- | -------------- | ------------------------ | ---------------------- |
| **Minor GC** | 年轻代 (Eden + Survivor)        | ❌ 否           | ❌ 否                     | ✅ 是                   |
| **Major GC** | 老年代                          | ✅ 是           | ❌ 否                     | ✅ 是                   |
| **Full GC**  | 整个堆（年轻 + 老年代）+ 方法区 | ✅ 是           | ✅ 是                     | ✅ 是（Stop The World） |

> 💡 也就是说：
>
> - **Full GC = 年轻代 + 老年代 + 元空间** 全部扫描、清理；
> - 所以“方法区满了”只是 Full GC 的一种触发原因之一。

------

## ⚙️ 二、Full GC 的常见触发时机（重点）

### ✅ 1️⃣ 老年代空间不足

> 最常见的 Full GC 触发条件。

触发路径：

- Minor GC 时需要把存活对象晋升到老年代；
- 若老年代放不下这些要晋升的对象；
- JVM 会强制触发 **Full GC** 尝试回收老年代。

📌 HotSpot 内部逻辑：

```cpp
if (old_gen.free() < promotion_needed) {
    trigger_full_gc();
}
```

------

### ✅ 2️⃣ 调用了 `System.gc()` 或 `Runtime.getRuntime().gc()`

手动触发的显式 Full GC。
 默认情况下，这个调用是建议性的，但在 HotSpot 中通常会直接触发 Full GC。
 （可以用 `-XX:+DisableExplicitGC` 禁止。）

------

### ✅ 3️⃣ 元空间（Metaspace）或方法区满了

> 你提到的这种情况 ✅ 属于第三类触发原因。

触发逻辑：

- 当类加载过多（如动态生成代理类、热部署）；
- Metaspace 空间不足；
- JVM 会触发 Full GC 尝试卸载无用类。

如果 Full GC 后仍然不足，则会报错：

```
java.lang.OutOfMemoryError: Metaspace
```

------

### ✅ 4️⃣ 直接内存（Direct Memory）或 SoftReference 压力

- 使用 NIO 或 Netty 时，DirectByteBuffer 在堆外分配；
- 当 Direct Memory 不足时，JVM 会先触发 Full GC；
- 以便回收弱引用 / 软引用持有的堆内缓冲对象。

------

### ✅ 5️⃣ CMS / G1 GC 特有触发

不同 GC 实现有额外触发机制：

| 收集器  | 触发时机                                                     |
| ------- | ------------------------------------------------------------ |
| **CMS** | - 老年代空间不足； - Concurrent Mode Failure（并发阶段失败）； |
| **G1**  | - Mixed GC 后老年代仍占用过高； - Humongous 对象分配失败；   |

------

## 🧠 三、与方法区（Metaspace）的关系

方法区（在 JDK 8+ 对应 **Metaspace**）主要存放：

- 类元数据（字段表、方法表、常量池）；
- JIT 生成的代码；
- ClassLoader 信息等。

Metaspace 使用的是 **本地内存（Native Memory）**，不是 Java 堆。

所以当你说：

> “方法区满了会触发 Full GC 吗？”

答案是：
 ✅ 会触发一次 Full GC 尝试卸载无用类，
 ❌ 但不保证能解决（因为 Full GC 不一定能卸载类，类加载器得先不可达）。

------

## ⚙️ 四、举个例子（触发顺序）

假设你有如下场景：

1️⃣ 程序运行一段时间，年轻代频繁 Minor GC；
 2️⃣ 老年代积压对象，空间吃紧；
 3️⃣ Eden 再次满时，触发 Minor GC；
 4️⃣ 需要晋升的对象放不下老年代；
 5️⃣ JVM 触发 **Full GC** 尝试释放老年代；
 6️⃣ 如果 Full GC 后仍放不下 → 抛出 OOM：

```
java.lang.OutOfMemoryError: Java heap space
```

------

## 🧩 五、总结触发条件总表

| 触发条件                 | 是否必然触发 Full GC | 说明                     |
| ------------------------ | -------------------- | ------------------------ |
| 老年代空间不足           | ✅                    | 最常见触发条件           |
| 调用 System.gc()         | ✅                    | 可禁用                   |
| Metaspace（方法区）满    | ✅                    | 触发类卸载               |
| DirectMemory 不足        | ✅                    | 触发尝试清理软引用       |
| CMS 并发失败             | ✅                    | CMS 特有触发             |
| G1 Mixed GC 后老年代仍高 | ✅                    | G1 特有触发              |
| Young GC 晋升失败        | ✅                    | Eden/Survivor → Old 失败 |

------

## 🧱 六、一句话总结

> **Full GC 触发不止因为方法区满。**
>  它表示 JVM 必须对整个堆（年轻代+老年代+元空间）做一次完整回收。
>
> 最常见的触发原因有：
>  1️⃣ 老年代空间不足；
>  2️⃣ System.gc() 调用；
>  3️⃣ Metaspace 满；
>  4️⃣ GC 收集器的特殊策略。

------

如果你愿意，我可以帮你画一张图 📊
 展示 JVM 各区域触发 GC 的“调用链”：
 从 Eden 满（Minor GC）→ 老年代满（Full GC）→ Metaspace 满（类卸载）→ OutOfMemoryError 的完整路径。
 那张图能帮你从内存分代的角度看清 GC 触发顺序。要我画吗？