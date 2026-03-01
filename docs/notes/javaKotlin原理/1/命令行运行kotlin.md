以下是 Kotlin 程序通过命令行编译和运行的详细步骤：

---

### **一、环境准备**
#### 1. 安装 Kotlin 编译器
- **通过 SDKMAN! 安装**（推荐，适用于 Linux/macOS）：
  ```bash
  curl -s https://get.sdkman.io | bash
  sdk install kotlin
  ```

- **手动安装**（所有系统）：
  1. 从 [Kotlin 官网](https://github.com/JetBrains/kotlin/releases) 下载 `kotlin-compiler-*.zip`。
  2. 解压到本地目录（如 `C:\kotlin`）。
  3. 将 `bin` 目录添加到系统环境变量 `PATH` 中：
     ```bash
     # Windows 示例
     set PATH=%PATH%;C:\kotlin\bin
     ```

---

### **二、基础编译与运行**
#### 1. 编写 Kotlin 文件（`hello.kt`）
```kotlin
fun main() {
    println("Hello, Kotlin!")
}
```

#### 2. 编译生成可执行 JAR
```bash
kotlinc hello.kt -include-runtime -d hello.jar
```
- **参数说明**：
  - `-include-runtime`：打包 Kotlin 标准库到 JAR 中，使 JAR 可独立运行。
  - `-d hello.jar`：指定输出文件名。


#### 3. 运行 JAR
```bash
java -jar hello.jar
```
输出结果：
```
Hello, Kotlin!
```

---

### **三、高级用法**
#### 1. 编译不包含运行时库（需手动指定依赖）
```bash
kotlinc hello.kt -d hello.jar
```
- **运行方式**（需手动添加 Kotlin 运行时库）：
  ```bash
  kotlin -classpath hello.jar HelloKt
  ```
  - `HelloKt` 是 Kotlin 生成的默认主类名（文件名 + `Kt`）。

#### 2. 编译多个文件
假设有 `A.kt` 和 `B.kt`：
```bash
kotlinc A.kt B.kt -include-runtime -d app.jar
```

#### 3. 指定主类（自定义入口）
若需显式指定主类（例如使用 `@JvmStatic`）：
```kotlin
// App.kt
class App {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            println("Custom main class")
        }
    }
}
```
编译运行：
```bash
kotlinc App.kt -include-runtime -d app.jar
java -jar app.jar
```

---

### **四、常见问题与解决**
#### 1. 错误：`NoClassDefFoundError`
- **原因**：未包含 Kotlin 运行时库 (`kotlin-stdlib.jar`)。
- **解决**：
  ```bash
  kotlin -classpath hello.jar;%KOTLIN_HOME%\lib\kotlin-stdlib.jar HelloKt
  ```

#### 2. 错误：`找不到主类`
- **原因**：主类名未正确指定。
- **验证主类名**：
  ```bash
  jar tf hello.jar | grep .class
  ```
  - 默认主类名为 `<文件名>Kt`（如 `HelloKt`）。

#### 3. 脚本运行（`.kts` 文件）
编写脚本文件 `script.kts`：
```kotlin
#!/usr/bin/env kotlin
println("Kotlin Script!")
```
直接运行：
```bash
kotlin script.kts
```

---

### **五、跨平台注意事项**
| 操作系统        | 路径分隔符 | 示例命令                               |
| --------------- | ---------- | -------------------------------------- |
| **Windows**     | `;`        | `kotlin -cp lib1.jar;lib2.jar HelloKt` |
| **Linux/macOS** | `:`        | `kotlin -cp lib1.jar:lib2.jar HelloKt` |

---

通过以上步骤，你可以在命令行中轻松编译和运行 Kotlin 程序。