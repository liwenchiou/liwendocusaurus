---
slug: introducing-ghaction-lis
title: "告別 F5！我開源了專門監聽 GitHub Actions 的 CLI 工具：ghaction-lis"
authors: [liwen]
tags: [Open Source, CLI, GitHub Actions, DevEx, Node.js]
image: https://github.com/liwenchiou/ghaction-lis/raw/main/cover.png
date: 2026-06-16
description: "告別手動重新整理網頁！我開源了 ghaction-lis，一款專門在終端機精準監聽 GitHub Actions 部署狀態的超輕量 CLI 工具。"
keywords: [告別, F5！我開源了專門監聽, GitHub, Actions, CLI, 工具, ghaction, lis, Open Source, GitHub Actions, DevEx, Node.js]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "告別 F5！我開源了專門監聽 GitHub Actions 的 CLI 工具：ghaction-lis",
        "datePublished": "2026-06-16",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "告別手動重新整理網頁！我開源了 ghaction-lis，一款專門在終端機精準監聽 GitHub Actions 部署狀態的超輕量 CLI 工具。"
      }
    `}
  </script>
</Head>


# 告別 F5！我開源了專門監聽 GitHub Actions 的 CLI 工具：ghaction-lis

做前端開發或靜態網站管理（例如這個 Docusaurus 數位花園）時，我們常常會把 `git push` 和自動部署串在一起。但這衍生出一個惱人的日常痛點：**每次 push 完，你總是要打開瀏覽器、點開 Actions 標籤、然後傻傻地按 F5 重新整理，直到進度條跑完為止。**

這不僅中斷開發心流，還非常破壞開發者體驗 (DevEx)。

為了解決這個問題，我開發並開源了一個超輕量級的 CLI 工具：**[ghaction-lis](https://github.com/liwenchiou/ghaction-lis)**！

{/* truncate */}

## 為什麼不用簡單的 `curl` 腳本就好？

一開始，我（或者說我的 AI 助手）也想偷懶，寫了個簡單的 `bash` 迴圈去打 GitHub API，想說這樣就可以在 Terminal 裡面等結果。

結果馬上踩到一個嚴重的 **「時間差 (Race Condition)」陷阱**：
當你執行 `git push ; ./my-script.sh` 的時候，`git push` 一結束腳本就去打 API。但 GitHub 伺服器建立 Action 需要 2~5 秒的空窗期。這導致腳本抓到了**上一次已經成功的歷史紀錄**，瞬間回報「部署成功」，而實際上最新的部署根本還沒開始！

## ghaction-lis 的核心亮點

為了解決時間差與輪詢體驗，`ghaction-lis` 誕生了。它主打四大特點：

1. **🔒 精準鎖定 (SHA Matching)**：
   程式會先自動抓取你本地端的最新 `git rev-parse HEAD`，去跟 GitHub API 撈下來的 `head_sha` 進行嚴格比對。如果 Hash 不符合，它會聰明地等待，絕對不會抓到幽靈紀錄！
2. **✨ 優雅的終端體驗 (DevEx)**：
   內建 `ora` Spinner 與 `chalk` 顏色渲染。終端機會有漂亮的 Loading 動畫，成功顯示綠色打勾，失敗顯示紅色警告。
3. **🐛 智慧錯誤日誌擷取**：
   如果部署不幸失敗，你連瀏覽器都不用開！`ghaction-lis` 會自動抓取 GitHub 上的 Error Log 並且高亮印在 Terminal 裡，讓你秒懂問題出在哪。
4. **🚀 零配置隨插即用**：
   自動解析 Git remote 設定檔，完美整合 GitHub CLI (`gh`) 憑證，不需要繁瑣的 `.env` 設定。

## 如何使用？

我們提供兩種使用方式，讓您能根據開發習慣自由選擇：

### 1. 隨插即用 (推薦)
只要透過 `npx` 即可在任何 git 專案的資料夾下直接「免安裝執行」，保證零環境污染且隨時保持最新版：

```bash
npx ghaction-lis
```

### 2. 全域安裝
如果您希望在電腦上任何地方都能直接敲打指令，可以透過 npm 全域安裝：

```bash
npm install -g ghaction-lis
```
安裝後即可直接執行 `ghaction-lis` 指令。

或是整合到你的 `package.json` 中，打造完美的一條龍部署體驗：

```json
"scripts": {
  "deploy": "git push && npx ghaction-lis"
}
```

## 結語

這個小工具原本只是為了解決我自己的痛點，但現在它已經成為這座數位花園不可或缺的基礎建設，甚至被強制寫入了我的 **[AI 部署守則](/docs/engineering/ainotes/deployment-sop)** 中。

如果你也受夠了每次部署都要無腦切換瀏覽器，不妨試試看 `ghaction-lis`！
歡迎到 [GitHub 專案頁面](https://github.com/liwenchiou/ghaction-lis) 給我個 Star，也期待大家的 PR 與回饋！