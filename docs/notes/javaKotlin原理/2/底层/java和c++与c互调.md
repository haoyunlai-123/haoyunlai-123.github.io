```java
@IntrinsicCandidate
    public static native void arraycopy(Object src,  int  srcPos,
                                        Object dest, int destPos,
                                        int length);在jdk24中这个方法是这样，好像没调用

 Unsafe.copyMemory
```
`System.arraycopy` 在源码里**看不到**对 `Unsafe.copyMemory` 的调用，是因为 HotSpot 把它做成了**最顶层的 intrinsic（固有函数）**：

1. 源码层  
   ```java
   @IntrinsicCandidate
   public static native void arraycopy(...);
   ```
   只是一个**占位符**，字节码里一旦遇到它，**解释器 / JIT 直接替换成手写汇编 stub**，根本不会走进 JNI。

2. 虚拟机内部（HotSpot）  
   - **解释模式**：`TemplateInterpreterGenerator::generate_arraycopy_stub`  
   - **C1 / C2 编译模式**：`LibraryCallKit::inline_arraycopy`  
   最终都落到 **cpu-specific 的汇编实现**（x86 用 `REP MOVSB` 或 AVX 批量复制，ARM 用 `LD1/ST1` 等）。

3. 与 `Unsafe.copyMemory` 的关系  
   - **同一块汇编 stub** 可以被 `Unsafe.copyMemory` **复用**，但 `arraycopy` **并不通过 JNI 去调 `copyMemory`**，而是**直接 inline** 到调用点。  
   - 因此你在 Java 源码里**看不到任何调用链**——**intrinsic 就是“汇编级直通车”**。

结论：  
`System.arraycopy` 在 JDK 24 依旧是 **intrinsic**，**无 JNI、无 Unsafe 调用**，  
**解释器 / JIT 直接替换为底层汇编**，所以性能 ≈ `memcpy`。
<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>
这个多次提到的JNI是什么？是指jvm程序(c++)进入java执行环境内部吗？
JNI（Java Native Interface）是 **JVM 提供的一套“双向胶水”规范**：  
**让 Java 代码可以调用 C/C++（或其他原生语言）函数，也让 C/C++ 可以反过来创建 Java 对象、访问字段、抛出异常**——**双方互调**的桥梁，而不仅仅是“从 C++ 进入 Java”。

------------------------------------------------
1. 使用场景
------------------------------------------------
- Java → C/C++  
  ```java
  class Native {
      public native void compress(byte[] src, byte[] dst);
  }
  ```
  对应 C 实现：
  ```c
  JNIEXPORT void JNICALL
  Java_Native_compress(JNIEnv *env, jobject thiz, jbyteArray src, jbyteArray dst) {
      // 通过 env 操作 Java 字节数组、抛异常等
  }
  ```

- C/C++ → Java  
  在原生代码里 **new Java 对象、调用 Java 方法、抛 Java 异常**：
  ```c
  jclass cls = (*env)->FindClass(env, "java/lang/RuntimeException");
  (*env)->ThrowNew(env, cls, "native error");
  ```

------------------------------------------------
2. 角色定位
------------------------------------------------
- **规范**：JNI 是一组 **C 头文件 + JVM 约定**（`jni.h`），任何 JVM 实现都必须支持；
- **实现**：HotSpot 内部提供 `jni_*.cpp` 等代码，**真正完成栈帧切换、参数转换、GC 屏障**；
- **加载**：Java 通过 `System.loadLibrary("xxx")` 把 `.dll` / `.so` 装进进程，**随后 JVM 会注册其中的 JNI 函数**。

------------------------------------------------
3. 与“intrinsic”区别
------------------------------------------------
- **JNI**：Java 声明 `native`，**走 C/C++ 实现**，**有栈切换成本**；
- **intrinsic**：Java 声明 `native` **但 JVM 自己提供汇编实现**，**无 JNI 栈切换**，性能 ≈ 手写汇编。

------------------------------------------------
一句话记忆  
JNI = **“Java 与原生世界的双向 API 胶水”**，  
**Java ↔ C/C++ 互调**都靠它，**不是单行道**。
<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>
自己写个类其中写个native方法怎么运行？本地怎么用c/c++实现？
下面给出一份**最小可运行**的完整示例（Windows + MinGW / Linux + GCC 都适用），让你**5 分钟**跑通第一个 **Java ↔ C 互调**。

------------------------------------------------
1. 目录结构
------------------------------------------------
```
demo/
├─ HelloJNI.java
├─ HelloJNI.c
├─ Makefile   （可选，一键编译）
└─ run.bat    （可选，一键运行）
```

------------------------------------------------
2. Java 侧（HelloJNI.java）
------------------------------------------------
```java
public class HelloJNI {
    // 1. 声明 native 方法
    private native int add(int a, int b);

    public static void main(String[] args) {
        // 2. 加载动态库
        System.loadLibrary("hello");   // 不需要前缀 lib / 后缀 .dll/.so
        HelloJNI jni = new HelloJNI();
        int ans = jni.add(3, 4);
        System.out.println("3 + 4 = " + ans);
    }
}
```

------------------------------------------------
3. 生成 C 头文件
------------------------------------------------
```bash
javac HelloJNI.java
javah -jni HelloJNI        # JDK 8
# JDK 10+ 用
javac -h . HelloJNI.java   # 在当前目录生成 HelloJNI.h
```

生成的 `HelloJNI.h` 片段（别改，直接实现）：
```c
JNIEXPORT jint JNICALL Java_HelloJNI_add
  (JNIEnv *, jobject, jint, jint);
```

------------------------------------------------
4. C 实现（HelloJNI.c）
------------------------------------------------
```c
#include "HelloJNI.h"

JNIEXPORT jint JNICALL Java_HelloJNI_add
  (JNIEnv *env, jobject thiz, jint a, jint b)
{
    return a + b;
}
```

------------------------------------------------
5. 编译动态库
------------------------------------------------
**Windows（MinGW）**
```bash
gcc -shared -o hello.dll HelloJNI.c -I"%JAVA_HOME%\include" -I"%JAVA_HOME%\include\win32"
```

**Linux / macOS**
```bash
gcc -shared -fPIC -o libhello.so HelloJNI.c -I${JAVA_HOME}/include -I${JAVA_HOME}/include/linux
```

------------------------------------------------
6. 运行
------------------------------------------------
```bash
java -Djava.library.path=. HelloJNI
```

输出：
```
3 + 4 = 7
```

------------------------------------------------
7. 常见坑
------------------------------------------------
- 库名匹配：  
  Windows 生成 `hello.dll`，Linux 生成 `libhello.so`，**Java 里只写 `hello`**。
- 头文件路径：  
  必须指向 `$JAVA_HOME/include` 和平台子目录（`win32`/`linux`/`darwin`）。
- JDK 10+ 用 `javac -h .` 替代 `javah`。
- 64 位 JVM 需要 **64 位动态库**，混用会报 `Can't load IA 32 .dll on a AMD 64`。

------------------------------------------------
一句话记忆  
**“javac 生成头 → C 实现函数 → gcc 打成共享库 → java -Djava.library.path=. 运行”**——  
四步走通，JNI 就入门了。
