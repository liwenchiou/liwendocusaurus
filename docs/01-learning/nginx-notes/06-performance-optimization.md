---
sidebar_position: 6
---

# Nginx 效能優化實戰

當網站的架構基本定型後，如何讓網頁載入得更快、如何減少伺服器頻寬的消耗，是上線前至關重要的課題。本章將帶您深入探討 Nginx 的兩大效能優化法寶：Gzip 即時壓縮（讓文字檔案大瘦身）與瀏覽器快取設定（透過 Expires 與 Cache-Control 強快取，實現網頁「零秒載入」）。同時，我們也將剖析前後端快取連動機制（Cache Busting），確保您的網頁在極速讀取之餘，也能在更新時即時推播給使用者。

---

## 1. 開啟 Gzip 壓縮 (減少傳輸檔案大小)

Gzip 可以將 HTML, CSS, JS 等文字檔案在傳送前進行即時壓縮（通常可減少 70% 的檔案大小），傳輸到瀏覽器後再由瀏覽器自動解壓縮。這能顯著縮短使用者下載資源的時間，並大幅節省伺服器的流量與頻寬成本。

### ⚙️ 實務配置範例

我們在 `nginx.conf` 的 `http` 區塊（營業總部）中加入以下通用 Gzip 設定：

```nginx
http {
    # 啟用 Gzip 壓縮功能
    gzip on;

    # 小於 1KB (1000 bytes) 的檔案不壓縮 (壓縮花費的 CPU 代價大於節省的頻寬，不划算)
    gzip_min_length 1000;

    # 壓縮等級 1~9，5 是效能（CPU 負擔）與壓縮比的最佳平衡點
    gzip_comp_level 5;

    # 針對以下文字類型的靜態檔案進行壓縮
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # 告訴代理伺服器（如 CDN）根據瀏覽器的 Accept-Encoding 快取不同版本
    gzip_vary on;
}
```

:::warning[⚠️ Gzip 圖片禁區：不要白費 CPU 算力]

在 `gzip_types` 中**絕對不要寫入 JPG、PNG、WebP 等圖片格式**！
原因在於，這些圖片格式本身在生成時就已經過高度壓縮，對其再次進行 Gzip 壓縮，檔案大小幾乎不會變小，反而會白白浪費伺服器大量的 CPU 算力，導致效能不增反降。

:::

---

## 2. 設定瀏覽器快取 (Browser Caching)

對於圖片、CSS、JS 等很少變動的靜態資源，我們可以告訴瀏覽器將其儲存在用戶的本地端電腦中（例如快取 30 天）。當使用者下次造訪網站時，瀏覽器會直接從本地端讀取檔案（載入時間 0 毫秒，在瀏覽器 F12 顯示為 `200 OK (from disk cache)` 或 `304 Not Modified`），完全不需要再向 Nginx 伺服器發送請求，達成極速體驗。

### ⚙️ 實務配置範例

我們在虛擬主機設定檔的 `server` 區塊內，利用正則表達式匹配靜態資源後綴並設定快取：

```nginx
server {
    # 匹配常見的靜態檔案後綴 (不區分大小寫)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|woff|woff2)$ {
        # 設定瀏覽器快取有效期限為 30 天
        expires 30d;

        # 允許公用快取 (如 CDN)，並禁止中介代理修改內容
        add_header Cache-Control "public, no-transform";

        # 關閉靜態資源的訪問日誌，減少硬碟 I/O 負擔
        access_log off;
    }
}
```

---

## 3. 前後端快取連動與更新機制 (Cache Busting)

當我們設置了長達 30 天的強快取後，如果今天網頁代碼更新了，我們要怎麼防止使用者的瀏覽器繼續讀取本地端的「舊版快取網頁」呢？我們有以下兩種最佳實踐：

### 1. 現代前端框架模式 (Vite / Webpack)
*   **機制**：現代打包工具在建置專案時，會自動根據檔案內容產生一組 Hash 雜湊碼並拼接到檔名後方（例如 `main.a8f9.js` 更新後會變成 `main.b3c1.js`）。
*   **結果**：由於 HTML 引用了新檔名，瀏覽器判定檔名不同，會直接向伺服器下載全新資源，而未變動的檔案（如沒修改的圖片）則繼續讀取快取。這是目前最推薦的無痛更新方案。

### 2. 協商快取對帳模式 (ETag / Last-Modified)
如果是不需要打包的純手寫靜態網頁，我們可以利用 Nginx 內建的指紋對帳機制。我們在 location 中設定：

```nginx
location ~* \.(js|css|png)$ {
    # no-cache 的意思是：「准許瀏覽器快取，但每次使用前都必須先向 Nginx 進行指紋對帳」！
    add_header Cache-Control "no-cache";
}
```

*   **對帳流程**：當使用者造訪網頁時，瀏覽器會攜帶舊檔案的 ETag（指紋）去問 Nginx：「這檔案有更新嗎？」。
    *   **檔案沒變**：Nginx 回傳超輕量的 `304 Not Modified`（沒有 Body），通知瀏覽器直接用本機舊快取。
    *   **檔案變了**：Nginx 回傳 `200 OK` 並送出全新內容。

---

## 💡 Nginx 預設優化狀態彙整

對於這些優化，Nginx 的預設哲學如下：
*   **天生開啟的 ➡️ 協商對帳機制 (ETag)**：因為對帳請求極為輕量且安全，Nginx 預設即為啟用，不需要任何設定。
*   **預設關閉的 ➡️ Gzip 壓縮與強快取 (Expires)**：因為 Gzip 會消耗 CPU 算力，而強快取如果配置不當會導致用戶看不到新網頁。因此，Nginx 選擇保持保守，將這些開關留給工程師依據具體業務情境手動開啟。
