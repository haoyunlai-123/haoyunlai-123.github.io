在Kotlin中，`Nothing`和`Unit`都是特殊的类型，但它们用途和语义截然不同：

---

### **1. Unit**
- **含义**  
  - 表示函数没有有意义的返回值（类似Java的`void`）
  - 实际返回一个`Unit`对象（单例实例）

- **特征**  
  - 函数默认返回值（即使未显式声明）
  - 有且只有一个唯一实例`Unit`

- **示例**  
  ```kotlin
  fun printMessage(msg: String): Unit {
      println(msg)
      // 隐式返回 Unit
  }
  ```

---

### **2. Nothing**
- **含义**  
  - 表示函数永远不会正常返回（必定抛出异常或永不终止）
  - 是所有类型的子类型（包括`Unit`）

- **特征**  
  - 没有实例（无法创建`Nothing`对象）
  - 编译器会为返回`Nothing`的代码路径做特殊处理

- **示例**  
  ```kotlin
  fun fail(message: String): Nothing {
      throw IllegalArgumentException(message)
  }
  
  fun infiniteLoop(): Nothing {
      while(true) {
          // 无限循环
      }
  }
  ```

---

### **关键区别对比**
| 特性             | Unit                        | Nothing                     |
| ---------------- | --------------------------- | --------------------------- |
| **返回值**       | 表示无意义返回              | 表示永不返回                |
| **继承关系**     | 普通类的子类型              | 所有类型的子类型            |
| **用途场景**     | 常规无返回值函数            | 必定抛出异常/永不终止的函数 |
| **实例存在性**   | 存在单例实例`Unit.INSTANCE` | 没有实例                    |
| **类型系统地位** | 普通类                      | 特殊类型（bottom type）     |

---

### **典型用法对比**

#### 1. `Unit`的常见用法
```kotlin
// 显式声明返回值类型（可省略）
fun log(message: String): Unit {
    println("Log: $message")
}
```

#### 2. `Nothing`的常见用法
```kotlin
// 强制终止程序
fun validate(value: Int) {
    if (value < 0) {
        throw IllegalArgumentException("Invalid value") // 隐式返回Nothing
    }
}

// Elvis运算符的默认值分支
val name = nullableName ?: error("Name is null") // error()返回Nothing
```

---

### **类型系统里的特殊特性**
```kotlin
// Nothing可以赋值给任何类型变量
val str: String = fail("Error")  // 合法，因为返回Nothing的函数永远不会实际返回
val num: Int = infiniteLoop()    // 合法

// Unit则不能这样使用
val value: Int = Unit  // 编译错误！类型不匹配
```

---

### **总结**
- 用`Unit`标识**正常结束但没有返回值**的函数  
- 用`Nothing`标识**永远不会正常返回**的函数  
- `Nothing`在类型系统中的特殊性使得编译器可以进行更严格的流分析（如确定代码可达性）