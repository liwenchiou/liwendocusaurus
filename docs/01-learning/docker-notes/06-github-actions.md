---
id: 06-github-actions
title: 自動化部署 GitHub Actions
sidebar_label: "GitHub Actions"
sidebar_position: 6
---

# 自動化部署 GitHub Actions

👉 **核心痛點**：之前我們教過使用 `docker buildx` 在本機進行「跨平台多架構打包」，但如果每次改 code 都要在本機慢慢跑打包程序、然後手動推送到 Docker Hub，實在太浪費時間了，而且電腦跑打包時還會很卡！

最聰明的做法是：**把這些苦差事丟給 GitHub 的雲端伺服器幫我們跑！** 只要我們上傳新程式碼並發布版本標籤 (Tag)，GitHub Actions 就會自動幫我們打包成 AMD64/ARM64 雙版本，並自動推送到 Docker Hub 上。

## 1. 取得 Docker Hub 授權金鑰 (PAT)
要讓 GitHub 雲端機器有權限幫你把打包好的 Image 推上你的 Docker Hub，我們需要給它一把專屬鑰匙：
1. 登入 Docker Hub，前往右上方大頭貼的 [Settings > Personal access tokens](https://hub.docker.com/settings/security)。
2. 點擊 `New Access Token`，並在 **scopes** 權限中勾選 `Read, Write, Delete`。
3. 產生後，**請立刻複製並把這串 Token 存起來** (它只會出現一次！如果忘記就只能刪掉重申請)。

## 2. 設定 GitHub 專案的機密環境變數 (Secrets)
來到你的 GitHub 專案頁面：
1. 進入 `Settings` > `Secrets and variables` > `Actions`。
2. 點擊 `New repository secret`，我們要建立兩個專案層級的機密變數：
   * **`DOCKER_HUB_USERNAME`**：填入你的 Docker Hub 帳號。
   * **`DOCKER_HUB_TOKEN`**：填入剛剛複製的那串超長 Token。

> 💡 **小知識：Secrets vs Variables**
> * **Secrets**：用來存儲機密資訊 (如 API 密鑰、資料庫密碼)。存檔後就再也無法觀看明碼，受到最高層級的保護，被應用在需要保密的場景。
> * **Variables**：用來存儲一般設定 (如公開網址、特定參數)。不需要特別保密，是可以公開的配置資訊。

## 3. 撰寫 GitHub Actions 自動化腳本
在你的專案根目錄下，建立 `.github/workflows/docker-image.yml` 檔案 (yml 檔名可自訂)，並貼入以下標準設定：

```yaml
name: Build and Push Docker Image

# 觸發條件：當你在 GitHub 發布標籤開頭為 'v' 的 Release 時 (例如 v1.0.0) 會啟動自動化
on:
  push:
    tags:
      - "v*"

jobs:
  build:
    runs-on: ubuntu-latest # 開啟一台最新的 Ubuntu 虛擬機來幫你代工

    steps:
      # 步驟 1：把你的專案程式碼下載到這台虛擬機裡
      - name: Checkout repository
        uses: actions/checkout@v4

      # 步驟 2：安裝 Buildx (支援跨平台打包的神器)
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 步驟 3：使用剛剛設定好的 Secrets 登入 Docker Hub
      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}

      # 步驟 4：執行終極跨平台打包並自動推送！
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: . # 設定當前目錄為打包範圍
          push: true # 打包完自動 push
          platforms: linux/amd64,linux/arm64 # 同時打包兩種主流架構
          tags: | # 設定 Image 名稱與版本號 (此處的 <your-project-name> 請替換為你的專案名稱)
            ${{ secrets.DOCKER_HUB_USERNAME }}/<your-project-name>:latest
            ${{ secrets.DOCKER_HUB_USERNAME }}/<your-project-name>:${{ github.ref_name }}

      # 步驟 5：安全登出
      - name: Logout from DockerHub
        run: docker logout
```

## 4. 觸發自動化打包流程
1. 將上面的腳本存檔，並執行 `git push` 把所有程式碼推上 GitHub。
2. 在 GitHub 專案主頁面右側，點擊 **Create a new release** (或 Tags)。
3. 建立一個新的 Tag，例如輸入 `v1.0.0`，然後點擊發布 (Publish release)。
4. 發布後，點擊上方導覽列的 **Actions**，你就會看到雲端伺服器正在拼命幫你跨平台打包囉！（⚠️ 注意：因為要模擬切換架構，雲端打包的時間通常會跑個 3 到 5 分鐘，屬於正常現象，請耐心等待）。
5. 等到流程跑完顯示綠勾勾後，回到 Docker Hub 檢視，你的雙架構 Image 就在那裡等你了！🎉

---

## 5. 🎯 進階觀念：兩種自動化部署的觸發流派

你可能會好奇，為什麼上述的腳本是要我們「打上 v 開頭的標籤 (Tag)」才會觸發打包，而不是每次 `git push` 就直接打包呢？在業界實務上，其實有兩種主流做法：

**流派一：Tag 版本發布驅動 (中大型/開源專案最愛)**
* **做法**：工程師平時瘋狂推 code 到 `main` 分支，但這時 **完全不會** 觸發打包。直到團隊覺得「這個版本穩了，可以上線」，才會在 GitHub 手動打上一個 `v1.0.0` 的標籤。這時 GitHub Actions 才會啟動。
* **好處**：Docker Hub 上不會塞滿幾百個零碎測試的 Image，只會留下乾淨、穩定的正式版本號。如果新版出事，維運人員也能快速一鍵退版回上一個穩定的 Tag。

**流派二：推送主分支直接打包 (敏捷開發/持續部署 CD)**
* **做法**：只要任何人把程式碼 `push` 或合併到 `main` 分支，Action 就會 **自動且立刻** 觸發，打包出最新的 Image 並覆蓋掉 Docker Hub 的 `latest` 標籤。
* **好處**：極度自動化！開發者完全不用去管「打標籤發布」這件事，只要 Code 推進主幹，線上伺服器馬上吃到最新功能。（適合小型團隊或快速迭代的新創專案）

> 💡 **想改用「流派二」嗎？**
> 如果你覺得自己開發時每次都要打 Tag 太麻煩，只要把剛剛 `.yml` 檔最上方的觸發條件改為以下這樣即可：
> ```yaml
> on:
>   push:
>     branches:
>       - main  # 只要程式碼進入 main 分支就會觸發打包
> ```
> *(註：若改用此寫法，下方的 tags 設定也要跟著拿掉 `${{ github.ref_name }}`，單純留 `latest` 一行即可)*
