```java
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class ChatController {

    private final ChatClient chatClient;

    @RequestMapping("/chat")
    public String chat(String prompt) {
        return chatClient.prompt().user(prompt).call().content();
    }

}这里我想调远程deepseek官方的api而不是ollama，怎么改？
```

你现在这套代码 **本身是完全正确的 Spring AI 用法**，只是 **底层 Model 选成了 Ollama**。
要改成 **远程 DeepSeek 官方 API**，思路非常清晰：

> **不改 Controller，不改 ChatClient 用法
> 只换：依赖 + 配置 + 注入的 Model 类型**

下面我按 **“最小改动原则”** 一步一步给你改。

------

# 一句话总览（先给结论）

你现在是：

```text
ChatClient
  └── OllamaChatModel
      └── 本地 http://localhost:11434
```

你要换成：

```text
ChatClient
  └── OpenAiChatModel（兼容 OpenAI API）
      └── https://api.deepseek.com
```

👉 **Controller 一行不用动**

------

# 一、依赖怎么改（最关键）

## ❌ 现在的依赖（要删）

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-ollama</artifactId>
</dependency>
```

------

## ✅ 换成 OpenAI-compatible（DeepSeek 官方就是这个）

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-openai</artifactId>
</dependency>
```

⚠️ **spring-ai-bom 保持不变**（你现在已经是正确的）

------

# 二、application.yml 怎么改（核心）

你现在是：

```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        model: deepseek-r1:7b
```

------

## ✅ 改成 DeepSeek 官方 API

```yaml
spring:
  ai:
    openai:
      api-key: ${DEEPSEEK_API_KEY}
      base-url: https://api.deepseek.com
      chat:
        options:
          model: deepseek-chat
```

### 说明一下这几个字段

| 配置       | 说明                                     |
| ---------- | ---------------------------------------- |
| `base-url` | DeepSeek 官方 OpenAI-compatible endpoint |
| `api-key`  | DeepSeek 官方 Key                        |
| `model`    | `deepseek-chat`（聊天）                  |

> DeepSeek **完全兼容 OpenAI Chat Completions 协议**，Spring AI 直接复用 OpenAI adapter。

------

## ✅ 推荐把 key 放环境变量

```bash
export DEEPSEEK_API_KEY=sk-xxxx
```

或者 IDEA Run Config 里配。

------

# 三、Configuration 类怎么改（非常小）

你现在是：

```java
@Bean
public ChatClient chatClient(OllamaChatModel model) {
    return ChatClient.builder(model).build();
}
```

------

## ✅ 改成 OpenAI Chat Model

```java
import org.springframework.ai.openai.OpenAiChatModel;

@Configuration
public class CommonConfiguration {

    @Bean
    public ChatClient chatClient(OpenAiChatModel model) {
        return ChatClient.builder(model).build();
    }
}
```

👉 **只改参数类型**

Spring 会根据 `spring.ai.openai.*` 自动注入。

------

# 四、Controller 完全不用动（你写得很好）

```java
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class ChatController {

    private final ChatClient chatClient;

    @RequestMapping("/chat")
    public String chat(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}
```

🎯 **这就是 Spring AI 的价值**：

> **Model 可替换，业务层无感**

------

# 五、完整“改动对照表”

| 位置       | Ollama                           | DeepSeek                         |
| ---------- | -------------------------------- | -------------------------------- |
| starter    | `spring-ai-starter-model-ollama` | `spring-ai-starter-model-openai` |
| yml        | `spring.ai.ollama`               | `spring.ai.openai`               |
| model 注入 | `OllamaChatModel`                | `OpenAiChatModel`                |
| base-url   | `localhost:11434`                | `https://api.deepseek.com`       |
| Controller | ❌ 不改                           | ❌ 不改                           |

------

# 六、常见坑（你很可能会遇到）

### 1️⃣ 404 / 401

- base-url 写错
- api-key 没传
- key 没权限

👉 DeepSeek **必须是 `https://api.deepseek.com`**

------

### 2️⃣ model 名字写错

- ✅ `deepseek-chat`
- ❌ `deepseek-r1`
- ❌ `deepseek-r1:7b`（这是 Ollama 的）

------

### 3️⃣ 还连着 Ollama

- 忘删 ollama starter
- Spring 自动注入了两个 ChatModel

👉 **只能留一个 model starter**

------

# 七、如果你想“同时支持 Ollama + DeepSeek”（进阶）

可以做成：

```java
@Bean
@Qualifier("deepseek")
ChatClient deepseek(OpenAiChatModel model) { ... }

@Bean
@Qualifier("ollama")
ChatClient ollama(OllamaChatModel model) { ... }
```

Controller 按需切换。

------

# 八、你现在这套架构的评价（实话）

你现在已经做到：

- ✅ 正确使用 Spring AI
- ✅ ChatClient 抽象层
- ✅ Model 可插拔
- ✅ 配置驱动

👉 **这是“中高级 Java 后端 + AI 工程”的标准姿势**

------

## 下一步你可以继续做的（我可以带你）

- 🔥 DeepSeek **流式输出（SSE / WebFlux）**
- 🔥 多模型路由（Ollama / DeepSeek / OpenAI）
- 🔥 聊天记忆（ChatMemory）
- 🔥 RAG（向量库 + DeepSeek）

你选一个，我直接给你**可跑代码**。