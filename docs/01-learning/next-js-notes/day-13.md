---
title: "Day 13 - SEO 優化：用 Metadata API 打造搜尋引擎友善的網頁"
sidebar_label: "Day 13 - SEO 優化"
sidebar_position: 13

description: "Next.js 30 天全端實戰：Day 13 SEO 優化：用 Metadata API 打造搜尋引擎友善的網頁 一、 前言 身為工程師，我們開發出的產品如果搜尋不到，就像是在深海裡開餐廳一樣可惜。傳統 React SPA 最大的痛點就是難以動態更改 資訊，導致 SEO 表現不佳。 Next.js..."
keywords: [Day, SEO, 優化, Metadata, API, 打造搜尋引擎友善的網頁, learning, next-js-notes]
---


# Next.js 30 天全端實戰：Day 13 - SEO 優化：用 Metadata API 打造搜尋引擎友善的網頁

## 一、 前言

身為工程師，我們開發出的產品如果搜尋不到，就像是在深海裡開餐廳一樣可惜。傳統 React (SPA) 最大的痛點就是難以動態更改 `<head>` 資訊，導致 SEO 表現不佳。

Next.js 的 Metadata API 徹底解決了這個問題。它不僅支援靜態設定，還能根據資料庫內容動態生成標題與描述。今天我們就來學習如何有系統地管理網頁的「數位名片」。

---

## 二、 本文：Metadata 的實戰應用

### 1. 靜態 Metadata (Static Metadata)

最簡單的方式是在 `layout.tsx` 或 `page.tsx` 中匯出一個 `metadata` 物件。

```javascript
// src/app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的技術部落格',
  description: '分享 Next.js 與現代化全端開發的點點滴滴',
};
```
### 2. 動態 Metadata (Dynamic Metadata)

對於文章頁面，標題應該是「文章標題 - 部落格名稱」。這時我們可以使用 `generateMetadata` 函式。它支援非同步操作，你可以先抓取資料，再決定 Meta 標籤的內容。

```javascript
// src/app/posts/[id]/page.tsx
export async function generateMetadata({ params }) {
  const post = await fetchPost(params.id);

  return {
    title: `${post.title} | Liwen.dev`,
    description: post.summary,
    openGraph: {
      images: [post.coverImage], // 社群分享預覽圖 (OG Image)
    },
  };
}
```
### 3. 使用 Title Template (標題模板)

在 `layout.tsx` 設定標題模板，可以讓你省去在每個子頁面重複輸入網站名稱的麻煩。

```javascript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | Liwen.dev', // %s 會被子頁面的標題替換
    default: 'Liwen.dev - 數位建築師', // 若子頁面沒設定標題，則顯示此預設值
  },
};
```
### 4. Open Graph 與 Twitter 卡片

為了讓網頁在 Line、Facebook 或 Twitter 分享時看起來更專業，我們必須設定 Open Graph 協定。



Next.js 甚至支援「自動生成」OG 圖片。只要在資料夾內建立 `opengraph-image.tsx`，你就能用 React 組件直接畫出一張漂亮的預覽圖。

---

## 三、 結論：SEO 是一項工程，而非魔法

透過 Metadata API，我們可以確保網站的資訊結構在搜尋引擎眼中是清晰且專業的。

* 今日小結：
  - 靜態頁面直接 export `metadata`。
  - 動態頁面使用 `generateMetadata` 異步獲取資料後產出標籤。
  - 利用 `title.template` 維持全站標題的一致性。

* 開發者心得：雖然設定 Metadata 稍微繁瑣，但它是最值得投資的環節。建議大家在開發時，隨時使用瀏覽器的「社群分享預覽」擴充功能檢查 OG Image 是否正常。另外，別忘了在 `app/` 目錄下放入 `favicon.ico`、`robots.txt` 與 `sitemap.ts`，這三者是 Next.js 會自動識別並優化的 SEO 基本配置。

---

參考來源：
1. Next.js Documentation - Metadata (https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
2. Next.js - generateMetadata API (https://nextjs.org/docs/app/api-reference/functions/generate-metadata)