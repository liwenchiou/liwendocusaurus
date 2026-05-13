---
title: "Day 06 - 資料獲取：在 Server 端擁抱 async/await"
sidebar_label: "Day 06 - 資料獲取"
sidebar_position: 6
description: "Next.js 30 天學習筆記系列 - 第 06 天：Day 06 - 資料獲取：在 Server 端擁抱 async/await。深入探討 Next.js 開發實戰技巧。"
---

# Day 06 - 資料獲取：在 Server 端擁抱 async/await

在傳統的 React 開發中，抓取 API 資料通常意味著要處理 `useState`、`useEffect` 以及繁瑣的載入狀態。這種方式不僅程式碼冗長，還會造成客戶端與伺服器之間的多次往返 (Waterfall)。

Next.js 的 Server Components 徹底改變了這個遊戲規則：您可以像寫後端程式一樣，直接在組件中非同步獲取資料。

---

## 💡 本文：Server-side Data Fetching 核心實作

### 1. 為什麼在 Server 端抓資料？

| 優勢 | 說明 |
| :--- | :--- |
| **安全性** | 不需要暴露 API 端點，敏感資訊 (如 API Keys) 留在後端。 |
| **效能** | 減少瀏覽器端的 JS 下載量，減輕設備負擔。 |
| **低延遲** | 伺服器與資料庫通常在同一個資料中心，反應極快。 |

### 2. 基本實作方式

在 Next.js 中，您可以將組件宣告為 `async`，並在內部直接使用 `fetch`。

```javascript
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts');
  
  if (!res.ok) {
    throw new Error('資料獲取失敗');
  }
  
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts(); // 直接在 Server 端獲取資料

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">最新文章</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="mt-2">{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Fetch 的自動記憶化 (Request Memoization)

如果您在同一個渲染樹的多個組件中呼叫了同一個 `fetch` 請求，Next.js 會自動記憶它。即使您呼叫了 10 次，實際上也只會發送一次實體請求。

### 4. 並行與序列請求

*   **序列請求 (Sequential)**：當 A 請求的結果是 B 請求的參數時使用。
*   **並行請求 (Parallel)**：當請求互不干擾時，應使用 `Promise.all` 以極大化速度。

```javascript
export default async function ProfilePage({ params }) {
  // 並行啟動兩個請求
  const userData = getUser(params.id);
  const userPosts = getPosts(params.id);

  // 等待兩個請求同時完成
  const [user, posts] = await Promise.all([userData, userPosts]);

  return (
    <div>
      <h1>{user.name} 的個人檔案</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

description: "Next.js 30 天學習筆記系列 - 第 06 天：Day 06 - 資料獲取：在 Server 端擁抱 async/await。深入探討 Next.js 開發實戰技巧。"
---

## 🏁 結論：告別 useEffect

使用 Server Components 抓取資料，能讓前端代碼看起來更像後端代碼一樣簡潔、直觀。

| 今日總結 | 核心要點 |
| :--- | :--- |
| **今日進度** | 學習 Server-side async/await 資料獲取與並行優化。 |
| **專家筆記** | 雖然 `fetch` 很強大，但使用資料庫 SDK (如 Prisma) 時，需搭配 React 的 `cache` 函式來手動實作記憶化。 |

description: "Next.js 30 天學習筆記系列 - 第 06 天：Day 06 - 資料獲取：在 Server 端擁抱 async/await。深入探討 Next.js 開發實戰技巧。"
---

> **參考來源：**
> 1. [Next.js - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
> 2. [React Reference - cache](https://react.dev/reference/react/cache)