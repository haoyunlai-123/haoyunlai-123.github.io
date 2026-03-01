当一个线程一旦用拥有了monitor锁，所有成员/静态变量都会去主存查询而不是用cpu缓存，如：

```java
public class Test16 {

    static boolean run = true;

    public static void main(String[] args) throws InterruptedException {
        new Thread(() -> {
            while (run) {
                System.out.println(run);
            }
        }).start();

        Thread.sleep(2000);
        run = false;
    }

}
```

何时线程才会去主存加载变量而不是使用cpu缓存？

1.切换线程时。2.使用sychronized锁时。3.volatile关键字

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

使用synchronized保证变量可见性时，再退出synchronized代码块后还能保证可见性吗？

能，**但只保证“退出前”的写入对其他线程可见**；  
**退出后**若不再进入任何 `synchronized` 块，**后续写入就不再有可见性保障**。

------------------------------------------------
JMM 规则（背下来）
> **“解锁前，必须把线程工作内存中该锁对应的变量刷新到主内存；**  
> **加锁后，必须从主内存重新读取该锁对应的变量。”**

→ 所以：
- **退出 synchronized 时**，**当前线程所有写入**（在该锁对应的变量上）**强制刷回主存**  
- **其他线程随后进入同一个锁时**，**强制从主存重新读取**，因此能看到这些写入

------------------------------------------------
代码验证
```java
class Counter {
    private int count = 0;

    public void inc() {
        synchronized (this) {
            count++;        // 退出前强制刷回主存
        }
        // 退出后，若不再进任何 synchronized，
        // 后续 count++ 不再强制刷，其他线程可能看不到
    }
}
```

------------------------------------------------
一句话背走
> **退出 synchronized 时，当前线程在该锁上的所有写入强制刷回主存，其他线程随后进入同一个锁时强制重新读取，因此可见性得到保障；**  
> **但若退出后不再进入任何 synchronized，后续写入就不再有可见性保障。**

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

sychronized是不是也保证了之间的指令不会重排到sychronized外面？

是的 —— **synchronized 块内部指令不会重排到块外**，但 **块外指令可以重排到块内**（**进出方向不对称**）。

------------------------------------------------
JMM 规则（背下来）
> **“解锁前，必须把线程工作内存中该锁对应的变量刷新到主内存；**  
> **加锁后，必须从主内存重新读取该锁对应的变量。”**

→ 所以：
- **退出 synchronized 时**，**当前线程所有写入**（在该锁对应的变量上）**强制刷回主存**  
- **其他线程随后进入同一个锁时**，**强制从主存重新读取**，因此能看到这些写入

------------------------------------------------
代码验证
```java
class Counter {
    private int count = 0;

    public void inc() {
        synchronized (this) {
            count++;        // 退出前强制刷回主存
        }
        // 退出后，若不再进任何 synchronized，
        // 后续 count++ 不再强制刷，其他线程可能看不到
    }
}
```

------------------------------------------------
一句话背走
> **退出 synchronized 时，当前线程在该锁上的所有写入强制刷回主存，其他线程随后进入同一个锁时强制重新读取，因此可见性得到保障；**  
> **但若退出后不再进入任何 synchronized，后续写入就不再有可见性保障。**