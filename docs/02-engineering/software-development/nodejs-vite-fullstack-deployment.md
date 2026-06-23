---
id: nodejs-vite-fullstack-deployment
title: "Node.js 與 Vite 整合部署策略"
sidebar_label: "Node.js 全端部署"
---

# Node.js 與 Vite 整合部署策略

## 1. 架構核心概念：資源調度中心

不再為每個前端專案開設獨立伺服器，改以 **MainServer** 為核心入口，透過路徑分流（Routing）統一派送靜態資源與處理後端 API。

- 🖥️ **MainServer (Express)**：擔任資源派送者 (Static Server) 與 API 入口
- ⚡ **Project 1~3 (Vite)**：擔任獨立的前端應用，透過編譯 (Build) 將產出物歸位

---

## 2. 目錄結構規劃 (Convention)

維持清晰的專案層級，便於管理與自動化串接：

```
/my-workspace
  ├── MainServer/           # 主伺服器
  │     ├── index.js        # 伺服器啟動檔
  │     └── public/         # 靜態資源區
  │           ├── p1/       # Project 1 的 build 產出
  │           └── p2/       # Project 2 的 build 產出
  ├── Project1/             # 前端專案 (Vite)
  └── Project2/             # 前端專案 (Vite)
```

---

## 3. 【實戰步驟一】從零初始化專案

對於初學者，請開啟終端機，跟著以下指令建立出對應的資料夾與基礎環境：

```bash
# 1. 建立並進入工作區 (Workspace)
mkdir my-workspace && cd my-workspace

# 2. 建立主伺服器 (後端)
mkdir MainServer && cd MainServer
npm init -y
npm install express
cd ..

# 3. 建立前端專案 (這裡以 React + Vite 為例)
npm create vite@latest Project1 -- --template react
cd Project1
npm install
cd ..
```

---

## 4. 【實戰步驟二】主伺服器邏輯 `MainServer/index.js`

使用 Express 將特定路由對應到 `public` 資料夾。這裡我們加入了 **Vite 快取優化** 與 **SPA 404 防呆機制**，確保靜態資源遺失時不會回傳錯誤的 HTML：

```js
const express = require("express");
const path = require("path");
const app = express();

// 💡 最佳實踐：永遠將 API 路由寫在前端靜態資源前面，避免被 SPA 路由攔截
app.get("/api/data", (req, res) => {
  res.json({ status: "success", data: "Shared Backend" });
});

// 路由派送函式 (包含快取優化與 SPA 防呆)
const serveProject = (projPath) => [
  // 1. 靜態資源派送與快取設定
  express.static(path.join(__dirname, projPath), {
    setHeaders: (res, reqPath) => {
      if (reqPath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache'); // HTML 絕對不快取
      } else if (reqPath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Vite JS/CSS 快取一年
      }
    }
  }),
  // 2. SPA 路由 Fallback 防呆機制
  (req, res, next) => {
    // 只有當瀏覽器明確要求 HTML 時，才回傳 index.html 交由前端 Router 接管
    if (req.method === 'GET' && req.accepts('html')) {
      res.sendFile(path.join(__dirname, `${projPath}/index.html`));
    } else {
      // 若是要求圖片或 JS 卻找不到，乖乖回傳 404 錯誤，避免發生 SyntaxError
      res.status(404).send('Resource not found');
    }
  },
];

// 路由設定
app.use("/p1", serveProject("public/p1"));
app.use("/p2", serveProject("public/p2"));

app.listen(3000, () => console.log("MainServer is running on port 3000"));
```

---

## 5. 【實戰步驟三】前端自動化部署 (Vite 配置)

修改 `vite.config.js`，達成「建置即部署」，免除手動複製檔案的繁瑣：

```js
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    // 指向 MainServer 的公開目錄
    outDir: path.resolve(__dirname, "../MainServer/public/p1"),
    emptyOutDir: true,
  },
  // 設定 base 路徑，確保瀏覽器請求資源時路徑正確
  base: "/p1/",
});
```

---

## 6. 【實戰步驟四】編譯與啟動測試

當前後端的程式碼都設定好後，請依照以下順序執行，見證全端串接的魔法：

```bash
# 1. 先進入前端專案，將程式碼打包成純靜態資源
cd Project1
npm run build

# 2. 接著回到後端專案，啟動 Express 伺服器
cd ../MainServer
node index.js
```

成功啟動後，打開瀏覽器前往 `http://localhost:3000/p1`，你就能看到打包好的前端畫面。若向 `http://localhost:3000/api/data` 發送請求，也能成功取得後端資料，完全不會遇到煩人的 CORS 跨域問題！

---

## 7. 架構優勢分析

| 優勢                                | 說明                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| 🔧 降低複雜度                 | 統一維護一個 PM2 進程，簡化伺服器資源管理                  |
| 🌐 解決跨域問題 | 前端與後端處於同源 (Same-Origin)，無需處理繁瑣的 CORS 預檢 |
| 🚀 CI/CD 親和性               | 此結構極易與 GitHub Actions 串接，實現自動化部署流程       |
| 🧩 維護性                     | 各前端專案邏輯隔離，升級其中一個專案不會影響其他專案       |

---

## 8. 進階建議 (Production Readiness)

- 🔒 **環境變數**：透過 `.env` 區分開發與正式環境的 API 網域
- 📊 **進程管理**：使用 PM2 進行監控與日誌管理，確保服務在背景持續穩定運行
- 🔀 **反向代理**：若未來流量變大，可考慮在 Node.js 前端架設 Nginx，由 Nginx 處理靜態檔案派送與 HTTPS 加密，效能將更為優化

---

## 💡 實作心法

> 此架構的核心不在於技術的複雜性，而在於「**秩序感**」。  
> 當你能透過簡單的 `npm run build` 掌控所有專案的發布流向時，  
> 你就已經跨越了單純寫程式的階段，進入了**系統架構維護**的領域。
