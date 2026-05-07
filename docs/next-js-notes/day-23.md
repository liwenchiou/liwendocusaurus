---
title: "Day 23 - 資料更新與快取同步：revalidatePath 與 revalidateTag"
sidebar_label: "Day 23 - 資料更新與快取同步"
sidebar_position: 23
---

# Next.js 30 天全端實戰：Day 23 - 資料更新與快取同步：revalidatePath 與 revalidateTag

## 一、 前言

Next.js 為了極致的效能，預設會對渲染結果進行積極的快取。這是一把雙面刃：一方面網站反應飛快，但另一方面，當你透過 Server Action 刪除了一篇文章，回到列表頁時卻發現那篇文章還在，這對使用者（甚至是工程師）來說都是一種災難。

在 App Router 中，我們不需要手動重新整理頁面，而是透過兩個強大的工具：`revalidatePath` 與 `revalidateTag`，告訴 Next.js：「這部分的資料已經舊了，請你去抓新的」。

---

## 二、 本文：手動清除快取的策略

### 1. 為什麼畫面沒更新？ (Data Cache vs Router Cache)

當你在伺服器端更新資料時，Next.js 的 Router Cache（瀏覽器端快取）可能還留著舊的 HTML 片段。我們必須在 Server Action 完成後主動觸發更新。

### 2. revalidatePath：按路徑更新

這是最簡單直接的方法。如果你在 `/posts` 頁面新增了資料，就告訴 Next.js 重新驗證該路徑。

```typescript=
// src/app/actions.ts
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function deletePost(id: string) {
  await db.post.delete({ where: { id } });

  // 告訴 Next.js：這個路徑下的快取已經過期了，下次訪問時請重新生成
  revalidatePath('/posts');
  // 如果你希望相關的動態路由也一併更新，可以使用：
  // revalidatePath('/posts/[id]', 'page');
}
```
### 3. revalidateTag：精準的標籤更新 (推薦)

當你的資料出現在多個不同的頁面（例如：首頁的「最新文章」與文章列表頁），使用 `revalidatePath` 就顯得力不從心。這時我們應該在抓取資料時打上「標籤 (Tag)」。

```typescript=
1. **抓取資料時設定 Tag：**
   const data = await fetch('...', { next: { tags: ['posts'] } });

2. **更新資料後清除 Tag：**
   // src/app/actions.ts
   import { revalidateTag } from 'next/cache';

   export async function addPost() {
     // ... 寫入資料庫邏輯
     revalidateTag('posts'); // 只要有標註 'posts' 的區塊都會被更新
   }
```


### 4. 重新導向 (Redirect) 的時機

通常在 Server Action 執行成功後，我們會希望跳轉回列表頁。記得 `redirect` 必須寫在 `revalidate` 之後。

```typescript=
import { redirect } from 'next/navigation';

export async function updatePost(formData: FormData) {
  // ... 更新邏輯
  revalidatePath('/posts');
  redirect('/posts'); // 成功後跳轉
}
```
---

## 三、 結論：讓 UI 與資料庫同步呼吸

掌握重新驗證機制，是從「做出會動的網頁」邁向「做出好用的產品」的必經之路。

* 今日小結：
  - `revalidatePath` 適合結構簡單、路徑明確的場景。
  - `revalidateTag` 適合跨頁面的複雜資料同步。
  - 這兩者都只能在 Server 端（Server Actions 或 Route Handlers）調用。

* 開發者心得：實務上我更偏好使用 `revalidateTag`。因為隨著專案變大，你很難記住某一筆資料到底出現在哪些 URL 裡。透過「標籤」來管理資料邏輯，比透過「路徑」管理更符合軟體開發的解耦原則。另外，記得 `redirect` 本質上會丟出一個 Error 來中斷執行，所以請確保它放在函式的最後一行。

---

參考來源：
1. Next.js Documentation - Revalidating Data (https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
2. Next.js - revalidatePath API (https://nextjs.org/docs/app/api-reference/functions/revalidatePath)