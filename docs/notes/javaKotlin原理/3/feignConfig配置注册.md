```java
package com.hmall.api.config;

import com.hmall.api.client.fallback.ItemClientFallbackFactory;
import com.hmall.common.utils.UserContext;
import feign.Logger;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;

public class DefaultFeignConfig {
    @Bean
    public Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }

    @Bean
    public RequestInterceptor userInfoRequestInterceptor(){
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                Long userId = UserContext.getUser();
                if(userId != null){
                    requestTemplate.header("user-info",userId.toString());
                }
            }
        };
    }

    @Bean
    public ItemClientFallbackFactory itemClientFallbackFactory(){
        return new ItemClientFallbackFactory();
    }
} 这个配置类没加@configuration注解，是如何被注册成bean的
```
非常好的问题 👏。
你注意到 `DefaultFeignConfig` 没有加 `@Configuration` 却仍然能被注册，这其实和 **Feign 的配置加载机制** 有关。
Spring Cloud OpenFeign 对配置类的扫描和注册有一套“特殊机制”。

---

## 🧭 一、普通情况：没有 `@Configuration` 就不会注册

在一般的 Spring Boot 应用中，如果一个类：

```java
public class SomeConfig {
    @Bean
    public Object bean() { ... }
}
```

没有加 `@Configuration` 或没有被显式 `@ComponentScan` 扫描，是不会自动生效的。

但 Feign 不一样——Feign 会通过注解参数**显式引用这个类**，从而让 Spring 把它注册进上下文。

---

## ⚙️ 二、Feign 是怎么加载配置类的？

当你在定义 Feign 客户端接口时，比如：

```java
@FeignClient(
    name = "item-service",
    configuration = DefaultFeignConfig.class, // 关键点！！
    fallbackFactory = ItemClientFallbackFactory.class
)
public interface ItemClient {
    ...
}
```

这一行：

```java
configuration = DefaultFeignConfig.class
```

告诉 Spring Cloud Feign：

> “加载这个类里的所有 @Bean 方法到当前 FeignClient 的上下文。”

---

## 🧩 三、Spring 是如何实现的（底层原理）

Spring Cloud OpenFeign 在启动时会做这几件事：

1. 扫描所有 `@FeignClient` 注解；
2. 读取其中的 `configuration` 参数；
3. 把这些类注册到一个专用的 `FeignClientSpecification` Bean 中；
4. 创建一个独立的 Spring 子容器（`ApplicationContext`）；
5. 在这个子容器中加载这些配置类（即使它们**没有 @Configuration**）。

👉 所以：
即使 `DefaultFeignConfig` 没有加 `@Configuration`，
Feign 也会显式地 **用 JavaConfig 方式加载它**，并注册里面的 `@Bean` 方法。

---

## ✅ 四、结论

| 配置来源                              | 是否需要 `@Configuration` | 是否会被注册  |
| --------------------------------- | --------------------- | ------- |
| 普通 Spring 配置类                     | ✅ 需要                  | ✅       |
| `@ComponentScan` 扫描到的类            | ✅ 需要                  | ✅       |
| Feign `configuration = xxx.class` | ❌ 不需要                 | ✅ 会自动加载 |

---

## 💡 五、额外注意（常见坑）

1. **不要在全局上下文中自动扫描 Feign 配置类**
   否则里面的 `@Bean`（例如拦截器）会影响所有 FeignClient。
   官方推荐：

   > 不要给 Feign 配置类加 `@Configuration`，
   > 让它只作用于指定的 FeignClient。

2. **想要全局生效，可以加 `@EnableFeignClients(defaultConfiguration = DefaultFeignConfig.class)`**
   这样就不是单个 client 局部生效，而是全局配置。

---

## ✅ 六、一句话总结：

> 在 Feign 中，`configuration = DefaultFeignConfig.class` 会显式告诉 Spring 去加载这个类，
> 所以即使没有 `@Configuration`，里面的 `@Bean` 方法依然会被注册到该 FeignClient 的上下文中。
>
> 反而，**不加 `@Configuration` 更安全**，因为能避免全局污染。

---

是否希望我帮你画一个小图，展示：

> “@FeignClient → FeignClientSpecification → 子容器加载配置 → Bean 注册”的流程？
> 那样你能一眼看出为什么没加 @Configuration 也能生效。

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

```java
@EnableFeignClients(basePackages = "com.hmall.api.client",defaultConfiguration = DefaultFeignConfig.class)
@MapperScan("com.hmall.user.mapper")
@SpringBootApplication
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }

}这样是不是也能注册成功
```
✅ 非常正确，这样写也是 **可以让 `DefaultFeignConfig` 被注册并生效的**。
但和前面那种「`@FeignClient(configuration = DefaultFeignConfig.class)`」的写法相比，
**作用范围和注册机制不一样**。
我们来完整解释一下 👇

---

## 🧭 一、你现在的写法

```java
@EnableFeignClients(
    basePackages = "com.hmall.api.client",
    defaultConfiguration = DefaultFeignConfig.class
)
@SpringBootApplication
public class UserApplication { ... }
```

表示两件事：

1️⃣ **`basePackages`**
让 Spring 扫描并注册所有 `@FeignClient` 接口，比如：

```java
@FeignClient(name = "item-service")
public interface ItemClient { ... }
```

2️⃣ **`defaultConfiguration`**
为所有这些扫描到的 FeignClient 指定一个“默认配置类”
👉 也就是你这里的 `DefaultFeignConfig`。

---

## ⚙️ 二、Spring 是怎么处理的

启动时，`@EnableFeignClients` 会：

1. 扫描 `com.hmall.api.client` 包下的所有 `@FeignClient`；
2. 把 `defaultConfiguration` 这个类（`DefaultFeignConfig.class`）
   注册为所有被扫描 FeignClient 的默认配置；
3. 给每个 FeignClient 创建一个独立的子 ApplicationContext；
4. 把 `DefaultFeignConfig` 中的 `@Bean` 方法加载进去。

> 因此，即使 `DefaultFeignConfig` 没有 `@Configuration`，
> 也会被 Feign 自动当作配置类加载。

---

## ✅ 三、这两种写法的区别（非常关键）

| 对比点                   | 方式一：`@EnableFeignClients(defaultConfiguration=...)` | 方式二：`@FeignClient(configuration=...)` |
| --------------------- | --------------------------------------------------- | ------------------------------------- |
| 配置作用范围                | ✅ 全局（所有 FeignClient 默认共享）                           | ✅ 局部（只对指定 Client 生效）                  |
| 推荐使用场景                | 所有 Feign 调用都要带上相同逻辑（如统一拦截器、日志级别）                    | 仅单个服务需要特殊逻辑（如特定熔断策略）                  |
| 是否需要 `@Configuration` | ❌ 不需要                                               | ❌ 不需要                                 |
| 是否可被覆盖                | 可以被单个 `@FeignClient(configuration=...)` 覆盖          | 仅对该 Client 生效                         |
| Bean 注册方式             | 在 Feign 全局上下文注册                                     | 在每个 client 独立子容器注册                    |

---

## 🧩 四、举个直观例子

### 方式一：你现在这种（全局默认配置）

```java
@EnableFeignClients(defaultConfiguration = DefaultFeignConfig.class)
public class UserApplication {}
```

* 所有 FeignClient 都会带上：

  * `user-info` 请求头拦截器；
  * Feign 日志级别；
  * 通用 fallback factory。

比如：

```java
@FeignClient(name = "item-service")
@FeignClient(name = "order-service")
```

这两个都能自动用到 `DefaultFeignConfig`。

---

### 方式二：局部配置

```java
@FeignClient(
    name = "item-service",
    configuration = DefaultFeignConfig.class
)
public interface ItemClient {}
```

* 只对 `item-service` 生效；
* 不会影响别的 FeignClient。

---

## ⚙️ 五、两者结合使用时的优先级

如果你两种都写了：

```java
@EnableFeignClients(defaultConfiguration = DefaultFeignConfig.class)
@FeignClient(name = "item-service", configuration = SpecialConfig.class)
```

> **局部配置优先级更高**。
> 即：`SpecialConfig` 会覆盖全局的 `DefaultFeignConfig`。

---

## ✅ 六、总结一句话

> ✅ 你的写法完全可以让 `DefaultFeignConfig` 被注册成功。
> 因为 `@EnableFeignClients(defaultConfiguration=...)` 会自动把它加载为所有 FeignClient 的全局默认配置。
>
> 区别在于：这是一种**全局默认配置**方式，而不是每个 FeignClient 单独配置。
> 所以它更适合放通用拦截器、日志、序列化配置这类“所有服务都要用”的 Bean。

---

是否希望我帮你画一张「Feign 配置加载机制图」：
展示两种方式（`@EnableFeignClients` 全局配置 vs `@FeignClient` 局部配置）的加载流程和优先级？
这张图对面试和框架理解都非常有帮助。
