---
title: "Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係"
sidebar_label: "Day 22 - 關聯式資料庫實戰"
sidebar_position: 22
description: "Next.js 30 天學習筆記系列 - 第 22 天：Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 關聯式資料庫實戰, 處理一對多與多對多關係, learning, next-js-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係",
        "datePublished": "2026-07-08T13:51:33.483Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Next.js 30 天學習筆記系列 - 第 22 天：Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係。深入探討 Next.js 開發實戰技巧。"
      }
    `}
  </script>
</Head>


# Next.js 30 天全端實戰：Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係

## 一、 前言

在上一篇中，我們初步接觸了 Prisma 的基本操作。但真實世界的資料庫很少是孤立的。身為開發者，我們每天都在處理「關聯」：一位作者擁有多篇文章（一對多）、一篇文章標註了多個標籤（多對多）。

傳統 SQL 要處理這些關聯需要寫複雜的 JOIN 語句與維護中間表。而 Prisma 的強大之處在於，它能讓你用「操作物件」的思維來處理「關聯資料」。今天我們就來實作部落格系統的核心資料模型。

---

## 二、 本文：Prisma 關聯設計與寫入

### 1. 定義多對多關係 (Many-to-Many)

在 Prisma 中，定義多對多關係（例如文章 Post 與標籤 Tag）非常直觀，你不需要手動建立中間表，Prisma 會自動幫你處理。

[檔案：prisma/schema.prisma]
```bash=
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  tags      Tag[]    // 一篇文章可以有多個標籤
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[] // 一個標籤也可以屬於多篇文章
}
```
### 2. 巢狀寫入 (Nested Writes) 的威力

當我們要新增一篇文章並同時「建立新標籤」或「連結既有標籤」時，`connectOrCreate` 語法能大幅簡化程式碼。



[範例程式碼：src/app/actions.ts]
```typescript
import { db } from "@/lib/db";

export async function createPostWithTags(formData: FormData) {
  const title = formData.get("title") as string;
  const tagList = (formData.get("tags") as string).split(","); // 例如 "React,Nextjs"

  await db.post.create({
    data: {
      title,
      authorId: "user-id-123", // 實際開發中會從 Session 取得
      tags: {
        // 自動判斷：標籤若存在則連結(connect)，不存在則新增(create)
        connectOrCreate: tagList.map(name => ({
          where: { name },
          create: { name }
        }))
      }
    }
  });
}
```
### 3. 進階查詢：include 與 select

在抓取資料時，你可以決定要「連帶抓出」哪些關聯資料。

* **include**：抓取主體的所有欄位，並加上關聯資料。
* **select**：精確指定要回傳的欄位（效能最佳化首選）。

```typescript
const posts = await db.post.findMany({
  where: { published: true },
  include: {
    author: { select: { name: true } }, // 只抓作者姓名
    tags: true,                         // 抓取所有標籤內容
  }
});
```
### 4. 事務處理 (Transactions)

當你的操作涉及多個資料表且必須「同生共死」時（例如註冊使用者同時建立預設設定），請使用 `$transaction` 確保資料一致性。

```typescript
const [newUser, defaultSetting] = await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'liwen@example.com' } });
  const setting = await tx.settings.create({ data: { userId: user.id, theme: 'dark' } });
  return [user, setting];
});