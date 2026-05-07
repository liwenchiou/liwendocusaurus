---
title: "Day 01 - 從 React 邁向全端架構的思維轉型"
sidebar_label: "Day 01 - 從 React 邁向全端架構的思維轉型"
sidebar_position: 1
---

# Next.js 30 天全端實戰：Day 01 - 從 React 邁向全端架構的思維轉型

## 一、 前言

歡迎來到這個專欄。如果你已經熟悉 JavaScript 甚至 React，你可能會問：「為什麼我們還需要 Next.js？」

在純 React (SPA) 的開發模式下，我們經常面臨 SEO 優化困難與首屏載入過慢的問題。對於追求專業與效能的開發者來說，Next.js 不僅僅是個框架，它是一套完整的「全端解決方案」。這 30 天，我們將從前端思維轉型，學習如何建構具備伺服器能力的現代化 Web 應用。

---

## 二、 本文：環境安裝與核心架構觀念

### 1. 為什麼選擇 Next.js？

在技術選型上，Next.js 解決了三個核心痛點：

* 渲染策略的靈活性：你可以根據需求，在同一個專案中混合使用 SSR (伺服器端渲染) 與 SSG (靜態生成)，這對產品效能與 SEO 至關重要。
* 自動化優化：內建圖片 (next/image)、字體與程式碼分割優化，網站天生就具備優異的 Core Web Vitals 指標。
* 全端邊界模糊：透過 Server Components 與 Server Actions，讓前後端的溝通與資料存取變得空前順暢。

### 2. 初始化開發環境

在建構系統前，穩定的環境是首要條件。請確保你的 Node.js 版本符合官方建議 (v18.18+)。
>⚠️ 雖然官方要求 v18.18+，但考量到長期維護與效能，建議使用 Node.js v20 (LTS) 以上版本。若電腦有多個專案環境，強烈建議安裝 nvm (Node Version Manager) 來進行版本管理。


```bash
npx create-next-app@latest
```

安裝時的選項
1. ? What is your project named?
    翻譯： 輸入專案的名稱
2. ? Would you like to use the recommended Next.js defaults? » - Use arrow-keys. Return to submit.
    翻譯： 您是否要使用推薦的 Next.js 預設設定？
>選項說明：
>1. Yes, use recommended defaults (已選中)
翻譯： 是的，使用推薦預設值。
包含的配置： TypeScript, ESLint, No React Compiler (不使用 React 編譯器), Tailwind CSS, No src/ directory (不使用 src 目錄), App Router, AGENTS.md。
>2. No, reuse previous settings
翻譯： 不，重複使用之前的設定。
>3. No, customize settings
翻譯： 不，我要自定義設定。

:::success
***建議與參考***
如果您是初學者或想快速開始，選擇第一個 "Yes, use recommended defaults" 是最穩妥的做法。這會為您配置目前業界主流的開發環境（如 TypeScript 和 Tailwind CSS）。
:::

:::details 
![image](https://hackmd.io/_uploads/Sk3tdC66-g.png)


:::

看到這個畫面，專案初始設定就成功了
![image](https://hackmd.io/_uploads/H17ndRppbl.png)

### 啟動專案
1. 使用 VSCODE(或任何你習慣的編輯器) 開啟專案
2. 輸入 `npm i` 將套件都安裝進來
3. 輸入 `npm run dev` 將專案啟動
4. 輸入網址 http://localhost:3000
5. 看到這個畫面就表示啟動成功了
![image](https://hackmd.io/_uploads/S1hOKAT6bl.png)


### 3. App Router 目錄結構初探

安裝完成後，你會發現 `src/app` 目錄下與傳統 React 不同：

* layout.tsx：這是「骨架」。負責全站共用的 UI（如導覽列），且切換頁面時不會重新渲染。
* page.tsx：這是「入口」。定義每個路由的具體顯示內容。
* globals.css：全域樣式配置，預設已整合 Tailwind CSS。

---

## 三、 結論

當你成功執行 `npm run dev` 並看到開發頁面時，代表你已經完成了第一步。
這不只是安裝一個工具，而是開啟了通往全端架構的大門。

* 今日小結：我們完成了開發環境的搭建，並理解了以 App Router 為核心的 Next.js 開發概念。
* 專家筆記：若安裝時遇到權限問題，建議使用 nvm (Node Version Manager) 來管理 Node 版本，這能有效避免環境配置上的異常。

---

參考來源：
1. Next.js Documentation - Installation (https://nextjs.org/docs/app/getting-started/installation)
2. Vercel - Next.js App Router Essentials (https://vercel.com/blog/nextjs-app-router-essentials)