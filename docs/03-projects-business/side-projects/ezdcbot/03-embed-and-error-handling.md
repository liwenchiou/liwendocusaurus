---
id: embed-and-error-handling
title: "3. Embed 解析與錯誤攔截"
sidebar_position: 3
sidebar_label: "3. Embed 解析與錯誤攔截"
---

在完成核心的 `push` 與 `pull` 架構後，我們還需要處理一些能大幅提升開發體驗 (DX) 的細節，例如：如何優雅地傳送 Rich Embed，以及當發生錯誤時該如何給予清晰的反饋。

## 自動 Embed 解析

Discord 的 Embed 訊息有特定的 JSON 結構（必須放在 `embeds` 陣列中）。為了讓使用者不需要去死記這個結構，我們在 `push` 方法中實作了簡單的型別判斷：

```javascript title="index.js"
// 若為字串則包裝為純文字，若為物件則假設為 Embed
payload = typeof content === 'string' ? { content } : { embeds: [content] };
```

這樣一來，開發者只要傳入一個包含 `title`, `description`, `color` 等屬性的一般 JavaScript 物件，套件底層就會自動將其包裝成合法的 Embed 格式送出。

## 清晰的錯誤攔截機制

在呼叫外部 API 時，最怕遇到「無聲失敗 (Silent Failure)」。因此，我們對 `fetch` 的 Response 進行了完整的 HTTP 狀態碼檢查：

```javascript title="index.js"
const response = await fetch(url, { /* ... */ });

if (!response.ok) {
  // 如果 Discord 回傳 4xx 或 5xx 錯誤，我們將其攔截並拋出
  const errorData = await response.text();
  throw new Error(`ezdcbot: API Error ${response.status} - ${errorData}`);
}

return response.json();
```

當使用者給錯 Token 或填錯 Channel ID 時，套件會直接拋出清晰的 HTTP 狀態碼與 Discord 官方回傳的詳細錯誤訊息，方便第一時間除錯。

## 未來擴展方向 (Phase 2 & 3)

目前 `ezdcbot` 的第一版已經滿足了九成以上的 Serverless 推播需求，未來我們計畫逐步擴展以下功能：

1. **檔案上傳 (Attachments)**：目前尚不支援傳送實體檔案或圖片，未來預計透過 `FormData` 來擴充。
2. **Rate Limit (429 Too Many Requests)**：目前遇到 429 錯誤會直接拋出異常。未來可以透過讀取 Discord 回傳的 Header 來實作 `Retry-After` 自動等待與重試機制。
3. **TypeScript 支援**：提供完整的 `index.d.ts` 定義檔，讓 TS 開發者在 VSCode 中能享受完整的自動補齊體驗。
