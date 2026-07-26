---
id: uuid
sidebar_position: 4
title: "uuid (唯一識別碼)"
sidebar_label: "uuid (唯一識別碼)"

description: "uuid 產生通用唯一識別碼 💡 為什麼需要這個套件？ 在開發系統時，我們經常需要為資料庫的每筆紀錄、上傳的檔案或 Session 產生一個「絕對不重複」的 ID。uuid 套件可以幫我們根據時間戳或是隨機數產生符合 RFC 4122 標準的 UUID Universally Unique Ide..."
keywords: [uuid, 唯一識別碼, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "uuid (唯一識別碼)",
        "datePublished": "2026-07-08T13:51:33.509Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "uuid 產生通用唯一識別碼 💡 為什麼需要這個套件？ 在開發系統時，我們經常需要為資料庫的每筆紀錄、上傳的檔案或 Session 產生一個「絕對不重複」的 ID。uuid 套件可以幫我們根據時間戳或是隨機數產生符合 RFC 4122 標準的 UUID Universally Unique Ide..."
      }
    `}
  </script>
</Head>


# `uuid` - 產生通用唯一識別碼

## 💡 為什麼需要這個套件？
在開發系統時，我們經常需要為資料庫的每筆紀錄、上傳的檔案或 Session 產生一個「絕對不重複」的 ID。`uuid` 套件可以幫我們根據時間戳或是隨機數產生符合 RFC 4122 標準的 UUID (Universally Unique Identifier)。

## 📦 安裝方式

```bash
npm install uuid
```

## 🚀 基本使用範例

最常用的是 `v4` 版本（基於亂數產生）：

```javascript
const { v4: uuidv4 } = require('uuid');

// 產生一個全新的 UUID
const newId = uuidv4(); 
console.log(newId); 
// 輸出範例：'1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
```

> **💡 常見應用情境：**  
> 處理使用者上傳的檔案時，可以將原檔名替換成 `uuidv4() + 原始副檔名`，藉此避免檔名重複導致檔案被覆蓋的問題！