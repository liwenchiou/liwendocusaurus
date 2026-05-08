---
title: "Day 21 - Prisma：讓資料庫操作像寫 JavaScript 一樣直覺"
sidebar_label: "Day 21 - Prisma"
sidebar_position: 21
description: "Next.js 30 天學習筆記系列 - 第 21 天：Day 21 - Prisma：讓資料庫操作像寫 JavaScript 一樣直覺。深入探討 Next.js 開發實戰技巧。"
---

# Next.js 30 天全端實戰：Day 21 - Prisma：讓資料庫操作像寫 JavaScript 一樣直覺

## 一、 前言

在過去的開發流程中，操作資料庫通常伴隨著兩個痛苦：
1. **SQL 語法出錯**：少一個逗號或打錯字，直到執行時才發現。
2. **型別不一致**：資料庫欄位改了，但你的 TypeScript 定義沒改，導致程式碼到處噴錯。

Prisma 解決了這些問題。它不僅提供強大的型別安全，還具備直觀的語法。今天我們就來學習如何將 Prisma 整合進 Next.js，建立你的第一個 Data Layer。

---

## 二、 本文：Prisma 環境搭建與 Schema 設計

### 1. 初始化 Prisma

首先，在專案中安裝 Prisma 並初始化。

```bash
npm install prisma --save-dev
npx prisma init
```
這會產生一個 `prisma/schema.prisma` 檔案，這就是你定義資料結構（Model）的地方。

### 2. 設計你的資料模型 (Model)

假設我們要為部落格設計一個簡單的「文章」與「作者」關聯。Prisma 的語法非常優雅且易讀。

[檔案：prisma/schema.prisma]
```
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]  // 一個使用者可以擁有多篇文章
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```
### 3. 同步資料庫 (Migration)

定義好 Schema 後，執行以下指令。Prisma 會自動幫你在資料庫（如 PostgreSQL, MySQL 或 SQLite）中建立對應的資料表。

```bash
npx prisma migrate dev --name init
```
### 4. 在 Next.js 中使用 Prisma Client

為了避免在開發環境中因為 Next.js 的 Hot Reload 導致建立過多資料庫連線，我們通常會寫一個單例（Singleton）。

[檔案：src/lib/db.ts]
```typescript
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => new PrismaClient();
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```
### 5. 實戰操作：抓取資料

現在，你可以在 Server Component 裡直接呼叫 `db`，且享有完整的 TypeScript 補全。

```typescript
import { db } from "@/lib/db";

export default async function PostsPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    include: { author: true } // 一併抓取關聯的作者資料
  });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title} - by {post.author.name}</li>
      ))}
    </ul>
  );
}
```
description: "Next.js 30 天學習筆記系列 - 第 21 天：Day 21 - Prisma：讓資料庫操作像寫 JavaScript 一樣直覺。深入探討 Next.js 開發實戰技巧。"
---

## 三、 結論：讓開發重心回到業務邏輯

Prisma 就像是資料庫與你的程式碼之間的翻譯官，讓你在操作複雜資料時，依然能保有寫前端般的流暢感。

* 今日小結：
  - `schema.prisma` 是唯一的真相來源（Source of Truth）。
  - `prisma migrate` 幫你處理繁瑣的 SQL DDL 語句。
  - Prisma Client 提供強大的型別自動補全，減少低級錯誤。

* 開發者心得：如果你正在考慮資料庫選擇，初學者可以從 **SQLite** 或 **PostgreSQL** 開始。SQLite 只需要一個檔案，不需要安裝複雜的伺服器。而當你熟悉 Prisma 後，你會發現無論底層換成什麼資料庫，你的業務邏輯代碼幾乎不需要改動，這就是 ORM 最強大的地方。

---

參考來源：
1. Prisma Documentation - Getting Started (https://www.prisma.io/docs/getting-started)
2. Next.js - Best Practices for Instantiating Prisma Client (https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help)