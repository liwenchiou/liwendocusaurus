---
id: formidable
title: "formidable"
sidebar_label: "formidable"
sidebar_position: 8

description: "formidable formidable 是一個專門用來解析 Node.js 中處理 multipart/formdata（例如上傳檔案）的套件。它能夠非常有效率地將前端傳來的檔案與表單欄位拆解開來，方便後端儲存與處理。 安裝 bash npm install formidable 基本概念與使用..."
keywords: [formidable, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "formidable",
        "datePublished": "2026-07-08T13:51:33.511Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "formidable formidable 是一個專門用來解析 Node.js 中處理 multipart/formdata（例如上傳檔案）的套件。它能夠非常有效率地將前端傳來的檔案與表單欄位拆解開來，方便後端儲存與處理。 安裝 bash npm install formidable 基本概念與使用..."
      }
    `}
  </script>
</Head>


# formidable

`formidable` 是一個專門用來解析 Node.js 中處理 `multipart/form-data`（例如上傳檔案）的套件。它能夠非常有效率地將前端傳來的檔案與表單欄位拆解開來，方便後端儲存與處理。

## 安裝

```bash
npm install formidable
```

## 基本概念與使用範例

當我們收到前端帶有檔案的請求時，我們可以透過 `formidable` 來解析 `req`：

```javascript
const formidable = require('formidable');
const express = require('express');
const app = express();

// 在路由處理中
app.post('/upload', (req, res, next) => {
  const form = formidable({ 
    multiples: true, // 允許上傳多個檔案
    uploadDir: './uploads', // 指定檔案上傳後暫存的資料夾路徑
    keepExtensions: true // 保留檔案的原始副檔名 (例如 .png, .jpg)
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    
    // fields: 一般的表單文字欄位
    // files: 包含上傳檔案的詳細資訊 (如 originalFilename, filepath 等)
    
    // 取得檔案資訊範例：
    const userAvatar = files.report?.[0];
    if (userAvatar) {
      console.log(`[解析成功] 檔案名稱為:${userAvatar.originalFilename}`);
      console.log(`[暫存路徑] 檔案位於:${userAvatar.filepath}`);
    }
    
    res.json({ fields, files });
  });
});
```

## 常見檔案資訊屬性
當我們取得 `files` 物件中的檔案陣列後，每個檔案通常會包含：
- `originalFilename`：使用者上傳時的原始檔案名稱。
- `filepath`：檔案上傳後，在伺服器上的暫存實體路徑。
- `mimetype`：檔案的 MIME 類型（如 `image/png`、`application/pdf`）。
- `size`：檔案大小（位元組 bytes）。