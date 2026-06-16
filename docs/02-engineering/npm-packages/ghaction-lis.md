---
title: "ghaction-lis"
sidebar_label: "ghaction-lis (Action 監聽)"
description: "一個輕量級的 Node.js CLI 工具，專為開發者設計，用於在終端機 (Terminal) 中即時監聽 GitHub Actions 的部署狀態。"
---

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

## AI 部署守則標準配備

這套工具現在已經正式成為我這座數位花園的基礎建設，並強制寫入了 [Antigravity Deployment SOP](../ainotes/ai-deployment-sop.md) 中。未來 AI 所有的自動化部署與監控回報，都將完全依賴 `ghaction-lis` 來完成！

👉 **[點此前往 GitHub 專案：ghaction-lis](https://github.com/liwenchiou/ghaction-lis)**
