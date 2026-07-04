---
id: promise-advanced
title: "Promise.all 與 Fetch API"
sidebar_label: "7-4 Promise.all 與 Fetch API"
sidebar_position: 14

description: "Promise.all 語法教學 Promise.all 接收一個 Promise 陣列作為參數，當陣列中所有的 Promise 都變為 fulfilled（成功）狀態時，它才會回傳一個包含所有結果的陣列。如果其中一個失敗，就會進入 catch。 javascript // 模擬批改分數的非同步函式..."
keywords: [Promise.all, Fetch, API, learning, hexschool, nodejs-course]
---

## Promise.all 語法教學

`Promise.all` 接收一個 Promise 陣列作為參數，當陣列中所有的 Promise 都變為 fulfilled（成功）狀態時，它才會回傳一個包含所有結果的陣列。如果其中一個失敗，就會進入 `catch`。

```javascript
// 模擬批改分數的非同步函式
function correctTest(name) {
  return new Promise((resolve, reject) => {
    console.log(`${name} 的分數批改中...`);

    // 模擬隨機延遲時間 (0 到 10 秒)
    const delay = Math.random() * 10000;

    setTimeout(() => {
      const score = Math.round(Math.random() * 100);
      resolve({ name, score });
    }, delay);
  });
}

// 同時執行多個請求
Promise.all([
  correctTest("小明"),
  correctTest("小花"),
  correctTest("小王")
])
  .then((results) => {
    console.log("所有批改已完成：");
    console.log(results);
  })
  .catch((error) => {
    console.error("發生錯誤：", error);
  });
```

## fetch 與 Promise 的關係

`fetch` 是一個用於發起網路請求的 API，它會回傳一個 Promise 物件。這使得我們可以利用 `.then()` 來處理非同步的請求結果。

```javascript
const url = "https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/frontend_data.json";

fetch(url)
  // 第一步：fetch 回傳的是一個 Response 物件，需使用 .json() 將其轉為 JSON 格式
  .then((response) => {
    return response.json();
  })
  // 第二步：處理轉換後的 JSON 資料
  .then((data) => {
    console.log("資料獲取成功：", data);
  })
  // 錯誤處理：若請求失敗或解析失敗，會進入這裡
  .catch((error) => {
    console.error("請求失敗：", error);
  });
```

## 將 XMLHttpRequest 改寫為 Promise 格式

傳統的 `XMLHttpRequest` 寫法沒有回傳 Promise 物件，所以我們可以使用 `new Promise` 將其封裝。

```javascript
const url = "https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/frontend_data.json";

// 傳統寫法：
// const xhr = new XMLHttpRequest();
// xhr.open("GET", url);
// xhr.onload = () => console.log(xhr.responseText);
// xhr.onerror = () => console.log(xhr.statusText);
// xhr.send();

// 封裝成 Promise 格式：
function getUrl(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

getUrl(url)
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

## 嘗試寫 axios.get 套件功能

我們可以透過上述的技巧，自己模擬一個簡單版本的 `axios.get` 方法：

```javascript
const url = "https://raw.githubusercontent.com/hexschool/2021-ui-frontend-job/master/frontend_data.json";

const axios = {
  get: function(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    });
  }
};

// 使用自製的 axios.get
axios.get(url)
  .then(data => console.log(data))
  .catch(error => console.error(error));
```