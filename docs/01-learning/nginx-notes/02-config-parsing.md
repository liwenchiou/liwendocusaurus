---
id: config-parsing
title: Nginx 核心設定檔解析
sidebar_label: "\u200B2 核心設定檔解析"
sidebar_position: 2

description: "Nginx 核心設定檔解析 Nginx 的強大之處在於其高效率的設定檔結構。本章節將深入剖析 nginx.conf 的巢狀區塊結構（五大 Context），並透過餐飲集團的擬人化比喻，幫助您輕鬆理解全域、事件、HTTP、Server 以及 Location 各區塊的職責與繼承覆寫規則。 nginx...."
keywords: [Nginx, 核心設定檔解析, learning, nginx-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Nginx 核心設定檔解析",
        "datePublished": "2026-07-08T13:51:33.492Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Nginx 核心設定檔解析 Nginx 的強大之處在於其高效率的設定檔結構。本章節將深入剖析 nginx.conf 的巢狀區塊結構（五大 Context），並透過餐飲集團的擬人化比喻，幫助您輕鬆理解全域、事件、HTTP、Server 以及 Location 各區塊的職責與繼承覆寫規則。 nginx...."
      }
    `}
  </script>
</Head>


# Nginx 核心設定檔解析

Nginx 的強大之處在於其高效率的設定檔結構。本章節將深入剖析 `nginx.conf` 的巢狀區塊結構（五大 Context），並透過餐飲集團的擬人化比喻，幫助您輕鬆理解全域、事件、HTTP、Server 以及 Location 各區塊的職責與繼承覆寫規則。

## `nginx.conf` 架構剖析

### 1. 核心區塊架構（層級關係）
NGINX 的設定檔是由巢狀的「區塊 (Context)」組成的，外層區塊的設定會被內層繼承。主要架構如下：

```nginx
# 1. 全域區塊 (Global Context) - 影響整個 NGINX 伺服器的核心運作
user nginx;
worker_processes auto;
error_log /var/log/nginx/error_log warn;

events {
    # 2. 事件區塊 (Events Context) - 處理網路連線的基礎設定
    worker_connections 1024; # 每個 Worker 最大連線數
}

http {
    # 3. HTTP 區塊 (HTTP Context) - 所有網頁服務的通用設定 (如 Mime-type, Gzip, Log 格式)
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        # 4. 伺服器虛擬主機區塊 (Server Context) - 代表「一個網站/網域」
        listen 80;
        server_name example.com;
        
        location / {
            # 5. 定位區塊 (Location Context) - 根據網址路由路徑，決定怎麼處理請求
            root /usr/share/nginx/html;
            index index.html;
        }
    }
}
```

### 2. 🔌 核心疑問：Nginx 真的只靠這一個 nginx.conf 控制嗎？
這是新手非常容易產生的觀念盲點。答案是：**「是的，但它通常會拉上很多幫手一起控制。」**

為了更好理解，我們可以把 Nginx 的設定檔管理比喻為一個**「大活頁夾」**的運作機制：
* **`nginx.conf` ➡️ 活頁夾外殼與總綱領**：這是一個大活頁夾的外皮，上面印著「Nginx 運作手冊」。外皮裡面本身只寫了最基本的幾條核心規定（例如董事會成員是誰、公司核心章程）。
* **`include` 指令 ➡️ 活頁夾內建的「透明內頁插槽」**：總綱領中有些地方留空，裝了透明插槽並寫著：`include /etc/nginx/conf.d/*.conf;`。這意思就是說：「請把 `/etc/nginx/conf.d/` 這個資料夾下的所有紙張，**統統插到這裡來拼裝讀取**。」
* **子設定檔 (如 `default.conf`) ➡️ 塞入插槽的「獨立活頁紙」**：這是一張張寫著具體分店規則的活頁紙（例如 `default.conf` 裡寫的 `server { ... }` 網站規則）。Nginx 啟動時，會自動把這些紙張的內容合併，拼裝成一本完整的「大運作手冊」。

這就是為什麼：
1. 我們在 Docker 實驗中修改的檔案是 `default.conf`，而不是 `nginx.conf`。
2. `default.conf` 裡面只寫了 `server { ... }` 區塊，卻能正常運作。因為它已經被 `include` 默默拼裝進 `nginx.conf` 的 `http { ... }` 裡面了！

#### 📂 視覺化設定檔關係樹狀圖
```text
/etc/nginx/ (Nginx 設定主目錄)
├── nginx.conf (總指揮官：主設定檔)
│    └── [裡面包含指令：include /etc/nginx/conf.d/*.conf;]
│
└── conf.d/ (存放獨立活頁紙張的資料夾)
     ├── default.conf (獨立活頁紙 A) ──────┐
     ├── shop.conf    (獨立活頁紙 B) ──────┼── 啟動時自動「複製貼上」到主設定檔中
     └── blog.conf    (獨立活頁紙 C) ──────┘
```

*💡 為什麼要這樣拆分？*
當你的伺服器同時要託管多個不同的網站（例如 `shop.com`、`blog.com`）時，你可以建立 `shop.conf` 與 `blog.conf` 分開管理。這樣修改 `blog` 時就只需動 `blog.conf`，如果改錯了也只有部落格會受影響，其他網站（如購物車）依然能安全運行，大大提升維護性與安全性！

---

## 🏢 Nginx 設定檔的「公司組織」與五大區塊詳解

為了讓您能徹底看懂 Nginx 設定檔的巢狀結構，我們將這五個區塊（Context）比喻為 **「Liwen 餐飲跨國集團」** 的組織架構，並對照實際的技術設定：

### 1. 全域區塊 (Global Context) ➡️ 【集團董事會/總經理】
* **集團職責**：決定整家企業要用什麼身分註冊、要開幾間分店、Log 錯誤日記要寫得多詳細。它管的是最上層、攸關公司生死與系統安全的規定。
* **常見核心指令白話翻譯**：
  * `user nginx;` ➡️ **防駭安全守則**：
    * *白話比喻*：運作時一律只能使用低權限的基層員工 `nginx` 帳號來拿檔案，絕對不准用最高權限的 `root` 總經理身分。
    * *技術解析*：限制 NGINX 運行的系統帳號，防止網頁伺服器被駭客控制後取得整個系統的最高管理權。
  * `worker_processes auto;` ➡️ **人事辦公室指令**：
    * *白話比喻*：自動偵測這台主機的 CPU 有幾個核心，就開幾個 Worker 辦公室（進程）來處理業務。
    * *技術解析*：設定 NGINX 要啟動多少個工作進程 (Worker Processes)。設為 `auto` 會自動對應 CPU 核心數，達到最佳效能。
  * `error_log /var/log/nginx/error.log warn;` ➡️ **日誌規定**：
    * *白話比喻*：定義重大錯誤日誌寫在哪，且只記錄警告 (`warn`) 以上事件，避免寫入太多無用細節撐爆硬碟。
    * *技術解析*：設定錯誤日誌的路徑與紀錄層級（如 `debug`, `info`, `warn`, `error`）。

### 2. 事件區塊 (events Context) ➡️ 【客服部/接線生】
* **集團職責**：負責規劃「客人打電話進來的排隊機制與接待限制」。
* **常見核心指令白話翻譯**：
  * `worker_connections 1024;` ➡️ **電話線路限制**：
    * *白話比喻*：規定每個 Worker 辦公室同時最多只能拉 1024 條電話線（處理 1024 個連線）。
    * *技術解析*：設定每個工作進程最大能處理的網路連線數。
    * *💡 新手數學題*：如果你的 `worker_processes` 是 `4`，那這家店同時最多能承載 `4 * 1024 = 4096` 個併發連線 (Concurrent Connections)。

### 3. HTTP 區塊 (http Context) ➡️ 【營業部總部】
* **集團職責**：制定全集團所有網站（分店）都要共同遵守的「通用營業政策（網頁傳輸協定）」。
* **常見核心指令白話翻譯**：
  * `include mime.types;` ➡️ **通用菜單**：
    * *白話比喻*：把外部的「檔案格式對照表」塞進來，在把檔案交給客人時，告訴瀏覽器這是 CSS 還是 HTML，避免瀏覽器看不懂。
    * *技術解析*：載入 MIME 檔案對照表，讓 NGINX 知道不同副檔名應對應的 `Content-Type` 檔頭。
  * `default_type application/octet-stream;` ➡️ **預設處理**：
    * *白話比喻*：如果客人要的檔案格式不在菜單上，預設一律當作二進位檔案，直接讓瀏覽器下載。
    * *技術解析*：當檔案格式未在 MIME 表中定義時，預設使用的網頁回傳類型（通常會觸發瀏覽器下載）。

### 4. 伺服器區塊 (server Context) ➡️ 【具體的分店 / 櫃檯】
* **集團職責**：代表「某一家具體的分店」。它聽從營業總部（HTTP）的規範，但有自己的店名和專屬的點餐窗口。
* **常見核心指令白話翻譯**：
  * `listen 80;` ➡️ **點餐窗口**：
    * *白話比喻*：這家分店只在 `80` 號窗口（HTTP 標準連接埠）服務客人。
    * *技術解析*：指定該網站要監聽的連接埠號。
  * `server_name example.com;` ➡️ **分店招牌**：
    * *白話比喻*：我的店名招牌叫 `example.com`。去其他網域的客人請去別的分店。
    * *技術解析*：此虛擬主機對應的網域名稱，NGINX 會依此分配請求給正確的 `server` 區塊。

### 5. 定位區塊 (location Context) ➡️ 【店內的專門窗口 / 路由】
* **集團職責**：代表「分店內的具體服務櫃檯」，針對不同的網址路徑提供專屬服務。
* **常見核心指令白話翻譯**：
  * `root /usr/share/nginx/html;` ➡️ **資源存放處**：
    * *白話比喻*：來這個櫃檯的客人，一律去主機的 `/usr/share/nginx/html` 資料夾拿對應的檔案給他。
    * *技術解析*：設定此路由路徑在伺服器實體硬碟上的網頁根目錄路徑。
  * `index index.html;` ➡️ **預設首頁**：
    * *白話比喻*：如果客人只說要參觀這個櫃檯（沒有指定具體檔名），預設直接把 `index.html` 遞給他。
    * *技術解析*：當訪問路徑為目錄時，預設回傳的網頁檔案檔名（依序尋找）。
  * `proxy_pass http://localhost:3000;` ➡️ **外包代工**：
    * *白話比喻*：這個櫃檯不自己做餐點，客人點的餐一律轉發給後方的 Node.js 廚師（`localhost:3000`）處理，做好後再由我們端給客人。
    * *技術解析*：反向代理轉發指令，將進入此 Location 的請求全部代理傳送至指定的後端伺服器位址。

---

## 🔄 繼承與覆寫 (Inheritance & Override)

NGINX 設定檔具有非常強大的「繼承」觀念。外層 Context 的指令會自動被內層繼承。

:::warning[💡 新手常踩的作用域陷阱：修改全站檔案上傳上限，該寫在哪？]

* **問題**：如果我們想把所有網站的檔案上傳上限改為 `10MB`，應該寫在 `Global`（董事會）還是 `HTTP`（營業部總部）？
* **解答**：必須寫在 **`HTTP` 區塊**。
* **為什麼？**：因為 `Global` 最外層只管系統底層的核心硬體運作（如開幾個 Worker、用什麼系統帳號）。它**完全不懂任何網頁 (HTTP) 的規矩**。凡是跟網頁協議、檔案上送、快取相關的指令，起跑點一律要在 `http { ... }` 內部。若寫在最外層，Nginx 會因為作用域錯誤而直接拒絕啟動。

:::

---

### 實務演練：以 `www.liwen.studio` 與 `litool.liwen.studio` 為例

#### 1. 繼承規則 (Inheritance)
我們在 `nginx.conf` 的 `http` 營業總部寫下限制：

```nginx
http {
    client_max_body_size 10m; # 全集團預設限制上傳 10MB
    
    # www.liwen.studio 分店 (自動繼承 10MB 限制)
    server {
        server_name www.liwen.studio;
    }

    # litool.liwen.studio 分店 (自動繼承 10MB 限制)
    server {
        server_name litool.liwen.studio;
    }
}
```
因為這兩個 `server` 都被包含在 `http` 區塊內，所以它們都會默默繼承並遵守最大 `10MB` 的上傳限制。

#### 2. 覆寫規則 (Override)
如果今天 `litool.liwen.studio`（工具站）的「大檔上傳櫃檯 (`/upload`)」需要特別允許上傳到 `100MB`，我們不需要去改全集團的規則，只需在它自己的 `location` 區塊中**覆寫**它：

```nginx
# litool.liwen.studio 分店設定檔
server {
    server_name litool.liwen.studio;

    # 其它一般的網頁路徑 (依然繼承 10MB 限制)
    location / {
        root /var/www/litool;
    }

    # 專門的大檔上傳窗口 (局部覆寫為 100MB 限制)
    location /upload {
        client_max_body_size 100m; # 只有這裡放寬至 100MB
        root /var/www/litool/uploads;
    }
}
```
這樣一來，Nginx 在處理 `litool.liwen.studio/upload` 的請求時，會優先採用最內層的 `100m`。而前往其他網址的使用者，依然會受到 `10m` 的安全限制。這就是「層層包裹、內層優先」的覆寫規則。