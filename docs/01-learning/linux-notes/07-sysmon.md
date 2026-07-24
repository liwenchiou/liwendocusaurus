---
id: 07-sysmon
title: 🐧 系統資源檢視
sidebar_label: "\u200B📊 系統資源檢視"
sidebar_position: 7
description: "伺服器效能監控實戰：學會使用 top、htop、ps、free、df 等工具，並透過 iostat 與 sar 精準找出拖垮系統的效能瓶頸。"
keywords: [Linux, top, htop, ps, free, df, uptime, iostat, sar]
---

# 系統資源檢視

身為一個系統管理員（或是後端工程師），當你收到客訴說「網站好慢！」或「伺服器掛了！」的時候，你不能只會重開機。這時候你需要一系列的「診斷工具」來幫系統把脈。

本章將這些工具分為三大類：**CPU 與程序 (Process) 監控**、**記憶體與磁碟檢視**、**進階效能與網路診斷**。

### 1. CPU 與程序 (Process) 監控

#### `top` (系統的任務管理員)

這是最常用的即時監控工具，打開後會每隔幾秒自動更新一次。它能讓你一眼看出是誰在狂吃 CPU 或記憶體。

- **實戰操作與輸出**：

  ```bash
  $ top
  # 畫面會進入互動模式，自動刷新顯示如下：
  top - 14:02:11 up 10 days,  3:14,  1 user,  load average: 0.45, 0.58, 0.60
  Tasks: 120 total,   1 running, 119 sleeping,   0 stopped,   0 zombie
  %Cpu(s): 12.3 us,  4.2 sy,  0.0 ni, 82.5 id,  1.0 wa,  0.0 hi,  0.0 si,  0.0 st
  MiB Mem :   7950.0 total,   1200.5 free,   4500.2 used,   2249.3 buff/cache
  MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   3100.5 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
   5566 node      20   0 1205420 152420  32100 S  45.0   1.9  10:25.12 node server.js
   1234 mysql     20   0 2450120 450120  15000 S   5.5   5.5   5:12.45 mysqld
  ```

  _(💡 操作小提示：在畫面中按下大寫 `P` 可依 **CPU** 排序；按下大寫 `M` 可依 **記憶體** 排序；按 `q` 即可離開。)_

#### `htop` (現代版、高顏值的 top)

雖然 `top` 是內建的經典工具，但現代工程師更愛用 `htop`。它支援滑鼠點擊、擁有彩色的 CPU 核心長條圖，而且介面更加直覺！
_(註：需透過 `apt install htop` 或 `yum install htop` 額外安裝)_

- **實戰操作與輸出**：
  ```bash
  $ htop
  # 畫面會出現彩色的 CPU [|||||||    50.5%] 長條圖
  # 最強殺手鐧：你可以直接用上下鍵選取某個程式，然後按下 F9 就能直接砍掉它，連 PID 都不用記！
  ```

#### `ps` (Process Status - 捕捉瞬間的程序快照)

不像 `top` 是動態的，`ps` 是靜態的，通常用來精準尋找某個特定的常駐程式是否活著。

- **實戰操作與輸出**：
  ```bash
  $ ps aux | grep "nginx"
  # 輸出範例：
  root      1050  0.0  0.1  55212  5120 ?        Ss   Jul15   0:00 nginx: master process
  www-data  1051  0.0  0.2  55680  8400 ?        S    Jul15   0:15 nginx: worker process
  qiuliwen  5890  0.0  0.0  12140  1024 pts/0    S+   14:10   0:00 grep --color=auto nginx
  ```
  _(💡 冷知識：`a` 代表所有使用者的程序，`u` 代表詳細格式，`x` 代表不依賴終端機的背景服務)_

#### `kill` (獵殺失控的程序)

當你用 `top` 或 `ps` 查出某個失控程式的 PID (Process ID) 後，就可以用 `kill` 把它終止。

- **實戰操作與輸出**：

  ```bash
  # 溫柔地請程序自我了斷 (預設發送 SIGTERM 訊號 15)
  $ kill 5566
  # 若成功擊殺，通常不會有任何輸出 (No news is good news)

  # 🔪 殘酷地強制擊殺 (發送 SIGKILL 訊號 9，當程式死機不回應時使用)
  $ kill -9 5566

  # 若查無此 PID，會報錯：
  # bash: kill: (5566) - No such process
  ```

#### `lsof` (List Open Files - 抓出佔用資源的隱形殺手)

在 Linux 中「一切皆檔案」（包含網路 Port 也是）。當你遇到**「Port 8080 已經被佔用」**或是**「無法解除掛載 USB，因為檔案正在被使用」**時，`lsof` 是你的唯一救星。

- **實戰操作與輸出**：

  ```bash
  # 經典情境：誰佔用了我的 8080 Port？
  $ lsof -i :8080
  # 輸出範例：
  COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
  node    5566 root   12u  IPv4  12345      0t0  TCP *:8080 (LISTEN)

  # 抓到兇手是 PID 5566 的 node 程序後，就可以用 kill -9 把它幹掉！
  ```

### 2. 記憶體與磁碟檢視

#### `free` (記憶體使用狀態)

用來查看 RAM（實體記憶體）與 Swap（虛擬記憶體）的使用量。

- **實戰操作與輸出**：

  ```bash
  $ free -h
  # 輸出範例：
                 total        used        free      shared  buff/cache   available
  Mem:           7.8Gi       4.4Gi       1.2Gi        50Mi       2.2Gi       3.1Gi
  Swap:          2.0Gi          0B       2.0Gi
  ```

  _(💡 注意：Linux 為了效能，會把還沒用到的 RAM 拿去當硬碟快取 `buff/cache`。所以系統真正的可用記憶體請看 **`available`** 這一欄，不要只看 `free`！)_

  :::tip[💡 深入思考：什麼是 Swap？為什麼看懂 Swap 很重要？]
  **Swap (虛擬記憶體/置換空間)** 其實是劃分在「硬碟」上的一塊保留區。當實體記憶體 (RAM) 真的快被榨乾時，Linux 會被迫把 RAM 裡面「最近比較少用到」的資料，暫時搬到 Swap 裡面放著，藉此騰出空間給正在執行的程式。

  **這是一個防止系統 OOM (Out of Memory) 崩潰的保命機制，但同時也是效能殺手！**
  因為硬碟的讀寫速度比 RAM 慢上好幾千倍。如果你發現 `Swap used` 的數字很高，或者 `iostat` / `top` 顯示系統卡在 I/O Wait，這代表你的伺服器正在瘋狂地把資料在 RAM 與硬碟之間搬來搬去（俗稱 Thrashing）。這時候網站會變得無敵卡，唯一的解法就是去升級機器的實體記憶體了！
  :::

#### `df` (Disk Free - 磁碟空間檢視)

用來檢查每顆硬碟分割區「還剩下多少空間」。這是最常引發伺服器崩潰的原因之一（硬碟被 Log 塞滿，導致資料庫無法寫入）。

- **實戰操作與輸出**：
  ```bash
  $ df -h
  # 輸出範例：
  Filesystem      Size  Used Avail Use% Mounted on
  /dev/sda1        50G   45G  2.5G  95% /
  tmpfs           3.9G     0  3.9G   0% /dev/shm
  /dev/sdb1       100G   20G   75G  22% /data
  ```
  _(🚨 看到 `/` 的 Use% 高達 95% 就該警覺了！)_

#### `du` (Disk Usage - 磁碟用量細節掃描)

`df` 只能告訴你「整顆硬碟滿了」，但沒辦法告訴你是誰塞滿的。這時候就必須靠 `du` 幫你掃描每個資料夾的實際大小。

- **實戰操作與輸出**：
  ```bash
  # 經典連招：列出當前目錄下所有檔案與資料夾的大小，並從大到小排序
  $ du -sh * | sort -hr
  # 輸出範例：
  45G     /var/log
  2.1G    /home
  500M    /tmp
  # 瞬間抓出 /var/log 是塞爆硬碟的元兇！
  ```

### 3. 整體狀態與進階診斷

#### `uptime` (伺服器上線時間與平均負載)

用一句話總結伺服器到底有多累。

- **實戰操作與輸出**：
  ```bash
  $ uptime
  # 輸出範例：
   14:15:22 up 105 days,  4:30,  2 users,  load average: 3.50, 1.80, 0.40
  ```
  _(💡 關鍵看 `load average`：分別代表過去 1分鐘、5分鐘、15分鐘的平均負載。如果數字大於你的 CPU 核心數，就代表系統正在大塞車！)_

#### `ethtool` (網卡硬體檢測)

當網路連線不穩時，用來檢查底層實體網卡的連線狀態、速度與雙工模式。

- **實戰操作與輸出**：
  ```bash
  $ ethtool eth0
  # 輸出範例：
  Settings for eth0:
          Supported link modes:   1000baseT/Full 10000baseT/Full
          Speed: 10000Mb/s
          Duplex: Full
          Link detected: yes
  ```

#### `iostat` (Input/Output 狀態)

專門用來監控硬碟的「讀寫速度 (I/O)」。當系統明明沒有吃 CPU 卻非常卡頓時，通常就是硬碟在排隊塞車（I/O Wait）。
_(註：需安裝 `sysstat` 套件才能使用)_

- **實戰操作與輸出**：
  ```bash
  # 加上 -x 顯示詳細資訊，-z 隱藏沒有活動的硬碟
  $ iostat -xz
  # 輸出範例：
  Device            r/s     w/s     rkB/s     wkB/s   %util
  sda              12.5   150.2    1024.5   15482.0   85.4%
  # 💡 %util 越接近 100% 代表硬碟越忙碌！
  ```

#### `sar` (System Activity Reporter - 系統活動歷史記錄)

被譽為系統分析的「黑盒子」。它會定期在背景收集 CPU、記憶體、網路等數據。當你半夜睡覺時伺服器崩潰，隔天早上就可以用 `sar` 調出昨晚的歷史數據來追查凶手。

- **實戰操作與輸出**：
  ```bash
  # 查看今天的網路流量歷史紀錄
  $ sar -n DEV
  # 輸出範例：
  12:00:01 AM     IFACE   rxpck/s   txpck/s    rxkB/s    txkB/s
  12:10:01 AM      eth0    150.25    200.10     45.50    120.30
  12:20:01 AM      eth0   5500.50   8000.20   2048.50   4096.00  # 流量突增！
  ```

### 🏢 實境演練：揪出拖垮網站的元兇

**情境背景**：
你收到警報，伺服器回應速度極慢。你必須在 1 分鐘內找到原因並解決它。

**你的除錯 SOP (Standard Operating Procedure)**：

```bash
# 1. 先看大局：系統到底有多忙？
$ uptime
# 發現 load average 高達 10.5 (但這台機器只有 4 核心，嚴重超載！)

# 2. 是誰在搞鬼？馬上開 top 抓人
$ top
# 按下大寫 P，發現有個名叫 "bad_script.sh" 的程序佔用了 99% CPU，記下它的 PID 是 5566。

# 3. 為了避免誤殺，用 ps 再次確認這個指令的完整路徑與執行者
$ ps -fp 5566

# 4. 確認是寫壞的無窮迴圈腳本，直接強制擊殺它！
$ kill -9 5566

# 5. 危機解除，網站恢復正常。
```