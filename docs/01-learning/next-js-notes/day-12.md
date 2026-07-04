---
title: "Day 12 - 效能優化：別讓大圖與字體拖垮你的 LCP"
sidebar_label: "Day 12 - 效能優化"
sidebar_position: 12
description: "Next.js 30 天學習筆記系列 - 第 12 天：Day 12 - 效能優化：別讓大圖與字體拖垮你的 LCP。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 效能優化, 別讓大圖與字體拖垮你的, LCP, learning, next-js-notes]
---

# Next.js 30 天全端實戰：Day 12 - 效能優化：別讓大圖與字體拖垮你的 LCP

## 一、 前言

身為開發者，我們都希望網站載入「秒開」。但在實務中，最常讓網站變慢的元兇通常不是演算法寫太爛，而是幾張「沒處理過」的原圖。

傳統 <img /> 標籤會帶來幾個問題：圖片太大浪費頻寬、載入時頁面跳動（CLS），以及格式過舊。今天我們來拆解 Next.js 如何透過內建組件，自動幫我們完成這些專業級的優化。

---

## 二、 本文：Image 與 Font 優化實戰

### 1. 為什麼要用 `<Image />` 組件？

Next.js 的 `next/image` 是對原生 <img /> 的強力封裝。它具備以下黑科技：

* 自動轉檔：根據瀏覽器支援度，自動將 JPG/PNG 轉成 WebP 或 AVIF。
* 響應式尺寸：自動根據裝置大小提供不同解析度的圖片，手機不再下載 4K 大圖。
* 防止版面移動 (CLS)：強制設定寬高比例，確保圖片載入前預留空間，不會讓內容突然「跳一下」。
* 延遲載入 (Lazy Loading)：預設只會載入出現在視窗內的圖片，節省流量。



### 2. 實戰示範：基礎用法與優先權

```javascript
import Image from 'next/image';

export default function HeroSection() {
  return (
    <div className="hero">
      <Image
        src="/banner.jpg"
        alt="首頁大圖"
        width={1200}
        height={600}
        // 關鍵屬性：priority 會讓這張圖優先下載，適合用於首屏圖 (LCP)
        priority 
        className="rounded-lg"
      />
    </div>
  );
}
```

### 3. 處理「不確定尺寸」的背景圖

如果你需要圖片填滿整個容器（例如背景），可以使用 `fill` 屬性。

```html=
<div className="relative h-64 w-full">
  <Image
    src="/background.jpg"
    alt="背景圖"
    fill
    className="object-cover" // 配合 CSS 確保圖片不變形
  />
</div>
```

### 4. 字體優化：next/font

字體載入時的「閃爍」（FOIT/FOUT）也是影響體驗的大敵。`next/font` 會自動下載字體檔案並進行「自我託管 (Self-hosting)」，這意味著：
- 瀏覽器不再需要連線到 Google Fonts，減少一次 DNS 查詢。
- 字體檔案會跟著你的網頁一起部署，速度更快且隱私更佳。

```javascript
// src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}```


## 三、 結論：把優化變成開發預設值

在 Next.js 中，優化不是「選配」，而是「標配」。透過這些內建組件，我們在寫程式的當下就已經完成了大部分的效能調優。

* 今日小結：
  - 首屏可見的圖片（如 Banner）務必加上 `priority`。
  - 使用 `next/font` 取代外部字體連結。
  - 外部圖片必須在 `next.config.mjs` 中設定 `remotePatterns` 才能顯示。

* 開發者心得：雖然 `<Image>` 很強，但它在開發模式下有時會因為動態轉檔讓電腦變慢。別擔心，這在生產環境 (Production) 會透過快取變得極快。另外，如果是從外部 API 抓圖，記得先檢查圖片來源的穩定性，並設定適當的 `sizes` 屬性來幫助瀏覽器選擇正確的圖檔。

---

參考來源：
1. Next.js Documentation - Image Optimization (https://nextjs.org/docs/app/building-your-application/optimizing/images)
2. Next.js Documentation - Font Optimization (https://nextjs.org/docs/app/building-your-application/optimizing/fonts)