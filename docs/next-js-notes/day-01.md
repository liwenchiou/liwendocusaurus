---
title: "Day 01 - 從 React 邁向全端架構的思維轉型"
sidebar_label: "Day 01 - 思維轉型"
sidebar_position: 1
---

# Day 01 - 從 React 邁向全端架構的思維轉型

歡迎來到這個專欄！如果你已經熟悉 JavaScript 甚至 React，你可能會問：「為什麼我們還需要 Next.js？」

在純 React (SPA) 的開發模式下，我們經常面臨 SEO 優化困難與首屏載入過慢的問題。對於追求專業與效能的開發者來說，Next.js 不僅僅是個框架，它是一套完整的「全端解決方案」。這 30 天，我們將從前端思維轉型，學習如何建構具備伺服器能力的現代化 Web 應用。

---

## 💡 本文：環境安裝與核心架構觀念

### 1. 為什麼選擇 Next.js？

在技術選型上，Next.js 解決了三個核心痛點：

*   **渲染策略的靈活性**：混合使用 SSR (伺服器渲染) 與 SSG (靜態生成)，提升效能與 SEO。
*   **自動化優化**：內建圖片 (`next/image`)、字體與程式碼分割優化，天生具備優異的 Web Vitals。
*   **全端邊界模糊**：透過 Server Components 與 Server Actions，讓前後端溝通空前順暢。

### 2. 初始化開發環境

在建構系統前，穩定的環境是首要條件。

:::info 環境要求

請確保您的 Node.js 版本符合官方建議 (**v18.18+**)。考量到長期維護，建議使用 **Node.js v20 (LTS)** 以上版本。建議安裝 [nvm](https://github.com/nvm-sh/nvm) 進行版本管理。

:::

執行以下指令開啟專案：

```bash
npx create-next-app@latest
```

#### 安裝選項對照表

| 選項 Q&A | 翻譯說明 | 包含配置 |
| :--- | :--- | :--- |
| **Yes, use recommended defaults** | **是的，使用推薦預設值** | TypeScript, ESLint, Tailwind CSS, App Router |
| **No, reuse previous settings** | 不，重複使用之前的設定 | (延用舊有配置) |
| **No, customize settings** | 不，我要自定義設定 | (手動挑選) |

:::success 專家建議

如果您是初學者，選擇第一個 **"Yes, use recommended defaults"** 是最穩妥的做法。這會為您配置目前業界主流的開發環境。

:::

:::details 點擊展開：專案初始化截圖

![初始化成功](https://hackmd.io/_uploads/Sk3tdC66-g.png)

:::

### 3. 啟動與目錄結構

#### 啟動步驟
1. 使用 **VS Code** 開啟專案資料夾。
2. 執行 `npm i` 安裝套件。
3. 執行 `npm run dev` 啟動開發伺服器。
4. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)。

:::tip 成功畫面

看到下圖表示您的 Next.js 環境已成功啟動！

![啟動成功](https://hackmd.io/_uploads/S1hOKAT6bl.png)

:::

#### 目錄結構初探
安裝完成後，你會發現 `app/` 目錄下與傳統 React 不同：
*   `layout.tsx`：**骨架**。負責全站共用的 UI（如導覽列），切換頁面時不會重新渲染。
*   `page.tsx`：**入口**。定義每個路由的具體顯示內容。
*   `globals.css`：全域樣式配置，預設已整合 Tailwind CSS。

---

## 🏁 結論

當你看到開發頁面時，代表你已經完成了第一步。這不只是安裝一個工具，而是開啟了通往全端架構的大門。

| 今日總結 | 核心要點 |
| :--- | :--- |
| **今日進度** | 完成開發環境搭建，理解 App Router 核心概念。 |
| **專家筆記** | 若安裝權限錯誤，請改用 NVM 管理 Node 版本。 |

---

> **參考來源：**
> 1. [Next.js Installation Guide](https://nextjs.org/docs/app/getting-started/installation)
> 2. [Vercel - App Router Essentials](https://vercel.com/blog/nextjs-app-router-essentials)