---
title: "Day 04 - 混合渲染機制：Server vs Client Components"
sidebar_label: "Day 04 - 混合渲染機制"
sidebar_position: 4
description: "Next.js 30 天學習筆記系列 - 第 04 天：Day 04 - 混合渲染機制：Server vs Client Components。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 混合渲染機制, Server, vs, Client, Components, learning, next-js-notes]
---

# Day 04 - 混合渲染機制：Server vs Client Components

在傳統的 React (SPA) 中，所有的元件都是在瀏覽器端渲染的。但 Next.js 引入了 **「伺服器組件 (Server Components)」** 的概念，將元件劃分為伺服器端與用戶端兩大陣營。

對於工程師來說，這是一種「資源配置」的優化：讓強大的伺服器處理邏輯與資料存取，讓瀏覽器只負責互動。

---

## 💡 本文：核心概念與實作

### 1. 什麼是 Server Components (預設)？

在 Next.js 的 App Router 中，所有的元件「預設」都是 Server Components。

| 特性 | 說明 |
| :--- | :--- |
| **運作方式** | 程式碼在伺服器執行，產出 HTML 後傳送到瀏覽器。 |
| **優點** | 零 Bundle 體積、直接存取資料庫、安全性極高 (API Keys 不外流)。 |
| **限制** | 無法使用 Hooks (useState 等)、無法監聽瀏覽器事件 (onClick)。 |

### 2. 什麼是 Client Components？

當您的元件需要與使用者「互動」時，就需要透過 `"use client"` 指令宣告為 Client Components。

#### 💡 必須使用的時機：
*   需要使用 **React Hooks** (如 `useState`, `useEffect`)。
*   需要監聽 **瀏覽器事件** (如 `onClick`, `onChange`)。
*   需要存取 **瀏覽器專屬 API** (如 `window`, `localStorage`)。

### 3. 實戰案例：混合架構設計

想像一個「商品詳情頁」，我們該如何分配資源？
*   **商品描述 (Server)**：直接從 DB 讀取，SEO 友好。
*   **收藏按鈕 (Client)**：處理點擊狀態，標註為 `"use client"`。

```javascript
// src/app/products/[id]/page.tsx (Server Component)
import AddToCartButton from '@/components/AddToCartButton';

export default async function ProductPage({ params }) {
  // 1. 直接在伺服器抓資料，不流向前端
  const product = await fetchProduct(params.id);

  return (
    <div className="p-6">
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* 2. 只有互動部分切換成 Client Component */}
      <AddToCartButton productId={product.id} />
    </div>
  );
}
```


## 🏁 結論：該如何選擇？

在設計系統架構時，請遵循 **「盡量將元件留在 Server 端」** 的原則，只有非互動不可的地方才使用 Client。

:::tip[渲染決策圖]
![Server vs Client](https://hackmd.io/_uploads/HJGRuJ0TZe.png)
:::

| 今日總結 | 核心要點 |
| :--- | :--- |
| **今日進度** | 區分 Server 與 Client Components 的使用邊界。 |
| **專家筆記** | 將 Client Component 放在組件樹的末端 (Leaf Nodes)，能極大化效能。 |


> **參考來源：**
> 1. [Next.js - Rendering Fundamentals](https://nextjs.org/docs/app/building-your-application/rendering)
> 2. [Next.js - Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)