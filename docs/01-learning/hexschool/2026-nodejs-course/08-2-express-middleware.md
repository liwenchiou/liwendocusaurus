---
id: express-middleware
title: "Express Generator 與 Middleware 中介軟體"
sidebar_label: "8-2 Express & Middleware"
sidebar_position: 16

description: "Express Generator 與 Middleware 中介軟體 本篇筆記涵蓋了如何使用 Express Generator 快速建置專案，以及 Express 框架中最重要的核心：Middleware 中介軟體 的運作機制。 1. Express Generator 快速建置專案 1.1 全..."
keywords: [Express, Generator, Middleware, 中介軟體, learning, hexschool, nodejs-course]
---


# Express Generator 與 Middleware 中介軟體

本篇筆記涵蓋了如何使用 Express Generator 快速建置專案，以及 Express 框架中最重要的核心：Middleware (中介軟體) 的運作機制。

---

## 1. Express Generator 快速建置專案

### 1.1 全域安裝 Generator
```bash
npm install express-generator -g
```

### 1.2 建立應用程式資料夾與骨架
先移動到你要建立專案的目錄下，然後輸入：
```bash
express -e express-generator-test
```
> **💡 指令詳解：**
> - `express`：呼叫 express-generator 產生器。
> - `-e`：參數全名為 `--ejs`，代表指定使用 **EJS** 作為網頁模板引擎 (View Engine)。若不加此參數，官方預設會使用 Jade (Pug)。
> - `express-generator-test`：專案資料夾名稱。執行後，會自動產生這個資料夾，並建置好所有基礎結構與檔案。

### 1.3 安裝依賴並啟動
```bash
cd express-generator-test
npm i
npm start
```
到 `http://localhost:3000/` 應該就能看到成功的畫面了！

---

## 2. Middleware 中介軟體核心概念

1. Middleware (中介軟體) 的核心概念就像是**加工站**，本質上是一個 **函式 (Function)**。
2. `app.use` 可以想像成一個**守門員**，使用者發送請求進來，會先經過 `app.use` 過濾與處理。

```javascript
const express = require('express');
const app = express();

app.use(function(req, res, next){
    console.log('有人進來！！');
    next(); // 必須呼叫 next() 才會將控制權交給下一個中介軟體
});

app.get('/', function(req, res){
    res.send('1234index');
});

// 監聽
const port = process.env.PORT || 3000;
app.listen(port);
```
> **注意**：`app.use` 的順序非常重要，通常必須放在路由處理的前面。

---

## 3. Middleware 實戰：404 與 500 錯誤處理

### 3.1 處理 404 (找不到網頁)
如果使用者使用未設定的路由進來，直接導到 404 處理。這個守門員必須**放在所有路由的最後面**，當前面都找不到匹配時，就會落入這個陷阱。
```javascript
app.use(function (req, res, next) {
  res.status(404).send("抱歉，你的頁面找不到");
});
```

### 3.2 處理 500 (伺服器錯誤)
只要中介軟體的參數長度是 4 個 `(err, req, res, next)`，Express 就會把它認定為專門處理錯誤的守門員。
```javascript
app.use(function(err, req, res, next){
    console.log(err.stack);
    res.status(500).send('程式有問題，請稍候嘗試');
});
```

---

## 4. Middleware 實戰：全域與區域 (Route-level)

### 4.1 全域使用 (Global Middleware)
所有進來的請求都會先經過這個函式，通常用在解析 JSON 或記錄 Log。
```javascript
const checkLogin = function (req, res, next) {
  console.log("經過全域守門員");
  next();
};

app.use(checkLogin);
```

### 4.2 區域使用 (Route-level Middleware)
只針對特定的路由當守門員，通常用在檢查「特定頁面」是否登入。
```javascript
const authLogin = function (req, res, next) {
  // 這裡示範用 query string 來判斷 (例如網址後面加上 ?user=admin)
  if (req.query.user === "admin") {
    next(); // 身份正確，放行
  } else {
    res.send("登入資料錯誤"); // 身份錯誤，直接擋下來並回傳錯誤畫面
  }
};

// 把 authLogin 夾在路徑與最終的回應函式中間
app.get("/dashboard", authLogin, function (req, res) {
  res.send("歡迎來到管理員後台");
});
```