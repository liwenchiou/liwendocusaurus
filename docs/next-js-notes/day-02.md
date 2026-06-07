---
title: "Day 02 - 路由架構：檔案即路徑的設計哲學"
sidebar_label: "Day 02 - 路由架構"
sidebar_position: 2
description: "Next.js 30 天學習筆記系列 - 第 02 天：Day 02 - 路由架構：檔案即路徑的設計哲學。深入探討 Next.js 開發實戰技巧。"
---

# Day 02 - 路由架構：檔案即路徑的設計哲學

在傳統的 React 開發中，我們習慣使用 React Router 來定義路由表。但在 Next.js 的世界裡，路由不需要「寫」，而是透過「檔案擺放位置」來自動生成。

理解這個機制是從前端開發者轉向架構思維的關鍵點，因為檔案結構的組織直接決定了應用的網址結構與渲染行為。

---

## 💡 本文：App Router 路由機制

### 1. 什麼是檔案系統路由 (File-based Routing)？

Next.js 使用資料夾來定義路由。每個在 `src/app` 資料夾下的子資料夾，都代表一個 URL 路徑段 (Path Segment)。

#### 基礎對應規則
| 檔案路徑 | 對應網址 (URL) |
| :--- | :--- |
| `src/app/page.tsx` | `/` (首頁) |
| `src/app/about/page.tsx` | `/about` |
| `src/app/contact/page.tsx` | `/contact` |

### 2. 實戰案例：規劃一個部落格系統

假設我們要建構一個包含「前台文章、後台管理、登入頁面」的系統，我們可以這樣規劃：

#### 🏠 首頁與基礎頁面
*   `src/app/page.tsx` (網址: `/`)
*   `src/app/about/page.tsx` (網址: `/about`)

:::tip[視覺參考]
![頁面預覽](https://hackmd.io/_uploads/r1A82CaaZx.png)
:::

#### 📝 動態文章頁面 (Dynamic Routes)
使用中括號 `[id]` 來處理變動網址。例如：
*   `src/app/posts/[id]/page.tsx`
*   **對應網址**：`/posts/1`, `/posts/hello-world`
*   **技術重點**：在程式碼中，您可以透過 `params.id` 輕鬆抓取對應文章。

#### 🔐 路由群組 (Route Groups)
如果您想將頁面分類管理但不希望網址變長，可以使用括號 `(group)`：
*   `src/app/(admin)/dashboard/page.tsx`
*   **實際網址**：`/dashboard` (隱藏了 `admin` 路徑)
*   **優勢**：可以在 `(admin)` 資料夾下建立專屬的 `layout.tsx`，而不會影響前台。

### 3. 路由核心檔案規範

在 Next.js 的路由資料夾中，檔案名稱具有特殊意義：

| 檔案名稱 | 功能說明 |
| :--- | :--- |
| **page.tsx** | **核心**：定義該路徑的具體顯示內容。 |
| **layout.tsx** | **版型**：定義該層級及其子路由共用的 UI (如 Header/Footer)。 |
| **loading.tsx** | **載入**：定義資料抓取時的骨架屏 (Skeleton Screen)。 |
| **error.tsx** | **錯誤**：定義發生錯誤時的降級畫面。 |


## 🏁 結論

Next.js 的路由邏輯極大地減少了開發者的心智負擔。您不再需要手動維護路由表，只需要專注於規劃直觀的檔案結構。

| 今日總結 | 核心要點 |
| :--- | :--- |
| **今日進度** | 學習基礎路徑對應、動態路由 `[id]` 與路由群組 `(group)`。 |
| **專家筆記** | 頁面放在 `src/app`，通用組件建議放在 `src/components` 以保持架構清晰。 |


> **參考來源：**
> 1. [Next.js - Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
> 2. [Next.js - Defining Routes](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)