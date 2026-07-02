---
id: 07-practical-scenarios
title: 實務情境模擬 (The Big Picture)
sidebar_label: "實務情境模擬"
sidebar_position: 7
---

# 實務情境模擬 (The Big Picture)

學完了前面所有的 Docker 基礎、網路、儲存空間、Compose 與 GitHub Actions 之後，我們現在要把所有碎片拼湊起來。

這篇筆記我們不談理論，直接帶你跑一次**真實業界的標準 DevOps 生命週期**！我們將模擬一個專案從「架構師建置」➡️「新人接手」➡️「自動化打包」➡️ 到最後的「雲端上線」，讓你徹底看懂這套完美的閉環 (Closed-loop)。

---

## 🏗️ Phase 0：架構師初始化環境 (Architect Setup)

**情境描述**：身為專案負責人，你準備從零建立一個新專案，並為未來的團隊與上線環境鋪路。

### 步驟 1：撰寫雙棲的設定檔
為了讓專案能夠完美適應「本地開發」與「正式上線」，你會巧妙地配置啟動指令：

1. **Dockerfile 裡寫**：`CMD ["node", "server.js"]`（讓雲端正式機用最高效能跑）。
2. **docker-compose.yml 裡加一行**：`command: nodemon server.js`（強行覆蓋 Dockerfile，讓本地開發保有熱重載）。

### 步驟 2：設定 CI/CD 與版控
你建立好 `.github/workflows/docker-image.yml` 腳本，並將整個基礎框架執行 `git commit` 與 `git push` 推送到 GitHub，等著團隊成員加入。

---

## 💻 Phase 1：新人接手開發 (New Developer Onboarding)

**情境描述**：公司今天來了一位新工程師（甚至他的電腦裡連 Node.js 都沒裝）。他的目標是接手你的專案，一鍵把環境跑起來，然後開始改 Code。

### 步驟 1：取得專案與變數
```bash
# 1. 將專案程式碼完整複製到本機
git clone <專案的 GitHub 網址>
cd <專案資料夾名稱>

# 2. 複製一份範本變數檔，填入本地開發用的資料庫密碼
cp .env.example .env
```

### 步驟 2：一鍵啟動魔法
新人打開 `docker-compose.yml` 確認使用的是 `build: .` 後，直接敲下這行指令：
```bash
# 3. 強制 Docker 根據最新的程式碼與 package.json 現場打包並啟動
docker compose up -d --build
```

### 步驟 3：開始寫 Code 與互動指令
環境啟動後，新人打開 VSCode 開始寫程式。因為我們有設定 **Bind Mounts**，他只要按下儲存，Docker 裡面的 `nodemon` 就會自動重新啟動，直接重新整理瀏覽器就能看到最新畫面！

如果遇到需要安裝新套件，**請絕對不要在 Mac 上打 npm install**，而是要告訴 Docker 去裝：
```bash
# 在容器內部安裝 cors 套件
docker compose exec myapp npm install cors
```
*(💡 魔法提醒：因為掛載的關係，容器內 `package.json` 的更新，會瞬間同步回新人的 Mac 裡面！)*

> 🙋‍♂️ **常見問題：新人需要在 Mac 上輸入 `node server.js` 來啟動伺服器嗎？**
> **絕對不需要！** 打完 `docker compose up -d` 的那一瞬間，伺服器就已經跑在那個看不見的虛擬貨櫃裡了。只要專心寫 Code 就好！

### 步驟 4：開發完成，提交程式碼
```bash
# 4. 下班前安全關閉本地環境
docker compose down

# 5. 將今天改好的 Code 提交上傳
git add .
git commit -m "完成會員登入功能"
git push
```

---

## 🤖 Phase 2：CI/CD 自動打包 (GitHub Actions)

**情境描述**：新人寫的功能經過了團隊的 Code Review，大家決定要把這個功能發布到正式環境上。

### 步驟 1：發布版本標籤 (Tag)
身為架構師的你，在 GitHub 專案頁面上，針對剛剛那包程式碼打上了一個 `v1.0.0` 的標籤 (Tag)。

### 步驟 2：雲端代工廠啟動
這個 `v1.0.0` 標籤瞬間觸發了 `.github/workflows/docker-image.yml` 腳本。
GitHub 的雲端伺服器自動開機，幫你把最新的程式碼打包成雙架構 (AMD64/ARM64) 的 Image，並自動推送到你的 Docker Hub 倉庫裡。

---

## ☁️ Phase 3：雲端正式上線 (Cloud Production)

**情境描述**：現在最新的貨櫃 (Image) 已經躺在 Docker Hub 裡等著出貨了。你負責連線到公司的 AWS 伺服器，完成最後一哩路。

### 步驟 1：登入主機並準備輕量檔案
你**不需要**把幾百 MB 的原始碼 `git clone` 到主機上！
```bash
# 1. 透過 SSH 連線進入雲端伺服器
ssh user@<你的伺服器IP>

# 2. 準備乾淨的資料夾
mkdir my-production-app
cd my-production-app

# 3. 準備好正式機的 .env 與 docker-compose.yml (裡面要改成 image: <帳號/專案>)
touch .env docker-compose.yml
```

### 步驟 2：一鍵拉取與更新
```bash
# 4. 拉取剛剛被 Action 打包好的最新 Image
docker compose pull

# 5. 重啟容器 (Docker 會自動把舊的關掉，換成新的)
docker compose up -d

# 6. 清除被淘汰的舊版 Image 釋放主機空間
docker image prune -f
```

### 💡 Bonus：如何讓雲端「全自動」拉取並更新？
如果你連登入 SSH 手動輸入 `docker compose pull` 都懶得做，業界有兩種最常見的「終極全自動 CD」方案：

1. **Watchtower (最簡單、無腦)**：
   它本身也是一個 Docker 容器，你只要把它跑在雲端伺服器上。它會像個警衛一樣「定時去監控」你的 Docker Hub，只要發現遠端有新版本的 Image，它就會**自動幫你拉下來並重啟你的應用程式**。
2. **GitHub Actions 遠端遙控 (最正規、精準)**：
   在打包 Image 的 Action `.yml` 腳本最後面，多加一個 `appleboy/ssh-action` 的套件。設定好伺服器的 SSH 金鑰後，GitHub Action 只要一把 Image 推上 Hub，就會立刻**透過 SSH 遠端連線進你的雲端伺服器，自動幫你敲打上面那三行更新指令**！

---

## 🎉 完結篇小語

從自己寫 Code 到團隊協作，從手動敲指令到全自動化流水線，你現在已經親眼見證並完全掌握了 Docker 最強大的地方：**「環境的一致性」**。

它完美分離了「寫程式」與「跑程式」的環境。不管是在你自己的 Mac 上，還是在遙遠的 Linux 雲端主機，你用來管理環境的指令永遠都是那幾句 `docker compose up -d` 與 `docker compose pull`。

這就是業界最標準的技術架構，恭喜你，你已經準備好迎接任何現代化的專案挑戰了！

---

## 🤔 新手常見實務 Q&A 大集合

在實際跑到這套流程時，新手常常會有以下幾個疑問：

**Q1：`docker-compose.yml` 裡面寫的 Bind Mounts (`./:/usr/local/app`)，萬一新人電腦裡沒有這個資料夾怎麼辦？**
> **不會發生的！** 因為這裡使用的是「相對路徑 (`./`)」，它代表的正是「目前這份 `yml` 所在的專案資料夾」。當新人執行了 `git clone`，他的電腦上就擁有了這個專案資料夾。他在裡面打指令時，Docker 就會自動把這個專案掛載進去，完全不需要手動建立任何路徑！

**Q2：如果掛載了整個 `./`，那我不小心寫的密碼檔 `.env` 不就也被掛載進去了？**
> **是的，但這在本地開發是安全的！** 本地端的 `.env` 通常只有測試用的密碼，掛載進去是為了讓程式能讀取到它。
> **🚨 真正危險的是「打包上雲端」的時候！** 為了防止 `.env` 被打包進 Image 外洩，專案創建者必須在根目錄放一個 **`.dockerignore`** 檔案並寫入 `.env`。這樣 Docker 在執行 `build` 蓋房子的時候，就會直接無視密碼檔，確保上線的 Image 100% 安全。

**Q3：如果新人是用 Windows 系統，這套開發流程會壞掉嗎？**
> **完全不會！這正是 Docker 的最強殺招！** 
> 無論新人是用 Windows 還是 Mac，Docker Desktop 都會自動把相對路徑轉換為正確的系統路徑，並且**讓程式碼統一跑在「虛擬的 Linux 容器」裡面**。
> *(💡 注意：為了防止 Windows 專用的套件去覆蓋掉 Linux 的套件，我們會在 `yml` 裡多加一行匿名掛載 `- /usr/local/app/node_modules` 當作護身符，確保大家底層的套件架構都不會打架！)*
