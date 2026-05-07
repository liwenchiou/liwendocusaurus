---
title: "Day 14 - 動態路由：打造具備擴充性的 URL 架構"
sidebar_label: "Day 14 - 動態路由"
sidebar_position: 14
---

# Next.js 30 天全端實戰：Day 14 - 動態路由：打造具備擴充性的 URL 架構

## 一、 前言

想像你在開發一個電商網站或部落格，裡面有成千上萬件商品或文章。如果網址路徑是 `/products/1`、`/products/2`... 我們不可能在 `app` 目錄下建立一萬個資料夾。

Next.js 的「動態路由」允許我們使用「中括號 `[]`」來定義變數。這就像是在寫程式時定義函式的參數，讓一個檔案就能處理無數個不同的網址路徑。

---

## 二、 本文：動態路由的實戰配置

### 1. 基礎動態路由 (Slug)

要在路徑中使用變數，只需將資料夾命名為 `[id]` 或 `[slug]`。

```markdown=
src/app/
└── posts/
    └── [id]/
        └── page.tsx
```
```javascript
// src/app/posts/[id]/page.tsx
export default function PostPage(&#123; params &#125;: &#123; params: &#123; id: string &#125; &#125;) &#123;
  // 當網址是 /posts/123 時，params.id 就會是 "123"
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">文章編號：&#123;params.id&#125;</h1>
      &#123;/* 接下來你可以拿這個 ID 去資料庫抓資料 */&#125;
    </div>
  );
&#125;
```
### 2. 全捕捉路由 (Catch-all Segments)

如果你希望一個頁面能處理更深層的路徑，例如 `/docs/javascript/routing/nested`，你可以使用 `[...slug]`（三個點）。

* `[slug]`：匹配 `/posts/abc`。
* `[...slug]`：匹配 `/docs/a`、`/docs/a/b`、`/docs/a/b/c`。

```javascript
export default function DocsPage(&#123; params &#125;: &#123; params: &#123; slug: string[] &#125; &#125;) &#123;
  // 若網址是 /docs/nextjs/routing
  // params.slug 會是一個陣列：['nextjs', 'routing']
  return <div>目前路徑：&#123;params.slug.join(' / ')&#125;</div>;
&#125;
```
### 3. 生成靜態路徑 (generateStaticParams)

這是 Next.js 效能最強大的功能之一。你可以預先告訴 Next.js 哪些 ID 是存在的，它會在「編譯時 (Build Time)」就先幫你把這些網頁通通生好（變成靜態 HTML）。

```javascript
// 告訴 Next.js 提前預載 ID 為 1, 2, 3 的頁面
export async function generateStaticParams() &#123;
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  return posts.map((post) => (&#123;
    id: post.id.toString(),
  &#125;));
&#125;
```
### 4. 處理參數不存在的情況

如果使用者輸入了一個資料庫找不到的 ID，我們可以搭配 Day 09 學過的 `notFound()`。

```javascript
import &#123; notFound &#125; from 'next/navigation';

export default async function Page(&#123; params &#125;) &#123;
  const data = await getData(params.id);
  
  if (!data) &#123;
    notFound(); // 導向 404 頁面
  &#125;
  
  return <Content data=&#123;data&#125; />;
&#125;
```
---

## 三、 結論：讓路由為你的資料服務

動態路由讓開發者能從繁瑣的檔案建立中解脫，將重點放在「資料結構」的設計上。

* 今日小結：
  - 使用 `[id]` 定義單一變數。
  - 使用 `[...id]` 處理多層級目錄。
  - 搭配 `generateStaticParams` 可以大幅提升 SEO 與載入速度（將動態頁面靜態化）。

* 開發者心得：在設計動態路由時，建議語意要清晰。例如 `/blog/[id]` 雖然簡單，但 `/blog/[category]/[slug]` 對 SEO 更有幫助。此外，雖然 `generateStaticParams` 很強，但如果你的資料有數萬筆，編譯時間會拉得很長，這時可以考慮只預載熱門的頁面，其他的交由動態渲染處理。

---

參考來源：
1. Next.js Documentation - Dynamic Routes (https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
2. Next.js - generateStaticParams (https://nextjs.org/docs/app/api-reference/functions/generate-static-params)