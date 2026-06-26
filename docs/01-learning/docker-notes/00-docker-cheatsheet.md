---
id: 00-docker-cheatsheet
title: Docker 常用指令與生命週期速查表
sidebar_label: "\u200B0 指令速查表"
sidebar_position: 0
---

# Docker 常用指令與生命週期速查表

這份速查表整理了 Docker 在實務中最常用的指令，並且依照「基礎操作」與「容器生命週期狀態」進行分類，方便開發時快速查找。

## 1. 基礎與 Image 指令速查

| 指令 (Command) | 用途與說明 |
| :--- | :--- |
| `docker version` | 查看 Docker 引擎版本與系統詳細規格 |
| `docker image ls` | 顯示目前本地端已下載的所有映像檔 (Image) 清單 |
| `docker image pull <IMAGE>` | 從 Docker Hub 下載指定的映像檔 |
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
