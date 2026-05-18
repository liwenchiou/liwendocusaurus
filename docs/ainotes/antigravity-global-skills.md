---
slug: antigravity-global-skills
description: "這是一份關於如何設定與跨專案共用 Antigravity (Gemini) AI Agent 全域技能與環境配置的詳細筆記，涵蓋 Workflow、Skill、Knowledge Items 及 MVC 模組化架構。"
---

# Antigravity (Gemini) AI Agent - 全域技能與環境配置筆記

## 為什麼需要這份筆記？（開發者的痛點）

在導入 AI Agent 輔助開發的過程中，我們通常會為專案量身打造專屬的「AI 技能」或「工作流程 (Workflow)」。但當你在專案 A 裡面辛苦打磨出一套完美的 `.agent` 腳本（例如超好用的 Git 提交流程、或者嚴格的 Code Review 規範），接著切換到專案 B 時，卻會發現一個致命的痛點：

> 🚨 **「我在專案 A 寫好的 `/` 指令跟 AI 規矩，到了專案 B 居然完全不能用！」**

這是因為 Antigravity 預設只會讀取「**當下專案資料夾**」裡的 `.agent` 設定。這導致我們每次開新專案，都要把舊專案的腳本複製貼上，一旦想要優化某個流程，還得去每個專案裡逐一修改，非常沒有效率。

本筆記就是要解決這個痛點！我們將從最基礎的 Workflow 與 Skill 觀念講起，逐步推進到「跨專案共用」，最後帶入「終極 MVC 模組化架構」。

---

## 1. 核心路徑大解密 (Windows vs Mac)

在開始之前，必須先了解 AI Agent 相關的隱藏目錄分佈：

| 類型 | Windows 路徑 (`C:\Users\User`) | Mac / Linux 路徑 (`/Users/User`) | 用途說明 |
| :--- | :--- | :--- | :--- |
| **編輯器設定** | `~\.antigravity` | `~/.antigravity` | 編輯器本身的系統目錄 (如 `argv.json`、`extensions`)，類似 VS Code 的 `.vscode`。 |
| **全域技能** | `~\.agents` | `~/.agents` | 全域擴充技能庫 (內含 `skills`、`.skill-lock.json`)。 |
| **AI 核心記憶** | `~\.gemini\antigravity` | `~/.gemini/antigravity` | **本機 AI 運作核心！** 存放 Knowledge Items (全域知識庫)、歷史對話 (`brain`) 等。 |
| **專案工作區** | `[專案目錄]\.agent` | `[專案目錄]/.agent` | 當前專案專屬的工作流程 (`workflows`)、專案技能 (`skills`) 與規範 (`global.md`)。 |

---

## 2. 基礎觀念：Workflow 與 Skill 有什麼不同？

在 Antigravity 系統中，有兩種讓 AI 執行任務的方式，它們在架構與用途上有根本的差異：

### 🔘 Workflow (工作流程)：前端遙控器
*   **用途**：主要「給人叫的」。它對應到聊天框的 `/` 快捷指令（例如您現在可以打出的 `/agent` 或 `/Thought-Sync`）。
*   **結構**：非常單純，通常就是**一個獨立的 `.md` 檔案**。
*   **撰寫格式範例**（假設建立一個自訂的 `.agent/workflows/git-sync.md`）：
    ```markdown
    # Git 自動提交流程
    這是一個幫助使用者自動提交程式碼的工作流程。請嚴格按照以下步驟執行：
    
    ## Step 1: 檢查狀態
    // turbo (這個註解可授權 AI 自動執行下方終端機指令，不需再次詢問)
    請使用 `run_command` 執行 `git status` 與 `git diff`，分析目前的修改內容。
    
    ## Step 2: 執行提交
    請執行 `git add .` 與 `git commit -m "你的訊息"`，最後執行 `git push`。
    ```

### 🧠 Skill (技能)：後端彈藥庫
*   **用途**：主要「給 AI 當作模組呼叫的」。因為技能邏輯較複雜，通常由 Workflow 或 AI 自行觸發。
*   **結構**：它**必定是一個資料夾**，裡面包含主程式與附屬文件。
*   **真實 Antigravity 範例**（以您專案內建的 `Thought-Sync` 為例，放在 `.agent/skills/`）：
    ```text
    .agent/skills/
    └── Thought-Sync/         <-- 技能模組名稱 (必定是資料夾)
        ├── core.md           <-- 技能的「主程式」(定義核心語境導航邏輯)
        ├── CHRONICLE.md      <-- 擴充的輔助紀錄文件
        └── context/          <-- 專屬的子目錄，存放相關資源檔
    ```

---

## 3. 如何達成「跨專案共用」？(全域 vs 專案專屬)

若要打破專案界線，打造全域共用的 AI 技能，有以下兩種核心策略：

### 策略一：主動觸發型 (Workflow + Symlink 捷徑)
**適用場景**：需要主動按 `/` 叫出腳本，要求 AI 按照特定 SOP 執行的自動化任務。

**【實戰操作：子目錄捷徑法】(全域與區域完美共存)**
假設您將全域共用的 Workflow 寫好放在 `D:\skills`，今天開啟了新專案 `D:\work\p1`。為了讓專案能保有「專屬技能」，同時載入「全域技能」，請使用子目錄捷徑法：

1. **建立真實資料夾**：在新專案內建立真實的 `.agent\workflows` 目錄。
2. **放入專屬技能**：專案專屬的腳本（如 `deploy-p1.md`）直接放在此真實目錄下。
3. **建立全域捷徑**：
   *   **Windows (PowerShell 系統管理員)**：
       ```powershell
       New-Item -ItemType SymbolicLink -Path "D:\work\p1\.agent\workflows\global" -Target "D:\skills"
       ```
   *   **Mac / Linux (Terminal)** (假設全域放 `~/skills`，專案在 `~/work/p1`)：
       ```bash
       ln -s ~/skills ~/work/p1/.agent/workflows/global
       ```
*(結果：打 `/` 時，AI 會同時掃出全域的 `git-sync` 與專案的 `deploy-p1`。且 `D:\skills` 還可以獨立進行 `git init` 版控！)*

### 策略二：被動觸發型 (Knowledge Items 全域知識庫)
**適用場景**：希望 AI 將規矩變成「潛意識」（如：程式碼縮排固定 4 格）。免打 `/` 指令，用語音或文字自然語言驅動。

**【實戰結構】Knowledge Item 底層格式**
知識庫存放在 `~/.gemini/antigravity/knowledge/`。它並非單一的 `.md` 檔案，而是**一個資料夾包含兩個核心結構**。

首先，一個完整的知識項目資料夾樹狀圖會長這樣（以建立 Git 規範 `my_git_rules` 為例）：
```text
~/.gemini/antigravity/knowledge/
└── my_git_rules/               <-- (名稱自訂) 知識項目的資料夾名稱
    ├── metadata.json           <-- (檔名固定) 給 AI 看的摘要與喚醒條件
    └── artifacts/              <-- (目錄固定) 實際內容的存放區
        ├── guideline.md        <-- (檔名自訂) 你的 Markdown 規範條文
        └── template.txt        <-- (檔名自訂) 裡面也可以放多個不同的檔案
```

接著，我們來看看這兩個核心檔案裡面的內容：

**1. `metadata.json` (摘要與觸發條件)**
這是給 AI 快速掃描用的「目錄索引」，清楚告訴 AI 這個知識庫的用途：
```json
{
  "summary": "這包含了團隊的 Git 提交流程規範。當使用者要求處理 git, commit 時，必須讀取此知識。"
}
```

**2. `artifacts/` 內的實際規範內容 (支援多檔案！)**
一旦這個知識庫被觸發，AI 會**一口氣讀取 `artifacts/` 裡面「所有的檔案」**。因此您可以依據需求拆分多個檔案，只要在開頭用標題寫清楚，AI 就會自己根據當下任務判斷該套用哪一份：

*   **`artifacts/frontend_rules.md`**：
    ```markdown
    # 前端 Git 規範
    若修改 Vue/React 檔案，Commit 標籤必須標註組件名稱，例如 `feat(Button): ...`。
    ```
*   **`artifacts/backend_rules.md`**：
    ```markdown
    # 後端 Git 規範
    若修改 PHP/SQL 檔案，Commit 內文必須附上對應的資料庫異動說明。
    ```
*(注意：既然 AI 會全部一起讀進去，請確保多個檔案之間的規則不要互相打架衝突喔！)*

> 💡 **最速建立法**：直接在聊天框對 AI 說：「*請幫我把這段 Git 提交流程，存進全域知識庫 (Knowledge Item) 裡面。*」AI 就會在背景自動建好上述結構。

---

## 4. 🚀 終極進階技巧：Workflow 與 Skill 的雙重模組化 (MVC 架構)

當您的 AI 技能越來越龐大時，建議套用軟體工程的 **MVC 架構** 來極致模組化：讓 Workflow 只當「控制器」，將所有髒活交給 Skill「服務」處理。

### 步驟 A：模組化的檔案寫法
遙控器不需要寫滿長篇大論，只需要兩句話負責發包任務：

**【前端：Workflow 遙控器】 (`workflows/git-sync.md`)**
```markdown
# Git 自動提交流程
1. 請先讀取 `.agent/skills/global/git-assistant/SKILL.md` 獲取執行規範。
2. 嚴格依照該技能內的 SOP，協助我完成本次的 Git 提交。
```

**【後端：Skill 彈藥庫】 (`skills/git-assistant/SKILL.md`)**
這裡才是真正放置又長又複雜的 SOP 與工具授權的地方：
```markdown
# Git Assistant 主程式

## 執行步驟：
1. **讀取規範**：請先檢查同目錄下是否有 `commit-rules.md`，若有則讀取之。
2. **檢查狀態**：
   // turbo (授權 AI 自動執行)
   請使用 `run_command` 執行 `git status` 與 `git diff`，分析目前的修改內容。
3. **產出訊息**：根據分析結果與規範，草擬一段 Commit Message。
4. **執行推送**：最後執行 `git add .`、`git commit -m` 與 `git push`。
```
*(這樣的切分，不僅讓 `/` 腳本變得極度乾淨，也讓未來維護 Git SOP 變得更直覺！)*

### 步驟 B：雙重掛載法 (全域庫與專屬技能並存)
假設您的全域配置庫放在 `D:\AI-Core`，裡面同時具備 `workflows` 與 `skills`。
開啟新專案 `D:\work\p1` 時，請對兩者皆使用子目錄捷徑法：

*   **Windows (PowerShell 系統管理員)**：
    ```powershell
    # 1. 在新專案建立真實的 workflows 與 skills 資料夾
    New-Item -ItemType Directory -Force -Path "D:\work\p1\.agent\workflows"
    New-Item -ItemType Directory -Force -Path "D:\work\p1\.agent\skills"

    # 2. 將全域 workflows 偽裝成專案的 global 子目錄
    New-Item -ItemType SymbolicLink -Path "D:\work\p1\.agent\workflows\global" -Target "D:\AI-Core\workflows"

    # 3. 將全域 skills 也偽裝成專案的 global 子目錄
    New-Item -ItemType SymbolicLink -Path "D:\work\p1\.agent\skills\global" -Target "D:\AI-Core\skills"
    ```

*   **Mac / Linux (Terminal)** (假設全域放 `~/AI-Core`，專案在 `~/work/p1`)：
    ```bash
    # 1. 建立真實資料夾
    mkdir -p ~/work/p1/.agent/workflows
    mkdir -p ~/work/p1/.agent/skills

    # 2. 建立雙重捷徑
    ln -s ~/AI-Core/workflows ~/work/p1/.agent/workflows/global
    ln -s ~/AI-Core/skills ~/work/p1/.agent/skills/global
    ```

**⚠️ MVC 終極架構的注意事項（呼叫路徑的改變）**：
因為我們使用了「子目錄捷徑法」，在專案中的實際檔案結構會變成這樣：
```text
.agent/skills/
├── 專案自己的專屬技能/
└── global/               <-- 這是掛載進來的全域捷徑
    └── git-assistant/    <-- 真正的全域技能躲在捷徑裡面
        └── SKILL.md
```
您可以看到，全域技能的外面**多包了一層 `global/`** 的資料夾。
因此，當您在全域的 Workflow (遙控器) 裡面，請 AI 去讀取全域技能時，路徑必須寫對：
*   ❌ **錯誤寫法**：`請讀取 .agent/skills/git-assistant/SKILL.md` (AI 會在專屬技能區找不到)
*   ✅ **正確寫法**：`請讀取 .agent/skills/global/git-assistant/SKILL.md`

**🚨 致命陷阱警告：捷徑名稱必須「跨專案統一」**
您可以將捷徑自由命名為 `core`、`company` 或是 `您的名字`（這樣在聊天框打 `/` 時，選單就會很酷地變成 `/core/git-sync`）。
**但是！** 因為全域的 `git-sync.md` 是所有專案**共看同一份實體檔案**，如果您在專案 A 建立的捷徑叫 `global`，在專案 B 卻建成了 `global2`，那麼寫死在 Workflow 裡面的呼叫路徑，必定會在其中一個專案報錯找不到！
👉 **結論**：一旦決定了全域捷徑的名稱（如 `global`），未來每一個新專案都**必須嚴格使用同一個名字**來建立捷徑。

*(掌握以上邏輯後，這個架構便能達成「專案專屬流程」與「全域流程」的完美分離，兩者井水不犯河水！)*

---

## 結語

不要把 AI 當作只能按鈕執行的呆板機器人！
*   如果你需要它「**照著劇本跑**」，請寫成 **Workflow (Markdown 步驟)**。
*   如果你需要它執行「**龐大複雜的模組任務**」，請包裝成 **Skill 資料夾**。
*   如果你希望它「**記住習慣與規矩 (潛意識)**」，請存成 **Knowledge Items (JSON + Markdown)**。

善用捷徑掛載與 MVC 模組化，你就能打造出無論切換到哪個專案，都無縫接軌的超級私人工程師！
