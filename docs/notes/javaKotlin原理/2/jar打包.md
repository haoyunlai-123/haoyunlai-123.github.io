java中如何对多个类打包？

在 Java 里“把多个类打成包”= **把目录树（包名对应文件夹）整个压进一个 `.jar` 文件**即可，步骤如下：

------------------------------------------------
1. 先按包目录放好源码并编译
------------------------------------------------
假设工程结构：

```
demo/
└─ src/
   └─ com/
      ├─ foo/
      │  ├─ Main.java
      │  └─ Utils.java
      └─ bar/
         └─ Service.java
```

一次性编译到 `out` 目录：

```bash
javac -d out src/com/foo/*.java src/com/bar/*.java
# 或通配
javac -d out $(find src -name "*.java")
```

编译后得到：

```
out/
└─ com/
   ├─ foo/
   │  ├─ Main.class
   │  └─ Utils.class
   └─ bar/
      └─ Service.class
```

------------------------------------------------
2. 打成 jar（就是 zip，只是扩展名不同）
------------------------------------------------
进入编译根目录再压：

```bash
cd out
jar cvf myapp.jar com/       # c=创建 v=详细 f=文件名
```

jar 命令会生成 **myapp.jar**，内部目录：

```
META-INF/MANIFEST.MF
com/foo/Main.class
com/foo/Utils.class
com/bar/Service.class
```

------------------------------------------------
3. 运行
------------------------------------------------
```bash
java -cp myapp.jar com.foo.Main
```

------------------------------------------------
4. 用 Maven/Gradle（推荐）
------------------------------------------------
```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-jar-plugin</artifactId>
      <version>3.3.0</version>
    </plugin>
  </plugins>
</build>
```
`mvn package` 后 `target/your-artifact-id-version.jar` 自动生成，依赖也会一并处理。

------------------------------------------------
一句话  
**jar = zip，只要编译好的 `.class` 按包目录摆好，再 `jar cvf xxx.jar 目录/` 就完事；IDE 或 Maven 一键完成。**

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff00cc, #333399); box-shadow:0 0 10px #ff00cc;">
</div>

cd out jar cvf myapp.jar com/  这里指定根目录为com,但是上面三个类的全类名中不是已经有com了吗

`jar cvf myapp.jar com/` 并不是“指定根目录为 com”，  
而是**把当前目录下的 `com` 整个文件夹原样打进 jar**。  
因为 `.class` 文件**必须**保持包目录结构，jar 命令只是**原封不动地打包**，运行时 `-cp myapp.jar` 会把 jar 根当作 classpath 起点，所以：

- jar 里路径 = `com/foo/Main.class`  
- 全类名 = `com.foo.Main`  

两者**天然对齐**，并不存在“根目录冲突”问题。  
换句话说：  
**打包时列的目录就是包结构的起点，不是额外再套一层 com。**



<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
box-shadow:0 0 15px rgba(246,79,89,0.7);">
</div>

没懂为什么加com/

把「打包」想成「拍照」就懂了：

- 你站在 `out` 文件夹里  
- 面前摆着 `com\foo\xxx.class`、`com\bar\yyy.class`  
- 相机（jar 命令）只能「原样拍下来」——把 `com` 整个目录收进镜头  
- 如果退到上一级再拍，就会把多余的 `out` 也拍进去，运行时类路径就乱了

所以：

```bash
cd out          # 先站到包结构的起点
jar cvf x.jar com/   # 只拍「com」这一棵树
```

拍出来的 jar 内部就是：

```
com/foo/xxx.class
com/bar/yyy.class
```

运行时 `-cp x.jar` 会把 jar 根当作 classpath 起点，正好对应全类名 `com.foo.xxx`——**目录层级 = 包名层级**，一点不多、一点不少。  
**不是“加 com”，而是“从 com 开始拍”。**

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff512f, #f09819);">
</div>

如何打包到指定位置

用 `jar` 命令的 `-f` 参数直接写**绝对或相对路径**即可，把 jar 生成到任意目录：

1. 相对路径（常用）  
```bash
# 先进入编译输出目录
cd out
jar cvf ../release/myapp.jar com/     # 上层自动建 release 目录
```

2. 绝对路径  
```bash
jar cvf D:/dist/myapp.jar -C out .
```
`-C out .` 表示「先切换到 `out` 目录，再把当前内容（即 `com` 文件夹）打包」，jar 文件直接落在 `D:/dist`。

3. 一步到位（Maven/Gradle）  
```xml
<build>
  <finalName>myapp</finalName>
  <directory>${project.basedir}/release</directory>
</build>
```
`mvn package` 后 jar 出现在 `项目根/release/myapp.jar`。

**记住**：`-f` 后面跟的目标文件路径可以带目录，目录不存在就手动 `mkdir` 或用 `../` 跳级即可。

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff512f, #f09819);">
</div>

F:\New\Java\JavaBasic\javaTest>cd out

F:\New\Java\JavaBasic\javaTest\out>jar -cvf ..\target myapp.jar -C a\b
解析文件参数时出错
尝试使用 `jar --help' 获取详细信息。

F:\New\Java\JavaBasic\javaTest\out>jar -cvf ..\target myapp.jar -C a.
解析文件参数时出错
尝试使用 `jar --help' 获取详细信息。

F:\New\Java\JavaBasic\javaTest\out>jar -cvf ..\target myapp.jar -C a .
myapp.jar: 没有这个文件或目录

参数顺序写反了，`-C` 必须紧跟**源目录**，再跟**要打包的路径**，而且 **jar 文件名只能有一个**。  
正确格式：

```bash
jar cvf 目标.jar -C 源目录 要打包的子路径
```

------------------------------------------------
一步到位（当前在 `out` 目录）

```bash
:: 1. 确保上级 target 存在
mkdir ..\target 2>nul

:: 2. 把 a\b 下的内容直接打到 jar 根
jar cvf ..\target\myapp.jar -C a\b .
```

执行后 jar 内部就是：

```
myapp.jar
├─ test0.class
└─ test1.class
```

------------------------------------------------
常见踩坑回顾
- `cvf` 后面**只能跟一个 jar 文件名**；  
- `-C 目录 路径` 是**成对出现**，中间**空格不能省**；  
- 最后的 `.` 代表“把切换后目录里的所有内容打进 jar 根”。