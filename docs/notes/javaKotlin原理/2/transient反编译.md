```java
public static void main(String args[])
{
    print(new String[] {
        "Holis", "\u516C\u4F17\u53F7:Hollis", "\u535A\u5BA2\uFF1Awww.hollischuang.com", "QQ\uFF1A907607222"
    });
}

public static transient void print(String strs[])
{
    for(int i = 0; i < strs.length; i++)
        System.out.println(strs[i]);

}这段反编译的java代码中transient为什么能修饰方法
```
先给出结论：  
**transient 不能修饰方法**；你看到的那段代码是 **反编译器（jad、fernflower、CFR 等）为了“还原”编译器合成的字节码标志位而误打印出来的文字**，并不是合法的 Java 源码。真把代码粘回 IDE 会立即报错：`modifier transient not allowed here`。

------------------------------------------------
字节码层面发生了什么

1. 编译器在把变长参数 `print(String... strs)` 编译成 `print(String[] strs)` 的同时，会给这个 **synthetic / bridge / varargs 数组参数** 打上 `ACC_TRANSIENT` 标志（以便反射/调试器识别“这是由可变参数自动生成的数组”）。

2. 反编译器读到 `ACC_TRANSIENT` 后，**简单地把关键字 transient 直接输出到方法签名前面**，于是出现了
   ```java
   public static transient void print(String strs[])
   ```
   这种**语法错误**的“伪代码”。

------------------------------------------------
验证办法

- 用 `javap -v` 看真正的字节码，只会见到 flags：
  ```
  ACC_PUBLIC, ACC_STATIC, ACC_VARARGS, ACC_TRANSIENT
  ```
  并不会出现 transient 关键字在方法表（MethodInfo）的“修饰符”字段里——因为 JVMS 规定 transient 只允许出现在 **字段**（FieldInfo）中。

- 把反编译结果粘回 IntelliJ / Eclipse，编译器立刻红字提示：
  ```
  'transient' not permitted for methods
  ```

------------------------------------------------
一句话记  
**transient 只能修饰字段**；反编译器把内部标志“直译”成源码时经常闹乌龙，看到“transient 方法”直接无视即可，它根本不是合法 Java 语法。