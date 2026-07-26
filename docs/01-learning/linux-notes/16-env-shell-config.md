---
id: 16-env-shell-config
title: 🖥️ 環境變數與 Shell 設定 (開發環境排錯)
sidebar_label: "環境變數與 Shell 設定"
sidebar_position: 16
---

# 環境變數與 Shell 設定 (開發環境排錯)

環境變數 (Environment Variables) 定義了應用程式的資料庫位址、密鑰金庫與命令執行路徑 (`PATH`)。不理解 Linux 的 Shell 載入順序，常常會遇見「我在終端機可以執行，但用 cron 或 systemd 就報錯找不到指令」的災難。

---

## 1. Linux Shell 設定檔載入優先序與生命週期

| 設定檔路徑                           | 作用域等級           | 載入時機與用途說明                                                                     |
| :----------------------------------- | :------------------- | :------------------------------------------------------------------------------------- |
| **`/etc/profile`**                   | **全體系統所有帳號** | 開機全域登入配置（強烈建議勿直接修改此檔案，放 `/etc/profile.d/*.sh`）                 |
| **`~/.bash_profile` / `~/.profile`** | **單一登入使用者**   | 當使用 SSH 或要求輸入帳密**登入 Shell (Login Shell)** 時執行一次                       |
| **`~/.bashrc` / `~/.zshrc`**         | **單一使用者日常**   | 每次打開新終端分頁**非登入 Shell (Non-login Shell)** 時載入，放 Alias 與自訂變數最佳處 |

---

## 2. 環境變數與 Shell 設定三大實戰情境範例

### 情境一：為什麼執行 `npm`、`docker` 或 `nvm` 時報錯 `command not found`，但該檔案明明在機器上？

- **狀況描述**：使用新建立的帳號或切換 Shell 時，找不到指令。
- **根因與解決金律**：
  - 這是因為你的 PATH 變數沒有將該指令的執行檔目錄放進去。
  - **正確作法**：編輯家目錄底下的 `~/.bashrc` (或 `~/.zshrc`)，把二進位路徑掛載在舊 `$PATH` 之前：
    ```bash
    export PATH="$HOME/.nvm/versions/node/v20.0.0/bin:$PATH"
    ```
    修改完成後，在目前 Terminal 執行 `$ source ~/.bashrc` 即刻套用。

### 情境二：如何不修改環境檔，臨時帶入 API Key 執行單次 Python/Node 遷移測試腳本？

- **實戰語法 (單行變數前綴注入)**：
  ```bash
  # 在指令前方直接宣告 KEY=VALUE，變數僅對當次指令生效，不污染目前系統的環境變數
  $ DB_HOST=localhost DB_PORT=3306 DB_PASS="SuperSecret123!" python3 migrate_db.py
  ```

### 情境三：為什麼我在 Terminal 設定了 `export MY_VAR=foo`，但透過 Systemd 與 Crontab 執行的服務仍然讀不到？

- **根因與解決金律**：
  - **`systemd` 服務與 `crontab` 排程執行時，並不會載入你個人帳號下的 `~/.bashrc` 或 `/etc/profile`！**
  - **正確作法 (Systemd)**：必須在 `/etc/systemd/system/*.service` 中的 `[Service]` 區塊明確宣告 `Environment="MY_VAR=foo"` 或配置 `EnvironmentFile=/opt/app/.env`。
  - **正確作法 (Crontab)**：要在 crontab 的排程中完整寫入執行檔環境或指定載入描述檔：
    ```ini
    * * * * * . /home/amy/.bashrc && /home/amy/bin/backup.sh >/dev/null 2>&1
    ```
