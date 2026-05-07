---
slug: course-notes-restful-api
title: "[課程筆記] 第二堂：RESTful API 串接實務"
sidebar_label: "API 串接實務"
date: 2026-04-21T06:36:44.445964+00:00
authors: [liwen]
tags: [六角學院]
---

# [課程筆記] 第二堂：RESTful API 串接實務

本堂課聚焦於如何透過非同步技術 (Async/Await) 與 Axios 套件，與後端 API 進行標準化的 RESTful 通訊。

---

## ⏳ 非同步處理：Async / Await

JavaScript 預設是同步執行的（一次只做一件事）。為了處理網路請求等耗時任務，我們需要使用非同步語法。

### 1. 核心語法
```javascript
async function fetchUserData() {
    try {
        // await 會暫停執行，直到 Promise 完成
        const response = await fetch('/api/user');
        const data = await response.json();
        console.log('取得資料：', data);
        return data;
    } catch (error) {
        console.error('抓取失敗：', error);
    }
}
```

:::warning 常見地雷
1.  **遺漏 `async`**：`await` 只能在 `async` 函式內部使用。
2.  **遺漏 `await`**：如果您忘了寫 `await`，拿到的會是一個狀態為 `Pending` 的 Promise 物件，而不是實際的資料。
3.  **錯誤處理**：務必搭配 `try...catch` 語法，避免網路異常導致整個程式崩潰。
:::

### 2. Axios 專業套件
[Axios](https://axios-http.com/) 是目前前端最主流的請求套件，它自動處理了 JSON 轉換與錯誤攔截。

```javascript
// 全域設定：讓每個請求都自動帶上 Token
axios.defaults.headers.common['Authorization'] = `Bearer ${AUTH_TOKEN}`;

(async () => {
    const res = await axios.get('https://randomuser.me/api/');
    const { results } = res.data;
    console.log(results);
})();
```

---

## 🌉 RESTful API 核心觀念

RESTful 是一種設計風格，利用 HTTP 的不同方法來代表對資源的特定操作。

| HTTP 方法 | 對應動作 | 語意說明 |
| :--- | :--- | :--- |
| **GET** | **讀取 (Read)** | 取得特定的資源或列表 |
| **POST** | **新增 (Create)** | 建立一筆新的資料 |
| **PUT** | **修改 (Update)** | 更新現有的整筆資料 |
| **DELETE** | **刪除 (Delete)** | 移除特定的資源 |

### 🔐 身份驗證流程 (Auth)
1.  **登入**：前端傳送憑證。
2.  **核發**：伺服器驗證後回傳加密的 `Token` (通常是 JWT)。
3.  **儲存**：前端存入 `Cookie` 或 `LocalStorage`。
4.  **攜帶**：後續請求在 **Header** 中自動帶上該 Token 進行驗證。

---

## ⚡ Vite 開發環境

Vite 是目前 React 專案的首選建置工具，比起傳統的 Webpack，它提供了極致的啟動速度。

*   **npm run dev**：啟動開發伺服器（秒級反應）。
*   **npm run build**：編譯出可用於部署的生產環境檔案。

| 目錄名稱 | 存放內容 | 備註 |
| :--- | :--- | :--- |
| **public/** | 靜態資源 | 圖示、字體等，不會被編譯，直接搬移至根目錄。 |
| **src/** | 開發源碼 | 放置所有的 `.tsx` 元件與邏輯程式碼。 |
