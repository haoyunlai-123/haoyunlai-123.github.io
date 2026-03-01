介绍下CountDownLatch的用法

`CountDownLatch` 是 Java 并发包（`java.util.concurrent`）中非常常用的一个同步辅助类，用来 **让一组线程等待其他线程完成某些操作之后再继续执行**。

------

## 🔹 一、类定义

```java
public class CountDownLatch {
    public CountDownLatch(int count);
    public void await() throws InterruptedException;
    public boolean await(long timeout, TimeUnit unit) throws InterruptedException;
    public void countDown();
    public long getCount();
}
```

------

## 🔹 二、核心原理

可以理解为一个“倒计时锁”：

- 初始化时设置一个计数器 `count`；
- 每次调用 `countDown()`，计数减 1；
- 调用 `await()` 的线程会**一直阻塞**，直到计数器减为 0；
- 当 `count == 0` 时，所有调用 `await()` 的线程同时被唤醒，继续执行。

------

## 🔹 三、最经典示例：主线程等待子线程完成

```java
import java.util.concurrent.CountDownLatch;

public class CountDownLatchDemo {
    public static void main(String[] args) throws InterruptedException {
        int threadCount = 3;
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 1; i <= threadCount; i++) {
            new Thread(() -> {
                try {
                    System.out.println(Thread.currentThread().getName() + " 正在执行任务...");
                    Thread.sleep(2000);
                    System.out.println(Thread.currentThread().getName() + " 执行完毕");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    latch.countDown(); // 计数器减 1
                }
            }, "工作线程-" + i).start();
        }

        System.out.println("主线程等待所有子线程执行完毕...");
        latch.await(); // 阻塞，直到 count = 0
        System.out.println("所有子线程执行完毕，主线程继续执行。");
    }
}
```

### 🧠 输出示例：

```
主线程等待所有子线程执行完毕...
工作线程-1 正在执行任务...
工作线程-2 正在执行任务...
工作线程-3 正在执行任务...
工作线程-1 执行完毕
工作线程-3 执行完毕
工作线程-2 执行完毕
所有子线程执行完毕，主线程继续执行。
```

------

## 🔹 四、CountDownLatch 的两种常见用法

### ✅ 1️⃣ 主线程等待多个子线程完成（汇总场景）

- 主线程执行 `await()`；
- 每个子线程执行完任务后调用 `countDown()`；
- 主线程在所有子线程结束后继续执行。

➡️ 应用场景：

- 并行加载配置；
- 多个接口调用后再统一返回；
- 批处理任务。

------

### ✅ 2️⃣ 多个线程等待同一信号（统一起跑场景）

```java
CountDownLatch startSignal = new CountDownLatch(1);
CountDownLatch doneSignal = new CountDownLatch(N);

// 所有工作线程等待统一起跑
for (int i = 0; i < N; ++i) {
    new Thread(() -> {
        try {
            startSignal.await(); // 等待起跑信号
            doWork();
            doneSignal.countDown();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
}

prepareSomething();
startSignal.countDown(); // 发出起跑信号
doneSignal.await();      // 等所有线程结束
System.out.println("所有任务完成");
```

➡️ 应用场景：

- 并发压测工具；
- 多线程同时启动任务；
- 模拟并发请求。

------

## 🔹 五、常见注意事项

| 问题                       | 说明                                                         |
| -------------------------- | ------------------------------------------------------------ |
| `CountDownLatch` 不能复用  | 一旦 `count` 到 0 就不能重置，如需复用请用 `CyclicBarrier` 或 `Semaphore` |
| `countDown()` 无法增加计数 | 只能递减                                                     |
| 多线程安全                 | 内部用 AQS 实现，线程安全                                    |
| 异常中断                   | 若 `await()` 被中断，会抛出 `InterruptedException`           |

------

## 🔹 六、底层原理（简略）

`CountDownLatch` 内部基于 **AQS（AbstractQueuedSynchronizer）** 实现：

- `count` 保存在 `state` 字段；
- `await()` 调用 `AQS.acquireSharedInterruptibly(1)`；
- `countDown()` 调用 `AQS.releaseShared(1)`；
- 当 `state == 0` 时，`AQS` 唤醒所有阻塞线程。

------

## ✅ 七、一句话总结

> `CountDownLatch` 用于“一个或多个线程等待其他线程完成后再执行”的场景。
>  常用于并发控制、任务同步、批量执行、接口聚合、并行计算等场合。

------

要不要我帮你写一段 **Spring Boot 实战版** 示例（比如同时查询三个远程服务，等都返回后聚合结果再返回给前端）？
 那是面试里非常常见的应用场景。