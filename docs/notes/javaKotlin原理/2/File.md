如果我执行new File("a.txt")的getAbsolutePath()，它是根据什么得到绝对路径的？

`new File("a.txt")` 只是**把传入的字符串包装成一个路径对象**，**不检查文件是否存在**，也不去磁盘做任何 I/O。

`getAbsolutePath()` 才干活，它的逻辑一句话：

> **“如果构造时给的路径不是绝对路径，就按**系统属性 `user.dir`**拼接；否则原样返回。”**

------------------------------------------------
1. 代码级流程（OpenJDK 源码）
------------------------------------------------
```java
public String getAbsolutePath() {
    return fs.resolve(this);          // this = 用户传入的 "a.txt"
}

// WinNTFileSystem / UnixFileSystem 里：
public String resolve(File f) {
    String path = f.getPath();
    if (isAbsolute(path)) return path;     // 已经是绝对路径直接返回
    return resolve(System.getProperty("user.dir"), path);
}
```

------------------------------------------------
2. `user.dir` 是什么
------------------------------------------------
- 启动 JVM 时自动设置，**等于 java 命令被执行那一刻的“工作目录”**（Working Directory）。  
- 在 IDEA 里就是 **Project 根目录**；  
- 命令行里就是你 `cd` 到的目录；  
- 可随时 `System.getProperty("user.dir")` 查看。

------------------------------------------------
3. 举个例子
------------------------------------------------
目录结构：
```
D:\demo
├─ a.txt
└─ sub
   └─ Main.java
```

命令行：
```
D:\demo> java -cp sub Main
```

代码：
```java
public static void main(String[] args) {
    System.out.println(System.getProperty("user.dir")); // D:\demo
    System.out.println(new File("a.txt").getAbsolutePath()); 
    // -> D:\demo\a.txt
}
```

------------------------------------------------
4. 小结一句话
------------------------------------------------
`getAbsolutePath()` =  
**“相对路径就拼 user.dir，绝对路径直接返回”**——  
**不读盘、不创建文件、不抛异常**，纯字符串拼接。

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #ff512f, #f09819);">
</div>

File类传入相对路径时，是否会和当前的user.dir做拼接？

不会“立刻”拼。

`new File("a.txt")` 只是把字符串原样存起来；**拼接动作延迟到第一次调用** `getAbsolutePath()`、`getCanonicalPath()`、`getAbsoluteFile()` 等 **“查询绝对路径”方法**时才发生，底层实现就是：

```java
if (!isAbsolute(path)) {
    path = System.getProperty("user.dir") + separator + path;
}
```

因此：
- 构造阶段 **不访问文件系统，也不拼 user.dir**；
- 只有当你显式或隐式（如创建 FileInputStream）需要绝对路径时，才用 **当时** 的 `user.dir` 拼出最终路径。

<div style="height:8px; border:none; border-radius:4px;
background:linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
box-shadow:0 0 15px rgba(246,79,89,0.7);">
</div>

调用File.mkdirs()时会拼吗
会——**在创建目录那一刻**才拼。

`mkdirs()` 内部会先把相对路径转成**绝对路径**再交给操作系统，因此：

1. 它先调用 `getAbsolutePath()`（等价于 `user.dir + 相对路径`）；
2. 再用这条绝对路径去系统调用 `CreateDirectoryW` / `mkdir`。

所以**执行 mkdirs() 时必定触发一次拼接**，但**仍属于“第一次需要绝对路径”的场景**，与之前结论一致：  
**只有到真正需要文件系统操作时，相对路径才会被拼成绝对路径。**