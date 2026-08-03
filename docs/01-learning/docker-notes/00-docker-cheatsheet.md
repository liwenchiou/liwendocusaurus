---
id: 00-docker-cheatsheet
title: Docker 常用指令與生命週期速查表
sidebar_label: "指令速查表"
sidebar_position: 0

description: "Docker 常用指令與生命週期速查表 這份速查表整理了 Docker 在實務中最常用的指令，並且依照「基礎操作」與「容器生命週期狀態」進行分類，方便開發時快速查找。 1. 基礎與 Image 指令速查 | 指令 Command | 用途與說明 | | : | : | | docker versio..."
keywords: [Docker, 常用指令與生命週期速查表, learning, docker-notes]
---


# Docker 常用指令與生命週期速查表

這份速查表整理了 Docker 在實務中最常用的指令，並且依照「基礎操作」與「容器生命週期狀態」進行分類，方便開發時快速查找。

## 1. 基礎與 Image 指令速查

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker version` | 查看 Docker 引擎版本與系統詳細規格 |
| `docker image build -t <名稱> .` | 根據當前目錄的 Dockerfile 打包建立新的 Image |
| `docker image ls` | 顯示目前本地端已下載或打包的所有映像檔清單 |
| `docker login` | 登入 Docker Hub 帳號 (推播 Image 前必備) |
| `docker image push <帳號/名稱>` | 將本機打包好的 Image 推送到 Docker Hub |
| `docker image pull <帳號/名稱>` | 從 Docker Hub 下載指定的映像檔 |
| `docker image rm <IMAGE ID>` | 刪除指定的映像檔 (須確認無容器正在使用該映像檔) |

## 2. Container 生命週期狀態與對應指令

容器從建立到銷毀會經歷多個狀態，下表列出了每個狀態與切換該狀態的常用指令。

| 目標狀態 (State) | 執行指令 | 說明 |
| :--- | :--- | :--- |
| **Created** (已建立) | `docker container create <IMAGE>` | 僅建立容器但不啟動 (實務上較少單獨使用) |
| **Running** (運行中) | `docker container run -d -p 80:80 <IMAGE>` | **最常用！**一條龍完成「建立」並在「背景運行」 |
| | `docker container start <CONTAINER ID>` | 將「已經停止」的容器重新啟動 |
| **Paused** (暫停) | `docker container pause <CONTAINER ID>` | 暫停容器的所有運算程序 (釋放 CPU 資源) |
| | `docker container unpause <CONTAINER ID>` | 解除暫停，恢復運行 |
| **Stopped** (已停止) | `docker container stop <CONTAINER ID>` | 安全停止一個運行中的容器 |
| **Restarting** (重啟) | `docker container restart <CONTAINER ID>` | 重新啟動容器 (等同於幫容器關機再開機) |
| **Removing** (徹底刪除) | `docker container rm <CONTAINER ID>` | 徹底刪除已停止的容器 |
| | `docker container prune -f` | **大掃除指令！**一鍵刪除「所有未啟用」的容器 |

## 3. Container 日常查詢與進階除錯

當容器處於 **Running** 狀態時，工程師最常使用以下指令來進行觀察或問題排查：

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker container ls` | 查看目前**正在運行**的 Container 清單 (同 `docker ps`) |
| `docker container ls -a` | 查看**所有**的 Container 清單 (包含已經停止的) |
| `docker container exec -it <ID> sh` | **實務最常用！**新開一個終端機進入 Container 內部下指令 |
| `docker container attach <ID>` | **監看** Container 的即時輸出 (⚠️ 按 Ctrl+C 會關閉服務) |
| `docker container inspect <ID>` | 查詢該容器的完整規格、內部設定、環境變數或掛載路徑 |

## 4. Docker 網路 (Network) 指令

當需要讓多個容器 (例如 Node.js 專案與 MongoDB) 可以直接用「名字」互相連線時，必須使用自訂網路。

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker network ls` | 查看目前 Docker 內所有的網路清單 |
| `docker network create <名稱>` | 建立一個全新的自訂網路 (Bridge Network) |
| `... run --network <名稱>` | 在啟動容器時，透過此參數將容器加入指定的網路中 |
| `... run --name <名字>` | 幫啟動的容器自訂名稱，同網路下的其他容器可直接用此名稱互相連線 |

## 5. Docker 儲存空間 (Volume) 指令

當需要確保容器刪除後，資料庫或上傳的檔案依然能被保留時（資料持久化），必須透過 Volume 來管理儲存空間。

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker volume ls` | 查看目前所有的 Volume 空間清單 |
| `docker volume create <名稱>` | 建立一個全新的 Volume 儲存空間 |
| `docker volume rm <名稱>` | 刪除指定的 Volume 空間 (須確認目前沒有任何容器正在掛載使用它) |
| `docker volume prune -f` | **大掃除指令！** 一鍵刪除所有「沒有被任何容器掛載」的閒置 Volume |
| `... run -v <Volume名稱>:<容器內部路徑>` | 在啟動容器時，將該 Volume 空間掛載到指定的容器內部路徑 |

## 6. 跨平台多架構打包 (Buildx) 指令

解決 Mac (ARM 架構) 打包出來的 Image，在 Windows / Linux 伺服器 (AMD64) 上無法運行報錯的進階工具。

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker buildx ls` | 查看目前的打包建構器 (Builder) 清單 |
| `docker buildx create --name <名稱> --use`| 建立並切換到一個支援多架構打包的「專屬建構器」 |
| `docker buildx build --platform <平台> -t <名稱> . --push` | 執行多架構打包 (例如 `linux/arm64,linux/amd64`)，並強制規定必須加上 `--push` 直接推送到 Docker Hub |

## 7. Docker Compose 指令

當專案需要同時啟動多個容器 (例如 Node.js + MongoDB) 時，透過撰寫 `docker-compose.yml` 來實現一鍵部署與管理的進階工具。

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker compose up -d` | **一鍵啟動！** 根據當前目錄的 `.yml` 檔，自動建構並在背景運行所有服務 |
| `docker compose ps` | 查看目前這個 Compose 專案下，所有專屬容器的運行狀態 |
| `docker compose logs -f` | **除錯神招！** 即時監看這個 Compose 專案下，所有容器的 Log 輸出總匯 |
| `docker compose down` | **一鍵關閉！** 停止並刪除這個專案下的所有容器與網路 (不會刪除 Volume) |
| `docker compose down -v` | ⚠️ **一鍵毀滅！** 連同掛載的 Volume 永久資料也一併徹底刪除 |