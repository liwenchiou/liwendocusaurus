---
id: jsonwebtoken
title: "🔑 JSON Web Token (JWT)"
sidebar_label: "JSON Web Token"
sidebar_position: 2

description: "JSON Web Token JWT jsonwebtoken 是一個廣泛使用的 npm 套件，用來實作 JSON Web Token JWT。在網頁應用程式中，我們經常使用它來處理使用者登入的驗證（Authentication）以及授權（Authorization）機制。 💡 核心概念 簽發 S..."
keywords: [🔑, JSON, Web, Token, JWT, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "🔑 JSON Web Token (JWT)",
        "datePublished": "2026-07-08T13:51:33.508Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "JSON Web Token JWT jsonwebtoken 是一個廣泛使用的 npm 套件，用來實作 JSON Web Token JWT。在網頁應用程式中，我們經常使用它來處理使用者登入的驗證（Authentication）以及授權（Authorization）機制。 💡 核心概念 簽發 S..."
      }
    `}
  </script>
</Head>


# JSON Web Token (JWT)

`jsonwebtoken` 是一個廣泛使用的 npm 套件，用來實作 JSON Web Token (JWT)。在網頁應用程式中，我們經常使用它來處理使用者登入的驗證（Authentication）以及授權（Authorization）機制。

## 💡 核心概念

- **簽發 (Sign)**：使用 `jwt.sign(payload, secretOrPrivateKey, [options, callback])` 方法來產生一組加密字串（Token）。
- **Payload (負載)**：準備放入 Token 中的自訂資料。注意：JWT 是可以被輕鬆解碼的，**千萬不要在 Payload 中放入密碼或機密資料**。
- **Secret (密鑰)**：伺服器用來簽發 Token 的鑰匙。伺服器必須妥善保存此密鑰（通常存放在 `.env` 環境變數中），避免 Token 遭到偽造。
- **Options (選項)**：可以設定如 `expiresIn` 等屬性來控制 Token 何時過期（例如 `'7d'` 代表 7 天後過期、`'1h'` 代表 1 小時後過期）。

## 📦 安裝方式

```bash
npm install jsonwebtoken
```

## 🚀 實際應用範例

在實際的後端專案中，我們會在使用者成功登入後，簽發一組 JWT Token 讓前端儲存起來，作為後續請求的通行證。

### 簽發 JWT Token 範例

```javascript
require("dotenv").config();
const jwt = require("jsonwebtoken");

// 從環境變數取得密鑰
const SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  // 使用 jwt.sign 方法產生 JWT token
  // 第一個參數：payload，準備放入 token 中的資料 (通常不放機密資料)
  // 第二個參數：secretOrPrivateKey，從環境變數取得的密鑰
  // 第三個參數：options，設定 expiresIn 為 '7d' 表示 7 天後過期
  const token = jwt.sign(user, SECRET, { expiresIn: '7d' });
  
  return token;
}

// 測試執行：假設使用者帳號密碼驗證成功
const user = { id: 1, email: "member@gym.com" };
const token = generateToken(user);

console.log("簽發的 Token：", token);
```