完整地介绍下hutool工具包的用法

非常好 👍，你问到的 **Hutool** 确实是 Java 后端开发中非常实用、但学习成本极低的工具库之一。
和 MyBatis-Plus 这种“框架封装”不同，Hutool 完全是 **“轻量级工具集”** ——
它的定位更像 **Java 的瑞士军刀**，不依赖 Spring、可以单独使用，
目标是：**让 Java 写业务时告别繁琐的样板代码**。

我来给你一个完整而系统的介绍（含使用示例 + 场景分类），让你一次性掌握 Hutool 的精髓。

---

# 🧭 一、Hutool 是什么？

**官网定义：**

> A set of tools that keep Java sweet.

简单讲：

> 它就是 Java 的 Python `utils`。

它封装了 Java SE 常用功能的便捷用法 —— 文件、日期、字符串、反射、IO、加密、HTTP、Excel、JSON、缓存、验证码、Bean 拷贝、正则、二维码……
**不依赖外部框架**，引入一个 jar 就能用。

---

# ⚙️ 二、快速入门

### 📦 Maven 依赖

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.26</version> <!-- 最新版本可查官网 -->
</dependency>
```

或者只引入你需要的模块（推荐生产环境）：

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-core</artifactId>
    <version>5.8.26</version>
</dependency>
```

---

# 🧰 三、核心模块与常用场景

Hutool 有 20 多个模块，但常用的就 10 个左右。
下面按实际开发用途给你划分。

---

## 1️⃣ 字符串与集合工具 — `StrUtil`, `CollUtil`

**用途**：更优雅地处理 String、List、Map。

```java
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.collection.CollUtil;

public class Demo {
    public static void main(String[] args) {
        // 字符串操作
        String s = " hello world ";
        System.out.println(StrUtil.trim(s));          // 去除首尾空格
        System.out.println(StrUtil.upperFirst("user"));// 首字母大写
        System.out.println(StrUtil.isBlank("  "));     // true

        // 集合操作
        List<String> list = CollUtil.newArrayList("a", "b", "c");
        System.out.println(CollUtil.join(list, ",")); // a,b,c
        System.out.println(CollUtil.isEmpty(list));   // false
    }
}
```

> ✅ 优点：比 Apache Commons Lang 更轻巧、命名更直观。

---

## 2️⃣ 时间与日期工具 — `DateUtil`, `DateTime`, `LocalDateTimeUtil`

**用途**：格式化、偏移、计算、解析。

```java
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.date.DateTime;

public class Demo {
    public static void main(String[] args) {
        DateTime now = DateUtil.date();
        System.out.println(now); // 当前时间

        System.out.println(DateUtil.format(now, "yyyy-MM-dd HH:mm:ss"));
        System.out.println(DateUtil.offsetDay(now, -1)); // 前一天
        System.out.println(DateUtil.betweenDay(DateUtil.parse("2025-01-01"), now, true));
    }
}
```

> ✅ 比 JDK 自带的 `Calendar`、`SimpleDateFormat` 简洁 10 倍。

---

## 3️⃣ 文件与 IO — `FileUtil`, `IoUtil`

```java
import cn.hutool.core.io.FileUtil;
import java.io.File;
import java.util.List;

public class Demo {
    public static void main(String[] args) {
        File file = FileUtil.file("test.txt");
        FileUtil.writeUtf8String("Hello Hutool!", file);
        List<String> lines = FileUtil.readUtf8Lines(file);
        System.out.println(lines);
    }
}
```

> ✅ 简化了读写文件、复制、遍历、临时文件等操作。

---

## 4️⃣ JSON 工具 — `JSONUtil`

```java
import cn.hutool.json.JSONUtil;
import cn.hutool.json.JSONObject;

public class Demo {
    public static void main(String[] args) {
        String jsonStr = "{\"name\":\"Tom\", \"age\":18}";
        JSONObject json = JSONUtil.parseObj(jsonStr);
        System.out.println(json.getStr("name")); // Tom
        System.out.println(JSONUtil.toJsonStr(json)); // 序列化
    }
}
```

> ✅ 轻量级，不依赖 Jackson/Gson。适合快速处理小 JSON。

---

## 5️⃣ HTTP 客户端 — `HttpUtil`, `HttpRequest`

```java
import cn.hutool.http.HttpUtil;
import cn.hutool.http.HttpRequest;

public class Demo {
    public static void main(String[] args) {
        // GET 请求
        String res = HttpUtil.get("https://api.github.com");
        System.out.println(res);

        // POST 请求
        String result = HttpRequest.post("https://example.com/api")
                .form("name", "Tom")
                .timeout(2000)
                .execute()
                .body();
        System.out.println(result);
    }
}
```

> ✅ 非常适合写脚本、测试接口、爬虫。
> ⚠️ 若要生产级 HTTP 客户端，请用 OkHttp 或 WebClient。

---

## 6️⃣ Bean 工具 — `BeanUtil`

对象拷贝、Map 转对象。

```java
import cn.hutool.core.bean.BeanUtil;
import java.util.HashMap;
import java.util.Map;

class User {
    public String name;
    public int age;
}

public class Demo {
    public static void main(String[] args) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "Tom");
        map.put("age", 20);

        User user = BeanUtil.toBean(map, User.class);
        System.out.println(user.name + " " + user.age);
    }
}
```

> ✅ 比 Apache BeanUtils 快得多且线程安全。

---

## 7️⃣ 反射与 Class 工具 — `ReflectUtil`, `ClassUtil`

```java
import cn.hutool.core.util.ReflectUtil;

public class Demo {
    public static void main(String[] args) {
        // 反射创建对象
        Object obj = ReflectUtil.newInstance("java.lang.StringBuilder");
        ReflectUtil.invoke(obj, "append", "Hello");
        System.out.println(obj);
    }
}
```

---

## 8️⃣ 加密与安全 — `SecureUtil`, `DigestUtil`

```java
import cn.hutool.crypto.SecureUtil;

public class Demo {
    public static void main(String[] args) {
        String md5 = SecureUtil.md5("123456");
        System.out.println(md5); // e10adc3949ba59abbe56e057f20f883e
    }
}
```

> ✅ 支持 MD5、SHA、AES、RSA、DES、Base64、HMAC 等。

---

## 9️⃣ Excel 工具 — `ExcelUtil`, `ExcelReader`, `ExcelWriter`

```java
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import java.util.*;

public class Demo {
    public static void main(String[] args) {
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Object> row = new HashMap<>();
        row.put("姓名", "Tom");
        row.put("年龄", 18);
        rows.add(row);

        ExcelWriter writer = ExcelUtil.getWriter("test.xlsx");
        writer.write(rows, true);
        writer.close();
    }
}
```

> ✅ 轻量导出 Excel，非常适合管理后台导入导出功能。

---

## 🔟 其他实用模块（知道即可）

| 模块          | 作用                     |
| ------------- | ------------------------ |
| `CaptchaUtil` | 验证码生成               |
| `CacheUtil`   | 简易内存缓存             |
| `QrCodeUtil`  | 二维码生成               |
| `ScriptUtil`  | 执行 JS、Groovy 脚本     |
| `SystemUtil`  | 获取系统信息             |
| `Validator`   | 校验手机号、邮箱、身份证 |
| `ZipUtil`     | 压缩解压 zip             |

---

# 💡 四、和其他库的对比

| 功能     | Hutool                     | Apache Commons | Guava              |
| -------- | -------------------------- | -------------- | ------------------ |
| 工具种类 | 全面（含 HTTP/Excel/JSON） | 多但分散       | 核心集合/缓存      |
| 学习成本 | 低，中文文档好             | 英文文档多     | 英文多，偏算法化   |
| 适用场景 | 通用工具脚本、后台服务     | 老项目兼容     | 高性能集合、流处理 |
| 封装风格 | “够用即止”                 | 接口化复杂     | 偏底层功能性       |

> ✅ 建议：一般项目只引入 Hutool 就够了。

---

# 🧠 五、实际使用建议

| 目标                | 建议                                        |
| ------------------- | ------------------------------------------- |
| 快速原型 / 内部工具 | ✅ 强烈推荐 Hutool                           |
| 企业级项目          | ✅ 可用 Hutool 核心模块（core/json/date/io） |
| 底层框架 / SDK      | ⚠️ 谨慎引入（避免依赖外部工具库）            |
| 和 Spring 项目结合  | ✅ 完美兼容（无需额外配置）                  |

---

# 📘 六、最佳实践模板

常见的 import 模板：

```java
import cn.hutool.core.util.StrUtil;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONUtil;
import cn.hutool.http.HttpUtil;
import cn.hutool.crypto.SecureUtil;
```

只需这些类，你就能覆盖 80% 的日常小工具需求。

---

# 🧭 七、总结

| 优点                             | 缺点                          |
| -------------------------------- | ----------------------------- |
| 轻量、无依赖、中文文档优秀       | 不适合极端性能场景            |
| API 命名直观                     | 某些模块封装较浅（例如 HTTP） |
| 功能覆盖广                       | 版本更新快、偶有变动          |
| 特别适合中小项目、测试、运维脚本 | 不建议做底层依赖              |

---

📚 **一句话总结：**

> Hutool 是 “让你少写工具类”的工具库。
> 学一次、能用三年，零门槛高收益。

---

是否希望我接着帮你整理一份
👉「Hutool 最常用模块速查表 + 典型场景对照（含推荐导入类）」
像开发者小抄一样一页能记住全部？