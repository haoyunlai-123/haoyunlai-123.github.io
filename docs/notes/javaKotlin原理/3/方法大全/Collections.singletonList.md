Collections.singletonList这是什么方法？

`Collections.singletonList(T obj)` 是 JDK 提供的**不可变单例列表工具方法**，核心特点一句话：

> **"只能装一个元素，且永远不能再增删改，线程安全，内存占用最小。"**

------------------------------------------------
源码实现（JDK 17）
```java
public static <T> List<T> singletonList(T o) {
    return new SingletonList<>(o);
}
```
内部类 `SingletonList` 特点：
- **长度固定为 1**  
- **所有增删改方法直接抛 `UnsupportedOperationException`**  
- **元素存储在 final 字段**，无额外数组开销

------------------------------------------------
常见用途
1. **方法返回只读单例列表**（避免 new ArrayList）
```java
return Collections.singletonList(user);
```
2. **函数式流拼接**
```java
Stream.concat(stream1, Collections.singletonList(fallback).stream())
```
3. **Map 批量操作**
```java
map.put(key, Collections.singletonList(value));
```

------------------------------------------------
与 `Arrays.asList` 区别
| 特性   | `Collections.singletonList` | `Arrays.asList`     |
| ------ | --------------------------- | ------------------- |
| 长度   | 固定 1                      | 固定（数组长度）    |
| 可变性 | 完全不可变                  | 元素可改（set支持） |
| 增删   | 抛异常                      | 抛异常              |
| 内存   | 最小（无数组）              | 轻量（包装数组）    |

------------------------------------------------
一句话背走
> **`Collections.singletonList(obj)` = 不可变、单元素、线程安全、内存最小；**  
> **适合返回只读单例、函数式拼接、Map 批量值，不能用 add/remove/set。**

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

返回空集合

```java
Collections.emptyList()
```