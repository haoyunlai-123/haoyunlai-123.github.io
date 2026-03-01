ReentrantLock lock = this.lock;
    lock.lockInterruptibly();这个方法有什么用？

`lock.lockInterruptibly();` 是 **ReentrantLock** 提供的**可中断获取锁**方法，一句话作用：

> **“尝试获取锁，但允许在等待期间被其他线程 interrupt() 打断；一旦被打断，立即抛出 InterruptedException，避免无限阻塞。”**

------------------------------------------------
与 `lock()` 的核心区别
| 方法                  | 中断响应   | 阻塞行为                                               |
| --------------------- | ---------- | ------------------------------------------------------ |
| `lock()`              | **不响应** | 即使被 interrupt() 也继续阻塞，**不抛异常**            |
| `lockInterruptibly()` | **响应**   | 被 interrupt() 立即唤醒，**抛出 InterruptedException** |

------------------------------------------------
典型用法（模板代码）
```java
ReentrantLock lock = new ReentrantLock();

public void interruptibleTask() {
    try {
        lock.lockInterruptibly();   // 可中断等待
        // 临界区
        doWork();
    } catch (InterruptedException e) {
        // 被其他线程 t.interrupt() 唤醒
        System.out.println("任务被中断，提前退出");
        Thread.currentThread().interrupt(); // 保留中断标志
    } finally {
        lock.unlock();
    }
}
```

------------------------------------------------
使用场景
- **线程池任务**：响应 `shutdownNow()`，**避免池关闭时任务无限阻塞**。  
- **长时间持锁任务**：允许外部线程“**优雅打断**”正在等待锁的线程。  
- **协作式取消**：**sleep / wait / join / lockInterruptibly** 都遵循“**中断→抛异常→自己处理**”模型。

------------------------------------------------
一句话背走
> **lockInterruptibly() = 可中断的 lock()；**  
> **被 interrupt() 立即唤醒并抛 InterruptedException，适合需要响应中断的长持锁或池任务。**