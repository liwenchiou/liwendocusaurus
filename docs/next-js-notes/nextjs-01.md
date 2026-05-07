---
slug: nextjs-01
title: "Next.js 學習筆記 #01：從零開始的環境安裝與核心觀念"
date: 2026-04-28T03:36:52.487232+00:00
authors: [liwen]
tags: [學習筆記, next.js]
---

# Next.js 學習筆記 #01：從零開始的環境安裝與核心觀念

## 一、 前言

在現代前端開發的領域中，React 憑藉其組件化思維成為許多開發者的首選。然而，隨著專案規模與複雜度提升，純 React (SPA) 在 SEO 搜尋引擎最佳化以及首屏載入速度上逐漸顯露其侷限性。

為了克服這些挑戰，我決定開啟這場為期 30 天的 Next.js 學習旅程。Next.js 不僅僅是 React 的延伸，它更是一個強大的全端框架，自帶路由系統、自動化優化機制與多種渲染策略（SSR/SSG/ISR）。今天，我們將從最基礎的環境安裝開始，邁出成為 Next.js 開發者的第一步。

---

## 二、 本文：環境安裝與核心觀念

### 1. 為什麼選擇 Next.js？

雖然 React 在處理 UI 渲染上表現卓越，但它本質上是一個函式庫 (Library)。而作為框架 (Framework) 的 Next.js 則提供了更完整的架構支持：

>* 改善 SEO：透過伺服器端渲染 (SSR)，讓搜尋引擎爬蟲能直接讀取到完整的 HTML 內容。
>* 優化效能：內建圖片優化 (next/image)、字體優化與自動程式碼分割 (Code Splitting)，顯著提升首屏載入速度。
>* 簡化路由：採用「檔案系統路由 (File-based Routing)」，資料夾結構即代表 URL 路徑。

### 2. 動手實作：快速安裝環境

我們將使用官方推薦的 App Router 模式來開啟專案。請在終端機執行以下指令：

```bash
npx create-next-app@latest
```
在安裝過程中，建議選擇以下配置以符合現代開發標準：

- TypeScript: Yes (提供強型別檢查，是專業開發標配)
- ESLint: Yes (自動檢查程式碼規範)
- Tailwind CSS: Yes (快速構建響應式 UI)
- src/ directory: Yes (讓專案目錄結構更整潔)
- App Router: Yes (核心推薦，支援 Server Components)
- Import Alias: Yes (@/*) (方便使用絕對路徑引用組件)

### 3. 初探目錄結構

安裝完成後，專案中幾個關鍵的目錄與檔案如下：

>* src/app/：專案的核心。所有的路由、頁面與佈局都存放於此。
>* public/：存放靜態資源，如圖片、Favicon 或字體檔案。
>* next.config.mjs：Next.js 的進階設定檔。
>* package.json：定義專案依賴套件與執行指令。

---

## 三、 結論

成功安裝並在終端機輸入 npm run dev 後，開啟 http://localhost:3000 看到歡迎頁面，就代表你已正式進入 Next.js 的世界。

---
