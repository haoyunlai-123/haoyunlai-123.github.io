join,wait方法调用时会让出锁吗？

一句话结论：

> **join / wait 本身不会让出锁；**  
> **只有 `wait()` 在 **synchronized 块内** 被调用时，JVM 会**先释放锁**，唤醒时再重新获取；**  
> **join() 全程持有锁，不会让出。**

------------------------------------------------
源码级行为（JDK 17）

| 方法     | 是否让出锁                 | 底层实现                                       | 使用场景                   |
| -------- | -------------------------- | ---------------------------------------------- | -------------------------- |
| `wait()` | **是**（先放锁，唤醒再抢） | `ObjectMonitor::wait` 内部 `exit` 当前锁       | 必须在 `synchronized` 块内 |
| `join()` | **否**（全程持有）         | 底层 `Object.wait()`，但**调用者已退出同步块** | 通常不在同步块里用         |

------------------------------------------------
代码验证

1. **wait() 让出锁**
```java
synchronized (lock) {
    System.out.println("A hold lock");
    lock.wait();   // 先放锁，B 才能进来
}
```

2. **join() 全程持锁**
```java
synchronized (lock) {
    t.join();   // 全程持有 lock，其他线程进不来
}
```

------------------------------------------------
一句话背走
> **wait() 在 synchronized 块内会放锁；join() 全程持锁，不会让出。**

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

join里调了this.wait()方法，是不是synchronized (lock) {
    t.join();   
}这段代码的线程在waitset上阻塞时会释放t锁

不会释放 **lock**！

虽然 `join()` 内部确实调用了 `this.wait()`，但 **调用者线程** 是在 `synchronized (lock)` 块里执行 `t.join()`，此时：

- **lock 对象** 的 Monitor 仍然被调用者线程持有  
- `t.join()` 内部只是 **t 对象** 的 `wait()`，**不会释放 lock 对象的锁**

------------------------------------------------
代码级真相（JDK 17）
```java
public final void join() throws InterruptedException {
    synchronized (this) {   // 只对 t 对象加锁
        while (isAlive()) {
            wait();        // 释放的是 t 的锁，不是调用者的 lock
        }
    }
}
```

调用栈示意：
```java
synchronized (lock) {     // 调用者持有 lock
    t.join();              // 内部 synchronized(t) + t.wait()
                           // lock 全程不释放！
}
```

------------------------------------------------
结果
- **调用者线程** 在 `t.wait()` 上阻塞，**但仍持有 `lock`**  
- **其他线程** 想进入 `synchronized (lock)` **会被阻塞**  
- **lock 全程不释放**

------------------------------------------------
一句话背走
> **join() 内部 wait() 只释放 t 对象锁，不会释放调用者所在的 lock；**  
> **所以 `synchronized(lock){ t.join(); }` 阻塞时，lock 全程持有。**