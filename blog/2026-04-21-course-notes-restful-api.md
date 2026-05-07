---
slug: course-notes-restful-api
title: "[課程筆記] 第二堂：RESTful API 串接"
date: 2026-04-21T06:36:44.445964+00:00
authors: [liwen]
tags: [六角學院, 學習筆記, 技術]
---

# [課程筆記] 第二堂：RESTful API 串接

## 1. 非同步與 Axios
- **JS 是同步語言**：依序執行（前面做完才輪到我）。
- **非同步執行**：允許長時間運行的任務在背景執行，不阻塞主執行緒。
- **注意**：盡量少用 `alert`，會造成程式阻塞。

### `async` / `await` 語法
```javascript
async function fetchUserData()&#123;
    // await 會等待 Promise 完成
    const response = await fetch('/api/user');
    const data = await response.json();
    
    console.log(data); // 資料已經拿到
    return data;
&#125;

fetchUserData(); // 呼叫執行
```

#### 常見錯誤示範
1.  **遺漏 `async`**：`await` 只能在 `async` 函式內使用。
2.  **遺漏 `await`**：會拿到一個 Pending 的 Promise 物件而非結果。
3.  **對非 Promise 使用 `await`**：例如 `setTimeout` 是實作 Callback 機制，非 Promise。

#### 延伸寫法與錯誤處理
```javascript
// #1 箭頭函式
const fn = async () => &#123;
    const data = await promiseSetTimeout(1);
&#125;;

// #2 立即執行函式 (IIFE)
(async function()&#123;
    const data = await promiseSetTimeout(1);
&#125;)();

// #3 try...catch 錯誤解決方案
(async function()&#123;
    try &#123;
        const data = await promiseSetTimeout(1);
    &#125; catch(error) &#123;
        console.log('發生錯誤：', error);
    &#125;
&#125;)();
```

### Axios 的使用
[官方文件](https://axios-http.com/docs/intro)
```javascript
(async () => &#123;
    try &#123;
        const res = await axios.get('https://randomuser.me/api/');
        const &#123; results &#125; = res.data;
        console.log(results);
    &#125; catch(error) &#123;
        console.log(error);
    &#125;
&#125;)();

// 全域設定：每次請求都帶上 Token
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
```

---

## 2. RESTful API 觀念
- **前端與後端的橋樑**：前端透過 API 請求向伺服器溝通資料庫。
- **常用的 HTTP 方法**：
    - `GET`：取得資料。
    - `POST`：新增資料。
    - `PUT`：修改資料。
    - `DELETE`：刪除資料。

### 驗證流程 (Auth)
1. 前端傳送帳號密碼。
2. 伺服器驗證成功回傳 `token`。
3. 前端儲存 `token`（如 Cookie 或 LocalStorage）。
4. 後續所有請求都在 Header 帶上 `token` 進行驗證。

---

## 3. Vite 環境
### 安裝與指令
```bash
npm create vite@latest
npm run dev    # 開發環境
npm run build  # 編譯生產環境
```

### 為什麼選擇 Vite？
- **快速開發**：利用原生 ESM，啟動與熱更新極快。
- **整合管理**：由原本的 CDN 引入改為 NPM 統一管理套件。
- **資料夾結構**：
    - `public/`：存放靜態資源，不會被編譯，直接搬移至部署目錄。
    - `src/`：最核心的開發目錄，包含元件與邏輯代碼。
