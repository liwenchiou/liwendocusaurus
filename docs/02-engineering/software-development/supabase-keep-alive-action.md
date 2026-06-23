---
id: supabase-keep-alive-action
title: "使用 GitHub Actions 防止 Supabase 免費方案休眠"
sidebar_label: "Supabase 防休眠腳本"
---

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
      - name: Ping Supabase Auth Health API
        run: |
          curl -X GET "${{ secrets.SUPABASE_URL_1 }}/auth/v1/health" \
          -H "apikey: ${{ secrets.SUPABASE_ANON_KEY_1 }}" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY_1 }}"
```

---

## 💡 為什麼要打 `/auth/v1/health`？

最初我在測試時，是嘗試打 API 根目錄 `/rest/v1/`，但卻收到了 `{"message":"Secret API key required"}` 的錯誤訊息。

這是因為 Supabase 為了資安考量，現在如果要透過根目錄取得 OpenAPI 規格（包含所有 Table 的結構），必須使用權限最高的 `Service_Role` (Secret Key)。

**最佳解法：打專屬的 Health Check 節點**
我們把路徑改成 `/auth/v1/health`。這是 Supabase 專門用來檢查驗證服務 (GoTrue) 是否正常的公開節點，使用 anon key 就能呼叫。成功時會獲得乾淨的 HTTP 200 回傳值：
```json
{"version":"v2.190.0","name":"GoTrue","description":"GoTrue is a user registration and authentication API"}
```
這樣不僅成功喚醒了機器重置了 7 天計時器，也不會在 Log 中留下一堆 Error 訊息！

---

## 👥 如果有多個專案怎麼辦？
如果你手上有兩個以上的 Supabase 專案要一起顧，**完全不需要建立兩個 yaml 檔**。
只要在 GitHub Secrets 建立第二組金鑰 (`SUPABASE_URL_2`, `SUPABASE_ANON_KEY_2`)，然後在同一個 `jobs.ping.steps` 裡面多加一個 step 即可：

```yaml
      # 喚醒第二個專案
      - name: Ping Supabase Project 2
        run: |
          curl -X GET "${{ secrets.SUPABASE_URL_2 }}/auth/v1/health" \
          -H "apikey: ${{ secrets.SUPABASE_ANON_KEY_2 }}" \
          -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY_2 }}"
```
這樣只要一份腳本，就能集中管理並保護你所有的 Side Project 囉！
