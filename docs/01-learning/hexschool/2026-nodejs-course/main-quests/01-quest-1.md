---
id: quest-1
title: "Node.js 主線任務一：檔案讀寫、陣列操作與環境變數"
sidebar_label: "\u200B第一週"
sidebar_position: 1

description: "> 🛑 防暴雷警示：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！ 本次任務涵蓋了 Node.js 開發中最常見的基礎資料處理操作，包含使用原生的 fs/promises 模組讀取本地 JSON 檔案、操作環境變數 process.env，以及熟練運用 Java..."
keywords: [Node.js, 主線任務一, 檔案讀寫, 陣列操作與環境變數, learning, hexschool, nodejs-course, main-quests]
---

> 🛑 **防暴雷警示**：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！

本次任務涵蓋了 Node.js 開發中最常見的基礎資料處理操作，包含使用原生的 `fs/promises` 模組讀取本地 JSON 檔案、操作環境變數 `process.env`，以及熟練運用 JavaScript 的陣列高階方法 (`filter`, `reduce`, `map`) 來處理資料結構。

---

## 1. 讀取與解析 JSON 檔案 (fs/promises)
使用 Node.js 內建的 `fs/promises` 模組來進行非同步的檔案讀取。
**關鍵點**：
- 必須加上 `"utf-8"` 編碼，否則讀出來的會是 Buffer 型態。
- 讀出字串後，需使用 `JSON.parse()` 將其轉換為 JavaScript 物件結構。
- 透過 `try...catch` 來攔截找不到檔案或解析失敗的錯誤，並回傳預設的空陣列 `[]` 避免程式發生致命錯誤崩潰。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
const fs = require("fs/promises");

async function readMembers(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("讀取檔案失敗：", err.message);
    return [];
  }
}
```

</details>

## 2. 陣列過濾：篩選 VIP 會員 (filter)
使用 `Array.prototype.filter` 來過濾陣列，此方法會產生一個新的陣列，不會修改到原始資料（符合 Immutable 的精神）。
條件判斷為 `member.level === "VIP"`，回傳 `true` 則保留，`false` 則剔除。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function filterVIP(members) {
  const result = members.filter(function (member) {
    return member.level === "VIP"; 
  });
  return result;
}
```

</details>

## 3. 陣列加總：計算剩餘點數 (reduce)
使用 `Array.prototype.reduce` 進行數值累加。
**關鍵點**：記得一定要在最後傳入初始值 `0`，這在處理空陣列時非常重要，否則會引發錯誤。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function sumCredits(members) {
  const result = members.reduce((total, member) => total + member.credits, 0);
  return result;
}
```

</details>

## 4. 讀取環境變數與預設值防呆 (process.env)
在 Node.js 中，透過 `process.env` 讀取啟動時注入的環境變數。
使用邏輯或運算子 `||` (OR) 給予變數預設值，確保即使未設定環境變數，系統也能使用預設值順利運行。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function getGymConfig() {
  return {
    gymName: process.env.GYM_NAME || "未命名健身房",
    adminName: process.env.ADMIN_NAME || "尚未指派",
    defaultMembersPath: process.env.DEFAULT_MEMBERS_PATH,
  };
}
```

</details>

## 5. 綜合應用：VIP 會員統計摘要
這是一個綜合演練，將前面的功能函式組合起來 (Function Composition)。
**步驟解構**：
1. `await readMembers()`：非同步讀取並解析所有會員資料。
2. `filterVIP()`：拿到陣列後，過濾出所有的 VIP 會員。
3. `sumCredits()`：將剛才過濾出的 VIP 陣列傳入，算出點數總和。
4. `map()`：使用 map 歷遍 VIP 陣列，只提取出每個人的 `name` 屬性，組裝成一個新的字串陣列。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
async function getVIPSummary(filePath) {
  // 1. 讀取資料
  const members = await readMembers(filePath);
  
  // 2. 篩選 VIP
  const vipMembers = filterVIP(members);
  
  // 3. 計算總點數
  const totalCredits = sumCredits(vipMembers);
  
  // 4. 收集所有 VIP 的名字
  const names = vipMembers.map((member) => member.name);
  
  // 組裝成最終物件並回傳
  return {
    count: vipMembers.length, // VIP 人數
    totalCredits: totalCredits,
    names: names,
  };
}
```

</details>