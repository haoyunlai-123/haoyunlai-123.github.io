一个jar包中只能有一个main函数吗？

不是只能有一个，而是：

> **一个 jar 里想写多少个 `main` 方法都可以，但**  
> **“`java -jar xxx.jar` 这条命令”只会调用 MANIFEST.MF 中 `Main-Class:` 所指的那个入口**；**  
> **其余 main 方法必须通过“全限定类名”显式指定才能跑**。

------------------------------------------------
1. 写代码阶段：随便放
```java
package com.foo;
public class App1{ public static void main(String[] args){ ... } }

package com.bar;
public class App2{ public static void main(String[] args){ ... } }
```
编译后都在同一个 jar 里，完全合法。

------------------------------------------------
2. 打 jar / 启动阶段：分两种情况
| 启动方式                              | 决定入口的位置                        | 能否换入口                         |
| ------------------------------------- | ------------------------------------- | ---------------------------------- |
| **可执行 jar**（`java -jar app.jar`） | **MANIFEST.MF** 里的 `Main-Class:` 行 | **不能**，除非改 MANIFEST 重新打包 |
| **普通 jar**（classpath 里）          | 命令行显式指定                        | **可以**，想调谁就写谁             |

示例：
```bash
# 使用默认入口（MANIFEST 指定）
java -jar myapp.jar

# 手动指定别的 main
java -cp myapp.jar com.foo.App1
java -cp myapp.jar com.bar.App2
```

------------------------------------------------
3. Spring Boot / 模块化注意
- Spring Boot 打包插件默认把 **@SpringBootApplication 所在类** 写成 `Main-Class`；  
  想换入口可改 `pom.xml` / `build.gradle` 的 `mainClass` 属性再重新 `package`。  
- **JPMS（模块系统）** 下模块描述符 `module-info.class` 里也能用 `main:` 声明默认入口，同样**只能有一个**，其余仍需显式指定。

------------------------------------------------
一句话总结
> **代码层面：想写几个 main 都行；**  
> **可执行 jar 层面：MANIFEST 只能写一个，其余 main 靠 `java -cp jar 全类名` 启动。**