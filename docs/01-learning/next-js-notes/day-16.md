---
title: "Day 16 - 平行路由：解構複雜儀表板的利器"
sidebar_label: "Day 16 - 平行路由"
sidebar_position: 16
description: "Next.js 30 天學習筆記系列 - 第 16 天：Day 16 - 平行路由：解構複雜儀表板的利器。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 平行路由, 解構複雜儀表板的利器, learning, next-js-notes]
---


# Next.js 30 天全端實戰：Day 16 - 平行路由：解構複雜儀表板的利器

## 一、 前言

開發者在設計複雜介面（如：管理後台）時，畫面通常會切分成多個區塊：數據統計、通知中心、使用者資訊。如果這些全部塞在一個 page.tsx 裡，只要其中一個 API 慢，整頁就會卡住。

平行路由（Parallel Routes）允許你在同一個網址下，並行渲染多個獨立的頁面。這不僅讓程式碼更模組化，還能讓每個區塊擁有專屬的 Loading 與 Error 狀態，這就是專業開發者在處理高複雜度 UI 時的「解耦」思維。

---

## 二、 本文：平行路由的實戰配置

### 1. 核心概念：使用「插槽 (@Slot)」

在 Next.js 的目錄規範中，以 `@` 開頭的資料夾稱為「插槽」。這些資料夾不會反映在網址路徑上，而是被視為 Props 傳遞給同層級的 `layout.tsx`。

```markdown
src/app/dashboard/
├── @analytics/      <-- 插槽 A：數據分析區
│   ├── page.tsx
│   └── loading.tsx  <-- 獨立的載入畫面
├── @team/           <-- 插槽 B：團隊管理區
│   └── page.tsx
│   └── error.tsx    <-- 獨立的錯誤處理
├── layout.tsx       <-- 組合所有插槽的地方
└── page.tsx         <-- 預設的內容 (即 children)
```
### 2. 在 Layout 中組合區塊

你可以像使用一般的 React Props 一樣，在 Layout 中決定這些區塊的排列位置。

[檔案：src/app/dashboard/layout.tsx]
```typescript
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">管理儀表板</h1>
      
      {/* 主要內容區 */}
      <section className="mb-8">{children}</section>
      
      {/* 平行路由區 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded shadow">{analytics}</div>
        <div className="border p-4 rounded shadow">{team}</div>
      </div>
    </div>
  );
}
```
### 3. 優勢：局部渲染與錯誤隔離

平行路由最迷人的地方在於它的「獨立性」：



* **獨立 Loading**：如果 `analytics` 的資料要抓很久，畫面上只有該區塊會顯示 Skeleton，`team` 與 `children` 會立刻出現。
* **獨立 Error**：如果 `team` 區塊噴錯了，它只會顯示自己的 `error.tsx`。使用者依然可以操作數據分析區，不會整頁崩潰。

### 4. 預設頁面：default.tsx

當使用者進行導覽（例如從 `/dashboard` 到 `/dashboard/settings`），如果某個插槽在新的路徑下沒有對應的頁面，Next.js 會尋找 `default.tsx` 來渲染。務必建立這個檔案以避免出現 404。


## 三、 結論：從「整頁」思維轉向「元件」思維

平行路由強迫我們將複雜的頁面拆解成更小的、可獨立運行的路由單元。

* 今日小結：
  - `@folder` 定義的插槽會自動變成 Layout 的 Props。
  - 每個插槽都有完整的路由功能（page, loading, error, layout）。
  - 適用於儀表板、社交媒體側邊欄、或是需要權限分流的畫面。

* 開發者心得：雖然平行路由很強大，但如果區塊之間不需要獨立的載入狀態或網址變動，普通的「React 元件」依然是更簡單的選擇。只有當你需要讓區塊具備「異步載入隔離」或是「網址聯動」時，平行路由才能發揮最大價值。

---

參考來源：
1. Next.js Documentation - Parallel Routes (https://nextjs.org/docs/app/building-your-application/routing/parallel-routes)
2. Next.js - Advanced Routing Patterns (https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#slots)