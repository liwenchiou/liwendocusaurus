---
id: async-promise-basics
title: "非同步與 Promise 基礎"
sidebar_label: "7-1 非同步與 Promise 基礎"
sidebar_position: 11

description: "為什麼要學 Promise、Async、Await？ 在 JavaScript 中處理非同步事件時，如果不妥善管理，很容易會導致程式碼難以維護（例如著名的「回呼地獄 Callback Hell」）。學習這三種語法的目的在於： 1. 提升可讀性：隨著程式越寫越多，良好的非同步寫法能讓程式碼保持簡潔。 ..."
keywords: [非同步與, Promise, 基礎, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "非同步與 Promise 基礎",
        "datePublished": "2026-07-08T13:51:33.461Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "為什麼要學 Promise、Async、Await？ 在 JavaScript 中處理非同步事件時，如果不妥善管理，很容易會導致程式碼難以維護（例如著名的「回呼地獄 Callback Hell」）。學習這三種語法的目的在於： 1. 提升可讀性：隨著程式越寫越多，良好的非同步寫法能讓程式碼保持簡潔。 ..."
      }
    `}
  </script>
</Head>


## 為什麼要學 Promise、Async、Await？

在 JavaScript 中處理非同步事件時，如果不妥善管理，很容易會導致程式碼難以維護（例如著名的「回呼地獄 Callback Hell」）。學習這三種語法的目的在於：
1. **提升可讀性**：隨著程式越寫越多，良好的非同步寫法能讓程式碼保持簡潔。
2. **易於維護**：透過這三種方式調整程式，使得邏輯更加清晰。
3. **架構設計**：合理搭配這些語法，能設計出優良的非同步流程。

## setTimeout 語法介紹

`setTimeout` 是一個用來實作「計時器」的內建函式，它可以設定在「幾秒後執行」某段程式碼。
常見的應用場景包括：自動登出、固定時間後執行特定函式。

```javascript
// 語法：setTimeout(回呼函式, 延遲毫秒數)

// 方法一：直接在參數內定義函式
const timeout1 = setTimeout(function() {
    console.log("觸發");
}, 2000);

// 方法二：傳入預先定義好的函式
const timeout2 = setTimeout(callFun, 3000);
function callFun() {
    console.log("觸發");
}
```

## 建構第一個 Promise

Promise 是一個用來處理非同步操作的物件，它代表了一個即將完成（或失敗）的操作，並可以透過 `resolve` 和 `reject` 來回傳結果。

```javascript
// 檢查分數的 Promise 範例
const checkScore = new Promise((resolve, reject) => {
  console.log("分數批改中...");
  setTimeout(() => {
    const score = Math.round(Math.random() * 100); // 隨機產生 0~100 分數
    if (score >= 60) {
      resolve(score); // 成功時執行 resolve
    } else {
      reject("不及格"); // 失敗時執行 reject
    }
  }, 2000);
});

// 使用 then 與 catch 處理結果
checkScore
  .then((data) => {
    // 資料正確（resolve）時執行
    console.log(`及格了，分數為：${data}`);
  })
  .catch((error) => {
    // 錯誤（reject）時執行
    console.log(`失敗，原因：${error}`);
  });
```

## Promise 帶參數寫法

如果我們希望 Promise 的邏輯可以根據傳入的參數動態改變，可以將 Promise 包裝在一個函式中回傳。

```javascript
// 將 Promise 包裝在函式中，接收 score 參數
const checkScore = (score) => {
  return new Promise((resolve, reject) => {
    console.log("分數批改中...");
    setTimeout(() => {
      if (score >= 60) {
        resolve(score);
      } else {
        reject("不及格");
      }
    }, 2000);
  });
};

// 執行時帶入參數 80
checkScore(80)
  .then((data) => {
    console.log(`及格了，分數為：${data}`);
  })
  .catch((error) => {
    console.log(`失敗，原因：${error}`);
  });
```