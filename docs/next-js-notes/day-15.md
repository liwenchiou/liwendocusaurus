---
title: "Day 15 - Middleware：掌握請求的全局控制權"
sidebar_label: "Day 15 - Middleware"
sidebar_position: 15
---

# Next.js 30 天全端實戰：Day 15 - Middleware：掌握請求的全局控制權

## 一、 前言

在過去的開發經驗中，如果我們想保護某些頁面不被未登入的使用者看到，我們可能得在每個 `page.tsx` 裡重複寫權限判斷。這不僅麻煩，還容易漏掉。

`Next.js` 的 `Middleware` 讓我們能在一處統一處理這些「橫切面 (`Cross-cutting`)」的邏輯。它運行在 `Edge Runtime`，這意味著它在地理位置上離使用者最近，反應極快，能在網頁開始渲染前就做出決策。

---

## 二、 本文：Middleware 實戰配置

### 1. 如何開始？

在 `src` 目錄下（與 `app` 同級）建立一個名為 `middleware.ts` 的檔案。Next.js 會自動識別它。

[檔案：src/middleware.ts]
```typescript
import &#123; NextResponse &#125; from 'next/server';
import type &#123; NextRequest &#125; from 'next/server';

export function middleware(request: NextRequest) &#123;
  // 這裡寫你的守門邏輯
  return NextResponse.next();
&#125;
```
### 2. 設定匹配路徑 (Matcher)

你肯定不希望所有的圖片、字體請求都經過 Middleware，這樣會浪費效能。我們可以透過 `config` 來過濾特定的路徑。

```javascript
export const config = &#123;
  // 只針對 /dashboard 以及 /admin 開頭的路徑執行
  matcher: ['/dashboard/:path*', '/admin/:path*'],
&#125;;
```
### 3. 常見應用場景

#### A. 權限檢查 (Authentication)
檢查使用者是否有 Token，若無則強制導回登入頁。
```typescript
export function middleware(request: NextRequest) &#123;
  const token = request.cookies.get('session-token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) &#123;
    return NextResponse.redirect(new URL('/login', request.url));
  &#125;
&#125;