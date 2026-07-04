---
id: 01-docker-basics
title: Docker 基礎教學筆記
sidebar_label: "Docker 基礎"
sidebar_position: 1

description: "Docker 基礎教學筆記 1. VM 和 Docker 的差別 VM 虛擬機 1. 資源預先分配 死佔資源：如果是 VM 的話，電腦有 32G，開了兩個 VM 各分配 8GB，就會直接花掉 16GB。不管裡面有沒有跑東西，資源就是被死死佔用。 2. 擴充不便：要擴充資源 如 CPU、RAM 通常需..."
keywords: [Docker, 基礎教學筆記, learning, docker-notes]
---

# Docker 基礎教學筆記

## 1. VM 和 Docker 的差別

### VM (虛擬機)
1. **資源預先分配 (死佔資源)**：如果是 VM 的話，電腦有 32G，開了兩個 VM 各分配 8GB，就會直接花掉 16GB。不管裡面有沒有跑東西，資源就是被死死佔用。
2. **擴充不便**：要擴充資源 (如 CPU、RAM) 通常需要關機重啟。
3. **自帶完整 OS**：每個 VM 都有自己完整的作業系統，開機慢、佔空間。

### Docker (容器化)
1. **資源彈性共享**：佔用空間與資源是彈性的，不需要預先分配，應用程式需要吃多少它就會自己去擴充使用。
2. **啟動速度快 (秒級)**：因為不需要像 VM 一樣開機載入作業系統 (它直接共用主機的 OS 核心)。
3. **跨系統 (環境一致性)**：打包好之後，丟到 Mac、Windows 或 Linux 伺服器，跑起來的結果都一模一樣，解決「在我的電腦上可以跑，為什麼上線就壞了」的問題。

---

## 2. Docker 運作概念

1. **Host OS**：Docker 預設是運行在 Linux 環境上的。
2. **Container (容器)**：可以想像成「每台獨立運作的小電腦」。
3. **Image (映像檔)**：可以想像成「安裝光碟片」(它是唯讀的模板，用來產出 Container)。

---

## 3. 實戰：啟動第一個服務 NGINX

**步驟一：** 到 [Docker Hub](https://hub.docker.com/) 搜尋 `nginx`。

**步驟二：** 終端機輸入指令下載 Nginx Image。
```bash
docker image pull nginx:alpine
# 註：image 字眼可省略
# 註：:alpine 標籤代表使用極小化的版本
```

**步驟三：** 查看目前的 Image 清單。
```bash
docker image ls
```

**步驟四：** 啟動 Nginx 容器。
```bash
docker container run -d -p 80:80 nginx:alpine
```
*(註：加上 `-d` 代表使用靜默模式 / 背景啟動)*

**步驟五：** 打開瀏覽器，前往 `http://localhost:80` 即可看到畫面。

**步驟六：常用進階操作與驗證**
- 使用 `docker container ls` 看目前運行的 Container 清單。
- 使用 `docker container attach <CONTAINER ID>` 監看伺服器狀態與輸出。
- 使用 `docker container exec -it <CONTAINER ID> sh` 進入容器內部。
- *(進入後)* 輸入 `cd /usr/share/nginx/html/` 進到 Nginx 的資料夾，這時就可以看到你在 localhost 顯示的 `index.html`。

💡 **觀念提醒**：
1. **資料不保留**：容器關掉或刪除後，你剛剛修改的內容也會消失。重新啟動就會是 Image 的原始狀態。
2. **安全刪除**：運行中的容器「不可」使用 `docker container rm` 做移除，需要先使用 `docker container stop` 做停止後再移除。

### 👉 指令詳細拆解：`docker container run`
- **`docker container run`**：告訴 Docker 建立並運行一個新的容器 *(早期常縮寫為 `docker run`，兩者效果一樣)*。
- **`-p 80:80`**：代表進行**「Port 映射 (Port Mapping)」**。
  - 冒號**左邊的 80**：代表**本機 (Host, 你的電腦)** 開放的 Port。
  - 冒號**右邊的 80**：代表**容器內部 (Container)** Nginx 預設監聽的 Port。
  - 💬 *白話文：把你電腦的 80 Port 流量，全部導向容器裡的 80 Port。*
- **`nginx`**：指定要使用的映像檔 (Image) 名稱。
- **`:alpine`**：指定 Image 的標籤 (Tag)。`alpine` 是一個極小化的 Linux 發行版，好處是**檔案超小 (不到 50MB)、下載極快且安全**。

---

## 4. 容器生命週期與常用指令速查表

為了方便日常開發查詢，我已經將「Docker 生命週期」與「常用指令」獨立整理成一份表格化的速查表。

👉 **[點此前往：Docker 常用指令與生命週期速查表](./00-docker-cheatsheet.md)**