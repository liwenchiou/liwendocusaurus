---
title: "Day 04 - 混合渲染機制：Server vs Client Components"
sidebar_label: "Day 04 - 混合渲染機制"
sidebar_position: 4
---

# Next.js 30 天全端實戰：Day 04 - 混合渲染機制：Server vs Client Components

## 一、 前言

在傳統的 React (SPA) 中，所有的元件都是在瀏覽器端渲染的。但 Next.js 引入了「伺服器組件 (Server Components)」的概念，將元件劃分為伺服器端與用戶端兩大陣營。

對於 Digital Architect 來說，這是一種「資源配置」的優化：讓強大的伺服器處理邏輯與資料存取，讓瀏覽器只負責互動。今天我們就來拆解這兩者該如何選擇與搭配。

---

## 二、 本文：核心概念與實作

### 1. 什麼是 Server Components (預設)？

在 Next.js 的 App Router 中，所有的元件「預設」都是 Server Components。

* 運作方式：程式碼在伺服器上執行，產出 HTML 後再傳送到瀏覽器。
* 優點：
    - 零 Bundle 體積：瀏覽器不需下載該元件的依賴套件（例如處理 Markdown 的大型 library）。
    - 直接存取後端資源：你可以直接在元件內透過 async/await 存取資料庫或內網 API。
    - 安全性：敏感資訊（如 API Keys、環境變數）永遠留在伺服器端，不會流出。

### 2. 什麼是 Client Components？

當你的元件需要與使用者「互動」時，就需要宣告為 Client Components。

* 運作方式：在檔案的最頂端加上 "use client" 指令。
* 使用時機：
    - 需要使用 React Hooks（如 useState, useEffect, useContext）。
    - 需要監聽瀏覽器事件（如 onClick, onChange）。
    - 需要存取瀏覽器專屬 API（如 window, localStorage, sessionStorage）。

### 3. 實戰案例：混合架構設計

想像一個「商品詳情頁」，我們該如何分配？

* 商品描述與價格 (Server Component)：
  - 直接從資料庫讀取，搜尋引擎 (SEO) 能直接抓到內容。
* 收藏按鈕與購物車數量 (Client Component)：
  - 需要點擊互動與狀態變換，所以標註為 "use client"。

```javascript
// src/app/products/[id]/page.tsx (Server Component)
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductPage(&#123; params &#125;) &#123;
  // 1. 直接在伺服器抓資料，不流向前端
  const product = await fetchProduct(params.id);

  return (
    <div className="p-6">
      <h1>&#123;product.name&#125;</h1>
      <p>&#123;product.description&#125;</p>
      
      &#123;/* 2. 只有互動部分切換成 Client Component */&#125;
      <AddToCartButton productId=&#123;product.id&#125; />
    </div>
  );
&#125;
```
---

## 三、 結論：該如何選擇？

在設計系統架構時，請遵循「盡可能將元件留在 Server 端」的原則，只有非互動不可的地方才標註為 Client。

![image](https://hackmd.io/_uploads/HJGRuJ0TZe.png)


* 今日小結：
    1. Server Components 是預設，負責資料與 SEO；
    2. Client Components 透過 "use client" 宣告，負責互動。
* 專家筆記：
    1. Server Component 可以包含 Client Component，但 Client Component 內部不能直接 import Server Component。
    2. 建議將 Client Component 放在組件樹的末端 (Leaf Nodes)，以極大化效能。

---

參考來源：
1. Next.js Documentation - Rendering Fundamentals (https://nextjs.org/docs/app/building-your-application/rendering)
2. Next.js Documentation - Server and Client Components (https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)