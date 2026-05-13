---
slug: ai-vibe-coding

{/* truncate */}

title: "Vibe Coding 很爽，但別讓 AI 隱藏的「安全地雷」毀掉你的產品"
description: "探討 AI 輔助開發（Vibe Coding）帶來的安全風險，包含 API Key 洩漏、SQL 注入與部署安全等實戰保命指南。"
image: /img/og-image.png
date: 2026-04-23T05:10:26.330989+00:00
authors: [liwen]
tags: [security, ai]
---


最近開發圈最迷人的詞莫過於 **Vibe Coding**——打幾句話，看著 AI 幫你把功能生出來，測試沒問題就光速部署。以前要花好幾天的專案，現在一個下午就能搞定。

說真的，這種「腦力即產力」的感覺非常爽。但就在這種高速生產的流程中，我注意到了一個隱形危機：**流程太順了，順到讓我們忘記了身為開發者最基本的「防禦本能」。**


`{`/* truncate */`}`


如果你也熱衷於 Vibe Coding，這篇「保命指南」你一定要加入收藏。

---

## 🛑 第一關：你的 API Key，正在 GitHub 上裸奔嗎？

這是最常見、也最容易導致「信用卡刷爆」的失誤。

當你叫 AI 快速串接 OpenAI 或 Stripe API 時，它生成的範例程式碼為了讓你直接跑通，往往會長這樣：

```javascript
/* ⚠️ 這是自殺式寫法：千萬別學 */
const openai = new OpenAI({
  apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx", // AI 為了方便，直接幫你填在這裡了
});
```

如果你直接 `git push` 上 GitHub，不到一分鐘，全世界的爬蟲機器人都會拿到你的金鑰，開始瘋狂盜刷。

> [!WARNING]
> **緊急救援：** 如果金鑰已經 push 出去，請第一時間去後台 **廢掉 (Rotate) 那支 Key**！「刪掉 commit」是救不了你的，因為 Git 的歷史紀錄會永遠留存。

### ✅ 正確的優雅姿勢：
請把金鑰放進 `.env` 檔案，並嚴格檢查你的 `.gitignore`。

如果你的專案規模較大，強烈建議改用 **[Infisical](https://infisical.com/)** 或 **[AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)** 這種專門的加密管理平台，這能讓你即便不小心洩漏了環境變數檔案，金鑰依然安全無虞。

> [!TIP]
> **Next.js 警語：** 千萬別在私密金鑰前綴加上 `NEXT_PUBLIC_`，否則它會被打包進前端。到時候讀者只要按一下 F12，你的私鑰就會直接在瀏覽器裡跟你招手。

---

## 🛡️ 第二關：AI 只管功能，它不會主動「擋壞人」

AI 的天性是「解決問題」，它不太會主動考慮到「被惡搞的場景」。例如一個簡單的資料庫查詢，AI 可能會給你這樣的 code：

```python
# 經典的 SQL 注入溫床
db.execute(f"INSERT INTO notes VALUES ('{user_input_text}')")
```

這在資安領域叫做 **SQL Injection**。只要有人輸入一句特殊的代碼，你的整個資料庫內容可能就會被洗劫一空。

**Vibe Coder 必須建立的習慣：**
*   **不信任任何輸入**：永遠檢查使用者傳過來的文字。
*   **限制頻率 (Rate Limiting)**：如果有人寫個迴圈狂灌你的 API，你的帳單會比你的程式碼跑得快。

---

## 🔍 第三關：部署後的「隱形後門」

現代部署平台（如 Vercel, Railway）讓上線變得太簡單。但簡單的背後，這兩個地方最容易踩雷：

1.  **Debug 模式忘了關**：開著 Debug 模式上線，就像是把家裡的平面圖與保險箱密碼貼在大門口。它會把檔案路徑、環境變數詳細地報給使用者（和駭客）看。
2.  **資料庫公開存取**：Supabase 或 Firebase 預設為了方便開發，有時會開放權限。**上線前請務必檢查 Row Level Security (RLS)**，確保那是鎖好的。

---

## 🧰 Vibe Coder 的安全百寶箱

為了讓你安心地「Vibe」，建議在工作流中加入這幾位「自動化保鏢」：

*   **[Trufflehog (金鑰獵人)](https://github.com/trufflesecurity/trufflehog)**：專門掃描你的 Git 歷史，翻出那些被你遺忘在舊版本裡的秘密。
*   **[Snyk (套件漏洞雷達)](https://snyk.io/)** / **[Dependabot](https://github.com/dependabot)**：GitHub 內建或外掛。它們會監控你的套件庫，發現漏洞時會直接發一個 PR 幫你修好。
*   **[Gitleaks](https://github.com/gitleaks/gitleaks)**：這是最後一道防線，如果你想在本地端攔截失誤，它可以在你 `commit` 的那一刻阻止你把 Key 傳出去。
*   **[GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)**：GitHub 官方內建的強大功能，能第一時間阻斷洩漏。

---

## 💡 總結：快雖好，但安全不能省

Vibe Coding 讓每個人都能成為「數位創作者」，這是一場民主化革命。但這也代表，以前工程師才會碰到的炸彈，現在我們每個人都要懂得拆。

**記住這個「安全清單」：**
1.  **金鑰必進 `.env`**，且必須加入 `.gitignore`。
2.  **不信任輸入**，一定要做內容驗證。
3.  **確認權限**，上線前關閉 Debug 與資料庫公開權限。
4.  **定期檢核**，跑一下 `npm audit` 看看套件健不健康。

*做產品本來就有風險，但這些低級錯誤不值得你冒險。*

---
