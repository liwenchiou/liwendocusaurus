---
title: "Day 22 - 關聯式資料庫實戰：處理一對多與多對多關係"
sidebar_label: "Day 22 - 關聯式資料庫實戰"
sidebar_position: 22
---

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
model Post &#123;
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  tags      Tag[]    // 一篇文章可以有多個標籤
&#125;

model Tag &#123;
  id    String @id @default(cuid())
  name  String @unique
  posts Post[] // 一個標籤也可以屬於多篇文章
&#125;
```
### 2. 巢狀寫入 (Nested Writes) 的威力

當我們要新增一篇文章並同時「建立新標籤」或「連結既有標籤」時，`connectOrCreate` 語法能大幅簡化程式碼。



[範例程式碼：src/app/actions.ts]
```typescript
import &#123; db &#125; from "@/lib/db";

export async function createPostWithTags(formData: FormData) &#123;
  const title = formData.get("title") as string;
  const tagList = (formData.get("tags") as string).split(","); // 例如 "React,Nextjs"

  await db.post.create(&#123;
    data: &#123;
      title,
      authorId: "user-id-123", // 實際開發中會從 Session 取得
      tags: &#123;
        // 自動判斷：標籤若存在則連結(connect)，不存在則新增(create)
        connectOrCreate: tagList.map(name => (&#123;
          where: &#123; name &#125;,
          create: &#123; name &#125;
        &#125;))
      &#125;
    &#125;
  &#125;);
&#125;
```
### 3. 進階查詢：include 與 select

在抓取資料時，你可以決定要「連帶抓出」哪些關聯資料。

* **include**：抓取主體的所有欄位，並加上關聯資料。
* **select**：精確指定要回傳的欄位（效能最佳化首選）。

```typescript
const posts = await db.post.findMany(&#123;
  where: &#123; published: true &#125;,
  include: &#123;
    author: &#123; select: &#123; name: true &#125; &#125;, // 只抓作者姓名
    tags: true,                         // 抓取所有標籤內容
  &#125;
&#125;);
```
### 4. 事務處理 (Transactions)

當你的操作涉及多個資料表且必須「同生共死」時（例如註冊使用者同時建立預設設定），請使用 `$transaction` 確保資料一致性。

```typescript
const [newUser, defaultSetting] = await db.$transaction(async (tx) => &#123;
  const user = await tx.user.create(&#123; data: &#123; email: 'liwen@example.com' &#125; &#125;);
  const setting = await tx.settings.create(&#123; data: &#123; userId: user.id, theme: 'dark' &#125; &#125;);
  return [user, setting];
&#125;);