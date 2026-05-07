---
title: "Day 09 - 錯誤處理：優雅地面對程式崩潰"
sidebar_label: "Day 09 - 錯誤處理"
sidebar_position: 9
---

# Next.js 30 天全端實戰：Day 09 - 錯誤處理：優雅地面對程式崩潰

## 一、 前言

身為開發者，我們無法保證後端 API 永遠正常，也無法保證網路永遠順暢。如果程式噴錯了，直接顯示 React 的紅色報錯畫面或是一片空白，會讓使用者對產品失去信心。

Next.js 透過特定的檔案規範，讓我們能以「局部化」的方式捕捉錯誤。這意味著如果側邊欄的小元件出錯了，主頁面依然可以運作。今天我們就來學習如何架設這道「防火牆」。

---

## 二、 本文：錯誤處理的核心機制

### 1. 使用 error.tsx (自動化錯誤邊界)

就像 `loading.tsx` 一樣，只要在資料夾內建立 `error.tsx`，它就會成為該路由的「錯誤邊界 (Error Boundary)」。

* 運作方式：當該層級或子層級的組件出錯時，Next.js 會自動「攔截」錯誤，並顯示 `error.tsx` 的內容，而不是整頁壞掉。

```javascript=
"use client"; // 錯誤組件必須是 Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 你可以將錯誤記錄到 Sentry 或其他監控服務
    console.error(error);
  }, [error]);

  return (
    <div className="p-6 text-center border-2 border-red-500 rounded-lg">
      <h2 className="text-xl font-bold text-red-600">哎呀！出錯了</h2>
      <p className="my-4 text-gray-600">我們在搬運資料時遇到了一點小麻煩。</p>
      <button
        onClick={() => reset()} // 嘗試重新渲染，看能不能修復錯誤
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        再試一次
      </button>
    </div>
  );
}
```


### 2. 局部化攔截：不讓錯誤擴散

Next.js 的錯誤攔截是有「層級性」的。


* 如果錯誤發生在 `/dashboard/settings`：
  - 優先尋找 `/dashboard/settings/error.tsx`。
  - 如果沒有，則向上尋找 `/dashboard/error.tsx`。
  - 關鍵點：外層的 Layout（如導覽列）通常會被保留，使用者依然可以點擊其他選單離開錯誤頁面。

### 3. 處理「找不到網頁」：not-found.tsx

當你抓取不到特定的資料（例如 ID 不存在的文章），應該主動拋出 404 狀態。

```javascript=
import { notFound } from 'next/navigation';

export default async function PostPage({ params }) {
  const post = await fetchPost(params.id);

  if (!post) {
    notFound(); // 這會觸發最近的 not-found.tsx
  }

  return <div>{post.title}</div>;
}
```


### 4. 根層級的終極保護：global-error.tsx

雖然 `app/error.tsx` 能捕捉大部分錯誤，但它抓不到最外層 `app/layout.tsx` 本身的錯誤。這時你需要 `app/global-error.tsx` 來作為最後一道防線。

---

## 三、 結論：把錯誤變成熟的使用者體驗

錯誤處理不只是為了 debug，更是為了 UX。
提供一個「再試一次」的按鈕，往往能解決 80% 的暫時性網路問題。

* 今日小結：
  - `error.tsx` 必須標註 `use client`。
  - `reset()` 函式能讓使用者嘗試重新渲染，不需要手動重新整理整頁。
  - `notFound()` 配合 `not-found.tsx` 處理資源不存在的情況。

* 專家筆記：
    * 在開發模式下，Next.js 依然會顯示詳細的錯誤堆疊（Dev Overlay）方便你修復；
    * 但在部署後的生產環境中，使用者只會看到你精美設計的 `error.tsx` 畫面。

---

參考來源：
1. Next.js Documentation - Error Handling (https://nextjs.org/docs/app/building-your-application/routing/error-handling)
2. React Error Boundaries (https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)