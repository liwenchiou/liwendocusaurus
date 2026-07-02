---
id: quest-2
title: "Node.js 主線任務二：原生 HTTP 與檔案上傳 (Formidable)"
sidebar_label: "\u200B第二週"
sidebar_position: 2
---

> 🛑 **防暴雷警示**：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！

本次任務學習了如何使用 Node.js 原生的 `node:http` 模組建立伺服器，並結合第三方套件 `formidable` (v3) 來處理前端傳來的 `multipart/form-data`（檔案上傳）。

為了讓程式碼結構更清晰、好維護，我們將整個流程拆分成多個「單一職責 (Single Responsibility)」的小函式。

---

## 1. 取得上傳設定與環境變數 (Config)
利用 `process.env` 讀取環境變數，並加上 `||` 給予預設值，避免環境變數未設定時發生錯誤。

**關鍵點**：
- 使用邏輯或運算子 `||` 設定變數的預設值。
- 環境變數進來時是字串格式，必須使用 `Number()` 轉換型態。
- 需將環境變數設定的 MB 大小，乘以 `1024 * 1024` 換算為系統實際可用的 Bytes 單位。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function getUploadConfig() {
  return {
    uploadDir: process.env.UPLOAD_DIR || "/tmp",
    maxFileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024,
    gymName: process.env.GYM_NAME || "未命名健身房",
  };
}
```

</details>

## 2. 擷取檔案副檔名
將上傳檔案的完整名稱進行切割，以取得副檔名（例如 `.png`, `.jpg`）。

**關鍵點**：
- 使用 `lastIndexOf(".")` 找出副檔名的起始小數點位置。
- 如果找不到 `.` (回傳 -1)，需提前 return 空字串避免錯誤。
- 使用 `slice()` 切割字串，並強制套用 `toLowerCase()` 轉為小寫，確保後續檢查大小寫一致。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function getFileExtension(filename) {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return filename.slice(dotIndex).toLowerCase();
}
```

</details>

## 3. 解析與格式化 Metadata
收到上傳的檔案後，將 Formidable 解析出來的 `file` 物件提取出我們需要的關鍵資訊。

**關鍵點**：
- 取得的檔案大小 (`file.size`) 為 Bytes，除以 `1024` 後需使用 `Math.round()` 四捨五入為 KB。
- 整合前面寫好的 `getFileExtension` 函式，組裝包含 `filename`, `sizeKB`, `ext` 的乾淨物件以供記錄或回傳使用。

<details>
<summary>💻 點擊展開程式碼解答</summary>

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

</details>

## 4. 路由分派與檔案上傳邏輯
這裡是伺服器處理的核心。我們將「路由判斷」與「處理上傳」分開，保持 `router` 函式的乾淨與可讀性。

### 路由判斷 (Router)
只做一件事：決定誰來處理這個請求。

**關鍵點**：
- 必須同時比對 `req.method === "POST"` 與 `req.url === "/coaches/avatar"`。
- 不符合此路由的其他請求，應統一導向自訂的處理函式 (如 `handleNotFound`)，回傳 404 狀態碼。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
function handleNotFound(req, res) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
}

function router(req, res, config) {
  if (req.method === "POST" && req.url === "/coaches/avatar") {
    handleUpload(req, res, config);
  } else {
    handleNotFound(req, res);
  }
}
```

</details>

### 上傳處理 (handleUpload)
利用 `formidable({ ... })` 實體化解析器來接收並儲存檔案。

**關鍵點**：
- **Error 捕捉**：使用 `form.on("error")` 額外捕捉 Formidable 底層錯誤並使用 `console.log` 記錄。
- **陣列解構**：在 Formidable v3 版本中，`files` 解析出來的欄位是一個「陣列」，必須使用 `files.file[0]` 來取得實際的單一檔案物件。
- **防呆檢查**：若前端未傳送檔案 (`!file`)，需以 `res.writeHead` 回傳 `400 Bad Request` 與對應的 JSON 錯誤訊息。
- **回應成功**：處理完畢後，回傳 `200 OK`，並設定 `Content-Type: application/json`，將整理好的資料字串化回傳前端。

<details>
<summary>💻 點擊展開程式碼解答</summary>

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

</details>

## 5. 建立 HTTP 伺服器
最後將以上邏輯封裝進 `createUploadServer`，並綁定 Router。

**關鍵點**：
- 在建立伺服器前，務必使用 `fs.existsSync` 檢查環境變數所設定的 `uploadDir` 是否存在。
- 若不存在，需使用 `fs.mkdirSync` 建立資料夾，並且必須加上 `{ recursive: true }` 參數，以支援多層級目錄的自動建立。
- 透過 `http.createServer` 啟動伺服器並綁定 `router` 函式處理所有請求。

<details>
<summary>💻 點擊展開程式碼解答</summary>

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
