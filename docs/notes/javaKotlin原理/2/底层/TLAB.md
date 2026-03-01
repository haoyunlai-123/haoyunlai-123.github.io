elden中的TLAB用来存什么？举个例子

TLAB（Thread-Local Allocation Buffer）并不是“另一种堆”，它只是 **Eden 区里给每个线程提前圈出来的一小块“私有”缓冲区**，用来放**体积不大的普通 Java 对象**。  
一句话：TLAB 存的就是“线程刚刚 new 出来的小对象”。

举个具体例子：

```java
public class OrderService {
    // 一条订单记录
    static class Order {          // 16 B 左右
        long orderId;
        int  userId;
        int  skuId;
    }

    public void handle() {
        // 每次循环都会在 TLAB 里划出 16 B
        for (int i = 0; i < 1000; i++) {
            Order o = new Order();   // <-- 这条指令 99% 命中 TLAB
            o.orderId = i;
        }
    }
}
```

运行流程（HotSpot 默认 `-XX:+UseTLAB`）：

1. 线程 T 启动时，JVM 在 Eden 里给它划 64 KB 做 TLAB，记录起始地址 `_start`、当前指针 `_top`、结束地址 `_end`。
2. 第一次 `new Order()` 时，`_top` 往后挪 16 B，指针碰撞，**完全无锁**；对象落在 TLAB 里。
3. 第 2…n 次依旧如此，直到 `_top + 16 > _end` —— TLAB 用光。
4. 线程再向 Eden “续杯”一块新的 TLAB，旧 TLAB 里的对象照常活着，等下一次 Minor GC 再决定生死。

如果突然遇到大对象：

```java
byte[] big = new byte[100_000];   // 100 KB > 当前 TLAB 剩余
```

TLAB 放不下，JVM 直接退化成“共享 Eden 分配”（需要 CAS 或加锁），这个对象就**不在 TLAB 里**。

所以 TLAB 里存的就是**线程私有、体积较小、刚刚被创建出来的普通 Java 对象**；大对象、TLAB 用光后的对象都会走普通 Eden 分配 。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

”JVM 直接退化成“共享 Eden 分配”（需要 CAS 或加锁）“这是什么意思？意思就是tlab满了后后续创建的对象jvm会以加锁的形式创建？

对，就是这个意思，但只针对“当前这次大对象”或“当前 TLAB 用光了且线程还想继续 new”的那一次分配动作，而不是永久“退化”。

1. TLAB 剩余空间不足（或对象本身大于 TLAB 阈值）  
   JVM 会放弃“指针碰撞”这条快速路径，直接**在 Eden 的公共剩余区域**里做分配。

2. 公共 Eden 是**所有线程共享**的，不能再用“撞指针”的无锁玩法，于是 HotSpot 采用：  
   - 轻量级 CAS 重试（`Atomic::cmpxchg`）去挪动全局指针 `_top`，或者  
   - 在竞争激烈时退成**重量级锁**（`ThreadCritical`  Mutex）保证原子性。  
   这一步就是大家说的“共享 Eden 分配需要加锁/CAS”。

3. 分配成功以后，线程马上又会申请一块新的 TLAB，后续的小对象继续享受无锁快速分配；  
   因此**“加锁”只发生在 TLAB 换档期或个别大对象那一次**，不会让整个线程后续都走锁。

一句话总结：  
TLAB 满了 → 当前这次对象走**CAS/锁**在共享 Eden 里分配；  
分配完立即补一个新的 TLAB，**后续小对象又回归无锁指针碰撞**。