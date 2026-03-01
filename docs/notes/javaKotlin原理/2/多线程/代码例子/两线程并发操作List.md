```java
class ThreadUnsafe{
    
    private List<Integer> list = new ArrayList<>();
    
    public void method1(int loopNumber) {
        for (int i = 0; i < loopNumber; i++) {
            method2();
            method3();
        }
    }

    private void method3() {
        list.remove(0);
    }

    private void method2() {
        list.add(1);
    }

}拿这个举，两线程各循环一次发生错误
```

非常好，我们就用你给的这段代码来**精确构造一个两线程各循环一次就抛异常的例子**。

------

## ✅ 完整示例

```java
import java.util.ArrayList;
import java.util.List;

public class ThreadUnsafeDemo {

    private List<Integer> list = new ArrayList<>();

    public void method1(int loopNumber) {
        for (int i = 0; i < loopNumber; i++) {
            method2(); // add
            method3(); // remove
        }
    }

    private void method3() {
        list.remove(0);
    }

    private void method2() {
        list.add(1);
    }

    public static void main(String[] args) {
        ThreadUnsafeDemo demo = new ThreadUnsafeDemo();

        Thread t1 = new Thread(() -> demo.method1(1), "T1");
        Thread t2 = new Thread(() -> demo.method1(1), "T2");

        t1.start();
        t2.start();
    }
}
```

------

## ⚙️ 一步步模拟执行过程

初始状态：

```
list = []
```

两个线程各循环一次，所以都要执行：

```
method2() → list.add(1)
method3() → list.remove(0)
```

------

### 时间线（并发交错）

| 时间 | 线程1                                                     | 线程2 | list状态     |
| ---- | --------------------------------------------------------- | ----- | ------------ |
| t1   | 执行 method2()：`list.add(1)`                             |       | list = [1]   |
| t2   | 切换线程2：执行 method2()：`list.add(1)`                  |       | list = [1,1] |
| t3   | 线程1 执行 method3()：`list.remove(0)`                    |       | list = [1]   |
| t4   | 切换线程2：执行 method3()：`list.remove(0)`               |       | list = []    |
| t5   | ❗两个线程几乎同时执行 `remove(0)`，线程切换在底层执行之间 |       |              |

底层 `ArrayList.remove(int index)` 实现大概是：

```java
System.arraycopy(elementData, index + 1, elementData, index, size - index - 1);
elementData[--size] = null;
```

在没有锁的情况下，可能出现：

- 线程1 已经做了 `size--`（size = 0）
- 线程2 此时也进入 `remove(0)`，读取旧的 `size` 值（1）
- 然后执行 `System.arraycopy(...)`
- 尝试访问 `elementData[1]` —— 越界 💥

------

## 💥 实际抛出的异常

运行几次大概率会看到：

```
Exception in thread "T2" java.lang.IndexOutOfBoundsException: Index 0 out of bounds for length 0
```

或者：

```
Exception in thread "T1" java.lang.ArrayIndexOutOfBoundsException: Index 1 out of bounds for length 1
```

------

## 🔍 为什么仅两次循环就可能抛异常？

因为 `ArrayList` 没有任何同步机制：

- `add()`、`remove()` 都直接操作 `size` 和数组；
- 线程切换发生在任意时刻；
- 当一个线程 `remove()` 导致 `size--`，另一个线程也在 `remove()`，就会访问已被缩短的数组；
- 导致数组下标越界。

------

## ✅ 修复方式

1️⃣ 用线程安全集合：

```java
private List<Integer> list = Collections.synchronizedList(new ArrayList<>());
```

或

```java
private List<Integer> list = new CopyOnWriteArrayList<>();
```

2️⃣ 或手动加锁：

```java
synchronized (this) {
    method2();
    method3();
}
```

------

## 🧠 结论

这段代码的问题是：

> `ArrayList` 的内部数组和 `size` 没有原子性保障，在多线程下 add/remove 并发修改会导致 **越界或状态错乱**。

即使每个线程只执行一次 `add()` 和一次 `remove()`，**因为 remove() 修改了 size 并搬移数组**，
 另一个线程再访问时数组边界已经变化，**自然抛出 ArrayIndexOutOfBoundsException。**

------

是否希望我帮你加几行 `Thread.sleep()` 和 `System.out.println()`
 构造出一个**必定复现异常的版本**，可以精确控制线程交错？