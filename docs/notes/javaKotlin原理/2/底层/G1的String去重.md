G1的String去重操作是什么？

好问题 👍。
 G1 的 **String 去重（String Deduplication）** 是 G1 GC 从 JDK 8 u20 开始引入的一项内存优化，用来**减少堆中重复 String 对象的占用**。
 下面是它的完整原理与流程 👇

------

## 🧩 1️⃣ 背景

在典型 Java 应用里，`String` 占用非常大，因为：

- 大量业务字段相同（如日志、JSON key、URL 片段等）；
- 即使内容相同，不同对象的 `char[]`（或 `byte[]`）也各自一份。

G1 的去重机制做的事就是：

> 在 GC 过程中发现内容完全相同的 `char[]`（或 `byte[]`）数组，
>  让多个 String 共享同一份后端数组。

------

## ⚙️ 2️⃣ 工作原理（Deduplication Phase）

### ✳️ 启动条件

需要显式开启：

```bash
-XX:+UseG1GC
-XX:+UseStringDeduplication
```

### ✳️ 触发点

发生 Minor GC 时，G1 会在对象复制到 Survivor 或 Old Region 的过程中检查 String 对象。

### ✳️ 检查流程

1. **筛选候选对象**
   - 只处理 `java.lang.String`；
   - 只处理未标记为“已去重”的对象；
   - 只处理仍在活跃区域的新对象。
2. **取出内部数组**
   - JDK 8: `char[] value`
   - JDK 9+: `byte[] value` + `coder`
3. **计算哈希并放入全局去重表（StringDedupTable）**
   - 这张表是 `Hashtable<contentHash, WeakReference<byte[]>>`；
   - 如果已有完全相同内容的数组，直接让当前 String 的 `value` 指向已有那份；
   - 如果没有，则把这份放进去。
4. **标记该 String 为已去重**
   - 避免在未来 GC 中重复扫描；
   - 用一个内部 Dedup Bit 或 Age 字段实现。

------

## 🧠 3️⃣ 执行与性能策略

- 去重是在 GC 线程之外的**后台线程池（StringDedupThread）**异步完成的。
   GC 把新对象放入 dedup queue，后台线程定期处理。
- 内存减少：一般节省 10%–25% 堆空间；
- 代价：CPU 略增（字符串哈希 + 比较）。

------

## 🧱 4️⃣ JDK 版本差异

| 版本          | 实现情况                                                     |
| ------------- | ------------------------------------------------------------ |
| JDK 8 u20–u60 | 初版，`char[]` 去重                                          |
| JDK 9+        | 支持 Compact Strings（`byte[]` + coder），同样可去重         |
| JDK 17+       | 默认开启 G1 时可自动启用（在 Server 模式下），更智能的去重策略 |
| JDK 21 / 24   | 去重逻辑已完全整合入 G1 的 Young GC 流程，基本无停顿代价     |

------

## ✅ 5️⃣ 参数调优（常见）

| 参数                                         | 说明                             |
| -------------------------------------------- | -------------------------------- |
| `-XX:+UseStringDeduplication`                | 开启去重                         |
| `-XX:StringDeduplicationAgeThreshold=3`      | 对象晋升几次后参与去重（默认 3） |
| `-XX:+PrintStringDeduplicationStatistics`    | 打印统计信息                     |
| `-XX:StringDeduplicationRehashInterval=1000` | 控制 rehash 频率                 |

------

## 📊 6️⃣ 效果示例（统计输出）

启用 `-XX:+PrintStringDeduplicationStatistics` 后，可见类似日志：

```
[GC concurrent-string-deduplication, 0.0023456 secs]
   [Last Exec: 0.0023 secs, Idle: 0.0123 secs]
   [Inspected: 20000, Skipped: 8000, Hashed: 10000, Known: 8000]
   [Deduplicated: 5000, Young: 3000, Old: 2000, Table: 50000]
```

代表 5000 个重复字符串被合并，共节省相应 char[] 空间。

------

## 🧩 7️⃣ 小结一句话

> **G1 String 去重机制**通过在 GC 阶段扫描并合并内容相同的 String 后端数组，
>  让多个 String 共享同一份 `value`，
>  减少堆空间使用，几乎不影响应用逻辑。

------

要不要我帮你画一张 G1 String 去重的内存结构示意图（包含 `String` 对象、`value[]`、`StringDedupTable`、后台线程工作流程）？
 那张图看一眼就能完全明白它在 GC 期间如何对比、合并、替换。