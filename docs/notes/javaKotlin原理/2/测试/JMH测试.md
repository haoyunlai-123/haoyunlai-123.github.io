接下来我们使用 Oracle 官方提供的性能测试工具 JMH（Java Microbenchmark Harness，JAVA 微基准测试套件）来测试一下这 7 种循环的性能。

首先，我们先要引入 JMH 框架，在 `pom.xml` 文件中添加如下配置：

```
<!-- https://mvnrepository.com/artifact/org.openjdk.jmh/jmh-core -->
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-core</artifactId>
    <version>1.23</version>
</dependency>
<!-- https://mvnrepository.com/artifact/org.openjdk.jmh/jmh-generator-annprocess -->
<dependency>
    <groupId>org.openjdk.jmh</groupId>
    <artifactId>jmh-generator-annprocess</artifactId>
    <version>1.23</version>
    <scope>provided</scope>
</dependency>
```

然后编写测试代码，如下所示：

```java
@BenchmarkMode(Mode.AverageTime) // 测试完成时间
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS) // 预热 2 轮，每次 1s
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 测试 5 轮，每次 1s
@Fork(1) // fork 1 个进程
@State(Scope.Thread) // 每个测试线程一个实例
public class HashMapCycleTest {
    static Map<Integer, String> map = new HashMap() {{
        // 添加数据
        for (int i = 0; i < 100; i++) {
            put(i, "val:" + i);
        }
    }};

    public static void main(String[] args) throws RunnerException {
        // 启动基准测试
        Options opt = new OptionsBuilder()
                .include(HashMapCycle.class.getSimpleName()) // 要导入的测试类
                .output("/Users/admin/Desktop/jmh-map.log") // 输出测试结果的文件
                .build();
        new Runner(opt).run(); // 执行测试
    }

    @Benchmark
    public void entrySet() {
        // 遍历
        Iterator<Map.Entry<Integer, String>> iterator = map.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<Integer, String> entry = iterator.next();
            Integer k = entry.getKey();
            String v = entry.getValue();
        }
    }

    @Benchmark
    public void forEachEntrySet() {
        // 遍历
        for (Map.Entry<Integer, String> entry : map.entrySet()) {
            Integer k = entry.getKey();
            String v = entry.getValue();
        }
    }

    @Benchmark
    public void keySet() {
        // 遍历
        Iterator<Integer> iterator = map.keySet().iterator();
        while (iterator.hasNext()) {
            Integer k = iterator.next();
            String v = map.get(k);
        }
    }

    @Benchmark
    public void forEachKeySet() {
        // 遍历
        for (Integer key : map.keySet()) {
            Integer k = key;
            String v = map.get(k);
        }
    }

    @Benchmark
    public void lambda() {
        // 遍历
        map.forEach((key, value) -> {
            Integer k = key;
            String v = value;
        });
    }

    @Benchmark
    public void streamApi() {
        // 单线程遍历
        map.entrySet().stream().forEach((entry) -> {
            Integer k = entry.getKey();
            String v = entry.getValue();
        });
    }

    public void parallelStreamApi() {
        // 多线程遍历
        map.entrySet().parallelStream().forEach((entry) -> {
            Integer k = entry.getKey();
            String v = entry.getValue();
        });
    }
}
```

```java
@BenchmarkMode(Mode.AverageTime) // 测试完成时间
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS) // 预热 2 轮，每次 1s
@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS) // 测试 5 轮，每次 1s
@Fork(1) // fork 1 个线程
@State(Scope.Thread) // 每个测试线程一个实例，这几个注解设置什么意思
```
这些注解是 **JMH（Java Microbenchmark Harness）** 的基准测试配置项，每个注解都在控制测试的行为方式。下面逐个解释：

---

### ✅ `@BenchmarkMode(Mode.AverageTime)`
- **作用**：指定测试的**性能指标**。
- `Mode.AverageTime` 表示：**测试每次调用的平均耗时**。
- 其他可选模式还有：
  - `Throughput`：单位时间内执行次数（吞吐量）
  - `SampleTime`：采样耗时分布
  - `SingleShotTime`：单次执行耗时

---

### ✅ `@OutputTimeUnit(TimeUnit.NANOSECONDS)`
- **作用**：设置**输出结果的时间单位**。
- 这里设置为 `NANOSECONDS`，即输出结果以**纳秒**为单位。
- 注意：这只是**显示单位**，不影响实际测试精度。

---

### ✅ `@Warmup(iterations = 2, time = 1, timeUnit = TimeUnit.SECONDS)`
- **作用**：设置**预热阶段**。
- 预热是为了让 JVM 进入稳定状态（JIT 编译、类加载、缓存等）。
- 这里配置为：
  - 预热 **2 轮**
  - 每轮持续 **1 秒**

---

### ✅ `@Measurement(iterations = 5, time = 1, timeUnit = TimeUnit.SECONDS)`
- **作用**：设置**正式测试阶段**。
- 这里是真正收集性能数据的部分。
- 配置为：
  - 测试 **5 轮**
  - 每轮持续 **1 秒**

---

### ✅ `@Fork(1)`
- **作用**：设置**测试进程数**。
- `Fork(1)` 表示：**启动 1 个独立进程**来运行测试。
- 多进程可以避免测试之间的干扰，提升结果可靠性。

---

### ✅ `@State(Scope.Thread)`
- **作用**：定义**测试实例的生命周期和共享范围**。
- `Scope.Thread` 表示：**每个线程拥有独立的一个测试实例**。
- 其他可选值：
  - `Scope.Benchmark`：所有线程共享一个实例
  - `Scope.Group`：线程组共享一个实例（用于多线程协作测试）

---

### ✅ 总结一句话：
> 这些注解共同配置了一个**线程级隔离的、测量平均耗时（纳秒）的、预热2轮+测试5轮、单进程执行的** JMH 微基准测试。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

其中带有 @Benchmark的方法必须是非静态吗
**不必是非静态的**，在 JMH 里“被 `@Benchmark` 标注的方法”**既可以是静态，也可以是非静态**。  
JMH 会在运行期按 `@State` 的 Scope 规则自动帮你生成或获取实例，然后无论实例方法还是静态方法都能正常调度。  

只有一点需要记住：  
- 如果方法**是非静态**的，它的所属类必须被声明为 `@State(...)`，这样 JMH 才知道怎么实例化。  
- 如果方法**是静态**的，JMH 不会隐式创建任何 `@State` 对象，方法里只能访问静态字段或传入的 `@State` 参数。

因此，**静态 benchmark 方法完全合法**，只是用得少，因为大多数微测试都想利用 `@State` 来维护一些可变的基准数据。
<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

静态的话怎么声明
在 JMH 里写“静态”的 `@Benchmark` 方法，语法上直接加 `static` 即可，但**必须同时满足下面两条规则**：

1. 所在类**仍然**要加 `@State(Scope.Benchmark)`（或别的 Scope），否则 JMH 编译期就报错：  
   > `Benchmark method is static and no @State is available`

2. 静态 benchmark **只能**访问  
   - 静态字段，或  
   - 以方法参数形式“注入”的 `@State` 对象。  

示例代码：

```java
@State(Scope.Benchmark)          // 这条必须有
public class StaticBench {

    /** 静态字段自己玩 */
    private static final int STATIC_DATA = 42;

    /** 如果想用可变的“状态”，就声明一个静态内部 State 类 */
    @State(Scope.Benchmark)
    public static class MyState {
        public int x = ThreadLocalRandom.current().nextInt();
    }

    /* ---------- 静态 benchmark ---------- */
    @Benchmark
    public static int measureStatic() {
        return STATIC_DATA * 7;          // 只能访问静态数据
    }

    /* 把状态当参数注入，也是静态方法 */
    @Benchmark
    public static int measureWithState(MyState s) {
        return s.x++;
    }
}
```

运行方式与普通 benchmark 完全一样：

```bash
mvn archetype:generate -DinteractiveMode=false \
  -DarchetypeGroupId=org.openjdk.jmh \
  -DarchetypeArtifactId=jmh-java-benchmark-archetype \
  -DgroupId=com.demo -DartifactId=static-bench -Dversion=1.0
# 把上面类放进 src/main/java，然后
mvn clean package
java -jar target/benchmarks.jar
```

总结  
- 写 `static` 没问题，类头仍要 `@State`。  
- 静态方法里要么只用静态成员，要么把需要的状态声明成单独的 `@State` 类并通过方法参数“注入”。