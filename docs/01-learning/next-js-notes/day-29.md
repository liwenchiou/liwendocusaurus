---
title: "Day 29 - 上線最後一哩路：Vercel 部署與環境變數管理"
sidebar_label: "Day 29 - 上線最後一哩路"
sidebar_position: 29
description: "Next.js 30 天學習筆記系列 - 第 29 天：Day 29 - 上線最後一哩路：Vercel 部署與環境變數管理。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 上線最後一哩路, Vercel, 部署與環境變數管理, learning, next-js-notes]
---


# Next.js 30 天全端實戰：Day 29 - 上線最後一哩路：Vercel 部署與環境變數管理

## 一、 前言

身為開發者，我們最不想看到的畫面就是「本地執行沒問題，部署上去就崩潰」。這通常是因為環境變數設定錯誤或是建置（Build）過程出錯。

Next.js 是由 Vercel 開發的，因此 Vercel 提供了一鍵部署的最佳體驗。但無論你部署在哪裡（Vercel, Docker, AWS），掌握建置流程與保護 API Key、資料庫密碼等敏感資訊都是必修課。今天我們就來完成上線前的最後準備。

---

## 二、 本文：從開發環境邁向生產環境

### 1. 環境變數的階層 (Environment Variables)

Next.js 內建支援不同環境的變數設定，避免你在程式碼中硬編碼（Hardcode）敏感資訊。

* `.env.local`：本地開發專用，**絕對不要推上 Git**。
* `.env.production`：生產環境預設值。
* **命名規則**：
  - 只有以 `NEXT_PUBLIC_` 開頭的變數才會暴露給瀏覽器（Client-side）。
  - 其他變數（如 `DATABASE_URL`）僅限於伺服器端（Server-side）存取，非常安全。

### 2. 建置與預覽 (Build & Start)

在部署前，建議先在本地模擬一次生產環境的執行狀況：

```bash
npm run build
npm run start
```
`build` 命令會執行以下動作：
- 編譯 TypeScript 與 CSS。
- 優化圖片與字體。
- **預渲染 (Prerendering)**：將能轉為靜態的頁面直接生成 HTML，並檢查 `generateStaticParams` 是否正確。

### 3. Vercel 一鍵部署

這是最推薦的部署方式，特別是對於使用 App Router 的專案：

1. 將代碼推送到 GitHub/GitLab。
2. 在 Vercel 後台匯入專案。
3. **設定環境變數**：在 Vercel 介面填入你的 `DATABASE_URL`、`AUTH_SECRET` 等。
4. **自動 CI/CD**：未來只要你 `git push`，Vercel 就會自動重新建置並部署。

### 4. 監控與分析 (Speed Insights)

部署成功後，你可以開啟 Vercel 的 Speed Insights。它會蒐集真實使用者的 LCP、FID 等數據，讓你清楚知道網站到底快不快。


## 三、 結論：讓專案在雲端穩定運行

部署不是結束，而是維護的開始。

* 今日小結：
  - 敏感資訊（API Keys）務必透過環境變數管理，嚴禁寫在代碼裡。
  - `npm run build` 是檢驗代碼品質的最後關卡，報錯就代表邏輯有瑕疵。
  - 善用 `NEXT_PUBLIC_` 前綴區分前端與後端的變數權限。

* 開發者心得：在部署到 Vercel 時，如果你的資料庫是在台灣（例如 GCP 台灣機房），建議將 Vercel 的 Serverless Function 區域設定在 `hkg1` (香港) 或 `icn1` (首爾)，這能有效減少資料庫查詢的延遲（Latency）。另外，上線前一定要再次檢查 `.gitignore` 是否確實排除了 `.env` 檔案，這是防止資安災難的最基本動作。

---

參考來源：
1. Next.js Documentation - Deployment (https://nextjs.org/docs/app/building-your-application/deploying)
2. Vercel - Environment Variables (https://vercel.com/docs/projects/environment-variables)