---
title: "實作待辦清單 API (1)：環境建置與原生 HTTP 伺服器"
sidebar_label: "6-1 實作待辦清單 API (1)"
sidebar_position: 6.1

description: "實作待辦清單 API 1：環境建置與原生 HTTP 伺服器 在這系列教學中，我們將不依賴任何框架（如 Express），純粹使用 Node.js 內建的 http 模組來實作一個「待辦清單 Todo List」的 RESTful API。這能幫助初學者打好最扎實的 Node.js 後端基礎！ > �..."
keywords: [實作待辦清單, API, 環境建置與原生, HTTP, 伺服器, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "實作待辦清單 API (1)：環境建置與原生 HTTP 伺服器",
        "datePublished": "2026-07-08T13:51:33.457Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "實作待辦清單 API 1：環境建置與原生 HTTP 伺服器 在這系列教學中，我們將不依賴任何框架（如 Express），純粹使用 Node.js 內建的 http 模組來實作一個「待辦清單 Todo List」的 RESTful API。這能幫助初學者打好最扎實的 Node.js 後端基礎！ > �..."
      }
    `}
  </script>
</Head>


# 實作待辦清單 API (1)：環境建置與原生 HTTP 伺服器

在這系列教學中，我們將不依賴任何框架（如 Express），純粹使用 Node.js 內建的 `http` 模組來實作一個「待辦清單 (Todo List)」的 RESTful API。這能幫助初學者打好最扎實的 Node.js 後端基礎！

> 💡 **完整程式碼下載**
> 為了方便對照與學習，本系列教學的最終完整程式碼已經開源在 GitHub 上：
> 👉 [2026hexschoolNodejs 專案原始碼](https://github.com/liwenchiou/2026hexschoolNodejs)
> 如果你在實作過程中遇到 bug 或卡關，可以直接參考或下載完整的原始碼喔！

本篇我們將從 **專案初始化** 開始，一步步架設起網頁伺服器。

## 1. 專案初始化與安裝套件

首先，建立一個空的專案資料夾，然後在終端機輸入以下指令進行初始化：

```bash
npm init -y
```
這會產生一個 `package.json` 檔案，它是整個專案的設定檔。

接下來，我們需要安裝兩個輔助開發的套件：

```bash
npm install uuid
npm install nodemon
```

### 套件小科普：
- **`uuid`**：用來自動產生獨一無二的亂數 ID（例如：`f47ac10b-58cc-4372-a567-0e02b2c3d479`），我們需要它來作為每筆待辦事項的唯一識別碼。
- **`nodemon`**：這是一個開發神器！傳統用 `node server.js` 啟動伺服器時，每次改完程式碼都要手動重啟。有了 `nodemon`，它會自動「監聽」檔案變更，存檔的瞬間伺服器就會自動重啟，大幅提升開發效率。

## 2. 決定模組化標準 (ES Module)

打開剛產生的 `package.json`，手動加入一行 `"type": "module"`：

```json
{
  "name": "todo-api",
  "version": "1.0.0",
  "type": "module", // <-- 加入這行
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"
  }
}
```

> **為什麼要加這個？**
> Node.js 早期預設使用 `CommonJS` 標準（語法是 `require`）。但現代前端開發（如 React, Vue）大多使用 `ES Module` 標準（語法是 `import / export`）。為了讓語法統一並接軌現代標準，我們指定專案使用 `module`。

## 3. 測試套件與伺服器啟動

建立一支 `server.js` 檔案，先來測試我們安裝的套件：

```javascript
// 使用 ES Module 語法引入套件
import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4(); 
console.log("測試產生的 UUID:", uuid);
```

在終端機輸入我們剛剛在 `package.json` 裡設定好的捷徑：
```bash
npm run start
```
如果終端機有順利印出亂碼 ID，就代表環境設定成功了！你可以隨便改個字並存檔，看看 nodemon 有沒有幫你自動重啟。

## 4. 建立原生 Web Server

接下來我們要召喚 Node.js 內建的 `http` 模組，來建立一個真正的網頁伺服器。

將 `server.js` 的程式碼改寫如下：

```javascript
import http from "http";

// 定義 HTTP 標頭 (Headers)，處理 CORS 跨域問題
const headers = {
  // 允許跨網域存取的 Header 欄位
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  // 允許所有來源網站跨域打 API ('*' 代表全部)
  'Access-Control-Allow-Origin': '*',
  // 允許的 HTTP 請求方法
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  // 告知客戶端回傳的資料格式為 JSON
  'Content-Type': 'application/json'
};

// 建立 HTTP 伺服器
const server = http.createServer((req, res) => {
  // 設定狀態碼為 200 (成功)，並帶入剛才設定的 headers
  res.writeHead(200, headers);
  // 回傳內容
  res.write("Hello World");
  // 結束這次的回應 (一定要寫，否則網頁會一直轉圈圈)
  res.end();
});

// 設定伺服器監聽的 Port 號
server.listen(8080);
```

### 認識 CORS 與 Headers
當前端網頁（例如 `http://localhost:3000`）想要打 API 給後端（例如 `http://localhost:8080`），因為網址（Port 號）不同，瀏覽器基於安全性會啟動「跨域阻擋 (CORS)」。
我們在 `headers` 裡設定的 `Access-Control-Allow-Origin: '*'`，就是在跟瀏覽器說：「放行吧！不管誰來打這個 API，我都允許！」

現在，你可以打開瀏覽器輸入 `http://localhost:8080`，如果看到 "Hello World"，恭喜你，你的第一台原生 Node.js 伺服器成功上線了！