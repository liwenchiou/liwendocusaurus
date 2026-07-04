---
slug: /liwen-sop/sop-documents/tech-spec
description: "系統開發規格書範本 (SD)，專供工程師實作與部署使用之技術指南"
keywords: [系統開發規格書, Tech, Spec, SD, projects-business, liwen-sop, sop-documents]
---

# 系統開發規格書 (Tech Spec / SD)

> **🎯 文件屬性：純技術開發手冊 (SD)**
> 由**「技術主管與工程師」**產出。這份文件是工程團隊的「唯一真相來源 (Single Source of Truth)」，負責將 SA 文件的商業需求，正式落地為具體的程式碼架構、資料庫結構與 API 路由。

---

## 一、專案資源與入口 (Project Assets & Links)
> 💡 工程師的「任意門」，把所有開工必備的網址統一放在這裡。

- **GitHub 儲存庫**：[填寫 Repo 連結]
- **正式環境 (Production)**：[填寫正式機網址]
- **測試環境 (Staging)**：[填寫測試機網址]
- **第三方後台入口**：[例如：Vercel、AWS、Supabase（密碼請見 1Password）]
- **依據之 SA 文件**：[請填寫 SA 分析文件連結]

## 二、技術棧與依賴套件 (Tech Stack & Dependencies)
> 💡 紀錄本專案的底層基底與核心套件。

- **前端框架**：[例如：Next.js (App Router), React 18]
- **UI / CSS**：[例如：TailwindCSS, shadcn/ui]
- **後端框架**：[例如：Next.js API Routes, Node.js]
- **資料庫**：[例如：PostgreSQL (Supabase)]
- **關鍵第三方套件**：[例如：Zustand (狀態管理), Prisma (ORM)]

## 三、環境變數清單 (.env Checklist) 💣 部署必看
> 💡 本機開發或部署時，請確保這些 Key 都有設定。⚠️ **絕對不要在此寫出真實 Value！**

- `NEXT_PUBLIC_API_URL`：前端打 API 用的基礎網址
- `DATABASE_URL`：資料庫連線字串
- `STRIPE_SECRET_KEY`：第三方金流的 Secret Key
- `JWT_SECRET`：身分驗證加密金鑰

## 四、資料庫實體結構 (Database Schema)
> 💡 確切的資料表結構，包含真實的欄位型態與主外鍵。

- **`users` (會員表)**:
  - `id` (UUID, PK)
  - `email` (VARCHAR, Unique)
  - `hashed_password` (VARCHAR)
  - `created_at` (TIMESTAMPZ, Default: now())
- **`orders` (訂單表)**:
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> users.id)
  - `total_amount` (INT)
  - `status` (ENUM: 'pending', 'paid', 'shipped')

## 五、API 路由與規格 (API Endpoints)
> 💡 定義前後端溝通的確切路由與 Method。

| Method | Endpoint | Request Body | Response | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/login` | `{ email, password }` | `{ token, user }` | ✅ 完成 |
| GET | `/api/v1/orders` | `Headers: Authorization` | `[ { order objects } ]` | 🚧 開發中 |

## 六、本地開發與部署指南 (Local Setup & Deployment)
> 💡 確保任何工程師拿到 Repo 後，都能在 5 分鐘內跑起來。

- **本地啟動指令**：
  1. `npm install`
  2. 複製 `.env.example` 改名為 `.env.local`
  3. 啟動伺服器：`npm run dev`
- **正式部署機制 (CI/CD)**：
  - [例：推上 GitHub `main` 分支，Vercel 即自動觸發 Production 部署。]

## 七、系統監控與報錯機制 (Monitoring & Logging)
> 💡 專案上線後的保命措施。

- **錯誤日誌 (Error Logging)**：
  - [例：使用 Vercel Runtime Logs 追蹤 API 錯誤。]
  - [例：前端重大報錯導入 Sentry。]
- **備份機制**：
  - [例：Supabase 預設提供每日自動化備份 (PITR)，保留 7 天。]

---
*文件更新歷程*
- *[YYYY/MM/DD] - 依據 SA 規格書，建立系統開發文件初版。*