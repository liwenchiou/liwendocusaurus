---
id: ai-core-paths
title: "AI 核心路徑速查表 (Cheat Sheet)"
sidebar_label: "03. 路徑速查表"
sidebar_position: 3

description: "AI 核心路徑速查表 Cheat Sheet 在開始調整全域技能或除錯時，必須先了解 AI Agent 相關的隱藏目錄分佈： | 類型 | Windows 路徑 C:\\Users\\User | Mac / Linux 路徑 /Users/User | 用途說明 | | : | : | : | : |..."
keywords: [AI, 核心路徑速查表, Cheat, Sheet, engineering, ainotes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "AI 核心路徑速查表 (Cheat Sheet)",
        "datePublished": "2026-07-08T13:51:33.499Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "AI 核心路徑速查表 Cheat Sheet 在開始調整全域技能或除錯時，必須先了解 AI Agent 相關的隱藏目錄分佈： | 類型 | Windows 路徑 C:\\Users\\User | Mac / Linux 路徑 /Users/User | 用途說明 | | : | : | : | : |..."
      }
    `}
  </script>
</Head>


# AI 核心路徑速查表 (Cheat Sheet)

在開始調整全域技能或除錯時，必須先了解 AI Agent 相關的隱藏目錄分佈：

| 類型 | Windows 路徑 (`C:\Users\User`) | Mac / Linux 路徑 (`/Users/User`) | 用途說明 |
| :--- | :--- | :--- | :--- |
| **編輯器設定** | `~\.antigravity` | `~/.antigravity` | 編輯器本身的系統目錄 (如 `argv.json`、`extensions`)，類似 VS Code 的 `.vscode`。 |
| **全域技能** | `~\.agents` | `~/.agents` | 全域擴充技能庫 (內含 `skills`、`.skill-lock.json`)。 |
| **AI 核心記憶** | `~\.gemini\antigravity` | `~/.gemini/antigravity` | **本機 AI 運作核心！** 存放 Knowledge Items (全域知識庫)、歷史對話 (`brain`) 等。 |
| **專案工作區** | `[專案目錄]\.agent` | `[專案目錄]/.agent` | 當前專案專屬的工作流程 (`workflows`)、專案技能 (`skills`) 與規範 (`global.md` 或 `.agent`)。 |