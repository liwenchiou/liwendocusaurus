---
id: quest-2
title: 第二週：主線任務實作
sidebar_position: 2
---

# 🚀 Node.js 主線任務二：原生 HTTP 與檔案上傳 (Formidable)

<details>
<summary>🛑 劇透防護線：點擊展開解答與實作細節</summary>

> **強烈建議**：請先親手寫過一次，真的卡關再來對照參考，學習效果才會最好喔！

本次任務學習了如何使用 Node.js 原生的 `node:http` 模組建立伺服器，並結合第三方套件 `formidable` (v3) 來處理前端傳來的 `multipart/form-data`（檔案上傳）。

為了讓程式碼結構更清晰、好維護，我們將整個流程拆分成多個「單一職責 (Single Responsibility)」的小函式。

---

## 1. 取得上傳設定與環境變數 (Config)
利用 `process.env` 讀取環境變數，並加上 `||` 給予預設值，避免環境變數未設定時發生錯誤。特別注意將字串轉換為 Number，並將大小從 MB 換算成 Bytes。

```javascript
function getUploadConfig() {
  return {
    uploadDir: process.env.UPLOAD_DIR || "/tmp",
    maxFileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
    gymName: process.env.GYM_NAME || "未命名健身房",
  };
}
```

## 2. 擷取檔案副檔名
使用 `lastIndexOf(".")` 找出檔案名稱中最後一個點的位置，再透過 `slice` 切割出副檔名，最後用 `toLowerCase()` 統一轉為小寫格式。

```javascript
function getFileExtension(filename) {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return filename.slice(dotIndex).toLowerCase();
}
```

## 3. 解析與格式化 Metadata
收到上傳的檔案後，將 Formidable 解析出來的 `file` 物件提取出我們需要的關鍵資訊，例如：轉換檔案大小單位為 KB、以及取得其副檔名。

```javascript
function parseFileMetadata(file) {
  return {
    filename: file.originalFilename,
    sizeKB: Math.round(Number(file.size) / 1024),
    ext: getFileExtension(file.originalFilename),
  };
}

function formatUploadLog(meta, config) {
  return `[${config.gymName}] Uploaded ${meta.filename} (${meta.sizeKB} KB) → ${config.uploadDir}`;
}
```

## 4. 路由分派與檔案上傳邏輯
這裡是伺服器處理的核心。我們將「路由判斷」與「處理上傳」分開，保持 `router` 函式的乾淨與可讀性。

### 路由判斷 (Router)
只做一件事：比對 `req.method` 與 `req.url`。符合規則就交給 `handleUpload`，否則退回 404 Not Found。
```javascript
function router(req, res, config) {
  if (req.method === "POST" && req.url === "/coaches/avatar") {
    handleUpload(req, res, config);
  } else {
    handleNotFound(req, res);
  }
}
```

### 上傳處理 (handleUpload)
利用 `formidable({ ... })` 實體化解析器。
**⚠️ 注意事項：**
1. **Error 事件**：可以透過 `form.on("error")` 額外捕捉底層錯誤並留下記錄 (log)。
2. **檔案取得**：在 Formidable v3 版本中，`files` 內對應的欄位是一個「陣列」，因此必須使用 `files.file[0]` 來取得單一檔案物件。
3. **回傳結果**：上傳完畢後利用先前寫好的功能 (`parseFileMetadata`, `formatUploadLog`) 組裝資訊回傳前端。

```javascript
function handleUpload(req, res, config) {
  const form = formidable({
    uploadDir: config.uploadDir,
    maxFileSize: config.maxFileSize,
    keepExtensions: true,
  });

  form.on("error", (err) => {
    console.log(err); // 記錄底層 Log
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
      return;
    }

    const file = files.file && files.file[0];
    if (!file) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No file uploaded" }));
      return;
    }

    // 解析資料與紀錄 Log
    const meta = parseFileMetadata(file);
    console.log(formatUploadLog(meta, config));

    // 回傳成功資訊
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        filename: meta.filename,
        sizeKB: meta.sizeKB,
        ext: meta.ext,
        savedPath: file.filepath, 
      })
    );
  });
}
```

## 5. 建立 HTTP 伺服器
最後將以上邏輯封裝進 `createUploadServer`。在綁定 Router 之前，先透過 `fs.existsSync` 檢查設定的 `uploadDir` 是否存在，若無則利用 `fs.mkdirSync` 自動建立資料夾，避免發生系統找不到路徑的崩潰。

```javascript
function createUploadServer(config) {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  const server = http.createServer((req, res) => {
    router(req, res, config);
  });

  return server;
}
```

</details>
