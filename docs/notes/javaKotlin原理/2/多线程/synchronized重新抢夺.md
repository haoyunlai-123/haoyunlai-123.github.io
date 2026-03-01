obj.wait()线程阻塞时被唤醒后还持有obj锁码？

**不持有！**

`obj.wait()` 的完整流程（JVM 规范）：

1. **进入 synchronized** → 当前线程成为 Monitor owner  
2. **执行 wait()** → **当前线程释放 obj 锁**，**进入 WaitSet 阻塞**  
3. **被 notify()/interrupt()/超时** → 线程从 WaitSet 移到 EntryList（**仍无锁**）  
4. **重新竞争锁** → **抢到锁后才恢复执行**，**再次成为 owner**

------------------------------------------------
字节码等价
```java
synchronized (obj) {
    obj.wait();   // 内部：Monitor.wait() → 放锁 + 阻塞
}                 // 抢到锁后才退出 wait()
```

------------------------------------------------
一句话背走
> **wait() 被唤醒后线程不持有锁，必须重新竞争抢到锁才能继续执行。**

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

这样岂不是有线程安全问题？如保护性暂停public void put(Object obj) {
        synchronized (this) {
            while (list.size() == size) {
                try {
                    this.wait();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
            list.add(obj);
        }
    }这种代码，当执行list.add(obj);时若有其他线程抢先一步list.add(obj);是不是就会出现错误？

**不会出错！**  
`wait()` 被唤醒后**必须重新抢到锁**才能继续执行 `list.add(obj)`；**抢锁过程本身就是互斥的**，所以：

1. 同一时刻**只有一个线程**能进入 `synchronized` 块  
2. `wait()` 唤醒 → **重新抢锁** → **抢到锁后才继续执行 `list.add(obj)`**  
3. 其他线程**必须等当前线程退出 synchronized 块**才能进入，**不可能“抢先一步”**

------------------------------------------------
时间线（保护性暂停完整流程）

| 线程 A                                   | 线程 B     | 说明                       |
| ---------------------------------------- | ---------- | -------------------------- |
| 进入 `synchronized`                      | 阻塞       | 抢锁互斥                   |
| `while (list.size() == size)` → `wait()` | 阻塞       | A 释放锁，进入 WaitSet     |
| 被 notify → **重新抢锁**                 | 仍然阻塞   | B 仍无法进入               |
| **抢到锁** → 继续执行 `list.add(obj)`    | 仍然阻塞   | **只有一个线程能执行 add** |
| 退出 synchronized                        | 可能抢到锁 | 互斥结束                   |

------------------------------------------------
一句话背走
> **wait() 被唤醒后必须重新抢锁，抢锁过程就是互斥的；**  
> **所以 `list.add(obj)` 仍然只有一个线程能执行，不存在“抢先一步”的线程安全问题。**

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

我懂了，是不是在synchronized代码块内部，当wait被唤醒后会继续抢夺锁？

对，**必须在 synchronized 块内重新抢到锁**，才能从 `wait()` 返回并继续往下执行。

流程 recap：

1. 进入 `synchronized` → 成为锁 owner  
2. `wait()` → **释放锁**，进入 WaitSet  
3. 被 notify → **从 WaitSet 移到 EntryList**（仍无锁）  
4. **重新竞争锁** → **抢到锁后才恢复为 owner**  
5. 继续执行 `wait()` 之后的代码

所以：
> **在 synchronized 块内，被 notify 的线程必须重新抢到锁，才能从 wait() 返回并继续执行后续代码。**