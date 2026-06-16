---
sidebar_position: 5
title: ezdcbot (Discord 推播)
---

# `ezdcbot` - 零依賴 Discord 推播套件

## 💡 套件介紹
這是我**親自開發並發布至 npm 生態圈**的開源套件！

為了在 Serverless (無伺服器) 架構中實現極致的輕量化，`ezdcbot` 捨棄了官方 `Discord.js` 龐大的 WebSocket 依賴，改用純原生 `fetch` 實作 REST API 呼叫。它非常適合用在雲端函數 (AWS Lambda, Vercel Edge 等) 中進行簡單的自動化通知推播，完美解決了冷啟動延遲的問題。

## 📦 安裝方式

```bash
npm install ezdcbot
```

## 🚀 基本使用範例

```javascript
const { Ezdcbot } = require('ezdcbot');

// 使用您的 Discord Bot Token 進行初始化
const bot = new Ezdcbot('YOUR_BOT_TOKEN');

// 傳送一般文字訊息到指定頻道
bot.sendMessage('123456789012345678', '這是一則來自 ezdcbot 的推播通知！');
```

## 📖 完整技術文件
因為這是我自己的開源專案，我有為它撰寫了一系列非常完整的底層架構解析與使用教學。

👉 **[點此前往：ezdcbot 完整開發文件與技術筆記](../../03-projects-business/side-projects/ezdcbot/00-intro)**
