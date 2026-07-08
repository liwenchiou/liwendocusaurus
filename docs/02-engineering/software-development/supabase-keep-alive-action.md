---
id: supabase-keep-alive-action
title: "使用 GitHub Actions 防止 Supabase 免費方案休眠"
sidebar_label: "Supabase 防休眠腳本"

description: "使用 GitHub Actions 防止 Supabase 免費方案休眠 如果你正在使用 Supabase 的免費方案 Free Tier 作為你的 Side Project 資料庫，你一定會遇到這個痛點：只要專案超過 7 天沒有任何活動，Supabase 就會自動將專案暫停 Pause。 要喚醒專..."
keywords: [使用, GitHub, Actions, 防止, Supabase, 免費方案休眠, engineering, software-development]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "使用 GitHub Actions 防止 Supabase 免費方案休眠",
        "datePublished": "2026-07-08T13:51:33.513Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "使用 GitHub Actions 防止 Supabase 免費方案休眠 如果你正在使用 Supabase 的免費方案 Free Tier 作為你的 Side Project 資料庫，你一定會遇到這個痛點：只要專案超過 7 天沒有任何活動，Supabase 就會自動將專案暫停 Pause。 要喚醒專..."
      }
    `}
  </script>
</Head>


# 使用 GitHub Actions 防止 Supabase 免費方案休眠

如果你正在使用 Supabase 的免費方案 (Free Tier) 作為你的 Side Project 資料庫，你一定會遇到這個痛點：**只要專案超過 7 天沒有任何活動，Supabase 就會自動將專案暫停 (Pause)**。

要喚醒專案雖然只要去後台點個按鈕，但每次都要這樣做實在太不符合工程師的作風了！這篇筆記將教你如何利用 **GitHub Actions** 寫一個全自動的 Cron Job 腳本，每三天自動去敲門喚醒你的資料庫。

---

## 🛠️ 實作步驟

### 1. 取得專案的 API 資訊
請先登入 Supabase 後台，進入你的專案 -> `Project Settings` -> `API`，你需要拿到以下兩個資訊：
1. **Project URL** (例如: `https://xxxxxxx.supabase.co`)
2. **Project API Keys (anon / public)**

### 2. 設定 GitHub Secrets
為了安全起見，我們**絕對不要**把 URL 和 API Key 明碼寫在公開的 GitHub Repository 中。請到你要放置腳本的 GitHub 專案中：
進入 `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`，新增兩個變數：
- `SUPABASE_URL_1`：填入你的 Project URL
- `SUPABASE_ANON_KEY_1`：填入你的 anon key

### 3. 建立 GitHub Actions 腳本
在你的專案根目錄下建立這個檔案：`.github/workflows/supabase-keep-alive.yml`，並貼上以下內容：

```yaml
name: Supabase Keep Alive

on:
  schedule:
    - cron: '0 0 */3 * *' # 每 3 天執行一次 (UTC 時間，換算台灣時間為早上 8 點)
  workflow_dispatch: # 允許在 GitHub 頁面手動點擊執行測試

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST API
        run: |
          curl -s -o /dev/null -w "Project 1 Status: %{http_code}\n" -X GET "${{ secrets.SUPABASE_URL_1 }}/rest/v1/" \
          -H "apikey: ${{ secrets.SUPABASE_ANON_KEY_1 }}" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY_1 }}"
```

---

## 💡 為什麼要打 `/rest/v1/` 而不是 `/auth/v1/health`？

最初的想法是打 `/auth/v1/health`（驗證服務 GoTrue 的健康檢查節點）。但後來發現 **Supabase 判定「專案是否活躍」的核心是是否有「資料庫交互活動」（Database Interactions）**。

`/auth/v1/health` 僅能確認 Auth 服務容器是否還在運作，並不會向 PostgreSQL 資料庫發出實際的查詢請求，因此在 Supabase 的遙測（Telemetry）系統中**不會被計為有效資料庫活動**，依然會收到暫停專案的信件。

**最佳解法：打 API 根目錄 `/rest/v1/`**
我們必須打 REST API 根目錄 `/rest/v1/`。當 PostgREST 收到對根目錄的請求時，它必須去資料庫中撈取目前 Role（即 `anon`）所擁有的資料表綱要（OpenAPI Schema），這會觸發真實的資料庫查詢，從而重置休眠計時器。

**避開 "Secret API key required" 錯誤：**
以前直接 curl `/rest/v1/` 會回傳 `{"message":"Secret API key required"}`，這是因為漏傳了 `apikey` Header。只要在 Curl 請求中同時帶上 `apikey` 與 `Authorization` Header（皆填入 `anon key`），便能順利通過網關並取得響應。

為了避免大型的 OpenAPI JSON 內容塞爆 GitHub Action 的 log 畫面，我們加上了 `-s -o /dev/null -w "Status: %{http_code}\n"` 參數，讓它只印出 HTTP 狀態碼，保持 log 畫面乾淨。

> [!NOTE]
> **關於日誌中出現 `401` 或 `406` 狀態碼的說明**
> 
> 在執行此腳本時，您在 GitHub Actions 的日誌中可能會看到 `Status: 401`。
> 
> *   **為什麼會這樣？**：這代表您的 `anon` 角色憑證是正確的，並且已經順利通過了 API 網關 (Kong) 的 JWT 驗證。但由於安全性考量，Supabase 預設不允許 `anon` 角色直接拉取資料庫整體的 OpenAPI 規格定義檔（Schema），因此 PostgREST 在連線資料庫並確認權限後，拒絕了該請求並回傳 401。
> *   **這樣有防休眠效果嗎？**：**有！而且非常成功**。因為 PostgREST「連入資料庫並驗證 `anon` 是否有讀取 Schema 權限」的這個行為本身，**就已經是一次真實的資料庫查詢活動**。這會直接記錄在 Supabase 後台的資料庫日誌中，從而成功重置專案的休眠計時器。
> *   **如何讓它顯示綠色的 `200`？**：如果您希望日誌看起來是乾淨的 `200`，只需將 URL 改成指向您資料庫中**實際存在且允許公開讀取（或已設定 RLS）的資料表名稱**。例如：
>     ```bash
>     /rest/v1/您的資料表名稱?limit=1
>     ```

---

## 👥 如果有多個專案怎麼辦？
如果你手上有兩個以上的 Supabase 專案要一起顧，**完全不需要建立兩個 yaml 檔**。
只要在 GitHub Secrets 建立第二組金鑰 (`SUPABASE_URL_2`, `SUPABASE_ANON_KEY_2`)，然後在同一個 `jobs.ping.steps` 裡面多加一個 step 即可：

```yaml
      # 喚醒第二個專案
      - name: Ping Supabase Project 2
        run: |
          curl -s -o /dev/null -w "Project 2 Status: %{http_code}\n" -X GET "${{ secrets.SUPABASE_URL_2 }}/rest/v1/" \
          -H "apikey: ${{ secrets.SUPABASE_ANON_KEY_2 }}" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY_2 }}"
```
這樣只要一份腳本，就能集中管理並保護你所有的 Side Project 囉！