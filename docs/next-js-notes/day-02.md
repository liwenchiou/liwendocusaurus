---
title: "Day 02 - 路由架構：檔案即路徑的設計哲學"
sidebar_label: "Day 02 - 路由架構"
sidebar_position: 2
---

# Next.js 30 天全端實戰：Day 02 - 路由架構：檔案即路徑的設計哲學

## 一、 前言

在純 React 或 JavaScript 的開發中，我們習慣使用 React Router 這類的套件來定義路由表。但在 Next.js 的世界裡，路由不需要「寫」，而是「放」。

今天我們要深入探討 App Router 的核心邏輯。理解這個機制，是從前端開發者轉向架構思維的關鍵點，因為檔案結構的組織直接決定了應用的網址結構與渲染行為。

---

## 二、 本文：App Router 路由機制

### 1. 什麼是檔案系統路由 (File-based Routing)？

Next.js 使用資料夾來定義路由。每個在 `src/app` 資料夾下的子資料夾，都代表一個 URL 路徑段 (Path Segment)。

* 基礎對應規則：
  - src/app/page.tsx  ->  對應網址 /
  - src/app/about/page.tsx -> 對應網址 /about
  - src/app/contact/page.tsx -> 對應網址 /contact

### 2. 實戰案例：規劃一個部落格系統

假設我們要建構一個包含「前台文章、後台管理、登入頁面」的系統，在 Next.js 中我們會這樣規劃目錄：



* 首頁與關於：
  - `src/app/page.tsx` (網址: /)
  - `src/app/about/page.tsx` (網址: /about)
![image](https://hackmd.io/_uploads/r1A82CaaZx.png)
![image](https://hackmd.io/_uploads/SkjP3C66-l.png)

* 動態文章頁面 (Dynamic Routes)：
  - 使用中括號 `[id]` 來處理變動網址。
  - `src/app/posts/[id]/page.tsx` (網址: /posts/1, /posts/hello-world)
  - 在程式碼中，你可以輕鬆取得 `params.id` 來抓取對應文章。

* 路由群組與管理後台 (Route Groups)：
  - 我們想把後台頁面收納在 `admin` 資料夾，但不希望網址出現 `/admin/dashboard`。
  - `src/app/(admin)/dashboard/page.tsx` (網址: /dashboard)
  - 這樣做的好處是：我們可以在 `(admin)` 資料夾下建立一個專屬後台的 `layout.tsx`，而不會影響到前台頁面。
![image](https://hackmd.io/_uploads/ry--TR66-x.png)
![image](https://hackmd.io/_uploads/B1gga0TpWg.png)


### 3. 路由的核心檔案規範

在 Next.js 的路由資料夾中，檔案名稱具有特殊意義：

* page.tsx：定義該路徑的 UI。
* layout.tsx：定義該層級及其子路由共用的版型（如 Header/Footer）。
* loading.tsx：定義資料載入時的暫時畫面 (Skeleton Screen)。
* error.tsx：定義當該路由發生錯誤時的降級畫面。

---

## 三、 結論

理解 Next.js 的路由邏輯後，你會發現它極大地減少了開發者的心智負擔。你不再需要手動維護路由表，只需要專注於如何規劃直觀的檔案結構。

* 今日小結：我們學習了基礎路徑對應、動態路由 `[id]` 以及如何利用路由群組 `(group)` 優化架構。
* 專家筆記：在規劃路由時，務必區分哪些組件是「頁面」(Page)，哪些是「元件」(Component)。建議將通用的元件放在 `src/components`，而 `src/app` 僅保留與路由直接相關的邏輯。

---

參考來源：
1. Next.js Documentation - Routing Fundamentals (https://nextjs.org/docs/app/building-your-application/routing)
2. Next.js Documentation - Defining Routes (https://nextjs.org/docs/app/building-your-application/routing/defining-routes)