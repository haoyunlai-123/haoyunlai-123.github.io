以下是 Kotlin 中 `when` 用法的详细解析，结合基础场景与高级用法：

---

### 一、基础语法与核心功能
#### 1. 替代传统 Switch-Case
```kotlin
// 表达式形式（必须含 else）
val num = 3
val result = when (num) {
    1 -> "One"    // 精确匹配
    2 -> "Two"
    else -> "Unknown"
}

// 语句形式（else 可选）
when (x) {
    0 -> println("Zero")
    1 -> println("One")
    else -> println("Other")
}
```
- **特点**：直接匹配具体值，支持任意类型（非仅整型）。

#### 2. 多条件合并
```kotlin
when (value) {
    0, 1 -> "Binary digit"     // 匹配 0 或 1
    in 2..10 -> "Single digit" // 匹配区间
    "yes", "no" -> "Boolean"   // 字符串匹配
    else -> "Unknown"
}
```
- **逗号与区间**：通过 `,` 或 `in` 简化多条件判断。

---

### 二、高级匹配模式
#### 1. 类型检查与智能转换
```kotlin
fun checkType(obj: Any) {
    when (obj) {
        is String -> println("Length: ${obj.length}") // 自动转为 String
        is Int -> println("Double: ${obj * 2}")       // 自动转为 Int
        else -> println("Unknown type")
    }
}
```
- **智能转换**：分支内直接访问类型的属性/方法。

#### 2. 无参数条件判断
```kotlin
when {
    x.isOdd() -> print("奇数")
    x % 10 == 0 -> print("10的倍数")
    else -> print("其他情况")
}
```
- **灵活条件**：可结合任意布尔表达式，类似 `if-else if` 链。

#### 3. 结合函数返回值
```kotlin
when (val response = fetchData()) {
    is Success -> handleData(response.data)
    is Error -> logError(response.message)
}
```
- **动态匹配**：直接处理函数返回的不同状态。

---

### 三、特殊场景用法
#### 1. 枚举与密封类处理
```kotlin
sealed class Result
data class Success(val data: String) : Result()
data class Error(val msg: String) : Result()

fun process(result: Result) = when (result) {
    is Success -> "Data: ${result.data}"
    is Error -> "Error: ${result.msg}"
    // 无需 else（已覆盖所有密封类子类）
}
```
- **穷尽性检查**：编译器自动验证分支完整性。

#### 2. 替代嵌套 if-else
```kotlin
// 传统写法
if (x > 0) "正数"
else if (x < 0) "负数"
else "零"

// when 简化版
when {
    x > 0 -> "正数"
    x < 0 -> "负数"
    else -> "零"
}
```
- **代码扁平化**：提升可读性。

---

### 四、注意事项
1. **表达式 vs 语句**  
   - 表达式必须含 `else`，语句可省略（但建议显式处理）。
2. **性能优化**  
   - 分支条件按顺序匹配，高频条件应前置。
3. **可空类型处理**  
   ```kotlin
   when (nullableValue) {
       null -> "空值"
       else -> "非空值: $nullableValue"
   }
   ```
   - 直接支持可空类型检查。

---

### 五、对比与选择建议
| **场景**     | **推荐语法**          | **优势**             |
| ------------ | --------------------- | -------------------- |
| 简单值匹配   | `when (x) { ... }`    | 结构清晰             |
| 复杂条件判断 | 无参数 `when { ... }` | 支持任意布尔逻辑     |
| 类型驱动分支 | `is` 类型检查         | 智能转换避免类型强转 |
| 多条件合并   | `,` 或 `in` 操作符    | 减少重复代码         |

通过合理运用 `when` 的不同模式，可显著提升 Kotlin 代码的简洁性和可维护性。



在Kotlin中，`when`语句的执行遵循**首个匹配优先**原则，即按代码书写顺序从上到下检查分支条件，执行第一个满足条件的分支后立即终止，不会继续检查后续分支。具体规则如下：

1. **基础匹配行为**  
   ```kotlin
   when (x) {
       1 -> println("Case 1")  // 若x=1则执行此行后结束
       1 -> println("Case 2")  // 即使x=1也不会执行
       else -> println("Default")
   }
   ```
   即使多个分支条件相同，仅第一个匹配的会执行。

2. **多条件合并的特殊情况**  
   若使用逗号分隔多个条件，它们被视为同一分支：
   ```kotlin
   when (x) {
       1, 2 -> println("1或2")  // x=1或2都执行此分支
       3 -> println("3")
   }
   ```
   此时不会因`1`和`2`都满足而产生冲突。

3. **无参数when的布尔表达式**  
   不带参数的`when`会按顺序计算布尔表达式，执行第一个为`true`的分支：
   ```kotlin
   when {
       x > 10 -> println(">10")  // 若x=15，执行此行
       x > 5 -> println(">5")    // 即使x=15也跳过
   }
   ```
   这种场景下条件可能有重叠，但仅首个真值分支生效。

4. **类型检查与范围匹配**  
   对于`is`/`in`等操作符，同样遵循顺序优先：
   ```kotlin
   when (obj) {
       is String -> println("String")  // 若obj="Hi"，执行此行
       is CharSequence -> println("CharSequence")  // 即使String是子类也不检查
   }
   ```
   需注意类型检查的顺序逻辑。

**设计建议**：将更具体的条件放在前面，通用条件（如`else`）置于末尾，避免逻辑覆盖错误。

引用链接：
1.[Kotlin学习-when表达式语法 - 百度经验](https://jingyan.baidu.com/article/08b6a5919f53ad14a80922de.html)
2.[Kotlin when 表达式完全指南:从基础到高级的12种实战用法-CSDN博客 - CSDN博客](https://blog.csdn.net/tangweiguo03051987/article/details/146562251)
3.[Kotlin关键字 - CSDN博客](https://blog.csdn.net/kaka_buka/article/details/146225203)
4.[kotlin when语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/9c601891f655763fc7a69b05ffda0aee)
5.[kotlinwhen语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/390b1954cbc1cb3d53f27d8a17c145db)
6.[本文详细介绍了Kotlin的when语句,它作为控制流工具,可以替代传统的switch语句。when可以作为语句或表达式使用,需要时必须包含else分支。文章列举了多种使用场景,包括匹配常量、表达式、区间、集合以及类型,并展示了如何用when取代if-else if链。  - CSDN博客](https://blog.csdn.net/qq_39424676/article/details/78673539)
7.[kotlin基础 条件控制 when_51CTO博客_kotlin基础语法 - 51CTO博客](https://blog.51cto.com/u_15060551/3895883)
8.[kotlin when 语法 - 橙篇](https://cp.baidu.com/landing/tscp_doc/83a672ad2d25c8d238dc86e3b7f3c784)
9.[条件执行与when表达式的实践应用  - CSDN博客](https://blog.csdn.net/weixin_36427956/article/details/147113399)
10.[kotlin的when语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/830cfe3e9a8150d99ce11accc6334bd7)
11.[Kotlin 2.1.0 入门教程(十)if、whenKotlin 2.1.0 入门教程(十)。------------ - 掘金 - 掘金开发者社区](https://juejin.cn/post/7468573320692318218)
12.[如何在Kotlin中使用WHEN for an表达式? - 腾讯云开发者社区 - 腾讯云 - 腾讯云](https://cloud.tencent.com/developer/information/%E5%A6%82%E4%BD%95%E5%9C%A8Kotlin%E4%B8%AD%E4%BD%BF%E7%94%A8WHEN%20for%20an%E8%A1%A8%E8%BE%BE%E5%BC%8F%EF%BC%9F-article)
13.[Kotlin编程之if语句,while循环,when表达式,for循环 - CSDN](https://blog.csdn.net/hexingen/article/details/72824571)
14.[kotlin浅析when与循环的使用 - 脚本之家](https://www.jb51.net/article/260485.htm)
15.[【Kotlin】流程控制 - 知乎 - LittleFatSheep](https://zhuanlan.zhihu.com/p/690774153)
16.[Kotlin 基础知识 - 哔哩哔哩](http://www.bilibili.com/video/BV1eV4y1H7ga)
17.[简单的Kotlin开发 - 2.循环 - 敲代码的小芋头](http://zhuanlan.zhihu.com/p/710413410)
18.[Kotlin 基础学习+快速实践 - ruinkami](http://zhuanlan.zhihu.com/p/28065316)
19.[如何在Kotlin中对一个时间条件执行多个指令? - 腾讯云](https://cloud.tencent.com/developer/ask/sof/107081073)
20.[Kotlin编程条件控制示例详解 - 脚本之家](https://www.jb51.net/article/260079.htm)
21.[android kotlin 选择表达式原创 - 51CTO博客](https://blog.51cto.com/u_16175512/8142257)
22.[在Kotlin 中编写条件  - Android](https://developer.android.google.cn/codelabs/basic-android-kotlin-compose-conditionals?hl=zh_cn&authuser=8)
23.[Kotlin学习日志(三)控制语句 - 51CTO博客](https://blog.51cto.com/u_15117645/5661718)
24.[Kotlin入门(6)条件分支的实现 - 博客园](https://www.cnblogs.com/aqi00/p/7168653.html)
25.[Kotlin学习知识点整理-基础篇-01  - 掘金开发者社区](https://juejin.cn/post/6891231633702125576)
26.[【Kotlin 初学者】程序的逻辑控制 - 阿里云开发者社区](https://developer.aliyun.com/article/933792)
27.[Kotlin基本语法教程:从零开始学习 - 薇薇安爱生活](http://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_4570945698897817019)



引用链接：
1.[Kotlin 之 when 表达式  - 掘金开发者社区](https://juejin.cn/post/7488552025970851877)
2.[Kotlin关键字 - CSDN博客](https://blog.csdn.net/kaka_buka/article/details/146225203)
3.[Kotlin when 表达式完全指南:从基础到高级的12种实战用法-CSDN博客 - CSDN博客](https://blog.csdn.net/tangweiguo03051987/article/details/146562251)
4.[Kotlin学习(三)——基本类型,包,控制流:if、when、for、while,Break和continue - 腾讯云](https://cloud.tencent.com/developer/article/1030086)
5.[如何在Kotlin中使用when语句? - 腾讯云](https://cloud.tencent.com/developer/information/%E5%A6%82%E4%BD%95%E5%9C%A8Kotlin%E4%B8%AD%E4%BD%BF%E7%94%A8when%E8%AF%AD%E5%8F%A5%EF%BC%9F-salon)
6.[kotlin when 语法 - 橙篇](https://cp.baidu.com/landing/tscp_doc/83a672ad2d25c8d238dc86e3b7f3c784)
7.[kotlin中when的用法 - 博客](https://wenku.csdn.net/answer/fc1b14389ebc43d89a21904ba0ec5389)
8.[kotlin中when表达式的三种用法 - CSDN博客](https://blog.csdn.net/m0_48189512/article/details/127576160)
9.[Kotlin 多种形式的 when 表达式(七) - CSDN博客](https://blog.csdn.net/qq_36154755/article/details/142322298)
10.[【Kotlin】Kotlin 常用表达式 ( range 范围表达式 | when 条件表达式 | 字符串模板 ) - 腾讯云](https://cloud.tencent.com/developer/article/2254068)
11.[Kotlin:05-控制流 if、when、for、while - 腾讯云](https://cloud.tencent.com/developer/article/1677292)
12.[kotlin的when语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/830cfe3e9a8150d99ce11accc6334bd7)
13.[kotlinwhen语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/390b1954cbc1cb3d53f27d8a17c145db)
14.[学习Kotlin 编程语言 | Android Developers - Android](https://developer.android.google.cn/kotlin/learn?hl=zh-cn)
15.[Kotlin中when表达式的使用:超强的switch(KAD 13) - 博客园](https://www.cnblogs.com/figozhg/p/6444312.html)
16.[Kotlin when表达式 - 看云](https://www.kancloud.cn/apachecn/zetcode-zh/1950606)
17.[无涯教程-Kotlin - when语句  - 掘金开发者社区](https://juejin.cn/post/7390957334419587124)
18.[kotlin when语句 - 橙篇](https://cp.baidu.com/landing/tscp_doc/9c601891f655763fc7a69b05ffda0aee)
19.[Kotlin基本语法教程:从零开始学习 - 薇薇安爱生活](https://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_4570945698897817019)
20.[Kotlin 07. When 表达式示例 - 知识聚变](https://zhuanlan.zhihu.com/p/157327239)
21.[Kotlin学习系列(二) - 博客园](https://www.cnblogs.com/xwgblog/p/5289823.html)
22.[指导小白如何实现“Android kotlin when 区间判断” - 51CTO博客](https://blog.51cto.com/u_16213303/11185123)
23.[在Kotlin 用 36 行实现 when 表达式 - 知乎 - kirraObj](https://zhuanlan.zhihu.com/p/601212763)
24.[Kotlin编程条件控制示例详解 - 脚本之家](https://www.jb51.net/article/260079.htm)
25.[【kotlin】基本语法when的使用,类似于java中的switch,但是又青出于蓝而胜于蓝 - 博客园](https://www.cnblogs.com/sxdcgaq8080/p/8686675.html)
26.[【Android-kotlin】kt语法中when 的使用方式类似switch - 51CTO博客](https://blog.51cto.com/u_16715241/10504654)
27.[Kotlin when 流程判断 - ARM830 - 博客园 - 博客园](https://www.cnblogs.com/T-ARF/p/7603118.html)