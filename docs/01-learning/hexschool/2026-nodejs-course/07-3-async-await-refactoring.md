---
id: async-await-refactoring
title: "使用 Async/Await 再升級"
sidebar_label: "7-3 使用 Async/Await 再升級"
sidebar_position: 13

description: "為什麼要用 Async/Await？ 雖然 Promise Chain 解決了 Callback Hell 的問題，但當步驟變多時，不斷地使用 .then 仍會讓程式碼看起來像是鏈條一樣冗長。 ES8 引入了 async 和 await，讓我們能以「寫同步程式」的思維與風格，來撰寫「非同步程式」，大..."
keywords: [使用, Async, Await, 再升級, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "使用 Async/Await 再升級",
        "datePublished": "2026-07-08T13:51:33.463Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "為什麼要用 Async/Await？ 雖然 Promise Chain 解決了 Callback Hell 的問題，但當步驟變多時，不斷地使用 .then 仍會讓程式碼看起來像是鏈條一樣冗長。 ES8 引入了 async 和 await，讓我們能以「寫同步程式」的思維與風格，來撰寫「非同步程式」，大..."
      }
    `}
  </script>
</Head>


## 為什麼要用 Async/Await？

雖然 Promise Chain 解決了 Callback Hell 的問題，但當步驟變多時，不斷地使用 `.then()` 仍會讓程式碼看起來像是鏈條一樣冗長。
ES8 引入了 `async` 和 `await`，讓我們能以「寫同步程式」的思維與風格，來撰寫「非同步程式」，大幅提升可讀性。

## 將 Promise 重構為 Async/Await

以之前的批改作業與發放獎品為例，我們可以將 `.then()` 和 `.catch()` 重構為 `async/await` 搭配 `try...catch` 的語法：

```javascript
// 1. 定義 Promise 函式 (與之前相同)
function correctTest(name) {
  return new Promise((resolve, reject) => {
    console.log("分數批改中...");
    setTimeout(() => {
      const score = Math.round(Math.random() * 100);
      if (score >= 20) {
        resolve({ name, score });
      } else {
        reject("已達退學門檻");
      }
    }, 1000);
  });
}

function checkReward(data) {
  return new Promise((resolve, reject) => {
    console.log("檢查獎品中...");
    setTimeout(() => {
      if (data.score >= 90) {
        resolve(`${data.name} 獲得電影票`);
      } else if (data.score >= 60) {
        resolve(`${data.name} 獲得嘉獎`);
      } else {
        reject(`${data.name} 獲得打手心10下`);
      }
    }, 1000);
  });
}

// 2. 宣告 async 函式並使用 await 執行
const init = async function () {
  // 使用 try...catch 捕捉任一階段拋出的 reject
  try {
    // 步驟一：等待批改分數
    const studentA = await correctTest("小明");

    // 步驟二：等待檢查獎品 (需將上一步的結果 studentA 傳入)
    const rewardA = await checkReward(studentA);

    console.log(rewardA);
  } catch (error) {
    // 捕獲任一階段的 reject
    console.log(`錯誤資訊: ${error}`);
  }
};

// 3. 執行函式
init();
```

透過 `async/await`，我們不再需要將邏輯分散在多個回呼函式中，程式碼由上往下直觀地執行，讓維護與閱讀都變得更加輕鬆！