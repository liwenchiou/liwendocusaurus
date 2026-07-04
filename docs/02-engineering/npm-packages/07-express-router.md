---
id: express-router
title: "Express Router 拆分與模組化"
sidebar_label: "​07 Express Router"
sidebar_position: 7

description: "Express Router 拆分與模組化 對於 「Router 拆分及模組化」，最核心的觀念可以總結為：「拒絕義大利麵條程式碼，用樂高積木的方式管理 API」。 這是從「寫腳本」邁向「軟體工程」的第一步，也是後端架構演進的第一個、最重要的分水嶺。 💡 為什麼要拆分？（解決痛點） 在剛學 Expr..."
keywords: [Express, Router, 拆分與模組化, engineering, npm-packages]
---

# Express Router 拆分與模組化

對於 **「Router 拆分及模組化」**，最核心的觀念可以總結為：**「拒絕義大利麵條程式碼，用樂高積木的方式管理 API」**。

這是從「寫腳本」邁向「軟體工程」的第一步，也是後端架構演進的第一個、最重要的分水嶺。

## 💡 為什麼要拆分？（解決痛點）

在剛學 Express 時，我們習慣把所有的 `app.get`、`app.post` 全都塞進同一個 `app.js`（或 `server.js`）裡。

當專案只有 5 支 API 時還好，但如果變成 50 支、100 支 API 時，`app.js` 會變成好幾千行的怪物。這會帶來幾個災難：
* **海底撈針**：要找一支特定的 API 像在迷宮裡找路。
* **團隊協作地獄**：三個工程師同時在改 `app.js`，每次 Push 都會發生 Git Merge Conflict。
* **無法局部攔截**：如果某些 API 需要權限驗證、某些不用，全混在一起會讓 Middleware 的掛載變得異常混亂。

## 🎯 核心理念：關注點分離 (SoC)

就像電腦裡的檔案不能全塞在桌面上，必須建立資料夾一樣；API 也必須**依照「業務邏輯（Domain）」進行分類**。

例如：把與「使用者」相關的 API 切成一包、與「商品」相關的切成一包、與「訂單」相關的切成一包。這符合「單一職責原則 (SRP)」，讓每個模組只專心做好自己份內的事。

## 🚀 具體實踐：`express.Router()`

Express 提供了 `express.Router()`，你可以把它想像成一個**「迷你版的 app」**或是**「一塊樂高積木」**。

### 步驟一：打造獨立的樂高積木

我們會在獨立的檔案中（例如 `routes/users.js`）定義這組路由：

```javascript
const express = require('express');
const router = express.Router(); // 建立迷你 app

// 這裡的 '/' 實際上會接在主程式設定的前綴之後 (也就是 /api/users/)
router.get('/', (req, res) => {
  res.send('取得所有使用者');
});

router.post('/', (req, res) => {
  res.send('新增使用者');
});

router.get('/:id', (req, res) => {
  res.send('取得特定使用者');
});

module.exports = router; // 將這塊積木匯出
```

### 步驟二：將積木組裝到主基地

回到主程式 `app.js`，我們只需定義**「前綴網址」**，並把積木插上去：

```javascript
const express = require('express');
const app = express();

// 引入我們寫好的 router 積木
const userRouter = require('./routes/users');
const productRouter = require('./routes/products');

// 將積木組裝上去，並定義共用的前綴
app.use('/api/users', userRouter); 
app.use('/api/products', productRouter); 
```

## ✨ 拆分後帶來的三大好處

1. **網址不重複 (DRY 原則)**：在主程式統一定義了 `/api/users`，在 `users.js` 裡面就不用一直重複寫這個前綴，程式碼超乾淨。
2. **精準掛載 Middleware**：如果只有「會員專區」需要驗證身分，你可以很優雅地只針對那塊積木掛載：`app.use('/api/users', checkAuthMiddleware, userRouter);`，完全不會影響到商品區。
3. **分層架構的基石**：將 Router 拆分出來後，下一步才能順理成章地將「商業邏輯」繼續抽離到 `Controller` 和 `Service` 層，實現真正的企業級三層架構（MVC 演進）。