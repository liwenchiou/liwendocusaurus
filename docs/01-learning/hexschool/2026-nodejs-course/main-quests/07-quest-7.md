---
id: quest-7
title: "Node.js 主線任務七：SQL 查詢與索引效能優化 (EXPLAIN, Index, Query Rewrite)"
sidebar_label: "\u200B第七週"
sidebar_position: 7

description: "> 🛑 防暴雷警示：本篇筆記包含 2026 Node.js 直播班第七週主線任務（LiveFit 爆紅效能急救室）的完整解答與實作細節。內容涵蓋資料庫索引設計 (B-Tree、部分索引 Partial Index)、EXPLAIN ANALYZE 執行計畫解析與避免索引失效的 SQL 查詢改寫技巧。"
keywords: [Node.js, 主線任務七, SQL, Index, EXPLAIN, PostgreSQL, 效能優化, learning, hexschool, nodejs-course, main-quests]
---


> 🛑 **防暴雷警示**：以下筆記包含主線任務的解答與實作細節，強烈建議先親手透過 `EXPLAIN ANALYZE` 剖析 SQL 執行計畫，卡關再來對照參考喔！

本次任務為 **LiveFit 爆紅效能急救室**。隨著 LiveFit 健身平台資料量成長至數百萬筆，原本未建立索引的查詢導致資料庫頻繁進行全表掃描 (Sequential Scan)。我們的任務是針對營運團隊提出的六張效能工單，運用 **EXPLAIN ANALYZE 執行計畫分析**、**B-Tree 索引建置**、**部分索引 (Partial Index)** 以及 **SQL 查詢改寫** 進行對症下藥的效能調校。

---

## 工單 1：客服查會員 (`email` 精準搜尋)

**🎯 情境與問題**：
客服輸入會員 email 查詢時需等待數秒。經檢視發現每次查詢皆對 30 萬筆 `users` 資料表進行全表掃描 (`Seq Scan`)。

**💡 關鍵點與優化策略**：
* 針對等值搜尋 (`WHERE email = $1`) 的高頻欄位建立 B-Tree 索引，將時間複雜度由 $O(N)$ 降至 $O(\log N)$。

<details>
<summary>💻 點擊展開程式碼解答 (`optimize.sql`) </summary>

```sql
-- 工單 1：客服查會員
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

</details>

---

## 工單 2：企業會員的課表 (部分索引 Partial Index)

**🎯 情境與問題**：
企業會員開啟團課課表時載入過慢。查詢需在 100 多萬筆報名紀錄 (`course_bookings`) 中過濾出「未取消 (`cancelled_at IS NULL`)」的資料。

**💡 關鍵點與優化策略**：
* 若使用一般索引，無效的已取消紀錄也會佔用索引空間。
* 使用 **部分索引 (Partial Index)** 加載 `WHERE cancelled_at IS NULL` 條件，能大幅縮減索引檔案體積，讓快取效率達到最高（`Rows Removed` 降為 0）。

<details>
<summary>💻 點擊展開程式碼解答 (`optimize.sql`) </summary>

```sql
-- 工單 2：企業會員的課表 (採用 Partial Index)
CREATE INDEX IF NOT EXISTS idx_course_bookings_user_id 
ON course_bookings(user_id) 
WHERE cancelled_at IS NULL;
```

</details>

---

## 工單 3：最新購買紀錄牆 (降序排序優化)

**🎯 情境與問題**：
後台首頁需顯示最新 100 筆購買紀錄，但每次載入皆需將整張 40 萬筆 `credit_purchases` 資料表全數取出並進行記憶體排序 (`Sort`)。

**💡 關鍵點與優化策略**：
* 針對 `purchase_at DESC` 建立降序索引，資料庫可以直接讀取預先排序好的 B-Tree 葉子節點，完全消除額外的 Sort 階段成本。

<details>
<summary>💻 點擊展開程式碼解答 (`optimize.sql`) </summary>

```sql
-- 工單 3：最新購買紀錄牆
CREATE INDEX IF NOT EXISTS idx_credit_purchases_purchase_at ON credit_purchases(purchase_at DESC);
```

</details>

---

## 工單 4：首頁「進行中課程」 (時間區間範圍優化)

**🎯 情境與問題**：
過濾「現在正在進行中」的課程時發生全表掃描。先前在 `start_at` 建立的索引因選擇度 (Selectivity) 不佳而被資料庫查詢優化器忽略。

**💡 關鍵點與優化策略**：
* 評估 `start_at` 與 `end_at` 兩者的選擇度，將索引建立在能大幅縮減資料過濾範圍的 `end_at` 欄位上。

<details>
<summary>💻 點擊展開程式碼解答 (`optimize.sql`) </summary>

```sql
-- 工單 4：首頁「進行中課程」
CREATE INDEX IF NOT EXISTS idx_courses_end_at ON courses(end_at);
```

</details>

---

## 工單 5：上週開課課程的教練報名統計 (雙資料表多重索引)

**🎯 情境與問題**：
此報表需關聯 `courses`、`course_bookings` 與 `users` 三張大表。單一索引無法滿足複雜 JOIN 與 WHERE 條件的需求。

**💡 關鍵點與優化策略**：
* 需要在過濾條件欄位 (`courses.start_at`) 與 JOIN 外來鍵欄位 (`course_bookings.course_id`) 同時建立索引，以徹底消除 Nested Loop / Hash Join 的瓶頸。

<details>
<summary>💻 點擊展開程式碼解答 (`optimize.sql`) </summary>

```sql
-- 工單 5：上週開課課程的教練報名統計 (需建立雙索引)
CREATE INDEX IF NOT EXISTS idx_courses_start_at ON courses(start_at);
CREATE INDEX IF NOT EXISTS idx_course_bookings_course_id ON course_bookings(course_id);
```

</details>

---

## 工單 6：爆量日報名查詢 (避免 SARGable 失效的查詢改寫)

**🎯 情境與問題**：
客服查詢週年慶當日報名超慢。原查詢寫法使用 `WHERE DATE(created_at) = DATE '2026-06-24'`，導致預先建立的 `created_at` B-Tree 索引無法被使用（即 SARGable 效能失效）。因為 `created_at` 帶有時區且轉換函式不可拿來建立傳統索引。

**💡 關鍵點與優化策略**：
* **禁止使用函式包覆欄位**：將 `DATE(created_at) = '2026-06-24'` 改寫為起訖時間範圍比較 (`>= '2026-06-24 00:00:00+08'` AND `< '2026-06-25 00:00:00+08'`)，讓查詢優化器能順利走索引範圍掃描 (Index Range Scan)。

<details>
<summary>💻 點擊展開程式碼解答 (`queries/06-rewrite.sql`) </summary>

```sql
-- 工單 6：改寫查詢以走索引範圍掃描
SELECT count(*) AS total 
FROM course_bookings 
WHERE created_at >= '2026-06-24 00:00:00+08'
  AND created_at < '2026-06-25 00:00:00+08';
```

</details>

---

## 驗收與測試結果速查

在終端機執行測量指令確保六張工單全數通過：

```bash
npm run measure
npm test
```

驗收通過指標：`Tests: 8 passed, 8 total`，全數轉為 🟢 綠燈。
