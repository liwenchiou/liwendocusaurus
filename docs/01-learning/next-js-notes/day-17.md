---
title: "Day 17 - 攔截路由：打造流暢的燈箱與彈窗體驗"
sidebar_label: "Day 17 - 攔截路由"
sidebar_position: 17
description: "Next.js 30 天學習筆記系列 - 第 17 天：Day 17 - 攔截路由：打造流暢的燈箱與彈窗體驗。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 攔截路由, 打造流暢的燈箱與彈窗體驗, learning, next-js-notes]
---

# Next.js 30 天全端實戰：Day 17 - 攔截路由：打造流暢的燈箱與彈窗體驗

## 一、 前言

身為開發者，你一定遇過這種需求：在列表頁點擊一張圖片，希望它以「彈窗 (Modal)」方式開啟，讓使用者不用離開列表就能看到細節。但如果使用者重新整理網頁，或者把網址傳給別人，則應該直接進入那個圖片的「完整獨立頁面」。

在傳統 React 中，這需要管理複雜的 Modal 狀態。但在 Next.js 中，我們可以透過「攔截路由」輕鬆達成：**點擊時攔截導覽並顯示彈窗，重新整理時顯示完整頁面**。

---

## 二、 本文：攔截路由的實作邏輯

### 1. 核心語法：使用 (..) 符號

攔截路由的資料夾命名方式類似於檔案路徑：
* `(.)`：攔截「同層級」的路由。
* `(..)`：攔截「上一層」的路由。
* `(..)(..)`：攔截「上兩層」的路由。
* `(...)`：從根目錄 `app` 開始攔截。

### 2. 實戰案例：圖片列表與燈箱

想像一個相簿應用程式，目錄結構如下：

```markdown
src/app/
├── feed/
│   ├── page.tsx          <-- 圖片列表頁
│   └── (..)photo/[id]/   <-- 攔截路由：點擊圖片時顯示彈窗
└── photo/[id]/
    └── page.tsx          <-- 原始路由：重新整理時顯示完整頁面

```

### 3. 如何運作？

* **情境 A (導覽觸發)**：使用者在 `/feed` 點擊連結到 `/photo/123`。Next.js 會發現你有一個 `(..)photo/[id]`，於是攔截這次請求，把該資料夾的內容渲染在當前頁面的 Layout 中（通常搭配 Day 16 的平行路由插槽使用）。
* **情境 B (直接訪問)**：使用者直接在網址列輸入 `/photo/123` 或重新整理。Next.js 不會觸發攔截，而是直接渲染 `app/photo/[id]/page.tsx`。

### 4. 搭配平行路由 (Parallel Routes) 實作彈窗

這兩者通常是「組合技」。我們在 Layout 中定義一個 `@modal` 插槽：

[檔案：src/app/layout.tsx]
```typescript
export default function Layout({ children, modal }) {
  return (
    <html>
      <body>
        {children}
        {modal} {/* 這裡用來顯示攔截到的彈窗內容 */}
      </body>
    </html>
  );
}
```

## 三、 結論：讓 Web 擁有 App 般的絲滑感

攔截路由讓我們能保留瀏覽器的「回退」功能（按下 Back 鍵會關閉彈窗回到列表），同時具備獨立的 URL 分享能力。

* 今日小結：
  - 攔截路由適合「上下文敏感」的 UI 模式。
  - 使用 `(.)`、`(..)` 等符號來對應目標路徑。
  - 通常與平行路由（Slots）結合，將彈窗插入到全局或局部佈局中。

* 開發者心得：這是 `Next.js` 最難理解但最華麗的功能之一。初學者常卡在路徑匹配不正確。記得：攔截路由是攔截「導覽行為」。如果你在開發時發現怎麼點都沒反應，先檢查你的 `(..)` 層級是否正確對應到了目標 page 的資料夾深度。

---

參考來源：
1. Next.js Documentation - Intercepting Routes (https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes)
2. Next.js - Modals with Parallel and Intercepting Routes (https://nextjs.org/docs/app/building-your-application/routing/intercepting-routes#modals)