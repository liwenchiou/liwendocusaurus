---
slug: react-use-state
title: "useState：管理組件的「記憶」"
date: 2026-04-21T06:36:45.587003+00:00
authors: [liwen]
tags: [React, 技術]
---

# useState ：管理組件的「記憶」
## 什麼是 useState？
`useState` 讓組件能記住資訊（如：輸入框文字、API 回傳的資料）。
在 React 中，組件的畫面是由「資料」驅動的。當資料改變時，畫面必須跟著更新。
`useState` 是 React 最基礎的 Hook，它的作用是為函數組件（Functional Component）添加「狀態（State）」。

> **核心觀念：**
> 一般的變數（如 `let x = 1`）改變時，React 並不知道，所以畫面不會動；
> 只有透過 `useState` 定義的變數改變時，React 才會重新渲染（Re-render）畫面。

## 語法拆解
使用時需要先從 React 引入：
```javascript
import { useState } from 'react';
const [state, setState] = useState(initialValue);
```
- **state**：當前狀態的值（唯讀，不能直接修改）。
- **setState**：用來更新狀態的「函式」。呼叫它後，React 會帶著新值重新跑一次組件。
- **initialValue**：狀態的初始值（可以是數字、字串、布林、物件或陣列）。

## 範例：計數器
[codepen 範例](https://codepen.io/liwenchiou/pen/WbxYywb?editors=0010)
```javascript
 const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc" }}>
      <p>目前點擊次數：{count}</p>
      <button onClick={handleClick}>點我加 1</button>
      <button onClick={() => setCount(0)}>重設</button>
    </div>
  );
}
```

## 範例：多個狀態與物件處理
[codepen 範例](https://codepen.io/liwenchiou/pen/qENQKRo?editors=0011)
```javascript
const { useState } = React;

function UserSettings() {
  // 狀態是一個物件
  const [user, setUser] = useState({
    name: "tom",
    role: "工程師",
    isEditor: false
  });

  const toggleEditor = () => {
    // ❗ 關鍵：在 React 中更新物件，必須「解構」舊資料
    setUser({
      ...user,               // 1. 複製舊的所有欄位 (name, role)
      isEditor: !user.isEditor // 2. 覆蓋要修改的欄位
    });
  };
  
  const handleInputChange=(e)=>{
    //先把內容解構出來
    const {name,value}=e.target;
    setUser({
      ...user,               // 1. 複製舊的所有欄位 (name, role)
      [name]:value           // 2. 覆蓋要修改的欄位
    });
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>使用者資料</h2>
      <p>姓名：{user.name}</p>
      <p>職稱：{user.role}</p>
      <p>修改職稱：<input value={user.role} onChange={handleInputChange} name="role"/></p>
      <p>權限：{user.isEditor ? "✅ 管理員" : "❌ 一般用戶"}</p>
      <button onClick={toggleEditor}>
        切換權限
      </button>
    </div>
  );
}
```
