---
id: docker-environment-setup
title: "Docker 開發環境部署與設定"
sidebar_label: "Docker 環境建置"

description: "Docker 開發環境部署 安裝 docker 1. dockerhttps://www.docker.com/getstarted/官網下載 2. 確認docker環境 docker version 3. 執行測試 docker run helloworld 部署 ubuntu 專案 1. 先建立..."
keywords: [Docker, 開發環境部署與設定, engineering, software-development]
---

# Docker 開發環境部署

## 安裝 docker

1. [docker](https://www.docker.com/get-started/)官網下載
2. 確認docker環境

```
docker --version
```

3. 執行測試

```
docker run hello-world
```

## 部署 ubuntu 專案

1. 先建立要掛載的資料夾

```
mkdir ~/Documents/docker/myubuntu
```

2. 使用指令掛載

```
docker run -it -v ~/Documents/docker/myubuntu/:/work ubuntu bash
```

2-1. 指令詳解

`docker run -it -v ~/Documents/docker/myubuntu/:/work ubuntu bash`

**指令組成詳細說明**

| 參數 / 部分                    | 功能說明              | 備註                                         |
| ------------------------------ | --------------------- | -------------------------------------------- |
| `docker run`                   | 啟動容器              | 建立並運行一個新容器的基礎指令。             |
| `-i`                           | 互動模式              | 維持容器的標準輸入開啟，讓你可與容器互動。   |
| `-t`                           | 分配終端機            | 為容器分配一個虛擬終端機 (TTY)。             |
| `-v`                           | 綁定掛載 (Bind Mount) | 設定目錄對應，將主機路徑連結至容器內路徑。   |
| `~/Documents/docker/myubuntu/` | 主機路徑 (來源)       | 你 Mac 上的檔案存放位置。                    |
| `:/work`                       | 容器路徑 (目標)       | 容器內部的對應資料夾路徑。                   |
| `ubuntu`                       | 映像檔 (Image)        | 指定使用的作業系統映像檔。                   |
| `bash`                         | 啟動入口              | 容器啟動後預設執行的指令 (進入 Bash Shell)。 |

3. 測試掛載
   3-1. 切換到 /work 資料夾

```
cd /work
```

3-2. 建立一個測試檔案

```
touch test.txt
```

3-3. 前往本機驗證檔案是否存在

## 部署node.js 環境

1. 執行環境指令

```
docker run -it -p 3000:7788 -v ~/Documents/docker/mynodejs/:/app -w /app node:20 bash
```

1-1. 指令詳解

`docker run -it -p 3000:7788 -v ~/Documents/docker/mynodejs/:/app -w /app node:20 bash`

**指令組成詳細說明**

| 參數 / 部分                    | 功能說明                     | 備註                                                         |
| ------------------------------ | ---------------------------- | ------------------------------------------------------------ |
| `docker run`                   | 啟動容器                     | 建立並運行一個新容器的基礎指令。                             |
| `-i`                           | 互動模式                     | 維持容器的標準輸入開啟，讓你可與容器互動。                   |
| `-t`                           | 分配終端機                   | 為容器分配一個虛擬終端機 (TTY)。                             |
| `-p 3000:7788`                 | Port 對應 (Port Mapping)     | 將本機的 3000 port 對應到容器內的 7788 port（主機 : 容器）。 |
| `-v`                           | 綁定掛載 (Bind Mount)        | 設定目錄對應，將主機路徑連結至容器內路徑。                   |
| `~/Documents/docker/mynodejs/` | 主機路徑 (來源)              | 本機 Mac 上的資料夾存放位置。                                |
| `:/app`                        | 容器路徑 (目標)              | 容器內部的對應資料夾路徑。                                   |
| `-w /app`                      | 工作目錄 (Working Directory) | 容器啟動後，終端機預設會進入這個 `/app` 目錄。               |
| `node:20`                      | 映像檔 (Image)               | 指定使用 Node.js 20 版本的官方映像檔。                       |
| `bash`                         | 啟動入口                     | 容器啟動後預設執行的指令 (進入 Bash Shell)。                 |

2. 部署完成後進入 node

```
node
```

3. 測試

```
console.log("這是我第一個docker 的 nodejs 環境")
```

## 常見 Docker 實用指令

在開發過程中，以下是幾組最常用到的 Docker 指令備忘錄：

### 容器管理 (Container)
- **`docker ps`**：列出目前正在執行的容器。
- **`docker ps -a`**：列出所有容器（包含已停止的）。
- **`docker stop <容器ID或名稱>`**：停止正在執行的容器。
- **`docker start <容器ID或名稱>`**：啟動已經建立但停止中的容器。
- **`docker rm <容器ID或名稱>`**：刪除指定的容器（必須先停止）。
- **`docker rm -f <容器ID或名稱>`**：強制刪除正在執行的容器。

### 映像檔管理 (Image)
- **`docker images`**：列出本機已下載的所有映像檔。
- **`docker rmi <映像檔ID>`**：刪除指定的映像檔。
- **`docker pull <映像檔名稱>`**：從 Docker Hub 下載映像檔（例如 `docker pull node:20`）。

### 進入運作中的容器 (Exec)
若容器已經在背景執行中（例如跑了 Server），你可以使用 `exec` 指令新開一個終端機進入該容器：
```bash
docker exec -it <容器ID或名稱> bash
```
*(💡 小提醒：有些精簡版映像檔如 `alpine` 可能沒有 `bash`，此時需改用 `sh`)*

### 系統大掃除 (Prune)
當你發現 Docker 佔用太多 Mac 硬碟空間時，這招非常實用：
```bash
docker system prune
```
*(這會自動清除所有**未被使用**的容器、網路與暫存資料)*