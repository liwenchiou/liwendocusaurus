---
title: "Day 07 - 快取與更新：超直覺的貨架管理學"
sidebar_label: "Day 07 - 快取與更新"
sidebar_position: 7
---

# Next.js 30 天全端實戰：Day 07 - 快取與更新：超直覺的貨架管理學

## 一、 前言

在 Next.js 中，「快取 (Caching)」就是你的貨架。
我們的目標是：讓客人拿貨最快（效能高），且確保貨架上的牛奶沒有過期（資料更新）。
今天我們就用「連鎖超商」的邏輯來拆解 Next.js 的快取策略。

---

## 二、 本文：三種白話貨架管理法

### 1. 靜態渲染 (Static Rendering) ——「預製便當」
這是 Next.js 的預設行為，也是最快的模式。

* 概念：你在總部（建置專案時）就把便當做好了，送到全台門市。
* 狀況：除非你重新部署專案（總部改版），否則客人永遠拿到同樣的便當。
* 適用：關於我們、公司介紹、歷史文章。

### 2. 定時重新驗證 (Time-based Revalidation) ——「自動補貨」
如果你希望資料每隔一段時間自動更新，不需要手動干預。

* 概念：你規定貨架每 60 分鐘要檢查一次。
* 運作：
  1. 前 60 分鐘，客人都拿舊貨（極速）。
  2. 60 分鐘後的「第一個」客人進來，雖然他還是拿到舊貨，但他會「觸發」後台趕快去做新便當。
  3. 下一個客人進來，就有新鮮便當可以吃了。



```javascript=
// 每 3600 秒 (1小時) 自動更新一次資料
const res = await fetch('https://api.example.com/price', &#123; 
  next: &#123; revalidate: 3600 &#125; 
&#125;);
```


### 3. 按需重新驗證 (On-demand Revalidation) ——「標籤快遞」
這是最聰明、最省資源的做法，也就是「沒壞就別換，壞了馬上換」。

* 概念：給貨架貼上標籤。只要總部發出「這類產品改版」的通知，門市會立刻丟掉舊貨。
* 適用：電商庫存、個人資料修改、部落格後台存檔。

```javascript=
//1. 抓資料時貼標籤：
const res = await fetch('https://api.example.com/data', &#123; 
  next: &#123; tags: ['my-data-tag'] &#125; 
&#125;);

//2. 資料變動時「撕標籤」（清除快取）：
import &#123; revalidateTag &#125; from 'next/cache';
// 在 Server Action 中呼叫，瞬間讓所有貼有 my-data-tag 的快取失效
revalidateTag('my-data-tag'); 
```
---

## 三、 結論：快取是為了把資源留給對的人

理解了這三種模式，你就能隨心所欲地控制網頁的「新鮮度」。

* 今日小結：
  - 想要最快 -> 用預設快取。
  - 資料會變但不必即時 -> 設定 revalidate 時間。
  - 資料一變網頁就要同步 -> 使用 revalidateTag。

* 專家筆記：
    - 在開發模式 (`npm run dev`) 下，你會發現快取行為有時不如預期，這是正常的。
    - 為了開發方便，Next.js 在開發模式會減少快取干擾。
    - 真正的快取威力要在生產模式 (`npm run build && npm start`) 才能完整體會。

---

參考來源：
1. Next.js Documentation - Caching Overview (https://nextjs.org/docs/app/building-your-application/caching)
2. Next.js Data Fetching - Revalidating (https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#revalidating-data)