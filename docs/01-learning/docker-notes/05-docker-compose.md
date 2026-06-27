---
id: 05-docker-compose
title: 終極殺器：Docker Compose
sidebar_label: "\u200B5 Docker Compose"
sidebar_position: 5
---

# 終極殺器：Docker Compose

👉 **核心痛點**：回想一下，為了把這個 Node.js 專案跑起來，我們手動敲了多少指令？
建 Network、建 Volume、`docker run` MongoDB 並且加上一大串參數、最後再 `docker run` Node.js 並帶上落落長的環境變數跟網路設定... **「指令又臭又長，根本記不住！」**

為了讓開發與部署變得優雅，Docker 官方推出了 **Docker Compose**，它可以把所有的基礎設施設定（Network, Volume, Container 參數）全部寫進一個 `.yml` 檔案裡，從此以後只需要一行指令就能一鍵啟動整個宇宙！

## 1. 建立 `docker-compose.yml` 檔案

在專案根目錄下，建立一個名為 `docker-compose.yml` 的檔案。官方有提供一個專門收集常用架構的 GitHub 專案 [Awesome Compose](https://github.com/docker/awesome-compose) 供大家複製參考（例如：[Node + Mongo 範例](https://github.com/docker/awesome-compose/blob/master/react-express-mongodb/compose.yaml)）。

我們將剛剛手動敲的所有指令，轉譯成以下優雅的設定檔：

```yaml
version: "3.8" # Docker Compose 的語法版本

services:
  # ------------------------------------
  # 第一個服務：Node.js 後端應用程式
  # ------------------------------------
  myapp:
    # 選擇 1：自己打包 (本機開發用) -> 告訴 Docker 請在當前目錄 (.) 尋找 Dockerfile 打包
    build: .
    # 選擇 2：直接從雲端拉取 (同事部署用) -> 將上方 build: . 刪除，改用 image 標籤
    # image: <你的DockerHub帳號>/<專案名稱>

    restart: always # 無論當機還是主機重開，都自動幫我重啟
    ports:
      - "3000:3000" # 對應本機 Port
    environment:
      # ⚠️ 資安提醒：千萬別把密碼或連線網址寫死在 yml 裡！請使用 ${變數名稱} 來讀取 .env 檔
      - MONGODB_URL=${MONGODB_URL}
    depends_on:
      - my-mongo # 告訴 Docker：請等資料庫啟動完，再來啟動我
    networks:
      - my-network
    volumes:
      # 1. 本地開發最必備！使用 Bind Mounts 讓你改 Code 瞬間熱重載
      - ./:/usr/local/app
      # 2. 🛡️ 護身符(匿名掛載)：保護容器內的 node_modules 不被外部的 Mac/Windows 系統套件覆蓋
      - /usr/local/app/node_modules

  # ------------------------------------
  # 第二個服務：MongoDB 資料庫
  # ------------------------------------
  my-mongo:
    image: mongo:latest
    restart: always
    networks:
      - my-network
    volumes:
      # 極度重要！把資料庫檔案掛載到 Volume，確保資料永生不死
      - mongodbdata:/data/db

# ========================================
# 以下為「基礎設施」宣告區，供上方 services 呼叫
# ========================================
networks:
  my-network: # 宣告一個名為 my-network 的自訂網路

volumes:
  mongodbdata: # 宣告 mongodbdata 空間 (Bind Mounts 不用寫在這)
```

> 💡 **進階防坑技巧：為什麼要多寫一行 `node_modules`？**
> 
> 在實務上，如果團隊裡有 Windows 或 Mac 的同事，他們不小心在本機執行了 `npm install`，就會產生「專屬 Windows/Mac 架構」的 `node_modules` 套件（例如 `bcrypt` 底層是 C++ 寫的，不同作業系統不能混用）。
> 如果只寫 `- ./:/usr/local/app`，這些外來系統的套件會直接把 Docker 裡面 Linux 專用的套件**蓋掉**，導致容器當機報錯！
> 
> 為了解決這個問題，我們必須加上 `- /usr/local/app/node_modules` 這個**匿名掛載 (Anonymous Volume)**。這行咒語的意思是告訴 Docker：「除了 `node_modules` 以外，其他程式碼都用外面電腦的；但 `node_modules` 請保留我 Docker 自己用 Linux 核心編譯出來的純淨版本！」
> 這招在實戰中是保命等級的護身符！

## 2. 一鍵啟動魔法指令

有了這個設定檔，未來不論是你要在本機測試，還是要把專案交給同事部署，都只要在該目錄下敲一行指令：

```bash
# 一鍵自動打包、建網路、建 Volume 並在背景啟動所有容器！
docker compose up -d
```
