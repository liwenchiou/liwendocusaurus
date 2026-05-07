---
title: "Day 05 - 導覽藝術：Link 組件與路由跳轉"
sidebar_label: "Day 05 - 導覽藝術"
sidebar_position: 5
---

# Next.js 30 天全端實戰：Day 05 - 導覽藝術：Link 組件與路由跳轉

## 一、 前言

在傳統 HTML 中，我們使用 `<a>` 標籤來跳轉頁面，但這會導致瀏覽器整頁刷新，遺失所有暫存狀態。在 Next.js 中，導覽不僅要「快」，還要「聰明」。

今天我們將學習 Next.js 提供的導覽工具，並探討它如何在使用者點擊之前，就已經偷偷把下一個頁面的資料準備好了。

---

## 二、 本文：導覽的核心方式

### 1. Link 組件 (首選方式)

Next.js 內建的 `<Link>` 組件是對 `<a>` 標籤的增強版。它支援客戶端導覽，這意味著切換頁面時只會更新變動的部分（如 Day 03 提到的 Layout 持久化）。

* 預取功能 (Prefetching)：當 `<Link>` 出現在使用者的視窗中時，Next.js 會自動在背景下載目標頁面的代碼，讓跳轉瞬間完成。

```javascript=
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav>
      <Link href="/">首頁</Link>
      <Link href="/dashboard" prefetch={false}>
        後台 (關閉預取)
      </Link>
    </nav>
  );
}
```


### 2. useRouter Hook (程式化導覽)

有時候你需要在邏輯執行完（例如表單提交後）才跳轉頁面，這時就要用到 useRouter。

* 注意：useRouter 只能在 Client Component 中使用。

```javascript=
"use client";

import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = async () => {
    // 執行登入邏輯...
    router.push('/dashboard'); // 跳轉至後台
  };

  return <button onClick={handleSubmit}>登入</button>;
}
```


### 3. redirect 函式 (伺服器端導覽)

如果你在 Server Component 中需要判斷權限並導向頁面，請使用 redirect。

```javascript=
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await fetchUser();
  
  if (!user) {
    redirect('/login'); // 直接在伺服器端完成跳轉
  }
  
  return <div>個人資料內容</div>;
}

```

### 4. 實戰案例：麵包屑 (Breadcrumbs) 與 Active Link

在導覽列中，我們通常希望「當前頁面」的連結有不同的樣式。我們可以使用 `usePathname()` 來判斷。

```javascript=
"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav>
      <Link className={pathname === '/' ? 'text-blue-500' : ''} href="/">
        首頁
      </Link>
      <Link className={pathname === '/about' ? 'text-blue-500' : ''} href="/about">
        關於
      </Link>
    </nav>
  );
}
```


---

## 三、 結論：導覽效能的秘密

Next.js 的導覽之所以流暢，是因為它結合了「軟導覽 (Soft Navigation)」與「預取機制」。

* 今日小結：
    - 一般連結用 <Link>，邏輯跳轉用 useRouter，伺服器邏輯用 redirect，判斷路徑用 usePathname。
* 專家筆記：
    - 雖然預取很強大，但如果一個頁面有上百個連結，會造成不必要的網路負擔。
    - 對於非核心路徑，可以適時使用 prefetch={false} 來優化效能。

---

參考來源：
1. Next.js Documentation - Linking and Navigating (https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
2. Next.js API Reference - useRouter (https://nextjs.org/docs/app/api-reference/functions/use-router)