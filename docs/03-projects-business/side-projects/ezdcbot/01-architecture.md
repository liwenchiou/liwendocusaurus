---
id: architecture
title: "1. 核心架構與 Zero Dependency"
sidebar_position: 1
sidebar_label: "1. 核心架構與 Zero Dependency"

description: "在開發 ezdcbot 時，我們面臨的第一個決策是：要如何設計這個套件的基礎架構？我們希望它輕量、安全，且能適應 Serverless 環境。 Factory Pattern 工廠模式 我們沒有採用常見的單例模式 Singleton 或直接 export 一個物件，而是設計了 createBot 這..."
keywords: [1., 核心架構與, Zero, Dependency, projects-business, side-projects, ezdcbot]
---

在開發 `ezdcbot` 時，我們面臨的第一個決策是：要如何設計這個套件的基礎架構？我們希望它輕量、安全，且能適應 Serverless 環境。

## Factory Pattern (工廠模式)

我們沒有採用常見的單例模式 (Singleton) 或直接 `export` 一個物件，而是設計了 `createBot()` 這樣的工廠函數。

```javascript title="index.js"
/**
 * 建立一個 ezdcbot 實例
 * @returns {object} 包含 setup, push, pull 方法的物件
 */
const createBot = () => {
  let currentToken = null;

  const setup = (token) => {
    if (!token) throw new Error('ezdcbot: Token is required for setup.');
    currentToken = token;
  };

  // ... 略過 push 與 pull 的實作

  return { setup, push, pull };
};

module.exports = createBot;
```

### 為什麼這樣設計？

1. **避免全域狀態污染**：如果使用者需要在同一個 Node.js 應用中操作多個 Discord Bot（例如：一個負責通知、一個負責客服），工廠模式允許他們實例化多個獨立的 `bot` 物件，彼此的 `token` 不會互相干擾。
2. **高封裝性與安全性**：變數 `currentToken` 被封裝在閉包 (Closure) 內部。外部程式碼無法直接讀取或竄改它，只能透過 `setup()` 來寫入，確保了敏感資料的安全。

## 零依賴 (Zero Dependency) 與原生 Fetch

為了讓套件極致輕量，我們堅持不依賴任何外部 npm 套件（例如 `axios` 或是龐大的 `discord.js`）。

```javascript title="index.js"
// 完全依賴 Node.js v18+ 原生的 fetch API 進行請求
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bot ${currentToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});
```

**這樣做的好處是：**
- **體積最小化**：大幅降低了 `node_modules` 的大小。
- **減少資安風險**：沒有第三方相依套件，就不用擔心未來因為依賴鏈導致的漏洞 (Vulnerabilities)。
- **Serverless 友善**：在 Vercel 或 AWS Lambda 這種錙銖必較的無伺服器環境中，載入時間極短，有效減少冷啟動 (Cold Start) 的延遲。