---
title: "實作待辦清單 API (2)：設計統一的 Response Handler"
sidebar_label: "6-2 實作待辦清單 API (2)"
sidebar_position: 6.2

description: "實作待辦清單 API 2：設計統一的 Response Handler 在上一篇我們成功建立了伺服器，但你可能會發現一個問題： 未來我們會有很多個路由（例如 GET 拿資料、POST 新增資料、錯誤找不到資料等）。如果每個地方都要寫一次 res.writeHead... 然後用 JSON.strin..."
keywords: [實作待辦清單, API, 設計統一的, Response, Handler, learning, hexschool, nodejs-course]
---


# 實作待辦清單 API (2)：設計統一的 Response Handler

在上一篇我們成功建立了伺服器，但你可能會發現一個問題：
未來我們會有**很多個路由**（例如 GET 拿資料、POST 新增資料、錯誤找不到資料等）。如果每個地方都要寫一次 `res.writeHead(...)` 然後用 `JSON.stringify(...)` 把資料轉成字串回傳，程式碼會變得非常冗長又難以維護。

為了寫出更優雅的程式碼，這篇我們要把「回傳回應 (Response)」這件事，抽離成獨立的模組函式！

> 💡 **完整程式碼下載**
> 為了方便對照與學習，本系列教學的最終完整程式碼已經開源在 GitHub 上：
> 👉 [2026hexschoolNodejs 專案原始碼](https://github.com/liwenchiou/2026hexschoolNodejs)

## 1. 什麼是 HTTP Status Code (狀態碼)？

在設計 Response 之前，我們要先認識 HTTP 狀態碼。這是後端用來告訴前端「這次請求結果如何」的暗號：

* **`200 OK`**：大吉！請求成功，通常用在 GET、PATCH、DELETE 成功時。
* **`400 Bad Request`**：客戶端問題。例如前端送來的資料格式不對，或漏填了必填欄位。
* **`404 Not Found`**：找不到資源。例如打錯網址，或是要刪除的 ID 根本不存在。
* **`500 Internal Server Error`**：伺服器出包了。通常是後端程式碼寫錯導致崩潰。

有了這個概念，我們在設計「成功」與「失敗」的回應時，就能精準給出對應的狀態碼。

## 2. 建立 resHandle.js 模組

在專案資料夾下，新增一個檔案命名為 `resHandle.js`。我們要把上一篇的 `headers` 移過來，並匯出兩個函式：`successHandle` 與 `errorHandle`。

```javascript
// resHandle.js

// 將上一篇的 headers 移到這裡集中管理
const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json'
};

/**
 * 成功回應的統一處理
 * @param {Object} res - http 回應物件
 * @param {Array|Object} data - 要回傳給前端的資料
 */
export const successHandle = (res, data) => {
  // 成功通常回傳 200 狀態碼
  res.writeHead(200, headers);
  // 將資料包裝成一致的格式，並轉成 JSON 字串送出
  res.end(JSON.stringify({
    status: "success",
    data: data
  }));
};

/**
 * 失敗/錯誤回應的統一處理
 * @param {Object} res - http 回應物件
 * @param {String} message - 錯誤訊息
 * @param {Number} statusCode - HTTP 狀態碼 (預設為 400 格式錯誤)
 */
// 這裡我們運用了預設參數 statusCode = 400，讓呼叫時更有彈性
export const errorHandle = (res, message, statusCode = 400) => {
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify({
    status: "false",
    message: message
  }));
};
```

### 為什麼要包裝 `{ status: "success", data: data }`？
這是一種 API 設計的最佳實踐！前端在接收 API 時，如果回傳的結構永遠一致（都有 `status` 欄位），前端就能寫一個統一的攔截器來判斷 API 有沒有壞掉，而不用去猜每次回傳的結構長怎樣。

## 3. 在 server.js 中引入並測試

回到我們的主程式 `server.js`，引入剛剛寫好的兩個函式來重構原本的邏輯：

```javascript
import http from "http";
// 引入我們自己寫的模組
import { successHandle, errorHandle } from "./resHandle.js";

const server = http.createServer((req, res) => {
  
  // 測試：簡單判斷網址，給出成功或失敗的回應
  if (req.url === "/") {
    // 使用 successHandle，程式碼變得超級乾淨！
    successHandle(res, "Hello World");
  } else {
    // 故意打錯網址時，回傳 404
    errorHandle(res, "找不到這個網址路由", 404);
  }

});

server.listen(8080);
```

存檔後，試著在瀏覽器輸入 `http://localhost:8080`，你會看到完美的 JSON 格式成功回應。如果輸入 `http://localhost:8080/test`，就會看到我們自訂的錯誤訊息。

接下來，我們就能利用這個強大的 Response Handler，開始建造我們完整的 Todos 路由了！