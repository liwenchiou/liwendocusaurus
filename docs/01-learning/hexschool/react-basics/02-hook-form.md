---
slug: react-hook-form
title: "React Hook Form：頂尖表單處理實戰"
date: 2026-04-21T06:36:46.38556+00:00
authors: [liwen]
tags: [React]
sidebar_label: "React Hook Form：頂尖表單處理實戰"

description: "為什麼需要 React Hook Form？ 在傳統 React 中處理表單（使用 useState），每當您在輸入框打一個字，整個組件就會重新渲染（Rerender）一次。當表單有 20、30 個欄位時，電腦會開始變慢，程式碼也會變得異常臃腫。 React Hook Form 的核心優勢： 效能頂..."
keywords: [React, Hook, Form, 頂尖表單處理實戰, learning, hexschool, react-basics]
---


## 為什麼需要 React Hook Form？
在傳統 React 中處理表單（使用 `useState`），每當您在輸入框打一個字，整個組件就會重新渲染（Re-render）一次。當表單有 20、30 個欄位時，電腦會開始變慢，程式碼也會變得異常臃腫。

React Hook Form 的核心優勢：
- **效能頂尖**：它採用 Uncontrolled (非受控) 組件的概念（底層主要是 useRef），打字時不會觸發組件重新渲染。
- **程式碼極簡**：大幅減少 useState 與 onChange 的數量。
- **驗證簡單**：內建強大的表單驗證功能，不需要自己寫一堆 if...else。

## 引入 React Hook Form
```bash
//npm 
npm install react-hook-form

//CDN
<script src="https://unpkg.com/react-hook-form@latest/dist/index.umd.js"></script>
```

## 核心語法：`useForm()`
這是該套件最主要的 Hook，執行後會回傳幾個重要的工具：
```javascript
const { register, handleSubmit, formState: { errors } } = useForm();
```
- **register**：這是一個函式，用來「登記」您的輸入框。它會自動幫您處理 name, onChange, onBlur 和 ref。
- **handleSubmit**：用來包裝您的提交函式，它會幫您執行 e.preventDefault() 並在驗證通過後才傳出資料。
- **errors**：存放所有驗證失敗的錯誤訊息。

## 範例：員工資料新增表單
[codepen 範例](https://codepen.io/liwenchiou/pen/vEKQzbj?editors=0011)
```javascript
const { useForm } = ReactHookForm;

function EmployeeForm() {
  // 初始化 RHF
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 成功提交時的邏輯
  const onSubmit = (data) => {
    console.log("送出的員工資料：", data);
    alert("資料驗證通過！請看 Console 輸出結果");
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h2>新增員工資料</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* 1. 姓名欄位：必填 */}
        <div style={{ marginBottom: '15px' }}>
          <label>姓名：</label>
          <input {...register("name", { required: "姓名是必填項" })} />
          {errors.name && <p style={{ color: 'red', fontSize: '12px' }}>{errors.name.message}</p>}
        </div>

        {/* 2. Email 欄位：必填 + 格式驗證 */}
        <div style={{ marginBottom: '15px' }}>
          <label>Email：</label>
          <input {...register("email", { 
            required: "Email 是必填項",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Email 格式不正確"
            }
          })} />
          {errors.email && <p style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</p>}
        </div>

        {/* 3. 職位欄位：下拉選單 */}
        <div style={{ marginBottom: '15px' }}>
          <label>職位：</label>
          <select {...register("position")}>
            <option value="engineer">軟體工程師</option>
            <option value="manager">專案經理</option>
            <option value="hr">人事專員</option>
          </select>
        </div>

        <button type="submit">確認提交</button>
      </form>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<EmployeeForm />);
```

> **為什麼要用 `{`...register`}`？**
> 這是 JavaScript 的「展開運算子」。register 函式執行後會回傳一個物件，裡面包含：`onChange`, `onBlur`, `ref`, `name`。透過 `...` 展開，這四個屬性就會自動塞進您的 `<input />` 標籤裡。這就是為什麼您的程式碼會變得很乾淨的原因！

## 補充說明
`useForm()` 括號裡面可以傳入一個設定物件（Configuration Object）。

1. **defaultValues** (最常用：設定預設值)
在 ERP 中，這常用於「編輯現有資料」。您會先把從資料庫（PHP）抓回來的舊資料填進去。
```javascript
const { register, handleSubmit } = useForm({
  defaultValues: {
    productName: "原本的產品名稱",
    quantity: 10,
    isUrgent: true
  }
});
```

2. **mode** (決定何時檢查錯誤)
預設情況下，RHF 是在「按下送出 (Submit)」時才檢查錯誤。
```javascript
const { register, handleSubmit } = useForm({
  mode: "onBlur" // 當游標離開輸入框時就進行驗證
  // 或者是 "onChange"（每打一個字就檢查）
});
```

3. **resolver** (串接強大的驗證庫)
如果您覺得在 `register` 裡面寫一堆規則太亂，可以使用 `resolver` 來串接像 `Yup` 或 `Zod` 這種專門處理「驗證表單邏輯」的套件。