```java
@Slf4j
public class Test5 {

    public static void main(String[] args) {

        LocalDateTime now = LocalDateTime.now();
        System.out.println(now);

        // 得到本周的周四18:00:00的时间
        LocalDateTime time = now.withHour(18).withMinute(0).withSecond(0).with(DayOfWeek.THURSDAY);
        System.out.println(time);

        // 比较当前时间与周四的大小
        if (now.compareTo(time) > 0) {
            time = time.plusWeeks(1);
        }
        
        long begin = Duration.between(now, time).toMillis();
        long duration = Duration.between(now, now.plusWeeks(1)).toMillis();

        ScheduledExecutorService pool = Executors.newScheduledThreadPool(1);



        pool.scheduleAtFixedRate(() -> {
           log.info("running");
        }, begin, duration, TimeUnit.MILLISECONDS);
    }

}
```