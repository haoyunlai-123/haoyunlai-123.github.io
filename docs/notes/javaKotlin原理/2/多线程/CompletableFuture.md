<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

本质就是开个异步线程执行，可以传入一系列方法让其按照指定顺序执行

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff00cc, #333399); box-shadow:0 0 10px #ff00cc;">
</div>

介绍下CompletableFuture的用法

`CompletableFuture` 是 **Java 8 引入的异步编程核心工具**，在后端面试里地位≈

> **“你是否真正理解并发与异步，而不只是会用线程池”**

我按 **「是什么 → 怎么用 → 常见组合 → 线程模型 → 面试高频点」** 给你一套**体系化讲解**。

------

# 一、CompletableFuture 是什么？

一句话定义（面试可背）：

> `CompletableFuture` 是一个 **可编排（Composable）的异步任务抽象**，
> 支持 **非阻塞回调、任务组合、异常处理**。

它解决了 3 个老问题：

| 旧方式              | 痛点               |
| ------------------- | ------------------ |
| `Thread / Runnable` | 无返回值、不可组合 |
| `Future.get()`      | 阻塞               |
| 回调嵌套            | 回调地狱           |

------

# 二、最基础的 2 种创建方式（必须熟）

## 1️⃣ `runAsync`：无返回值

```java
CompletableFuture.runAsync(() -> {
    System.out.println("do something");
});
```

- 类似 `Runnable`
- 返回 `CompletableFuture<Void>`

------

## 2️⃣ `supplyAsync`：有返回值（最常用）

```java
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> {
        return 42;
    });
```

- 类似 `Callable`
- **99% 后端代码用这个**

------

# 三、thenXxx 系列（核心中的核心）

## 1️⃣ thenApply —— **同步转换结果**

```java
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .thenApply(x -> x * 2);
```

- 输入：上一步结果
- 输出：新结果
- **不产生新线程**

👉 类似 `map`

------

## 2️⃣ thenAccept —— **消费结果（无返回）**

```java
CompletableFuture.supplyAsync(() -> 10)
    .thenAccept(x -> System.out.println(x));
```

👉 类似 `forEach`

------

## 3️⃣ thenRun —— **不关心结果**

```java
CompletableFuture.supplyAsync(() -> 10)
    .thenRun(() -> System.out.println("done"));
```

------

## 4️⃣ thenCompose —— **扁平化（非常重要）**

```java
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .thenCompose(x ->
            CompletableFuture.supplyAsync(() -> x * 2)
        );
```

- 用来 **串联两个异步任务**
- 返回的是 **一个 CompletableFuture，而不是嵌套的**

👉 类似 `flatMap`

------

## 5️⃣ thenCombine —— **合并两个并行任务**

```java
CompletableFuture<Integer> a =
    CompletableFuture.supplyAsync(() -> 10);

CompletableFuture<Integer> b =
    CompletableFuture.supplyAsync(() -> 20);

CompletableFuture<Integer> c =
    a.thenCombine(b, (x, y) -> x + y);
```

👉 **并行执行 → 汇总结果**

------

# 四、allOf / anyOf（并行聚合）

## allOf：等所有完成

```java
CompletableFuture<Void> all =
    CompletableFuture.allOf(cf1, cf2, cf3);

all.join(); // 等全部完成
```

⚠️ `allOf` **不返回结果**，需要你自己 `join`

```java
List<Integer> res = List.of(cf1, cf2, cf3)
    .stream()
    .map(CompletableFuture::join)
    .toList();
```

------

## anyOf：任意一个完成

```java
CompletableFuture<Object> any =
    CompletableFuture.anyOf(cf1, cf2);

Object res = any.join();
```

------

# 五、异常处理（面试必问）

## 1️⃣ exceptionally（兜底）

```java
CompletableFuture.supplyAsync(() -> {
    throw new RuntimeException();
}).exceptionally(e -> {
    return -1;
});
```

------

## 2️⃣ handle（成功/失败都处理）

```java
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .handle((res, ex) -> {
            if (ex != null) return -1;
            return res * 2;
        });
```

👉 **最通用**

------

# 六、线程池问题（面试高频）

## 默认用什么线程池？

```java
ForkJoinPool.commonPool()
```

⚠️ **生产中几乎一定要自定义线程池**

------

## 推荐写法

```java
ExecutorService pool = Executors.newFixedThreadPool(8);

CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> {
        return queryDB();
    }, pool);
```

------

## 面试官可能追问：

> 如果 supplyAsync 不传 executor 会怎样？

标准回答：

> 使用 ForkJoinPool.commonPool，
> 在 IO 密集场景可能被阻塞，影响全局任务。

------

# 七、join vs get（细节加分）

| 方法     | 行为                |
| -------- | ------------------- |
| `get()`  | checked exception   |
| `join()` | unchecked exception |

👉 **生产代码更常用 `join()`**

------

# 八、一个完整后端真实示例（很加分）

```java
CompletableFuture<User> userCF =
    CompletableFuture.supplyAsync(() -> userService.getUser(uid));

CompletableFuture<Order> orderCF =
    CompletableFuture.supplyAsync(() -> orderService.getOrder(uid));

CompletableFuture<UserProfile> profileCF =
    userCF.thenCombine(orderCF,
        (user, order) -> new UserProfile(user, order)
    );
```

👉 **并行 RPC / DB → 汇总**

------

# 九、常见面试问题速答

### Q1：CompletableFuture 是非阻塞的吗？

- **本身是非阻塞**
- 调 `get / join` 才会阻塞

------

### Q2：thenApply 和 thenApplyAsync 区别？

- `thenApply`：当前线程
- `thenApplyAsync`：线程池

------

### Q3：什么时候用 thenCompose？

- 上一步返回 `CompletableFuture`
- 避免嵌套

------

### Q4：能替代线程池吗？

- ❌ 不能
- ✅ 是 **线程池之上的编排工具**

------

# 十、你现在该掌握到什么程度（实话）

如果你能：

- 熟练写 `supplyAsync + thenCompose + thenCombine`
- 理解默认线程池问题
- 能说清异常处理

👉 **中高级 Java 后端完全够用**

------

如果你愿意，下一步我可以：

- 🔥 用 **Spring Web 接口 + CompletableFuture** 举例
- 🔥 带你手写一个 **并行 RPC 聚合接口**
- 🔥 模拟 **面试官 10 连问 CompletableFuture**

你选一个，我继续。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

你这里说“1️⃣ thenApply —— 同步转换结果
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .thenApply(x -> x * 2);


输入：上一步结果

输出：新结果

不产生新线程”不产生新线程？那就是在当前线程同步执行？

这是一个**非常关键、非常“面试级”的问题**。
你抓到的是 `CompletableFuture` **最容易被误解的点之一** 👍
我给你一个**严格、分层、不会误导你的解释**。

------

## 一句话结论（先背）

> **`thenApply` 不会“新建线程”，
> 但也不等价于“在当前调用线程同步执行”。**

更精确的说法是：

> **`thenApply` 的回调在哪个线程执行，取决于“前一个阶段是在哪个线程完成的”。**

------

## 一、为什么“不是当前线程同步执行”

先看你可能脑补的错误模型：

```java
CompletableFuture.supplyAsync(...)
.thenApply(...)
```

很多人以为是：

```java
main线程:
    supplyAsync 执行完
    thenApply 立刻在 main 线程执行
```

❌ **这是错的**。

------

## 二、真实的执行模型（非常重要）

### 1️⃣ `supplyAsync` 在哪执行？

```java
CompletableFuture.supplyAsync(() -> 10);
```

- 默认：**ForkJoinPool.commonPool 的某个 worker 线程**
- 不是 main 线程

------

### 2️⃣ `thenApply` 在哪执行？

`thenApply` 的规则是：

> **前一个 stage 完成的那个线程，负责执行 thenApply 的回调**

也就是说：

- `supplyAsync` 在 **worker-1** 线程执行
- 它 `return 10` 的那一刻
- **同一个 worker-1 线程立刻调用 thenApply(x -> x \* 2)**

👉 没有新线程
👉 也不是 main 线程
👉 是 **“完成前一步的线程”**

------

## 三、用一段代码验证（你可以自己跑）

```java
CompletableFuture.supplyAsync(() -> {
    System.out.println("supply: " + Thread.currentThread().getName());
    return 10;
}).thenApply(x -> {
    System.out.println("thenApply: " + Thread.currentThread().getName());
    return x * 2;
}).join();
```

输出类似：

```
supply: ForkJoinPool.commonPool-worker-3
thenApply: ForkJoinPool.commonPool-worker-3
```

✔️ 同一个线程
✔️ 没有创建新线程
✔️ 不是 main

------

## 四、那什么时候“看起来像同步”？

### 情况 1：前一个阶段已经完成

```java
CompletableFuture<Integer> cf = CompletableFuture.completedFuture(10);

cf.thenApply(x -> {
    System.out.println(Thread.currentThread().getName());
    return x * 2;
});
```

输出：

```
main
```

为什么？

因为：

- `completedFuture` 已经完成
- `thenApply` 被调用时，当前线程就是 main
- 所以 **回调直接在 main 线程执行**

👉 这才是“看起来同步”的情况

------

## 五、thenApply vs thenApplyAsync（本质区别）

### thenApply

```java
.thenApply(fn)
```

- **不指定线程池**
- 谁完成前一个阶段，谁执行 fn
- 可能是 worker，也可能是 main

------

### thenApplyAsync

```java
.thenApplyAsync(fn)
```

- **一定切线程**
- 默认：ForkJoinPool.commonPool
- 或使用你传入的 executor

```java
.thenApplyAsync(fn, executor)
```

------

## 六、面试官最想听到的精准表述（建议背）

> thenApply 不会创建新线程，
> 回调通常在完成前一阶段的线程中执行；
> 如果前一阶段已经完成，则在调用 thenApply 的当前线程执行。
> 若希望强制异步执行，应使用 thenApplyAsync。

------

## 七、为什么这个设计很重要（工程角度）

因为：

- 避免不必要的线程切换（性能）
- 允许同步/异步自然衔接
- 但 ⚠️ 如果 thenApply 里做 **阻塞 IO**：
  - 可能阻塞 ForkJoinPool
  - **这是生产事故高发点**

👉 所以 **IO 场景 + thenApplyAsync + 自定义线程池** 是最佳实践。

------

## 八、一句总结（你现在的理解层级）

你现在问的问题已经是：

- ❌ 不是“API 怎么用”
- ❌ 不是“语法”
- ✅ 是 **并发模型和线程语义**

👉 **这已经是中高级 Java 后端的思考深度了**。

------

如果你愿意，下一步我可以继续：

- 🔥 画一张 **CompletableFuture 线程流转图**
- 🔥 讲 **ForkJoinPool 为啥怕阻塞**
- 🔥 结合 Spring MVC / WebFlux 场景讲 thenApply vs thenCompose

你选一个，我接着讲。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .thenApply(x -> x * 2);这个代码是不得同步等异步线程执行的结果，然后赋给cf?

简短结论先给：

> **不是同步等结果。**
> 这行代码只是**“搭建了一条异步执行链”**，`cf` 里装的是**一个还没完成的 Future**，
> 真正的计算会在**异步线程中进行**，完成后再把结果放进 `cf`。

下面我把这个过程**按时间线**给你拆开，你就不会再混了。

------

## 一、你这行代码“当下”发生了什么？

```java
CompletableFuture<Integer> cf =
    CompletableFuture.supplyAsync(() -> 10)
        .thenApply(x -> x * 2);
```

### 在 **当前线程（比如 main）** 中立刻发生的事：

1. 创建一个 `CompletableFuture`
2. 把一个任务提交到线程池（commonPool）
3. 注册一个回调：`thenApply(x -> x * 2)`
4. **立刻返回**，把这个 `CompletableFuture` 赋给 `cf`

👉 **当前线程完全不会等待**
👉 此时 `cf` 大概率是 **未完成状态**

------

## 二、真正的计算是“之后”发生的

在 **某个异步线程** 中，按顺序发生：

1. 执行 `supplyAsync` 的 lambda

   ```java
   () -> 10
   ```

2. 得到结果 `10`

3. **同一个线程** 立刻执行 `thenApply`

   ```java
   x -> x * 2
   ```

4. 得到结果 `20`

5. 标记 `cf` 为 **completed**，值为 `20`

------

## 三、所以 cf 里到底是什么？

### 在你写完那行代码的“瞬间”：

```java
cf.isDone() == false   // 很可能
```

### 在异步线程跑完之后：

```java
cf.isDone() == true
cf.join() == 20
```

------

## 四、什么时候才会“同步等待”？

**只有你主动去等的时候** 👇

```java
int result = cf.get();   // 阻塞等待
// or
int result = cf.join();  // 阻塞等待
```

这一步才是：

> **当前线程同步等待异步结果**

而你那行代码本身 **完全没有等待行为**。

------

## 五、用一句“精准不误导”的话描述这段代码（面试级）

> 这段代码创建了一个异步计算流水线，
> supplyAsync 和 thenApply 都在异步线程中执行，
> 当前线程只是拿到一个 CompletableFuture，并不会等待结果，
> 只有在调用 get 或 join 时才会阻塞等待。

------

## 六、用一个小对比帮你彻底定型

### ❌ 错误理解（很多人会这么想）

```text
main 线程：
    等 supplyAsync 执行完
    再等 thenApply 执行完
    把 20 赋给 cf
```

### ✅ 正确理解

```text
main 线程：
    注册任务 + 注册回调
    拿到 cf
    继续往下跑

worker 线程：
    执行 supplyAsync
    执行 thenApply
    完成 cf
```

------

## 七、一句话总结（你可以记这个）

> `CompletableFuture` 是 **对“未来结果”的引用**，
> 不是结果本身；
> 赋值给 `cf` 的只是“承诺”，不是计算结果。

------

你这个问题已经是**并发语义层面**的问题了，不是 API 用法问题。
如果你愿意，下一步我可以帮你：

- 🔥 画一个 **main 线程 / worker 线程时间线**
- 🔥 对比 `Future` vs `CompletableFuture`
- 🔥 讲为什么 **不该在 thenApply 里写阻塞 IO**

你选一个，我继续。