```java
private static final Striped<Lock> LOCKS = Striped.lock(1024);

Lock lock = LOCKS.get(userId);
lock.lock();
try {
    // 一人一单
} finally {
    lock.unlock();
}
```

