---
title: "Day 10 - Server Actions：前後端溝通的最後一哩路"
sidebar_label: "Day 10 - Server Actions"
sidebar_position: 10
---

# Next.js 30 天全端實戰：Day 10 - Server Actions：前後端溝通的最後一哩路

## 一、 前言

在過去的 Web 開發中，處理一個「留言板」功能通常很麻煩：
1. 前端寫一個 Form。
2. 監聽 onSubmit，用 fetch 把資料送到 API Route。
3. 後端 API 接收資料、驗證、寫入資料庫。
4. 前端收到成功訊息後，手動重新整理頁面或更新狀態。

Next.js 的 Server Actions 徹底簡化了這個流程。它允許你直接在組件中定義一個「伺服器端函式」，並直接綁定在 Form 上。

---

## 二、 本文：Server Actions 核心實作

### 1. 什麼是 Server Actions？

Server Actions 是建立在 HTTP POST 之上的功能。你定義一個標註為 `"use server"` 的非同步函式，Next.js 會自動幫你建立 API 端點並處理背後的通訊。

### 2. 實戰示範：建立一個簡單的留言功能

我們不需要額外寫 API 檔案，直接在組件裡就能完成。

```javascript
import &#123; revalidateTag &#125; from 'next/cache';

export default function Guestbook() &#123;
  // 1. 定義 Server Action (這段程式碼只會在伺服器執行)
  async function addEntry(formData: FormData) &#123;
    'use server';
    
    const message = formData.get('message');
    
    // 2. 直接操作資料庫 (例如使用 Prisma 或直接 fetch)
    console.log(`收到留言：$&#123;message&#125;`);

    // 3. 告訴 Next.js 留言增加了，請重新整理快取 (還記得 Day 07 嗎？)
    revalidateTag('guestbook');
  &#125;

  return (
    <form action=&#123;addEntry&#125; className="flex flex-col gap-4 p-6">
      <textarea name="message" className="border p-2" placeholder="想說什麼？" />
      <button type="submit" className="bg-black text-white p-2">送出留言</button>
    </form>
  );
&#125;
```


### 3. Server Actions 的強大優點

* 漸進式增強 (Progressive Enhancement)：即使使用者的瀏覽器禁用了 JavaScript，這個表單依然可以運作（因為它是標準的 HTML Form 動作）。
* 類型安全：如果你使用 TypeScript，前端傳入與後端接收的資料型別是同步的。
* 整合快取：結合 revalidatePath 或 revalidateTag，資料更新後網頁會立刻顯示新內容，不需要手動重整。

### 4. 提升使用者體驗：useFormStatus

雖然 Server Actions 很方便，但當伺服器在處理資料時，我們應該讓按鈕變成「處理中」的狀態。

```javascript
"use client";

import &#123; useFormStatus &#125; from 'react-dom';

function SubmitButton() &#123;
  const &#123; pending &#125; = useFormStatus();

  return (
    <button disabled=&#123;pending&#125; className="bg-blue-500 disabled:bg-gray-400 p-2">
      &#123;pending ? '儲存中...' : '送出'&#125;
    </button>
  );
&#125;
```


---

## 三、 結論：回歸簡單的開發模式

Server Actions 讓我們擺脫了繁瑣的 API 定義，將「互動」與「資料更新」緊密結合在一起。

* 今日小結：
  - 在函式頂端加上 `"use server"` 即可定義 Action。
  - 表單可以直接透過 `action` 屬性綁定 Server Action。
  - 搭配 `revalidatePath` 可以達成即時的 UI 更新。

* 專家筆記：
    * 雖然 Server Actions 很方便，但請務必在 Action 內部進行「權限檢查」與「資料驗證」（例如使用 Zod 庫）。
    * 記住，這段程式碼雖然寫在元件裡，但它在本質上是後端邏輯，絕對不能信任前端傳來的所有資料。

---

參考來源：
1. Next.js Documentation - Server Actions and Mutations (https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
2. React Reference - useFormStatus (https://react.dev/reference/react-dom/hooks/useFormStatus)