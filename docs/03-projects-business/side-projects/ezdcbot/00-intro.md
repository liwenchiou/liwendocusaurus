---
id: intro
title: ezdcbot：輕量 Discord 推播套件
sidebar_position: 0
---

# ezdcbot 介紹與開發動機

身為一名後端工程師，我們經常需要實作一些自動化的小工具，例如：
- 接收 Stripe 伺服器傳來的付費 Webhook，並把通知傳到團隊的 Discord 群組。
- 寫一個爬蟲排程，每天早上把最新的天氣預報發到頻道裡。

在過去，大部分人的直覺反應是直接安裝強大的 `discord.js`。然而，為了維持與 Discord 之間的雙向即時通訊，它底層實作了複雜的 WebSocket 連線。如果我們的程式碼只是一支跑完就結束的無伺服器函數 (Serverless Function，例如部署在 Vercel 或 AWS Lambda 上)，每次啟動都要建立連線，無論是在冷啟動 (Cold Start) 還是執行效率上，都顯得過於笨重。

**「殺雞真的需要用牛刀嗎？」**

因此，我決定自己動手，打造一款**極致輕量、零第三方依賴 (Zero Dependency)** 的推播專用套件：**[ezdcbot](https://www.npmjs.com/package/ezdcbot)**。

## 相關開源連結

- 📦 **npm 套件：** `npm install ezdcbot`
- 🔗 **GitHub 原始碼：** [liwenchiou/ezdcbot](https://github.com/liwenchiou/ezdcbot) (歡迎按顆 Star ⭐️ 支持)

## 本系列技術導覽

這個系列記錄了 `ezdcbot` 從無到有開發時的核心架構思維與踩坑紀錄，供未來要開發類似開源套件的開發者參考：

1. **[核心架構與 Zero Dependency](./architecture)**：探討為什麼選擇工廠模式 (Factory Pattern) 以及如何用原生 `fetch` API 取代龐大的第三方依賴。
2. **[API 設計與 Threads 處理](./api-design)**：分享如何用極簡的 `push / pull` 搞定一般的頻道與特殊的「討論串 (Thread)」。
3. **[Embed 解析與錯誤攔截](./embed-and-error-handling)**：分享如何讓套件自動轉譯 Rich Embed 物件，以及提升開發者除錯體驗 (DX) 的實作細節。
