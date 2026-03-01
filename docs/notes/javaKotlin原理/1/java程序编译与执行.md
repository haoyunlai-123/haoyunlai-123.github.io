在 Java 中，编译时**不会**将官方标准库（如 `java.lang`、`java.util` 等）与你的代码一起编译。以下是详细解释：

---

### **1. 编译时发生了什么？**
- **仅编译你的代码**：  
  Java 编译器（如 `javac`）只会将你的 `.java` 源文件编译成 `.class` 字节码文件。官方库早已预编译为 `.class` 文件，存放在 JDK 的安装目录中（例如旧版本的 `rt.jar` 或新版本的模块化系统中）。
  
- **依赖检查**：  
  编译器会检查你的代码中对官方库的引用（如调用 `System.out.println()`），但**不会重新编译这些库**，而是验证它们的接口是否存在且合法（例如方法签名匹配）。

---

### **2. 官方库的位置**
- **JDK 内置**：  
  官方库的 `.class` 文件位于 JDK 安装目录的 `lib` 或 `jmods` 文件夹中（如 `java.base.jmod`）。编译器和 JVM 运行时会自动加载它们。

- **无需手动引入**：  
  你无需在编译命令中指定这些库的路径，IDE 或构建工具（如 Maven/Gradle）会自动处理。

---

### **3. 运行时如何加载？**
- **类加载机制**：  
  当运行 Java 程序时，JVM 会通过**类加载器**（ClassLoader）动态加载所需的官方库类文件。这些类通常由 **Bootstrap ClassLoader** 优先加载。

---

### **4. 第三方库的差异**
- **需要显式依赖**：  
  如果你使用第三方库（如 Apache Commons 或 JUnit），编译时需要将它们添加到类路径（`-classpath`）。但编译器仍然**只会检查接口，不重新编译这些库**。

---

### **总结**
| **场景**       | **是否参与编译** | **原因**                       |
| -------------- | ---------------- | ------------------------------ |
| 官方标准库     | ❌ 不参与编译     | 已预编译，仅检查接口合法性     |
| 第三方库       | ❌ 不参与编译     | 引用 `.class` 文件，仅检查接口 |
| 用户自定义代码 | ✅ 参与编译       | 需要生成 `.class` 字节码文件   |

---

#### **示例命令**
```bash
# 编译时无需指定官方库路径（自动包含）
javac MyClass.java

# 运行时会自动加载官方库类
java MyClass
```

如果有其他依赖（如第三方库），需通过 `-classpath` 显式指定路径：
```bash
javac -classpath lib/third-party.jar MyClass.java
```

希望这能解答你的疑问！



###  .jmod是什么格式？

.jmod 是 Java 平台模块系统（JPMS）中定义的一种模块化打包格式，主要用于存储模块化组件及其元数据，以下是其核心特性及结构说明：

---

### **1. 格式定位**
- **模块化替代方案**：  
  `.jmod` 文件是 Java 9 引入模块系统后新增的封装格式，旨在替代传统的 JAR 包，通过增强依赖声明和可见性控制优化代码组织。
- **JDK 内部使用**：  
  Java 标准库（如 `java.base`）在 JDK 9+ 后默认以 `.jmod` 格式存储于 `$JAVA_HOME/jmods` 目录中。

---

### **2. 内部结构**
一个 `.jmod` 文件通常包含以下目录和内容：
| **目录/文件**       | **描述**                                                 |
| ------------------- | -------------------------------------------------------- |
| `classes/`          | 存放模块的 `.class` 文件及资源文件                       |
| `bin/`              | 可选的本地可执行文件（如脚本）                           |
| `lib/`              | 本地库文件（如 `.dll` 或 `.so`）                         |
| `conf/`             | 配置文件（如安全策略或日志配置）                         |
| `module-info.class` | 模块描述符，定义模块名称、依赖关系、导出包及服务提供信息 |

---

### **3. 创建与使用**
- **工具支持**：  
  使用 `jmod` 命令行工具生成 `.jmod` 文件。例如，将编译后的模块打包：
  ```bash
  jmod create --class-path ./build/classes mymodule.jmod
  ```
- **运行限制**：  
  `.jmod` 文件无法直接通过 `java` 命令运行，需结合 `jlink` 工具生成定制化运行时镜像。

---

### **4. 与 JAR 的差异**
| **特性**       | **JAR**                  | **JMOD**                           |
| -------------- | ------------------------ | ---------------------------------- |
| **模块化支持** | 无原生模块元数据         | 包含 `module-info.class` 声明依赖  |
| **运行时兼容** | 可直接执行               | 需转换为运行时镜像（通过 `jlink`） |
| **内容扩展性** | 仅支持类、资源及清单文件 | 额外支持本地库、配置等目录结构     |

---

### **5. 应用场景**
- **标准库分发**：  
  JDK 将核心模块（如 `java.base`）以 `.jmod` 格式分发，确保模块隔离性。
- **定制运行时**：  
  结合 `jlink` 裁剪不必要的模块，生成轻量级运行时环境。

---

通过 `.jmod`，Java 实现了更严格的模块边界控制和依赖管理，解决了传统 JAR 模式下的版本冲突及类路径污染问题。

引用链接：
1.[【JDK 11】关于 Java 模块系统(module),看这一篇就够了 - CSDN博客](https://blog.csdn.net/weiweiqiao/article/details/142768639)
2.[Java:JPMS模块化开发 - CSDN博客](https://blog.csdn.net/sjb2274540432/article/details/144162201)
3.[新优技术之Java模块化 - 墨天轮数据社区](https://www.modb.pro/db/108182)
4.[Java9模块系统的说明(翻译) - 51CTO博客](https://blog.51cto.com/u_3410296/5493163)
5.[Jigsaw 项目:Java 模块系统新手引导 - 博客园](https://www.cnblogs.com/GarfieldEr007/p/9940722.html)
6.[jar包的精细化运营,Java模块化简介 | 京东云技术团队 - 京东云技术新知 - SegmentFault 思否 - 思否开发者社区](https://segmentfault.com/a/1190000044360332)
7.[看我如何“定义模块及其属性”,同事高呼太优雅了! - 程序员xysam](https://baijiahao.baidu.com/s?id=1792868352869109811&wfr=spider&for=pc)
8.[Java笔记:关于java的打包发布 - 子谦](https://zhuanlan.zhihu.com/p/346312142)
9.[Java模块化系统:引领代码革命与性能飞跃 - 白日梦批发商](https://zhuanlan.zhihu.com/p/696170809)
10.[Java模块化——熟悉与实践 - 80某宅男](https://baijiahao.baidu.com/s?id=1756520021941580740&wfr=spider&for=pc)
11.[java 9 揭秘_Java 9 揭秘(6. 封装模块)-CSDN博客 - CSDN博客](https://blog.csdn.net/weixin_35266799/article/details/114739403)
12.[Java 学习之路 01--基础知识 - CSDN博客](https://blog.csdn.net/shawdow_bug/article/details/125084058)
13.[java repository文件夹作用 javalib文件夹存放什么 - 51CTO博客](https://blog.51cto.com/u_16099304/6911159)
14.[Java 技术入门 - 清华大学](http://www.tup.tsinghua.edu.cn/upload/books/yz/084964-01.pdf)
15.[Java调用成员方法 java调用成员方法的格式 - 51CTO博客](https://blog.51cto.com/u_16213703/7521824)
16.[Spring Framework 5.3.0.M1源码导入Eclipse的笔记 - 博客园](https://www.cnblogs.com/radl/p/17236163.html)
17.[Java17-教程-续-九-  - 掘金开发者社区](https://juejin.cn/post/7399608576909312035)
18.[如何为你的jar包上保险,防止别人反编译获取代码。Jar混淆全网最详细教学  - 掘金开发者社区](https://juejin.cn/post/7407983735662641186)
19.[java动态添加移除属性字段上的注解 java版已移除特性 - 51CTO博客](https://blog.51cto.com/u_16099231/9338177)
20.[java 是不是不行了? - JavaGuide](https://www.zhihu.com/question/282029952/answer/3035304315)
21.[Java 9 揭秘(8. JDK 9重大改变) - 博客园](https://www.cnblogs.com/IcanFixIt/p/7131676.html%20)