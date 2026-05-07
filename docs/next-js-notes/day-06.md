---
title: "Day 06 - 資料獲取：在 Server 端擁抱 async/await"
sidebar_label: "Day 06 - 資料獲取"
sidebar_position: 6
---

# Next.js 30 天全端實戰：Day 06 - 資料獲取：在 Server 端擁抱 async/await

## 一、 前言

在傳統的 React 開發中，抓取 API 資料通常意味著要處理 `useState`、`useEffect` 以及繁瑣的載入狀態（Loading State）。這種方式不僅程式碼冗長，還會造成客戶端與伺服器之間多次往返（Waterfall）。

Next.js 的 Server Components 徹底改變了這個遊戲規則。今天我們將學習如何像寫後端程式一樣，直接在組件中非同步獲取資料，並探討這種方式如何優化效能。

---

## 二、 本文：Server-side Data Fetching 核心實作

### 1. 為什麼在 Server 端抓資料？

* 直連資料庫：不需要暴露 API 端點，安全性更高。
* 減少客戶端負擔：瀏覽器不需要執行抓取資料的 JS，也不需要處理資料轉換。
* 零網路延遲：伺服器與資料庫通常在同一個資料中心，反應速度極快。

### 2. 基本用法：使用 fetch 與 async/await

在 Next.js 中，你可以直接將組件宣告為 `async`，並在裡面直接 `fetch` 資料。

```javascript=
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


### 3. 請求記憶化 (Request Memoization)

如果你在同一個渲染樹的多個組件中呼叫了同一個 `fetch` 請求，Next.js 會自動「記憶化」它。這意味著即使你呼叫了 5 次，Next.js 也只會向伺服器發送 1 次請求。



### 4. 實戰案例：並行與順序獲取資料

* 順序獲取 (Sequential)：當 A 請求結果是 B 請求的參數時。
* 並行獲取 (Parallel)：當兩個請求互不干擾時，應使用 `Promise.all` 以節省時間。

```javascript=
export default async function ProfilePage({ params }) {
  // 並行啟動兩個請求
  const userData = getUser(params.id);
  const userPosts = getPosts(params.id);

  // 等待兩個請求完成
  const [user, posts] = await Promise.all([userData, userPosts]);

  return (
    <div>
      <h1>{user.name} 的個人檔案</h1>
      <PostList posts={posts} />
    </div>
  );
}
```


---

## 三、 結論：告別 useEffect

使用 Server Components 抓取資料，能讓前端代碼看起來更像後端代碼一樣簡潔、直觀。

* 今日小結：
    - Server Component 支援 `async/await`，`fetch` 預設具備記憶化功能，並行請求是優化效能的良藥。
* 專家筆記：
    - 雖然 `fetch` 很方便，但如果你使用的是資料庫 SDK（如 Prisma 或 Supabase），Next.js 不會自動記憶化這些請求。
    - 這時你需要使用 React 的 `cache` 函式來手動包裝你的資料獲取邏輯。

---

參考來源：
1. Next.js Documentation - Data Fetching (https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating)
2. React Cache Documentation (https://react.dev/reference/react/cache)