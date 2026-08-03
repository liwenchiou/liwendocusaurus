---
id: 03-cloud-and-network
title: 雲端部署與網路實戰 (Cloud & Network)
sidebar_label: "雲端與網路實戰"
sidebar_position: 3

description: "雲端部署與網路實戰 Cloud & Network 在我們學會了如何把應用程式打包成 Docker Image 後，這篇筆記將探討實務上「伺服器該租在哪裡」、「雲端架構的選擇」，以及最核心的「多個 Docker 容器之間該如何透過 Network 互相通訊」。 1. 雲端三大核心服務 不論是哪一家雲..."
keywords: [雲端部署與網路實戰, Cloud, Network, learning, docker-notes]
---


# 雲端部署與網路實戰 (Cloud & Network)

在我們學會了如何把應用程式打包成 Docker Image 後，這篇筆記將探討實務上「伺服器該租在哪裡」、「雲端架構的選擇」，以及最核心的「多個 Docker 容器之間該如何透過 Network 互相通訊」。

## 1. 雲端三大核心服務

不論是哪一家雲端供應商 (AWS, GCP, Azure)，底層架構基本上都圍繞著這三個核心在運作：

1. **VM (虛擬機 / Compute 運算資源)**
   - **特性**：注重「運算能力」與「無狀態 (Stateless)」。
   - **觀念**：機器壞了或流量過載時，通常不花時間修復，而是直接「殺掉重開一個新的」。這也是為什麼 Docker 容器非常適合跑在 VM 上的原因。
2. **DB (資料庫 / Database)**
   - **特性**：注重「資料持久化 (Stateful)」與「備份機制」。
   - **觀念**：資料庫是整個系統的心臟，壞了絕對不能隨便重置，通常會有嚴格的備援機制 (Backup) 與主從複製架構。
3. **Storage (儲存空間 / Object Storage)**
   - **特性**：專門用來存放「靜態檔案」(如圖片、影片、使用者上傳的附件、前端打包好的靜態網頁)。
   - **觀念**：例如著名的 AWS S3。它的特色是極度便宜且容量無限擴充，適合存放大容量的死檔案，藉此減輕 VM 的負擔。

---

## 2. 雲端服務的四種層級 (XaaS)

隨著雲端技術的演進，基礎設施的「代管程度」被分成了不同的層級。代管程度越高，工程師的維護成本越低，但系統彈性會變小、單價也可能相對較高。

### 1. IaaS (Infrastructure as a Service - 基礎設施即服務)

- **代表服務**：AWS EC2、GCP Compute Engine、DigitalOcean Droplets。
- **特色**：
  - **全都自己管**：廠商只提供你「空的硬體/虛擬機」，工程師要自己灌作業系統、自己裝 Docker、自己設定防火牆與網路。
  - **計價最細**：單項計價（CPU 多少錢、流量多少錢），可以把成本拆得很細，通常是大型企業架構龐大時最靈活、最省錢的做法。

### 2. PaaS (Platform as a Service - 平台即服務)

- **代表服務**：Heroku、Render、Vercel、Zeabur。
- **特色**：
  - **廠商代管環境**：你只需要「把程式碼 Push 上去」，廠商會自動幫你打包、建立環境並啟動伺服器。
  - **適合初期專案**：通常主應用 + DB 可以綁在一起租用，一個月大約只要付 5~7 美金起跳，非常適合個人開發者或驗證想法的 MVP 專案。
  - **缺點**：如果系統架構變複雜（例如要跑好幾個微服務），PaaS 的單價疊加起來會非常昂貴；且底層環境被廠商限制死，特殊需求的擴展較不便。

### 3. CaaS (Container as a Service - 容器即服務) 🐳

- **代表服務**：GCP Cloud Run、AWS ECS、Google Kubernetes Engine (GKE)。
- **特色**：
  - **專為 Docker 設計的服務**，介於 IaaS 與 PaaS 之間。
  - **你提供 Image，他提供算力**：你不需要去管底層的作業系統，只要把打包好的 Docker Image 丟給廠商，他就會幫你跑起來。
  - **自動擴展 (Auto-scaling)**：CaaS 最大的優勢是能根據當下流量自動增加或減少容器數量，流量掛零時甚至可以縮減到 0 (不收費)。

### 4. SaaS (Software as a Service - 軟體即服務)

- **代表服務**：Google Workspace (Gmail)、Notion、Figma、GitHub。
- **特色**：
  - 面向「最終使用者 (End-Users)」，不需要寫任何程式碼，只要打開瀏覽器或 App，訂閱後就能直接使用完整的軟體服務。

---

## 3. 雲端主機的「區域 (Region)」選擇策略

當你決定好要租用哪一種雲端服務後，下一步就是選擇伺服器要放在地球上的哪個位置。以下是幾個實務上非常重要的區域選擇原則：

### 1. 價格與延遲的取捨

- **美國區最便宜**：通常來說，亞洲區的機器租金會明顯大於美國區。為了節省成本，很多專案初期預設都會租用美國的主機 (例如 `us-east` 或 `us-west`)。
- **追求低延遲選日本**：如果你的主要客群在台灣，且對於網頁載入速度要求很高，通常會選擇**日本 (Tokyo)** 或新加坡，在速度與穩定性上的表現最好。

### 2. 核心元件「必須」放在同一個區域 (VM + DB) 🔴

- **絕對不要跨區配置**：有些新手會為了省錢把 DB 放在美國，為了速度把 VM 放在日本，這是一場災難。
- **背後原理**：使用者 (User) 點擊網頁向 VM 發出請求時，兩者之間只有「1 次」網路來回；但 VM 為了組合出這頁的資料，可能會向 DB 發出「幾十甚至上百次」的查詢！
- **結論**：如果 VM 跟 DB 不在同一個區域，光是這幾百次的跨國連線延遲就會讓網頁慢到無法開啟，而且雲端供應商還會向你收取高額的「跨區流量費」。所以 **VM 跟 DB 一定要綁死在同一個區域**。

### 3. 靜態檔案可以就近存放 (Storage / CDN)

- **Storage 的配置彈性**：相對於不能分開的 VM 與 DB，專門存放靜態檔案（圖片、影片、大檔）的 Storage 就可以選擇放在離使用者近一點的區域。
- **進階做法**：實務上更常使用 **CDN (內容遞移網路)** 來快取這些靜態檔案，讓全世界的使用者都能從離自己最近的節點快速載入圖片，藉此減輕伺服器負擔。

---

## 4. 實戰：租用雲端主機與基礎操作

當我們真正在雲端租用了一台 VM（例如 AWS EC2 或 DigitalOcean）後，會經歷以下幾個必備的實戰步驟：

### 1. 踩坑預防：設定帳單預警 💸

- **第一件要做的事**：無論用哪家雲端，註冊完綁定信用卡後，**「第一步絕對是去設定 Billing Alarm (帳單預警)」**。
- **好處**：設定當月花費超過 $5 或 $10 美金就發信通知，這樣就不怕被惡意攻擊或自己忘記關機器，導致月底收到天價帳單。

### 2. 安全連線：SSH Key 登入

租好主機後，我們需要遠端連線進去操作。

- **連線方式**：
  1. **Web Console**：雲端服務商通常會提供網頁版的終端機直接連線 (適合應急)。
  2. **SSH 連線 (推薦)**：在自己的電腦終端機輸入 `ssh user@<伺服器IP>` 來連線。
- **安全性**：強烈建議使用 **SSH Key (公私鑰)** 進行登入，這比單純輸入密碼安全非常多，也能防範暴力破解，是業界的標準做法。

### 3. 必備的 Linux 基礎指令

雲端主機高達 99% 都是 Linux 環境 (通常是 Ubuntu 或 Debian)，且沒有圖形介面，所以必須熟悉以下幾個指令：

- `mkdir <name>`：建立新資料夾。
- `ls`：列出當前目錄下的所有檔案與資料夾。
- `cat <name>`：印出並查看檔案內容。
- `vi <name>`：使用內建的 Vim 編輯器來修改檔案 (若檔案不存在會自動建立)。
  - `i`：進入 Insert (插入) 模式開始打字。
  - `Esc`：退出插入模式。
  - `:wq`：存檔 (write) 並離開 (quit)。

### 4. 在主機上安裝 Docker

準備好環境後，就可以為這台全新的 Linux 主機安裝 Docker 引擎了。

- 由於各個 Linux 發行版的安裝指令略有不同，請直接參考 [Docker 官方安裝指南](https://docs.docker.com/engine/install/)，選擇對應的系統照著複製貼上指令即可。

### 5. 驗證：部署 Nginx 服務

安裝好 Docker 後，我們可以執行以下指令來測試這台雲端主機是否正常運作：

```bash
docker run -d -p 80:80 nginx
```

只要終端機沒有報錯，此時打開瀏覽器輸入這台主機的 `公網 IP`，如果能順利看到 Nginx 的 `Welcome to nginx!` 畫面，就代表你的雲端部署初體驗大功告成啦！

---

## 5. Docker 網路通訊 (Network) 踩坑實戰

當我們開始在 Docker 裡面同時跑多個服務（例如「Node.js 應用程式」跟「MongoDB 資料庫」）時，必定會遇到網路互相連線的問題。這裡我們來還原新手最常踩的坑。

### 踩坑還原：為什麼 `localhost` 連不上？

**1. 啟動 MongoDB 容器**
我們先在 Docker 中拉取並啟動一個 MongoDB 資料庫：

```bash
docker run -d -p 27017:27017 mongo:latest
```

**2. 啟動專案容器並連線**
在平時本機開發時，資料庫連線網址通常是寫 `mongodb://localhost:27017`。所以我們很自然地把它當作環境變數傳給打包好的專案：

```bash
docker container run -d -p 3000:3000 -e MONGODB_URL=mongodb://localhost:27017/mydatabase <your-image-name>
```

**3. 💥 發生錯誤：連線失敗！**
這時打開網頁，你會發現後端狂報錯，根本連不到資料庫！
👉 **核心觀念**：在 Docker 的世界裡，每一個容器 (Container) 都是一台「獨立且隔離的小電腦」。當你在 Node.js 容器裡面設定連線到 `localhost` 時，它尋找的是「Node.js 容器自己內部的 27017 port」，而不是你的 Mac 本機，當然也就找不到隔壁那台 MongoDB 容器！

### 解法：找出 MongoDB 容器的內部真實 IP

既然不能用 `localhost`，我們就必須找出 MongoDB 在 Docker 內部橋接網路 (Bridge Network) 裡，被分配到的真實 IP。

**1. 查詢 MongoDB 容器的 IP**
先用 `docker ps` 拿到 MongoDB 的 Container ID，然後使用 `inspect` 指令查看它的底層詳細資訊：

```bash
docker container inspect <MongoDB_Container_ID>
```

在輸出的超長 JSON 格式中，滑到最下面找到 `NetworkSettings` -> `IPAddress`，你可能會看到類似 `172.17.0.3` 這樣的內部虛擬 IP。

**2. 修改環境變數，重新啟動專案**
拿到真實 IP 後，我們把原本的 `localhost` 替換掉，重新啟動專案容器：

```bash
docker container run -d -p 3000:3000 -e MONGODB_URL=mongodb://172.17.0.3:27017/mydatabase <your-image-name>
```

這次網頁打開，就能完美連線到隔壁的資料庫了！

---

### 終極解法：自訂 Docker Network (用名字互相連線)

雖然前面我們透過 `172.17.0.3` 成功連線了，但這組 IP 是 Docker 預設網路隨機分配的。**最大缺點是：每次容器重啟，IP 都可能會改變，每次都要重查非常麻煩！**

為了解決這個痛點，我們可以自己建立一個專屬的 **Docker Network**。在自訂的 Network 裡面，Docker 會自動開啟「DNS 名稱解析」功能，讓我們可以直接用**容器的名字**來連線！

> 📌 **語法小提醒**：以下的指令中，只要是被 `< >` 括號包起來的內容（例如 `<my-network>`, `<my-mongo>`, `<my-app>` 等），都代表「可以由你自己隨意命名的變數」，實作時請記得將括號與內容替換成你想要的名稱喔！

**1. 查看與建立 Network**
我們先來查看目前有哪些網路，並建立一個專屬的內部網路：

```bash
# 查看目前的 network 清單
docker network ls

# 建立一個自己的 network
docker network create <my-network>
```

**2. 將 MongoDB 放進自訂網路並命名**
啟動資料庫時，加入 `--network` 指定網路，並用 `--name` 給它取個好記的名字：

```bash
# 注意：--name 跟 --network 前面都是兩個減號 (-)
docker run -d --name <my-mongo> --network <my-network> -p 27017:27017 mongo:latest
```

**3. 將專案放進同網路，並直接用名字連線！**
現在，最神奇的事情來了！啟動專案容器時，我們一樣把它丟進 `<my-network>`。此時在寫資料庫連線網址時，**不用再寫醜醜的 IP 了，直接寫 `<my-mongo>`**：

```bash
docker container run -d --name <my-app> --network <my-network> -p 3000:3000 -e MONGODB_URL=mongodb://<my-mongo>:27017/mydatabase <your-image-name>
```

> 💡 **原理解析**：因為兩個容器都在同一個 `<my-network>` 裡面，當 Node.js 試圖尋找 `<my-mongo>` 時，Docker 底層的 DNS 會自動幫你把它翻譯成正確的最新內部 IP。這樣一來，不論容器未來怎麼重啟，只要名字不變，連線就永遠不會斷！這也是業界最標準的部署做法。

---

### 🎯 進階補充：關於 Port 的兩個網路冷知識

**1. 連線網址中的 `:27017` 可以省略嗎？**
在上述的 `MONGODB_URL=mongodb://<my-mongo>:27017/mydatabase` 中，其實把 `:27017` 拿掉也是可以運作的（因為 27017 是 MongoDB 預設的 Port，Mongoose 等套件會自動補上）。但實務上**強烈建議保留寫出來**，因為這樣能讓其他接手專案的人一眼確認服務是跑在哪個通道上。

**2. 同網路內的容器，不需要 `-p` 也能互通！ (資安小技巧)**
這是一個非常核心的 Docker Network 觀念：**只要兩個容器被放進同一個自訂網路裡，它們彼此之間的所有 Port 預設都是全開、無障礙互通的！**

這代表你在啟動 MongoDB 時，如果把指令改為這樣：
```bash
# 拿掉 -p 27017:27017
docker run -d --name <my-mongo> --network <my-network> mongo:latest
```
此時 Node.js **依然可以連線成功**！我們當初之所以加 `-p 27017:27017`，單純只是為了讓你能夠從你自己的 Mac 本機（Host）打開 GUI 軟體 (如 MongoDB Compass) 連進去查看資料。

如果專案上線後，你不需要從外部直接操作資料庫，建議把 `-p` 拿掉！這樣資料庫就會完全被隱藏在 Docker 的內部網路裡，不會暴露在公網中，安全性會大幅提升！