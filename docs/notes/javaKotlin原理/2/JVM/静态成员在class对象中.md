一个类的静态成员变量存在元空间的KlassInstance中还是堆中的class对象中

一句话结论  
> **静态成员变量的“对象实体”**在**Java堆（Heap）**里；  
> **元空间（Metaspace）**里只有它们的**“字段描述符号”**（FieldInfo），并不存放实际数据。

---

### 1. 静态变量到底存在哪？
- **JDK 8 以后**：  
  类被加载后，**HotSpot 会在 Java 堆中为该类创建一个 `java.lang.Class<?>` 实例**，并把**所有静态变量（基本类型值或对象引用）**作为这个 `Class` 实例的**普通 Java 字段**存放进去。  
  因此静态变量跟普通对象一样，**受 GC 管理**，**位于堆中**。

- **元空间（Metaspace）**只保存：
  - Klass/InstanceKlass 结构  
  - 字段元数据（FieldInfo：名字、描述符、访问标志、偏移量等）  
  - 方法字节码、常量池等类元数据  

  **不会保存静态变量的“值”或“引用”本身**。

---

### 2. 实验验证
```java
public class A {
    static Object o = new Object();   // 静态引用
    static int        v = 2025;       // 静态基本类型
}
```
使用 `jmap -dump` + `jhat` / `VisualVM` 查看堆快照：  
- 会找到一个对象 `java.lang.Class<A>`，其内部两个字段：
  - `o Ljava/lang/Object;`  
  - `v I`  
  它们与普通对象字段一样，**躺在堆中**。

---

### 3. 记忆口诀
> **“静态变量是 Class 对象的普通字段，值在堆；元空间只放模板，不放数据。”**

---

### 4. 拓展：JDK 7 之前
在 **PermGen（永久代）** 时代，HotSpot 把静态变量的**引用**也一并放进永久代；  
JDK 8 去掉 PermGen 后，**引用/值全部移到堆**，元空间只保留**纯元数据**。

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff00cc, #333399); box-shadow:0 0 10px #ff00cc;">
</div>

static final变量是放在KlassInstance的ConstantPool* cpool中吗？还是在class对象中？

一句话区分  
- **static final 基本类型或 String 常量** → 值存在 **运行时常量池（Metaspace 里的 ConstantPool）**，**不占用 Class 对象的字段槽**。  
- **static final 引用类型（非 String）** → 引用存在 **运行时常量池**，但**引用的“对象实体”仍在 Java 堆**；Class 对象里**不会**再给它留一个字段。  

---

### 1. 字节码层面怎么放
```java
static final int    MAX = 999;              // 基本类型
static final String HELLO = "hello";        // String
static final Object OBJ = new Object();     // 普通引用类型
```

编译后：
- `MAX` 与 `"hello"` 都属于 **ConstantValue 属性**，被收集进 **class 文件的常量池**。
- 类加载时，HotSpot 把它们解析成 **运行时常量池（ConstantPool*）** 中的 **JvmConstant** 条目，**值直接嵌入**池里，**不会**在 `java.lang.Class<?>` 实例中分配字段。

---

### 2. 运行时内存布局
| 类型                                | 值/引用位置                                                  | 对象实体位置                       |
| ----------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `static final int`                  | 运行时常量池（Metaspace）                                    | —                                  |
| `static final String`（编译期常量） | 运行时常量池（Metaspace）                                    | 字符串实例在 **堆** 的字符串常量池 |
| `static final Object`               | 运行时常量池保存 **引用**，但 **引用指向的 Object 实例** 在 **Java 堆** |                                    |

---

### 3. 验证手段
```java
static final Object O = new Object();
```
- `jmap -dump` 可以看到 **Class 对象里并没有名为 O 的字段**。  
- 用 `javap -v` 能看到 `O` 对应一个 **ConstantPool** 条目，类型为 `MethodHandle/MethodType` 或直接的 **对象引用索引**（解析后）。

---

### 4. 总结口诀
> **“编译期可计算的基本类型/String 常量，值进池，类对象不留槽；**  
> **运行期才 new 出来的，引用进池，对象仍在堆。”**