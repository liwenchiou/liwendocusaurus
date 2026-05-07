---
slug: course-notes-js-fundamentals
title: "[課程筆記] 第一堂：重新打造 JavaScript 思維，從拆解認識設計模式"
date: 2026-04-21T06:36:44.733565+00:00
authors: [liwen]
tags: [六角學院, 學習筆記, 技術]
---

# [課程筆記] 第一堂：重新打造 JavaScript 思維，從拆解認識設計模式 

## 1. JS 必備知識

### 解構 :前後對應
```javascript
const colors=['red','green','blue'];
console.log(colors[0]); //red
const red=colors[0];
console.log(red); //red

//陣列解構：有順序性
const [r,g,b]=['red','green','blue'];
console.log(r,g,b); //red,green,blue

//物件解構：對應屬性
const user={
    username:'漂亮阿姨',
    age: 21,
    favorite:'鍋燒意麵'
}
const {username,age,favorite}=user;
console.log(username,age,favorite);
```
---
**React的解構**
```javascript
//陣列解構
function useState(initial){
    let state=initial;
    return [initial,
        (newState)=>{
            state=newState
            return state;
        }
    ];
}

const [count,setCount]=useState(1)


//物件解構
function Card({title,content}){
    return <h1>{title}</h1>;
}
```

### 陣列方法
```javascript
const people=[
  {
    "name": "王小明",
    "like": "炸雞",
    "price": 150
  },
  {
    "name": "李華",
    "like": "牛肉麵",
    "price": 220
  },
  {
    "name": "張曉芬",
    "like": "珍珠奶茶",
    "price": 65
  }
]

//foreach
// people.forEach((person,key,array)=>{
//     // person ：每一筆的物件資料
//     // key： 每一筆的索引
//     // array：原始物件（不常用）
// })

people.forEach((person,key)=>{
    console.log(person,key);
    const templateString=`${person.name} 喜歡吃 ${person.like}`;
    console.log(templateString);
})

//map
const newPeople=people.map((person,key)=>
    `${person.name} 喜歡吃 ${person.like}`
);
console.log(newPeople);

//filter
const filterPeople=people.filter((person)=> person.price===220
)
console.log(filterPeople[0].name); //李華

```
**React的map**
```javascript
function ProductList() {
  const products = [
    { id: 1, name: '鍋燒意麵', price: 95 },
    { id: 2, name: '炒麵', price: 80 },
    { id: 3, name: '黑胡椒燴飯', price: 120 }
  ];

  return (
    <ul>
      {/* 在 JSX 的 {} 裡面，放入 JS 表達式 */}
      {products.map((product) => (
        // 這邊會回傳一個 <li>...</li> 的陣列
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
```
---
## 關注點分離
各司其職 將一個複雜的系統拆分成多個區塊，每個區塊只負責一件特定的事，彼此不互相干擾。

**原始資料 (HTML)**
```html
<table>
  <thead>
    <tr>
      <th width="200">品名</th>
      <th>單價</th>
      <th>數量</th>
      <th width="150">小計</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>綠色馬卡龍</td>
      <td>120</td>
      <td>3</td>
      <td>$ 120</td>
    </tr>
    <!-- ... 省略 ... -->
  </tbody>
</table>
```

關注點分離：
1. **資料層 (Data)**：負責儲存純粹的資訊。內容：`綠色馬卡龍、120、3` 等原始數據。
2. **邏輯層 (Logic)**：負責計算與處理。內容：計算小計與總計。
3. **呈現層 (UI/View)**：負責決定數據如何顯示在螢幕上。

```javascript
// 1. 資料層 (Data): 原始數據
const cartItems = [
  { id: 1, name: '綠色馬卡龍', price: 120, qty: 3 },
  { id: 2, name: '粉係馬卡龍', price: 120, qty: 2 },
  { id: 3, name: '甜蜜左擁右抱', price: 200, qty: 7 },
];

// 2. 邏輯層 (Logic): 負責計算
const calculateSubtotal = (price, qty) => price * qty;
const total = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

// 3. 呈現層 (View): 負責表格 HTML
function ShoppingCart() {
  return (
    <table>
      <thead>
        <tr><th>品名</th><th>單價</th><th>數量</th><th>小計</th></tr>
      </thead>
      <tbody>
        {cartItems.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.price}</td>
            <td>{item.qty}</td>
            <td>$ {calculateSubtotal(item.price, item.qty)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr><td colSpan="3">總計：</td><td>NT$ {total}</td></tr>
      </tfoot>
    </table>
  );
}
```

## React 的建構方式
1. **HTML => CDN 方式**
2. **Vite => 前端常用方式**
3. **Next.js => 前後端整合形式**

### 使用 CDN 方式建立
```html
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<div id="app"></div>

<script type="text/babel">
function App() {
  return (
    <div>React App</div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
</script>
```

> **注意事項：**
> 1. `return` 後面會自動補分號，建議 `return` 加上 `()`。
> 2. HTML 標籤要有結尾，比如 `<img>` 要加上結尾 `<img/>`。
> 3. HTML 屬性用小駝峰形式，比如 `colspan` 要改成 `colSpan`。
> 4. React 的本質是 JS，所以有些屬性要改成另一種寫法，比如 `class` => `className`。

### React (JSX) 標籤屬性對照表

| HTML 屬性 | React (JSX) 屬性 | 說明 |
| :--- | :--- | :--- |
| `class` | **`className`** | 避免與 JavaScript 關鍵字衝突 |
| `for` | **`htmlFor`** | 避免與 JavaScript 關鍵字衝突 |
| `onclick` | **`onClick`** | 採用小駝峰式命名 |
| `style` | **`style={{color: 'red'}}`** | 必須傳入 JavaScript 物件 |
| `colspan` | **`colSpan`** | 屬性名稱改為小駝峰 |

### JavaScript 表達式與陳述式對照表

| 特性 | 表達式 (Expressions) | 陳述式 (Statements) |
| :--- | :--- | :--- |
| **定義** | 產生一個**值**的程式碼片段 | 執行一個**動作**的指令或宣告 |
| **結果** | 會回傳一個結果（值） | 不會回傳值（純粹執行） |
| **React 應用** | 可放在 JSX 的 `{ }` 中渲染 | **不可**直接放在 JSX 的 `{ }` 中 |
