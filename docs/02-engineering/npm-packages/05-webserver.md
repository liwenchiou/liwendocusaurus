---
id: webserver
sidebar_position: 5
title: "webserver (http)"
sidebar_label: "webserver (http)"

description: "http Node.js 原生 Web Server 💡 為什麼需要了解這個核心模組？ http 是 Node.js 內建的核心模組，不需要透過 npm 安裝。雖然在實務上我們大多會使用 Express 或 Koa 等更進階的路由框架來架設伺服器，但理解原生的 http 模組運作原理，是掌握 No..."
keywords: [webserver, http, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "webserver (http)",
        "datePublished": "2026-07-08T13:51:33.509Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "http Node.js 原生 Web Server 💡 為什麼需要了解這個核心模組？ http 是 Node.js 內建的核心模組，不需要透過 npm 安裝。雖然在實務上我們大多會使用 Express 或 Koa 等更進階的路由框架來架設伺服器，但理解原生的 http 模組運作原理，是掌握 No..."
      }
    `}
  </script>
</Head>


# `http` - Node.js 原生 Web Server

## 💡 為什麼需要了解這個核心模組？
`http` 是 Node.js **內建**的核心模組，不需要透過 npm 安裝。雖然在實務上我們大多會使用 `Express` 或 `Koa` 等更進階的路由框架來架設伺服器，但理解原生的 `http` 模組運作原理，是掌握 Node.js 請求 (Request) 與回應 (Response) 生命週期的基石。

## 🚀 基本使用範例

建立一個最基礎的 Web Server：

```javascript
const http = require('http');

// 建立伺服器 (requestListener)
const requestListener = (req, res) => {
    // 設定 HTTP 標頭
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    
    // 根據路由處理邏輯
    if (req.url === '/' && req.method === 'GET') {
        res.end('歡迎來到首頁！');
    } else {
        res.writeHead(404);
        res.end('找不到頁面。');
    }
};

const server = http.createServer(requestListener);

// 啟動並監聽 Port 3000
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
```

### 🔀 路由判斷 (Routing) 範例

在原生 `http` 模組中，如果我們有多個不同的 API 網址，我們必須手動撰寫 `if...else` 或是 `switch` 來判斷 `req.url`（路徑）與 `req.method`（動詞），這也就是所謂的「手動刻路由」。

```javascript
const requestListener = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

    // 手動解析路由與動詞
    if (req.url === '/api/users' && req.method === 'GET') {
        res.end(JSON.stringify({ message: '取得使用者列表' }));
    } else if (req.url === '/api/users' && req.method === 'POST') {
        res.end(JSON.stringify({ message: '新增使用者' }));
    } else if (req.url === '/api/products' && req.method === 'GET') {
        res.end(JSON.stringify({ message: '取得產品列表' }));
    } else {
        // 找不到路由的防呆處理 (404 Not Found)
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('找不到對應的路由');
    }
};
```

> **為什麼我們後來都用 Express？**  
> 從上面的範例可以發現，只要專案的 API 稍微變多，這個 `if...else` 結構就會變得超級冗長且難以維護！此外，處理 POST 請求的 JSON body 時，還必須手動監聽 `req.on('data')` 將 buffer 資料塊 (chunks) 拼湊起來，並在 `req.on('end')` 進行 `JSON.parse`。這正是為什麼實務上我們都會依賴 `Express` 等現代框架來簡化開發流程的原因。