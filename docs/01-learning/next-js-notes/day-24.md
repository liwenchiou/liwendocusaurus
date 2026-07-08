---
title: "Day 24 - 效能與體驗：實作分頁查詢與無限滾動"
sidebar_label: "Day 24 - 效能與體驗"
sidebar_position: 24
description: "Next.js 30 天學習筆記系列 - 第 24 天：Day 24 - 效能與體驗：實作分頁查詢與無限滾動。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 效能與體驗, 實作分頁查詢與無限滾動, learning, next-js-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Day 24 - 效能與體驗：實作分頁查詢與無限滾動",
        "datePublished": "2026-07-08T13:51:33.485Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Next.js 30 天學習筆記系列 - 第 24 天：Day 24 - 效能與體驗：實作分頁查詢與無限滾動。深入探討 Next.js 開發實戰技巧。"
      }
    `}
  </script>
</Head>


# Next.js 30 天全端實戰：Day 24 - 效能與體驗：實作分頁查詢與無限滾動

## 一、 前言

當資料庫裡的資料多到一定程度，一次性抓取（fetch）會導致兩個問題：
1. **後端崩潰**：資料庫查詢太久，甚至導致記憶體溢位。
2. **前端卡死**：瀏覽器一次渲染數千個 DOM 元件會非常吃力。

在 Next.js 中，我們可以透過 URL 參數（Query Params）來實現傳統分頁，或是結合 Server Actions 與 Client Component 實作無限滾動。今天我們就來拆解這兩種主流做法。

---

## 二、 本文：資料分段處理實戰

### 1. 基於 URL 的傳統分頁 (Offset Pagination)

這是最常見的做法，優點是 SEO 友善，且使用者可以透過連結分享特定的頁碼。

```typescript
// src/app/posts/page.tsx
import { db } from "@/lib/db";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  const posts = await db.post.findMany({
    skip: (page - 1) * pageSize, // 跳過前面的資料
    take: pageSize,               // 只抓取 10 筆
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      {/* 渲染文章列表... */}
      <PaginationControls currentPage={page} />
    </div>
  );
}
```
### 2. 無限滾動 (Cursor-based Pagination)

對於社群媒體或移動端應用，無限滾動體驗更好。為了效能，我們通常使用「游標 (Cursor)」而非「偏移量 (Offset)」，這樣即使資料量很大，查詢效率依然穩定。



[實作邏輯]
1. 初始頁面由 Server Component 渲染前 10 筆。
2. Client Component 監聽滾動事件（或使用 Intersection Observer）。
3. 當觸發邊界時，調用一個 Server Action 抓取下一頁資料。
4. 使用 `useState` 將新舊資料合併。

### 3. 使用 Intersection Observer 優化體驗

不要去監聽 `window.onscroll`，那太耗效能。我們在列表底部放一個「感應元件」，當它出現在視窗中時才觸發載入。

```typescript
"use client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer"; // 推薦套件

export function InfinitePostList({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) {
      // 呼叫 Server Action 抓取更多並 setPosts
    }
  }, [inView]);

  return (
    <div>
      {posts.map(post => <PostCard key={post.id} data={post} />)}
      <div ref={ref}>載入中...</div>
    </div>
  );
}
```

## 三、 結論：根據場景選擇正確的武器

分頁不只是 UI 議題，更是後端架構的體現。

* 今日小結：
  - **Offset Pagination**：適合後台管理系統、需要精確跳頁的場景。
  - **Cursor Pagination**：適合資料頻繁變動、無限滾動的場景（避免跳頁漏資料）。
  - 務必在資料庫欄位（如 `createdAt` 或 `id`）建立**索引 (Index)**，否則分頁查詢在資料量大時會變得很慢。

* 開發者心得：雖然無限滾動看起來很酷，但它會讓使用者找不到「頁尾 (Footer)」，且在回退網頁時容易丟失位置。如果你的部落格文章不多，簡單的 URL 分頁（?page=2）其實是維護成本最低、SEO 最好的選擇。另外，實作分頁時記得要把 `totalCount` 一併回傳，這樣前端才能計算出總共有幾頁。

---

參考來源：
1. Prisma Documentation - Pagination (https://www.prisma.io/docs/orm/prisma-client/queries/pagination)
2. Next.js - searchParams (https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)