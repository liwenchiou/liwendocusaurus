---
title: "專案簡介與開發動機"
sidebar_position: 1
sidebar_label: "專案簡介與開發動機"

description: "ghactionlis GitHub Action Listener 一個專為提升開發體驗 DevEx 而生的輕量級 Node.js CLI 工具。 開發動機 Motivation 在前端開發或是任何依賴 CI/CD 的專案中（例如 Docusaurus 靜態網站、Next.js 專案部署），我們通..."
keywords: [專案簡介與開發動機, projects-business, side-projects, ghaction-lis]
---

# ghaction-lis (GitHub Action Listener)

**一個專為提升開發體驗 (DevEx) 而生的輕量級 Node.js CLI 工具。**

## 開發動機 (Motivation)

在前端開發或是任何依賴 CI/CD 的專案中（例如 Docusaurus 靜態網站、Next.js 專案部署），我們通常會把 `git push` 和自動化部署綁在一起。
然而，這衍生出一個常見的開發痛點：

> 每次下完 `git push`，工程師總是被迫要：
> 1. 打開瀏覽器
> 2. 登入 GitHub
> 3. 點擊 Actions 標籤頁
> 4. 手動按 F5 重新整理，死死盯著進度條看有沒有失敗。

這個過程不僅繁瑣，且嚴重中斷開發心流。如果我們嘗試自己寫簡單的 `curl` 腳本來輪詢，又非常容易遇到 **「時間差 (Race Condition)」** 陷阱：GitHub 伺服器還沒來得及產生最新的 Action 任務，我們的腳本就急著打 API，結果抓到了上一次成功的舊紀錄，直接回報「部署成功」，導致嚴重的誤判。

為了徹底解決這個問題，我開發了 `ghaction-lis`。

## 解決方案 (The Solution)

`ghaction-lis` 是一個零配置的 CLI 工具，主打以下核心能力：

1. **精準鎖定 (SHA Matching)**：程式會先在本地端執行 `git rev-parse HEAD` 取得最新 Commit Hash，並以此跟 GitHub API 回傳的 `head_sha` 做嚴格比對，確保絕對不會抓到上一筆的「幽靈紀錄」。
2. **優雅等待 (Adaptive Polling)**：如果遇到 GitHub 尚未建立新任務的空窗期，它懂得自動等待並重試，直到真正的任務進入 `queued` 或 `in_progress` 狀態。
3. **極致的開發體驗 (DevEx)**：在終端機內建動態 Loading 動畫 (`ora`) 與顏色高亮 (`chalk`)。若部署不幸失敗，它甚至會主動把 GitHub 上的 Error Log 抓下來印在終端機上，連瀏覽器都不用開！
4. **兩階段接力部署監聽 (Chained Workflow)**：針對像 GitHub Pages 這種「編譯成功後才觸發發佈」的兩階段情境，內建 `--pages` 或 `--chain` 參數，能無縫自動接力等待下游任務完成，徹底解決「第一階段顯示成功，但網站卻還沒更新」的等待焦慮。

## 工具定位與架構

這個專案雖然小巧，但它已經成為我個人自動化工作流的基石，更是我的 AI 助手在 [AI 部署守則](../../../02-engineering/ainotes/04-deployment-sop.md) 中強制規定的基礎建設工具。

接下來的系列文章，我將詳細拆解這套工具的架構設計、API 互動邏輯以及防呆機制的實作細節。