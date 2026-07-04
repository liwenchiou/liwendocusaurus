---
id: promise-chaining-and-catch
title: "職責分離與 Promise 鏈式寫法"
sidebar_label: "7-2 職責分離與 Promise 鏈式寫法"
sidebar_position: 12

description: "重構流程與職責分離原則 在撰寫複雜的邏輯時，我們應該遵守職責分離原則。這意味著每個函式或 Promise 應該只負責一件事情，然後透過鏈式寫法（Promise Chain）將多個步驟串接起來。 撰寫批改作業邏輯與 Catch 流程 讓我們先實作一個簡單的批改作業 Promise，並加入 catch ..."
keywords: [職責分離與, Promise, 鏈式寫法, learning, hexschool, nodejs-course]
---

## 重構流程與職責分離原則

在撰寫複雜的邏輯時，我們應該遵守**職責分離原則**。這意味著每個函式或 Promise 應該只負責一件事情，然後透過鏈式寫法（Promise Chain）將多個步驟串接起來。

## 撰寫批改作業邏輯與 Catch 流程

讓我們先實作一個簡單的批改作業 Promise，並加入 `catch` 來處理失敗的狀況。

```javascript
function correctTest(name) {
  return new Promise((resolve, reject) => {
    console.log("分數批改中...");
    setTimeout(() => {
      const score = Math.round(Math.random() * 100);
      if (score >= 60) {
        // 及格
        resolve({
          name,
          score,
        });
      } else {
        // 不及格
        reject("已達退學門檻");
      }
    }, 2000);
  });
}

correctTest("小明")
  .then(data => console.log(data))
  .catch(error => console.log(error));
```

## Promise Chain 寫法

當我們有多個非同步步驟需要依序執行時，可以在 `then` 中回傳另一個 Promise，這就是所謂的 **Promise Chain（鏈式寫法）**。

假設我們在批改分數後，還需要根據分數來決定發送什麼獎品：

```javascript
function correctTest(name) {
  return new Promise((resolve, reject) => {
    console.log("分數批改中...");
    setTimeout(() => {
      const score = Math.round(Math.random() * 100);
      if (score >= 60) {
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
        if(data.score >= 90){
            resolve(`${data.name} 獲得電影票`);
        } else if(data.score >= 60){
            resolve(`${data.name} 獲得嘉獎`);
        }
    }, 1000);
  });
}

// 依序執行：先批改，再檢查獎品
correctTest("小明")
  .then((data) => checkReward(data))
  .then(reward => console.log(reward))
  .catch((error) => console.log(error));
```

## Promise Catch 多條件設計

在實際應用中，錯誤（reject）的條件可能有多種。我們可以在不同階段呼叫 `reject`，而最終都由同一個 `.catch()` 來統一攔截處理。

```javascript
function checkReward(data) {
  return new Promise((resolve, reject) => {
    console.log("檢查獎品中...");
    setTimeout(() => {
      if (data.score >= 90) {
        resolve(`${data.name} 獲得電影票`);
      } else if (data.score >= 60) {
        resolve(`${data.name} 獲得嘉獎`);
      } else {
        // 新增條件：分數不夠則呼叫 reject
        reject(`${data.name} 獲得打手心10下`);
      }
    }, 1000);
  });
}

correctTest("小明")
  .then((data) => checkReward(data))
  .then((reward) => console.log(reward))
  .catch((error) => console.log(`錯誤資訊: ${error}`));
```