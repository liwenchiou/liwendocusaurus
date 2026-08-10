---
slug: nextjs-deployment-cloudflare-pages-struggle
title: "雲端邊緣的折翼：Next.js 部署到 Cloudflare Pages 的 48 小時奮鬥實錄"
date: 2026-04-23T00:56:25.022951+00:00
authors: [liwen]
tags: [cloudflare, NextJs, 雲端部署]

description: "記錄將 Next.js 應用從 Vercel 遷移至 Cloudflare Pages 的挑戰，深入分析 Edge Runtime 的 3MB 腳本限制、SDK 體積優化與 Node.js API 相容性問題。"
keywords: [Next.js Cloudflare Pages 部署, Cloudflare Workers 3MB 限制, Edge Runtime 相容性, Next.js SDK 體積優化, Vercel 遷移]
---

在 Web 開發的世界裡，我們通常會從 Vercel 開始。它很美、很快、很有質感，就像是一個精心裝潢的豪華公寓。但隨著專案成長，我們開始在想：有沒有那種既能擁有極致性能，成本又更平易近人的「自由之地」？

於是，我們把目光投向了 Cloudflare。這兩天，我們就像是一群試圖帶著行李從 Vercel 搬家到 Cloudflare 邊緣計算之城的旅人。雖然最終我們因為行李太重而暫時撤退，但這場「失敗」留下的經驗教訓，或許比成功搬家更值得記錄。

{/* truncate */}


## 為什麼想告別 Vercel，擁抱 Cloudflare？

LiwenBlog CMS 雖然目前在 Vercel 運行良好，但我們心中一直有個「邊緣夢」：
1. **打破流量焦慮**：Vercel 的商業方案雖然強大，但對於個人或小型工作室來說，Cloudflare Pages 那近乎無限的請求數和更透明的成本結構更具吸引力。
2. **追求「真正的」邊緣**：我們希望在離使用者最近的地方（Edge Runtime）處理資料，讓部落格的每一毫秒都能被節省下來。
3. **技術棧的終極整合**：既然我們的數據庫在 Supabase，如果能把 Next.js 也放在 Cloudflare 上，就能構建出一個完全去中心化、高性能的世界級技術棧。

## 撞上那一堵牆：數字背後的物理極限

這場失敗的核心原因，可以總結成一組冷冰冰但現實的數字：**3MB 與 25MB**。

在 Cloudflare Pages / Workers 的環境下，有兩個我們無法迴避的硬指標：
1. **單一腳本限制 (3MB)**：每個 Worker 的腳本大小（未壓縮）不能超過 3MB。當我們使用 `@opennextjs/cloudflare` 將 Next.js 編譯後，最重要的伺服器端邏輯（包括那些重型的 SDK）都會被打包進這個單一文件中。
2. **全專案總合限制 (25MB)**：如果你使用的是免費版，整個專案的靜態資產與腳本總合也有 25MB 的上限。對於一個內建了大量視覺組件與第三方庫的「旗艦版」CMS 來說，這個數字比想像中更脆弱。

雖然 **付費版 (Paid/Standard)** 可以將單一腳本限制放寬到 **10MB**，但這通常意味著你需要每個月支付額外的費用，且依然要面對代碼膨脹導致的冷啟動（Cold Start）延遲問題。

### 3. 環境的基因差異 (The Vercel Lock-in)
除了數字上的限制，我們更深刻感受到的是「基因」的不同。Next.js 作為 Vercel 的親兒子，其 App Router 的許多行為本質上是為其原生平台量身打造的。搬家到 Cloudflare 不只是換個伺服器，更是一場「去 Vercel 化」的架構重構，這種框架與平台間的深度耦合，讓我們在遷移過程中如履薄冰。

### 1. SDK 的重量
我們的應用中包含了一些功能強大但也「沉重」的工具：
- **Shiki**: 用於極致的代碼高亮。
- **React-Markdown / Rehype**: 用於處理內容渲染。
- **Resend**: 郵件服務。
- **Supabase SDK**: 數據庫交互的核心。

在 Vercel 上，這些 SDK 運行在 Node.js 環境中，幾乎沒有大小限制。但在 Cloudflare Edge 環境下，所有這些都必須塞進那個小小的 Worker 腳本裡。

### 2. 環境適應不良 (Node.js vs Edge Runtime)
Next.js 許多方便的功能（如某些特定模組的伺服器端渲染）依賴於完整的 Node.js API，而 Cloudflare 的 Edge Runtime 則是基於 V8 的受限環境。雖然 `open-next` 已經做了很多努力，但要讓整個 App 完美適應，需要大量的重構。

## 我們嘗試過的解決方案（那些我們走過的彎路）

雖然結果是失敗，但我們嘗試了所有能想到的優化手段：

1. **動態導入 (Dynamic Imports)**：
   我們嘗試將重型的組件（如語法高亮的編輯器）改為 `next/dynamic` 僅在客戶端載入。這確實減小了 Server-side 的壓力，但對於某些強依賴服務端邏輯的頁面，優化空間依然有限。
   
2. **SDK 脫水 (SDK Stripping)**：
   我們嘗試移除某些非核心的重型 SDK，改用更輕量（但功能較少）的替代品。但對於追求「旗艦體驗」的我們來說，這種權衡（Trade-off）降低了產品的質感。

3. **OpenNext 精確配置**：
   調整 `open-next.config` 來排除某些不必要的 chunks，但 Next.js App Router 的構建邏輯有時像個黑盒子，難以精確拆分。

4. **與「看不見」的細節對抗**：
   我們在環境變數（Secrets）的遷移和 **圖片優化 (next/image)** 的配置上也耗費了大量心力。在 Vercel 點點介面就能搞定的事，在 Cloudflare 需要透過 `wrangler.toml` 重新佈署，甚至要額外建立 R2 儲存桶來支撐圖片處理。

## 給下一個挑戰者的 3 個建議

如果你也正打算將 Next.js 應用部署到 Cloudflare，請務必先確認以下事項：

1. **模組化你的依賴**：在引入任何庫（Library）之前，先去 [BundlePhobia](https://bundlephobia.com/) 看看它的體積。
2. **優先考慮 Edge-first**：從開發第一天起就以 Edge Runtime 為基準。如果你是到了開發中後期才決定切換環境，那代價可能會非常沉重。
3. **功能權衡**：如果你的應用需要大量重型的 SSR 渲染或依賴傳統 Node.js 庫，那麼 Vercel 或 Netlify 或許才是你更溫暖的家。

## 結語：失敗是另一種形式的累積

雖然這次部署失敗了，但我們對於 LiwenBlog CMS 的性能邊界有了更深刻的認識。有些美是需要空間支撐的，而 Cloudflare 的邊緣計算目前更像是一個「精而小」的藝術館，不適合塞進所有的東西。

我們回到了熟悉的環境，繼續打磨我們的產品。下次再挑戰時，我們會帶著更精簡、更具適應性的代碼再次出發。
