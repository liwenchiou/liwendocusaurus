---
slug: react-use-ref
title: "useRef：掌握 React 的「儲物櫃」與 DOM 操控"
date: 2026-04-21T06:36:46.124197+00:00
authors: [liwen]
tags: [React, 技術]
---

## 什麼是 useRef？
`useRef` 回傳一個帶有 `current` 屬性的物件。它有兩個最主要的用途：

1.  **存取 DOM 元素**：直接抓取網頁上的 HTML 標籤（例如讓輸入框聚焦）。
2.  **儲存「不需要渲染」的資料**：存放在裡面的資料改變時，不會觸發組件重新渲染。

核心觀念：
- 如果您希望改了某個值，畫面要跟著變，請用 `useState`；
- 如果您只是想偷偷記住一個值，或是要直接控制 `HTML` 標籤，請用 `useRef`。

## 語法拆解
```javascript
const myRef = useRef(initialValue);

// 取值或改值
console.log(myRef.current);
myRef.current = "新資料";
```

您可以把 `useRef` 想像成一個**「掛在組件身上的儲物櫃」**。

### 1. 為什麼是 `.current`？
當您執行 `const myRef = useRef(0);` 時，React 實際上是幫您建立了一個像這樣的物件：
```javascript
&#123;
  current: 0  // 這是您傳進去的 initialValue
&#125;
```
為什麼非要包成物件？因為在 JavaScript 中，物件是**傳址（Pass by Reference）**。這能保證 React 在多次重新渲染組件時，手上拿到的始終是同一個「儲物櫃」，所以裡面的 `current` 才能一直保存著。

### 2. 取值與修改
- **取值**：`myRef.current` (單純讀取，不會觸發渲染)
- **改值**：`myRef.current = "新資料"` (靜悄悄地換掉內容，React 不會被驚動)

## 使用 useRef 的常見情境
- 管理焦點、文字選取或媒體播放
- 整合第三方 DOM 函式庫 (如 D3.js 或 jQuery)
- 儲存「前一個狀態」 (Previous State)

## 範例：直接操控 DOM
我們常希望使用者點開頁面時，游標自動停在「訂單編號」輸入框。
[codepen 範例](https://codepen.io/liwenchiou/pen/yyJQxPm?editors=0011)

```javascript
const &#123; useState, useEffect, useRef &#125; = React;

function OrderSystem() &#123;
  const [orderId, setOrderId] = useState("");
  const inputRef = useRef(null);

  useEffect(() => &#123;
    if (inputRef.current) &#123;
      inputRef.current.focus();
    &#125;
  &#125;, []);

  return (
    <div style=&#123;&#123; padding: '20px' &#125;&#125;>
      <h2>ERP 訂單系統</h2>
      <label>訂單編號：</label>
      <input 
        ref=&#123;inputRef&#125;
        type="text" 
        value=&#123;orderId&#125;
        onChange=&#123;(e) => setOrderId(e.target.value)&#125;
        placeholder="例如：2026021001"
      />
      <button onClick=&#123;() => alert(`正處理訂單：$&#123;orderId&#125;`)&#125;>處理訂單</button>
    </div>
  );
&#125;
```

## 範例：儲存不觸發渲染的變數
假設您要記錄使用者「點擊了幾次按鈕」，但不希望每次點擊都重新渲染。
[codepen 範例](https://codepen.io/liwenchiou/pen/WbxYgzm?editors=0011)

```javascript
const &#123; useState, useRef &#125; = React;

function SilentCounter() &#123;
  const countRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);

  const handleClick = () => &#123;
    countRef.current += 1;
    console.log("偷偷記錄點擊次數：", countRef.current);
  &#125;;

  return (
    <div style=&#123;&#123; padding: '20px', border: '1px solid #ccc' &#125;&#125;>
      <h3>useRef：偷偷計數 (看 Console)</h3>
      <button onClick=&#123;handleClick&#125;>點擊 (不更新畫面)</button>
      <button onClick=&#123;() => setRenderCount(renderCount + 1)&#125;>
        更新畫面 (目前渲染第 &#123;renderCount&#125; 次)
      </button>
    </div>
  );
&#125;
```

## useRef vs useState
| 特性 | useState | useRef |
| :--- | :--- | :--- |
| **改變值時觸發渲染** | 會 | 否 |
| **非同步更新** | 是 | 否 (立即生效) |
| **用途** | 驅動畫面的資料 | 存取 DOM 或私有變數 |
