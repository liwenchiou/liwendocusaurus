---
sidebar_position: 4
---

# Nginx 反向代理 (Reverse Proxy) 實戰

反向代理是現代網頁架構與微服務部署的基石，主要用於保護後端伺服器安全、實現 SSL 憑證統一管理（SSL Termination），以及進行高效的網址路徑/子網域請求分流。本章將帶您深入探討正向與反向代理的本質區別，並透過實務上的 `proxy_pass` 轉發設定，學習如何利用子網域或路徑切分不同的微服務容器。同時，我們也會詳細拆解 `proxy_set_header` 的內建變數，了解如何將用戶真實 IP 傳遞給 Node.js 等後端應用，並介紹在即時通訊中支援 WebSocket 協定升級的三行關鍵設定。

---

## 1. 什麼是反向代理？

「代理（Proxy）」在網路上本質就是**「代購 / 傳話人」**。根據代購服務的對象不同，分為正向與反向：

*   **正向代理 (Forward Proxy) ➡️ 「幫『用戶』代購」**
    *   *比喻*：你想買限量外國紅酒，找了個「代購（正向代理）」幫你買，網站只看到代購，不知道幕後的你。
    *   *特點*：服務對象是用戶，**隱藏了真正的用戶 IP**。常用於 VPN（翻牆）、公司內網控制。
*   **反向代理 (Reverse Proxy) ➡️ 「幫『伺服器』站櫃檯」**
    *   *比喻*：你撥打集團客服總機（Nginx 反向代理），由「總機（Nginx）」決定轉接給財務部或客服部。你不需要知道財務部的內線號碼。
    *   *特點*：服務對象是後端伺服器，**隱藏了真正的後端伺服器 IP/Port**。常用於安全防護、負載均衡、統一入口。

### 💡 反向代理的三大優勢

1.  **保護後端安全**：後端服務（如 Node.js）只監聽本地端 `127.0.0.1`，不用對外網開放 Port。
2.  **SSL 憑證統一管理**：由最前端的 Nginx 處理外網的 HTTPS 加密解密（SSL Termination），後端專案跑純 HTTP 即可，節省效能與管理成本。
3.  **動靜分離**：Nginx 直接處理靜態資源（圖片、CSS/JS），只有 API 動態請求才轉發給後端伺服器，大幅減輕後端負擔。

---

## 2. 反向代理實戰

### 基礎轉發：`proxy_pass`

最簡單的轉發設定，將所有請求轉發給同一台伺服器上跑在 `3000` 埠的後端服務：

```nginx
server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://127.0.0.1:3000; # 轉接電話給後端
    }
}
```

:::warning[⚠️ Docker 部署老手坑：127.0.0.1 的連線幻覺]

如果你將 Nginx 與 Node.js 部署在 **Docker 容器**中：
*   **錯誤設定**：`proxy_pass http://127.0.0.1:3000;` 
*   **問題原因**：在 Docker 的世界裡，每個容器都是獨立的虛擬主機。Nginx 容器內的 `127.0.0.1` 指的是「Nginx 容器自己」，而不是你的 Node.js 容器。這會直接導致 `502 Bad Gateway`！
*   **正確解法**：必須將 `127.0.0.1` 替換為 **Docker Compose 的服務名稱**（例如 `http://node-api:3000`），或是使用宿主機網關 `http://host.docker.internal:3000`。

:::

### 🌐 實務進階：子網域分流 vs 網址路徑分流 (可混用)

在多容器/多微服務架構中，我們有兩種分流方式，且它們可以靈活地**混合搭配使用**：

#### 1. 用網址路徑 (Path) 切分微服務
*   `myapp.com/shop/` ➡️ 轉發給 `:8001` (商城容器 A)
*   `myapp.com/blog/` ➡️ 轉發給 `:8002` (部落格容器 B)
*   `myapp.com/api/`  ➡️ 轉發給 `:8003` (後端 API 容器 C)

#### 2. 用子網域 (Subdomain) 切分微服務
*   `shop.myapp.com` ➡️ 轉發給 `:8001` (A)
*   `blog.myapp.com` ➡️ 轉發給 `:8002` (B)
*   `api.myapp.com`  ➡️ 轉發給 `:8003` (C)

#### 3. 實務混用範例 (子網域 + 路徑版本切分)
```nginx
# 服務 1：前端主站 (myapp.com)
server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
    }
}

# 服務 2：API 專屬子網域 (api.myapp.com)
server {
    listen 80;
    server_name api.myapp.com;

    # 混用：用路徑做 API 版本分流 (藍綠部署 / 無痛升級)
    location /v1/ {
        proxy_pass http://127.0.0.1:8001/; # 導向舊版容器
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /v2/ {
        proxy_pass http://127.0.0.1:8002/; # 導向新版容器
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 3. 傳遞真實資訊：`proxy_set_header`

由於是用戶發信給 Nginx，再由 Nginx 重新寫信送給內網的後端，這會導致**後端收到的請求來源 IP 永遠是 Nginx 的本機 IP（`127.0.0.1`）**。

為了解決後端無法記錄用戶真實 IP、無法進行精準 IP 封鎖的問題，我們必須在轉發時，讓 Nginx 在 HTTP Header 貼上**黃色便利貼**：

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;

    # 必配的三張便利貼：
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 🔍 Nginx 轉發 Header 的語法結構

Nginx 的自訂 Header 指令結構非常固定：
`proxy_set_header <Header名稱> <值>;`

*   **`Header名稱`**：Nginx 將在轉發給後端的 HTTP 請求頭中建立的自訂欄位。
*   **`值`**：可以填入靜態文字，或填入以 **`$`** 開頭的 Nginx 內建動態變數。

#### 💡 內建變數的真實數值對照表（以用戶 IP `220.135.1.2` 訪問 `api.myapp.com` 為例）

*   **`proxy_set_header Host $host;` ➡️ 「保留原收件網址」**
    *   **變數 `$host` 實際值**：`"api.myapp.com"`
    *   **功能**：Nginx 告訴後端：「用戶原本在瀏覽器輸入的網址是 `api.myapp.com`，不是我代傳時用的內網 `127.0.0.1:3000`。」這能避免後端程式在進行內部 URL 重導向 (Redirect) 時跳錯網址。
*   **`proxy_set_header X-Real-IP $remote_addr;` ➡️ 「原寄件人真實 IP」**
    *   **變數 `$remote_addr` 實際值**：`"220.135.1.2"`
    *   **功能**：Nginx 告訴後端：「直接跟我通訊的那個用戶，真實 IP 是 `220.135.1.2`。」
*   **`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` ➡️ 「代購軌跡清單」**
    *   **變數 `$proxy_add_x_forwarded_for` 實際值**：例如 `"220.135.1.2, 172.21.0.1"`（最左邊為最初的用戶 IP，後面依序為經過的其他代理 IP）。
    *   **功能**：如果請求中間還經過了 CDN（如 Cloudflare）或其他負載均衡器，這個變數會把所有經過的代理 IP 像火車一樣串接起來，讓後端能追溯最完整的請求鏈路。

### 💻 後端接收實務（以 Node.js / Express 為例）

在後端專案中，我們就可以利用標準的 Header 抓取語法，輕鬆把 Nginx 貼上的便利貼拿出來使用：

```javascript
const express = require('express');
const app = express();

app.get('/api/login', (req, res) => {
    // 1. 抓取原收件網域 (myapp.com)
    const requestHost = req.headers['host']; 

    // 2. 抓取用戶的真實 IP (220.135.1.2) -> 由 Nginx 的 X-Real-IP 貼紙提供
    const clientRealIP = req.headers['x-real-ip']; 

    // 3. 抓取完整的代理人鏈路 -> 由 X-Forwarded-For 提供
    const forwardChain = req.headers['x-forwarded-for']; 

    console.log(`[驗證登入] 用戶 IP: ${clientRealIP}，訪問網域: ${requestHost}`);
    res.status(200).json({ status: "success", ip: clientRealIP });
});
```

:::warning[⚠️ Nginx 老手坑：proxy_set_header 的繼承覆蓋陷阱]

Nginx 的 Header 繼承機制非常特殊且無情：
*   **規則**：如果你在父層（例如 `server` 區塊）寫了多行 `proxy_set_header`，而在子層（例如 `location /api`）中**哪怕只寫了新的一行** `proxy_set_header My-Header "value";`。
*   **後果**：父層所定義的所有 `proxy_set_header` 貼紙會**在一瞬間被全部清除，完全不會繼承或合併**！
*   **正確做法**：如果在子 location 內需要使用自訂 Header，請務必把 Host、X-Real-IP 等核心貼紙在該 location 內**全部重新寫一遍**，或者使用 `include` 引入共用設定，避免後端突然收不到用戶真實 IP。

:::

---

## 4. WebSocket 代理設定

在開發聊天室、即時數據看板、線上多人協作等「即時通訊」功能時，後端（如 Socket.io、WebSocket）需要建立持久連線。Nginx 作為反向代理時，必須特別設定才能支援此種連線。

### ❓ HTTP (短連線) 與 WebSocket (長連線) 的本質區別
*   **一般 HTTP 請求（如同「寄明信片」）**：瀏覽器發送請求 ➡️ 伺服器回傳資料 ➡️ **連線立即中斷**。一來一回，結束通訊。
*   **WebSocket 連線（如同「打電話」）**：瀏覽器與伺服器接通後，**雙方保持通訊管道暢通而不掛斷**。此後伺服器能主動向瀏覽器推播數據，瀏覽器也能即時送出訊息，擁有極低的延遲。

### 🚨 為什麼 Nginx 預設轉發會導致 WebSocket 斷線？
WebSocket 連線的建立，起手式是利用一個標準的 HTTP 請求，並在 Header 中攜帶特殊升級貼紙：
1.  `Upgrade: websocket`（通知伺服器：「我們把這條連線升級成打電話協定吧！」）
2.  `Connection: Upgrade`（通知伺服器：「保持連線不要切斷，我們要進行協定升級！」）

然而，**Nginx 預設是標準的 HTTP 代理，在轉發請求給後端時，會自動將這兩張「升級貼紙」從信封上撕掉**。後端的 Node.js 伺服器收不到升級要求，只當作一般的 HTTP 請求處理，導致連線隨即中斷，WebSocket 交握失敗。

### 🛠️ 解決方案：強制傳遞「升級信號」

我們必須手動在設定檔中，指示 Nginx 保留並傳遞這兩張升級便利貼：

```nginx
location /socket.io/ {
    proxy_pass http://127.0.0.1:3000;
    
    # 支援 WebSocket 升級的關鍵三行設定：
    proxy_http_version 1.1;                     # 1. 協定切換必須使用 HTTP/1.1 以上協定
    proxy_set_header Upgrade $http_upgrade;     # 2. 將用戶發送的 Upgrade 頭部（值通常為 "websocket"）傳遞給後端
    proxy_set_header Connection "upgrade";      # 3. 強制設定 Connection 頭部為 "upgrade"

    # 同步保留真實 IP 資訊
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

*   **`$http_upgrade`**：是 Nginx 內建變數，會自動獲取用戶發送的 `Upgrade` 欄位值（如 `"websocket"`）。
*   設定這三行後，Nginx 就會乖乖地把「升級便利貼」完整遞交給後端的 Node.js，順利接通即時長連線。
