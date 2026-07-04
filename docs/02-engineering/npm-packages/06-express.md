---
id: express
title: "express"
sidebar_label: "​06 express"
sidebar_position: 6

description: "express express 是 Node.js 最經典、最主流的 Web 應用框架。它大幅簡化了原生 http 模組繁瑣的設定，提供了極簡且靈活的路由系統與中介軟體 Middleware 架構。 安裝 bash npm install express 基本使用範例（優雅的語意化路由） 相較於原生..."
keywords: [express, engineering, npm-packages]
---

# express

`express` 是 Node.js 最經典、最主流的 Web 應用框架。它大幅簡化了原生 `http` 模組繁瑣的設定，提供了極簡且靈活的路由系統與中介軟體 (Middleware) 架構。

## 安裝

```bash
npm install express
```

## 基本使用範例（優雅的語意化路由）

相較於原生 `http` 模組必須寫一大堆 `if...else` 來手動判斷網址，Express 提供了直覺的方法來對應 HTTP 動詞。建立一個最基礎的伺服器並設計路由變得非常簡單：

```javascript
const express = require("express");
const app = express();

// 路由一：首頁
app.get("/", (req, res) => {
  res.status(200);
  res.json({ status: "success", message: "歡迎來到 API 系統" });
});

// 路由二：取得會員列表
app.get("/api/v1/members", (req, res) => {
  res.status(200);
  res.json({
    status: "success",
    data: [{ name: "王小明" }, { name: "李小花" }],
  });
});

// 路由三：404 防呆
// app.use 會匹配所有未定義的路徑，適合用來處理找不到網頁的情況
app.use((req, res) => {
  res.status(404);
  res.json({ status: "error", message: "路由不存在" });
});

// 路由四：全域錯誤處理 (Error Handler)
// 負責接住所有未捕捉的例外，例如 JSON 格式解析失敗 (SyntaxError)
app.use((err, req, res, next) => {
  console.error("發生錯誤：", err.message);
  res.status(500).json({
    status: "error",
    message: "伺服器內部錯誤"
  });
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`伺服器啟動中：http://localhost:${PORT}`);
});
```

## 網址參數解析 (Params & Query)

Express 內建了非常方便的網址解析功能，可以輕鬆從 URL 中取得前端帶入的變數，主要分為 `req.params` 與 `req.query` 兩種：

### 1. `req.params` (路由參數)
用於動態網址路徑，通常用來傳遞**資源的唯一識別碼 (ID)**。
在設定路由時使用冒號 `:` 來定義變數名稱。

```javascript
// GET /api/v1/members/123
app.get("/api/v1/members/:id", (req, res) => {
  // 取得網址上的 id，注意：取下來的值永遠是「字串」
  const memberId = req.params.id; 
  
  res.json({ status: "success", id: memberId });
});
```

### 2. `req.query` (查詢字串)
用於解析網址 `?` 後面的參數，通常用來進行**資料的篩選、排序、分頁**。

```javascript
// GET /api/v1/members?level=VIP&page=2
app.get("/api/v1/members", (req, res) => {
  // 自動將 query string 解析為物件
  const { level, page } = req.query;
  
  res.json({ 
    status: "success", 
    filter: level, 
    page: page 
  });
});
```

## 核心特色
1. **中介軟體 (Middleware)**：可以像流水線一樣，在請求到達最終路由前進行攔截、處理（例如驗證 Token、解析 Body 等）。
   > **💡 補充觀念：原生 `http` 模組有 Middleware 嗎？**  
   > 簡單來說：**沒有**。Middleware（洋蔥模型/管線機制）是 Express 賦予的強大功能。在原生的 `http` 模組中，所有請求只能在一個巨大的函式內處理到底；如果要在原生環境做到類似分層攔截的功能，必須自己手動寫程式來管理函式陣列與 `next()` 邏輯，非常麻煩。這也是實務上大家會依賴 Express 的關鍵原因！

2. **極簡路由**：提供 `app.get()`, `app.post()`, `app.patch()`, `app.delete()` 等直覺的 HTTP 動詞對應。
3. **靈活解析**：內建 `express.json()` 等工具，可輕鬆解析前端傳來的 JSON 格式資料。

## 什麼是中介軟體 (Middleware)？

Middleware 是 Express 最重要的核心靈魂。想像一下出國搭飛機，從進入機場到最終登機，中間會經過「行李安檢」、「海關查驗」等關卡，這些關卡就是 Middleware。

在程式中，當前端的請求 (Request) 抵達最終目的地的路由前，我們可以讓它先經過一系列的 Middleware 函式來進行攔截與處理（例如：檢查有沒有 Token、解析資料格式、紀錄 Log 等）。

### Middleware 的核心機制：`next()`
一個標準的 Middleware 會有三個參數：`(req, res, next)`。
其中最關鍵的就是 `next()`：如果你在這關檢查通過了，**必須呼叫 `next()`**，請求才會被放行到下一關；如果檢查失敗且沒有呼叫 `next()`，請求就會卡在這裡（通常這時我們就會直接用 `res.send` 擋下並回傳錯誤）。

```javascript
// 範例：一個簡單的「身分驗證」Middleware
const checkAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (token === "super-secret") {
    console.log("✅ 身分驗證通過！");
    next(); // 放行，前往下一關！
  } else {
    // 驗證失敗，不呼叫 next()，直接打回票 (401 Unauthorized)
    res.status(401).json({ message: "您沒有權限訪問" });
  }
};

// 將 Middleware 掛載到特定路由上（就像流水線一樣）
app.get("/api/v1/secret-data", checkAuthMiddleware, (req, res) => {
  // 只有前面成功呼叫了 next()，才會順利執行到這裡
  res.json({ data: "這是一份極機密文件" });
});
```

## 全域錯誤處理 (Global Error Handler)

在 Express 中，只要 Middleware 帶有 **四個參數 `(err, req, res, next)`**，它就會自動被視為全域錯誤處理函式。

> [!WARNING]
> **絕對不能省略 `next` 參數！**
> 即使你在裡面沒有呼叫 `next()`，也必須把這四個參數寫滿 `(err, req, res, next)`。如果你只寫了三個參數，Express 就會把它當成普通的 Middleware，導致錯誤無法被正確捕捉，進而引發伺服器崩潰！

全域錯誤處理必須被放置在程式碼的**最底層**（在所有常規路由與 404 守門員的後面），用來做最後一道防線，捕捉例如前端傳來壞掉的 JSON 導致的 `SyntaxError`，或是其他未被 `try...catch` 捕捉的例外狀況。