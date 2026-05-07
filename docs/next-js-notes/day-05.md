---
title: "Day 05 - 導覽藝術：Link 組件與路由跳轉"
sidebar_label: "Day 05 - 導覽藝術"
sidebar_position: 5
---

# Day 05 - 導覽藝術：Link 組件與路由跳轉

在傳統 HTML 中，我們使用 `<a>` 標籤來跳轉頁面，但這會導致瀏覽器整頁刷新，遺失所有暫存狀態。在 Next.js 中，導覽不僅要「快」，還要「聰明」。

---

## 💡 本文：導覽的核心方式

### 1. Link 組件 (首選方式)

Next.js 內建的 `<Link>` 組件是對 `<a>` 標籤的增強版。它支援 **客戶端導覽**，這意味著切換頁面時只會更新變動的部分。

*   **預取功能 (Prefetching)**：當 `<Link>` 出現在使用者的視窗中時，Next.js 會自動在背景下載目標頁面的代碼，讓跳轉瞬間完成。

```javascript
import Link from 'next/link';

export default function Navbar() &#123;
  return (
    <nav>
      <Link href="/">首頁</Link>
      <Link href="/dashboard" prefetch=&#123;false&#125;>
        後台 (關閉預取)
      </Link>
    </nav>
  );
&#125;
```

### 2. useRouter Hook (程式化導覽)

有時候您需要在邏輯執行完（例如表單提交後）才跳轉頁面，這時就要用到 `useRouter`。

:::warning[注意事項]
`useRouter` 只能在 **Client Component** 中使用。
:::

```javascript
"use client";

import &#123; useRouter &#125; from 'next/navigation';

export default function LoginForm() &#123;
  const router = useRouter();

  const handleSubmit = async () => &#123;
    // 執行登入邏輯...
    router.push('/dashboard'); 
  &#125;;

  return <button onClick=&#123;handleSubmit&#125;>登入</button>;
&#125;
```

### 3. redirect 函式 (伺服器端導覽)

如果您在 Server Component 中需要判斷權限並導向頁面，請使用 `redirect`。

```javascript
import &#123; redirect &#125; from 'next/navigation';

export default async function ProfilePage() &#123;
  const user = await fetchUser();
  
  if (!user) &#123;
    redirect('/login'); // 直接在伺服器端完成跳轉
  &#125;
  
  return <div>個人資料內容</div>;
&#125;
```

### 4. 實戰：Active Link 樣式判斷

在導覽列中，我們通常希望「當前頁面」的連結有不同的顏色，可以使用 `usePathname()` 實現。

```javascript
"use client";

import &#123; usePathname &#125; from 'next/navigation';
import Link from 'next/link';

export default function NavLinks() &#123;
  const pathname = usePathname();

  return (
    <nav>
      <Link 
        className=&#123;pathname === '/' ? 'text-blue-500 font-bold' : ''&#125; 
        href="/"
      >
        首頁
      </Link>
      <Link 
        className=&#123;pathname === '/about' ? 'text-blue-500 font-bold' : ''&#125; 
        href="/about"
      >
        關於
      </Link>
    </nav>
  );
&#125;
```

---

## 🏁 結論

Next.js 的導覽之所以流暢，是因為它結合了 **「軟導覽 (Soft Navigation)」** 與 **「預取機制」**。

| 導覽情境 | 推薦工具 |
| :--- | :--- |
| **一般頁面連結** | `<Link>` (預設預取) |
| **按鈕點擊/邏輯跳轉** | `useRouter` (Client Hook) |
| **權限/伺服器判斷** | `redirect` (Server Action) |
| **當前路徑判斷** | `usePathname` |

---

> **參考來源：**
> 1. [Next.js - Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
> 2. [Next.js API - useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router)