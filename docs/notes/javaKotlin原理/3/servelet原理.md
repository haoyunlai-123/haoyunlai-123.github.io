能否写个最小的servelet程序接受发送请求，我懒得详细学servelet了

当然可以 👍。
 下面是一个**最小可运行的 Servlet 示例**，可以让你直接理解 Servlet 是如何接受和响应 HTTP 请求的。
 这个版本不依赖 Spring，只使用 **原生 Java Servlet + 内嵌 Jetty 容器**，非常轻量、清晰。

------

## 🧩 1. 建立 Maven 项目

**pom.xml：**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>demo</groupId>
    <artifactId>mini-servlet</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        <!-- Jetty: 轻量级 Servlet 容器 -->
        <dependency>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-server</artifactId>
            <version>11.0.18</version>
        </dependency>
        <dependency>
            <groupId>org.eclipse.jetty</groupId>
            <artifactId>jetty-servlet</artifactId>
            <version>11.0.18</version>
        </dependency>
        <!-- Java Servlet API -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>5.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
</project>
```

------

## 🧠 2. 编写最小 Servlet 类

**HelloServlet.java：**

```java
package demo;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().write("Hello Servlet! 我是小鸭哥 🐤");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        String body = req.getReader().lines().reduce("", (a, b) -> a + b);
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"echo\": \"" + body + "\"}");
    }
}
```

------

## ⚙️ 3. 启动一个内嵌 Jetty 服务器（无需 Tomcat）

**App.java：**

```java
package demo;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

public class App {
    public static void main(String[] args) throws Exception {
        // 启动 Jetty 在 8080 端口
        Server server = new Server(8080);

        // 创建 Servlet 上下文
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        server.setHandler(context);

        // 注册 HelloServlet 到 /hello 路径
        context.addServlet(new ServletHolder(new HelloServlet()), "/hello");

        server.start();
        System.out.println("🚀 Server started at http://localhost:8080/hello");
        server.join();
    }
}
```

------

## 🧪 4. 运行与测试

在项目根目录执行：

```bash
mvn compile exec:java -Dexec.mainClass="demo.App"
```

然后打开浏览器访问：

```
http://localhost:8080/hello
```

输出：

```
Hello Servlet! 我是小鸭哥 🐤
```

也可以测试 POST 请求：

```bash
curl -X POST -d '{"msg":"hi"}' http://localhost:8080/hello
```

输出：

```json
{"echo": "{\"msg\":\"hi\"}"}
```

------

## 📘 5. 结构总结

| 组件                  | 职责                                   |
| --------------------- | -------------------------------------- |
| Jetty Server          | 监听 8080 端口，解析 HTTP 报文         |
| ServletContextHandler | 管理 URL 与 Servlet 的映射关系         |
| HelloServlet          | 处理 `/hello` 请求（`doGet`/`doPost`） |
| HttpServletRequest    | 封装请求行、头、体                     |
| HttpServletResponse   | 封装响应头、体                         |

------

💡 **一句话总结：**

> Servlet 是“类 + 方法”，Jetty/Tomcat 是“容器 + 协议解析”，
>  请求进来 → 容器转成 `HttpServletRequest` → 调用 Servlet 方法 → 返回响应。

------

是否希望我再帮你写个 **“迷你版 Servlet 容器”**（纯手写版本，不依赖 Jetty），
 让你看清楚 Tomcat/Jetty 是怎么从 Socket 读取请求行、封装成 HttpServletRequest、再调用 `doGet()` 的？
 这个能让你完全看透 Servlet 背后的机制。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

需要纯手写版

太好了 👍
下面给你一个**纯手写的最小 Servlet 容器实现**（不依赖 Tomcat、Jetty、Spring），
完整展示从 **Socket → HTTP 请求解析 → 调用 doGet → 写回响应** 的全过程。
这是理解 Servlet 和 Web 容器原理最直观的例子。

---

## 🧩 1. 文件结构

```
mini-servlet/
 ├── MiniServer.java         # 启动 HTTP 服务器
 ├── MiniServlet.java        # Servlet 接口定义
 ├── HelloServlet.java       # 自定义业务逻辑
 └── HttpRequest.java        # 简易 HTTP 请求封装
 └── HttpResponse.java       # 简易 HTTP 响应封装
```

---

## 🧱 2. 代码实现

### 🧰 MiniServlet.java

```java
public interface MiniServlet {
    void doGet(HttpRequest req, HttpResponse resp);
    void doPost(HttpRequest req, HttpResponse resp);
}
```

---

### 📥 HttpRequest.java

```java
import java.io.*;
import java.util.*;

public class HttpRequest {
    private String method;
    private String path;
    private Map<String, String> headers = new HashMap<>();
    private String body;

    public static HttpRequest parse(InputStream in) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        HttpRequest req = new HttpRequest();

        // 请求行：GET /hello HTTP/1.1
        String line = reader.readLine();
        if (line == null || line.isEmpty()) return req;
        String[] parts = line.split(" ");
        req.method = parts[0];
        req.path = parts[1];

        // 请求头
        while (!(line = reader.readLine()).isEmpty()) {
            int idx = line.indexOf(":");
            if (idx > 0) {
                String key = line.substring(0, idx).trim();
                String val = line.substring(idx + 1).trim();
                req.headers.put(key, val);
            }
        }

        // 读取 body（仅简单支持）
        if ("POST".equalsIgnoreCase(req.method)) {
            int len = Integer.parseInt(req.headers.getOrDefault("Content-Length", "0"));
            char[] buf = new char[len];
            reader.read(buf);
            req.body = new String(buf);
        }
        return req;
    }

    public String getMethod() { return method; }
    public String getPath() { return path; }
    public String getHeader(String key) { return headers.get(key); }
    public String getBody() { return body; }
}
```

---

### 📤 HttpResponse.java

```java
import java.io.*;
import java.nio.charset.StandardCharsets;

public class HttpResponse {
    private OutputStream out;

    public HttpResponse(OutputStream out) {
        this.out = out;
    }

    public void write(String body) throws IOException {
        byte[] data = body.getBytes(StandardCharsets.UTF_8);
        String headers = "HTTP/1.1 200 OK\r\n" +
                "Content-Type: text/plain; charset=UTF-8\r\n" +
                "Content-Length: " + data.length + "\r\n" +
                "\r\n";
        out.write(headers.getBytes(StandardCharsets.UTF_8));
        out.write(data);
        out.flush();
    }
}
```

---

### 🐤 HelloServlet.java

```java
import java.io.IOException;

public class HelloServlet implements MiniServlet {

    @Override
    public void doGet(HttpRequest req, HttpResponse resp) {
        try {
            resp.write("Hello, 我是手写 Servlet! Path=" + req.getPath());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void doPost(HttpRequest req, HttpResponse resp) {
        try {
            resp.write("收到POST数据: " + req.getBody());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

---

### 🚀 MiniServer.java

```java
import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class MiniServer {

    private static final int PORT = 8080;

    public static void main(String[] args) throws IOException {
        ServerSocket server = new ServerSocket(PORT);
        ExecutorService pool = Executors.newFixedThreadPool(8);
        System.out.println("🚀 MiniServlet 启动于 http://localhost:" + PORT);

        while (true) {
            Socket socket = server.accept();
            pool.submit(() -> handle(socket));
        }
    }

    private static void handle(Socket socket) {
        try (socket) {
            HttpRequest req = HttpRequest.parse(socket.getInputStream());
            HttpResponse resp = new HttpResponse(socket.getOutputStream());

            MiniServlet servlet = new HelloServlet();
            if ("GET".equalsIgnoreCase(req.getMethod())) {
                servlet.doGet(req, resp);
            } else if ("POST".equalsIgnoreCase(req.getMethod())) {
                servlet.doPost(req, resp);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

---

## 🧪 3. 运行与测试

编译并运行：

```bash
javac *.java
java MiniServer
```

浏览器访问：

```
http://localhost:8080/hello
```

输出：

```
Hello, 我是手写 Servlet! Path=/hello
```

POST 测试：

```bash
curl -X POST -d "name=小鸭哥" http://localhost:8080/hello
```

输出：

```
收到POST数据: name=小鸭哥
```

---

## 🧠 4. 这段代码背后对应的 Servlet 机制

| 原理层       | Tomcat/Servlet 容器中的对应部分 | 你的代码对应                   |
| ------------ | ------------------------------- | ------------------------------ |
| Socket 监听  | `Connector` + `ProtocolHandler` | `ServerSocket`                 |
| 线程调度     | `Executor` 线程池               | `Executors.newFixedThreadPool` |
| 请求解析     | `Http11InputBuffer`             | `HttpRequest.parse()`          |
| Servlet 分发 | `ApplicationDispatcher`         | 手动创建 `HelloServlet`        |
| 响应封装     | `Response`                      | `HttpResponse`                 |
| 写出字节流   | `OutputBuffer`                  | `OutputStream.write()`         |

---

✅ **总结一句话：**

> 这个“手写 Servlet”演示了 Tomcat/Jetty 的本质：
> Socket → 解析 HTTP → 封装 Request/Response → 调用 Servlet → 写回字节流。

---

是否希望我在这个基础上再加一个“**路径路由器（Router）**”，
让你可以注册多个 Servlet，比如 `/hello` `/user` `/upload` 都能匹配不同类？
这样就成了一个完整的“迷你版 Tomcat”。