`String.replace()` 是 Java 中用于字符串替换的核心方法，主要功能如下：

### 方法签名
1. **替换字符**  
   ```java
   String replace(char oldChar, char newChar)
   ```
   - 将字符串中**所有** `oldChar` 替换为 `newChar`，区分大小写  
   - 示例：  
     ```java
     "hello".replace('l', 'p')  // 返回 "heppo"
     ```

2. **替换字符序列**  
   ```java
   String replace(CharSequence target, CharSequence replacement)
   ```
   - 将字符串中**所有** `target` 子串替换为 `replacement`（支持字符串、StringBuilder等）  
   - 示例：  
     ```java
     "Java is cool".replace("cool", "awesome")  // 返回 "Java is awesome"
     ```

### 关键特性
- **不修改原字符串**：返回新字符串（字符串不可变性）  
- **全量替换**：所有匹配项都会被替换，若未找到匹配则返回原字符串  
- **正则无关**：与 `replaceAll()` 不同，此方法**不解析正则表达式**，直接按字面值匹配  

### 对比其他方法
| 方法             | 是否支持正则 | 替换范围       |
| ---------------- | ------------ | -------------- |
| `replace()`      | ❌            | 所有匹配项     |
| `replaceAll()`   | ✅            | 所有正则匹配项 |
| `replaceFirst()` | ✅            | 首个正则匹配项 |

### 使用场景
- 简单字符/字符串替换（如过滤敏感词）  
- 需精确字面替换时（避免正则元字符干扰）  

示例：  
```java
String text = "a+b=c";
text = text.replace("+", " plus ");  // 结果："a plus b=c"
```