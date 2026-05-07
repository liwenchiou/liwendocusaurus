---
title: "Day 03 - Layout 與 Template：構建可複用的 UI 架構"
sidebar_label: "Day 03 - Layout 與 Template"
sidebar_position: 3
---

# Next.js 30 天全端實戰：Day 03 - Layout 與 Template：構建可複用的 UI 架構

## 一、 前言

當我們開發一個網站時，導覽列 (Navbar) 和頁尾 (Footer) 通常是每個頁面都會出現的元素。在傳統 React 開發中，我們可能要在每個頁面組件裡手動引入這些元件。

Next.js 透過 Layout 機制，讓我們能以層級化的方式管理共用介面。這不僅讓代碼更整潔，更重要的是它能「保留狀態」——當使用者在不同頁面間切換時，導覽列不會重新渲染，這能帶來極其流暢的導覽體驗。

---

## 二、 本文：佈局系統的核心觀念

### 1. Root Layout (根佈局)

在 `src/app/layout.tsx` 是整個應用程式的進入點。它是「必須」存在的，且必須包含 `<html>` 與 `<body>` 標籤。

* 作用：定義全站通用的字體、SEO Meta 標籤、全域樣式。
* 特性：它是最外層的包裝，影響範圍涵蓋所有頁面。
```javascript=
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
![image](https://hackmd.io/_uploads/ryx6CRppWe.png)

### 2. Nesting Layouts (嵌套佈局)

Layout 是可以層層堆疊的。如果你在某個子資料夾（如 `/dashboard`）建立一個 `layout.tsx`，它只會套用在該資料夾及其子資料夾下的頁面。



* 案例：後台管理系統
  - Root Layout：負責全站導覽列。
  - Dashboard Layout：負責側邊選單 (Sidebar)。
  - 最終頁面會是：[Root Layout [Dashboard Layout [Page]]]
![image](https://hackmd.io/_uploads/rJ-t8yR6Wx.png)


### 3. Layout vs Template：差別在哪？

這是面試與實際開發中最常被問到的問題。兩者看起來很像，但行為完全不同：

* Layout (常用)：
  - 在路由切換時，Layout 內容**不會**重新渲染。
  - 適合：導覽列、搜尋列（使用者輸入的內容切換頁面後仍會保留）。
* Template (特殊用途)：
  - 在路由切換時，Template **會**為每個頁面重新建立實例。
  - 適合：需要依賴頁面切換來觸發的動畫（CSS Transition）、需要重新初始化狀態的表單。
:::spoiler 比較表
![image](https://hackmd.io/_uploads/SymgPyA6bl.png)
:::



### 4. 實戰案例：規劃一個儀表板架構

假設我們正在開發一個電商後台，我們可以這樣組織：

* `src/app/layout.tsx` (Root Layout)
  - 放置全站通用的 CSS 與導覽。
* `src/app/admin/layout.tsx` (Admin Layout)
  - 放置「管理員側邊欄」。
* `src/app/admin/products/page.tsx` (產品頁)
* `src/app/admin/orders/page.tsx` (訂單頁)



當使用者從「產品頁」切換到「訂單頁」時，側邊欄完全不會跳動或重新加載，這種「局部刷新」的效果就是 Next.js 效能強大的秘密。

---

## 三、 結論

Layout 的設計反映了 Next.js 的架構美學：將「不變的」與「變動的」分離。這不僅優化了渲染效能，也讓我們在處理複雜介面時，邏輯更清晰。

* 今日小結：我們學習了 Root Layout 的強制性、如何嵌套多層 Layout，以及 Layout 與 Template 在渲染行為上的本質差異。
* 專家筆記：盡可能使用 Layout 而非 Template。只有當你明確需要元件在頁面切換時「重置」狀態或觸發進入動畫時，才考慮使用 Template。

---

參考來源：
1. Next.js Documentation - Pages and Layouts (https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts)
2. Next.js Documentation - Templates (https://nextjs.org/docs/app/api-reference/file-conventions/template)