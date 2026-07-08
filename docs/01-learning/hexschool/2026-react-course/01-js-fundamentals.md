---
slug: course-notes-js-fundamentals
title: "[課程筆記] 第一堂：重新打造 JavaScript 思維"
sidebar_label: "JS 核心思維"
date: 2026-04-21T06:36:44.733565+00:00
authors: [liwen]
tags: [六角學院]

description: "課程筆記 第一堂：重新打造 JavaScript 思維 本堂課的核心在於拆解 JavaScript 的基礎語法，並理解這些語法在 React 開發中扮演的關鍵角色。 💡 JS 必備知識：解構與陣列方法 1. 解構賦值 Destructuring 解構能讓我們從陣列或物件中快速提取資訊，這在 Rea..."
keywords: [課程筆記, 第一堂, 重新打造, JavaScript, 思維, 六角學院, learning, hexschool, react-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "[課程筆記] 第一堂：重新打造 JavaScript 思維",
        "datePublished": "2026-04-21T06:36:44.733565+00:00",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "課程筆記 第一堂：重新打造 JavaScript 思維 本堂課的核心在於拆解 JavaScript 的基礎語法，並理解這些語法在 React 開發中扮演的關鍵角色。 💡 JS 必備知識：解構與陣列方法 1. 解構賦值 Destructuring 解構能讓我們從陣列或物件中快速提取資訊，這在 Rea..."
      }
    `}
  </script>
</Head>


# [課程筆記] 第一堂：重新打造 JavaScript 思維

本堂課的核心在於拆解 JavaScript 的基礎語法，並理解這些語法在 React 開發中扮演的關鍵角色。

---

## 💡 JS 必備知識：解構與陣列方法

### 1. 解構賦值 (Destructuring)
解構能讓我們從陣列或物件中快速提取資訊，這在 React 的 `useState` 與 `props` 傳遞中極其常見。

```javascript
// 陣列解構：具有「順序性」
const [r, g, b] = ['red', 'green', 'blue'];
console.log(r); // 'red'

// 物件解構：對應「屬性名稱」
const user = {
    username: '漂亮阿姨',
    age: 21,
    favorite: '鍋燒意麵'
};
const { username, age, favorite } = user;
```

:::info[React 中的實戰應用]
*   **useState**：利用陣列解構取得狀態值與更新函式。
*   **Props**：利用物件解構直接在參數中取得組件屬性。
```javascript
function Card({ title, content }) {
    return <h1>{title}</h1>;
}
```
:::

### 2. 陣列方法：從操作到渲染
在 React 中，我們幾乎不再使用 `for` 迴圈，而是轉向更具表達性的陣列方法。

*   **forEach**：單純執行動作，不回傳值。
*   **map**：**最常用**。將資料轉換為 JSX 元素陣列。
*   **filter**：過濾符合條件的資料。

```javascript
// React 中的渲染範例
function ProductList() {
  const products = [
    { id: 1, name: '鍋燒意麵', price: 95 },
    { id: 2, name: '炒麵', price: 80 }
  ];

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
```

---

## 🏗️ 核心架構：關注點分離 (SOC)

將複雜的系統拆分成多個區塊，每個區塊只負責一件事。在 Next.js / React 開發中，我們通常將程式碼分為三層：

| 層級 | 負責任務 | 內容示例 |
| :--- | :--- | :--- |
| **資料層 (Data)** | 儲存純粹資訊 | 原始數據、API 回傳值 |
| **邏輯層 (Logic)** | 計算與處理 | 計算總計、表單驗證、狀態切換 |
| **呈現層 (View)** | 視覺化輸出 | HTML 結構、JSX 組件 |

---

## ⚛️ React 開發規範與對比

:::warning[注意事項]
在撰寫 JSX 時，務必遵守以下規範：
1.  **標籤閉合**：所有 HTML 標籤都必須有結尾 (如 `<img />`)。
2.  **小駝峰命名**：屬性需採用 camelCase (如 `onClick`, `colSpan`)。
3.  **關鍵字衝突**：`class` 需改為 `className`，`for` 需改為 `htmlFor`。
:::

### React (JSX) 標籤屬性對照表

| HTML 屬性 | React (JSX) 屬性 | 核心原因 |
| :--- | :--- | :--- |
| `class` | **`className`** | 避開 JS 保留字 |
| `for` | **`htmlFor`** | 避開 JS 保留字 |
| `onclick` | **`onClick`** | 小駝峰規範 |
| `style` | **`style={{ color: 'red' }}`** | 需傳入 JS 物件 |

### 表達式與陳述式

| 特性 | 表達式 (Expressions) | 陳述式 (Statements) |
| :--- | :--- | :--- |
| **定義** | 產生一個「值」 | 執行一個「動作」或「宣告」 |
| **結果** | 會回傳結果 | 不會回傳值 |
| **React 應用** | **可** 放在 `{ }` 中渲染 | **不可** 放在 `{ }` 中 |