```java
 @Test
    public void test2() throws ExecutionException, InterruptedException {
        FutureTask<Integer> future = new FutureTask<>(() -> {
            log.info("running.....");
            return 1;
        });

        Thread thread = new Thread(future, "thread1");
        thread.start();
//        Integer i = future.get();

        Runnable run = () -> {
            Integer i = null;
            try {
                i = future.get();
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            } catch (ExecutionException e) {
                throw new RuntimeException(e);
            }
            log.info("running.....: {}", i);
        };

        new Thread(run, "thread2").start();

        Thread.currentThread().setName("thread");
        log.info("running.....");
    }这段代码为什么多数情况只输出21:02:04.113 [thread] INFO Test0 - running.....
21:02:04.201 [thread1] INFO Test0 - running.....
```
很好的观察。你这段代码之所以**大多数情况只打印两行**（主线程和 `thread1`），而不打印 `thread2` 的日志，是因为 `thread2` 可能在 `future.get()` 之前**还没来得及启动**或者 `future.get()` 的调用被阻塞或结束太快。来看具体机制：

---

### 🧩 线程执行顺序分析

代码逻辑：

1. 创建 `FutureTask<Integer> future`，任务返回 `1`。
2. 启动 `thread1`，执行这个任务。
3. 启动 `thread2`，它会执行：

   ```java
   Integer i = future.get();
   log.info("running.....: {}", i);
   ```

   `get()` 会阻塞直到任务完成。
4. 主线程立即执行自己的 `log.info("running.....");`

---

### ⚙️ 执行时间线（多数情况）

| 时间 | 线程        | 事件                                                        |
| -- | --------- | --------------------------------------------------------- |
| T0 | 主线程       | 启动 `thread1`                                              |
| T1 | 主线程       | 启动 `thread2`                                              |
| T2 | `thread1` | 运行 lambda，打印“running…”                                    |
| T3 | `thread1` | 返回 1，完成 `FutureTask`                                      |
| T4 | 主线程       | 打印“running…”                                              |
| T5 | `thread2` | 可能还没被调度执行 `get()`；此时任务已完成，`get()` 立即返回或线程没执行到日志输出部分就结束测试。 |

JUnit 测试方法 `test2()` 执行完后 JVM 可能立即退出；
如果 `thread2` 还没输出日志，就直接中断结束。

---

### 💡 为什么有时能看到第三行

当调度器正好让 `thread2` 在主线程退出前被调度执行时，
它调用 `future.get()` 成功返回 1，打印：

```
running.....: 1
```

但大多数情况下它被抢占，或者主线程执行太快，导致日志没来得及刷新。

---

### ✅ 解决方式

让主线程等所有子线程结束：

```java
thread.join();
Thread t2 = new Thread(run, "thread2");
t2.start();
t2.join();
```

或简单地在最后加一点延时：

```java
Thread.sleep(200);
```

你会稳定看到：

```
[thread]  running.....
[thread1] running.....
[thread2] running.....: 1
```

---

### ✅ 一句话总结

> 你的输出只出现前两行，是因为 `thread2` 的 `get()` 结果还没打印就被 JUnit 主线程提前结束；并非线程不执行。
> 只要让主线程等待子线程结束（或睡眠片刻），三行日志就会稳定出现。
