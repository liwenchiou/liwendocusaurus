---
title: "Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆"
sidebar_label: "Day 08 - Loading UI"
sidebar_position: 8
description: "Next.js 30 天學習筆記系列 - 第 08 天：Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, Loading, UI, Streaming, 別讓使用者對著白框發呆, learning, next-js-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆",
        "datePublished": "2026-07-08T13:51:33.477Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Next.js 30 天學習筆記系列 - 第 08 天：Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆。深入探討 Next.js 開發實戰技巧。"
      }
    `}
  </script>
</Head>


# Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆

在資料獲取量大的頁面中，等待資料的時間往往會造成「白屏」現象。Next.js 透過 **Loading UI** 與 **Streaming** 技術，讓網頁能夠「邊下載邊顯示」，大幅提升感官效能。

---

## 💡 本文：載入體驗優化實戰

### 1. 內建 Loading 檔案

在 App Router 中，您只需要在資料夾下建立一個 `loading.tsx`，Next.js 就會自動在該路由載入資料時顯示此畫面。

*   **自動封裝**：Next.js 會自動將該層級的 `page.tsx` 包裹在 `<Suspense>` 中。
*   **立即反應**：當使用者點擊連結時，導航會立即發生，並顯示 Loading UI。

```javascript
// src/app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
```

### 2. 何謂串流渲染 (Streaming)？

傳統 SSR 需要等「整頁」資料都抓完才能發送 HTML，而 Streaming 允許伺服器先將靜態內容發送過去，非同步載入的部分等抓完再「補上」。

:::tip[優點]
*   **TTFB (Time to First Byte)**：大幅縮短，瀏覽器能更快開始解析網頁。
*   **FCP (First Contentful Paint)**：使用者能立刻看到標題與選單，而非等待全部內容。
:::

### 3. 精細控制：使用 React Suspense

如果您不想要整頁 Loading，而是局部組件 Loading，可以手動使用 `<Suspense>`：

```javascript
import { Suspense } from 'react';
import PostsList from './PostsList';

export default function Page() {
  return (
    <section>
      <h1>我的儀表板</h1>
      
      {/* 只有這個組件會顯示 Loading */}
      <Suspense fallback={<p>正在讀取文章...</p>}>
        <PostsList />
      </Suspense>
    </section>
  );
}
```


## 🏁 結論

| 技術工具 | 適用對象 | 優勢 |
| :--- | :--- | :--- |
| **loading.tsx** | 整頁路由載入 | 全自動、代碼最簡潔 |
| **Suspense** | 組件級局部載入 | 高度彈性、可控性強 |
| **Skeleton UI** | fallback 的內容 | 提供更專業的視覺引導 |


> **參考來源：**
> 1. [Next.js - Loading UI and Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
> 2. [Next.js - Fundamentals of Streaming](https://nextjs.org/docs/app/building-your-application/rendering/server-components#streaming)