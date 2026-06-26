---
id: 02-docker-build-image
title: 建立自訂 Image 與 Dockerfile 實戰
sidebar_label: "\u200B2 建立 Image (Dockerfile)"
sidebar_position: 2
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
*(此時可以在 `http://localhost:3000` 看到網頁)*

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
*(重新啟動專案，應該就能在終端機看到環境變數成功印出)*

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
*(💡 提示：實務上一定會把 `.env` 忽略，避免機密資料被死死包進 Image 中)*

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
- *參考資料：[官方 Dockerfile 範例](https://docs.docker.com/get-started/workshop/02_our_app/)*

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
   - *(註：常見縮寫為 `docker build`)*。
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
