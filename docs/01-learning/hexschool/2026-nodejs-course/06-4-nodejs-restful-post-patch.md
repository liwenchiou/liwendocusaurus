---
title: 實作待辦清單 API (4)：處理 Request Body 與 POST/PATCH
sidebar_position: 6.4
---

# 實作待辦清單 API (4)：處理 Request Body 與 POST/PATCH

終於來到最後一步了！在建立 (POST) 或修改 (PATCH) 資料時，前端會將資料包裝成 JSON 格式放在 HTTP 請求的 `body` 裡面送給我們。

但在原生 Node.js 中，接收 `body` 跟你想像的有點不一樣。

## 1. Node.js 接收資料流 (Stream) 的機制

網路傳輸時，資料不是「碰」一聲就完整掉進伺服器的。如果檔案很大，它是被切成好幾個「小碎片 (Chunk)」分批傳送的，這個概念叫作**資料流 (Stream)**。

所以我們必須準備一個空字串，然後每收到一個碎片，就把碎片拼接起來。

**這段程式碼必須寫在 `http.createServer` 的「最外層」（路由判斷的前面），這樣不論是 POST 或 PATCH 才能順利拿到資料。**

```javascript
import { v4 as uuidv4 } from "uuid"; // 記得引入 uuid

const server = http.createServer((req, res) => {
  // --- 新增這段：接收 Request Body 資料流 ---
  let body = "";
  
  // 當有 chunk (資料碎片) 傳入時觸發
  req.on("data", (chunk) => {
    body += chunk;
  });
  // ----------------------------------------

  // 下面才是原本的路由判斷...
  if (req.method === "OPTIONS") {
    // ...略
```

當資料傳輸完畢時，Node.js 會觸發 `req.on("end")` 事件，我們所有的核心邏輯都要寫在 `end` 事件裡面，才能確保我們拿到的是「完整」的資料。

## 2. 實作：新增待辦 (POST)

```javascript
  else if (req.url === "/todos" && req.method === "POST") {
    // 資料完整接收完畢後執行
    req.on("end", () => {
      try {
        // 1. 將字串轉成 JavaScript 物件
        const data = JSON.parse(body);

        // 防呆機制：檢查 JSON 內有沒有 title 屬性？型別是否為字串？清除空白後是否為空字串？
        if (data.title !== undefined && typeof data.title === 'string' && data.title.trim() !== "") {
          // 2. 新增一筆帶有隨機 UUID 的資料到陣列中 (儲存前先把前後空白清掉)
          const newTodo = {
            title: data.title.trim(),
            id: uuidv4()
          };
          todos.push(newTodo);
          
          // 3. 回傳成功與最新的陣列
          successHandle(res, todos);
        } else {
          // 資料不符合規範，回傳 400 Bad Request
          errorHandle(res, "title 欄位未正確填寫");
        }
      } catch (error) {
        // 萬一前端傳來的不是標準 JSON (例如漏了引號)，JSON.parse 會報錯並跳進 catch
        errorHandle(res, "資料格式錯誤，請確認是否為有效 JSON");
      }
    });
  }
```

### 為什麼需要 `try...catch` 與「屬性檢查」？
如果不寫 `try...catch`，當前端傳來破圖的 JSON，你的伺服器會直接崩潰停機！這非常危險。
而屬性嚴格檢查（`typeof data.title === 'string' && data.title.trim() !== ""`）也很重要！如果不先確保它是字串，當前端傳來數字或陣列（如 `{ "title": [1,2,3] }`）時，後面的 `.trim()` 就會導致伺服器直接崩潰。另外，即便欄位正確，我們也不希望使用者存入只有一堆空白的無效代辦事項。

## 3. 實作：編輯單筆待辦 (PATCH)

編輯邏輯結合了前面的單筆刪除 (取得 ID 找索引) 與新增 (接收並解析 Body)。

```javascript
  else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split("/").pop(); // 取得網址上的 ID
        const index = todos.findIndex(element => element.id === id); // 找索引

        // 必須符合嚴謹條件：1. title 必須是字串且非空、2. 網址有 ID 且非空、3. 陣列裡真的有這個 ID
        if (data.title !== undefined && typeof data.title === 'string' && data.title.trim() !== "" && id !== undefined && id !== "" && index !== -1) {
          // 直接覆寫該筆資料的 title (儲存前先把前後空白清掉)
          todos[index].title = data.title.trim();
          successHandle(res, todos);
        } else if (index === -1) {
          // 特別針對找不到 ID 回報 404
          errorHandle(res, "找不到該筆待辦事項", 404);
        } else {
          errorHandle(res, "title 欄位未填寫正確");
        }
      } catch (error) {
        errorHandle(res, "資料格式錯誤");
      }
    });
  }
```

## 總結
恭喜！你已經用純粹的 Node.js `http` 模組，完成了一套功能完整的 CRUD (Create, Read, Update, Delete) RESTful API！
在這個過程中，你學到了：
1. **環境配置與 ES Module 概念**
2. **模組化抽離 Response Handler，與 HTTP 狀態碼的應用**
3. **基礎路由設計與 CORS / OPTIONS 的處理**
4. **Node.js Stream 解析機制，以及 API 的例外處理 (try...catch / 資料驗證)**

這份筆記是後端開發非常扎實的基礎，熟悉了這些底層運作後，未來學習 Express 或 NestJS 等框架時，你將會游刃有餘！

> 📦 **完整程式碼專案**
> 如果你想看看所有路由與嚴謹驗證機制組合起來的最終長相，可以直接前往 GitHub 取得完整的 `server.js` 與 `resHandle.js` 檔案：
> 👉 [前往 GitHub 下載或查看完整原始碼](https://github.com/liwenchiou/2026hexschoolNodejs)
