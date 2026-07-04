---
id: quest-4
title: "Node.js 主線任務四：健身房 Admin 登入系統（JWT + bcrypt）"
sidebar_label: "\u200B第四週"
sidebar_position: 4

description: "> 🛑 防暴雷警示：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！ 本次任務將整合前面所學的知識，替健身房後台加上完整的登入系統。實作範圍包含會員註冊、登入驗證、取得個人資料，並使用 bcrypt 進行密碼雜湊，以及透過 jsonwebtoken JWT 結合中..."
keywords: [Node.js, 主線任務四, 健身房, Admin, 登入系統, JWT, bcrypt, learning, hexschool, nodejs-course, main-quests]
---

> 🛑 **防暴雷警示**：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！

本次任務將整合前面所學的知識，替健身房後台加上完整的**登入系統**。實作範圍包含會員註冊、登入驗證、取得個人資料，並使用 `bcrypt` 進行密碼雜湊，以及透過 `jsonwebtoken (JWT)` 結合中介軟體 (Middleware) 來保護私密路由。

---

## 任務一：JWT 守門員 (`middlewares/verifyToken.js`)

**🎯 題目要求**：

- 讀取 `req.headers.authorization`，header 沒帶或格式錯誤就回應 **401**。
- 使用 `jwt.verify` 驗證 Token，失敗則回應 **401**。
- 驗證通過則將解析出的 payload 掛載到 `req.user` 並呼叫 `next()`。

**💡 關鍵點與常犯錯誤**：

- **提取 Token 的細節**：前端傳來的 Authorization 格式通常為 `Bearer <token>`。檢查時 `startsWith('Bearer ')` **務必注意要有空格**，並且需要用字串分割 (`split(' ')[1]`) 提取出第二個部分的真實 Token。
- **致命崩潰 (Crash) 預警**：驗證 Token (`jwt.verify`) 的過程如果遇到過期或假造的 Token 會直接拋出例外錯誤 (Throw Error)。如果沒有使用 `try...catch` 包覆，整個 Node.js 伺服器會直接當機掛掉！

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

const verifyToken = function (req, res, next) {
  // 1. 取得 authorization 欄位
  const authHeader = req.headers.authorization;

  // 1-1. 檢查是否帶入 authHeader 以及格式是否以 'Bearer ' 開頭
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "false", message: "請先登入" });
  }

  // 1-2. 取得 token 本體
  const token = authHeader.split(" ")[1];

  try {
    // 2-1. 驗證 token 是否正確與未過期
    const decoded = jwt.verify(token, SECRET);

    // 2-2. 將使用者資訊掛載到 req.user
    req.user = decoded;

    // 2-3. 驗證通過，交給下一個 middleware
    next();
  } catch (err) {
    // 3. 解析失敗或已過期，回傳 401
    return res
      .status(401)
      .json({ status: "false", message: "Token 無效或已過期" });
  }
};

module.exports = verifyToken;
```

</details>

---

## 任務二：註冊 API (`POST /auth/register`)

**🎯 題目要求**：

- 檢查 `email` 與 `password` 必填。
- 檢查 `email` 是否已存在。
- 使用 `bcrypt` 進行密碼加密後，存入 `users` 陣列。

**💡 關鍵點與常犯錯誤**：

- **尋找重複信箱**：使用 `Array.some()` 可以有效率地檢查信箱是否已重複註冊。
- **非同步的陷阱**：密碼加密的 `bcrypt.hash()` 屬於非同步操作，記得要在路由函式前加上 `async` 並使用 `await`，否則你會存入一個 Promise 物件而不是加密字串。
- **Headers sent 錯誤**：在做 `if` 條件判斷並回傳錯誤訊息時，務必記得在 `res.status(400).json(...)` 前面加上 **`return`**。否則程式會繼續往下執行，導致出現 `Cannot set headers after they are sent to the client` 的經典報錯。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // 1. 驗證必填欄位
  if (!email || !password) {
    return res
      .status(400)
      .json({ status: "false", message: "缺少 email 或 password" });
  }

  // 2. 驗證信箱唯一性
  const emailExists = users.some((user) => user.email === email);
  if (emailExists) {
    return res.status(400).json({ status: "false", message: "email 已存在" });
  }

  // 3. 密碼加密
  const hashedPassword = await hashPassword(password);

  // 4. 建立使用者資料並存入
  const newUser = {
    id: nextId,
    email: email,
    password: hashedPassword,
  };
  users.push(newUser);
  nextId++;

  // 5. 回傳註冊成功
  res.status(201).json({ status: "success", message: "註冊成功" });
});
```

</details>

---

## 任務三：登入 API (`POST /auth/login`)

**🎯 題目要求**：

- 檢查帳號是否存在，以及密碼是否正確，錯誤皆回傳 **401** 且訊息一致。
- 驗證成功後，使用 `jwt.sign` 簽發 Token。

**💡 關鍵點與常犯錯誤**：

- **防範帳號探測 (Account Enumeration)**：無論是找不到帳號或密碼錯誤，都應統一回傳「帳號或密碼錯誤」，不讓惡意攻擊者猜出哪些信箱已註冊。
- **陣列越界與 Undefined 崩潰**：如果 `users.findIndex` 找不到信箱，會回傳 `-1`。若沒有先判斷 `index === -1` 就直接存取 `users[index].password` 來比對，會引發 `Cannot read properties of undefined` 導致伺服器掛掉。
- **資安大忌**：簽發 Token 的 Payload 裡**絕對不能放密碼**，只能放置 `id` 或 `email` 等非機密識別資訊。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. 尋找使用者
  const index = users.findIndex((item) => item.email === email);

  // 2. 防範帳號探測：找不到使用者統一回傳 401
  if (index === -1) {
    return res.status(401).json({ status: "false", message: "帳號或密碼錯誤" });
  }

  // 3. 驗證密碼
  const checkPassword = await bcrypt.compare(password, users[index].password);

  if (!checkPassword) {
    return res.status(401).json({ status: "false", message: "帳號或密碼錯誤" });
  }

  // 4. 簽發 Token
  const token = jwt.sign(
    { id: users[index].id, email: users[index].email },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

  // 5. 回傳成功與 Token
  res.status(200).json({ status: "success", token });
});
```

</details>

---

## 任務四：取得個人資料 (`GET /auth/me`)

**🎯 題目要求**：

- 此為受保護路由，必須經過 `verifyToken` 驗證。
- 驗證後，直接回傳解析出的使用者資訊 (`req.user`)。

**💡 關鍵點**：

- Express 的路由可以傳入多個 Middleware，將 `verifyToken` 放在路徑與 Controller 之間，就能當作守門員。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
// 注意：在路由路徑和 handler 之間加上 `verifyToken` 作為守門員
router.get("/me", verifyToken, (req, res) => {
  // 驗證成功後，直接回傳在 Middleware 中掛載的 req.user
  res.status(200).json({ status: "success", user: req.user });
});
```

</details>

---

## 任務五：App 組裝 (`app.js`)

**🎯 題目要求**：

- 掛載 `cors`、`express.json` 以及路由。
- 實作 404 守門員與捕捉所有例外的錯誤處理守門員。

**💡 關鍵點與常犯錯誤**：

- **順序非常重要**：404 守門員與錯誤處理守門員必須放在所有路由的**最底下**！
  1. 通用設定 (`cors`, `express.json`)
  2. 應用程式路由 (`/auth`, `/docs`)
  3. **404 找不到路由** (Catch-all)
  4. **全域錯誤處理**
- **魔鬼藏在參數裡**：全域錯誤處理 Middleware **必須有完整四個參數** `(err, req, res, next)`。即使你沒用到 `next` 也**絕對不能省略**！只要少寫一個參數變成三個，Express 就會把它當作一般 Middleware，導致遇到 JSON 格式錯誤 (`SyntaxError`) 時完全無法捕捉！

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const authRouter = require("./routes/auth");
const swaggerDoc = require("./fixtures/swagger.json");

const app = express();

// 1. 允許跨域請求
app.use(cors());

// 2. 解析 JSON Body
app.use(express.json());

// 3. Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 4. 掛載會員路由
app.use("/auth", authRouter);

// 5. 404 守門員
app.use((req, res, next) => {
  res.status(404).json({ status: "false", message: "無此路由資訊" });
});

// 6. 錯誤處理守門員（必須有 4 個參數）
app.use((err, req, res, next) => {
  res.status(500).json({
    err: err.name,
    message: err.message,
  });
});

module.exports = app;
```

</details>