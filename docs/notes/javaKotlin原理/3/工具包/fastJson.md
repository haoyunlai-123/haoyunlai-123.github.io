完整地介绍下fastJson的用法

非常好 👍，你问的 **FastJSON** 是国内最常用的 JSON 库之一，长期在后端开发中非常流行（尤其在 Spring Boot、微服务、工具脚本中）。

不过值得注意的是：

> 🔸 FastJSON 目前分为两个版本线：
>
> * `fastjson 1.x`（老版本，仍广泛使用，但有安全漏洞历史）
> * `fastjson2`（官方推荐使用的新版本，性能更高、更安全、兼容 Gson/Jackson 接口）

下面我会从 **“原理 + 快速上手 + 常用功能 + 高级技巧 + 与 fastjson2 区别”** 五个方面完整讲透它，让你一次彻底搞懂。

---

# 🧭 一、FastJSON 是什么？

FastJSON 是由阿里巴巴开源的 **高性能 JSON 处理库**，提供：

* JSON 字符串 ↔ Java 对象 的双向序列化；
* 支持复杂泛型、集合、日期、Map、循环引用；
* 性能优于 Gson、Jackson（在大多数场景下）；
* 简洁易用，API 直观（如 `JSON.toJSONString()`、`JSON.parseObject()`）。

---

# ⚙️ 二、引入依赖

## ✅ FastJSON 2（推荐）

```xml
<dependency>
    <groupId>com.alibaba.fastjson2</groupId>
    <artifactId>fastjson2</artifactId>
    <version>2.0.48</version>
</dependency>
```

## ⛔ FastJSON 1.x（旧项目兼容）

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.83</version>
</dependency>
```

> 建议：新项目一定用 **fastjson2**。

---

# 🚀 三、快速上手（核心 API）

```java
import com.alibaba.fastjson2.JSON;
import java.util.*;

class User {
    public String name;
    public int age;
}

public class Demo {
    public static void main(String[] args) {
        User user = new User();
        user.name = "Tom";
        user.age = 18;

        // 对象转 JSON 字符串
        String json = JSON.toJSONString(user);
        System.out.println(json); // {"age":18,"name":"Tom"}

        // JSON 字符串转对象
        User user2 = JSON.parseObject(json, User.class);
        System.out.println(user2.name); // Tom
    }
}
```

✅ FastJSON 的核心思想：

> 一切 JSON 转换都围绕 `JSON` 类的静态方法完成。

---

# 🧩 四、常用功能详解

## 1️⃣ List / Map / 泛型解析

```java
String jsonArr = "[{\"name\":\"Tom\"},{\"name\":\"Jerry\"}]";
List<User> list = JSON.parseArray(jsonArr, User.class);

String jsonMap = "{\"id\":1,\"name\":\"Book\"}";
Map<String, Object> map = JSON.parseObject(jsonMap);
System.out.println(map.get("name")); // Book
```

> FastJSON 会自动识别集合类型。

---

## 2️⃣ 格式化输出 & 禁用循环引用

```java
String pretty = JSON.toJSONString(user, JSONWriter.Feature.PrettyFormat);
System.out.println(pretty);
```

输出：

```json
{
    "age": 18,
    "name": "Tom"
}
```

循环引用问题（防止对象互相引用造成 StackOverflow）：

```java
JSON.toJSONString(obj, JSONWriter.Feature.DisableCircularReferenceDetect);
```

---

## 3️⃣ 日期处理

```java
import java.util.Date;
class Event { public Date time; }

Event e = new Event();
e.time = new Date();
String json = JSON.toJSONString(e);
System.out.println(json); // {"time":"2025-10-29 22:40:01"}
```

> FastJSON 会自动格式化为标准字符串，可自定义格式：

```java
JSON.toJSONString(e, "yyyy/MM/dd HH:mm");
```

---

## 4️⃣ JSON 对象操作（不定义类也能用）

```java
import com.alibaba.fastjson2.JSONObject;
import com.alibaba.fastjson2.JSONArray;

JSONObject obj = new JSONObject();
obj.put("name", "Tom");
obj.put("age", 18);
System.out.println(obj.getString("name"));

JSONArray arr = new JSONArray();
arr.add("Java");
arr.add("Go");
System.out.println(arr.get(0));
```

> ✅ 这非常适合动态 JSON、工具脚本或后端中间层处理。

---

## 5️⃣ 嵌套与泛型反序列化

```java
import com.alibaba.fastjson2.TypeReference;

String json = "{\"data\":[{\"name\":\"Tom\"}]}";

Map<String, List<User>> map = JSON.parseObject(
    json, new TypeReference<Map<String, List<User>>>() {}
);
System.out.println(map.get("data").get(0).name); // Tom
```

> ✅ `TypeReference<T>` 是处理复杂嵌套泛型的关键。

---

## 6️⃣ Bean ↔ Map 相互转换

```java
Map<String, Object> map = JSON.parseObject(JSON.toJSONString(user));
System.out.println(map);

User user3 = JSON.parseObject(JSON.toJSONString(map), User.class);
```

---

## 7️⃣ 忽略字段、字段名重命名

```java
import com.alibaba.fastjson2.annotation.JSONField;

class User {
    @JSONField(name = "user_name")
    public String name;

    @JSONField(serialize = false)
    public int age;
}

User user = new User();
user.name = "Tom";
user.age = 18;

System.out.println(JSON.toJSONString(user)); // {"user_name":"Tom"}
```

---

## 8️⃣ 解析 JSON 数组 / 对象 混合内容

```java
String text = "[{\"id\":1},{\"id\":2}]";
JSONArray array = JSON.parseArray(text);
for (Object o : array) {
    JSONObject obj = (JSONObject) o;
    System.out.println(obj.getIntValue("id"));
}
```

---

## 9️⃣ 流式解析（fastjson2 新特性）

```java
import com.alibaba.fastjson2.JSONReader;
import java.io.StringReader;

String json = "[1,2,3,4,5]";
try (JSONReader reader = JSONReader.of(new StringReader(json))) {
    reader.startArray();
    while (reader.hasNext()) {
        System.out.println(reader.readInt32());
    }
    reader.endArray();
}
```

> ✅ 适合大文件场景，避免一次性加载整个 JSON。

---

## 🔟 反序列化控制（安全性）

FastJSON1 曾出现“AutoType漏洞”，FastJSON2 默认关闭自动类型加载，更安全。

若你确实需要反序列化成特定类：

```java
User user = JSON.parseObject(json, User.class, JSONReader.Feature.SupportAutoType);
```

> ⚠️ 不要在不可信输入中开启 `AutoType`，防止远程代码执行漏洞。

---

# 🧠 五、高级用法与技巧

| 需求                       | 用法                                                   |
| -------------------------- | ------------------------------------------------------ |
| 自定义序列化顺序           | `@JSONType(orders={"id","name"})`                      |
| 序列化 BigDecimal 精度控制 | `@JSONField(format="0.00")`                            |
| null 值处理                | `JSONWriter.Feature.WriteNullStringAsEmpty`            |
| 转义 HTML 特殊字符         | `JSONWriter.Feature.BrowserCompatible`                 |
| 全局日期格式               | `JSON.config(JSONReader.Feature.UseDefaultDateFormat)` |

---

# 📊 六、性能对比（FastJSON2 vs 其他）

| 库         | 性能（解析） | 性能（序列化） | 特点                      |
| ---------- | ------------ | -------------- | ------------------------- |
| FastJSON 2 | 🥇 极快       | 🥇 极快         | 新设计、零拷贝、兼容 Gson |
| Gson       | 中等         | 中等           | 安全、稳定                |
| Jackson    | 稍慢         | 稍慢           | 特性最全，企业常用        |
| FastJSON 1 | 快但漏洞多   | 快             | 不建议新项目使用          |

---

# 🧩 七、fastjson1 与 fastjson2 区别

| 对比项 | fastjson1              | fastjson2                        |
| ------ | ---------------------- | -------------------------------- |
| 包路径 | `com.alibaba.fastjson` | `com.alibaba.fastjson2`          |
| 性能   | 较高                   | 更高（零拷贝、SIMD 加速）        |
| 安全   | 有 AutoType 漏洞       | 默认关闭，安全得多               |
| 功能   | 丰富                   | 兼容 Gson API，支持 JSONB 二进制 |
| 推荐度 | ⚠️ 仅用于旧项目         | ✅ 新项目推荐使用                 |

---

# 💡 八、实践建议

| 场景                      | 建议                              |
| ------------------------- | --------------------------------- |
| 快速脚本、小工具          | ✅ FastJSON2                       |
| Web 后端（中后台系统）    | ✅ 可用（轻便）                    |
| 大型企业系统 / 微服务网关 | ⚠️ Jackson 更稳（Spring 默认支持） |
| 安全敏感系统              | ✅ 仅 fastjson2（不要 fastjson1）  |

---

# 📘 九、典型用法速查表

| 功能             | 示例                                                |
| ---------------- | --------------------------------------------------- |
| Java → JSON      | `JSON.toJSONString(obj)`                            |
| JSON → Java      | `JSON.parseObject(str, User.class)`                 |
| JSON 数组 → List | `JSON.parseArray(str, User.class)`                  |
| 格式化输出       | `JSON.toJSONString(obj, PrettyFormat)`              |
| Map ↔ Bean       | `BeanUtil.toBean(map, User.class)` / `JSON.to(Map)` |
| 忽略字段         | `@JSONField(serialize = false)`                     |
| 字段别名         | `@JSONField(name = "user_name")`                    |
| 泛型反序列化     | `new TypeReference<List<User>>() {}`                |

---

# 🧩 十、总结

| 优点                         | 缺点                     |
| ---------------------------- | ------------------------ |
| 极高性能（尤其是 fastjson2） | fastjson1 历史安全问题   |
| API 简洁易用                 | 生态不如 Jackson 丰富    |
| 轻量级、零依赖               | 与 Spring 的默认集成较弱 |
| 支持复杂泛型与序列化控制     | 某些序列化特性不够细粒度 |

---

📚 **一句话总结：**

> FastJSON 是最方便的 Java JSON 库之一，
> 新项目建议直接上 `fastjson2`，
> 掌握 `JSON.toJSONString()` 与 `JSON.parseObject()` 这两大核心方法就能覆盖 90% 场景。

---

是否希望我接着帮你出一份
👉「FastJSON2 与 Jackson / Gson 对比学习表 + 典型场景选型建议（如：Web返回值、RPC序列化、配置解析）」？
那会更系统地帮你选哪种库用于不同项目。