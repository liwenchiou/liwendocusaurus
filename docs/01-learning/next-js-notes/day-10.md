---
title: "Day 10 - Server Actions：告別 API Routes 的全端實戰"
sidebar_label: "Day 10 - Server Actions"
sidebar_position: 10
description: "Next.js 30 天學習筆記系列 - 第 10 天：Day 10 - Server Actions：告別 API Routes 的全端實戰。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, Server, Actions, 告別, API, Routes, 的全端實戰, learning, next-js-notes]
---


# Day 10 - Server Actions：告別 API Routes 的全端實戰

在過去，要提交表單資料到伺服器，您需要建立一個 API Route (`/api/submit`)，然後在前端使用 `fetch` 發送請求。

Next.js 的 **Server Actions** 讓這一切變得無比簡單：您只需要寫一個非同步函式，並直接在 Form 的 `action` 屬性中呼叫它，剩下的通訊細節由 Next.js 搞定。

---

## 💡 本文：Server Actions 核心實作

### 1. 什麼是 Server Actions？

Server Actions 是在伺服器執行的非同步函式。它們不僅能在 Server Components 中使用，也能在 Client Components 中被觸發。

*   **宣告方式**：在函式頂端加上 `"use server"`。
*   **優勢**：自動與 HTML Form 整合，支援「漸進式增強 (Progressive Enhancement)」（即使 JS 被禁用，表單依然能提交）。

### 2. 基礎實作範例

我們建立一個簡單的「新增文章」表單：

```javascript
// src/app/posts/new/page.tsx

export default function NewPostPage() {
  // 1. 定義 Server Action
  async function createPost(formData: FormData) {
    'use server' // 關鍵指令
 
    const title = formData.get('title');
    const content = formData.get('content');

    // 這裡可以直接操作資料庫 (Prisma, Supabase 等)
    console.log('正在寫入資料庫：', { title, content });
    
    // 成功後跳轉頁面
    redirect('/posts');
  }

  return (
    <form action={createPost} className="flex flex-col gap-4">
      <input name="title" placeholder="標題" className="border p-2" />
      <textarea name="content" placeholder="內容" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">提交</button>
    </form>
  );
}
```

### 3. 如何重用 Action？

當您的專案變大時，建議將 Actions 抽離到獨立檔案中：

```javascript
// src/app/actions.ts
'use server'

export async function login(formData: FormData) {
  // 登入邏輯...
}

export async function logout() {
  // 登出邏輯...
}
```


## 🏁 結論

Server Actions 讓「前後端開發」不再有割裂感。您不再需要去管理網址、HTTP 方法與 JSON 轉換，只需要專注於業務邏輯。

| 比較項目 | 傳統 API Route | Server Actions |
| :--- | :--- | :--- |
| **定義位置** | 獨立的 `/api` 檔案 | 任何地方 (標註 use server) |
| **呼叫方式** | `fetch('/api/...')` | 直接呼叫函式或用於 `form action` |
| **資料類型** | 通常是 JSON | 自動處理 FormData |
| **優點** | 跨平台 (可給 APP 使用) | 整合性最強、開發速度最快 |


> **參考來源：**
> 1. [Next.js - Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
> 2. [Next.js API - redirect Function](https://nextjs.org/docs/app/api-reference/functions/redirect)