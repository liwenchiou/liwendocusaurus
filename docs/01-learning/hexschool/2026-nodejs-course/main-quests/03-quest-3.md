---
id: quest-3
title: "Node.js 主線任務三：Express.js 基礎"
sidebar_label: "\u200B第三週"
sidebar_position: 3

description: "> 🛑 防暴雷警示：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！ 本次任務正式進入 Express.js 的世界！我們學習了如何使用 Express 框架建立伺服器、掛載中介軟體 Middleware，並將路由模組化拆分，實作了完整的 RESTful API ..."
keywords: [Node.js, 主線任務三, Express.js, 基礎, learning, hexschool, nodejs-course, main-quests]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Node.js 主線任務三：Express.js 基礎",
        "datePublished": "2026-07-08T13:51:33.467Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "> 🛑 防暴雷警示：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！ 本次任務正式進入 Express.js 的世界！我們學習了如何使用 Express 框架建立伺服器、掛載中介軟體 Middleware，並將路由模組化拆分，實作了完整的 RESTful API ..."
      }
    `}
  </script>
</Head>


> 🛑 **防暴雷警示**：以下筆記包含主線任務的解答與實作細節，強烈建議先親手寫過一次，卡關再來對照參考喔！

本次任務正式進入 Express.js 的世界！我們學習了如何使用 Express 框架建立伺服器、掛載中介軟體 (Middleware)，並將路由模組化拆分，實作了完整的 RESTful API 與檔案上傳功能。

---

## 任務一：資料初始化與輔助函式 (`routes/members.js`)

**🎯 題目要求**：
- 依據 `query.level` 篩選，沒帶就回全部。
- 驗證 `body` 有沒有 `name`、`level` 欄位，要擋 null / undefined / `{}`。
- 驗證通過 → `{ valid: true }`
- 驗證失敗 → `{ valid: false, error: '缺 name 或 level' }`

**💡 關鍵點**：
- 使用展開運算子 `[...initialMembers]` 建立陣列副本，避免污染原始假資料。
- 建立 `filterByQuery` 處理 Query String (`req.query.level`) 篩選。
- 建立 `validateBody` 處理必填欄位驗證，並回傳驗證結果物件。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
// 使用展開運算子 (...) 拷貝外部資料，避免污染原始檔案
const members = [...initialMembers];
// (提示: 開發時可使用 console.log(members) 先確認陣列內容)

// 預設已有 4 筆資料，故下一筆新增的 id 從 5 開始
let nextId = 5;

// 實作 filterByQuery：根據 query.level 篩選會員
function filterByQuery(list, query) {
  // 判斷網址是否有帶 query.level 參數，若有則進行篩選，若無則回傳完整名單
  if (query.level) {
    return list.filter((item) => item.level === query.level);
  }
  return list;
}

// 實作 validateBody：驗證必填欄位 (name, level)
function validateBody(body) {
  // 阻擋 null / undefined / {} 或缺少必填欄位的情況
  if (!body || !body.name || !body.level) {
    // 驗證失敗：回傳 valid: false 與錯誤訊息
    return { valid: false, error: "缺 name 或 level" };
  }
  // 驗證成功：回傳 valid: true
  return { valid: true };
}
```
</details>

## 任務二：查詢會員 (`GET`)

**🎯 題目要求**：
1. **取得所有會員**：
   - 輸入：`req.query.level` 可帶 `'VIP' | 'normal'`（選填）
   - 輸出：`200` + `[{ id, name, level }, ...]`
2. **取得單一會員**：
   - 輸入：`req.params.id`（字串，需使用 `Number()` 轉換）
   - 輸出：`200` + `{ id, name, level }`，或 `404` + `{ error: '會員不存在' }`（找不到時）

**💡 關鍵點與常犯錯誤**：
- `GET /`：利用前面寫好的 `filterByQuery` 處理篩選邏輯。
- **型別陷阱 (`GET /:id`)**：從 `req.params` 取得的網址參數永遠是「字串」。如果你忘記加上 `Number(id)` 進行轉型，在用 `find` 嚴格比對 (`===`) 時會因為型別不同（數字 vs 字串）而永遠找不到資料，導致所有查詢都變成 404 找不到會員！

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.get("/", (req, res) => {
  // 呼叫 filterByQuery()，將完整的 members 陣列與 req.query 傳入過濾
  const filteredList = filterByQuery(members, req.query);
  res.status(200).json(filteredList);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  // 從 req.params 取得的 ID 為字串，須轉型為數字後，用 find() 在陣列中搜尋
  const filterMember = members.find((item) => item.id === Number(id));

  if (!filterMember) {
    res.status(404).json({ error: "會員不存在" });
  } else {
    res.status(200).json(filterMember);
  }
});
```
</details>

## 任務三：新增會員 (`POST`)

**🎯 題目要求**：
- 輸入：`body = { name: string, level: 'VIP' | 'normal' }`
- 輸出：`201` + 新會員物件（id 自動配），或 `400` + `{ error: '缺 name 或 level' }`（驗證失敗）

**💡 關鍵點與常犯錯誤**：
- 必須先呼叫 `validateBody(req.body)` 驗證資料是否齊全，若失敗回傳 `400`。
- 使用展開運算子 `{ id: nextId, ...req.body }` 優雅地組合新會員物件。
- **忘記推進下一號**：將新會員加入陣列 (`members.push`) 後，千萬不要忘記執行 `nextId++`！否則下一位註冊的會員會拿到重複的 ID，造成資料錯亂。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.post("/", (req, res) => {
  // 1. 先使用 validateBody() 驗證前端傳來的 req.body 是否合規
  const validationResult = validateBody(req.body);

  if (validationResult.valid === false) {
    return res.status(400).json({ error: validationResult.error });
  }

  // 2. 驗證通過，利用展開運算子組裝新會員物件
  const newMember = { id: nextId, ...req.body };
  // 3. 將新物件推入 (push) 模擬資料庫的陣列中
  members.push(newMember);
  nextId++;

  res.status(201).json(newMember);
});
```
</details>

## 任務四：更新與刪除會員 (`PUT` / `DELETE`)

**🎯 題目要求**：
1. **更新會員 (PUT)**：
   - 輸入：`req.params.id`、`body`（部分欄位，例如只傳 `{ level: 'normal' }`）
   - 輸出：`200` + merge 後的會員，或 `404` + `{ error: '會員不存在' }`
2. **刪除會員 (DELETE)**：
   - 輸入：`req.params.id`
   - 輸出：`204`（無 body），或 `404` + `{ error: '會員不存在' }`

**💡 關鍵點與常犯錯誤**：
- 兩者都需要用 `findIndex` 找索引，找不到 (`-1`) 則回傳 `404`。
- **PUT 覆蓋順序**：使用展開運算子進行合併時，順序非常重要！必須是「先展開舊資料 `...members[index]`，再展開新資料 `...req.body`」。如果寫反了，舊資料會把前端剛傳來的新資料蓋掉，導致更新完全無效！
- **DELETE 狀態碼地雷**：刪除成功時回傳的狀態碼是 `204 No Content`，代表「請求成功但沒有任何內容要回傳」。因此絕對不能寫 `res.status(204).json(...)`，否則會發生錯誤！正確做法是直接使用 `res.status(204).end()` 結束此請求。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.put("/:id", (req, res) => {
  // 先用 findIndex 找到符合 ID 的物件索引
  const index = members.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }

  // 利用展開運算子進行更新：後方 req.body 的屬性會覆蓋前方 members[index] 的舊屬性
  members[index] = {
    ...members[index],
    ...req.body,
  };

  res.status(200).json(members[index]);
});

router.delete("/:id", (req, res) => {
  // 先用 findIndex 找到符合 ID 的物件索引
  const index = members.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: "會員不存在" });
  }

  // 找到後，使用 splice() 將該筆物件從陣列中刪除
  members.splice(index, 1);
  res.status(204).end();
});
```
</details>

## 任務五：檔案上傳路由 (`routes/uploadImage.js`)

**🎯 題目要求**：
- 輸入：`multipart/form-data`，field 名稱 `image`
- 輸出：`200` + `{ filename: file.originalFilename, sizeKB, savedPath: file.filepath }`，或 `400` + `{ error: 'No file uploaded' }`（沒帶 image）

**💡 關鍵點與常犯錯誤**：
- `formidable({ ... })` 實體化時，記得設定 `uploadDir`、`keepExtensions: true` (保留副檔名) 以及容量限制 `maxFileSize`。
- **陣列陷阱 (Formidable v3)**：解析出來的 `files.image` 預設會是「陣列」。必須使用 `Array.isArray` 判斷並取 `[0]` 來獲得實際的單一檔案物件。如果忘記取 `[0]`，後續讀取 `file.originalFilename` 等屬性都會變成 `undefined`。
- 解析出檔案後，提取 `originalFilename`、計算轉為 KB 的 `size` 以及實際儲存的 `filepath` 作為回應。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
router.post("/", (req, res) => {
  // 1. 建立 formidable 實例並設定屬性
  const form = formidable({
    uploadDir: uploadDir, // 儲存資料夾路徑 (例如：/tmp/uploads)
    keepExtensions: true, // 保留副檔名 (例如 .jpg、.png)，圖片才能正常開啟
    maxFileSize: maxFileSize, // 限制單一檔案最大容量 (5MB)
  });

  // 2. 開始解析前端傳來的 req (請求)
  form.parse(req, (err, fields, files) => {
    // 狀況 A：解析過程發生錯誤（例如檔案太大），回傳 500
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 狀況 B：未上傳檔案或欄位名稱錯誤 (必須是 `image`)，回傳 400
    if (!files || !files.image) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 狀況 C：成功拿到檔案！
    // 注意：新版 (v3) 的 formidable，files.image 解析後預設為「陣列」
    // 若為陣列，需取出第一個元素 [0]
    let file = files.image;
    if (Array.isArray(file)) {
      file = file[0];
    }

    // 儲存成功！將結果組裝成指定的 JSON 格式回傳給前端
    res.status(200).json({
      filename: file.originalFilename, // 原始檔案名稱
      sizeKB: Math.round(file.size / 1024), // 將檔案大小 (bytes) 轉為 KB 並四捨五入
      savedPath: file.filepath, // 檔案實際儲存於伺服器上的路徑
    });
  });
});
```
</details>

## 任務六：Express 核心設定與 Middleware (`app.js`)

**🎯 題目要求**：
- 將分離好的路由模組掛載進主程式
- 掛載必備的跨域與 JSON 解析 Middleware

**💡 關鍵點與常犯錯誤**：
- **跨域設定**：必須先掛載 `cors()` 允許前端跨域請求，且務必放在所有路由的**最前面**。
- **Body 解析遺漏**：必須掛載 `express.json()`！如果忘記寫這行，所有 `POST` 與 `PUT` 傳來的 JSON 資料 Express 都會看不懂，導致 `req.body` 直接變成 `undefined`，進而引發後續一連串的 Crash 崩潰。
- **路由掛載**：使用 `app.use('/前綴', router)` 將分離好的路由檔案掛載到指定的 API 路徑下。

<details>
<summary>💻 點擊展開程式碼解答</summary>

```javascript
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const membersRouter = require("./routes/members");
const uploadImageRouter = require("./routes/uploadImage");
const swaggerDoc = require("./fixtures/swagger.json");

const app = express();

// 1. 解跨域（cors middleware，必須在所有路由之前）
app.use(cors()); // 允許來自不同網域的請求，避免 CORS 錯誤
// 2. 解析 JSON body
app.use(express.json()); // 讓 Express 能夠讀懂前端傳來的 JSON 格式資料
// 3. 掛載 Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc)); // 建立 API 文件頁面
// 4. 把 membersRouter 掛載到 '/members' 路徑下
app.use("/members", membersRouter);
// 5. 把 uploadImageRouter 掛載到 '/uploadImage' 路徑下
app.use("/uploadImage", uploadImageRouter);

module.exports = app;
```
</details>