DISTINCT怎么用？

DISTINCT = **「把重复行整行去重」**，语法极简单，但容易踩「整行 vs 单列」坑。

---

### 1. 基本用法（整行去重）

```sql
SELECT DISTINCT city, country
FROM customers;
```

→ 只保留 `(city, country)` 完全相同的行。

---

### 2. 单列去重（搭配聚合）

```sql
SELECT COUNT(DISTINCT city) AS city_cnt
FROM customers;
```

→ 只统计「不同城市」的数量。

---

### 3. 与 ORDER BY 一起用（去重后排序）

```sql
SELECT DISTINCT city
FROM customers
ORDER BY city DESC;
```

→ 先去重，再按城市降序排。

---

### 4. 一句话背下来

> **「DISTINCT 整行去重，单列去重加 COUNT，去完再排序，语法就这些。」**

==============================

SELECT
	count(*) total_pv,
	( SELECT count(*) FROM exam_record WHERE submit_time IS NOT NULL ) complete_pv,
	( SELECT COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL ) FROM exam_record ) complete_exam_cnt
FROM
	exam_record这句sql中COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL ) 这是什么玩意？

这一行：

```sql
COUNT( DISTINCT exam_id, score IS NOT NULL OR NULL )
```

**语法上是错的**，**MySQL 会报错**；它想表达「去重后计数」，但写成了「两列 + 布尔表达式」的混搭。

---

### 1. 语法错误点

- `COUNT(DISTINCT col1, col2)` 是 **合法** 的（去重两列组合）；
- `score IS NOT NULL OR NULL` 是 **布尔值**，**不能放在 DISTINCT 括号里**。

---

### 2. 正确写法（两种意图）

**A. 去重两列组合**（原句想写的？）

```sql
COUNT(DISTINCT exam_id, score)   -- 两列组合去重
```

**B. 只统计「有分数」的考试次数**（更合理？）

```sql
COUNT(DISTINCT exam_id)          -- 先去重，再整体过滤
WHERE score IS NOT NULL
```

或子查询形式：

```sql
(SELECT COUNT(DISTINCT exam_id)
 FROM exam_record
 WHERE score IS NOT NULL)
```

---

### 3. 一句话背下来

> **「DISTINCT 括号里只能放列名，布尔表达式放 WHERE，别把判断写进括号。」**