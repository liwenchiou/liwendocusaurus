---
title: "實作待辦清單 API (3)：路由判斷、GET 與 DELETE"
sidebar_label: "6-3 實作待辦清單 API (3)"
sidebar_position: 6.3
---

# 實作待辦清單 API (3)：路由判斷、GET 與 DELETE

前置作業都完成了，我們終於要來撰寫核心的 API 邏輯！這篇將涵蓋如何判斷「請求方法與網址」，並實作讀取 (GET) 與刪除 (DELETE) 的功能。

> 💡 **完整程式碼下載**
> 為了方便對照與學習，本系列教學的最終完整程式碼已經開源在 GitHub 上：
> 👉 [2026hexschoolNodejs 專案原始碼](https://github.com/liwenchiou/2026hexschoolNodejs)

## 1. 原生路由判斷與 OPTIONS 預檢請求

在 `server.js` 中，我們要透過 `req.url`（使用者存取的網址路徑）與 `req.method`（HTTP 請求方法）來決定伺服器要執行什麼動作。

首先，我們要先建立一個全域的陣列 `todos` 來充當我們的小型記憶體資料庫。

```javascript
import http from "http";
import { successHandle, errorHandle } from "./resHandle.js";

// 用來存放待辦事項的陣列
const todos = [
  { id: "123", title: "這是一筆測試資料" } // 先塞一筆假資料方便測試
];

const server = http.createServer((req, res) => {
  // OPTIONS 預檢請求
  if (req.method === "OPTIONS") {
    // 只要是 OPTIONS 請求，直接回傳成功 (狀態碼 200) 即可
    successHandle(res, "");
  }
  // GET 取得所有待辦
  else if (req.url === "/todos" && req.method === "GET") {
    successHandle(res, todos);
  } 
  // 找不到路由
  else {
    errorHandle(res, "無此路由", 404);
  }
});

server.listen(8080);
```

### 為什麼需要 OPTIONS？
還記得我們之前設定的 CORS `headers` 嗎？當前端透過 JavaScript (如 Fetch 或 Axios) 發送跨域的 POST、PATCH、DELETE 請求時，瀏覽器會自動先發送一個隱藏的 `OPTIONS` 請求去探路（Preflight request），確認後端有沒有允許跨域。如果我們沒處理 `OPTIONS`，正式的請求就會被瀏覽器擋下來！

## 2. 實作：刪除所有待辦 (DELETE)

刪除所有資料最簡單的方式，就是把陣列清空。

> **小技巧**：在 JavaScript 裡，要清空一個用 `const` 宣告的陣列，不能寫 `todos = []`（會報錯），最俐落的作法是把它的長度設為 0：`todos.length = 0;`。

```javascript
  else if (req.url === "/todos" && req.method === "DELETE") {
    // 刪除所有待辦事項
    todos.length = 0;
    // 回傳清空後的陣列給前端
    successHandle(res, todos);
  } 
```

## 3. 實作：刪除單筆待辦 (DELETE)

單筆刪除比較複雜，因為網址會長得像 `/todos/123`，後面的 `123` 是會變動的 UUID。所以我們不能用 `===` 來判斷網址，必須使用 `startsWith` 來判斷字首。

```javascript
  else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
    // 1. 取得 ID 
    // req.url 的長相是 "/todos/123"
    // split("/") 會把它切成陣列：["", "todos", "123"]
    // pop() 會取出陣列的最後一個元素，也就是 "123"
    const id = req.url.split("/").pop(); 
    
    // 2. 尋找這個 ID 在陣列中的索引位置 (Index)
    // findIndex 找不到時會回傳 -1
    const index = todos.findIndex(element => element.id === id); 

    // 3. 判斷是否有找到 (並確認 id 不是空字串)
    if (id !== undefined && id !== "" && index !== -1) {
      // splice(要刪除的起點, 刪除幾筆)
      todos.splice(index, 1);
      successHandle(res, todos);
    } else {
      // 找不到時，回傳 404 錯誤
      errorHandle(res, "找不到該筆待辦事項", 404);
    }
  }
```

### 解析字串處理技巧：
原生 Node.js 沒有像是 Express 那種 `req.params.id` 的方便語法，所以我們必須手動切字串。`req.url.split("/").pop()` 是一招非常簡潔好用的技巧，它能精準拿到網址斜線最後方夾帶的參數。

目前為止，我們已經完成了 GET 和 DELETE。下一篇，我們將挑戰最難的「接收 Request Body」來實作 POST 與 PATCH 功能！
