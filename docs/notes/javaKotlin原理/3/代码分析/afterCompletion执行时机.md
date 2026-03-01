```java
@Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        // 清空threadlocal
        UserHolder.removeUser();
    }这个方法何时执行？在tomcat处理完本次请求后吗？
```

非常好的问题 👍，你问的这个 `afterCompletion()` 方法正是 Spring MVC **拦截器（HandlerInterceptor）** 生命周期的最后一个阶段。
 我们来详细说明它 **什么时候执行、执行顺序、与 Tomcat 的关系** 👇

------

## 🧩 一、拦截器（HandlerInterceptor）生命周期总览

在 Spring MVC 中，一个请求从进入到返回响应，大致会经过以下三个阶段：

| 阶段                             | 方法                | 说明                                                         |
| -------------------------------- | ------------------- | ------------------------------------------------------------ |
| ① 进入 Controller 前             | `preHandle()`       | 在调用目标 Controller 方法之前执行，可决定是否继续处理（返回 `false` 可中断请求） |
| ② Controller 执行后，视图渲染前  | `postHandle()`      | 在 Controller 执行完，但在视图渲染（返回结果写入响应体）之前执行 |
| ③ 整个请求完成后（包括视图渲染） | `afterCompletion()` | **请求处理完毕后执行**，用于资源清理，如 ThreadLocal 清空、日志、监控 |

------

## ⚙️ 二、`afterCompletion()` 的执行时机

`afterCompletion()` 的执行是在：

> **整个请求（包括视图渲染、response 写出）完全结束后，由 Spring 的 DispatcherServlet 调用。**

换句话说：

- 它发生在 Controller 执行完、返回结果写入响应体之后；
- 如果抛出了异常，它仍然会执行；
- 它 **一定在请求线程的最后阶段执行**，在 Tomcat 把响应交还给客户端之前。

### ✅ 时间线举例

假设请求 `/user/info`：

| 步骤 | 执行点                                   | 方法                   |
| ---- | ---------------------------------------- | ---------------------- |
| 1    | 进入 DispatcherServlet                   | → `preHandle()`        |
| 2    | 执行 Controller 逻辑                     | （用户业务逻辑）       |
| 3    | 返回 ModelAndView 或 JSON 响应           | → `postHandle()`       |
| 4    | 渲染视图 / 写入 Response Body            | （比如写 JSON 输出流） |
| 5    | 请求彻底完成                             | → `afterCompletion()`  |
| 6    | Tomcat 回收请求线程、Response Flush 完成 | （线程资源释放）       |

------

## 🧹 三、为什么这里清理 ThreadLocal？

因为：

- Spring MVC 在处理请求时，所有逻辑（Controller、Service）都在同一个 **请求线程** 中执行；
- 如果你在 `ThreadLocal` 中保存了当前用户信息（如 `UserHolder.setUser(user)`），
- 那必须在请求结束时清掉，避免线程复用时数据“串用户”。

否则下一次请求复用同一个线程，ThreadLocal 里的旧数据还在，会造成严重的安全问题。

所以清理逻辑：

```java
@Override
public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
    UserHolder.removeUser(); // 避免内存泄漏或用户数据串线
}
```

------

## 🔚 四、与 Tomcat 的关系

Tomcat 执行顺序是这样的：

1. **Tomcat** 接收 HTTP 请求；
2. 调用 Spring MVC 的 `DispatcherServlet`；
3. 执行控制器 → 渲染 → 返回响应；
4. **Spring 调用完 `afterCompletion()` 后，才把响应交还 Tomcat**；
5. **Tomcat** 将响应字节流发送给浏览器；
6. 请求线程被放回线程池。

所以可以理解为：

> `afterCompletion()` 是在 **Tomcat 回收线程前、响应发送前的最后阶段** 执行的。

------

## ✅ 总结一句话

> **`afterCompletion()` 在一次请求的最后阶段执行（包括渲染完成后），用于清理资源，比如 ThreadLocal。**
>
> 它在 Tomcat 把响应真正返回客户端之前调用，是你清理当前请求上下文最安全的地方。

------

如果你愿意，我可以帮你画一个“Spring MVC 请求完整时序图（含拦截器生命周期）”，直观展示 `preHandle → postHandle → afterCompletion` 的调用顺序，要我画一个吗？