---
id: npm-overview
sidebar_position: 0
title: "NPM 套件總覽"
sidebar_label: "\u200B00 NPM 套件總覽"

description: "NPM 套件探索總覽 這裡記錄了我學習與研究過的各種實用 NPM 套件。我會將套件的用法、踩坑紀錄以及實際應用情境整理成技術筆記，方便日後在不同的專案中快速查閱與重用。 學習套件清單 | 套件名稱 | 說明與用途 | 查看筆記 | | : | : | : | | bcrypt | 密碼雜湊與驗證 |..."
keywords: [NPM, 套件總覽, engineering, npm-packages]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "NPM 套件總覽",
        "datePublished": "2026-07-08T13:51:33.508Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "NPM 套件探索總覽 這裡記錄了我學習與研究過的各種實用 NPM 套件。我會將套件的用法、踩坑紀錄以及實際應用情境整理成技術筆記，方便日後在不同的專案中快速查閱與重用。 學習套件清單 | 套件名稱 | 說明與用途 | 查看筆記 | | : | : | : | | bcrypt | 密碼雜湊與驗證 |..."
      }
    `}
  </script>
</Head>


# NPM 套件探索總覽

這裡記錄了我學習與研究過的各種實用 NPM 套件。我會將套件的用法、踩坑紀錄以及實際應用情境整理成技術筆記，方便日後在不同的專案中快速查閱與重用。

## 學習套件清單

| 套件名稱 | 說明與用途 | 查看筆記 |
| :--- | :--- | :--- |
| **`bcrypt`** | 密碼雜湊與驗證 | [👉 查看](./01-bcrypt.md) |
| **`jsonwebtoken`** | JSON Web Token (JWT) 簽發與驗證 | [👉 查看](./02-jsonwebtoken.md) |
| **`dotenv`** | Node.js 環境變數管理必備套件，用於讀取 `.env` 檔設定 | [👉 查看](./03-dotenv.md) |
| **`uuid`** | 產生符合 RFC 標準的絕對唯一識別碼 (UUID v4) | [👉 查看](./04-uuid.md) |
| **`webserver`** | Node.js 原生內建 Web Server (`http`)，掌握 Req/Res 生命週期 | [👉 查看](./05-webserver.md) |
| **`express`** | Node.js 最主流的輕量 Web 框架，簡化路由與伺服器建置 | [👉 查看](./06-express.md) |
| **`express.Router()`** | Express 路由模組化與架構拆分 | [👉 查看](./07-express-router.md) |
| **`formidable`** | 專門用來解析上傳檔案與 `multipart/form-data` 的套件 | [👉 查看](./08-formidable.md) |
| **`ezdcbot`** | 我個人開源的 Discord 零依賴輕量推播套件，專為 Serverless 打造 | [👉 查看](./09-ezdcbot.md) |
| **`ghaction-lis`** | 我個人開源的 CLI 工具，專門解決 GitHub Actions 輪詢時間差與終端機監控 | [👉 查看](./10-ghaction-lis.md) |

*(本清單將會隨著學習進度持續擴充更新)*