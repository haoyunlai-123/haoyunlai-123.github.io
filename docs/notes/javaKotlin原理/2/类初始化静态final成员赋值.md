类初始化时静态代码块能给static final 成员赋值吗？

可以，**但只有一次机会**——而且必须满足 **“在类初始化完成之前就把值写死”** 这条编译器铁律。

1. 直接写在定义处  
   ```java
   static final int X = 10;          // 最简洁，最常用
   ```

2. 写在 **static 代码块** 里也行  
   ```java
   static final int X;
   static {
       X = 20;        // 合法：类初始化阶段赋值，且只能赋一次
   }
   ```

   编译器规则  
   - **每个 static final 字段必须在类初始化结束之前被“明确赋值”一次且仅一次**；  
   - 不能在后续代码里再次赋值，否则直接编译错误（可能已最终赋值）。  
   - 如果既不在定义处写值，又不在静态块里写值，编译就报错：“variable X might not have been initialized”。

3. 反例：编译失败  
   ```java
   static final int X;
   static {
       X = 30;
       X = 40;     // 错误: 可能已最终赋值
   }
   ```

4. 反例：方法/构造器里赋值  
   ```java
   static final int X;
   public static void init() {
       X = 50;     // 错误: 无法从静态上下文中赋值
   }
   ```

结论  
类初始化阶段（`<clinit>` 方法）的 static 块 **完全可以** 给 static final 成员赋初值；  
只要保证 **“只写一次”** 且 **“在类初始化完成前写完”**，编译器就放行。