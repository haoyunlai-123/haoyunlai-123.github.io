```java
@Component
public class RedisHandler implements InitializingBean {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Autowired
    private IItemService itemService;

    @Override
    public void afterPropertiesSet() throws Exception {
        // 初始化缓存
        // 1.查询商品信息
        List<Item> list = itemService.list();
        // 2.转为json
        list.forEach(item -> {
            String itemJSON = JSONUtil.toJsonStr(item);
            // 3.存入redis
            stringRedisTemplate.opsForValue().set("item:id:" + item.getId(), itemJSON);
        });
    }
}
```

或用postconstruct方法