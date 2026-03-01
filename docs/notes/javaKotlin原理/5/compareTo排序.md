一组实现了compare的对象往堆里放，我想按照从大到小排序，如何实现compareTo方法？

把 compareTo 的返回值**反过来**就行：  
“**左边大就返回负，左边小就返回正**”，这样堆（PriorityQueue 默认是最小堆）会把“大”的当成“小”来处理，实际效果就是从大到小。

------------------------------------------------
代码模板
------------------------------------------------
```java
class MyData implements Comparable<MyData> {
    int val;

    MyData(int val) { this.val = val; }

    // 从大到小（逆序）
    @Override
    public int compareTo(MyData other) {
        // 注意顺序：other 在前，this 在后
        return other.val - this.val;   // 大→小
        // 或者更健壮：
        // return Integer.compare(other.val, this.val);
    }
}
```

------------------------------------------------
验证
------------------------------------------------
```java
PriorityQueue<MyData> heap = new PriorityQueue<>();
heap.offer(new MyData(5));
heap.offer(new MyData(9));
heap.offer(new MyData(2));

while (!heap.isEmpty()) {
    System.out.print(heap.poll().val + " ");
}
// 输出：9 5 2   （从大到小出队）
```

------------------------------------------------
一句话记住  
想“从大到小”就把 compareTo 写成 **“对方减自己”**（或 `Integer.compare(other, this)`），堆自然按大值优先。