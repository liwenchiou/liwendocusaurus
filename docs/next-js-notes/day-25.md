---
title: "Day 25 - 互動優化：實作高效能的即時搜尋與防抖機制"
sidebar_label: "Day 25 - 互動優化"
sidebar_position: 25
---

# Next.js 30 天全端實戰：Day 25 - 互動優化：實作高效能的即時搜尋與防抖機制

## 一、 前言

搜尋功能是每個專案的標配。最直覺的做法是在 `input` 的 `onChange` 事件中直接觸發搜尋，但這會產生效能災難：如果使用者快速輸入「Nextjs」，短短一秒內會觸發 6 次 API 請求，這對伺服器與資料庫都是無謂的負擔。

今天我們要結合 **URL Search Params** 與 **Debouncing (防抖)** 技巧，打造出既流暢又省資源的搜尋介面。

---

## 二、 本文：搜尋邏輯與效能調優

### 1. 核心思路：URL 為真 (URL as State)

我們不將搜尋關鍵字存在當前的 `useState` 裡，而是同步到網址（例如：`?query=nextjs`）。這樣做的好處是：使用者重新整理頁面，搜尋結果依然還在，且搜尋紀錄可以被分享。

### 2. 實作防抖 (Debouncing) 技巧

防抖的原理是：當使用者停止輸入超過一段時間（例如 500ms），我們才正式發送請求。

```typescript
'use client';

import &#123; usePathname, useRouter, useSearchParams &#125; from 'next/navigation';
import &#123; useDebouncedCallback &#125; from 'use-debounce'; // 推薦使用此套件

export default function SearchBar() &#123;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const &#123; replace &#125; = useRouter();

  // 使用防抖處理輸入事件
  const handleSearch = useDebouncedCallback((term: string) => &#123;
    const params = new URLSearchParams(searchParams);
    if (term) &#123;
      params.set('query', term);
    &#125; else &#123;
      params.delete('query');
    &#125;
    // 更新網址，但不觸發整頁重新整理
    replace(`$&#123;pathname&#125;?$&#123;params.toString()&#125;`);
  &#125;, 500);

  return (
    <input
      placeholder="搜尋文章..."
      onChange=&#123;(e) => handleSearch(e.target.value)&#125;
      defaultValue=&#123;searchParams.get('query')?.toString()&#125;
      className="border p-2 rounded w-full"
    />
  );
&#125;
```
### 3. 後端：資料庫模糊搜尋

在 Server Component 中，我們根據網址參數進行 Prisma 的模糊查詢。

```typescript
// src/app/posts/page.tsx
export default async function Page(&#123; searchParams &#125;) &#123;
  const query = searchParams?.query || '';
  
  const posts = await db.post.findMany(&#123;
    where: &#123;
      OR: [
        &#123; title: &#123; contains: query, mode: 'insensitive' &#125; &#125;,
        &#123; content: &#123; contains: query, mode: 'insensitive' &#125; &#125;,
      ],
    &#125;,
  &#125;);

  return <PostList posts=&#123;posts&#125; />;
&#125;
```
### 4. 搭配 Suspense 提升體驗

因為搜尋涉及資料庫查詢，我們可以用 `<Suspense>` 包住結果區塊，讓搜尋框維持可互動狀態，只有結果區塊顯示載入中。

---

## 三、 結論：讓搜尋變得「聰明」

即時搜尋的精髓在於「感知使用者的意圖」，而非盲目地回應每一次按鍵。

* 今日小結：
  - **URL Search Params** 是管理搜尋狀態的最佳位置。
  - **Debouncing** 是保護伺服器免於被請求淹沒的關鍵。
  - Prisma 的 `contains` 與 `mode: 'insensitive'` 能處理簡單的模糊搜尋需求。

* 開發者心得：雖然 SQL 的 `LIKE` 或 Prisma 的 `contains` 在小專案很好用，但當資料量達到萬級或十萬級以上時，搜尋效率會急劇下降。這時建議考慮整合專門的搜尋引擎（如 Algolia 或 Elasticsearch），或是利用資料庫的「全文檢索 (Full-text Search)」索引功能，這對搜尋速度的提升會非常有感。

---

參考來源：
1. Next.js Documentation - Search and Pagination (https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)
2. Prisma Reference - Filtering and Sorting (https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)