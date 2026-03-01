log.info,log.error,log.debug有什么区别？和配置文件中的level有什么关系？

非常好的问题 👍！
 这个问题涉及到 Java 日志体系（SLF4J + Logback/Log4j2）最核心的概念：**日志级别（Log Level）与输出控制机制**。
 我们来系统地讲清楚这三种日志方法的区别，以及它们和配置文件里的 `level` 是如何关联的。

------

## 🧭 一、`log.info`、`log.error`、`log.debug` 有什么区别？

这些方法都来自 **SLF4J（Simple Logging Facade for Java）** 接口，比如：

```java
private static final Logger log = LoggerFactory.getLogger(MyClass.class);
```

不同方法代表不同**日志严重级别**（Log Level）：

| 方法          | 级别      | 含义                                 | 典型用途                     |
| ------------- | --------- | ------------------------------------ | ---------------------------- |
| `log.error()` | **ERROR** | 错误级别，表示系统异常、关键业务失败 | 异常、崩溃、重要逻辑错误     |
| `log.warn()`  | **WARN**  | 警告级别，表示潜在问题但程序还能运行 | 重试失败、配置异常、资源紧张 |
| `log.info()`  | **INFO**  | 信息级别，用于记录系统关键流程       | 启动信息、用户操作、状态变更 |
| `log.debug()` | **DEBUG** | 调试级别，开发时用于打印细节         | 参数、返回值、中间变量       |
| `log.trace()` | **TRACE** | 最详细级别，逐行跟踪执行过程         | 性能分析、极细粒度调试       |

------

## 🧩 二、和配置文件中 `logging.level` 的关系

Spring Boot 默认使用 **Logback** 作为日志实现，日志的输出由配置文件的 `level` 决定是否打印。

例如：

```yaml
logging:
  level:
    root: info
    com.hmall.api: debug
```

这代表：

- 全局默认日志级别是 **INFO**；
- 对包 `com.hmall.api` 下的类启用 **DEBUG**。

------

## ⚙️ 三、日志级别的“优先级”关系（非常关键）

日志级别从高到低如下：

```
ERROR > WARN > INFO > DEBUG > TRACE
```

这意味着：

> 设置为某个级别，会打印该级别及更高的所有日志。

举个例子：

| 当前配置      | 能输出哪些日志？                | 说明               |
| ------------- | ------------------------------- | ------------------ |
| `level=error` | error                           | 只输出错误日志     |
| `level=warn`  | warn, error                     | 警告和错误         |
| `level=info`  | info, warn, error               | 一般运行信息及以上 |
| `level=debug` | debug, info, warn, error        | 调试及以上         |
| `level=trace` | trace, debug, info, warn, error | 全部打印           |

------

## 💡 四、举例：同一段代码在不同 level 下的输出

```java
log.error("系统异常：数据库连接失败");
log.warn("警告：库存查询延迟");
log.info("下单成功，订单ID={}", orderId);
log.debug("订单详情：{}", orderDetail);
log.trace("进入下单方法");
```

| 当前 level 配置            | 实际输出的日志           | 说明                  |
| -------------------------- | ------------------------ | --------------------- |
| `logging.level.root=info`  | error、warn、info        | debug 和 trace 被过滤 |
| `logging.level.root=debug` | error、warn、info、debug | 全部输出除 trace      |
| `logging.level.root=error` | 只有 error               | 其他级别全不输出      |

------

## ⚙️ 五、级别的设置方式（多种）

### ✅ 1. 在 `application.yml` 中设置

```yaml
logging:
  level:
    root: info
    com.hmall.user: debug
```

### ✅ 2. 在 `application.properties`

```properties
logging.level.root=info
logging.level.com.hmall.user=debug
```

### ✅ 3. 在代码中临时修改（不推荐生产用）

```java
((ch.qos.logback.classic.Logger) LoggerFactory.getLogger("com.hmall"))
    .setLevel(Level.DEBUG);
```

------

## 🧠 六、常见用法建议（生产经验）

| 场景         | 推荐级别          | 说明                           |
| ------------ | ----------------- | ------------------------------ |
| 本地开发调试 | `debug`           | 打印细节信息方便排查           |
| 测试环境     | `info`            | 只打印关键流程                 |
| 生产环境     | `warn` 或 `error` | 只输出异常与警告，避免日志膨胀 |

------

## ⚠️ 七、典型错误理解

| 误区                                               | 正确理解                                                |
| -------------------------------------------------- | ------------------------------------------------------- |
| “我打了 log.debug，但没看到输出，是不是日志坏了？” | 没坏，是当前 level 高于 debug，日志被过滤掉             |
| “我在控制台看不到 debug，但在文件能看到”           | 控制台和文件可以设置不同的输出级别                      |
| “我想让一个包的日志更详细”                         | 用包级别配置，比如 `logging.level.com.hmall.user=debug` |

------

## ✅ 八、一句话总结

> `log.info()`、`log.error()`、`log.debug()` 是不同“重要程度”的日志输出方法，
>  输出与否由配置文件中 `logging.level` 控制。
>
> 日志等级从高到低为：`ERROR > WARN > INFO > DEBUG > TRACE`，
>  配置越“低”，能打印的内容越多。

------

如果你想，我可以帮你画一张 **“日志级别与输出关系图”**，
 清楚地展示不同 `level` 设置时哪些日志能打印、哪些会被过滤，
 这张图在面试和排查日志问题时非常直观。
 要我帮你画吗？