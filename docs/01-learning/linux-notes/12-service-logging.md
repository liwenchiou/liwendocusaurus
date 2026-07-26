---
id: 12-service-logging
title: ⚙️ 系統服務與日誌
sidebar_label: "系統服務與日誌"
sidebar_position: 12
---

# 系統服務與日誌

在 Linux 伺服器運作中，「系統服務管理 (`systemctl`)」與「系統日誌檢索 (`journalctl` / `rsyslog`)」是工程師診斷主機健康狀態的雙眸。
現代 Linux 已全面採用 **Systemd** 作為系統啟動的第一個主程序 (`PID 1`)，它不僅統一了服務的相依性與生命週期，更透過二進制日誌引擎 (`journald`) 整合了所有背景服務的標準輸出。

---

## 1. `systemctl`：服務生命週期與開機自啟控制

`systemctl` 是控制 systemd 服務的主控指令。熟記下列四大操作分類：

### 1. 服務生命週期管理

```bash showLineNumbers
# 啟動、停止、重啟服務
$ sudo systemctl start nginx
$ sudo systemctl stop nginx
$ sudo systemctl restart nginx

# 🌟 平滑重載設定 (不中斷現有連線，適用於 Nginx / Apache 修改 VirtualHost 後)
$ sudo systemctl reload nginx

# 檢查服務詳細狀態與最近 10 行 Log (故障排查的第一手診斷命令)
$ sudo systemctl status nginx
```

### 2. 開機自啟動與安全鎖死

```bash showLineNumbers
# 啟用 / 停用開機自動啟動
$ sudo systemctl enable nginx
$ sudo systemctl disable nginx

# 檢查是否設定為開機自啟
$ systemctl is-enabled nginx

# 🌟 資安/維運防呆終極手法：mask (遮蔽鎖死服務，即便其他軟體想喚醒也無法啟動)
$ sudo systemctl mask postfix     # 徹底禁止本機發信服務被誤啟動
$ sudo systemctl unmask postfix   # 解除鎖定
```

### 3. 🌟 SRE 機房巡檢神技：一秒揪出失敗服務

主機重開機或異動後，如何確定所有服務都正常啟動？執行這行命令：

```bash showLineNumbers
# 只列出目前狀態為 Failed (失敗/崩潰) 的系統服務
$ systemctl --failed
```

---

## 2. 🌟 自訂與封裝 Systemd Service (`/etc/systemd/system/*.service`) —— 【重要補充！】

企業實戰中，你不只會管內建套件，更常見的是：**我們寫了一個 Node.js/Python API、或者寫了一隻自動化監控腳本，該如何把它封裝為能夠開機自啟、崩潰自動重啟 (`Restart=always`) 的標準系統服務？**

請在 `/etc/systemd/system/` 建立副檔名為 `.service` 的 Unit 設定檔：

```ini title="/etc/systemd/system/my-api.service" showLineNumbers
[Unit]
Description=My Enterprise Node.js API Service
After=network.target mysql.service          # 關鍵：確保網路與資料庫開完才開這隻 API

[Service]
Type=simple
User=amy                                    # 關鍵：以最小權限一般帳號執行，禁止以 root 裸跑
WorkingDirectory=/opt/my-api
ExecStart=/usr/bin/node /opt/my-api/server.js
Restart=always                              # 🌟 關鍵：不論何故掛掉，系統自動幫你把程序重啟！
RestartSec=5                                # 掛掉後等待 5 秒再啟動
Environment=NODE_ENV=production
EnvironmentFile=-/opt/my-api/.env           # 引入外部環境變數檔 (- 代表不存在不報錯)

[Install]
WantedBy=multi-user.target                  # 代表在正常多用戶命令列模式下啟用
```

- **🚨 必記金律 (`daemon-reload`)**：只要建立或修改任何 `/etc/systemd/system/*.service` 檔案，**必須先告知 systemd 重新讀取配置**後才能執行！

  ```bash showLineNumbers
  # 1. 重新載入 Systemd 單元檔
  $ sudo systemctl daemon-reload

  # 2. 設定開機自啟動並立即啟動
  $ sudo systemctl enable --now my-api.service
  ```

---

## 3. `journald` 與 `journalctl`：現代二進制日誌引擎與檢索

`journald` 是 Systemd 專屬的日誌收錄引擎，它的日誌是以 **二進制 (Binary) 格式** 保存於 `/var/log/journal/`，**不可使用 `cat` 或 `vi` 直接查看**，必須使用專門的解析指令 **`journalctl`**。

- **為何使用二進制？** 檢索索引極快、防止日誌注入攻擊、並且可以精準篩選特定 PID、UID 與協定元數據。

### 1. 黃金 5 大查詢與過濾語法

```bash showLineNumbers
# 1. 🌟 最常用：追蹤並即時印出特定服務的最新日誌 (-u = unit, -f = follow)
$ sudo journalctl -u nginx -f

# 2. 查閱「自這次開機以來 (-b = boot)」的所有系統日誌
$ sudo journalctl -b

# 3. 🌟 依時間範圍篩選 (排查昨天凌晨的當機記錄)
$ sudo journalctl --since "2026-07-25 00:00:00" --until "2026-07-25 04:00:00"
$ sudo journalctl --since "1 hour ago"

# 4. 🌟 依嚴重等級過濾 (-p = priority，例如 只查 error 以上的致命錯誤 0~3)
$ sudo journalctl -p err -u mysql.service

# 5. 搭配 Kernel 參數過濾（相當於舊時代的 dmesg 查硬體與磁碟報錯）
$ sudo journalctl -k -p err
```

### 2. 🌟 拯救硬碟空間：`journald` 磁碟瘦身與上限設定 —— 【重要補充！】

常被新手忽略的災難：**伺服器跑了兩三年後，硬碟被 `/var/log/journal/` 吃掉了幾十 GB！**

```bash showLineNumbers
# 1. 查看 journald 目前總共消耗了多少磁碟空間
$ journalctl --disk-usage
Archived and active journals take up 4.8G in the file system.

# 2. 🌟 立即手動壓縮清理：只保留最近 500MB 的日誌
$ sudo journalctl --vacuum-size=500M

# 3. 🌟 立即手動清理：只保留最近 14 天內的日誌
$ sudo journalctl --vacuum-time=14d
```

> 💡 永久限制容量做法：手動修改 `/etc/systemd/journald.conf`，將 `SystemMaxUse=1G` 解除註解並設值，執行 `$ sudo systemctl restart systemd-journald` 即可永久防禦硬碟塞爆。

---

## 4. `rsyslog`：傳統純文字日誌分流與權威系統記錄 (`/var/log/*`)

儘管 `journald` 統一了現代 Linux 的輸出，企業機房中仍標配 **`rsyslog`**。它的任務是將日誌轉為**人類可閱讀的純文字格式**寫入 `/var/log/` 目錄，並負責與外部的 **Log Server (如 SIEM、ELK、Graylog)** 通訊傳輸。

### 1. 企業伺服器 4 大必備 Log 檔案路徑對照

| 日誌類型           | RedHat / Rocky / CentOS 陣營 | Ubuntu / Debian 陣營 | 主要紀錄內容                                  |
| :----------------- | :--------------------------- | :------------------- | :-------------------------------------------- |
| **全系統一般日誌** | `/var/log/messages`          | `/var/log/syslog`    | 系統開機、硬體、各類 background daemon 資訊   |
| **身分驗證與資安** | `/var/log/secure`            | `/var/log/auth.log`  | 🌟 SSH 登入成功/失敗、sudo 提權、帳號驗證軌跡 |
| **排程執行軌跡**   | `/var/log/cron`              | `/var/log/syslog`    | Crontab 每次被執行的時間點與指令              |
| **開機紀錄**       | `/var/log/boot.log`          | `/var/log/boot.log`  | 系統重啟與啟動服務清單                        |

### 2. `rsyslog.conf` 的設備與優先等級過濾語法

`rsyslog` 透過 **`[服務設備 Facility].[優先等級 Priority] [目的地 Target]`** 規則運作：

```ini title="範例：/etc/rsyslog.conf 核心語法" showLineNumbers
# 將所有授權與安全相關日誌 (authpriv)，不限等級 (*)，都寫入 secure 檔案
authpriv.*                                              /var/log/secure

# 將 mail 服務中，warning 等級以上的訊息，獨立寫入 mail.warn 檔案
mail.warn                                               /var/log/mail.warn
```

---

## 5. `logger`：自訂訊息發射器 (Shell Script 記錄日誌神器)

`logger` 是一個能將你自訂的文字字串，根據標準的 syslog 協定發送到 `journald` 與 `rsyslog` 的命令列工具。**它在自動化備份腳本、系統監控警報中極為實用！**

```bash showLineNumbers
# 1. 將一段測試訊息以 user.notice 等級、標記標題為 [BACKUP-SCRIPT] 送進系統日誌
$ logger -p user.notice -t "BACKUP-SCRIPT" "Database full backup completed successfully."

# 2. 測試發送後，一秒用 journalctl 反查出來驗證！
$ journalctl -t "BACKUP-SCRIPT" --since "5 minutes ago"
Jul 26 13:30:00 server BACKUP-SCRIPT[12345]: Database full backup completed successfully.
```

---

## 6. 🌟 `logrotate`：日誌自動輪轉與壓縮儲存 —— 【重要補充！】

**講系統日誌，絕對不能不提 `logrotate`！**
當 Nginx / Apache / MySQL 的純文字日誌 (`.log`) 每天以數十 MB 甚至 GB 的速度成長，若無人干預，硬碟很快就會因 100% 滿載而死機。`logrotate` 就是 Linux 內建負責「定期切開、壓縮打包、自動刪除過期 Log」的幕後守護者。

```ini title="/etc/logrotate.d/nginx 企業級標準設定範例" showLineNumbers
/var/log/nginx/*.log {
    daily               # 每天自動進行日誌切割輪轉 (可選 weekly, monthly)
    rotate 14           # 🌟 關鍵：系統最多保留 14 份歷史檔案，超過的會被自動刪除！
    compress            # 將切出來的舊 log 自動壓縮成 .gz 以節省空間
    delaycompress       # 延遲一天再壓縮 (讓剛發生的問題好讀取)
    missingok           # 如果找不到 Log 檔案不報錯直接跳過
    notifempty          # 如果是空檔案則不進行切割
    sharedscripts       # 底下的 postrotate 腳本在處理完所有 log 後只執行一次
    postrotate
        # 🌟 核心步驟：切換檔案後，通知 Nginx 重新開啟 Log file descriptor
        /usr/bin/systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

- **如何手動測試 `logrotate` 設定是否正確？**

  ```bash showLineNumbers
  # -d (Debug 測試模式：只顯示怎麼切，不會真的動到檔案)
  $ sudo logrotate -d /etc/logrotate.d/nginx

  # -f (Force 強制執行模式：立刻不管時間直接對該日誌進行輪轉切割驗證)
  $ sudo logrotate -f /etc/logrotate.d/nginx
  ```

---

## 7. 企業系統服務與日誌維運三大高階實戰情境 (MIS / SRE 經驗談)

### 情境一：微服務或應用程式在特定時間神秘崩潰無回應，如何追兇？

- **狀況描述**：使用 Node.js 撰寫的 API 服務 (`api.service`) 在凌晨 3 點突然當機，沒有留下顯而易見的報錯字眼。
- **根因與診斷金律**：
  - 可能是由於記憶體暴增遭 Linux 核心 **OOM (Out Of Memory) Killer 獵殺**，或是程式遇到非預期的 Fatal Exception 導致 Systemd 觸發退離。
  - **診斷指令 1（查閱 API 的 致命錯誤排錯 log）**：
    ```bash
    $ sudo journalctl -u api.service --since "03:00" --until "03:15" -p err -o json-pretty
    ```
  - **診斷指令 2（查閱系統 Kernel 是否發動 OOM Killer）**：
    ```bash
    # 利用 -k 查看內核訊息，過濾 out of memory 或 oom 關鍵字
    $ sudo journalctl -k | grep -i "out of memory"
    ```

### 情境二：自訂服務出現 `Main process exited, code=exited, status=203/EXEC` 啟動報錯

- **狀況描述**：建立好 `/etc/systemd/system/my-task.service` 並下 `$ sudo systemctl start my-task`，系統直接跳錯 `Failed to start... status=203/EXEC`。
- **根因與解決金律**：
  - Systemd 的 **`203/EXEC` 錯誤碼** 代表 **「作業系統拒絕執行或找不到執行檔」**。常見於三個根因：
    1. 檔案沒有給予可執行權限 (UGO 中的 `x`)。
    2. 腳本第一行的 Shebang (例如 `#!/opt/venv/bin/python`) 指向了一個不存在的直譯器路徑。
    3. `ExecStart=` 寫了相對路徑（Systemd **強制要求必須使用絕對路徑**，不能用 `./server.sh`）。
  - **解決做法**：執行 `$ ls -la /opt/app/start.sh` 確認檔案屬性與權限，加上 `$ chmod +x` 並修正絕對路徑後重新 `daemon-reload` 即可解決。

### 情境三：硬碟空間突然 100% 報警，如何聯查 `journald` 與輪轉未刪除的過期 Log？

- **狀況描述**：監控系統通報主機空間全滿，想要立即清出空間拯救伺服器。
- **排查與安全清理 SOP**：

  ```bash showLineNumbers
  # Step 1: 先看是否是 journald 佔用過多
  $ journalctl --disk-usage
  # 若大於 1GB，立即修剪：
  $ sudo journalctl --vacuum-size=500M

  # Step 2: 檢查 /var/log/ 下是否存在異常巨大的舊日誌或未刪除的封存檔 (.1 / .gz)
  $ sudo du -sh /var/log/* | sort -rh | head -n 10

  # Step 3: 若確定是某個 service-access.log 佔用幾十 GB 且等不及 logrotate，
  # ⚠️ 嚴禁直接 rm 檔案！(會導致 File Descriptor 未釋放硬碟空間)，請用清空方式釋放：
  $ sudo truncate -s 0 /var/log/service-access.log
  ```
