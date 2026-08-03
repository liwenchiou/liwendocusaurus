---
id: npm-publish-oidc
title: "使用 GitHub Actions OIDC 自動發佈 NPM 套件"
sidebar_label: "\u200B使用 OIDC 發佈 NPM 套件"
sidebar_position: 2

description: "使用 GitHub Actions OIDC 自動發佈 NPM 套件 在過去，若想要透過 GitHub Actions 在發佈新版本時自動上傳套件到 NPM Registry，我們必須在 NPM 產生一個長效型的 Access Token，並將其存放在 GitHub 的 Repository Sec..."
keywords: [使用, GitHub, Actions, OIDC, 自動發佈, NPM, 套件, engineering, software-development]
---


# 使用 GitHub Actions OIDC 自動發佈 NPM 套件

在過去，若想要透過 GitHub Actions 在發佈新版本時自動上傳套件到 NPM Registry，我們必須在 NPM 產生一個長效型的 Access Token，並將其存放在 GitHub 的 Repository Secrets 中（例如 `NPM_TOKEN`）。

然而，這種做法有兩個明顯的痛點：
1. **安全風險**：長效金鑰一旦外洩，攻擊者就能無限期地惡意發佈你的套件，直到金鑰被手動撤銷。
2. **金鑰管理成本**：金鑰需要定期更換，且難以細粒度地限制只能由哪一個 GitHub Repo 或哪一個特定的 Workflow 觸發發佈。

NPM 自 2024 年起正式支援了 **Trusted Publisher (OIDC)** 驗證機制。透過這個機制，GitHub Actions 與 NPM 會直接進行聯邦身份認證，GitHub Actions 會向 NPM 索取一個幾分鐘內便會失效的短效 Token 來進行發佈，這意味著我們**完全不需要在 GitHub Secrets 中存放任何 NPM 金鑰**，只要 `git push` 觸發 Workflow，就能安全地完成發佈！

---

## 🛠️ 實作步驟

### 1. 在 NPM 啟用 Trusted Publisher

要讓 NPM 信任你的 GitHub Actions，必須先在 NPM 後台建立信任關係。

> [!IMPORTANT]
> **先決條件：** 
> 該 NPM 套件必須已經存在於 NPM Registry 中（意即你必須已經在本地端進行過至少一次的 `npm publish` 初始發佈）。

1. 登入你的 [npmjs.com](https://www.npmjs.com/) 帳號。
2. 進入你的套件頁面，點擊左側選單的 **Settings**。
3. 找到 **Publishing** 區段，或是尋找 **Trusted Publisher** 的設定區。
4. 點擊 **Add Publisher** 並選擇 **GitHub Actions**。
5. 填寫以下必要欄位：
   * **GitHub Organization/Owner**：你的 GitHub 帳號或組織名稱（例如：`liwenchiou`）。
   * **GitHub Repository**：該套件的 GitHub 專案名稱。
   * **Workflow Filename**：你預計用來執行發佈的 GitHub Workflow 檔名（例如：`publish.yml`）。
   * **Environment (選填)**：若有在 GitHub 設定特定的環境部署限制，可以在此填寫，否則保留空白即可。

---

### 2. 建立 GitHub Actions 發佈腳本

回到你的 GitHub 專案中，在 `.github/workflows/` 底下新增你的 Workflow 檔案（例如 `.github/workflows/publish.yml`），並寫入以下設定：

```yaml
name: Publish Package to NPM

on:
  push:
    tags:
      - 'v*' # 當有符合 v1.0.0 這種 tag 被推送時觸發

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write # 💡 關鍵：必須要有此權限才能使用 OIDC 向 NPM 換取短效 Token
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org' # 設定發佈目標 Registry

      - name: Install dependencies
        run: npm ci

      - name: Run build (Optional)
        run: npm run build --if-present

      - name: Publish to NPM
        run: npm publish --provenance --access public
```

---

## 💡 關鍵點與常見踩坑

### 💡 關鍵 1：真的不需要在環境變數放 `secrets.NPM_TOKEN` 嗎？
對！一旦你設定好 NPM 的 **Trusted Publisher** 並在 Workflow 中聲明了 `permissions.id-token: write`，`setup-node` 步驟與 `npm publish` 指令會自動在背景偵測 GitHub Actions OIDC 環境，並交換短效驗證憑證。
因此，你可以**完全移除** `env.NODE_AUTH_TOKEN` 的宣告，或是直接留空：

```yaml
      - name: Publish to NPM
        # CLI 會自動偵測 OIDC 環境並發佈，無需手動傳入 NODE_AUTH_TOKEN 變數！
        run: npm publish --provenance --access public
```

### 💡 關鍵 2：什麼是 `--provenance` 參數？
在 `npm publish` 後面加上 `--provenance` 參數，是 NPM 官方強烈推薦的安全最佳實踐。這會將發佈過程的「可追溯性證明（Provenance）」上傳。
NPM 會產生一個簽章，向所有人證明「這個版本的套件確實是由這一個 GitHub Actions 跑出來的，而不是任何人從自己本機上私下打包上傳的」。在套件頁面上會顯示一個綠色的 `provenance` 標章，讓下載你套件的開發者更加安心。

### ⚠️ 踩坑預警 1：404 Not Found 或 403 Forbidden 錯誤
如果你在 GitHub Actions 執行到 `npm publish` 時遇到類似 `404 Not Found` 或 `403 Forbidden` 的錯誤，請先檢查以下幾點：
1. **檔名是否對齊**：NPM 後台設定的 `Workflow Filename` 必須與你的 `.yml` 檔名（例如 `publish.yml`）**完全一模一樣**。
2. **Repository 網址對齊**：請檢查你的 `package.json` 中的 `"repository"` 欄位，其 URL 必須與你所填寫的 GitHub 倉庫路徑完全一致。
3. **套件名稱是否衝突**：如果發佈的是 Scoped Package（例如 `@liwen/ezdcbot`），請確保你在 `npm publish` 時有帶上 `--access public` 參數，因為預設私有 Scope 需要付費帳戶，否則會被拒絕。

### ⚠️ 踩坑預警 2：此機制不支援尚未初始發佈的套件
如果你是全新建立一個套件，**無法**直接透過 GitHub Actions OIDC 進行第一次上傳。
你必須在本地端使用 `npm login` 登入，並手動執行一次 `npm publish`。在 NPM Registry 建立該套件後，才能在該套件的 Settings 頁面中看到 **Trusted Publisher** 的設定區塊，並開啟後續的自動化流程。