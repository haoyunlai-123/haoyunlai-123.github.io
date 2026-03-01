```
@ApiOperation("用户登录接口")
@PostMapping("login")
public UserLoginVO login(@RequestBody @Validated LoginFormDTO loginFormDTO){
    return userService.login(loginFormDTO);
}
```

`@Validated` 是 **Spring 的校验激活器**，作用只有一句话：

> **“告诉 Spring：这个参数需要走 Bean Validation 校验，碰到校验失败立即抛 `MethodArgumentNotValidException`，返回 400，无需我自己写 `if (xxx == null)`。”**

------------------------------------------------
1. 生效前提（必须同时满足）
① **参数类里写校验注解**（如 `@NotNull`、`@Pattern` 等）：
```java
@Data
public class LoginFormDTO {
    @NotNull(message = "用户名不能为空")
    private String username;

    @NotNull(message = "密码不能为空")
    private String password;
}
```
② **控制器方法参数上加 `@Validated`**（或 `@Valid`）：
```java
@PostMapping("/login")
public UserLoginVO login(@RequestBody @Validated LoginFormDTO dto){
    return userService.login(dto);
}
```

------------------------------------------------
2. 校验流程（运行时）
1. 前端发来 JSON：`{"username": null}`
2. Spring **先反序列化** → 得到 `username = null`
3. **Validation 切面**发现字段标注了 `@NotNull` 但值为 `null` → 立即抛出
   ```
   MethodArgumentNotValidException: Field 'username' must not be null
   ```
4. 默认返回 **400 Bad Request**，可自定义全局异常处理器转成友好 JSON。

------------------------------------------------
3. `@Validated` vs `@Valid` 区别
| 场景                    | `@Validated` | `@Valid` |
| ----------------------- | ------------ | -------- |
| **Spring MVC 参数校验** | ✅ 推荐       | ✅ 也能用 |
| **分组校验**（groups）  | ✅ 支持       | ❌ 不支持 |
| **JSR-303 标准**        | ✅ 兼容       | ✅ 原生   |

> **Spring 场景优先用 `@Validated`**，功能超集。

------------------------------------------------
4. 一句话总结
> **`@Validated` 就是“开启校验开关”；**  
> **加上它，Spring 会自动帮你执行字段上的 `@NotNull`、`@Pattern` 等约束，失败立即 400，无需手写 if。**