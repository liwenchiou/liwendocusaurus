---
sidebar_position: 9

description: "Nginx 生產環境通用起手勢 Production Boilerplate 在實際企業級部署中，優秀的架構師不會把所有的安全、壓縮、代理設定通通塞在同一個設定檔裡，這會導致設定檔冗長且難以維護。本章將為您介紹如何透過 include 指令，將 Nginx 的各項功能進行模組化拆分，打造一份結構清晰..."
keywords: [Nginx, 生產環境通用起手勢, Production, Boilerplate, learning, nginx-notes]
---


# Nginx 生產環境通用起手勢 (Production Boilerplate)

在實際企業級部署中，優秀的架構師不會把所有的安全、壓縮、代理設定通通塞在同一個設定檔裡，這會導致設定檔冗長且難以維護。本章將為您介紹如何透過 `include` 指令，將 Nginx 的各項功能進行模組化拆分，打造一份結構清晰、高複用性且生產就緒的「標準起手勢模板」，讓您在未來建立新站台時，只需幾行指令即可秒開全套防護。

---

## 📂 模組化設定檔關係樹狀圖

我們將 Nginx 的設定目錄（通常在 `/etc/nginx/`）規劃為以下乾淨的結構：

```text
/etc/nginx/
├── nginx.conf (總控制中心：主設定檔)
│
├── conf.d/ (存放網站虛擬主機設定的資料夾，每個網站獨立一個檔案)
│    ├── shop.conf  (購物商城網站：shop.myapp.com)
│    ├── blog.conf  (部落格靜態網頁：blog.myapp.com)
│    └── admin.conf (後台管理系統：admin.myapp.com)
│
└── templates/ (存放模組化積木的資料夾)
     ├── security-headers.conf (安全標頭積木)
     ├── proxy-defaults.conf   (反向代理 Header 積木)
     └── gzip.conf             (Gzip 壓縮積木)
```

---

## 🧱 核心功能「積木檔」內容

我們將通用的重複設定，拆分成以下三張「活頁紙」，放在 `templates/` 目錄下：

### 1. 安全標頭積木：`templates/security-headers.conf`
這張積木貼紙負責全站的瀏覽器端安全防禦，阻擋點擊劫持與 MIME 探測攻擊：

```nginx
# 防點擊劫持：不允許被非同源的網頁嵌入 iframe 中
add_header X-Frame-Options "SAMEORIGIN" always;

# 防 MIME 探測：強制瀏覽器遵守 Content-Type，不猜測檔案格式
add_header X-Content-Type-Options "nosniff" always;

# 開啟 XSS 保護：偵測到腳本注入時強制鎖死網頁
add_header X-XSS-Protection "1; mode=block" always;

# 開啟 HSTS 強制安全傳輸：強制瀏覽器在未來一年內一律用 HTTPS 造訪
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 2. 反向代理 Header 積木：`templates/proxy-defaults.conf`
這張貼紙負責在轉發 API 給後端（Node.js 等）時，貼上保留 Host 與用戶真實 IP 的便利貼，並開啟容錯機制：

```nginx
# 傳遞用戶原本在瀏覽器輸入的網址
proxy_set_header Host $host;

# 傳遞直接跟 Nginx 連線的用戶真實 IP
proxy_set_header X-Real-IP $remote_addr;

# 傳遞完整的轉發路徑軌跡 IP 清單
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

# 支援 HTTP/1.1 協定 (WebSocket 基礎架構)
proxy_http_version 1.1;

# 📌 故障自癒與重試機制：當遇到連線錯誤、超時或 502/503/504 時，自動轉給下一台健康伺服器
proxy_next_upstream error timeout invalid_header http_502 http_503 http_504;
```

### 3. Gzip 壓縮積木：`templates/gzip.conf`
這張活頁紙負責設定文字檔案在網路上傳輸時的即時瘦身規則：

```nginx
# 開啟 Gzip 壓縮功能
gzip on;

# 小於 1KB 的檔案不壓縮 (壓縮花費的 CPU 代價大於節省的流量)
gzip_min_length 1000;

# 壓縮等級為 5 (CPU 消耗與壓縮率的最佳黃金比例)
gzip_comp_level 5;

# 針對文字、CSS、JS、JSON、XML 檔案進行壓縮 (注意：絕對不要壓縮圖片！)
gzip_types text/plain text/css application/json application/javascript text/xml;

# 根據瀏覽器的 Accept-Encoding 快取不同版本
gzip_vary on;
```

---

## 總控制中心配置

### 總指揮官：`nginx.conf`
這是最外層的主設定檔。我們在這裡把 Gzip 壓縮功能 `include` 進來、定義限流的共享記憶體，並且**定義負載均衡的伺服器群組**：

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 隱藏 Nginx 版本號資訊
    server_tokens off;
    sendfile on;
    keepalive_timeout 65;

    # 📌 【起手勢 1】：載入通用 Gzip 壓縮設定
    include /etc/nginx/templates/gzip.conf;

    # 📌 【起手勢 2】：全域定義 API 限流記憶體區
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # 📌 【起手勢 3】：定義商城網站的「負載均衡後端伺服器群組」
    upstream shop_backend_servers {
        least_conn;                      # 使用最少連線數分流
        server 127.0.0.1:8001 weight=1;  # 伺服器 A
        server 127.0.0.1:8002 weight=2;  # 伺服器 B
    }

    # 📌 【起手勢 4】：自動拼接 conf.d 下所有網站的設定
    include /etc/nginx/conf.d/*.conf;
}
```

---

## 實務套用：簡潔無比的網站設定檔

### 網站設定檔範例：`conf.d/shop.conf`

得益於 `include` 模組化設計，你的商城網站設定檔現在變得乾淨到不可思議！所有的安全、代理設定通通縮減成一行 `include`，並且**完美支援後端負載均衡**：

```nginx
# 1. 強制將 HTTP (80) 導向 HTTPS (443)
server {
    listen 80;
    server_name shop.myapp.com;
    return 301 https://$host$request_uri;
}

# 2. 安全的 HTTPS 商城主站
server {
    listen 443 ssl;
    server_name shop.myapp.com;

    # 憑證路徑
    ssl_certificate /etc/letsencrypt/live/shop.myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.myapp.com/privkey.pem;

    # 📌 【起手勢 5】：套用全站安全防護標頭 (SAMEORIGIN, HSTS 等)
    include /etc/nginx/templates/security-headers.conf;

    # ------------------------------------------------------
    # 靜態網頁託管 (React / Vue / Docusaurus SPA)
    # ------------------------------------------------------
    location / {
        root /var/www/shop/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # ------------------------------------------------------
    # 靜態資源瀏覽器快取設定 (30 天強快取)
    # ------------------------------------------------------
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
        root /var/www/shop/dist;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;                                   # 關閉訪問日誌以節省 I/O 效能
    }

    # ------------------------------------------------------
    # 後端 API 轉發 (限流 ＋ 代理設定 ＋ 負載均衡)
    # ------------------------------------------------------
    location /api/ {
        # 套用限流防禦
        limit_req zone=api_limit burst=20 nodelay;

        # 📌 【起手勢 6】：一行套用 Host, X-Real-IP 等所有代理 Header
        include /etc/nginx/templates/proxy-defaults.conf;

        # 📌 【起手勢 7】：將請求轉發給定義在 nginx.conf 的負載均衡群組！
        proxy_pass http://shop_backend_servers;
    }

    # ------------------------------------------------------
    # WebSocket 即時通訊轉發 (如 Socket.io)
    # ------------------------------------------------------
    location /socket.io/ {
        # 📌 【起手勢 8】：一行套用代理 Header
        include /etc/nginx/templates/proxy-defaults.conf;

        # WebSocket 升級三行指令 (此設定與 proxy-defaults.conf 疊加)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 📌 將 WebSocket 流量同樣導向負載均衡群組
        proxy_pass http://shop_backend_servers;
    }
}
```

---

:::tip[💡 這樣架構有什麼無敵優勢？]

1.  **極致乾淨**：沒有密密麻麻重複的安全和代理 Header 設定，主設定檔一眼看穿，大幅降低配置出錯率。
2.  **一處修改，全站更新**：如果未來你想更新安全標頭（例如把 HSTS 的期限從一年延長為兩年），你**只需要修改 `templates/security-headers.conf` 這一個檔案**，然後熱重載，你伺服器上託管的所有網站就會在一秒內同步更新防禦，再也不用手動去改所有網站的設定檔！
3.  **秒級開站與輕鬆擴容**：當你未來要架設新站台或需要對後端伺服器進行擴容（例如商城從 2 台擴充到 5 台），你**只需要修改 `nginx.conf` 中的 `upstream` 區塊名單**即可，完全不需要去動各個網站內部的 `shop.conf` 設定！這就是最專業的運維標準動作！

:::