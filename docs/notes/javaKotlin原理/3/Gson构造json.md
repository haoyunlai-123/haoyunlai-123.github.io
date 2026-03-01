如何用Gson工具构建一个json数据，类似fast json 的JSONObject()方式

非常好的问题 👏——你已经注意到 Gson 和 Fastjson 在“构造 JSON 对象”时风格不同。
 我们来一步步讲清楚：如何用 **Gson** 实现类似 Fastjson `JSONObject()` 那种“链式构建 JSON” 的效果。

------

## ✅ 一、Fastjson 的常见写法

在 Fastjson 中你可以这样：

```java
JSONObject obj = new JSONObject();
obj.put("name", "Tom");
obj.put("age", 18);
obj.put("address", "Beijing");
System.out.println(obj.toJSONString());
```

输出：

```json
{"name":"Tom","age":18,"address":"Beijing"}
```

------

## ✅ 二、在 Gson 中的等价方式

Gson 没有 `JSONObject` 这种类，但提供了 **`JsonObject`**，功能几乎一模一样。

### ✔ 示例：

```java
import com.google.gson.JsonObject;

public class GsonBuildExample {
    public static void main(String[] args) {
        JsonObject obj = new JsonObject();
        obj.addProperty("name", "Tom");
        obj.addProperty("age", 18);
        obj.addProperty("address", "Beijing");

        System.out.println(obj.toString());
    }
}
```

输出：

```json
{"name":"Tom","age":18,"address":"Beijing"}
```

------

## 🧩 三、嵌套结构（类似 Fastjson 嵌套 JSONObject）

```java
JsonObject root = new JsonObject();

JsonObject user = new JsonObject();
user.addProperty("id", 1001);
user.addProperty("name", "Alice");

root.add("user", user);
root.addProperty("status", "ok");

System.out.println(root.toString());
```

输出：

```json
{
  "user": {"id":1001, "name":"Alice"},
  "status": "ok"
}
```

------

## ⚙️ 四、添加数组（类似 Fastjson JSONArray）

使用 `JsonArray`：

```java
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

JsonArray arr = new JsonArray();
arr.add("Java");
arr.add("Go");
arr.add("Python");

JsonObject obj = new JsonObject();
obj.add("languages", arr);

System.out.println(obj.toString());
```

输出：

```json
{"languages":["Java","Go","Python"]}
```

------

## 🧠 五、要从 Java 对象直接生成 JSON 字符串

用 `Gson` 本体（`Gson gson = new Gson()`）：

```java
import com.google.gson.Gson;

public class User {
    String name;
    int age;
}

public class Main {
    public static void main(String[] args) {
        User u = new User();
        u.name = "Tom";
        u.age = 18;

        Gson gson = new Gson();
        String json = gson.toJson(u);
        System.out.println(json);
    }
}
```

输出：

```json
{"name":"Tom","age":18}
```

------

## 📘 六、总结对比表

| 功能             | Fastjson                          | Gson                              |
| ---------------- | --------------------------------- | --------------------------------- |
| 构造空对象       | `new JSONObject()`                | `new JsonObject()`                |
| 添加属性         | `put(key, value)`                 | `addProperty(key, value)`         |
| 嵌套对象         | `put(key, new JSONObject())`      | `add(key, new JsonObject())`      |
| 添加数组         | `JSONArray arr = new JSONArray()` | `JsonArray arr = new JsonArray()` |
| 输出 JSON 字符串 | `obj.toJSONString()`              | `obj.toString()`                  |

------

## ✅ 七、额外：Gson 链式写法（自己封装）

如果你想模仿 Fastjson 的链式写法，可以自己封装一个小工具类：

```java
import com.google.gson.JsonObject;

public class JsonBuilder {
    private final JsonObject obj = new JsonObject();

    public JsonBuilder put(String key, String value) {
        obj.addProperty(key, value);
        return this;
    }

    public JsonBuilder put(String key, Number value) {
        obj.addProperty(key, value);
        return this;
    }

    public JsonBuilder put(String key, Boolean value) {
        obj.addProperty(key, value);
        return this;
    }

    public JsonObject build() {
        return obj;
    }
}
```

使用：

```java
JsonObject json = new JsonBuilder()
    .put("name", "Tom")
    .put("age", 20)
    .put("vip", true)
    .build();

System.out.println(json);
```

输出：

```json
{"name":"Tom","age":20,"vip":true}
```

------

✅ **总结一句话：**

> 在 Gson 中，用 `JsonObject` + `addProperty()` 就能完全实现 Fastjson 的 `JSONObject.put()` 功能；
>  如果喜欢链式语法，可以自己写一个小 Builder 封装。

------

是否希望我帮你写一个更通用的 Gson JSON 构建工具类（支持嵌套、数组、链式写法）？
 就像 `JSONObject` 那样可快速拼复杂 JSON。
 <div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

 Gson和Fastjson推荐使用哪个？企业一般用哪个多
 非常好的问题 👍 ——这其实是很多后端开发面试中也经常问到的一个点：

> **“Gson、Fastjson、Jackson 该怎么选？企业一般用哪个？”**

下面我给你一个**对比 + 实战推荐表**，并说明为什么企业主流更倾向哪一个。

---

## 🧩 一、三者定位概览

| 序号 | JSON 库                   | 开发方                    | 特点              | 当前主流度              |
| -- | ------------------------ | ---------------------- | --------------- | ------------------ |
| 1  | **Jackson**              | FasterXML（Spring 官方推荐） | 功能最全、兼容性最好      | ⭐⭐⭐⭐⭐（最主流）         |
| 2  | **Gson**                 | Google 出品              | 简单易用，轻量，稳定      | ⭐⭐⭐（适合工具类/Android） |
| 3  | **Fastjson / Fastjson2** | 阿里巴巴                   | 性能高，国内流行，但有安全争议 | ⭐⭐（国内项目仍不少）        |

---

## 🧠 二、Gson 与 Fastjson 深度对比

| 对比维度                | **Gson**        | **Fastjson（含 Fastjson2）**             |
| ------------------- | --------------- | ------------------------------------- |
| 📦 出品方              | Google 官方维护     | 阿里巴巴                                  |
| ⚙️ 依赖体积             | 较小（≈300 KB）     | 较大（≈1MB+）                             |
| 🧩 功能特点             | 简洁、线程安全、稳定      | 功能丰富、性能强、支持更多特性                       |
| 💣 安全性              | 安全、几乎无漏洞        | Fastjson1 历史上有多次反序列化漏洞（Fastjson2 已改善） |
| 🧠 泛型支持             | 一般（需 TypeToken） | 较完善                                   |
| ⏱️ 性能               | 中等              | 更快（尤其在大 JSON 下）                       |
| 🔧 配置灵活性            | 较弱（定制需手动封装）     | 很强（支持全局序列化规则、日期格式等）                   |
| 🔐 反序列化安全           | 默认安全            | Fastjson1 需要 `safeMode` 配置防攻击         |
| 🌍 国际使用度            | 高（Android、工具类库） | 主要在中国后端项目中                            |
| 🧱 与 Spring Boot 集成 | 一般（需手动配置）       | 一般（需改默认 Converter）                    |

---

## 🏢 三、企业项目中实际使用情况（2025年趋势）

| 场景                          | 主流选择                             | 原因                              |
| --------------------------- | -------------------------------- | ------------------------------- |
| **Spring Boot / Java 后端服务** | ✅ **Jackson**                    | Spring Boot 默认依赖 Jackson，直接用即可。 |
| **Android 开发**              | ✅ **Gson**                       | Gson 是 Android SDK 自带库，轻量、无依赖。  |
| **国内互联网旧项目**                | ✅ **Fastjson**（或迁移至 Fastjson2）   | 老代码积累多，性能好，用习惯了。                |
| **新项目（中大型）**                | ✅ **Jackson > Gson > Fastjson2** | Jackson 功能最完备、最安全、最通用。          |

---

## 🧩 四、实际企业习惯总结

| 公司类型                           | 通常选用                     |
| ------------------------------ | ------------------------ |
| Spring Boot / Spring Cloud 微服务 | **Jackson（默认）**          |
| Android 客户端                    | **Gson**                 |
| 阿里系 / 国内传统项目                   | **Fastjson / Fastjson2** |
| 外企 / 国际团队                      | **Jackson 或 Gson**       |

---

## ✅ 五、推荐结论

| 使用场景                         | 推荐                                 |
| ---------------------------- | ---------------------------------- |
| 你做 **后端接口 / Web 服务**         | 💡 **Jackson** （推荐，Spring Boot 默认） |
| 你做 **独立 Java 工具类、Android**   | 💡 **Gson**                        |
| 你需要 **极致性能、兼容 Fastjson 老项目** | ⚠️ **Fastjson2（仅新版本）**             |

---

## 📘 六、实际建议（结合你当前情况）

你当前是写 **Spring Boot 后端项目**，而且已经在用 `MappingJackson2HttpMessageConverter`。
所以推荐：

> 👉 **保持使用 Jackson**，
> Gson 用于偶尔自己拼 JSON、解析简单字符串即可。
> Fastjson 不建议作为主库使用（除非对接老项目或已有依赖）。

---

## ✅ 七、总结一句话：

> * **Jackson** → 企业后端主流、Spring 官方标准。
> * **Gson** → 简洁安全、适合工具类和 Android。
> * **Fastjson / Fastjson2** → 高性能但有历史包袱，国内项目多，国际少。

---

💡 **推荐搭配方案：**

```java
// 后端全局配置用 Jackson（默认）
// 工具类内部偶尔快速拼 JSON 时用 Gson
Gson gson = new Gson();
String json = gson.toJson(Map.of("name", "Tom", "age", 20));
```

---

如果你愿意，我可以帮你写一份
👉「Jackson vs Gson vs Fastjson 实测性能对比代码（含三者序列化/反序列化同一对象）」
方便你亲自跑一遍 benchmark，看区别。是否要我帮你写这份测试？

<div style="height:10px; background:linear-gradient(to right, #ff6a00, #ee0979, #00c6ff); border:none;"></div>

JSONObject jsonObject = JSON.parseObject(json);
        String openid = jsonObject.getString("openid");这个代码Gson有相应实现吗？

非常好的问题 👍——这正是很多人从 **Fastjson → Gson** 迁移时最常遇到的地方。

你提到的这段 Fastjson 代码：

```java
JSONObject jsonObject = JSON.parseObject(json);
String openid = jsonObject.getString("openid");
```

👉 在 Gson 里是完全能做到的，只不过 API 名称不同。
 我们来一步步对照讲清楚。

------

## ✅ 一、Fastjson 的逻辑回顾

Fastjson 的 `JSON.parseObject(json)`：

- 把 JSON 字符串解析成一个通用的 `JSONObject`；
- 这个对象内部本质是一个 `Map<String, Object>`；
- 然后可以用 `getString()`、`getInteger()` 等方法取字段值。

------

## ✅ 二、Gson 的等价实现方式

### ✔ 方式一：使用 Gson 的 `JsonParser` + `JsonObject`

```java
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

String json = "{\"openid\":\"abc123\", \"nickname\":\"小明\"}";

// 解析 JSON 字符串为 JsonObject
JsonObject jsonObject = JsonParser.parseString(json).getAsJsonObject();

// 获取字段
String openid = jsonObject.get("openid").getAsString();
String nickname = jsonObject.get("nickname").getAsString();

System.out.println(openid);   // abc123
System.out.println(nickname); // 小明
```

✅ 这就是 **Gson 版本的完全等价写法**。

------

### 🔍 对照表

| 功能         | Fastjson                           | Gson                                   |
| ------------ | ---------------------------------- | -------------------------------------- |
| 解析字符串   | `JSON.parseObject(json)`           | `JsonParser.parseString(json)`         |
| 获取字段     | `jsonObject.getString("key")`      | `jsonObject.get("key").getAsString()`  |
| 获取数字     | `jsonObject.getInteger("key")`     | `jsonObject.get("key").getAsInt()`     |
| 获取布尔     | `jsonObject.getBoolean("key")`     | `jsonObject.get("key").getAsBoolean()` |
| 获取嵌套对象 | `jsonObject.getJSONObject("user")` | `jsonObject.getAsJsonObject("user")`   |
| 获取数组     | `jsonObject.getJSONArray("list")`  | `jsonObject.getAsJsonArray("list")`    |

------

### ✔ 方式二：直接反序列化为 Java 对象（推荐）

如果你知道 JSON 对应的结构，可以用 `Gson` 自动映射到类上：

```java
class User {
    String openid;
    String nickname;
}

String json = "{\"openid\":\"abc123\", \"nickname\":\"小明\"}";
User user = new Gson().fromJson(json, User.class);
System.out.println(user.openid); // abc123
```

这种方式比“手动取字段”更安全、更方便。

------

### ✔ 方式三：解析成通用 `Map`

如果你更喜欢用 Map 方式：

```java
import com.google.gson.reflect.TypeToken;
import java.util.Map;

String json = "{\"openid\":\"abc123\", \"nickname\":\"小明\"}";
Map<String, Object> map = new Gson().fromJson(json, new TypeToken<Map<String, Object>>(){}.getType());

System.out.println(map.get("openid"));  // abc123
```

------

## 🧩 三、总结

| 用途               | Fastjson 写法                        | Gson 写法                                                    |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| 通用 JSON 对象解析 | `JSON.parseObject(json)`             | `JsonParser.parseString(json).getAsJsonObject()`             |
| 获取字符串字段     | `obj.getString("key")`               | `obj.get("key").getAsString()`                               |
| 获取整数字段       | `obj.getInteger("key")`              | `obj.get("key").getAsInt()`                                  |
| 解析成类           | `JSON.parseObject(json, User.class)` | `new Gson().fromJson(json, User.class)`                      |
| 解析成 Map         | `JSON.parseObject(json, Map.class)`  | `new Gson().fromJson(json, new TypeToken<Map<String,Object>>(){}.getType())` |

------

✅ **推荐使用：**

```java
JsonObject obj = JsonParser.parseString(json).getAsJsonObject();
String openid = obj.get("openid").getAsString();
```

------

如果你想要，我可以帮你写一个 **GsonUtils 工具类**，封装成 Fastjson 一样的风格：

```java
GsonUtils.parseObject(json).getString("openid");
```

这样迁移旧代码几乎不用改。是否希望我帮你写这一版？
