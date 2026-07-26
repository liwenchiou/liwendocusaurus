---
id: ghaction-lis
title: "ghaction-lis"
sidebar_label: "ghaction-lis (Action 監聽)"
sidebar_position: 10
description: "一個輕量級的 Node.js CLI 工具，專為開發者設計，用於在終端機 (Terminal) 中即時監聽 GitHub Actions 的部署狀態。"
keywords: [ghaction, lis, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "ghaction-lis",
        "datePublished": "2026-07-08T13:51:33.511Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "一個輕量級的 Node.js CLI 工具，專為開發者設計，用於在終端機 (Terminal) 中即時監聽 GitHub Actions 的部署狀態。"
      }
    `}
  </script>
</Head>


# ghaction-lis (GitHub Action Listener)

> 💡 **這是我親自開發的開源 CLI 工具！**
> 專門為了解決 `git push` 後需要一直切換到瀏覽器看 GitHub Actions 進度，甚至因為時間差 (Race Condition) 導致腳本抓不到最新狀態的痛點。

## 為什麼需要這個套件？

在自動化部署（如 Docusaurus、Next.js 專案）的工作流中，我們常常會在 `package.json` 裡寫這種類似一條龍的腳本：

```json
"scripts": {
  "deploy": "git push && ghaction-lis"
}
```

但因為 GitHub 伺服器接收到 Push 到建立 Action 任務需要 2~5 秒鐘的時間差，如果自己寫簡單的 `curl` 腳本，非常容易因為打 API 打得太快，而抓到「上一筆已經跑完的舊紀錄」。

`ghaction-lis` 內建了**比對本地 Commit SHA** 的防呆機制與優雅的輪詢 (Adaptive Polling) 邏輯，確保終端機上的 Loading 動畫永遠鎖定最正確的那筆部署任務。

## 核心亮點 (DevEx 提升)

1. **精準鎖定防呆**：自動比對本地端 `git rev-parse HEAD` 的 SHA 與 GitHub 遠端的 `head_sha`，徹底解決時間差抓錯紀錄的問題。
2. **優雅的終端 UI**：內建 `ora` Spinner 與 `chalk` 顏色標記，讓生硬的 Terminal 也有極致的開發體驗 (DevEx)。
3. **智慧除錯**：當 Action 部署失敗時，自動擷取錯誤日誌並高亮印在 Terminal 上，不用再打開瀏覽器去大海撈針。
4. **隨插即用**：零配置自動解析 git remote 資訊，支援讀取 GitHub CLI (`gh`) 權限。

## 安裝與使用方式

我們提供兩種使用方式，可依據開發習慣自由選擇：

### 1. 隨插即用 (推薦)
透過 `npx` 即可在專案中免安裝直接執行，保證零環境污染且隨時保持最新版：

```bash
npx ghaction-lis
```

### 2. 全域安裝
如果您習慣在任何地方都能直接敲打指令，可以透過 npm 全域安裝：

```bash
npm install -g ghaction-lis
```

## 💻 終端機情境範例

透過這個工具，你可以直接在 Terminal 中看到各種部署情境的反饋，以下是幾個常見的實際運行結果：

### 🟢 情境一：執行成功 (Success)
```text
$ git add .
$ git commit -m "chore: 測試一下流程"
$ git push
$ npx ghaction-lis
✔ 成功鎖定專案：liwenchiou/ghaction-lis
✔ 鎖定目標：Run ID #27612172810 (chore: 測試一下流程)
⠋ GitHub Action 執行中 (in_progress)，已耗時 12s...

✔ Action 執行成功！🎉 (總耗時: 21s)
🔗 點擊查看紀錄: https://github.com/liwenchiou/ghaction-lis/actions/runs/27612172810
```

### 🔴 情境二：執行失敗 (Failure)
最核心的除錯功能：出錯時自動印出 Error Log 與對應的 Job 連結，完全不需開啟瀏覽器。
```text
$ git push
$ npx ghaction-lis
✔ 成功鎖定專案：liwenchiou/ghaction-lis
✔ 鎖定目標：Run ID #27612307032 (test: 模擬打包出錯)
⠋ GitHub Action 執行中 (in_progress)，已耗時 18s...

✖ Action 執行失敗！🔥 (結論: failure, 總耗時: 27s)
❌ Job [test-run] 發生錯誤
🔗 點擊查看紀錄: https://github.com/liwenchiou/ghaction-lis/actions/runs/27612307032/job/81639950470
```

### 🟡 情境三：權限阻擋 (Private Repo)
若您是在私人專案且未配置 GitHub Token，系統會給予友善提示，而非直接崩潰：
```text
$ npx ghaction-lis
⚠ 未偵測到 GitHub Token！將以「未登入」身分呼叫 API。
✔ 成功鎖定專案：liwenchiou/my-private-repo
- 正在抓取本地最新 Commit Hash...

✖ 發生未預期的系統錯誤！
👉 提示：GitHub 拒絕了存取 (Not Found)。
這通常是因為這是一個「私有專案 (Private Repo)」，而您目前處於未登入狀態。
請設定環境變數 GITHUB_TOKEN，或執行 `gh auth login` 來取得存取權限！
```

## AI 部署守則標準配備

這套工具現在已經正式成為我這座數位花園的基礎建設，並強制寫入了 [Antigravity Deployment SOP](../ainotes/04-deployment-sop.md) 中。未來 AI 所有的自動化部署與監控回報，都將完全依賴 `ghaction-lis` 來完成！

👉 **[點此前往 GitHub 專案：ghaction-lis](https://github.com/liwenchiou/ghaction-lis)**