---
title: "Day 18 - Route Handlers：在 Next.js 中建構 RESTful API"
sidebar_label: "Day 18 - Route Handlers"
sidebar_position: 18
---

# Next.js 30 天全端實戰：Day 18 - Route Handlers：在 Next.js 中建構 RESTful API

## 一、 前言

身為全端工程師，我們不只需要處理網頁畫面，有時也需要提供 API 給行動 App 或第三方服務使用。在以前的 Pages Router 中我們使用 API Routes，而在 App Router 中，則進化成了 Route Handlers。

Route Handlers 讓你可以使用 Web Request 與 Response 標準 API，精確地控制 HTTP 方法（GET, POST, PATCH, DELETE...）。今天我們就來學習如何打造穩健的 API 端點。

---

## 二、 本文：Route Handlers 的實作規範

### 1. 檔案命名與路徑

Route Handlers 必須命名為 `route.ts`。
* 注意：在同一個資料夾內，`route.ts` 不能與 `page.tsx` 同時存在，因為這會導致路徑衝突。

```markdown
src/app/
└── api/
    └── users/
        └── route.ts  <-- 對應路徑 /api/users
```
### 2. 基本用法：處理 GET 與 POST

```typescript
import &#123; NextResponse &#125; from 'next/server';

// 處理 GET 請求：獲取資料
export async function GET() &#123;
  const data = &#123; message: "Hello, Developer!" &#125;;
  return NextResponse.json(data);
&#125;

// 處理 POST 請求：建立資料
export async function POST(request: Request) &#123;
  const body = await request.json();
  
  // 這裡可以寫入資料庫
  console.log('收到資料:', body);

  return NextResponse.json(&#123; status: 'success' &#125;, &#123; status: 201 &#125;);
&#125;
```
### 3. 動態 API 路徑 (Dynamic API Routes)

與 Page 的動態路由一樣，API 也可以接收參數。

```typescript
// src/app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  &#123; params &#125;: &#123; params: &#123; id: string &#125; &#125;
) &#123;
  const id = params.id;
  // 根據 ID 查詢資料...
  return NextResponse.json(&#123; id, title: "測試文章" &#125;);
&#125;
```

### 4. API 的快取行為

這是一個重要的細節：
* **GET 方法**：預設會被快取（Static）。如果你希望它每次都重新執行（例如獲取最新股價），需要使用 `dynamic = 'force-dynamic'` 或使用動態函式（如讀取 Cookies）。
* **其他方法 (POST, DELETE...)**：永遠不會被快取。



---

## 三、 結論：什麼時候該用 Route Handler？

這是一個常見的月經題：**我該用 Server Actions 還是 Route Handlers？**

* **使用 Server Actions 的時機**：
  - 網頁表單提交。
  - 只有你的 Next.js 前端會用到的互動邏輯。
  - 需要與 UI 狀態（如 `useActionState`）緊密整合時。

* **使用 Route Handlers 的時機**：
  - 提供 API 給外部 App 使用。
  - 設定 Webhook（如 Stripe 支付通知、LINE Bot 回傳）。
  - 需要自定義 HTTP Response Header 或回傳非 JSON 資料（如生成的圖片、PDF）。

* 今日小結：
  - `route.ts` 是 API 的唯一路徑檔案名稱。
  - 支援標準的 Web API (Request / Response)。
  - 路由衝突：同一層級 `route.ts` 與 `page.tsx` 只能擇一。

* 開發者心得：寫 API 時，建議搭配 **Zod** 進行輸入驗證，並統一回傳格式。另外，別忘了在 API 裡實作權限檢查，不要因為它是 API 就忘了驗證使用者身份。

---

參考來源：
1. Next.js Documentation - Route Handlers (https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
2. Next.js - API Reference: NextResponse (https://nextjs.org/docs/app/api-reference/functions/next-response)