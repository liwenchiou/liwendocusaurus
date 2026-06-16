---
title: "Antigravity Deployment SOP (AI 部署守則)"
sidebar_label: "部署守則 (AI Skill)"
---

# Antigravity Deployment SOP (AI 部署守則)

這份文件定義了 Antigravity (AI 助手) 在協助進行 Docusaurus 或任何前端專案開發與部署時，必須**嚴格遵守**的標準作業流程 (Standard Operating Procedure)。它也是確保我們協作順暢、不踩雷的最高指導原則。

## 🧠 AI 執行準則 (Core Directives)

在未來的每一次對話中，當涉及到「程式碼修改」、「預覽」或「部署」時，AI 必須嚴格遵循以下四大條件：

### 1. 🚫 禁止擅自部署 (No Unauthorized Deployments)

- **規則**：除非使用者（USER）明確下達指令（例如：「幫我部署」、「OK 部署吧」），否則 AI 絕對不可以擅自執行 `git commit` + `git push` 或觸發任何 CI/CD 流程。
- **目的**：確保使用者對專案進度與正式環境擁有 100% 的掌控權，防止未經確認的程式碼上線。

### 2. 🖥️ 強制本地端預覽 (Mandatory Local Review)

- **規則**：在完成重大架構調整、樣式 (CSS) 修改、或新增文章後，AI 必須主動開啟本地端伺服器（例如透過背景執行 `npm run start`），並請使用者在 `localhost:3000` 進行確認。
- **目的**：讓使用者在最安全的地方隨心所欲地檢查排版與邏輯。

### 3. 🔍 部署前嚴格檢查 (Pre-Deployment Build Verification)

- **規則**：在收到使用者的部署許可後，AI **禁止直接 Push**。AI 必須先在本地端執行 `npm run build`。
- **目的**：藉由嚴格的 Build 過程，攔截 Docusaurus 最致命的 Broken Links (死結)、Markdown 語法錯誤或靜態產出失敗，確保「會壞的東西在本地端就先壞掉」。

### 4. 📡 狀態回報與錯誤攔截 (Status Reporting & Error Handling)

- **規則**：
  - **部署執行後**：AI 必須主動撰寫並執行**背景輪詢腳本 (Polling Script)**，持續監控 GitHub API 直到獲得最終的部署結論（`conclusion: success` 或 `failure`），**絕對禁止只查一次就讓使用者盲等**。
  - **部署或編譯失敗時**：AI 必須立刻解析 Error Log（例如抓出斷掉的連結是哪一頁），將原因清晰地總結告知使用者，並且**詢問下一步指示**（例如：「我找到了 2 個死結，您希望我幫您修復，還是您要自己手動調整？」），禁止未經同意的盲目修復。

---

**⚠️ 系統提示 (System Override)**
從此刻起，這份守則將被寫入 AI 的行為模式。只要涉及這座數位花園的開發，這四大條件即為 AI 的第一優先定律~
