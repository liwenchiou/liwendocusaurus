---
id: 08-schedule
title: ⏰ 時間與排程
sidebar_label: "時間與排程"
sidebar_position: 8
description: "掌控 Linux 系統時間與任務排程：涵蓋 date 時間推算、timedatectl 現代化時間管理、以及 crontab 與 at 自動化腳本執行。"
keywords: [Linux, date, timedatectl, chrony, crontab, at, schedule]
---

# 時間與排程

在系統維運中，「時間」是非常敏感的。如果伺服器時間不準，輕則導致 Log 順序錯亂，重則會讓 SSL 憑證失效、資料庫同步失敗。
本章節將帶你學會如何校正系統時間，以及如何設定自動化排程任務。

### 1. 系統時間管理

#### `date` (檢視與設定系統時間)

最基本的時間指令，用來快速查看現在的系統時間。它最強大的地方在於**「客製化時間格式輸出」**以及**「時間推算」**，這是寫 Shell Script 產生自動化備份檔名時的必備神技。

- **實戰操作與多種格式應用**：

  ```bash
  $ date
  # 預設輸出範例：Fri Jul 24 14:00:00 CST 2026

  # --- 1. 常用格式化參數 ---
  # %Y(西元年), %m(月), %d(日), %H(時), %M(分), %S(秒)
  # ⚠️ 注意：自訂格式必須以 + 開頭！

  # 寫 Script 必備：產生 YYYYMMDD_HHMMSS 連續字串 (常作為備份檔名後綴)
  $ date +"%Y%m%d_%H%M%S"
  # 輸出範例：20260724_140000

  # 產生給人類看的標準格式 (YYYY-MM-DD HH:MM:SS)
  $ date +"%Y-%m-%d %H:%M:%S"
  # 輸出範例：2026-07-24 14:00:00

  # --- 2. 時間推算 (-d 參數，非常強大) ---
  # 取得「昨天」的日期 (常用於備份昨天的 Log)
  $ date -d "yesterday" +"%Y-%m-%d"
  # 輸出範例：2026-07-23

  # 取得「3 天後」的日期
  $ date -d "3 days" +"%Y-%m-%d"
  # 輸出範例：2026-07-27

  # 取得「1 個月前」的日期
  $ date -d "1 month ago" +"%Y-%m-%d"

  # --- 3. 手動設定系統時間 (需 root 權限) ---
  # 傳統強制改時間的方法 (格式：YYYY-MM-DD HH:MM:SS)
  $ sudo date -s "2026-07-24 12:00:00"
  ```

#### `sleep` (讓程式睡一下)
這是 Shell Script 裡面控制時間最基本也最常用的指令。它會強迫終端機或腳本暫停執行指定的秒數（或分、時）。
- **實戰操作與輸出**：
  ```bash
  # 暫停 3 秒鐘
  $ sleep 3
  
  # 經典情境：重啟服務後，等 3 秒讓它完全啟動，再去檢查狀態
  $ systemctl restart nginx && sleep 3 && systemctl status nginx
  ```

#### `timedatectl` (現代化時間管理工具)

在較新的 Linux 發行版（有 Systemd 的系統）中，`timedatectl` 已經取代了許多傳統的指令，它是管理時區與時間同步的終極武器。

- **實戰操作與輸出**：

  ```bash
  $ timedatectl
  # 輸出範例：
                 Local time: Fri 2026-07-24 14:05:00 CST
             Universal time: Fri 2026-07-24 06:05:00 UTC
                   Time zone: Asia/Taipei (CST, +0800)
  System clock synchronized: yes  <-- 確保這裡是 yes，代表校時成功！
                NTP service: active

  # 快速修改系統時區為台北
  $ sudo timedatectl set-timezone Asia/Taipei

  # --- 手動設定時間 (現代版) ---
  # 注意：如果 NTP 網路校時開著，你會無法手動改時間！必須先關閉：
  $ sudo timedatectl set-ntp false
  # 接著才能手動設定時間
  $ sudo timedatectl set-time "2026-07-24 12:00:00"
  ```

  :::tip[💡 深入思考：為什麼伺服器通常都預設使用 UTC 時間？]
  **UTC (世界協調時間)** 是全球標準時間。在上面的 `timedatectl` 輸出中，你會看到 `Universal time (UTC)` 與 `Local time` (本地時間，如台灣是 +08:00)。

  在跨國企業、微服務或雲端架構中，**強烈建議將所有伺服器與資料庫的時區統一設定為 UTC (即 +0000)**！
  這是為了避免「時區災難」：假設你在台灣伺服器寫入了一筆資料，然後傳送到位於美國的資料庫，如果兩邊都用自己的本地時間，這筆資料的時間戳記就會完全錯亂。業界標準的做法是：**伺服器底層一律儲存 UTC 時間，等到資料要顯示給使用者看時，再交由前端（瀏覽器或 App）根據使用者的裝置時區轉換為本地時間。**
  :::

#### `hwclock` (硬體時鐘管理)

你的伺服器主機板上有一顆水銀電池，負責維持「硬體時鐘 (Hardware Clock, RTC)」。Linux 系統啟動時會去讀取硬體時間，然後維護自己的「系統時間」。

- **實戰操作與輸出**：

  ```bash
  # 檢視硬體時間
  $ sudo hwclock --show

  # 將目前的系統時間「寫入」硬體時鐘 (避免重開機後時間又跑掉)
  $ sudo hwclock -w
  ```

### 2. 網路校時 (NTP 服務)

早期 Linux 多用 `ntpd`，但現在主流已經全面轉換為更輕量、更準確的 **Chrony**。

#### `chronyd` (NTP 校時背景服務)

這是負責在背景默默去跟網路天文台對時的 Daemon (守護行程)。只要它有在跑，你的伺服器時間就會永遠精準。

- **實戰操作**：
  ```bash
  # 檢查 chronyd 服務是否有開機自動啟動並正在運行
  $ systemctl status chronyd
  ```

#### `chronyc` (Chrony 的控制台)

用來查詢目前 `chronyd` 對時的狀態與來源。

- **實戰操作與輸出**：
  ```bash
  # 查看目前跟哪些網路校時伺服器連線
  $ chronyc sources
  # 輸出範例：
  MS Name/IP address         Stratum Poll Reach LastRx Last sample
  ===============================================================================
  ^* tock.stdtime.gov.tw           2   6    17    12   -100us[ -120us] +/-   15ms
  # 💡 最左邊出現 ^* 代表目前正在精準使用這台伺服器當作主要時間標準！
  ```

### 3. 自動化排程：`crontab` 與 `at`

身為工程師，我們不該手動做重複的事情。「每個禮拜天半夜兩點備份資料庫」這種事，就該交給 `crontab`。

#### `crontab` (設定定時任務)

- **實戰操作**：

  ```bash
  # 編輯當前使用者的排程表 (非常重要：不要跟 sudo 混用，除非你要以 root 身分執行！)
  $ crontab -e

  # 列出目前的排程表
  $ crontab -l
  ```

#### 排程的時間格式：`分 時 日 月 星期 指令`

設定檔裡面的時間格式是由 5 個星星組成的，口訣是：**「分、時、日、月、週」**。

- `*` 代表不限制（Every）
- `,` 代表分隔（例如 `1,15` 代表 1 號跟 15 號）
- `/` 代表每隔多久（例如 `*/5` 代表每 5）

- **實戰範例**：

  ```bash
  # 每天半夜 2:00 執行備份腳本
  0 2 * * * /opt/scripts/backup.sh

  # 每 5 分鐘檢查一次系統狀態，並將結果附加到 log 檔 (這就是我們剛學過的 >> 重導向！)
  */5 * * * * /opt/scripts/check.sh >> /var/log/check.log
  ```

:::info[🛠️ 實用工具推薦：Crontab 時間產生器]

5 個星星的格式常常讓人背了又忘、忘了又背？甚至怕設錯時間把伺服器搞垮？
別擔心！你可以直接使用我們專為工程師打造的 **[Crontab 排程產生器](https://litool.liwen.studio/tools/cron-generator)**。
這是一個視覺化的工具，只要點一點按鈕，就能幫你翻譯出精準的 `crontab` 語法，還會附上白話文解釋，絕對不會再設錯時間！

:::


#### `at` (一次性的定時任務)
`crontab` 是用來做「週期性、重複性」的排程。但如果你今天只是想：「**這支腳本我只要明天早上 8 點跑『一次』就好，跑完就不要再理它了**」，這時候用 `crontab` 設定完還要去把它刪掉非常麻煩，這就是 `at` 出場的時機！
*(註：可能需要透過 `apt install at` 或 `yum install at` 安裝)*
- **實戰操作**：
  ```bash
  # 告訴系統：明天早上 8 點幫我執行
  $ at 08:00 tomorrow
  warning: commands will be executed using /bin/sh
  at> /opt/scripts/one_time_task.sh
  at> <EOT>  # 💡 這裡要按下 Ctrl+D 存檔離開！
  job 1 at Sat Jul 25 08:00:00 2026
  
  # 檢視目前有哪些還沒執行的 at 任務
  $ atq
  ```

:::tip[🚀 進階觀念：Crontab 的現代接班人 Systemd Timers]
`crontab` 雖然經典，但它有兩個致命傷：**第一，只能精準到「分鐘」**(不能設定每 10 秒執行)；**第二，如果排程的時間點伺服器剛好在關機或重啟，該次任務就會被直接跳過**。

現代的 Linux 系統越來越傾向使用 Systemd 內建的 `timer` 來取代 Cron。因為它可以精準到秒，而且支援**「補考機制 (Catch-up)」**：只要設定了 `Persistent=true`，即使伺服器關機錯過了排程，開機後 Systemd 也會立刻幫你補執行！這對資深後端與維運工程師來說是必備的現代化知識。
:::

### 🏢 實境演練：自動化日誌備份與時間戳記

**情境背景**：
你寫了一個備份腳本 `/opt/backup.sh`，你想要：

1. 每天晚上 11:30 (23:30) 自動執行。
2. 執行時，必須印出當下的時間，證明備份有跑。
3. 把備份腳本的所有輸出，重導向到 `/var/log/backup.log` 裡面。

**你的操作流程**：

```bash
# 1. 輸入 crontab -e 進入編輯模式
$ crontab -e

# 2. 在檔案最後面加入這一行：
30 23 * * * echo "開始備份：$(date +\%Y-\%m-\%d)" >> /var/log/backup.log && /opt/backup.sh >> /var/log/backup.log 2>&1

# 解讀：
# - 30 23 * * * : 代表每天 23:30 執行。
# - $(date +\%Y-\%m-\%d) : 帶入今天的日期 (⚠️ 在 crontab 中 % 是特殊字元，必須加上反斜線 \ 跳脫！這是超常踩坑的雷點！)
# - 2>&1 : 將錯誤訊息與一般訊息一起寫入 log，這招我們在「訊息管理與重導」已經學過囉！
```