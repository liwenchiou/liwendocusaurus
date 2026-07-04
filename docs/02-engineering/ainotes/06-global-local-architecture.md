---
id: global-local-architecture
title: "進階架構：全域與本地雙層大腦設定"
sidebar_label: "06. 全域與本地雙層大腦"
sidebar_position: 6

description: "進階架構：全域與本地雙層大腦設定 當你在多個專案中使用 AI Agent 輔助開發時，必定會面臨一個難題：「我希望所有專案都共用一套基礎規範（例如：繁體中文、不主動執行終端機），但每個專案又需要有自己專屬的優先規則（例如：A 專案部署前要跑 build，B 專案需要跑 test）。」 如果只依賴單一..."
keywords: [進階架構, 全域與本地雙層大腦設定, engineering, ainotes]
---

# 進階架構：全域與本地雙層大腦設定

當你在多個專案中使用 AI Agent 輔助開發時，必定會面臨一個難題：「我希望所有專案都共用一套基礎規範（例如：繁體中文、不主動執行終端機），但每個專案又需要有自己專屬的優先規則（例如：A 專案部署前要跑 `build`，B 專案需要跑 `test`）。」

如果只依賴單一的 `.agent` 檔案，不僅難以維護共用語句，還常常會發生 AI 因為觸發特定技能而產生「隧道視覺 (Tunnel Vision)」，直接略過本地規則的狀況。

本篇 SOP 將指引你如何透過系統的 `Customizations` 機制，結合 Prompt 攔截術，打造一套堅不可摧的**雙層大腦架構**。

## 核心架構概念

- **全域大腦 (Global Root)**：存放於系統預設配置目錄 `~/.gemini/config`。這裡放置跨專案通用的 `AGENTS.md` 與所有通用的 `skills`。
- **本地大腦 (Workspace Root)**：存放於各個專案底下的 `.agents/AGENTS.md`。這裡存放專案專屬的規則。

**系統的融合機制**：當 AI 啟動時，它會在底層自動將「全域」與「本地」的設定檔合併寫入核心 Prompt 中，且架構上本地大腦的優先權會天然高於全域大腦，徹底免除 AI 忘記讀取檔案的風險。

---

## 實戰設定 4 步驟

### Step 1: 將全域大腦掛載到系統配置
假設你的通用大腦原始碼存放在 `~/Documents/工程師/project/liai`，請執行以下指令將其透過軟連結 (Symlink) 掛載到系統配置中：

```bash
# 確保系統的 config 資料夾存在
mkdir -p ~/.gemini/config

# 把 liai 的核心目錄掛載到全域
ln -sf ~/Documents/工程師/project/liai/AGENTS.md ~/.gemini/config/AGENTS.md
ln -sf ~/Documents/工程師/project/liai/skills ~/.gemini/config/skills
```

### Step 2: 設定專案本地大腦
在你的個別開發專案（例如 `liwendocusaurus`）中，建立工作區專屬的設定檔：

```bash
# 建立專案專屬大腦資料夾
mkdir .agents

# 將本地規則檔放入其中並命名為 AGENTS.md
mv .agent .agents/AGENTS.md
```

### Step 3: 加入「強制攔截機制」Prompt
為了解決 AI 在接收到特定任務（如「幫我部署」）時，直接觸發底層技能而忘記查看專案規則的「隧道視覺」問題，你**必須在全域的 `AGENTS.md` 最上方**加入這段強制攔截的咒語：

```markdown
> 🔴 **【CRITICAL: 強制攔截與本地讀取機制】**
> 本份文件為跨專案的「全域大腦」。
> 每次新對話或執行任何任務的『第一步』，**絕對不准**因為特定關鍵字而直接進入自動導航（Tunnel Vision）！
> 你被強制要求必須先使用你的「檔案讀取工具（如 view_file, read_file）」去讀取專案根目錄下的 `.agents/AGENTS.md`。
> 在你沒有實際執行讀取動作前，嚴禁進行任何後續動作！
```
這段使用了 `CRITICAL` 與「絕對不准」等強烈字眼的 Prompt，能有效打斷 AI 的自動反射神經。

### Step 4: 建立 Mount Protection (防護污染機制)
因為軟連結包含了本機的絕對路徑，**絕對不可以 Commit 進入版本控制系統**，否則團隊其他人拉取時會發生 Broken Symlink。

請在專案的 `.gitignore` 與 `.dockerignore` 中加上：
```text
.agents
```

## 總結
完成上述設定後，您在全域 `liai` 專案所做的任何心法更新，都會瞬間套用到所有專案。而當 AI 在處理特定專案時，又會被 Prompt 強制攔截去讀取本地的 `.agents/AGENTS.md`，達成兼具「全域擴充性」與「本地最高優先權」的完美協作模式。