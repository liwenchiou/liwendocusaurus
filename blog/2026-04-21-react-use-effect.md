---
slug: react-use-effect
title: "useEffect：與外部世界互動的橋樑"
date: 2026-04-21T06:36:45.872462+00:00
authors: [liwen]
tags: [React, 技術]
---

## 什麼是 useEffect？
當組件「渲染後」需要執行動作（如：抓取資料、訂閱事件、修改 DOM），就要用 `useEffect`。
`useEffect` 讓您在組件「渲染後」執行某些操作。這些操作通常不直接參與畫面繪製，而是與外部世界互動。

核心觀念：
- React 的渲染過程應該是純粹的（輸入什麼資料就畫出什麼畫面）。
- 至於「抓取 API 資料」、「設定計時器」或「手動修改 DOM」，這些會干擾渲染的動作，就必須放在 `useEffect` 裡。

## 語法拆解
```javascript
useEffect(() => &#123;
  // 這裡是要執行的程式碼 (Effect)

  return () => &#123;
    // 這裡是用於「清除」的程式碼 (Cleanup) - 選填
  &#125;;
&#125;, [dependencies]); // 相依陣列 (Dependency Array) - 關鍵！
```
- **第一個參數**：一個函式，定義您要做的動作。
- **第二個參數（相依陣列）**：
    - 不傳（省略）：每次渲染後都會執行。
    - 空陣列 `[]`：只在組件「第一次掛載（Mount）」後執行一次（類似初始化）。
    - 有值的陣列 `[count]`：只有當 `count` 改變時，才會執行。

## 實戰範例：模擬資料抓取
「進入頁面時，自動載入使用者資料」
[codepen 範例](https://codepen.io/liwenchiou/pen/OPXaEoP?editors=1111)

```javascript
const &#123; useState, useEffect &#125; = React;

function UserDashboard() &#123;
  const [data, setData] = useState("載入中...");
  const [count, setCount] = useState(0);

  // 情境一：組件掛載時初始化 (API 模擬)
  useEffect(() => &#123;
    console.log("正在模擬抓取 ERP 資料...");
    
    // 模擬 1 秒後獲取資料
    setTimeout(() => &#123;
      setData("訂單編號：#2026-A101");
    &#125;, 1000);
    
  &#125;, []); // 注意：空陣列代表只跑這一次

  // 情境二：當特定狀態改變時執行
  useEffect(() => &#123;
    if (count > 0) &#123;
     document.getElementById('title').innerHTML = `這是DOM元素...：$&#123;count&#125;`;
    &#125;
  &#125;, [count]); // 只有 count 變了，才會執行

  return (
    <div style=&#123;&#123; padding: '20px' &#125;&#125;>
      <h1>ERP 控制台</h1>
      <p>狀態：&#123;data&#125;</p>
      <hr />
      <p>目前點擊：&#123;count&#125;</p>
      <button onClick=&#123;() => setCount(count + 1)&#125;>點擊加 1</button>
    </div>
  );
&#125;
```

## 常見的使用情境 (Best Practices)
1. **資料獲取 (Data Fetching)**：進入頁面後自動從資料庫抓取資料。
2. **訂閱或事件監聽 (Subscriptions)**：監聽視窗大小調整圖表。
3. **手動修改 DOM**：使用第三方圖表庫（如 Chart.js）。
4. **計時器 (Timers)**：顯示即時更新的時間。

## 必知細節：清除機制 (Cleanup)
如果您在 `useEffect` 裡設定了持續性的動作（如 `setInterval`），當組件被移除（Unmount）時，必須把它清掉，否則會造成記憶體洩漏。
```javascript
useEffect(() => &#123;
  const timer = setInterval(() => &#123;
    console.log("定時回傳使用者在線狀態...");
  &#125;, 5000);

  // 清除函式
  return () => &#123;
    clearInterval(timer);
    console.log("組件卸載，停止計時器");
  &#125;;
&#125;, []);
```

## useEffect 的三種模式
| 模式 | 語法 | 執行時機 |
| :--- | :--- | :--- |
| **每次渲染** | `useEffect(() => &#123;&#125;)` | 初次掛載 + 每次更新 |
| **僅限一次** | `useEffect(() => &#123;&#125;, [])` | 僅初次掛載 (初始化) |
| **條件觸發** | `useEffect(() => &#123;&#125;, [v])` | 初次掛載 + 變數 `v` 改變時 |
