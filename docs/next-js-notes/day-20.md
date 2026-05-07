---
title: "Day 20 - 進階身份驗證：自定義 UI 與角色權限管理"
sidebar_label: "Day 20 - 進階身份驗證"
sidebar_position: 20
---

# Next.js 30 天全端實戰：Day 20 - 進階身份驗證：自定義 UI 與角色權限管理

## 一、 前言

昨天的實作讓我們擁有了基本的登入功能，但實務開發中，我們面臨兩個挑戰：
1. **品牌一致性**：預設的登入頁不符合網站設計。
2. **權限差異化**：一般使用者只能看儀表板，而小主管或管理員（Admin）則需要進入設定頁面。

今天我們就來學習如何接管 Auth.js 的 UI，並在 Session 中加入自定義的欄位。

---

## 二、 本文：自定義驗證流程實戰

### 1. 自定義登入頁面 (Custom Login Page)

首先，在 `auth.ts` 設定中告訴 Auth.js：當需要登入時，請導向我們自己寫的路徑。

[檔案：src/auth.ts]
```typescript
export const &#123; handlers, signIn, signOut, auth &#125; = NextAuth(&#123;
  providers: [GitHub, Google],
  pages: &#123;
    signIn: '/login', // 指定自定義的登入頁路徑
  &#125;,
&#125;);
```
接著，你就可以在 `src/app/login/page.tsx` 隨意設計你的 UI，並調用 `signIn` 函式。

```typescript
import &#123; signIn &#125; from "@/auth";

export default function LoginPage() &#123;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">歡迎回來</h1>
      <button 
        onClick=&#123;async () => &#123;
          "use server";
          await signIn("github", &#123; redirectTo: "/dashboard" &#125;);
        &#125;&#125;
        className="mt-4 p-2 bg-black text-white rounded"
      >
        使用 GitHub 登入
      </button>
    </div>
  );
&#125;
```
### 2. 在 Session 中加入角色資訊 (Callbacks)

預設的 Session 只會包含使用者的姓名、Email 與圖片。如果你的資料庫裡有 `role` 欄位（例如：admin, user），你需要透過 `callbacks` 將它傳遞給前端。

[檔案：src/auth.ts]
```typescript
export const &#123; handlers, signIn, signOut, auth &#125; = NextAuth(&#123;
  // ... 其他設定
  callbacks: &#123;
    async session(&#123; session, token &#125;) &#123;
      if (session.user) &#123;
        session.user.role = token.role; // 從 token 轉發到 session
      &#125;
      return session;
    &#125;,
    async jwt(&#123; token, user &#125;) &#123;
      if (user) &#123;
        token.role = user.role; // 初次登入時將資料庫的角色存入 token
      &#125;
      return token;
    &#125;,
  &#125;,
&#125;);
```
### 3. 基於角色的頁面保護 (RBAC)

現在你可以在 Server Component 中輕鬆實現權限判斷：

```typescript
import &#123; auth &#125; from "@/auth";
import &#123; redirect &#125; from "next/navigation";

export default async function AdminPage() &#123;
  const session = await auth();

  // 如果不是管理員，直接踢走
  if (session?.user?.role !== "admin") &#123;
    redirect("/dashboard");
  &#125;

  return <h1>秘密的管理後台</h1>;
&#125;

```

---

## 三、 結論：打造更穩健的會員系統

自定義驗證不僅是為了好看，更是為了讓「身份」成為應用程式邏輯的一部分。

* 今日小結：
  - 使用 `pages` 選項接管預設路由。
  - 透過 `callbacks` (JWT & Session) 來擴充使用者資料。
  - 在頁面層級使用簡單的 `if` 判斷結合 `redirect` 達成權限保護。

* 開發者心得：在處理角色權限時，除了頁面（Page）要擋，別忘了 **Server Actions** 也要擋。因為 Server Action 本質上是一個 API 端點，如果只擋了 UI 而沒在 Action 內部檢查權限，駭客依然可以用指令直接調用你的後端邏輯。

---

參考來源：
1. Auth.js - Customizing the sign-in page (https://authjs.dev/guides/configuring-pages)
2. Auth.js - Role-based access control (https://authjs.dev/guides/role-based-access-control)