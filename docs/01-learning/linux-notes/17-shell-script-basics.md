---
id: 17-shell-script-basics
title: 📜 Shell Script 基礎 (自動化腳本)
sidebar_label: "Shell Script 基礎"
sidebar_position: 17
---

# Shell Script 基礎 (自動化腳本)

Shell Script 是 SRE / DevOps 工程師將人工重複作業變成自動化執行的武器。優秀的企業腳本必定包含**嚴密的報錯中斷機制、標準 Exit Code 狀態碼、以及詳細的日誌記錄**。

---

## 1. 企業級 Shell Script 必備的「防呆黃金第一行 (`set -euo pipefail`)」

很多初學者寫 Script 忘記做錯誤檢查，遇到目錄不存在或變數未定義還繼續往下刪除檔案，極易引發大災難。
在所有 Bash 腳本第一行底下，一律強制加上這一列命令：

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- **`set -e` (Exit on error)**：腳本中只要有任一行執行報錯（Exit Code 不為 0），立即中斷退出，**絕不帶傷執行**。
- **`set -u` (Unset variables)**：使用到沒有定義的變數立刻拋錯。
- **`set -o pipefail`**：在管道串接 (`cmd1 | cmd2`) 時，只要有任何一項中斷失敗，整條管道指令就判為失敗。

---

## 2. 企業級自動化排程三大實戰腳本範例

### 情境一：安全連鎖部署腳本（測試有過才會部署，任何異常立刻報警）

```bash title="deploy_site.sh 實務範例" showLineNumbers
#!/usr/bin/env bash
set -euo pipefail

LOG_TAG="WEB-DEPLOY"
DEPLOY_DIR="/var/www/html/site"
REPO_URL="https://github.com/company/web-app.git"

logger -p user.notice -t "${LOG_TAG}" "開始部署新版本代碼..."
echo "👉 開始從 Git 拉取最新代碼..."

# 1. 如果資料夾不存在則先建立
mkdir -p "${DEPLOY_DIR}"
cd "${DEPLOY_DIR}"

# 2. 安全更新代碼
if [ -d ".git" ]; then
    git pull origin main
else
    git clone "${REPO_URL}" .
fi

# 3. 測試 Nginx 設定檔是否有語法錯誤 (-t)
echo "👉 檢測 Nginx 配置語法..."
if sudo nginx -t; then
    sudo systemctl reload nginx
    logger -p user.notice -t "${LOG_TAG}" "新版本部署成功並已平滑重啟服務。"
    echo "✅ 部署完成！"
else
    logger -p user.err -t "${LOG_TAG}" "Nginx 語法檢查出錯，拒絕重載服務！"
    echo "❌ 部署失敗：設定檔語法異常！" >&2
    exit 1
fi
```

### 情境二：自動監控磁碟空間使用率，超過 85% 發送警報日誌

```bash title="monitor_disk.sh 實務範例" showLineNumbers
#!/usr/bin/env bash
set -euo pipefail

THRESHOLD=85
# 讀取根目錄 (/) 當前的容量使用百分比數字 (過濾掉 %)
CURRENT_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "${CURRENT_USAGE}" -ge "${THRESHOLD}" ]; then
    ALERT_MSG="⚠️ 嚴重警告：根目錄 (/) 使用率達到 ${CURRENT_USAGE}% (告警門檻: ${THRESHOLD}%)"
    echo "${ALERT_MSG}" | logger -p user.warning -t "DISK-ALERT"
    echo "${ALERT_MSG}" >&2
    # 這裡可銜接 curl 請求打 Slack 或 Webhook
    exit 2
else
    echo "✅ 目前硬碟容量使用正常 (${CURRENT_USAGE}%)"
fi
```

### 情境三：資料庫自動化每日備份與 7 天滾動留存腳本

```bash title="backup_db.sh 實務範例" showLineNumbers
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/data/mysql_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_dump_${TIMESTAMP}.sql.gz"
LOG_TAG="DB-BACKUP"

mkdir -p "${BACKUP_DIR}"

logger -p user.notice -t "${LOG_TAG}" "開始執行資料庫全體備份..."

# 1. 執行備份並使用 gzip 即時壓縮
if sudo mysqldump --all-databases | gzip > "${BACKUP_FILE}"; then
    logger -p user.notice -t "${LOG_TAG}" "備份成功：${BACKUP_FILE}"
    echo "✅ 資料庫備份完成：${BACKUP_FILE}"

    # 2. 自動刪除 7 天以前的歷史備份檔，避免硬碟爆滿
    find "${BACKUP_DIR}" -type f -name "db_dump_*.sql.gz" -mtime +7 -delete
    echo "🗑️ 已清掉 7 天前的舊備份檔案"
else
    logger -p user.err -t "${LOG_TAG}" "資料庫備份異常中斷！"
    echo "❌ 資料庫備份失敗！" >&2
    exit 1
fi
```
