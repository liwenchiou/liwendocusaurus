---
title: "Node.js 與 V8 引擎架構解析"
sidebar_label: "2 Node.js 與 V8 引擎架構解析"
sidebar_position: 2

description: "Node.js 與 V8 引擎架構解析 本章節介紹 Node.js 的核心基礎，包含其背後的 V8 引擎原理以及 Node.js 本身的系統架構。 V8 引擎介紹 V8 引擎就像是 Node.js 的「大腦」，沒有 V8 的高效能，就不會有現在的 Node.js。 1. 源自 Google 的強悍技..."
keywords: [Node.js, V8, 引擎架構解析, learning, hexschool, nodejs-course]
---

# Node.js 與 V8 引擎架構解析

本章節介紹 Node.js 的核心基礎，包含其背後的 V8 引擎原理以及 Node.js 本身的系統架構。

## V8 引擎介紹

V8 引擎就像是 Node.js 的「大腦」，沒有 V8 的高效能，就不會有現在的 Node.js。

1. **源自 Google 的強悍技術**
   - Google 最初開發 V8 的目的完全是為了 Google Chrome 瀏覽器。當時網頁應用越來越龐大，Google 需要一個極度強悍的引擎來提升 Chrome 執行 JS 的速度。
   - V8 最厲害的地方在於它引入了**即時編譯（JIT, Just-In-Time Compilation）技術**，能把 JavaScript 直接編譯成電腦 CPU 看得懂的「機器碼」，而不是像傳統那樣一行一行解釋執行，這讓效能有了飛躍性的突破。

2. **賦予 Node.js 執行 JavaScript 的能力**
   - 在 2009 年時，一位名叫 Ryan Dahl 的開發者看到了 V8 引擎的巨大潛力。他心想：「既然 V8 這麼快，為什麼只能把它關在瀏覽器裡？」
   - 於是，他把 V8 引擎從 Chrome 裡「抽」了出來，外層包上了處理非同步、非阻塞 I/O 的 C++ 函式庫（主要是 libuv），這才誕生了我們現在熟悉的 Node.js。
   - 正是因為這層架構，JavaScript 才成功突破了瀏覽器的 DOM 限制，讓你可以用來寫 API 伺服器、操作本機檔案、甚至建構自動化腳本。

## Node.js 架構解析

1. **開源專案與龐大生態系**
   - Node.js 目前是由 OpenJS 基金會維護的龐大開源專案。
   - 因為它的原始碼完全公開在 GitHub 上，全球數以萬計的開發者都能參與貢獻、修復漏洞或開發擴展套件（npm 生態系）。這也是 Node.js 能夠快速迭代、歷久不衰的重要原因。

2. **底層為 C++ 開發 (Node.js Bindings)**
   - JavaScript 本身是一種瀏覽器腳本語言，它天生沒有能力直接去操作電腦底層資源（例如讀取硬碟檔案、開啟網路通訊埠、控制記憶體）。
   - Node.js 巧妙地利用了 **C++** 作為橋樑（Node.js Bindings），把作業系統底層的 API 包裝起來。當你在 JavaScript 呼叫 `fs.readFile` 時，其實底層是 C++ 在幫你跟作業系統溝通。