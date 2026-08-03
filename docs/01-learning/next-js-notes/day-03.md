---
title: "Day 03 - Layout 與 Template：構建可複用的 UI 架構"
sidebar_label: "Day 03 - Layout 與 Template"
sidebar_position: 3
description: "Next.js 30 天學習筆記系列 - 第 03 天：Day 03 - Layout 與 Template：構建可複用的 UI 架構。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, Layout, Template, 構建可複用的, UI, 架構, learning, next-js-notes]
---


# Day 03 - Layout 與 Template：構建可複用的 UI 架構

當我們開發一個網站時，導覽列 (Navbar) 和頁尾 (Footer) 通常是每個頁面都會出現的元素。

Next.js 透過 **Layout** 機制，讓我們能以層級化的方式管理共用介面。這不僅讓代碼更整潔，更重要的是它能「保留狀態」——當使用者在不同頁面間切換時，共用元件不會重新渲染。

---

## 💡 本文：佈局系統的核心觀念

### 1. Root Layout (根佈局)

在 `src/app/layout.tsx` 是整個應用程式的進入點。它是「必須」存在的，且必須包含 `<html>` 與 `<body>` 標籤。

*   **作用**：定義全站通用的字體、SEO Meta 標籤、全域樣式。
*   **特性**：它是最外層的包裝，影響範圍涵蓋所有頁面。

```javascript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <nav>這是全站導覽列</nav>
        {children} {/* 這裡會渲染各個頁面的內容 */}
      </body>
    </html>
  );
}
```

:::tip[結構預覽]
![Layout 結構](https://hackmd.io/_uploads/ryx6CRppWe.png)
:::

### 2. Nesting Layouts (嵌套佈局)

Layout 是可以層層堆疊的。如果您在某個子資料夾（如 `/dashboard`）建立一個 `layout.tsx`，它只會套用在該路徑下的頁面。

*   **案例：後台管理系統**
    *   **Root Layout**：負責全站導覽。
    *   **Dashboard Layout**：負責側邊選單 (Sidebar)。
    *   **最終層級**：`[Root Layout [Dashboard Layout [Page]]]`

### 3. Layout vs Template：核心差異

這是面試與開發中最常被問到的問題。兩者的行為完全不同：

| 特性 | Layout (常用) | Template (特殊用途) |
| :--- | :--- | :--- |
| **渲染行為** | 路由切換時 **不會** 重新渲染 | 路由切換時 **會** 重新建立實例 |
| **狀態保留** | 保留輸入內容、捲軸位置 | **不保留** 狀態，每次重新初始化 |
| **適用場景** | 導覽列、搜尋列、持久化 UI | 進入動畫 (CSS Transition)、表單重置 |

<details>
  <summary>點擊展開：渲染差異圖解</summary>

  ![Layout vs Template](https://hackmd.io/_uploads/SymgPyA6bl.png)
</details>

### 4. 實戰建議：規劃儀表板架構

假設我們正在開發一個電商後台，可以這樣組織：
*   `src/app/layout.tsx` (Root Layout)：全站 CSS 與全域導覽。
*   `src/app/admin/layout.tsx` (Admin Layout)：管理員專屬側邊欄。
*   `src/app/admin/products/page.tsx` (產品頁)。

當使用者在產品頁與訂單頁切換時，側邊欄完全不會跳動或重新加載，這種 **「局部刷新」** 是 Next.js 效能強大的秘密。


## 🏁 結論

Layout 的設計反映了 Next.js 的美學：將「不變的」與「變動的」分離。

| 今日總結 | 核心要點 |
| :--- | :--- |
| **今日進度** | 學習 Root Layout 強制性、嵌套佈局與 Template 的差異。 |
| **專家筆記** | 優先使用 Layout。只有在需要「頁面切換動畫」或「重置表單」時才使用 Template。 |


> **參考來源：**
> 1. [Next.js - Pages and Layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
> 2. [Next.js - Templates Guide](https://nextjs.org/docs/app/api-reference/file-conventions/template)