---
title: "Day 11 - 表單回饋：用 useActionState 處理驗證與狀態"
sidebar_label: "Day 11 - 表單回饋"
sidebar_position: 11
description: "Next.js 30 天學習筆記系列 - 第 11 天：Day 11 - 表單回饋：用 useActionState 處理驗證與狀態。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 表單回饋, useActionState, 處理驗證與狀態, learning, next-js-notes]
---

# Next.js 30 天全端實戰：Day 11 - 表單回饋：用 useActionState 處理驗證與狀態

## 一、 前言

昨天我們實作了基礎的 Server Actions，但一個真正能上線的表單，不能只有「把資料傳過去」而已。身為開發者，我們必須處理更細膩的互動：
1. 顯示後端的驗證錯誤訊息（例如：帳號已被註冊）。
2. 在提交過程中禁用按鈕，防止使用者重複點擊。
3. 提交成功後，清除表單或跳轉頁面。

今天我們要介紹 Next.js 15 推薦的最新 Hook：`useActionState`。它讓我們能用極簡的代碼，同時管理 Server Action 的回傳結果與載入狀態。

---

## 二、 本文：狀態管理與資料驗證實戰

### 1. 什麼是 useActionState？

這是一個專門用來處理 Server Action 狀態的 Hook。它能幫我們捕捉 Action 執行後的結果（State），並提供一個 `isPending` 變數來判斷目前是否正在處理中。



### 2. 實戰範例：具備錯誤回饋的註冊表單

我們將前後端邏輯整合，當後端驗證失敗時，直接將錯誤訊息回傳給前端顯示。

[檔案：src/app/actions.ts (伺服器端)]
```javascript
'use server'

export async function createUser(prevState: any, formData: FormData) {
  const email = formData.get('email');

  // 1. 模擬後端驗證
  if (!email || !email.toString().includes('@')) {
    return { message: '請輸入有效的 Email 地址', status: 'error' };
  }

  // 2. 模擬處理延遲
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { message: '註冊成功！', status: 'success' };
}
```
[檔案：src/components/SignupForm.tsx (用戶端)]
```javascript
'use client'

import { useActionState } from 'react';
import { createUser } from '@/app/actions';

export default function SignupForm() {
  // state：Action 回傳的結果
  // formAction：綁定給 form action 的函式
  // isPending：是否正在執行中
  const [state, formAction, isPending] = useActionState(createUser, {
    message: '',
    status: 'idle'
  });

  return (
    <form action={formAction} className="p-4 border rounded max-w-sm">
      <input 
        name="email" 
        type="text" 
        placeholder="Email" 
        className="border p-2 w-full text-black" 
        disabled={isPending}
      />
      
      {/* 根據後端回傳的狀態顯示訊息 */}
      {state.message && (
        <p className={`mt-2 ${state.status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {state.message}
        </p>
      )}

      <button 
        disabled={isPending} 
        className="bg-black text-white p-2 mt-2 w-full disabled:bg-gray-400"
      >
        {isPending ? '註冊中...' : '立即註冊'}
      </button>
    </form>
  );
}
```


### 3. 進階技巧：搭配 Zod 進行規範驗證

在真實專案中，我們不會手寫 `if/else` 檢查。我們會定義一個 **Zod Schema**，這能確保資料在進入資料庫前就已經通過嚴格的格式檢查。

```javascript
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email("Email 格式不正確"),
});

export async function action(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: '驗證失敗',
      status: 'error'
    };
  }
  // 繼續執行寫入資料庫的邏輯...
}```


## 三、 結論：讓互動更直覺

透過 `useActionState`，我們不再需要手動用 `useState` 去管 loading 或 error。這種「由 Action 驅動狀態」的模式，讓 Client 與 Server 的互動變得非常絲滑。

* 今日小結：
  - `useActionState` 是處理表單狀態的神器。
  - 第一個參數 `prevState` 是必要的，代表上一次的執行結果。
  - 搭配 `isPending` 可以輕鬆做出防呆機制（防止重複點擊）。

* 開發者心得：雖然 Server Action 寫在元件檔案內很方便，但當 Action 變多時，建議統一集中到 `actions.ts` 中管理。這樣不僅結構清楚，也能避免在 Client Component 中不小心引入過多伺服器端專用的套件。

---

參考來源：
1. React Reference - useActionState (https://react.dev/reference/react/useActionState)
2. Next.js - Server Actions Validation (https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#server-side-validation)