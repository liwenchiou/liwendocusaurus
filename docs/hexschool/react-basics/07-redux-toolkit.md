---
slug: redux-toolkit
title: "Redux Toolkit (RTK) 狀態管理實戰"
date: 2026-04-21T06:36:46.633577+00:00
authors: [liwen]
tags: [React]
---

## 核心概念
Store：存放所有狀態的地方（大倉庫）。
Slice：將狀態邏輯切片。包含狀態（Initial State）和改變狀態的方法（Reducers）。
Dispatch：發送動作（Action）的指令。
Selector：從倉庫裡挑出你要的那筆資料。

## 範例：ERP 庫存管理
[codepen 範例](https://codepen.io/liwenchiou/pen/GgqwYEL?editors=0011)
```javascript
/**
 * RTK (Redux Toolkit) 詳細拆解筆記
 * 環境建議：CodePen (需載入 React, ReactDOM, Redux Toolkit, React Redux)
 */

// 1. 從全域變數解構工具 (這兩行是為了讓瀏覽器認得 RTK 與 ReactRedux)
const { createSlice, configureStore } = window.RTK || {};
const { Provider, useSelector, useDispatch } = window.ReactRedux || {};

// ---------------------------------------------------
// 2. 建立 Slice (定義資料表與操作方法)
// ---------------------------------------------------
const inventorySlice = createSlice({
  name: 'inventory',      // 模組名稱
  initialState: {         // 初始狀態
    stock: 100 
  },
  reducers: {             
    restock: (state, action) => {
      // 在 RTK 裡可以直接修改 state (Immer.js 處理)
      state.stock += action.payload; 
    },
    sell: (state) => {
      if (state.stock > 0) state.stock -= 1;
    }
  }
});

const { restock, sell } = inventorySlice.actions;

// ---------------------------------------------------
// 3. 建立 Store (建立大倉庫)
// ---------------------------------------------------
const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer
  }
});

// ---------------------------------------------------
// 4. React 組件 (UI 層)
// ---------------------------------------------------
function InventoryApp() {
  const stock = useSelector((state) => state.inventory.stock);
  const dispatch = useDispatch();

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>ERP 庫存系統 (RTK 版)</h2>
      <p>目前剩餘庫存：<strong>{stock}</strong></p>
      
      <button onClick={() => dispatch(sell())}>
        賣出一件 (-1)
      </button>

      <button onClick={() => dispatch(restock(10))} style={{ marginLeft: '10px' }}>
        進貨 (+10)
      </button>
    </div>
  );
}

// ---------------------------------------------------
// 5. 使用 Provider 包裹 App
// ---------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <InventoryApp />
  </Provider>
);
```

## 為什麼要搞這麼複雜？

1. **資料共享 (Shared State)**：
如果您在「訂單頁面」賣出一件商品，庫存減少了。這時切換到「庫存管理頁面」，資料會自動同步，因為它們都讀同一個 Store。
2. **邏輯集中 (Centralized Logic)**：
所有的「加減運算」都寫在 Slice 的 reducers 裡。如果未來「進貨」要加收 5% 稅金，您只需要改一個地方，不用去翻幾十個組件。
3. **單向資料流 (Single Source of Truth)**：
資料只能透過 dispatch(action) 改變。這讓您在除錯（Debug）時非常輕鬆，因為您知道只要資料錯了，一定是 reducer 的問題，而不是某個組件偷偷改了它。
