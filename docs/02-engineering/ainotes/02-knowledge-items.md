---
id: knowledge-items
title: 全域知識庫與記憶管理 (Knowledge Items)
sidebar_label: 02. KI 知識庫
sidebar_position: 2
---

# 全域知識庫與記憶管理 (Knowledge Items)

**適用場景**：希望 AI 將規矩變成「潛意識」（如：程式碼縮排固定 4 格、部署前必須編譯）。免打 `/` 指令，用語音或文字自然語言驅動。

## 【實戰結構】Knowledge Item 底層格式
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

### 1. `metadata.json` (摘要與觸發條件)
這是給 AI 快速掃描用的「目錄索引」，清楚告訴 AI 這個知識庫的用途：
```json
{
  "summary": "這包含了團隊的 Git 提交流程規範。當使用者要求處理 git, commit 時，必須讀取此知識。"
}
```

### 2. `artifacts/` 內的實際規範內容 (支援多檔案！)
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

## 🌟 進階技巧：動態指針模式 (Dynamic Pointer KI)
如果你的專案規範非常頻繁地變動，你會發現把規則「寫死」在 Knowledge Items 裡面很難維護，因為每次改規則都要手動叫 AI 去更新 KI。
這時，我們可以使用**「動態指針模式」**，完美結合專案內的 `.agent` 檔案與 KI 系統：

1. **建立本地教戰手冊**：在專案根目錄建立 `.agent`，把專屬的防呆規則寫進去（例如：不准自動 push、必須加上 Emoji），並將此檔加入 `.gitignore`。
2. **將 KI 變成雷達指針**：不要把規則內容寫進 KI，而是要求 AI 把 KI 的 `metadata.json` 改寫成強制讀取指令：
   ```json
   {
     "summary": "【專案名稱專屬】強制指令：在每次新對話開始時，或者在執行任何修改前，你「必須」優先讀取專案根目錄下的 `.agent` 檔案，並以該檔案內的最新內容作為本專案的最高指導原則。絕不可依賴舊有記憶。"
   }
   ```
3. **無痛維護**：未來只要你開啟該專案的新對話，AI 就會被這段 `summary` 強迫去讀取本地端的最新 `.agent`。從今以後，你只需要專心維護本地的檔案即可，KI 永遠會為你精準導航！

## 結語

不要把 AI 當作只能按鈕執行的呆板機器人！
*   如果你需要它「**照著劇本跑**」，請寫成 **Workflow (Markdown 步驟)**。
*   如果你需要它執行「**龐大複雜的模組任務**」，請包裝成 **Skill 資料夾**。
*   如果你希望它「**記住習慣與規矩 (潛意識)**」，請存成 **Knowledge Items (JSON + Markdown)** 或是使用 **動態指針模式**！
