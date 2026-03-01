详细介绍下RateLimiter和Collections.synchronizedList的用法

非常好的问题 👍
 你问的这两个类 —— `RateLimiter` 和 `Collections.synchronizedList()` —— 都是 Java 并发编程中常用的“限流”和“线程安全”工具，
 一个来自 **Google Guava**，一个来自 **JDK 原生库**。
 我们分别详细拆解讲讲。

------

## 🧩 一、`RateLimiter`（来自 Google Guava）

### 🌍 所在包

```java
import com.google.common.util.concurrent.RateLimiter;
```

### 🎯 用途

`RateLimiter` 是一个 **令牌桶算法（Token Bucket）** 实现，用来**限制某段代码的执行速率**（即 QPS）。

它可以用在：

- 接口限流（防止接口被频繁调用）
- 外部 API 调用速率控制（如发邮件、短信）
- 防止过度消耗资源（如数据库、网络）

------

### 🧠 核心思想（令牌桶算法）

- RateLimiter 以固定速率生成“令牌”（tokens）；
- 每个请求要执行前必须“拿到令牌”；
- 如果令牌用完，请求会**等待**或**被拒绝**；
- 控制速率，而不是线程数量。

------

### 🧱 常用方法

#### 1️⃣ 创建限流器

```java
RateLimiter limiter = RateLimiter.create(5.0);
```

表示：

- 每秒生成 5 个令牌；
- 相当于每秒最多允许执行 5 次操作；
- 每 200ms 产生一个令牌。

------

#### 2️⃣ 获取令牌

```java
limiter.acquire(); // 阻塞直到拿到令牌
```

也可以指定数量：

```java
limiter.acquire(3); // 一次申请3个令牌
```

如果你不想阻塞，可以使用：

```java
boolean success = limiter.tryAcquire(); // 非阻塞，拿不到返回 false
```

还可以设置超时时间：

```java
boolean success = limiter.tryAcquire(500, TimeUnit.MILLISECONDS);
```

------

### 🧩 示例：限制每秒最多执行 10 次

```java
RateLimiter limiter = RateLimiter.create(10.0);

for (int i = 0; i < 100; i++) {
    limiter.acquire(); // 每次调用间隔约100ms
    System.out.println("执行任务：" + i + " 时间：" + System.currentTimeMillis());
}
```

输出效果类似：

```
执行任务：0 时间：1730000000010
执行任务：1 时间：1730000000111
执行任务：2 时间：1730000000213
...
```

> ✅ 优点：精度高、线程安全、实现简单
>  ⚠️ 注意：RateLimiter 控制速率，而不是线程数。

------

## 🧩 二、`Collections.synchronizedList`

### 🌍 所在包

```java
import java.util.Collections;
import java.util.List;
```

### 🎯 用途

`Collections.synchronizedList()` 用来把一个**非线程安全的 List** 变成**线程安全的包装对象**。
 常用于多线程共享一个集合时，防止并发修改异常（`ConcurrentModificationException`）。

------

### 🧠 原理

它返回的是一个 **包装类（SynchronizedList）**，
 内部所有对原始 List 的操作都加了 `synchronized` 锁。

------

### 🧱 用法示例

```java
List<String> list = new ArrayList<>();
List<String> safeList = Collections.synchronizedList(list);
```

然后在多线程中可以安全使用：

```java
ExecutorService pool = Executors.newFixedThreadPool(10);
for (int i = 0; i < 100; i++) {
    int finalI = i;
    pool.submit(() -> safeList.add("task-" + finalI));
}
pool.shutdown();
```

因为每次 `add()` 操作都被同步保护，所以不会抛 `ConcurrentModificationException`。

------

### ⚠️ 注意点（非常重要）

虽然 `add()`、`get()` 等操作是安全的，
 但如果要**遍历**这个 List，仍需手动加锁：

```java
synchronized (safeList) {
    for (String s : safeList) {
        System.out.println(s);
    }
}
```

否则可能在遍历时被其他线程修改导致异常。

------

### ✅ 对比：其他线程安全集合

| 集合类型                       | 是否线程安全 | 说明                           |
| ------------------------------ | ------------ | ------------------------------ |
| `ArrayList`                    | ❌            | 非线程安全                     |
| `Vector`                       | ✅            | 老旧同步实现（方法级锁）       |
| `Collections.synchronizedList` | ✅            | 包装同步锁实现                 |
| `CopyOnWriteArrayList`         | ✅            | 写时复制（高并发读多写少场景） |

在现代并发中，推荐优先用：

```java
List<String> safe = new CopyOnWriteArrayList<>();
```

因为它比 `synchronizedList` 在读多写少的场景性能更高。

------

## 🧩 三、在你的发邮件场景中怎么结合用？

```java
RateLimiter limiter = RateLimiter.create(200); // 每秒200封
List<User> failedList = Collections.synchronizedList(new ArrayList<>());

pool.submit(() -> {
    limiter.acquire(); // 限流
    try {
        emailService.sendEmail(user.getEmail(), "subject", "body");
    } catch (Exception e) {
        failedList.add(user); // 多线程安全添加失败用户
    }
});
```

这里：

- `RateLimiter` 控制速率；
- `synchronizedList` 确保多个线程往失败列表里添加数据时不出错。

------

## ✨ 小结对比表

| 特性     | `RateLimiter`         | `Collections.synchronizedList` |
| -------- | --------------------- | ------------------------------ |
| 所属包   | Guava                 | JDK                            |
| 功能     | 限制执行速率          | 提供线程安全集合               |
| 实现机制 | 令牌桶算法            | 内部 synchronized 锁           |
| 典型用途 | 限流、防止API滥用     | 多线程共享集合                 |
| 是否阻塞 | 默认阻塞等待令牌      | 操作内部加锁                   |
| 替代方案 | 信号量（`Semaphore`） | `CopyOnWriteArrayList`         |

------

是否希望我接着帮你补充一段这两者的 **底层实现原理（源码级分析）**？比如 `RateLimiter.acquire()` 如何计算等待时间、`synchronizedList` 内部如何包装原始 List？这部分是进阶面试会问到的。