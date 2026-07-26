---
id: bcrypt
title: "🔐 bcrypt 密碼雜湊與驗證"
sidebar_label: "bcrypt 密碼雜湊"
sidebar_position: 1

description: "bcrypt 密碼雜湊與驗證 在處理使用者註冊與登入時，將密碼明碼儲存在資料庫是非常危險的行為。因此，我們會使用 bcrypt 這樣強大的加密函式庫來將密碼進行「雜湊 Hash」。 💡 核心概念 單向加密：設計上無法從 hash 後的字串反推還原出原始密碼，就算資料庫外洩，駭客也無法輕易得知使用者..."
keywords: [🔐, bcrypt, 密碼雜湊與驗證, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "🔐 bcrypt 密碼雜湊與驗證",
        "datePublished": "2026-07-08T13:51:33.508Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "bcrypt 密碼雜湊與驗證 在處理使用者註冊與登入時，將密碼明碼儲存在資料庫是非常危險的行為。因此，我們會使用 bcrypt 這樣強大的加密函式庫來將密碼進行「雜湊 Hash」。 💡 核心概念 單向加密：設計上無法從 hash 後的字串反推還原出原始密碼，就算資料庫外洩，駭客也無法輕易得知使用者..."
      }
    `}
  </script>
</Head>


# bcrypt 密碼雜湊與驗證

在處理使用者註冊與登入時，將密碼明碼儲存在資料庫是非常危險的行為。因此，我們會使用 bcrypt 這樣強大的加密函式庫來將密碼進行「雜湊 (Hash)」。

## 💡 核心概念

- **單向加密**：設計上無法從 hash 後的字串反推還原出原始密碼，就算資料庫外洩，駭客也無法輕易得知使用者的真實密碼。
- **Salt (鹽巴) 的作用**：每次產生雜湊前會隨機生成一串亂碼並加入運算。這確保了即使兩個使用者設定了完全相同的密碼，最終存在資料庫裡的雜湊值也會完全不同（有效防範彩虹表攻擊）。
- **非同步處理**：bcrypt 的雜湊運算 (`hash` 與 `compare`) 是設計成非常消耗 CPU 資源的，必須使用非同步 (`async/await`) 來避免阻塞 Node.js 的主執行緒。

## 🚀 實際應用範例

在實際的 Express.js 後端專案中，我們通常會在「使用者註冊 (Sign Up)」與「使用者登入 (Login)」這兩個 API 路由中使用 bcrypt。

### 安裝套件

```bash
npm install bcrypt
```

### 1. 註冊 (Sign Up)：將密碼雜湊後存入資料庫

當使用者註冊時，我們**絕對不存明文密碼**，而是存經過雜湊處理的字串。

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// 註冊 API 路由
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. 定義 Salt 的複雜度 (Cost Factor)，通常設定為 10 到 12
    const saltRounds = 12;
    
    // 2. 產生 Salt
    const salt = await bcrypt.genSalt(saltRounds);
    
    // 3. 結合 Salt 將密碼進行雜湊
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 4. 將 hashedPassword 存入資料庫
    // await User.create({ email, password: hashedPassword });

    res.status(201).json({ 
      status: 'success', 
      message: '註冊成功'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '伺服器錯誤' });
  }
});
```

### 2. 登入 (Login)：驗證使用者輸入的密碼

登入時，我們從資料庫撈出該使用者的雜湊密碼，然後使用 `bcrypt.compare()` 讓套件自動進行比對。我們**不需要**（也無法）將資料庫的密碼解密，而是將使用者輸入的明文密碼透過相同的機制轉換，再來比對結果。

```javascript
// 登入 API 路由
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. 先從資料庫撈出使用者資料
    // const user = await User.findOne({ email });
    const user = {
      email: 'test@example.com',
      // 這是當初註冊時存進資料庫的雜湊字串
      passwordHash: '$2b$12$K.F1oP0tY/K/aP5H9d8qE.XzQj1...' 
    };

    if (!user) {
      return res.status(401).json({ status: 'error', message: '使用者不存在' });
    }

    // 2. 使用 bcrypt.compare 比對明文密碼與資料庫中的雜湊值
    // compare 會自動解析 hash 中的 salt 並進行運算比對，回傳 boolean
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: '密碼錯誤' });
    }

    // 3. 密碼正確，產生 JWT Token 並回傳給前端...
    res.status(200).json({ status: 'success', message: '登入成功' });
    
  } catch (error) {
    res.status(500).json({ status: 'error', message: '伺服器錯誤' });
  }
});
```

---

## 🙋‍♂️ 常見疑問：既然每次產生的 Salt 都是隨機的，登入時怎麼比對得起來？

這是一個非常棒的問題！當我們呼叫 `bcrypt.hash()` 時，bcrypt **會直接把自動生成的 Salt 綁定並儲存在最終的雜湊字串中**。

如果你仔細觀察存在資料庫裡的雜湊字串（例如：`$2b$12$K.F1oP0tY/K/aP5H9d8qE.XzQj1...`），它其實是由幾個部分組合而成的：

1. **`$2b$`**：bcrypt 的演算法版本代號。
2. **`12$`**：Cost Factor (也就是我們設定的 `saltRounds`)。
3. **`K.F1oP0tY/K/aP5H9d8qE.`**：這就是**當初隨機生成的 Salt**（固定佔據前 22 個字元）。
4. **`XzQj1...`**：最後剩下的部分，才是密碼與 Salt 結合後真正雜湊出來的結果。

### `bcrypt.compare()` 是如何運作的？
當使用者登入並觸發 `bcrypt.compare(輸入的明文密碼, 資料庫的雜湊字串)` 時：
1. 套件會先從「資料庫的雜湊字串」中**萃取出當初的 Salt 與 Cost Factor**。
2. 套件拿著這把萃取出來的 Salt，去跟使用者剛剛輸入的「明文密碼」進行雜湊運算。
3. 最後比對「剛剛算出來的結果」與「字串最後一段的雜湊值」是否一致。

這就是為什麼我們**不需要在資料庫中額外開一個欄位來儲存 Salt**，也不需要自己手動把 Salt 拿出來，`compare` 函式在底層已經全自動幫我們處理好這一切了！