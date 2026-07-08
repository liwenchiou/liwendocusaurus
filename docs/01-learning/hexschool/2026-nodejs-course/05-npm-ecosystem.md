---
title: "NPM 套件管理與生態系"
sidebar_label: "5 NPM 套件管理與生態系"
sidebar_position: 5

description: "NPM 套件管理與生態系 NPM Node Package Manager 是 Node.js 官方預設的套件管理系統，它擁有全球最大的開源生態系，為開發者提供了豐富的第三方函式庫。 NPM init：建立專案配置 package.json 在任何 Node.js 專案開始前，第一步就是建立 pac..."
keywords: [NPM, 套件管理與生態系, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "NPM 套件管理與生態系",
        "datePublished": "2026-07-08T13:51:33.456Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "NPM 套件管理與生態系 NPM Node Package Manager 是 Node.js 官方預設的套件管理系統，它擁有全球最大的開源生態系，為開發者提供了豐富的第三方函式庫。 NPM init：建立專案配置 package.json 在任何 Node.js 專案開始前，第一步就是建立 pac..."
      }
    `}
  </script>
</Head>


# NPM 套件管理與生態系

NPM (Node Package Manager) 是 Node.js 官方預設的套件管理系統，它擁有全球最大的開源生態系，為開發者提供了豐富的第三方函式庫。

## NPM init：建立專案配置 `package.json`

在任何 Node.js 專案開始前，第一步就是建立 `package.json`。這個檔案就像是專案的身分證與設定檔，記錄了專案可用的套件清單。

**建立步驟：**
1. 終端機移動到專案資料夾。
2. 輸入 `npm init` 開始建立。
   - 過程中會詢問：套件名稱 (name)、版本號 (version)、描述 (description)、主要執行的 js 檔 (entry point)、關鍵字 (keywords)、作者 (author) 等。

> **💡 實用技巧：`npm init -y` (或 `--yes`)**
> 這是開發者最常用的指令。它會跳過所有問答，直接使用預設值快速生成一個 `package.json`。建立完後，你再直接打開檔案修改 name 或 scripts 即可，比一個個輸入快得多。

### 為什麼需要 `package.json`？
1. **版本控管 (Reproducibility)**：讓別人在不同電腦上 `npm install` 時，能確保安裝到完全相同版本的套件，避免「我的電腦可以跑，別人的電腦卻壞掉」的災難。
2. **自動化流程**：透過 `scripts` 欄位，可以把開發、測試、部署的複雜指令全部標準化。
3. **生態系溝通**：`name` 和 `version` 讓全世界的開發者能透過 NPM 資料庫識別你的專案。

## 安裝 NPM 套件

### 安裝流程
當你在專案執行 `npm install [模組名稱]`（例如 `npm install express --save`）後，NPM 會做以下事情：
1. 去 NPM Registry 搜尋該套件。
2. 下載並解壓縮至專案下的 `node_modules` 目錄中。
3. 將該套件的名稱與版本號記錄進 `package.json`。

在程式碼中就可以直接載入並使用了：
```javascript
let express = require('express');
```

### `npm install` 的妙用與遞迴依賴
一個專案會使用很多套件，導致 `node_modules` 資料夾非常龐大（通常不會上傳到 Git）。因此我們只需要提交 `package.json`，其他人接手專案時，只要執行不帶名稱的 **`npm install`**，NPM 就會自動讀取列表，並幫你把所有需要的套件載回來。

**遞迴依賴**：套件 A 可能依賴套件 B，套件 B 又依賴套件 C。NPM 會自動處理這類情況，將深層依賴一併安裝。

### 安裝參數的差異 (`--save`, `--save-dev`, `-g`)

1. **`--save` (正式環境需要)**
   - **用途**：正式上線後程式運作必須的套件，例如 Express 框架、資料庫驅動。
   - **標記**：預設會寫入 `dependencies`。（現在的 npm 預設行為就是 `--save`，可省略不寫）。
   - **部署影響**：在正式環境執行 `npm install --production` 時會被安裝。

2. **`--save-dev` 或 `-D` (開發環境專用)**
   - **用途**：僅在開發階段使用的工具，如測試框架 (Jest)、語法檢查 (ESLint)、打包工具 (Webpack)。
   - **標記**：會寫入 `devDependencies`。
   - **部署影響**：伺服器部署加上 `--production` 參數時會被忽略，減少檔案體積並加快速度。

3. **`-g` (全域安裝)**
   - **用途**：安裝能直接在終端機 (CLI) 執行的工具指令，不管哪個專案都能使用。例如 `nodemon`。
   - **注意**：全域套件通常無法透過 `require()` 在程式內載入，且可能會有版本衝突的問題。

## NPM 版本號控制機制

了解版本號 (Semantic Versioning) 能避免更新套件時把專案弄壞。以 `1.12.0` 為例：
- `1`：**主要版本號 (Major)**，通常包含不向下相容的核心修改。
- `12`：**次要版本號 (Minor)**，新增功能，但保持向下相容。
- `0`：**修訂號 (Patch)**，純粹的 bug 修正。

**套件版本符號的意義：**
- **`^` (插入符號，如 `^1.12.0`)**：最常見的預設值。代表鎖定主版本號，允許自動更新次版與修訂號（可升到 `1.13.0`，不會升到 `2.0.0`）。獲得新功能的同時避免大崩潰。
- **`~` (波浪符號，如 `~1.12.0`)**：較保守。只允許更新修訂號（最高升到 `1.12.9`），不允許跨越次版本。
- **無符號 (`1.12.0`)**：強制鎖定死在這個版本，完全不允許自動更新。
- **`latest`**：直接安裝最新發布的版本。

## Nodemon：提升開發效率的輔助工具

在預設的 Node.js 環境中，每次修改完程式碼，都必須手動 `Ctrl + C` 關閉程序並重新輸入 `node xx.js` 才能看到更新，非常沒有效率。

**`nodemon`** 是開發階段的神器。它會監聽檔案系統，當偵測到你存檔時，會自動終止並重新啟動 Node.js 程序。

1. **安裝**：因為它是個 CLI 工具，建議全域安裝：`npm i nodemon -g`
2. **使用**：原本使用 `node a.js` 的地方，改為 `nodemon a.js`。
3. **效果**：之後只要編輯並儲存檔案，伺服器就會瞬間自動重啟。

## NPM 常用指令總結與實務技巧

- `npm -v`：觀看當前 NPM 版本。
- `npm init -y`：快速新增 `package.json`。
- `npm install [套件]`：安裝特定套件。
- `npm list`：顯示當前專案安裝了哪些 NPM 模組列表。
- `npm uninstall [套件]`：刪除專案裡的某個 NPM 套件。
- **安全性檢查 `npm audit`**：掃描 `package.json` 檢查是否有已知資安漏洞，可使用 `npm audit fix` 嘗試自動修復。
- **快取清理 `npm cache clean --force`**：若安裝過程卡住、發生異常或版本衝突，可清空快取再重新安裝。