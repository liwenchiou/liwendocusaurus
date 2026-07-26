---
id: workflow-and-skill
title: "主動指令與技能模組 (Workflow & Skill)"
sidebar_label: "指令與模組"
sidebar_position: 1

description: "主動指令與技能模組 Workflow & Skill 在 Antigravity 系統中，有兩種讓 AI 執行任務的方式，它們在架構與用途上有根本的差異：Workflow 快捷指令 與 Skill 底層模組。 基礎觀念：Workflow 與 Skill 有什麼不同？ 🔘 Workflow 工作流程..."
keywords: [主動指令與技能模組, Workflow, Skill, engineering, ainotes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "主動指令與技能模組 (Workflow & Skill)",
        "datePublished": "2026-07-08T13:51:33.498Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "主動指令與技能模組 Workflow & Skill 在 Antigravity 系統中，有兩種讓 AI 執行任務的方式，它們在架構與用途上有根本的差異：Workflow 快捷指令 與 Skill 底層模組。 基礎觀念：Workflow 與 Skill 有什麼不同？ 🔘 Workflow 工作流程..."
      }
    `}
  </script>
</Head>


# 主動指令與技能模組 (Workflow & Skill)

在 Antigravity 系統中，有兩種讓 AI 執行任務的方式，它們在架構與用途上有根本的差異：Workflow (快捷指令) 與 Skill (底層模組)。

## 基礎觀念：Workflow 與 Skill 有什麼不同？

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

## 如何達成「跨專案共用」？ (全域 vs 專案專屬)

### 主動觸發型 (Workflow + Symlink 捷徑)
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

---

## 🚀 終極進階技巧：Workflow 與 Skill 的雙重模組化 (MVC 架構)

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
一旦決定了全域捷徑的名稱（如 `global`），未來每一個新專案都**必須嚴格使用同一個名字**來建立捷徑，否則腳本呼叫絕對會失效！