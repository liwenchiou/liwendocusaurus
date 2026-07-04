---
title: "Day 07 - 快取與更新：超直覺的貨架管理學"
sidebar_label: "Day 07 - 快取與更新"
sidebar_position: 7
description: "Next.js 30 天學習筆記系列 - 第 07 天：Day 07 - 快取與更新：超直覺的貨架管理學。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 快取與更新, 超直覺的貨架管理學, learning, next-js-notes]
---

# Day 07 - 快取與更新：超直覺的貨架管理學

Next.js 預設會對資料進行極致的快取 (Caching)，這能讓您的網站快如閃電，但有時也會導致「資料不更新」的困擾。

理解快取機制就像管理超級市場的貨架：您需要決定什麼時候上新貨，什麼時候把舊貨撤下來。

---

## 💡 本文：Next.js 快取策略與重新驗證

### 1. 靜態渲染 vs 動態渲染

*   **靜態渲染 (Static)**：在建置時 (Build Time) 抓取資料，適合部落格或說明頁面。
*   **動態渲染 (Dynamic)**：在請求時 (Request Time) 抓取資料，適合個人化頁面（如購物車）。

### 2. 資料重新驗證 (Revalidation)

如果您希望快取資料能定期更新，可以使用以下兩種方式：

#### ⏰ 基於時間的更新 (Time-based)
設定資料在一定時間後自動過期。

```javascript
fetch('https://api.example.com/data', { next: { revalidate: 3600 } });
// 這表示資料每小時會自動重新驗證一次
```

#### ⚡ 隨選更新 (On-demand)
當資料庫變動時，主動通知 Next.js 清除快取。

```javascript
import { revalidatePath, revalidateTag } from 'next/cache';

// 在 Server Action 中使用
export async function updatePost() {
  await db.update();
  revalidatePath('/posts'); // 立即更新 /posts 頁面的所有快取
}
```

### 3. 強制切換為動態渲染

如果您希望某個頁面永遠不要被快取，可以使用以下配置：

```javascript
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // 這裡的資料每次造訪都會重新抓取
}
```


## 🏁 結論

快取是 Next.js 的雙面刃：用得好，效能頂天；用不好，資料失真。

| 更新方式 | 適用場景 | 核心指令 |
| :--- | :--- | :--- |
| **靜態生成** | 不常變動的內容 | 預設行為 |
| **定時更新** | 新聞列表、股市（非秒級） | `revalidate: 60` |
| **手動更新** | 留言板、後台編輯完成後 | `revalidatePath()` |


> **參考來源：**
> 1. [Next.js - Caching Guide](https://nextjs.org/docs/app/building-your-application/caching)
> 2. [Next.js API - revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)