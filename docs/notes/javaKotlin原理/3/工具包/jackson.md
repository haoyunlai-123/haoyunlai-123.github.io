介绍下jackson的用法，基本用法就行

Jackson = **"对象 ↔ JSON 字符串"** 的标杆库，核心类只有 1 个：`ObjectMapper`。  
记住 **4 个 one-liner**，就能覆盖 90% 日常用法。

------------------------------------------------
1. 引入（Spring Boot 已自带）
```xml
<!-- Spring Boot Starter Web 已包含，无需额外引入 -->
```

------------------------------------------------
2. 核心对象（单例即可）
```java
private static final ObjectMapper MAPPER = new ObjectMapper();
```

------------------------------------------------
3. 4 个常用 one-liner
| 方向                   | 代码                                                         | 说明                       |
| ---------------------- | ------------------------------------------------------------ | -------------------------- |
| **对象 → JSON 字符串** | `String json = MAPPER.writeValueAsString(obj);`              | 任意对象、List、Map 直接转 |
| **JSON 字符串 → 对象** | `T t = MAPPER.readValue(json, T.class);`                     | 普通类、List、Map 均可     |
| **JSON 字符串 → List** | `List<T> list = MAPPER.readValue(json, new TypeReference<List<T>>() {});` | 解决泛型擦除               |
| **JSON 字符串 → Map**  | `Map<String, Object> map = MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});` | 动态结构                   |

------------------------------------------------
4. 一行配置（可选）
```java
MAPPER.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS); // 日期转字符串
MAPPER.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE); // 下划线命名
```

------------------------------------------------
5. 完整 mini 例子
```java
String json = MAPPER.writeValueAsString(user);        // User → JSON
User user = MAPPER.readValue(json, User.class);       // JSON → User
List<User> list = MAPPER.readValue(jsonArray, new TypeReference<List<User>>() {});
```

------------------------------------------------
一句话背走
> **Jackson = `ObjectMapper`；**  
> **`writeValueAsString` 转 JSON，`readValue` + `TypeReference` 转对象/List/Map；**  
> **其余配置按需加，日常 4 行就够。**