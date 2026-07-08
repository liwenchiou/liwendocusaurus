---
title: "Node.js 核心模組與系統基礎"
sidebar_label: "4 Node.js 核心模組與系統基礎"
sidebar_position: 4

description: "Node.js 核心模組與系統基礎 當進入 Node.js 環境後，原本瀏覽器裡的 window 等物件將不復存在。本章節介紹 Node.js 特有的全域變數、模組系統與核心功能。 Global 全域物件 在 Node.js 中，最頂層的全域物件稱為 global，類似於瀏覽器環境下的 window..."
keywords: [Node.js, 核心模組與系統基礎, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Node.js 核心模組與系統基礎",
        "datePublished": "2026-07-08T13:51:33.455Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Node.js 核心模組與系統基礎 當進入 Node.js 環境後，原本瀏覽器裡的 window 等物件將不復存在。本章節介紹 Node.js 特有的全域變數、模組系統與核心功能。 Global 全域物件 在 Node.js 中，最頂層的全域物件稱為 global，類似於瀏覽器環境下的 window..."
      }
    `}
  </script>
</Head>


# Node.js 核心模組與系統基礎

當進入 Node.js 環境後，原本瀏覽器裡的 `window` 等物件將不復存在。本章節介紹 Node.js 特有的全域變數、模組系統與核心功能。

## Global 全域物件

在 Node.js 中，最頂層的全域物件稱為 `global`，類似於瀏覽器環境下的 `window`。

1. Node.js 會在 `global` 物件中提供許多預設的核心方法。
2. 當你寫 `global.a = 1;`，在 `global` 中就會多一個 `a` 的變數值。
3. **注意隔離性**：模組的作用域是受限於當前的 Node 執行環境。例如 `1.js` 中對全域變數的影響，和 `2.js` 的環境預設是各自獨立的，這能有效避免全域變數污染。

## 系統路徑變數：`__dirname` 與 `__filename`

開發時常需要動態獲取檔案或目錄的絕對路徑：
- `__dirname`：當前執行檔案**所在目錄**的絕對路徑。
- `__filename`：當前執行的**檔案本身的絕對路徑**（包含檔案名稱）。

## Path 模組

Node.js 內建了 `path` 模組，專門用來處理和轉換檔案路徑，解決不同作業系統（Windows的 `\` 與 Mac/Linux的 `/`）之間的路徑差異問題。

```javascript
const path = require('path');

// 常用的 path 方法：
path.dirname()   // 抓取路徑中所在的目錄名稱
path.join(a, b)  // 跨平台安全地將多段路徑合併在一起
path.basename()  // 抓取路徑中的最終檔案名稱 (含副檔名)
path.extname()   // 抓取檔案的副檔名 (例如 .js)
path.parse()     // 解析路徑字串，回傳包含 root, dir, base, ext, name 的完整物件
```

## 模組設計 (CommonJS 規範)

Node.js 原生使用 CommonJS 規範來管理模組，這讓開發者可以把龐大的專案拆分成多個小檔案。

### `require` 與 `module.exports`
1. 假設我們有兩支檔案：`1.js` 和 `2.js`。
2. 在 `2.js` 裡，我們使用 `module.exports = 值` 將資料或函式導出（傳遞出來）。
3. 在 `1.js` 裡，輸入 `let content = require('./2')` 載入模組，就能取得 `2.js` 輸出的內容。
   > 💡 小提醒：自定義模組的副檔名 `.js` 在 `require` 時可以省略不寫。

### `exports` 的用法與陷阱
除了 `module.exports`，你也可以使用 `exports.屬性名稱 = 值` 將內容單獨匯出。
**⚠️ 注意事項**：`exports` 和 `module.exports` **無法在同一個檔案內直接混用並覆蓋**，如果在同一個檔案內對 `module.exports` 直接賦予一個新物件，之前寫的 `exports.xxx` 就會被覆蓋掉而失效。

## HTTP 核心模組：建立 Web Server

Node.js 內建了 `http` 模組，讓我們不需要依靠 Apache 或 Nginx 等外部伺服器，就能直接啟動一個網站伺服器。

```javascript
let http = require('http');

// createServer 會接收一個 callback 函式，用來處理每一次的連線請求
http.createServer(function(request, response) {
  // request: 包含了使用者（瀏覽器）傳進來的所有資料與請求資訊
  // response: 用來設定我們要回傳給使用者的回應內容

  // 1. 可以查看使用者傳進來的資料（這會是一整包請求物件）
  console.log(request.url);

  // 2. 開啟時要回傳什麼類型給使用者（設定 HTTP 狀態碼為 200，以及內容類型）
  response.writeHead(200, { "Content-Type": "text/plain" });
  
  // 3. 寫入要給使用者的資訊
  response.write('hello!');
  
  // 4. 結束這次的回應
  response.end();
}).listen(8080); // 監聽本機的 8080 通訊埠 (Port)
```

**常見的網路通訊埠 (Port) 常識**：
- `21`：FTP (檔案傳輸協定)
- `80`：HTTP (一般網頁)
- `443`：HTTPS (加密網頁)
- `3389`：遠端桌面