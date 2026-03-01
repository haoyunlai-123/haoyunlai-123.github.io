```kotlin

import java.nio.file.Files
import java.nio.file.Paths
import java.io.IOException

fun main() {
    val source = "./xiaoyage"
    val target = "./lanmao"
    
    try {
        Files.walk(Paths.get(source)).use { stream ->
            stream.forEach { path ->
                try {
                    val tarPath = Paths.get(path.toString().replace(source, target))
                    when {
                        Files.isDirectory(path) -> Files.createDirectories(tarPath)
                        Files.isRegularFile(path) -> Files.copy(path, tarPath)
                    }
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
        }
    } catch (e: IOException) {
        e.printStackTrace()
    }
}

```

Kotlin可以直接使用JDK中的库，二者具备完整的互操作性。具体实现细节及注意事项如下：

**一、直接调用机制**
1. **JVM平台基础**：Kotlin基于JVM实现，编译后生成标准的Java字节码，可直接访问JDK所有类和方法  
2. **语法透明互调**：Kotlin代码中可以直接实例化`java.util.ArrayList`等JDK类，Java代码也可调用Kotlin扩展函数  

**二、版本适配建议**
```kotlin
// build.gradle.kts 配置示例（Kotlin 1.8+）
dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib") // 默认包含JDK8+扩展
}
```
- Kotlin 1.8后标准库默认支持JDK8+特性（如Stream API），无需单独添加`kotlin-stdlib-jdk8`依赖  
- 混合项目建议通过BOM管理版本，避免`Duplicate class`冲突  

**三、特殊场景处理**
1. **空安全增强**：调用Java方法时，Kotlin通过平台类型(如`String!`)处理Java可空性，需开发者自行添加空校验  
2. **SAM转换**：JDK函数式接口（如`Runnable`）在Kotlin中支持Lambda简写形式：
```kotlin
val thread = Thread { println("SAM转换示例") } 
```

**四、性能表现**  
Kotlin调用JDK方法与原生Java代码性能基本一致，编译优化后无明显差异。

引用链接：
1.[Kotlin可以与openjdk一起使用吗? - 腾讯云](https://cloud.tencent.com/developer/information/Kotlin%E5%8F%AF%E4%BB%A5%E4%B8%8Eopenjdk%E4%B8%80%E8%B5%B7%E4%BD%BF%E7%94%A8%E5%90%97%EF%BC%9F-salon)
2.[kotlin-stdlib-jdk8 的作用 - 博客园](https://www.cnblogs.com/xtyuns/p/18194812)
3.[kotlin可以直接调用java sdk吗 - 51CTO博客](https://blog.51cto.com/topic/951b4ad915b15fe.html)
4.[Kotlin与Java库能通用吗 - 亿速云计算](https://www.yisu.com/ask/26215692.html)
5.[org.jetbrains.kotlin:kotlin-stdlib-jdk8 - 51CTO博客](https://blog.51cto.com/u_16241999/10946883)
6.[Kotlin和Java混合开发总结(基于Kotlin1.3.0版本)_jdk1.8和kotlin版本对应-CSDN博客 - CSDN博客](https://blog.csdn.net/u011897062/article/details/109384920)
7.[Kotlin冲突?试试这招 - AI心核柒钟意](http://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_4533207921643394778)
8.[kotlin和java区别 - 程序员小旭学长](https://baijiahao.baidu.com/s?id=1762224114436333537&wfr=spider&for=pc)
9.[Kotlin全攻略:跨端开发 - 鸿鹄之愿燕雀难解](http://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_5003695097455223280)
10.[kotlin-stdlibJDK21 - 博客](https://wenku.csdn.net/answer/3zo34ks4xx)
11.[java方法直接引用kotlin jdk8方法引用 - 51CTO博客](https://blog.51cto.com/u_16213582/9098742)
12.[kotlin可以直接调用用java类吗 - 51CTO博客](https://blog.51cto.com/u_16213415/13751868)
13.[kotlin支持jdk1.8编译,使用Java8特性 - 慕课网](https://www.imooc.com/article/253540%E3%80%81)
14.[🔍 Kotlin与Java的不同之处 - 吃饱了再说的可乐依](http://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_4909252395965875564)
15.[Java 转 Kotlin 指南 - 火眼狻猊](http://zhuanlan.zhihu.com/p/707281027)
16.[Kotlin基础-环境搭建 - ABprogramming](http://zhuanlan.zhihu.com/p/621179921)
17.[Kotlin-安卓开发-全- - 绝不原创的飞龙 - 博客园 - 博客园](https://www.cnblogs.com/apachecn/p/18206289)
18.[在kotlin中使用java方法的可能性 - 腾讯云](https://cloud.tencent.com/developer/information/%E5%9C%A8kotlin%E4%B8%AD%E4%BD%BF%E7%94%A8java%E6%96%B9%E6%B3%95%E7%9A%84%E5%8F%AF%E8%83%BD%E6%80%A7-salon)
19.[在kotlin项目中使用java文件 - 腾讯云](https://cloud.tencent.com/developer/information/%E5%9C%A8kotlin%E9%A1%B9%E7%9B%AE%E4%B8%AD%E4%BD%BF%E7%94%A8java%E6%96%87%E4%BB%B6-article)
20.[Kotlin/Native 给 Android 使用  - 掘金开发者社区](https://juejin.cn/post/7472717843571621922)
21.[Kotlin:Java搭档,开发新宠 - 小鹏keym後哩蟹](http://mbd.baidu.com/newspage/data/dtlandingsuper?nid=dt_5275793443504937552)
22.[库在Kotlin中的使用 - 腾讯云](https://cloud.tencent.com/developer/information/%E5%BA%93%E5%9C%A8Kotlin%E4%B8%AD%E7%9A%84%E4%BD%BF%E7%94%A8-salon)
23.[使用Kotlin + Spring Boot 进行后端开发 - 慕课网](https://zhuanlan.zhihu.com/p/49806928)
24.[Kotlin学习教程(一) - 阿里云开发者社区](https://developer.aliyun.com/article/1631746)
25.[Kotlin学习教程(一) - 阿里云开发者社区](https://developer.aliyun.com/article/1618222)
26.[《Kotin 极简教程》第12章 使用 Kotlin 集成Gradle 开发 -CSDN博客 - CSDN博客](https://blog.csdn.net/universsky2015/article/details/77965753)
27.[Kotlin-通过Java反编译撕开Kotlin的高端语法糖的真面目(一)  - 掘金开发者社区](https://juejin.cn/post/7359408423743651878)