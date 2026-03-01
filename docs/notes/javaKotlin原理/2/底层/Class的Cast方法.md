Class.cast(Object)是什么方法？

`Class.cast(Object obj)` 是 Java 反射包里的一个**类型安全转换工具方法**。  
它做的事可以用一句话概括：

> **把传入的 `obj` 当成当前 `Class` 所表示的类型返回，若类型不符则立即抛出 `ClassCastException`。**

---

### 1. 方法签名
```java
public T cast(Object obj)   // T 是当前 Class 对象所代表的类型
```

---

### 2. 内部实现（JDK 源码）
```java
public T cast(Object obj) {
    if (obj != null && !isInstance(obj))
        throw new ClassCastException(cannotCastMsg(obj));
    return (T) obj;
}
```
- **空对象直接返回**（`null` 可以赋给任何引用类型）。  
- **运行时检查**：`isInstance(obj)` 失败就抛异常。  
- **最后强转**：`(T) obj` 由虚拟机完成，**不会触发额外的检查**。

---

### 3. 与直接强转 `(T) obj` 的区别
| 直接强转                    | `Class.cast`                        |
| --------------------------- | ----------------------------------- |
| 编译期检查类型是否可能成功  | **运行期**才检查                    |
| 失败抛 `ClassCastException` | 失败同样抛 `ClassCastException`     |
| 代码里**写死**类型          | 类型**动态传入**，适合泛型/反射场景 |

---

### 4. 典型用法场景
```java
Object obj = getObjectFromSomewhere();   // 只知道是 Object
Class<String> cls = String.class;
String s = cls.cast(obj);                // 失败时抛异常，成功则返回 String
```
等价于：
```java
String s = (String) obj;
```
但 **`cast` 的版本可以在泛型里统一处理**，例如：
```java
public static <T> T convert(Object o, Class<T> cls) {
    return cls.cast(o);
}
```

---

### 5. 一句话记忆
> `Class.cast` 就是**“带着运行时检查的强制转换”**，适合**反射/泛型**里**动态类型**的场景，失败立即抛 `ClassCastException`。