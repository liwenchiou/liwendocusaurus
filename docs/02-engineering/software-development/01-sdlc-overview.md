---
id: sdlc-overview
title: "軟體開發生命週期 (SDLC) 概述"
sidebar_position: 1
sidebar_label: "軟體開發生命週期 (SDLC) 概述"

description: "軟體開發流程與生命週期 (SDLC) 概述。詳細介紹軟體開發的六大核心階段（需求分析、系統設計、程式開發、測試、部署與維運）以及卓越流程的三大隱形關鍵。"
keywords: [軟體開發生命週期, SDLC, 概述, engineering, software-development]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "軟體開發生命週期 (SDLC) 概述",
        "datePublished": "2026-07-08T13:51:33.512Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "軟體開發流程與生命週期 (SDLC) 概述。詳細介紹軟體開發的六大核心階段（需求分析、系統設計、程式開發、測試、部署與維運）以及卓越流程的三大隱形關鍵。"
      }
    `}
  </script>
</Head>


# 軟體開發生命週期 (SDLC) 概述

一個好的軟體開發流程（通常指軟體開發生命週期，SDLC）就像是蓋一棟房子，如果沒有好好的規劃與分工，很容易在後期發現地基不穩或動線不對，導致花費數倍的時間與成本來重構（Refactoring）。

雖然現在許多團隊採用敏捷開發（Agile/Scrum），但核心的開發階段本質上是大同小異的。一個能確保品質、準時交付且兼顧團隊心理健康的軟體開發流程，通常會包含以下幾個關鍵階段。

---

## 🛠️ 軟體開發的六大核心階段

### 1. 需求分析與可行性評估 (Requirements & Analysis)

- **奠定專案成功的基石**：這是最重要的起點。團隊需要釐清「要解決什麼問題」、「目標受眾（TA）是誰」以及「預期的商業價值」。
- **具體實務**：產品經理（PM）會與利益關係人訪談，將抽象的需求轉化為具體的**使用者故事（User Story）**與**驗收標準（Acceptance Criteria）**，並產出需求規格書（PRD）。
- **工程視角與 AI 評估**：工程主管或架構師會在此階段進行**技術可行性評估**。評估包含時間預算、技術債風險，在現代開發中，更會評估「這項功能是否適合引入 AI 解決？」或是「現有的開源模型能否滿足需求？」，以避免承諾現有技術無法達成的產品。

### 2. 系統設計與架構規劃 (System Design)

- **動手寫程式前的藍圖**：這個階段絕對不急著寫程式碼，而是從全域視角規劃系統的骨架。
- **架構與介面設計**：
  - **前端與 UI/UX**：設計師使用 Figma 產出介面原型（Prototype）與設計規範（Design System）。
  - **後端與資料庫**：工程師繪製系統架構圖、定義 API 規格（RESTful 或 GraphQL）、選擇合適的資料庫（關聯式 SQL 或 NoSQL），並決定採用微服務（Microservices）或是單體架構（Monolith）。
- **預防勝於治療**：好的架構設計（例如確保高內聚、低耦合）能極大減少後期「牽一髮動全身」的大量重構時間。

### 3. 程式碼開發與實作 (Development & Coding)

- **將藍圖具現化**：工程師根據架構藍圖與設計規格，開始進入心流撰寫程式碼。
- **現代化開發規範**：一個成熟的開發團隊會嚴格執行**版本控制分支策略（如 Git Flow 或 GitHub Flow）**與**程式碼審查（Code Review）**。這不僅是為了抓 Bug，更是維持「乾淨程式碼 (Clean Code)」、統一撰寫風格，以及團隊成員間技術交流的絕佳機會。
- **AI 協作（Vibe Coding）**：現代開發者會將 Cursor、Copilot 或自訂的 AI Agent 融入編輯器中，讓 AI 輔助生成樣板程式碼、解釋複雜邏輯，大幅提升產出效率。

> 📝 文件即程式碼（Documentation）
> **好的流程必須伴隨著健康的知識庫**。除了程式碼本身，架構決策紀錄（ADR）、API 文件與環境建置 SOP 都應以 Markdown 撰寫，並與程式碼一同版控（例如您當前閱讀的 Docusaurus 專案）。這能讓新人交接的摩擦力降到最低，將個人經驗轉化為團隊的集體資產。

### 4. 系統測試與品質保證 (Testing & QA)

- **產品上線前的防線**：程式碼寫完不等於功能完成（Done != Deployed）。QA 工程師會從使用者的角度進行功能測試、跨瀏覽器測試，以及壓力測試。
- **測試金字塔（Testing Pyramid）**：
  - **單元測試 (Unit Test)**：針對單一函式或元件進行邏輯驗證（如 Jest, Vitest），執行速度最快。
  - **整合測試 (Integration Test)**：測試不同模組或前後端串接是否正常運作。
  - **端到端測試 (E2E Test)**：模擬真實使用者在瀏覽器上的操作行為與完整動線（如 Cypress, Playwright）。
- **避免退化（Regression）**：完善的自動化測試網能在每次新增功能時，確保舊有的功能沒有被意外「改壞」。

### 5. 部署與上線 (Deployment & Release)

- **讓產品與使用者見面**：將通過重重測試的程式碼，安全地發佈到生產環境（Production）。
- **現代化發佈策略**：為了達到流暢、無感且低風險的上線體驗，團隊通常會採用：
  - **藍綠部署（Blue-Green Deployment）**：準備兩套一模一樣的環境，新版本在綠環境測試無誤後，瞬間將流量從藍環境切換過去。
  - **金絲雀發佈（Canary Release）**：先將新版本發佈給 5% 的少數使用者，觀察是否有異常錯誤率，若一切穩定再逐步放大到 100%。

> ⚙️ 自動化高於一切（Automation）
> **能交給機器的，就不要人工手動設定**。這高度依賴 **CI/CD（持續整合與持續部署）** 自動化流水線（如 GitHub Actions）。從程式碼推上遠端開始，自動執行 Linter 檢查、跑完整套測試，甚至利用 AI 自動產生 Code Review 初稿，最後自動打包（如 Docker）並部署上雲。

### 6. 維運與持續迭代 (Maintenance & Feedback)

- **產品生命週期的延伸**：系統上線不是結束，而是真正挑戰的開始。
- **系統觀測性（Observability）**：工程師需要透過監控儀表板與日誌追蹤（如 Grafana, Datadog, Sentry）來隨時掌握 CPU 負載、API 錯誤率與記憶體狀況。當發生線上緊急問題時，需啟動 Hotfix 流程快速止血。
- **敏捷迭代循環**：透過數據分析與使用者反饋，團隊能驗證「第一階段的假說是否正確？」，並將新的優化需求重新帶回「階段一：需求分析」，形成一個正向、生生不息的產品生命週期。

> 🔄 擁抱回饋（Feedback Loop）
> **流程是活的，必須隨團隊痛點微調**。每個衝刺（Sprint）或專案結束後的**回顧會議（Retrospective）**至關重要。討論「哪裡做得好」、「哪裡可以改善」，唯有保持彈性不斷自我修正，流程才能真正服務團隊，而非成為限制創造力的條文框框。

---

### 📚 參考來源與延伸閱讀

- [IBM - What is the Software Development Life Cycle (SDLC)?](https://www.ibm.com/topics/sdlc)
- [Atlassian Agile Coach - Software development workflows](https://www.atlassian.com/agile/software-development)