---
sidebar_position: 8

description: "Nginx 疑難排解與維運 網站上線後的日常運作中，掌握排障與維運技能是確保系統高可用性的最後一環。當使用者回報「網頁打不開」、「上傳頭像失敗」或「系統發生錯誤」時，能夠迅速定位問題的根源至關重要。本章將教您如何解讀 access.log 與 error.log 這兩大核心日誌探照燈，並針對生產環境..."
keywords: [Nginx, 疑難排解與維運, learning, nginx-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Untitled",
        "datePublished": "2026-07-08T13:51:33.497Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Nginx 疑難排解與維運 網站上線後的日常運作中，掌握排障與維運技能是確保系統高可用性的最後一環。當使用者回報「網頁打不開」、「上傳頭像失敗」或「系統發生錯誤」時，能夠迅速定位問題的根源至關重要。本章將教您如何解讀 access.log 與 error.log 這兩大核心日誌探照燈，並針對生產環境..."
      }
    `}
  </script>
</Head>


# Nginx 疑難排解與維運

網站上線後的日常運作中，掌握排障與維運技能是確保系統高可用性的最後一環。當使用者回報「網頁打不開」、「上傳頭像失敗」或「系統發生錯誤」時，能夠迅速定位問題的根源至關重要。本章將教您如何解讀 `access.log` 與 `error.log` 這兩大核心日誌探照燈，並針對生產環境中面臨的三大魔王級報錯：`502 Bad Gateway`（網關錯誤）、`403 Forbidden`（拒絕存取）以及 `413 Request Entity Too Large`（上傳檔案超限）提供清晰的成因剖析與具體的解決對策。

---

## 1. Nginx 的兩大探照燈 (日誌管理)

Nginx 預設會將日誌儲存在 `/var/log/nginx/` 目錄中。這兩個檔案是系統維運的最核心工具：

### 1. `access.log` (訪問日誌 - 誰來過？)
*   **功能**：記錄每一個連入網站的 HTTP 請求。
*   **用途**：流量分析、統計造訪人次、確認有無爬蟲或異常 IP 正在瘋狂存取網站。
*   **格式範例**：
    `220.135.1.2 - - [03/Jul/2026:16:15:30 +0800] "GET /api/login HTTP/1.1" 200 45 "https://myapp.com/" "Mozilla/5.0..."`
    *(解析：從 IP `220.135.1.2` 的訪客，以 HTTP/1.1 發送了 `GET /api/login`，獲得狀態碼 `200` 成功，傳輸大小 45 bytes。)*

### 2. `error.log` (錯誤日誌 - 誰掛了？🔴 核心排錯首選！)
*   **功能**：記錄 Nginx 系統內部的重大錯誤、連線失敗、權限不足或後端服務超時。
*   **用途**：**只要網站打不開、轉圈圈、噴錯，第一步「永遠是去查 error.log」**。它會明確記錄錯誤的檔案路徑、或者是後端 API Port 連不上的具體原因。

---

## 2. 生產環境「三大魔王級報錯」排查指南

這是在工作中、甚至技術面試中，最常需要現場 Debug 與排查的實務狀況：

### 👿 魔王 ①：`502 Bad Gateway` (最常踩到的坑)
*   **白話定義**：Nginx 作為反向代理總機正常運行，但當它將請求轉接給後端的「Node.js/Go 辦公室」時，發現**電話根本打不通，或者是斷線了**。
*   **三大常見原因與解法**：
    1.  **後端程式當機**：你的 Node.js 或 PM2 服務因為 Unhandled Bug 崩潰了，根本沒有在運行。
        *   *解法*：去後端伺服器下 `pm2 status` 或 `docker ps` 檢查後端進程是否活著。
    2.  **Port 號配置錯誤**：你的 Node.js 實際上跑在 `5000` port，但你的 Nginx 設定檔卻寫 `proxy_pass http://127.0.0.1:3000;`。
        *   *解法*：修改 Nginx 設定檔，將 Port 對齊後端實際監聽的 Port。
    3.  **Docker 容器網路沒接通或誤用 `127.0.0.1`**：Nginx 容器與 Node.js 容器在不同的 Docker 網段；或是將 `proxy_pass` 設為 `127.0.0.1`（在 Docker 中這代表 Nginx 容器本身而非宿主機，因此連不上 Node.js）。
        *   *解法*：檢查 `docker-compose.yml` 確保容器在同個 `networks` 中，並將 `proxy_pass` 指向 **Docker 服務名稱**（例如 `http://node-api:3000`）而非 `127.0.0.1`。

:::tip[💡 快速除錯：error.log 的 502 線索]

當你在 `error.log` 中看到 `connect() failed (111: Connection refused) while connecting to upstream`，代表後端 Port 沒開或當機；如果看到 `no resolver defined to resolve...` 代表 Docker 服務名稱寫錯，Nginx 無法解析該容器域名。

:::

### 👿 魔王 ②：`403 Forbidden` (拒絕存取)
*   **白話定義**：Nginx 找得到你請求的網頁檔案，但**拒絕拿給你看**。
*   **兩大常見原因與解法**：
    1.  **檔案系統權限不足 (Permission Denied)**：
        Nginx 行程的執行身分（通常是 `nginx` 或 `www-data` 使用者）無法讀取你網頁資料夾（`dist`）底下的檔案。例如該資料夾由 `root` 建立且權限設為 `700`。
        *   *解法*：手動放開讀取權限：`chmod -R 755 /var/www/myapp`。
    2.  **缺少目錄首頁檔案**：
        你的 `root` 指定目錄下根本沒有 `index.html` 檔案，且 Nginx 預設關閉了「列出檔案清單 (autoindex off)」功能。Nginx 不知道該回傳什麼，就吐 403。
        *   *解法*：確認前端打包產物已正確移入對應目錄，且檔案名為 `index.html`。

### 👿 魔王 ③：`413 Request Entity Too Large` (上傳失敗)
*   **白話定義**：使用者在上傳大頭貼、或者上傳影片時，網頁突然噴出這個錯誤，拒絕上傳。
*   **原因**：Nginx 預設的**「單次上傳檔案限制非常小，只有 1MB」**。這是為了防止惡意用戶上傳幾百 GB 的垃圾檔案直接把伺服器記憶體塞爆。
*   **解法**：在 Nginx 的 `http`、`server` 或 `location` 區塊中，主動調大上傳檔案上限：
    ```nginx
    # 允許最大單次上傳檔案為 20MB
    client_max_body_size 20M; 
    ```

---