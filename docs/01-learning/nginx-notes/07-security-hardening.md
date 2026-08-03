---
sidebar_position: 7

description: "Nginx 安全防禦實戰 當您的伺服器正式暴露在外網環境時，安全防護就成為第一要務。網路上充滿了惡意掃描器與腳本，隨時在尋找系統漏洞。本章將教您如何在生產環境中設置 HTTPS 安全隧道、進行 301 強制跳轉，並配置 HSTS 以防止中間人劫持。同時，我們也會配置「漏桶演算法」進行 API 限流防..."
keywords: [Nginx, 安全防禦實戰, learning, nginx-notes]
---


# Nginx 安全防禦實戰

當您的伺服器正式暴露在外網環境時，安全防護就成為第一要務。網路上充滿了惡意掃描器與腳本，隨時在尋找系統漏洞。本章將教您如何在生產環境中設置 HTTPS 安全隧道、進行 301 強制跳轉，並配置 HSTS 以防止中間人劫持。同時，我們也會配置「漏桶演算法」進行 API 限流防禦（防止暴力破解與刷 API），並加入三大安全防護門神標頭（Security Headers），阻擋常見的 XSS、點擊劫持與 MIME 類型探測攻擊。

---

## 1. HTTPS 與 SSL 憑證 (安全防護罩)

*   **明信片 (HTTP) vs 保險箱 (HTTPS)**：一般的 HTTP (80 埠) 傳輸是明文的，封包經過的所有節點都可以被監聽與竄改；HTTPS (443 埠) 則透過 SSL/TLS 對流量進行加密，確保數據隱私。
*   **Certbot 自動化部署與續約**：實務上，我們通常使用 **Let's Encrypt** 免費憑證，配合 **Certbot** 工具，即可一鍵完成「網域驗證、Nginx 設定修改、並在 90 天到期前自動排程續約」的自動化流程。

### ⚙️ 實務配置範例：強迫全站 HTTPS 加密

```nginx
# 1. 監聽 80 埠 (HTTP) - 強制跳轉
server {
    listen 80;
    server_name myapp.com;
    
    # 301 永久跳轉，保留網域與原請求路徑 (URI)
    return 301 https://$host$request_uri;
}

# 2. 監聽 443 埠 (HTTPS) - 加密站台
server {
    listen 443 ssl;
    server_name myapp.com;

    # 憑證實體路徑 (Certbot 自動下載位置)
    ssl_certificate /etc/letsencrypt/live/myapp.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myapp.com/privkey.pem;

    location / {
        root /var/www/myapp/dist;
        index index.html;
    }
}
```

:::info[💡 誰記住了 301 永久導向？]

*   **DNS 的角色**：DNS 僅負責將網域名稱解析為 IP，**完全不知道也不過問 Port 號或 HTTP 協定**。
*   **瀏覽器的快取**：當瀏覽器首次透過 HTTP 訪問並收到 Nginx 的 `301` 永久導向後，**瀏覽器會在本地端快取這個跳轉紀錄**。下次使用者再次輸入 `myapp.com` 時，瀏覽器會直接在內部將網址改寫為 `https://` 並直接敲擊 443 埠口，不再經過 80 埠。
*   **HSTS 強制防護**：我們可以在 HTTPS 區塊中加入 HSTS Header，強制瀏覽器在接下來的一年內一律使用 HTTPS 連線，防止首次 HTTP 連線被中間人截持的漏洞：
    `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`

:::

:::warning[⚠️ 實務排錯：為什麼 HTTP 打不開，HTTPS 卻打得開？]

上線測試時，常遇到輸入 `http://` 顯示連線失敗，但改輸入 `https://` 卻正常的狀況，通常有以下三個排查方向：
1.  **Nginx 忘記監聽 80 埠**：設定檔中只有 `listen 443;`，沒有寫 `listen 80;` 的 server 區塊。
2.  **雲端主機防火牆（安全組）未開放 80 埠**：伺服器本身正常監聽 80，但 AWS/GCP 的安全組規則僅放行了 443，HTTP 封包在抵達主機前就被雲端防火牆阻斷。
3.  **兩者指向的 root 資料夾不同**：Nginx 的 80 與 443 區塊所設定的 `root` 路徑不一致，導致 HTTP 存取到空目錄噴出 404 或空白頁。

:::

---

## 2. 基礎限流防禦 (Rate Limiting)

為防範惡意爬蟲、暴力密碼破解或惡意刷簡訊 API 的攻擊，我們可以限制每個 IP 每秒最多只能發送多少次請求。Nginx 採用 **「漏桶演算法 (Leaky Bucket)」**：當流量突發時（即倒入水桶的水），會先排入緩衝佇列（`burst`）中等待以固定速度流出處理；若瞬間流量大到溢出水桶，則直接拒絕並傳回 `503 Service Unavailable`（實務上可自訂為 `429 Too Many Requests`）。

### ⚙️ 實務配置範例：定義與套用

Nginx 的限流必須拆成**「定義」**（寫在 `http` 全域區塊）與**「套用」**（寫在特定的 `location` 內）兩部分：

```nginx
http {
    # 1. 【定義規則】：以用戶 IP 為基準，建立 10MB 的紀錄區 (zone)，限制頻率為每秒 10 次 (10r/s)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 443 ssl;
        server_name myapp.com;

        # 2. 【套用規則】：只套用在登入或 API 等敏感位置
        location /api/login {
            # burst=20：允許用戶突發性排隊 20 個請求
            # nodelay：突發請求不需要在佇列中延遲，直接處理；但若排隊佇列也滿了，直接拒絕
            limit_req zone=api_limit burst=20 nodelay;
            
            # 📌 核心優化：將限流錯誤狀態碼改為標準的 429 (Too Many Requests)，方便前端捕捉
            limit_req_status 429;
            
            proxy_pass http://127.0.0.1:3000;
        }
    }
}
```

---

## 3. 加入 Security Headers (防禦常見 Web 攻擊)

我們可以在 Nginx 設定中貼上幾張「HTTP 安全防護貼紙」（Header），強制命令瀏覽器啟動防禦機制：

```nginx
# 1. 防止點擊劫持 (Clickjacking)
# 限制此網頁不能被外部網站用 <iframe> 嵌入，僅允許同網域 (SAMEORIGIN) 載入。
add_header X-Frame-Options "SAMEORIGIN" always;

# 2. 禁用 MIME 類型猜測 (防 MIME Sniffing 攻擊)
# 強制瀏覽器嚴格遵守 Content-Type 類型，不得自行推測探測檔案內容並執行腳本。
add_header X-Content-Type-Options "nosniff" always;

# 3. 開啟瀏覽器反射型 XSS 保護濾鏡
# mode=block：當瀏覽器檢測到 XSS 腳本注入時，拒絕修復並直接鎖死 (Block) 整個網頁渲染。
add_header X-XSS-Protection "1; mode=block" always;
```

#### 🕵️ 門神 Header 防範的攻擊場景解密

1.  **防範「點擊劫持 (Clickjacking)」**：
    *   *攻擊場景*：駭客在抽獎網頁按鈕上方覆蓋一個透明度 0% (隱形) 的 `<iframe>` 載入你的銀行轉帳頁。當你點擊「抽獎」，實際點到的是隱形的「確認轉帳」按鈕。
    *   *防守機制*：同源限制宣告後，外部網站的 `iframe` 會被瀏覽器直接拒絕渲染，使點擊套路失效。
2.  **防範「MIME 類型探測攻擊」**：
    *   *攻擊場景*：駭客將惡意 JS 程式命名為 `avatar.txt` 文字檔上傳。舊版瀏覽器讀取時會假貼心地掃描檔案內容，發現腳本語法後，便自作聰明地將它當作 JavaScript 執行（觸發 XSS 攻擊）。
    *   *防守機制*：禁止探測（nosniff）強制瀏覽器「我說它是文字，你就只能當文字解讀」，直接拒絕執行。
3.  **防範「反射型 XSS 攻擊」**：
    *   *攻擊場景*：用戶點擊了被惡意拼入腳本參數的網址（如 `myapp.com/?search=<script>steal_cookie()</script>`）。
    *   *防守機制*：啟動瀏覽器過濾網，一旦偵測到注入，直接中斷網頁開啟，保護用戶隱私。