介绍下可重入锁

非常好 👍，你现在进入 **JUC 并发编程的核心领域** —— 「可重入锁（ReentrantLock）」。
 这是理解 Java 多线程同步机制的关键之一。
 我们来系统地讲一下，从底层原理到应用场景，让你彻底吃透。

------

## 🧩 一、什么是可重入锁（Reentrant Lock）

**定义：**
 可重入锁指的是 **同一个线程可以多次获取同一把锁**，不会发生死锁。

简单来说，就是：

> “我自己上了锁，我自己还能再次进来。”

------

### 🧠 举个例子：

```java
synchronized void methodA() {
    System.out.println("methodA start");
    methodB(); // 再次调用另一个需要相同锁的方法
    System.out.println("methodA end");
}

synchronized void methodB() {
    System.out.println("methodB");
}
```

运行结果：

```
methodA start
methodB
methodA end
```

这里没有死锁 ——
 虽然 `methodA` 和 `methodB` 都用了同一个对象锁（`this`），
 但因为锁是**可重入**的，当前线程持有锁时可以再次进入。

------

## 🔧 二、Java中两种可重入锁

| 锁类型          | 是否可重入 | 实现原理                                   | 说明                      |
| --------------- | ---------- | ------------------------------------------ | ------------------------- |
| `synchronized`  | ✅ 是       | JVM 级别（`monitorenter` / `monitorexit`） | 自动释放，无需手动 unlock |
| `ReentrantLock` | ✅ 是       | AQS（AbstractQueuedSynchronizer）实现      | 手动加锁/解锁，更灵活     |

------

## 🧠 三、ReentrantLock 的使用示例

### ✅ 基本用法

```java
import java.util.concurrent.locks.ReentrantLock;

public class Demo {
    private final ReentrantLock lock = new ReentrantLock();

    public void outer() {
        lock.lock();  // 第一次加锁
        try {
            System.out.println("outer()");
            inner();   // 调用内部方法
        } finally {
            lock.unlock();
        }
    }

    public void inner() {
        lock.lock();  // 第二次加锁（同一个线程）
        try {
            System.out.println("inner()");
        } finally {
            lock.unlock();
        }
    }

    public static void main(String[] args) {
        new Demo().outer();
    }
}
```

输出：

```
outer()
inner()
```

不会死锁。
 即使 `inner()` 再次加锁，也能成功，因为当前线程已经持有这把锁。

------

## ⚙️ 四、底层原理（为什么不会死锁）

ReentrantLock 内部维护两个关键变量：

```java
// AbstractQueuedSynchronizer（AQS）中的核心字段
private volatile Thread exclusiveOwnerThread; // 当前持锁线程
private int state;                            // 持锁次数（重入次数）
```

当线程第一次加锁：

- `state` 从 0 → 1；
- `exclusiveOwnerThread` = 当前线程。

同一线程再次加锁：

- 检查当前线程 == `exclusiveOwnerThread`；
- 如果相同，`state++`；
- 解锁时 `state--`；
- 当 `state == 0` 时，真正释放锁。

------

## 🧩 五、可重入锁的意义

1. ✅ **防止递归调用死锁**

   ```java
   public synchronized void a() { b(); }
   public synchronized void b() { a(); } // 如果不可重入会死锁
   ```

2. ✅ **简化编码逻辑**

   - 允许锁方法调用锁方法；
   - 减少外层重复判断；
   - 适合复杂业务嵌套场景。

3. ✅ **支持锁重入次数统计**

   ```java
   int count = lock.getHoldCount(); // 当前线程重入次数
   ```

------

## ⚡ 六、ReentrantLock 的高级特性（比 synchronized 强）

| 功能                 | `synchronized` | `ReentrantLock`                |
| -------------------- | -------------- | ------------------------------ |
| 可重入               | ✅              | ✅                              |
| 可中断               | ❌              | ✅（`lockInterruptibly()`）     |
| 超时尝试             | ❌              | ✅（`tryLock(long, TimeUnit)`） |
| 公平锁支持           | ❌              | ✅（`new ReentrantLock(true)`） |
| 手动解锁             | ❌              | ✅（必须 `unlock()`）           |
| 条件变量（精准唤醒） | ❌              | ✅（`Condition`）               |

------

## 🧠 七、一个常见面试问题

> synchronized 和 ReentrantLock 的区别？

答：

| 项目     | synchronized        | ReentrantLock         |
| -------- | ------------------- | --------------------- |
| 实现层面 | JVM 内置（monitor） | Java 实现（AQS）      |
| 可重入   | ✅                   | ✅                     |
| 公平性   | 不支持              | 支持公平 / 非公平     |
| 可中断性 | 不可中断            | 可中断                |
| 超时锁   | 不支持              | 支持 tryLock(timeout) |
| 自动释放 | 自动                | 手动释放              |
| 条件变量 | 一个                | 多个 Condition        |

------

## 🔒 八、简单总结

| 要点                                                         | 说明 |
| ------------------------------------------------------------ | ---- |
| “可重入” = 同线程可多次加锁，不会死锁                        |      |
| synchronized / ReentrantLock 都是可重入的                    |      |
| ReentrantLock 提供更多控制能力（超时、公平、Condition）      |      |
| 内部通过 AQS 的 `state` + `exclusiveOwnerThread` 实现计数重入 |      |

------

要不要我给你补一张“ReentrantLock 加锁流程”的时序图？
 能直观看到线程重入和 state 变化，非常适合记忆和面试讲解。