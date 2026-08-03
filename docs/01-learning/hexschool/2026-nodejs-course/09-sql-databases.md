---
id: sql-databases
title: "關聯式資料庫 (SQL) 基礎操作與查詢"
sidebar_label: "9-1 SQL 資料庫基礎"
sidebar_position: 17

description: "關聯式資料庫 SQL 基礎操作與查詢 本篇筆記涵蓋了關聯式資料庫的基本觀念、資料表關聯設計（主鍵與外來鍵）、空值處理，以及最常使用的 SQL 聚合函數與 UUID 設計。 1. 關聯式資料庫 SQL 基礎 1. 定義：用來記錄網站的相關數據資訊。 2. 架構：資料庫的格式包含資料表 Table、欄位..."
keywords: [關聯式資料庫, SQL, 基礎操作與查詢, learning, hexschool, nodejs-course]
---


# 關聯式資料庫 (SQL) 基礎操作與查詢

本篇筆記涵蓋了關聯式資料庫的基本觀念、資料表關聯設計（主鍵與外來鍵）、空值處理，以及最常使用的 SQL 聚合函數與 UUID 設計。

---

## 1. 關聯式資料庫 (SQL) 基礎

1. **定義**：用來記錄網站的相關數據資訊。
2. **架構**：資料庫的格式包含**資料表 (Table)**、**欄位 (Columns)**、**資料列 (Rows)**。
3. **比喻**：非常像是 Excel 試算表。
4. **語言**：使用通用的 SQL 語法進行溝通。

---

## 2. 資料表關聯設計：主鍵與外來鍵

1. 每個資料表都要有一個**主鍵 (Primary Key)**。
2. 透過**外來鍵 (Foreign Key)** 去連結其他資料表。
3. **一對多關聯心法**：**「多」的要設定成外來鍵**，從欄位的角度出發。
4. 設定 Primary Key 時，通常會設置為自動遞增 ID。

```sql
CREATE TABLE users(
    id SERIAL PRIMARY KEY, -- 員工編號：主鍵 (PRIMARY KEY) 與 自動遞增 (SERIAL)
    name VARCHAR(50)       -- 員工姓名
);
```

### 💡 Constraint 約束防護機制
新增資料時，資料庫會進行嚴格把關：
*   **主鍵不可重複** (確保唯一性)
*   **外來鍵不可不存在** (參考完整性，確保關聯的資料真實存在)

---

## 3. INNER JOIN 交集查詢

將兩個資料表利用外來鍵組合出最終結果：
```sql
SELECT
    users.id,
    users.name,
    teams.name AS 部門名稱
FROM users
INNER JOIN teams ON users.teams_id = teams.id;
```

---

## 4. NULL 欄位設計與處理

### 4.1 建立選填欄位
選填欄位可以預設為 `NULL`，必填欄位則需加上 `NOT NULL`。
```sql
CREATE TABLE users(
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50) NOT NULL,  -- 必填欄位
    email VARCHAR(50) NOT NULL, -- 必填欄位
    salary INTEGER NULL         -- 選填欄位
);
```

### 4.2 COALESCE 函數：防呆與預設值處理
在查詢時，回傳 `NULL` 有可能會造成前端程式出錯（例如 JS 白畫面）。利用 `COALESCE` 可以在回傳時給 `NULL` 一個顯示用的預設值。
```sql
SELECT
    id,
    name,
    email,
    COALESCE(teams_name, '待分配') AS team_name, -- 如果為 null 則顯示 '待分配'
    COALESCE(salary, 0) AS salary               -- 如果為 null 則顯示 0
FROM users;
```

---

## 5. 聚合函數與過濾

### 5.1 DISTINCT 抓不重複值
用來「過濾去重」，比如員工資料表抓部門有哪些：
```sql
SELECT DISTINCT team_name FROM users;
```

> **💡 面試常考題：DISTINCT 與 GROUP BY 的差異？**
> 1. **`DISTINCT` 是用來「過濾去重」的**：如果只要一個乾淨的「選項清單」，不用做任何計算，用 `DISTINCT`。
> 2. **`GROUP BY` 是用來「群組統計」的**：當你想知道**「每個」**部門分別有幾個人、發了多少薪水，必須請出 `GROUP BY` 搭配聚合函數把相同資料綁在一起算。

### 5.2 COUNT 查詢資料筆數
計算總筆數，注意 `COUNT(*)` 會算出所有列，而 `COUNT(欄位)` 不會計算 NULL 值。
```sql
SELECT COUNT(*) AS member_total FROM users;

-- 加入 WHERE 條件
SELECT COUNT(*) AS 開發部人數 FROM users WHERE team_name='開發部';
```

### 5.3 其他聚合函數 (SUM, AVG, MAX, MIN)
可以混合使用，一次產出儀表板 (Dashboard) 需要的各種統計數據：
```sql
SELECT
    COUNT(*) AS 員工數,
    AVG(salary) AS 平均薪資,
    SUM(salary) AS 總薪資,
    MAX(salary) AS 最高薪資,
    MIN(salary) AS 最低薪資
FROM users;
```

---

## 6. 現代主鍵設計：UUID

為了防止被爬蟲或惡意使用者猜測資料數量，現代開發常使用 UUID 代替遞增的數字 ID。
1. 開啟 UUID 套件（舊版 PostgreSQL 需要）：
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
2. ID 使用 UUID 建立：
```sql
CREATE TABLE users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    salary INTEGER NULL
);
```
*(註：在 PostgreSQL 13 以上版本，`gen_random_uuid()` 已為內建函數，不需額外載入 Extension。)*