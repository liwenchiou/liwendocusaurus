---
title: "Day 28 - 健壯性：使用 Error Boundaries 與 global-error 處理崩潰"
sidebar_label: "Day 28 - 健壯性"
sidebar_position: 28
description: "Next.js 30 天學習筆記系列 - 第 28 天：Day 28 - 健壯性：使用 Error Boundaries 與 global-error 處理崩潰。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 健壯性, 使用, Error, Boundaries, global, error, 處理崩潰, learning, next-js-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Day 28 - 健壯性：使用 Error Boundaries 與 global-error 處理崩潰",
        "datePublished": "2026-07-08T13:51:33.488Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Next.js 30 天學習筆記系列 - 第 28 天：Day 28 - 健壯性：使用 Error Boundaries 與 global-error 處理崩潰。深入探討 Next.js 開發實戰技巧。"
      }
    `}
  </script>
</Head>


# Next.js 30 天全端實戰：Day 28 - 健壯性：使用 Error Boundaries 與 global-error 處理崩潰

## 一、 前言

一個專業的網站與業餘作品最大的差別，在於當錯誤發生時，前者會顯示「抱歉，暫時無法取得資料」，而後者會直接顯示「一片空白」或是醜陋的瀏覽器預設噴錯畫面。

在 App Router 中，錯誤處理被簡化成了「檔案約定」。你不需要在每個元件裡寫 `try/catch`，而是透過在特定資料夾放入 `error.tsx`，就能自動捕捉該層級及其子層級的所有渲染錯誤。

---

## 二、 本文：層級式錯誤處理實戰

### 1. 局部錯誤處理：error.tsx

當某個路由（Page）出錯時，Next.js 會尋找最近的 `error.tsx` 並渲染它，而頁面的其他部分（如 Navigation 或 Sidebar）依然可以正常運作。

[檔案：src/app/dashboard/error.tsx]
```typescript
'use client'; // 錯誤元件必須是 Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 這裡可以將錯誤回報給 Sentry 或 LogRocket
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded">
      <h2 className="text-red-700 font-bold">糟糕，儀表板出了一點問題</h2>
      <button
        onClick={() => reset()} // 嘗試重新渲染（再次執行 Page 邏輯）
        className="mt-2 bg-red-600 text-white px-4 py-1 rounded"
      >
        再試一次
      </button>
    </div>
  );
}
```
### 2. 全域錯誤處理：global-error.tsx

如果錯誤發生在最頂層的 `layout.tsx`（例如導覽列崩潰），一般的 `error.tsx` 是抓不到的。這時我們需要在 `app` 根目錄建立 `global-error.tsx`。

[關鍵點]：這檔案會取代整個 `html` 與 `body` 標籤，因此它必須包含完整的 HTML 結構。

### 3. Server Actions 的錯誤處理

Server Actions 的錯誤不會觸發 `error.tsx` 的顯示（因為它們是異步動作而非渲染錯誤）。我們應該在 Action 中捕捉錯誤並回傳狀態。

```typescript
export async function deleteData(id: string) {
  try {
    await db.data.delete({ where: { id } });
    revalidatePath('/');
  } catch (e) {
    return { error: '刪除失敗，請檢查權限或網路連線' };
  }
}
```
### 4. 預期內的錯誤：notFound()

如果使用者存取一個不存在的 ID，這不是「崩潰」，而是「找不到」。請直接調用 `notFound()`，它會觸發同層級的 `not-found.tsx`。


## 三、 結論：建立防禦性開發思維

錯誤處理的目標不是「消除錯誤」，而是「管理錯誤」，確保單點崩潰不會影響全站體驗。

* 今日小結：
  - `error.tsx` 負責捕捉渲染錯誤，並提供 `reset()` 機制。
  - `global-error.tsx` 是最後防線，處理 Layout 等級的崩潰。
  - Server Actions 建議回傳 JSON 錯誤訊息，配合前端 UI 顯示（如 Toast 提示）。

* 開發者心得：我強烈建議在 `error.tsx` 中加入 `reset` 按鈕。很多時候錯誤只是暫時的網路抖動，讓使用者能「一鍵重試」比讓他們「重新整理整頁」更有溫度。另外，生產環境中的錯誤訊息通常會被加密（Digest），這是為了安全考量。在本地開發時，你可以看到完整的 Stack Trace，但在線上環境，記得設置好 Log 系統，才能在使用者報修前先修好 Bug。

---

參考來源：
1. Next.js Documentation - Error Handling (https://nextjs.org/docs/app/building-your-application/routing/error-handling)
2. Next.js - global-error.tsx Reference (https://nextjs.org/docs/app/api-reference/file-conventions/error)