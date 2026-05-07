---
title: "Day 24 - 效能與體驗：實作分頁查詢與無限滾動"
sidebar_label: "Day 24 - 效能與體驗"
sidebar_position: 24
---

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

```typescript=
// src/app/posts/page.tsx
import &#123; db &#125; from "@/lib/db";

export default async function PostsPage(&#123;
  searchParams,
&#125;: &#123;
  searchParams: &#123; page?: string &#125;;
&#125;) &#123;
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;

  const posts = await db.post.findMany(&#123;
    skip: (page - 1) * pageSize, // 跳過前面的資料
    take: pageSize,               // 只抓取 10 筆
    orderBy: &#123; createdAt: 'desc' &#125;,
  &#125;);

  return (
    <div>
      &#123;/* 渲染文章列表... */&#125;
      <PaginationControls currentPage=&#123;page&#125; />
    </div>
  );
&#125;
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

```typescript=
"use client";
import &#123; useEffect, useState &#125; from "react";
import &#123; useInView &#125; from "react-intersection-observer"; // 推薦套件

export function InfinitePostList(&#123; initialPosts &#125;) &#123;
  const [posts, setPosts] = useState(initialPosts);
  const &#123; ref, inView &#125; = useInView();

  useEffect(() => &#123;
    if (inView) &#123;
      // 呼叫 Server Action 抓取更多並 setPosts
    &#125;
  &#125;, [inView]);

  return (
    <div>
      &#123;posts.map(post => <PostCard key=&#123;post.id&#125; data=&#123;post&#125; />)&#125;
      <div ref=&#123;ref&#125;>載入中...</div>
    </div>
  );
&#125;
```
---

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