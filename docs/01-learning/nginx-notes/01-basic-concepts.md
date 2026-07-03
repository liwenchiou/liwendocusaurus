---
id: basic-concepts
title: Nginx 基礎概念與環境建置
sidebar_label: "\u200B1 基礎概念與環境建置"
sidebar_position: 1
---

# Nginx 基礎概念與環境建置

本章節介紹 Nginx 的基本原理與誕生背景（為了解決 C10K 連線瓶頸），並對照傳統 Apache 的 Process-based 架構，解析其非同步事件驅動（Event-driven）的優勢。同時提供 Linux 與 Docker 環境下的安裝步驟與核心控制指令（如 `nginx -t` 與 `reload`）的實務拆解與除錯演練。

> **學習目標**：從零開始掌握 NGINX 的核心概念，最終能夠獨立完成靜態網站部署、Node.js/Next.js 反向代理、HTTPS 憑證設定以及基礎架構優化。

## 什麼是 NGINX？

### 1. 誕生背景 (The C10K Problem)

早期網際網路流量不大，伺服器通常採用「一個請求配一個行程 (Thread)」的模式。但到了 2000 年代初期，網路快速普及，當同時有 10,000 個連線湧入時（俗稱 C10K 問題），伺服器會因為開啟過多 Thread 導致記憶體耗盡、CPU 光是切換上下文 (Context Switch) 就快累死，最終崩潰。
為了解決這個痛點，俄羅斯工程師 Igor Sysoev 在 2004 年打造了 NGINX。

### 2. 核心優勢與架構差異 (NGINX vs 傳統 Apache)

要理解 NGINX 為什麼快，我們可以用「餐廳服務生」來比喻：

- **Apache (Process-based 架構)**：傳統模式。像是一間傳統餐廳，每個客人 (Request) 進來，老闆就要派一個專屬服務生 (Thread) 全程站在旁邊服務，直到客人吃完離開。一旦客人爆滿，服務生不夠用，後面的客人就只能在門口乾等。（高資源消耗、易阻塞）
- **NGINX (Event-driven 非同步事件驅動)**：現代模式。這家餐廳只有少數幾位「超級服務生 (Worker Processes)」。客人點完餐後，服務生把單子丟給廚房就立刻去招呼下一桌；等廚房做好餐點（Event 事件觸發），服務生再順手端過去。因此，極少數的 Worker 就能同時處理數萬個連線。

### 3. NGINX 的四大核心功能角色（用「排隊名店」來比喻）

1. **靜態網頁伺服器 (Web Server) ➡️ 「冰箱現拿的罐裝飲料」**：
   - _生活範例_：客人走進店裡說要買一瓶礦泉水。店員不需要開火、不用調配，直接轉身從冰箱拿出來遞給客人。速度極快，完全不佔用廚房資源。在網頁世界中，這就是 NGINX 直接把寫好的 HTML/CSS/JS 檔案丟給瀏覽器。
2. **反向代理伺服器 (Reverse Proxy) ➡️ 「櫃檯收銀員」**：
   - _生活範例_：客人點餐時，只能對著櫃檯店員點，**絕對不能也無法**直接跑進廚房找廚師。櫃檯店員聽完需求後，轉頭向廚房（後端伺服器，如 Node.js）點餐，拿到餐點後再交給客人。這樣能保護廚房的安全，客人也不用知道廚房到底有幾個人、在哪裡。
3. **負載均衡器 (Load Balancer) ➡️ 「帶位與分流排隊的服務生」**：
   - _生活範例_：店裡生意太好，廚房開了三個出餐窗口（後端伺服器 A, B, C）。此時門口有一位引導員，看到有客人來，就均勻地把客人分配到人最少的窗口點餐，避免某一個窗口的廚師累死，而其他人在旁邊閒晃。
4. **快取伺服器 (API Cache) ➡️ 「保溫箱裡提早做好的招牌便當」**：
   - _生活範例_：店裡的招牌排骨便當每 10 秒就有人點。如果每次點餐廚師都要重新現炸排骨（去資料庫撈資料、進行複雜運算），肯定來不及。於是店員提早做好 20 個放在櫃檯保溫箱（快取）。客人一點，店員直接從保溫箱拿給他，完全不需要驚動後方廚房重新做一次。

:::tip[💡 深入思考：如果客人要加辣/客製化（每次下的資料庫條件不同）怎麼辦？]

- **快取鍵值 (Cache Key)**：NGINX 會把「網址 + 參數」組合成一個獨一無二的暗號（例如 `GET /api/products?id=1` 是一個暗號，`GET /api/products?id=2` 是另一個）。NGINX 會去保溫箱找有沒有對應這個「暗號」的便當。如果有就直接給（Cache Hit），沒有就請廚房現做，做好後再塞進保溫箱（Cache Miss）。
- **什麼該快取？**：並非所有資料都適合快取。
  - **適合**：商品列表、技術文章（大家看都一樣、短時間內不會變的資料）。
  - **不適合**：購物車、個人會員資料、每次查詢條件都隨機且極具個人化的動態資料。後端會透過 Header（如 `Cache-Control: no-cache`）通知 NGINX 絕對不能把這類便當放進保溫箱。

:::

---

## 安裝步驟 (Installation)

### 1. Linux (Ubuntu/Debian) 原生安裝

```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Docker 容器啟動

啟動指令範例：

```bash
docker run --name nginx -p 8080:80 -d nginx:latest
```

---

## 指令詳解 (Commands)

為了方便快速查閱，以下將 NGINX 在 **Linux 原生環境**與 **Docker 容器環境**底下的控制指令整理成直接對照表：

| 動作項目                | Linux 原生指令 (實機部署)                                    | Docker 容器指令 (容器部署)              | 核心概念與說明                                                         |
| :---------------------- | :----------------------------------------------------------- | :-------------------------------------- | :--------------------------------------------------------------------- |
| **啟動服務 (Start)**    | `sudo systemctl start nginx`                                 | `docker start nginx`                    | 啟動 NGINX 服務。在 Docker 下代表啟動該容器。                          |
| **停止服務 (Stop)**     | `sudo systemctl stop nginx`                                  | `docker stop nginx`                     | 關閉 NGINX 服務。在 Docker 下代表停止該容器。                          |
| **重啟服務 (Restart)**  | `sudo systemctl restart nginx`                               | `docker restart nginx`                  | 完整關閉並重新啟動服務（**會造成短暫停機**，Production 環境不推薦）。  |
| **測試設定檔 (Test)**   | `sudo nginx -t`                                              | `docker exec -it nginx nginx -t`        | **極度重要！** 修改 any 設定檔後必跑，用來靜態檢查語法是否正確。       |
| **熱重載設定 (Reload)** | `sudo systemctl reload nginx`<br />或 `sudo nginx -s reload` | `docker exec -it nginx nginx -s reload` | **最常用！** 在不停機、不中斷連線的情況下，讓 NGINX 重新載入最新設定。 |
| **運作狀態 (Status)**   | `sudo systemctl status nginx`                                | `docker ps`                             | 檢查 NGINX 服務或容器目前是活著還是死掉。                              |
| **查詢版本 (Version)**  | `nginx -v`                                                   | `docker exec -it nginx nginx -v`        | 查詢目前運行的 NGINX 版本號。                                          |

:::note[💡 systemctl 指令的細節說明]

`systemctl` 本身沒有提供「測試設定檔」的指令。因此在 Linux 上修改完設定後，我們必須使用原生核心指令 `sudo nginx -t` 來進行語法測試，確認無誤後再跑 `systemctl reload`。

:::

### 🔍 深度拆解核心指令

對於剛接觸 NGINX 的新手來說，單看上面的表格可能還是不太踏實。以下我們把最核心的三個觀念與指令拿出來，用最白話的方式深入了解它們是怎麼運作的：

#### 1. 每次修改後的護身符：`nginx -t`

- **它是什麼？**
  `-t` 代表 **Test (測試)**。當你修改了任何 NGINX 的設定檔（例如 `nginx.conf` 或 `default.conf`），在還沒有套用前，你都必須先執行這個指令。它就像是程式碼的編譯器檢查。
- **它在檢查什麼？**
  1. **語法錯誤**：例如漏掉了分號 `;`、花括號 `{}` 沒對齊，或是打錯了指令名稱（例如把 `listen` 打成 `listn`）。
  2. **檔案與路徑是否存在**：如果你在設定檔中指定了某個 SSL 憑證路徑，或是某個網頁根目錄路徑，它會順便幫你確認該路徑是否存在，以及 NGINX 是否有權限讀取。
- **實際輸出對照**：
  - **當設定完全正確時**：
    ```text
    nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    nginx: configuration file /etc/nginx/nginx.conf test is successful
    ```
    _💡 看到 `syntax is ok` 和 `test is successful` 這兩行，就代表你可以放心地載入新設定了。_
  - **當你漏掉分號時（例如第 83 行漏了分號）**：
    ```text
    nginx: [emerg] invalid number of arguments in "listen" directive in /etc/nginx/conf.d/default.conf:83
    nginx: configuration file /etc/nginx/nginx.conf test failed
    ```
    _💡 NGINX 會非常貼心地告訴你是哪一個檔案的哪一行 (default.conf:83) 出了問題，讓你不需要自己撈針。_

---

#### 2. 熱重載 `reload` 與重啟 `restart` 的本質差別

很多新手在修改完設定後，習慣直接下 `restart`（重啟）。雖然這能解決問題，但在上線運作的網站 (Production) 中，這是非常危險的行為。

*   **重啟 (Restart) ＝ 熄火換輪胎 🚗 🚫**
    *   **運作機制**：完整關閉目前的 NGINX 服務，然後再重新開啟。
    *   **缺點**：在關閉到重啟的這短短幾毫秒或幾秒鐘內，網站是**完全斷線**的。正在連線下載大檔案、或者是打 API 傳輸資料的用戶會直接看到「連線失敗」，造成不必要的服務中斷。
*   **熱重載 (Reload) ＝ 行駛中默默換輪胎 🚗 🔄**
    *   **運作機制**：網站**不停機**，連線**不中斷**。
    *   **底層優雅執行的三步驟**：
        1.  **驗證**：當你下 `nginx -s reload` 時，NGINX 主進程 (Master) 會在後台自動跑一次 `nginx -t` 檢查新設定檔語法。如果語法有錯，它會拒絕載入並拋出警告，但此時**舊的網站依然依照舊設定正常運作**，不會崩潰。
        2.  **啟動新進程**：如果檢查無誤，主進程會啟動一組全新設定的「新工作進程 (New Worker Processes)」來接手此後進來的所有新連線。
        3.  **優雅退役 (Graceful Shutdown)**：對於那些還在處理舊連線的「舊工作進程 (Old Worker Processes)」，主進程會保持它們運作，直到它們把手頭上的舊連線事情做完、傳輸完檔案後，才把它們關閉。

:::caution[⚠️ 老手實務叮嚀：不要隨意 Restart 生產環境！]

在線上 Production 環境中，**絕對不要輕易執行 restart**。每次修改設定，請務必養成這套標準動作：
1. 先跑 `sudo nginx -t` 確認語法無誤。
2. 接著跑 `sudo nginx -s reload` 熱重載，達成「零停機時間」的無痛配置更新。

:::

---

#### 3. 拆解 Docker 環境下的 Reload 指令

在 Docker 環境中，我們經常會執行這行指令：

```bash
docker exec -it nginx nginx -s reload
```

這行指令對新手來說看起來很長，我們把它拆成四個部分來理解：

1. `docker exec`：告訴 Docker「我要在一個已經啟動的容器內執行指令」。
2. `-it`：`-i` (interactive) 代表互動模式，`-t` (tty) 代表分配虛擬終端機，讓我們能看到輸出並即時互動。
3. `nginx`：指定要在名叫 `nginx` 的容器中執行。
4. `nginx -s reload`：這是要在容器內部執行的實際 Nginx 重載命令。

### 實務演練：觀察 Nginx 的錯誤修復機制

1. 在本地建立一個帶有錯誤的設定檔 `error.conf` (例如故意漏掉分號)，然後複製進容器：
   ```bash
   echo "server { listen 80; server_name localhost }" > error.conf
   docker cp error.conf nginx:/etc/nginx/conf.d/default.conf
   ```
2. 執行語法測試，觀察 Nginx 是如何明確幫您抓出錯誤行數的：
   ```bash
   docker exec -it nginx nginx -t
   ```
   _(你會看到輸出報錯：`invalid parameter "server_name" in default.conf:3`)_
3. 修正本地的 `error.conf` 檔案（在 `listen 80` 後補上分號 `;`），重新複製進容器並再次測試：
   ```bash
   docker cp error.conf nginx:/etc/nginx/conf.d/default.conf
   docker exec -it nginx nginx -t
   ```
   _(此時會順利看到 `syntax is ok` 與 `test is successful`！)_

### 實驗二：體驗熱重載 `reload` 的安全防禦機制

1. 測試通過後，下達熱重載指令，讓 Nginx 套用修改：
   ```bash
   docker exec -it nginx nginx -s reload
   ```
2. **刺激的來了！** 我們把設定檔改回有錯誤的版本（漏掉分號），並故意「不跑測試，強行 reload」：
   ```bash
   echo "server { listen 80 server_name localhost; }" > error.conf
   docker cp error.conf nginx:/etc/nginx/conf.d/default.conf
   docker exec -it nginx nginx -s reload
   ```
   _(此時會看到 reload 噴出錯誤 log)_
3. **觀察結論**：雖然 reload 失敗了，但是你可以去瀏覽器重新整理 [http://localhost:8080](http://localhost:8080)，你會發現**網頁依然活得好好的，網站完全沒有斷線崩潰！** 這是因為 Nginx 主程序在 reload 時若偵測到錯誤，會直接拒絕套用，並維持記憶體中上一版正確的設定運作。
