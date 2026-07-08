---
id: api-design
title: "2. API 設計與 Threads 處理"
sidebar_position: 2
sidebar_label: "2. API 設計與 Threads 處理"

description: "我們刻意避免設計出 sendMessage, createThread, sendThreadMessage 這種冗長且繁雜的介面。相反地，我們將所有的行為抽象成兩個核心動作：push（推播）與 pull（拉取）。 處理 Discord 討論串的 Aha Moment 在實作討論串 Threads ..."
keywords: [2., API, 設計與, Threads, 處理, projects-business, side-projects, ezdcbot]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "2. API 設計與 Threads 處理",
        "datePublished": "2026-07-08T13:51:33.516Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "我們刻意避免設計出 sendMessage, createThread, sendThreadMessage 這種冗長且繁雜的介面。相反地，我們將所有的行為抽象成兩個核心動作：push（推播）與 pull（拉取）。 處理 Discord 討論串的 Aha Moment 在實作討論串 Threads ..."
      }
    `}
  </script>
</Head>


我們刻意避免設計出 `sendMessage`, `createThread`, `sendThreadMessage` 這種冗長且繁雜的介面。相反地，我們將所有的行為抽象成兩個核心動作：`push`（推播）與 `pull`（拉取）。

## 處理 Discord 討論串的 Aha Moment

在實作討論串 (Threads) 支援時，我們仔細研究了 Discord 官方的 REST API 文件，發現了一個非常優雅的底層設計：**Discord 在底層邏輯上將「討論串」視為一種「特殊的頻道 (Channel)」**。

這意味著：
- **讀寫訊息**：對討論串傳送訊息的 Endpoint (`/channels/{threadId}/messages`) 與一般頻道完全相同。
- **只有「建立」不同**：當我們要無中生有建立一個新討論串時，Endpoint 才會變成 `/channels/{channelId}/threads`。

### 程式碼實作：單一的 `push` 方法

基於這個發現，我們不需要為 Thread 寫新的方法，而是透過 `options` 參數在同一個 `push` 方法中進行路由切換。

```javascript title="index.js"
const push = async (targetId, content, options = { type: 'message' }) => {
  // 基本的 token 與必填參數檢查略過...

  let url = `https://discord.com/api/v10/channels/${targetId}/messages`;
  let payload = {};

  if (options.type === 'thread') {
    // 建立新的討論串
    url = `https://discord.com/api/v10/channels/${targetId}/threads`;
    payload = {
      name: typeof content === 'string' ? content : 'New Thread',
      type: 11 // 11 代表 GUILD_PUBLIC_THREAD
    };
  } else {
    // 在一般頻道或已存在的討論串中發送訊息
    payload = typeof content === 'string' ? { content } : { embeds: [content] };
  }

  // 執行 fetch
  const response = await fetch(url, { /* ... */ });
  // ...
};
```

這個設計帶來了極佳的開發者體驗 (DX)：
使用者只要把 Thread ID 傳給原有的 `push` 即可發言；想建立 Thread 時加上 `{ type: 'thread' }`，API 介面保持了驚人的簡潔度，完全不需要學習新的操作邏輯。