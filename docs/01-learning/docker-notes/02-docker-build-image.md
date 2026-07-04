---
id: 02-docker-build-image
title: 建立自訂 Image 與 Dockerfile 實戰
sidebar_label: "建立 Image (Dockerfile)"
sidebar_position: 2

description: "建立自訂 Image 與 Dockerfile 實戰 這篇筆記將透過打包一個 Node.js Express 專案，來學習如何撰寫 Dockerfile 以及如何正確處理環境變數。 1. 準備 Node.js 測試專案 步驟一：建立 Express 專案 使用 expressgenerator 快速..."
keywords: [建立自訂, Image, Dockerfile, 實戰, learning, docker-notes]
---

# 建立自訂 Image 與 Dockerfile 實戰

這篇筆記將透過打包一個 Node.js Express 專案，來學習如何撰寫 `Dockerfile` 以及如何正確處理環境變數。

## 1. 準備 Node.js 測試專案

**步驟一：建立 Express 專案**
使用 `express-generator` 快速產出一個專案：

```bash
npx express-generator --view=ejs dockerImagetest
cd dockerImagetest
```

**步驟二：安裝依賴並運行**

```bash
npm install
npm start
```

_(此時可以在 `http://localhost:3000` 看到網頁)_

**步驟三：加入環境變數設定**
在專案根目錄建立 `.env` 檔案，用來存放環境變數：

```env
TEXT=NODE專案的環境變數
```

接著安裝 `dotenv` 套件：

```bash
npm install dotenv
```

在 `/routes/index.js` 頂部引用 `dotenv` 來讀取變數，並印出或傳給前端：

```javascript
require("dotenv").config();
const { TEXT } = process.env;
console.log("目前的 TEXT 是：", TEXT);
```

_(重新啟動專案，應該就能在終端機看到環境變數成功印出)_

---

## 2. Docker Image 的三大來源

在開始打包前，先了解我們手上的 Image 通常從哪裡來：

1. **Docker Hub**：官方或社群公開的儲存庫 (例如 `nginx:alpine`)。
2. **Dockerfile**：自己寫腳本，直接在本機建構出專屬的 Image。
3. **tar 壓縮檔**：不想公開在網路上時，透過 `docker save` 匯出打包，再交給別人透過 `docker load` 匯入。

---

## 3. 撰寫 Dockerfile 與 .dockerignore

### 步驟一：建立 `.dockerignore` (⚠️ 非常重要)

在打包前，**務必**在專案根目錄建立 `.dockerignore` 檔案，並把 `node_modules` 寫進去。
如果不這麼做，Docker 會把原本電腦裡幾百 MB 的 `node_modules` 全部複製進去，導致打包極慢且 Image 超級肥大！

```text
# .dockerignore 內容
node_modules
.env
```

_(💡 提示：實務上一定會把 `.env` 忽略，避免機密資料被死死包進 Image 中)_

### 步驟二：撰寫 Dockerfile

在專案根目錄建立名為 `Dockerfile` (無副檔名) 的檔案：

```dockerfile
# 1. 指定要跑的基礎環境
FROM node:24-alpine

# 2. 建立並切換到容器內的工作目錄
WORKDIR /app

# 3. 把本機當前目錄的所有檔案，複製到容器的 /app 裡面
COPY . .

# 4. 執行安裝依賴 (會根據 package.json 重新安裝屬於 Linux 環境的套件)
RUN npm install

# 5. 文件化：宣告這個容器預計會使用的 Port
EXPOSE 3000

# 6. 容器啟動時預設執行的指令 (啟動 Container 時才會跑)
CMD ["npm", "start"]
```

- _參考資料：[官方 Dockerfile 範例](https://docs.docker.com/get-started/workshop/02_our_app/)_

---

## 4. 打包與運行 (Build & Run)

### 打包成 Image

回到有 `Dockerfile` 的那一層目錄，執行打包指令：

```bash
docker image build -t dockerimagetest .
```

**👉 指令詳細拆解：**

1. **`docker image build`**：
   - 告訴 Docker：「我要依照 Dockerfile 的腳本內容，來建構一個新的映像檔 (Image)」。
   - _(註：常見縮寫為 `docker build`)_。
2. **`-t dockerimagetest`**：
   - `-t` 代表 Tag (標籤)。用來幫你做出來的 Image 取一個好記的名字（在這裡名字叫 `dockerimagetest`）。
   - 如果不加 `-t`，生出來的 Image 名稱跟標籤都會變成 `<none>`，未來會很難找。
3. **`.` (一個小數點)**：
   - **這是新手最容易漏打的符號！** 小數點代表 **「當前目錄 (Current Directory)」**。
   - 它的作用是告訴 Docker：「請以我現在終端機所在的資料夾當作工作環境，去讀取裡面的 `Dockerfile`，並把這個資料夾內的檔案 `COPY` 進去打包」。

### 檢查並運行

打完包後，可以透過以下指令驗證與運行：

```bash
# 1. 檢查 Image 是否成功建立
docker image ls

# 2. (進階) 查看 Image 的詳細內容與架構
docker image inspect dockerimagetest

# 3. 運行專案，把本機的 30001 映射到容器的 3000
docker container run -p 30001:3000 dockerimagetest
```

打開瀏覽器進入 `localhost:30001`，就能看到跑在 Docker 裡面的 Express 專案了！

---

## 5. 環境變數處理 (ENV vs 執行期傳入)

當我們把專案打包成 Image 後，如果程式碼裡面有使用 `process.env.TEXT`，該怎麼把值傳給容器？

### ❌ 不建議的做法：寫死在 Dockerfile

雖然 Dockerfile 支援 `ENV` 指令，但這樣做會把變數「寫死並暴露」在 Image 的歷史紀錄中，如果裡面放的是資料庫密碼或 API Key，非常不安全。

```dockerfile
# 把環境變數寫進去（很不安全，強烈不建議這樣包機密資訊）
ENV TEXT="DOCKERFile傳入的環境變數"
```

### ✅ 正確做法：運行時 (Run) 動態傳入

我們應該在啟動容器時，使用 `-e` 參數動態把環境變數塞進去：

```bash
docker container run -p 30001:3000 -e TEXT="DOCKER RUN 傳入的環境變數" dockerimagetest
```

這時如果你看終端機的 log，就會發現 `TEXT` 的值已經成功被替換成你剛剛傳入的字串了！
這正是 Docker 的精髓：**Image 只包程式碼，機密與環境參數等運行時再注入**，這樣同一個 Image 就能輕易部署到測試機與正式機！

---

## 6. 發布到 Docker Hub (與世界分享你的 Image)

當我們在本機打包好 Image 後，可以將它推送到 Docker Hub (就像是 Docker 界的 GitHub)，這樣其他人或你的雲端主機就能直接下載使用了。

### 步驟一：終端機登入 Docker Hub

在推送之前，必須先在終端機登入你的 Docker Hub 帳號：

```bash
docker login
```

_(輸入帳號密碼後，看到 `Login Succeeded` 代表登入成功)_

### 步驟二：使用帳號名稱重新標記 (Tag) 你的 Image

Docker Hub 有個嚴格的規定：**Image 的名稱前面必須加上你的帳號 ID**，否則系統會不知道這個 Image 屬於誰的倉庫。
所以在建構時，我們必須修改原本的 `-t` 命名規則：

```bash
# 格式：docker image build -t <你的帳號ID>/<專案名稱> .
docker image build -t your_dockerhub_id/dockerimagetest .
```

_(💡 提示：如果你原本已經打包好了，也可以事後用 `docker tag` 指令幫舊的 Image 貼上新的帳號標籤)_

### 步驟三：推送 (Push) 到雲端

確認 Image 冠上了你的帳號名稱後，就能將它上傳到 Docker Hub：

```bash
docker image push your_dockerhub_id/dockerimagetest
```

### 步驟四：從雲端下載並運行 (Pull & Run)

上傳成功後，任何人（包含你剛租好的雲端主機）都可以透過以下指令把這個 Image 拉下來：

```bash
# 單純下載 Image
docker pull your_dockerhub_id/dockerimagetest
```

更方便的是，如果你在一台全新的電腦上直接執行 `docker run`，Docker 如果發現本機找不到這個 Image，它會**自動去 Docker Hub 幫你拉下來並直接啟動**！

```bash
# 自動拉取並啟動，順便注入環境變數
docker container run -d -p 30001:3000 -e TEXT="來自 Docker Hub 的專案" your_dockerhub_id/dockerimagetest
```

---

## 6. 進階：跨平台多架構打包 (Multi-arch Build)

當你在 Mac (尤其是 M1/M2/M3 等 ARM 晶片) 上打包 Image 時，預設打包出來的就是 ARM 架構版本。如果別人用的是 Windows (AMD64)，或是你的雲端伺服器 (VM) 剛好是 x86 (AMD64) 架構，拉取這個 Image 啟動時就會報錯。

為了解決這個問題，我們可以使用 Docker 官方提供的 **[Buildx](https://docs.docker.com/reference/cli/docker/buildx/)** 工具，一次打包出能同時支援兩種 CPU 架構的 Image！

> 💡 **提示**：如果你使用的是 Docker Desktop，`buildx` 工具已經自動內建安裝好了！若是純 Linux 環境則需另行安裝。

### 步驟一：建立多架構建構器 (Builder)
原本預設的 Docker 打包環境不支援同時化編譯多架構，所以我們必須先建立一個專屬的建構器：

```bash
# 1. 查看目前有哪些建構器 (預設通常只有 default)
docker buildx ls

# 2. 建立一個支援多架構的新建構器，命名為 multi-arch-builder，並指定使用它
docker buildx create --name multi-arch-builder --use
```
*(注意：如果不執行這步建立專屬 Builder，下一步的多架構打包指令將會報錯)*

### 步驟二：打包並直接推送到 Docker Hub
有了跨平台建構器後，就能用 `--platform` 參數指定架構。
**⚠️ 重要觀念：** 多架構打包無法單純只存在本機 Docker 裡，你必須加上 `--push`，讓它打包完後**直接上傳到 Docker Hub** 做封裝整合。

請在專案資料夾內執行：

```bash
# 同時打包 ARM64 與 AMD64 版本，並推送到 Docker Hub
docker buildx build --platform linux/arm64,linux/amd64 -t your_dockerhub_id/dockerimagetest . --push
```

成功推上去後，如果你去登入 Docker Hub 網頁版查看這個 Image 的 Tags，就會發現它標示了多種 `OS/ARCH`。這代表未來不管是 Mac、Windows 還是 Linux 伺服器去 `docker pull`，Docker 都會「自動判斷」並下載最正確的架構版本！

_(實務補充：因為多架構打包非常耗費本機 CPU 算力，業界通常會將這段指令寫在 GitHub Actions 裡，交給雲端機器去自動打包與推送。)_