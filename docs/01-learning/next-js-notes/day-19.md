---
title: "Day 19 - 身份驗證：使用 Auth.js 快速實作登入系統"
sidebar_label: "Day 19 - 身份驗證"
sidebar_position: 19
description: "Next.js 30 天學習筆記系列 - 第 19 天：Day 19 - 身份驗證：使用 Auth.js 快速實作登入系統。深入探討 Next.js 開發實戰技巧。"
---

# Next.js 30 天全端實戰：Day 19 - 身份驗證：使用 Auth.js 快速實作登入系統

## 一、 前言

身為開發者，保護使用者的資料安全是首要任務。但密碼加密、Cookie 安全、Session 管理等細節繁雜，稍有不慎就會產生漏洞。

Auth.js 是專為 Next.js 設計的身份驗證套件。它支持「自定義密碼登入 (Credentials)」與「第三方登入 (OAuth)」，並且能完美整合昨天學到的 Middleware 以及 Server Components。今天我們先來快速搭建一個穩健的登入框架。

---

## 二、 本文：Auth.js 基礎配置實戰

### 1. 安裝與基本設定

首先，在專案中安裝最新版本的 Auth.js。

```bash
npm install next-auth@beta
```
接著，在根目錄建立 `.env.local` 並設定密鑰，這是加密 Session 用的：
```typescript
AUTH_SECRET=你的隨機字串
```
### 2. 定義設定檔 (auth.ts)

我們建議將 Auth 的邏輯獨立出來，方便在 Server 端與 Client 端共用。

[檔案：src/auth.ts]
```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub], // 支援 GitHub 快速登入
});
```

### 3. 設定 API Route Handlers

利用 Day 18 學過的 Route Handlers，我們需要為 Auth 建立一個全捕捉路徑來處理回傳的請求。

[檔案：src/app/api/auth/[...nextauth]/route.ts]
```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 4. 取得使用者資訊 (Session)

在 Server Component 中，獲取當前登入者資訊變得極其簡單。

```typescript
import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) return <div>請先登入</div>;

  return (
    <div>
      <p>歡迎回來，{session.user.name}</p>
      <img src={session.user.image} alt="頭像" />
    </div>
  );
}

```

### 5. 結合 Middleware 進行路由保護

配合 Day 15 的 Middleware，我們可以一行代碼實現「未登入禁止進入管理後台」。

[檔案：src/middleware.ts]
```typescript
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
```

## 三、 結論：把安全性交給專業的來

使用 Auth.js 最大的好處在於，你不需要去煩惱 OAuth 的 Callback 邏輯或 Cookie 的 HttpOnly 設定，它已經幫你處理好了。

* 今日小結：
  - Auth.js 是 Next.js 生態系中最推薦的驗證套件。
  - `auth()` 函式可以在 Server Component 中同步取得登入狀態。
  - 搭配 Middleware 可以輕鬆實作全站或局部路徑保護。

* 開發者心得：雖然 Credentials (帳號密碼) 登入很常見，但為了開發效率與安全性，初期建議優先實作 GitHub 或 Google 等 OAuth 登入。這樣你就不需要自己管理資料庫裡的雜湊密碼，也能提供使用者更流暢的體驗。明天我們將進階討論如何自定義登入頁面。

---

參考來源：
1. Auth.js Documentation (https://authjs.dev/)
2. Next.js - Authentication Patterns (https://nextjs.org/docs/app/building-your-application/authentication)