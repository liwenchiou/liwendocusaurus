---
title: "Day 27 - 互動極致：使用 useOptimistic 達成零延遲 UI"
sidebar_label: "Day 27 - 互動極致"
sidebar_position: 27
---

# Next.js 30 天全端實戰：Day 27 - 互動極致：使用 useOptimistic 達成零延遲 UI

## 一、 前言

在傳統的 Web 互動中，流程通常是：點擊按鈕 -> 發送請求 -> 等待伺服器回傳 -> 更新畫面。如果網路延遲 1 秒，使用者就會覺得網頁「卡卡的」。

「樂觀更新」是一種 UI 策略：我們先假設伺服器一定會成功，在按下按鈕的瞬間就直接更新畫面。如果最後伺服器真的失敗了，我們再把畫面悄悄「回滾」回來。這能讓應用程式開起來像原生 App 一樣流暢。

---

## 二、 本文：useOptimistic 實戰應用

Next.js 15 (React 19) 引入了官方的 `useOptimistic` Hook，讓這種複雜的邏輯變得非常好寫。

### 1. 核心邏輯拆解

`useOptimistic` 接收兩個參數：
1. **當前的真實狀態**（來自 Server 的資料）。
2. **更新函式**：定義如何根據使用者的操作，「模擬」出新的狀態。



### 2. 實戰範例：即時留言功能

假設我們有一個留言列表，我們希望使用者一按送出，留言就立刻出現在清單底部。

[範例程式碼：Client Component]
```typescript
'use client';

import { useOptimistic } from 'react';
import { createComment } from './actions';

export function CommentList({ initialComments }) {
  // optimisticComments：目前的顯示狀態（可能是模擬的）
  // addOptimisticComment：觸發模擬更新的函式
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    initialComments,
    (state, newCommentText) => [
      ...state,
      { id: Math.random(), text: newCommentText, sending: true } // 標記為傳送中
    ]
  );

  async function handleAction(formData: FormData) {
    const text = formData.get('text') as string;
    
    // 1. 立即更新 UI
    addOptimisticComment(text);
    
    // 2. 真正發送請求到 Server
    await createComment(text);
  }

  return (
    <div>
      {optimisticComments.map((c) => (
        <div key={c.id} className={c.sending ? 'opacity-50' : ''}>
          {c.text} {c.sending && '(傳送中...)'}
        </div>
      ))}
      <form action={handleAction}>
        <input name="text" className="border p-2" />
        <button type="submit">送出</button>
      </form>
    </div>
  );
}
```
### 3. 優勢與注意事項

* **無縫銜接**：當 Server Action 完成後，Next.js 會自動調用 `revalidatePath`，此時 `initialComments` 會更新，`useOptimistic` 會自動發現真實狀態已改變，並捨棄模擬狀態，達成完美同步。
* **失敗處理**：如果 `createComment` 丟出異常，畫面會自動跳回原本的狀態，不會殘留錯誤的資訊。



---

## 三、 結論：把等待感降到最低

樂觀更新是區分「堪用產品」與「優質產品」的分水嶺。

* 今日小結：
  - `useOptimistic` 讓開發者不再需要手動管理臨時狀態。
  - 核心在於：先修改 UI，再執行異步操作。
  - 適用場景：按讚、留言、加入購物車、刪除項目。

* 開發者心得：雖然樂觀更新很爽，但不要用在「極度重要」的資料操作上，例如「銀行轉帳」或「確認訂單」。這些操作如果先顯示成功最後卻失敗，會帶給使用者巨大的負面情緒。對於這類操作，傳統的 Loading 狀態反而更讓人安心。在實作時，我習慣將樂觀更新的項目加上 `opacity-50` 或「處理中」的提示，這在心理學上既給了即時回饋，也保留了「尚未定案」的空間。

---

參考來源：
1. React Reference - useOptimistic (https://react.dev/reference/react/useOptimistic)
2. Next.js - Optimistic Updates (https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#optimistic-updates)