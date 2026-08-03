---
id: 04-data-persistence
title: 資料持久化 (Volumes & Bind Mounts)
sidebar_label: "資料持久化"
sidebar_position: 4

description: "資料持久化 Data Persistence 👉 核心觀念：Docker 容器的特性是「用完即丟 Stateless」。當你刪除容器並重新啟動一個新的時，原本在容器內產生的資料（例如使用者上傳的圖片、資料庫的數據）都會瞬間蒸發！ 為了解決這個問題，特別是對於資料庫 DB 或圖片檔案伺服器，我們必須..."
keywords: [資料持久化, Volumes, Bind, Mounts, learning, docker-notes]
---


# 資料持久化 (Data Persistence)

👉 **核心觀念**：Docker 容器的特性是「用完即丟 (Stateless)」。當你刪除容器並重新啟動一個新的時，原本在容器內產生的資料（例如使用者上傳的圖片、資料庫的數據）都會**瞬間蒸發**！

為了解決這個問題，特別是對於資料庫 (DB) 或圖片檔案伺服器，我們必須將容器內的某個資料夾，與實體主機的儲存空間「連通」起來，這就稱為資料持久化。實務上有兩種主要做法：

1. **Bind Mounts (綁定掛載)**：直接綁定本機上的絕對路徑 (例如你的 Desktop 資料夾)。缺點是會依賴特定的系統路徑，且有機會讓容器操作到主機的敏感檔案 (資安疑慮)，所以通常只在**本地開發熱重載**時使用。
2. **Volumes (資料卷)**：完全交由 Docker 來統一管理儲存空間。這也是**正式環境上線 (Production)** 最推薦且最安全的做法。

---

## 1. 實作 Bind Mounts (本機開發最愛)

Bind Mounts 的概念就是把「你電腦裡的一個實體資料夾」跟「容器裡的一個資料夾」接通。這就像是開了一個任意門，兩邊的檔案變化會完全同步。

### 1-1. 執行掛載指令

在啟動容器時，我們可以使用 `-v` 參數來指定路徑映射。
語法規則是 `-v <本機實體絕對路徑>:<容器內部目標路徑>`：

```bash
# 假設容器內的檔案路徑為：/usr/local/app/dist
# 本機 Mac 的儲存路徑為：/Users/qiuliwen/Desktop/teststorge

docker container run -d \
  --name <myapp> \
  --network <mynetwork> \
  -p 3000:3000 \
  -e MONGODB_URL=mongodb://<my-mongo>/mydatabase \
  -v /Users/qiuliwen/Desktop/teststorge:/usr/local/app/dist \
  <your-image-name>
```

_(💡 小技巧：指令太長時，在終端機可以使用 `\` 來換行以增加可讀性)_

**👉 指令參數詳細拆解：**

- **`-d`**：在背景默默執行 (Detached mode)，不卡住終端機畫面。
- **`--name myapp`**：幫這個跑起來的容器取個好記的名字。
- **`--network mynetwork`**：將這個容器加入你自訂的 Docker 內部網路 (以便與 DB 用名字連線)。
- **`-p 3000:3000`**：Port 映射，將 Mac 本機的 3000 通道，連接到容器內的 3000 通道。
- **`-e MONGODB_URL=...`**：注入環境變數 (Environment Variable)，把資料庫網址餵給 Node.js。
- **`-v /本機路徑:/容器路徑`**：✨ **本章主角！** 執行 Bind Mount 綁定掛載，把這兩個資料夾徹底連通。
- **`<your-image-name>`**：指令的最後一定要放你想啟動的 Image 名稱！

### 1-2. 驗證資料是否永久保留

1. **雙向同步**：這時候，只要你的 Node.js 程式在 `/usr/local/app/dist` 裡寫入了任何新檔案，這個檔案就會**同步出現**在你的 Mac 桌面 `/Users/qiuliwen/Desktop/teststorge` 裡。
2. **無懼刪除**：即使你執行了 `docker stop` 和 `docker rm` 把容器徹底刪除，你桌面上實體資料夾裡面的檔案依然健在！下次只要用同一串 `-v` 指令重新啟動容器，先前的所有資料就會滿血復活。

---

## 2. 實作 Volumes (正式環境推薦)

如果你是要把專案部署到雲端主機 (Production) 上，因為你通常無法精確掌握雲端主機的絕對路徑，也不希望因為路徑寫錯或權限問題導致資料遺失，我們通常會改用 **Volumes** 來做資料持久化。它完全由 Docker 統一管理，這也是業界最安全、最標準的做法！

我們以 MongoDB 為例，實作步驟如下：

### 2-1. 建立 Volume 空間

首先，我們要請 Docker 在它的管轄範圍內，幫我們切出一塊名為 `<mongodb-data>` 的專屬儲存空間：

```bash
# 建立一個新的 volume
docker volume create <mongodb-data>

# (可選) 查看目前所有的 volume 清單
docker volume ls
```

### 2-2. 啟動容器並掛載 Volume

接著，我們要在啟動 MongoDB 的時候，把這塊剛建好的 `<mongodb-data>` 空間，對應到 MongoDB 在容器內部存放數據的真實路徑。

> 💡 **小知識**：每一種服務存放資料的路徑都不一樣！以 MongoDB 為例，官方預設的存放路徑固定是 `/data/db`。

我們一樣使用 `-v` 參數，但這次左邊**不再寫本機實體路徑**，而是直接寫我們剛剛建好的 **Volume 名稱**：

```bash
# 語法：-v <Volume名稱>:<容器內部路徑>
docker run -d \
  --name <my-mongo> \
  --network <my-network> \
  -v <mongodb-data>:/data/db \
  mongo:latest
```

**👉 指令參數詳細拆解：**

- **`-d`**：在背景執行，不卡住終端機畫面。
- **`--name <my-mongo>`**：幫資料庫容器取個名字，未來 Node.js 專案才能透過名字找到它。
- **`--network <my-network>`**：加入先前建好的自訂網路，開啟容器間的內部通訊。
- **`-v <mongodb-data>:/data/db`**：✨ **本章主角！** 將剛剛請 Docker 建好的 `mongodb-data` 虛擬空間，掛載到容器內部存放實體資料的 `/data/db` 路徑上。
- **`mongo:latest`**：指令最後放上要啟動的 Image 官方名稱與版本標籤。

### 2-3. 驗證資料是否永久保留

完成了！有了 Volume 加持後，這台 MongoDB 無論你是關閉 (`docker stop`) 還是直接把容器刪除 (`docker rm`)，裡面儲存的會員資料都不會不見！

下次只要用同樣的 `-v <mongodb-data>:/data/db` 指令啟動一個全新的 mongo 容器，它就會自動接手先前的所有數據，達到「容器可隨便丟，資料永生不死」的完美境界。

推薦靜態檔案使用Bind Mounts，DB使用Volume，但沒有絕對，可以自己選擇