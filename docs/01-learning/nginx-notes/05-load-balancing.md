---
sidebar_position: 5

description: "Nginx 負載均衡 Load Balancing 實戰 負載均衡是解決單點故障（SPOF）與高併發流量的核心技術。當網站流量成長到單台伺服器無法承受時，我們需要透過 Nginx 的 upstream 模組將請求分流至多個後端容器實例。本章將帶您了解單點故障的系統風險，學習輪詢、權重、IP Hash..."
keywords: [Nginx, 負載均衡, Load, Balancing, 實戰, learning, nginx-notes]
---

import Head from '@docusaurus/Head';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Untitled",
        "datePublished": "2026-07-08T13:51:33.495Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "Nginx 負載均衡 Load Balancing 實戰 負載均衡是解決單點故障（SPOF）與高併發流量的核心技術。當網站流量成長到單台伺服器無法承受時，我們需要透過 Nginx 的 upstream 模組將請求分流至多個後端容器實例。本章將帶您了解單點故障的系統風險，學習輪詢、權重、IP Hash..."
      }
    `}
  </script>
</Head>


# Nginx 負載均衡 (Load Balancing) 實戰

負載均衡是解決單點故障（SPOF）與高併發流量的核心技術。當網站流量成長到單台伺服器無法承受時，我們需要透過 Nginx 的 `upstream` 模組將請求分流至多個後端容器實例。本章將帶您了解單點故障的系統風險，學習輪詢、權重、IP Hash 與最少連線數這四種主流分配策略，並探討如何針對排程任務與一般用戶進行微服務物理隔離，以及 Nginx 內建的故障自愈與重試機制。

---

## 1. 為什麼需要負載均衡？

*   **單點故障 (Single Point of Failure, SPOF) 的危機**：
    在系統設計中，如果整個網站的生死只繫於單一後端伺服器（例如單個 Node.js 進程），那麼這個元件就是「單點故障源」。它面臨著以下三種致命的實務風險：
    1.  **突發性當機 (Crash)**：後端程式因為記憶體洩漏、未處理異常而突然崩潰，導致全站連線失敗。
    2.  **流量塞爆 (Exhaustion)**：瞬間湧入的大量流量（如行銷活動）耗盡單機 CPU/RAM 資源，使用戶紛紛拿到 `504 Gateway Timeout`。
    3.  **維護性停機 (Downtime)**：當更新程式碼或重啟主機時，服務必須強制中斷。
*   **引導分流的角色 (Eliminating SPOF)**：
    Nginx 扮演「引導分流服務生」，作為唯一的流量入口。我們透過部署多個相同的後端服務實體（例如 5 個獨立 Docker 容器），配合 Nginx 做負載均衡。當用戶請求進來時，Nginx 會依分流策略將人潮分配出去。若有伺服器死機，Nginx 會在幾毫秒內自動避開它，改投其他健康的伺服器。這消除了解析 API 層的單點故障，達成「零停機時間（Zero Downtime）」的高可用性。

---

## 2. Upstream 模組基礎設定

我們使用 `upstream` 指令定義後端伺服器群組。此區塊**必須**寫在 `http` 區塊內，`server` 的外面：

```nginx
# 1. 定義名為 "my_api_servers" 的伺服器群組
upstream my_api_servers {
    server 127.0.0.1:8001; # 伺服器 A
    server 127.0.0.1:8002; # 伺服器 B
    server 127.0.0.1:8003; # 伺服器 C
}

# 2. 轉發請求
server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://my_api_servers; # 指向群組名稱
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 3. 四大分流平衡政策

Nginx 將伺服器分組後，會依據以下分流政策（Algorithm）決定帶位規則：

1.  **輪詢 (Round Robin - 預設選項)**：
    *   *規則*：依序輪流分配（1 ➡️ 2 ➡️ 3 ➡️ 1）。
    *   *適用*：每台伺服器的硬體規格完全一模一樣時。
    *   *範例*：
        ```nginx
        upstream my_api_servers {
            server 127.0.0.1:8001; # 預設即為輪詢，無須額外指令
            server 127.0.0.1:8002;
        }
        ```
2.  **權重 (Weight - 能者多勞)**：
    *   *規則*：針對硬體配備較高、或希望能多承擔流量的容器分配較高的權重比（例如 `weight=3`）。
    *   *範例*：
        ```nginx
        upstream my_api_servers {
            server 127.0.0.1:8001 weight=1; # 配備低
            server 127.0.0.1:8002 weight=3; # 配備高，分得 3 倍流量
        }
        ```
3.  **IP 雜湊 (IP Hash - 認人帶位)**：
    *   *規則*：根據用戶的 IP 計算 Hash 值，將同一個 IP 的請求**永遠綁定**分配給同一台伺服器。
    *   *適用*：後端將登入 Session 存在伺服器本機記憶體時（防止跨伺服器被踢出登入）。*註：現代無狀態 (Stateless) 架構採用 JWT 或共享 Redis，已較少依賴此策略*。
    *   *範例*：
        ```nginx
        upstream my_api_servers {
            ip_hash; # 啟用 IP Hash
            server 127.0.0.1:8001;
            server 127.0.0.1:8002;
        }
        ```
4.  **最少連線數 (Least Connections - 找最閒的)**：
    *   *規則*：Nginx 會自動檢查並將新請求分配給當前「活動連線數最少」的伺服器。
    *   *適用*：檔案下載頁或耗時較長的任務，防止某些伺服器被長連線塞爆而其他伺服器閒置。
    *   *範例*：
        ```nginx
        upstream my_api_servers {
            least_conn; # 啟用最少連線數分配
            server 127.0.0.1:8001;
            server 127.0.0.1:8002;
        }
        ```

:::note[💡 平衡政策組合使用注意事項]

Nginx 的分配演算法與權重在配置時需注意以下互斥與組合規則：

1. **主演算法互斥**：`ip_hash` 與 `least_conn` 屬於不同的分配邏輯，**不能同時啟用**。若在同一個 `upstream` 中同時宣告這兩者，Nginx 進行語法檢查（`nginx -t`）時會直接報錯拒絕啟動。
2. **權重 (Weight) 可做為配角彈性搭配**：
   * **權重 ＋ 輪詢 (預設)**：即為「加權輪詢」，流量依權重比率輪流分配。
   * **權重 ＋ 最少連線數 (實務強烈推薦)**：即為「加權最少連線數（Weighted Least Connections）」。Nginx 在衡量誰的連線數較少時，會將伺服器的效能權重算進去。例如當 A 容器效能差（連線卡住多），B 容器效能強且設定了高權重，新連線會被動態分流給能者多勞的 B 容器，是極為智能的動態分流方案。

:::

---

## 4. 實務架構：排程伺服器與使用者的「資源隔離」

在微服務實務中，若排程系統（Cron Jobs）或後台運算任務會吃掉大量 CPU，我們不應該讓它與一般使用者共用相同的伺服器池。我們可以用 Nginx 建立**兩個獨立的 Upstream 群組**來做物理隔離：

```nginx
# 使用者專用伺服器池 (A, B, C)
upstream user_backend {
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
    server 127.0.0.1:8003;
}

# 排程專用伺服器池 (D, E)
upstream cron_backend {
    server 127.0.0.1:8004;
    server 127.0.0.1:8005;
}
```

### 分流隔離設定（以最推薦的「子網域隔離」為例）
```nginx
# 1. 一般用戶訪問入口：myapp.com
server {
    listen 80;
    server_name myapp.com;

    location / {
        proxy_pass http://user_backend; # 分流給 A, B, C
    }
}

# 2. 排程/後台系統入口：cron.myapp.com
server {
    listen 80;
    server_name cron.myapp.com;

    location / {
        proxy_pass http://cron_backend; # 分流給 D, E
    }
}
```
*   **優勢**：即使 D, E 跑排程跑到 CPU 100% 滿載，使用者的 `myapp.com` 速度依然不受任何影響。

---

## 5. Nginx 的故障自愈與重試機制 (`proxy_next_upstream`)

當 Nginx 轉發請求給某台伺服器時，如果該伺服器突然死機或傳回 `502` / `504` 等錯誤：
1.  **自動改投**：Nginx 預設會啟動 `proxy_next_upstream` 機制，在幾毫秒內將請求重新投遞給群組中其他健康的伺服器。
2.  **用戶體驗**：正在連線的用戶只會感覺到網頁「多轉圈圈載入了幾毫秒」，最後依然能順利看到正常畫面，不會跳出任何 Error，達成完美的無痛容錯。

### ⚙️ 實務配置範例

我們可以在 `location` 區塊中，主動宣告在哪些錯誤狀況下要觸發自動重試：

```nginx
location / {
    proxy_pass http://my_api_servers;
    
    # 核心指令：當遇到連線錯誤、超時、無效 Header，或是後端回傳 502/503/504 狀態碼時
    # Nginx 會自動將同一個請求，重新投遞給下一台健康的後端伺服器
    proxy_next_upstream error timeout invalid_header http_502 http_503 http_504;
}
```