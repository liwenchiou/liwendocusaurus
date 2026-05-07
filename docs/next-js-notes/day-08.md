---
title: "Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆"
sidebar_label: "Day 08 - Loading UI 與 Streaming"
sidebar_position: 8
---

# Next.js 30 天全端實戰：Day 08 - Loading UI 與 Streaming：別讓使用者對著白框發呆

## 一、 前言

身為開發者，我們最怕遇到資料庫回應慢、API 塞車。在傳統開發中，如果資料沒抓完，整頁就會卡住，或者我們得手動寫一大堆 `if (isLoading) return <Spinner />`。

Next.js 內建了「串流渲染 (Streaming)」技術。它允許伺服器先將已經準備好的部分（如導覽列、版型）傳送給瀏覽器，而慢吞吞的資料部分則在後續補上。今天我們就來學習如何輕鬆實作這種專業級的載入體驗。

---

## 二、 本文：漸進式渲染實作

### 1. 使用 loading.tsx (自動化整頁載入)

這是最簡單的方法。只要在路由資料夾內建立一個 `loading.tsx`，Next.js 就會自動幫你處理一切。

* 運作方式：當該路由正在抓取資料（await）時，Next.js 會自動顯示 `loading.tsx` 的內容，直到資料準備好為止。

```javascript
// src/app/dashboard/loading.tsx
export default function Loading() &#123;
  return (
    <div className="animate-pulse p-6">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-10 bg-gray-200 rounded mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <p className="mt-4 text-gray-500">正在努力搬運資料中...</p>
    </div>
  );
&#125;
```


### 2. 使用 Suspense (精準的局部載入)

有時候我們不希望「整頁」都在轉圈圈，而是希望「只有慢的部分」在載入。這時我們可以使用 React 的 `<Suspense>`。

```javascript
import &#123; Suspense &#125; from 'react';
import SlowComponent from '@/components/SlowComponent';

export default function Page() &#123;
  return (
    <section>
      <h1>我的儀表板</h1>
      
      &#123;/* 導覽列和標題會立即出現 */&#125;
      <nav>快速選單</nav>

      &#123;/* 只有這個很慢的組件會被暫時替換成 Skeleton */&#125;
      <Suspense fallback=&#123;<p>載入推薦商品中...</p>&#125;>
        <SlowComponent />
      </Suspense>
    </section>
  );
&#125;
```
### 3. 什麼是 Streaming (串流)？

想像你在看線上影片，你不需要等整部電影下載完才能看，而是「邊載邊看」。Next.js 的 Streaming 也是一樣：
1. 伺服器先傳送 Layout（導覽列、側邊欄）。
2. 瀏覽器立刻渲染出這些「靜態」部分。
3. 同時，伺服器繼續在後台抓資料。
4. 資料抓完後，伺服器把剩下的 HTML 片段「噴」給瀏覽器，補上空缺。



---

## 三、 結論：體感速度比實際速度更重要

在 UX 設計中，給使用者一個「正在處理」的視覺回饋（如 Skeleton Screen），比讓他們看著白屏轉圈圈更能減少焦慮。

* 今日小結：
  - 快速處理：直接建立 `loading.tsx` 處理整頁。
  - 精細控制：使用 `<Suspense>` 包住特定的異步組件。
  - 核心原理：利用 Streaming 實現邊抓邊傳，打破「整頁抓完才顯示」的舊規。

* 專家筆記：
    - Skeleton Screen（骨架屏）是目前主流的 Loading UI。
    - 在設計時，盡量讓 Loading 狀態的形狀與實際內容相近，這樣資料跳出來時才不會有明顯的位移感 (Layout Shift)。

---

參考來源：
1. Next.js Documentation - Loading UI and Streaming (https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
2. React Documentation - Suspense (https://react.dev/reference/react/Suspense)