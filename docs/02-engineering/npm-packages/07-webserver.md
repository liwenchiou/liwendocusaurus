---
id: webserver
sidebar_position: 7
title: "webserver (http)"
sidebar_label: "\u200B07 webserver (http)"
---

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

> **進階觀念：**  
> 使用原生 `http` 處理 POST 請求的 JSON body 時，必須手動監聽 `req.on('data')` 將 buffer 資料塊 (chunks) 拼湊起來，並在 `req.on('end')` 進行 `JSON.parse`。這也是為什麼我們實務上都會依賴 `Express` 等框架來簡化開發流程！
