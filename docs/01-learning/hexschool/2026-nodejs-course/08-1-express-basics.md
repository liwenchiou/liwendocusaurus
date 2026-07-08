---
id: express-basics
title: "Express 框架基礎與路由設計"
sidebar_label: "8-1 Express 框架基礎與路由設計"
sidebar_position: 15

description: "Express 框架介紹 Express 是一個靈活且簡潔的 Node.js Web 應用開發框架，是目前後端開發最主流的選擇之一。 核心價值： Node.js Web 應用框架：提供了一套輕量級的開發基礎，讓開發者能快速建立 Web 伺服器與 API。 資料庫整合：能輕鬆與 MySQL、Mongo..."
keywords: [Express, 框架基礎與路由設計, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Express 框架基礎與路由設計",
        "datePublished": "2026-07-08T13:51:33.464Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Express 框架介紹 Express 是一個靈活且簡潔的 Node.js Web 應用開發框架，是目前後端開發最主流的選擇之一。 核心價值： Node.js Web 應用框架：提供了一套輕量級的開發基礎，讓開發者能快速建立 Web 伺服器與 API。 資料庫整合：能輕鬆與 MySQL、Mongo..."
      }
    `}
  </script>
</Head>


## Express 框架介紹

Express 是一個靈活且簡潔的 Node.js Web 應用開發框架，是目前後端開發最主流的選擇之一。

**核心價值：**
- **Node.js Web 應用框架**：提供了一套輕量級的開發基礎，讓開發者能快速建立 Web 伺服器與 API。
- **資料庫整合**：能輕鬆與 MySQL、MongoDB 等資料庫進行對接與互動。
- **解決底層開發難題**：封裝了 Node.js 原生較繁瑣的 HTTP 處理邏輯（如路由、中間件處理），降低開發門檻。
- **培養後端思維**：透過其標準的 Middleware（中間件）架構，能有效建立嚴謹的後端開發邏輯觀念。

## Express 環境安裝

1. 新增一個專案資料夾。
2. 開啟終端機並移動到專案資料夾內。
3. 輸入指令 `npm init -y` 初始化 `package.json`。
4. 輸入指令 `npm i express --save` 安裝 Express 框架。

## 開啟 Web 伺服器

新增一個 `app.js` 檔案：

```javascript
// 1. 引入 express 套件
const express = require("express");
const app = express();

// 2. 定義路由 (Routing)
// 當使用者訪問根目錄 "/" 時，回傳字串 "1234"
app.get("/", function (req, res) {
  res.send("1234");
});

// 3. 設定 Port 與啟動伺服器
// 通常會使用環境變數 process.env.PORT，若無則預設為 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`伺服器已啟動，請瀏覽 http://localhost:${port}`);
});
```

## 網址規則介紹

網址的基本結構可以拆解如下：

```text
https://www.google.com/search?q=hello&oq=hello

// https   -> 協定，更安全的網站瀏覽方式
// www.google.com -> domain 網域，伺服器的網址
// /search -> 執行搜尋的路徑，即路由 (Route)
// ?       -> 網址串聯參數的開頭
// q=hello -> 查詢參數 (query parameters)
// &       -> 參數之間的連結符號
```

常見路徑範例：
- `/`：進入首頁
- `/user`：進入 user 頁面

## 路由設計 (Routing)

### 固定路由

我們可以使用 `app.get`、`app.post` 等方法來定義固定的路徑：

```javascript
const express = require("express");
const app = express();

app.get("/user/edit-profile", function (req, res) {
  res.send("編輯資料");
});

app.get("/user/edit-photo", function (req, res) {
  res.send("編輯照片");
});

const port = process.env.PORT || 3000;
app.listen(port);
```

### params - 取得指定路徑參數 (非固定路由)

當路徑中包含變數時，可以使用 `:` 來定義動態參數：

```javascript
const express = require("express");
const app = express();

app.get("/user/:name", function (req, res) {
  // :name 取得使用者輸入網址列的資料
  let myName = req.params.name;
  res.send(myName);
});

const port = process.env.PORT || 3000;
app.listen(port);
```

### query - 取得網址查詢參數

對於透過 `?key=value` 傳遞的參數，可以使用 `req.query` 來取得：

```javascript
const express = require("express");
const app = express();

// 處理動態路由與查詢參數
// 範例請求: /user/Liwen?limit=10&q=jazz
app.get("/user/:name", function (req, res) {
  // 1. 取得路徑參數 (例如: /user/Liwen 中的 Liwen)
  const myName = req.params.name;

  // 2. 取得查詢參數 (例如: ?limit=10&q=jazz)
  const limit = req.query.limit; // 10
  const q = req.query.q;         // jazz

  res.send(`${myName} 想要找 ${limit} 筆資料，關鍵字為：${q}`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

## Router 進階設定

當專案路徑變多時，將所有邏輯寫在 `app.js` 會導致檔案過於臃腫。使用 `express.Router` 可以將特定資源（如 User 相關操作）的路由邏輯獨立封裝。

**1. 路由模組檔案：`routes/user.js`**

將使用者相關的所有路徑定義在獨立檔案中：

```javascript
// routes/user.js
const express = require("express");
const router = express.Router();

router.get("/edit-profile", function (req, res) {
  res.send("編輯資料");
});

router.get("/edit-photo", function (req, res) {
  res.send("編輯照片");
});

module.exports = router;
```

**2. 主程式設定：`app.js`**

在主程式中，透過 `app.use` 將路由模組掛載到指定的路徑前綴（`/user`）上：

```javascript
// app.js
const express = require("express");
const app = express();

// 引入路由模組
const user = require("./routes/user");

// 將所有 /user 開頭的請求都導向 user 路由模組
app.use("/user", user);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`伺服器啟動於 http://localhost:${port}`);
});
```