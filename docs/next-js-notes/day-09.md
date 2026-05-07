---
title: "Day 09 - 錯誤處理：優雅的降級與崩潰防護"
sidebar_label: "Day 09 - 錯誤處理"
sidebar_position: 9
---

# Day 09 - 錯誤處理：優雅的降級與崩潰防護

在複雜的應用中，API 噴錯或伺服器異常是不可避免的。Next.js 的 App Router 引入了 **「階層式錯誤處理」**，讓您能針對局部故障進行降級，而不至於讓整個網站白屏。

---

## 💡 本文：Error Boundary 與降級機制

### 1. error.tsx 檔案規範

在 Next.js 中，當某個路由發生錯誤時，系統會自動尋找最近的 `error.tsx` 並顯示它。

*   **Client Component**：注意，`error.tsx` 必須宣告為 `"use client"`。
*   **重試機制**：它預設會收到 `reset()` 函式，讓使用者能點擊按鈕重新嘗試渲染。

```javascript
// src/app/dashboard/error.tsx
'use client'

export default function Error(&#123; error, reset &#125;: &#123; 
  error: Error & &#123; digest?: string &#125;;
  reset: () => void;
&#125;) &#123;
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="text-red-700">糟糕！出錯了</h2>
      <p className="text-sm text-red-500 mb-4">&#123;error.message&#125;</p>
      <button 
        onClick=&#123;() => reset()&#125;
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        再試一次
      </button>
    </div>
  );
&#125;
```

### 2. 局部崩潰 vs 全域崩貫

Next.js 的強大之處在於 **「錯誤氣泡 (Error Bubbling)」**：
*   **局部錯誤**：如果在 `/dashboard/settings` 出錯，只有設定頁面會顯示錯誤 UI，側邊欄與導覽列依然可以運作。
*   **全域錯誤**：如果您要攔截最外層 Root Layout 的錯誤，需要建立 `global-error.tsx`。

### 3. 如何主動觸發錯誤？

您可以使用內建的 `notFound()` 函式來觸發 404 頁面，這對於處理「找不到商品」或「無權限文章」非常方便。

```javascript
import &#123; notFound &#125; from 'next/navigation';

export default async function PostPage(&#123; params &#125;) &#123;
  const post = await fetchPost(params.id);
  
  if (!post) &#123;
    notFound(); // 這會自動顯示附近的 not-found.tsx
  &#125;
  
  return <div>&#123;post.title&#125;</div>;
&#125;
```

---

## 🏁 結論

| 工具檔案 | 作用範圍 | 特性 |
| :--- | :--- | :--- |
| **error.tsx** | 路由層級 | 攔截該目錄下的所有錯誤，支援 reset。 |
| **not-found.tsx** | 404 頁面 | 透過 `notFound()` 函式觸發。 |
| **global-error.tsx** | 根路徑 (Root) | 唯一的全站崩潰保護，必須包含 `<html>` 標籤。 |

---

> **參考來源：**
> 1. [Next.js - Error Handling Guide](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
> 2. [Next.js API - notFound Function](https://nextjs.org/docs/app/api-reference/functions/not-found)