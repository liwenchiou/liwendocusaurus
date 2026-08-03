---
id: dotenv
sidebar_position: 3
title: "dotenv (環境變數)"
sidebar_label: "dotenv (環境變數)"

description: "dotenv 環境變數管理套件 💡 為什麼需要這個套件？ 在 Node.js 開發中，我們經常會有一些機密資訊（如資料庫連線字串、API 金鑰等）或是環境依賴的設定（如 PORT 號、上傳路徑 UPLOADDIR）。我們絕對不能將這些資訊寫死在程式碼 Hardcode 裡面，否則推送到 GitHu..."
keywords: [dotenv, 環境變數, engineering, npm-packages]
---


# `dotenv` - 環境變數管理套件

## 💡 為什麼需要這個套件？
在 Node.js 開發中，我們經常會有一些**機密資訊**（如資料庫連線字串、API 金鑰等）或是**環境依賴的設定**（如 PORT 號、上傳路徑 `UPLOAD_DIR`）。我們絕對不能將這些資訊寫死在程式碼 (Hardcode) 裡面，否則推送到 GitHub 上會造成嚴重的資安漏洞。

`dotenv` 套件可以幫我們讀取根目錄下的 `.env` 檔案，並將裡面的設定值自動載入到 Node.js 的 `process.env` 環境變數中。

## 📦 安裝方式

```bash
npm install dotenv
```

## 🚀 基本使用範例

1. 在專案根目錄建立 `.env` 檔案：
```env
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
GYM_NAME=Liwen的超級健身房
```

2. 在主程式 (`app.js` 或 `index.js`) 的最上方引入並執行：

```javascript
// 引入 dotenv
const dotenv = require("dotenv");

// 執行設定並取得回傳結果 (可選)
const result = dotenv.config().parsed;

function getUploadConfig() {
  // 使用環境變數，並加上預設值防呆
  return {
    uploadDir: process.env.UPLOAD_DIR || "./default_uploads",
    maxFileSize: Number(process.env.MAX_FILE_SIZE_MB) || 2,
    gymName: process.env.GYM_NAME || "未命名健身房",
  };
}

console.log(getUploadConfig());
```

> **⚠️ 重要提醒：**
> 絕對要記得將 `.env` 加入到 `.gitignore` 檔案中，避免將機密檔案上傳到版本控制系統。