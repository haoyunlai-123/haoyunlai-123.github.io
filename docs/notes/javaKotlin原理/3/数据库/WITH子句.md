介绍下sql得with子句得用法

WITH 子句 = **「给一段 SELECT 起个临时名字」**，  
作用：把复杂查询拆成**可读、可复用**的「小块」，还能**递归**。

---

### 1. 基本用法（给子查询起别名）

```sql
WITH sales AS (
    SELECT dept_id, SUM(amount) AS total
    FROM   orders
    GROUP  BY dept_id
)
SELECT d.dept_name, s.total
FROM   departments d
JOIN   sales s ON d.dept_id = s.dept_id;
```

→ `sales` 像一张「临时视图」，只在当前语句里有效。

---

### 2. 多次复用（一次定义，多处引用）

```sql
WITH monthly AS (
    SELECT DATE_TRUNC('month', order_date) AS mon, amount
    FROM   orders
)
SELECT mon,
       SUM(amount) AS month_total,
       AVG(amount) OVER (ORDER BY mon) AS running_avg
FROM   monthly;
```

---

### 3. 递归 WITH（树形展开）

```sql
WITH RECURSIVE emp_path AS (
    SELECT emp_id, mgr_id, CAST(name AS VARCHAR(1000)) AS path
    FROM   employees
    WHERE  mgr_id IS NULL        -- 顶层老板
    UNION ALL
    SELECT e.emp_id, e.mgr_id, CONCAT(ep.path, '->', e.name)
    FROM   employees e
    JOIN   emp_path ep ON e.mgr_id = ep.emp_id
)
SELECT * FROM emp_path;
```

→ 一次递归把「汇报链」全部展开。

---

### 4. 一句话背下来

> **「WITH 给 SELECT 起临时名，当前语句内复用，还能递归展开树，比嵌套子查询清爽一万倍。」**