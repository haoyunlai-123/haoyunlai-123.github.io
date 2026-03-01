public void destroy() {
        Filter.super.destroy();
    }这是什么用法？当前类实现了Filter。这个是调用父类的父类的意思吗？

这个写法👇

```java
public void destroy() {
    Filter.super.destroy();
}
```

并不是调用“父类的父类”，而是：

> **当前类实现的接口 `Filter` 中，默认方法（default method）的显式调用方式。**

------

## ✅ 一、语法解释

`接口名.super.方法名()` 是 **Java 8 引入的语法**，
 用于在类实现多个接口时，**显式调用某个接口的默认方法**。

语法形式：

```java
接口名.super.方法名(参数...)
```

表示：

> “调用该接口中定义的 `default` 方法实现”。

------

## ⚙️ 二、背景知识：接口默认方法 (default method)

从 Java 8 起，接口可以提供带实现的方法，例如：

```java
public interface Filter {
    default void destroy() {
        System.out.println("Default destroy in Filter");
    }
}
```

当一个类实现此接口时：

```java
public class MyFilter implements Filter {
    @Override
    public void destroy() {
        Filter.super.destroy();  // 显式调用接口默认实现
        System.out.println("MyFilter custom destroy logic");
    }
}
```

输出结果：

```
Default destroy in Filter
MyFilter custom destroy logic
```

------

## 🧩 三、为什么要用 `Filter.super.destroy()`？

1. **避免重复逻辑**
    你可以在子类中添加自定义清理逻辑的同时，仍保留接口默认实现的功能。

2. **多接口冲突时的消歧义**
    如果类实现了两个接口，而两个接口都有同名的 default 方法：

   ```java
   interface A { default void destroy() {} }
   interface B { default void destroy() {} }
   class C implements A, B {
       @Override
       public void destroy() {
           A.super.destroy(); // 指定调用哪一个接口的版本
       }
   }
   ```

   否则编译器会报“冲突必须覆盖”的错误。

------

## ❌ 四、它和“父类的父类”没有关系

- `super.destroy()` 调的是 **父类的方法**；
- `Filter.super.destroy()` 调的是 **接口默认方法**；
- 接口没有类继承结构，不存在“父类的父类”概念。

------

## ✅ 五、一句话总结

> `Filter.super.destroy()` 是一种 **接口默认方法的显式调用语法**，
>  用来在实现类中调用接口里定义的 `default destroy()` 实现，
>  既不是继承链调用，也不是父类的父类调用。

