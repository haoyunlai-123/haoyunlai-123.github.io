UNION怎么用？举个例子

UNION = 「把两个 SELECT 的结果**竖着拼成一张表**」，要求：

- **列数相同**、**对应列类型兼容**  
- 默认去重；若要保留重复 → 用 `UNION ALL`

---

### 例子：「两个表拼成一张通讯录」

```
表 staff(id, name, phone)
表 customer(id, name, phone)
```

**竖着拼成一张「所有人通讯录」**：

```sql
SELECT name, phone FROM staff
UNION
SELECT name, phone FROM customer
ORDER BY name;
```

结果示意：

| name       | phone   |
| ---------- | ------- |
| Alice      | 1380001 |
| Bob        | 1380002 |
| Carol      | 1380003 |
| （去重后） |         |

---

### 保留重复（UNION ALL）

```sql
SELECT name, phone FROM staff
UNION ALL
SELECT name, phone FROM customer
ORDER BY name;
```

→ 有重复也保留，**性能比 UNION 快**（省去去重排序）。

---

### 一句话背下来

> **「UNION 竖着拼，列数类型要对，默认去重，留重用 ALL。」**