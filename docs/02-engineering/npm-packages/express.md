---
id: express
title: express
---

# 📦 express

`express` 是 Node.js 最經典、最主流的 Web 應用框架。它大幅簡化了原生 `http` 模組繁瑣的設定，提供了極簡且靈活的路由系統與中介軟體 (Middleware) 架構。

## 安裝

```bash
npm install express
```

## 基本使用範例

建立一個最基礎的 Express 伺服器並設計路由非常簡單：

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

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`伺服器啟動中：http://localhost:${PORT}`);
});
```

## 核心特色
1. **中介軟體 (Middleware)**：可以像流水線一樣，在請求到達最終路由前進行攔截、處理（例如驗證 Token、解析 Body 等）。
2. **極簡路由**：提供 `app.get()`, `app.post()`, `app.patch()`, `app.delete()` 等直覺的 HTTP 動詞對應。
3. **靈活解析**：內建 `express.json()` 等工具，可輕鬆解析前端傳來的 JSON 格式資料。
