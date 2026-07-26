---
id: 11-package-management
title: 📦 作業系統套件管理
sidebar_label: "作業系統套件管理"
sidebar_position: 11
---

# 作業系統套件管理

在 Linux 系統維運現場，作業系統套件管理（Package Management）不僅是「安裝軟體」那麼簡單，它涉及到**相依性解析 (Dependency Resolution)、安全性修補程式部署 (Security Patching)、系統版本鎖定 (Version Pinning) 以及故障回滾 (Rollback)**。
現代企業環境中，維運工程師通常同時管理 **RedHat / Rocky / CentOS 陣營 (`rpm` / `dnf`)** 與 **Debian / Ubuntu 陣營 (`dpkg` / `apt`)**，必須對雙方的核心指令與底層架構暸若指掌。

---

## 兩大主流套件管理生態系對照 (RPM vs DEB 陣營)

| 任務分類               | RedHat / Rocky / CentOS (`rpm` / `dnf` / `yum`)  | Debian / Ubuntu (`dpkg` / `apt`)                   | 說明與實務建議                                    |
| :--------------------- | :----------------------------------------------- | :------------------------------------------------- | :------------------------------------------------ |
| **本地離線安裝**       | `sudo rpm -ivh file.rpm`                         | `sudo dpkg -i file.deb`                            | 安裝單一本地檔案，**不自動處理相依性**            |
| **線上解析安裝**       | `sudo dnf install <pkg>`                         | `sudo apt install <pkg>`                           | 自動計算並下載所有必要依賴套件                    |
| **查詢已安裝軟體**     | `rpm -qa \| grep <pkg>`<br/>`dnf list installed` | `dpkg -l \| grep <pkg>`<br/>`apt list --installed` | 查詢本機是否有安裝某套件                          |
| **查詢指令來自哪個包** | `rpm -qf /usr/bin/nc`                            | `dpkg -S /usr/bin/nc`                              | 🌟 經典除錯：知道指令路徑但想查套件名稱           |
| **升級系統全體套件**   | `sudo dnf upgrade`                               | `sudo apt update && sudo apt upgrade`              | **注意**：Debian 系需先 `update` 更新清單才能升級 |
| **清除不需要的相依包** | `sudo dnf autoremove`                            | `sudo apt autoremove`                              | 移除不再被任何專案依賴的孤兒套件                  |

---

## 1. RedHat / Rocky / CentOS 陣營 (`rpm` 與現代 `dnf`)

### 為何現代企業主機全數改用 `dnf` 取代 `yum`？

`dnf` (Dandified YUM) 是 RedHat 7 後期至 RHEL / Rocky / CentOS 8+ 預設的套件管理工具。與老舊的 `yum` 相比，`dnf` 改寫了相依性解析引擎 (`libsolv`)，大幅減少記憶體佔用並提昇解析速度，同時支援模組化軟體流 (Modularity/AppStream)。

### 1. `dnf` 實務操作指令大全

```bash showLineNumbers
# 1. 搜尋套件庫
$ dnf search nginx

# 2. 安裝與移除 (-y 自動同意)
$ sudo dnf install -y nginx
$ sudo dnf remove -y nginx      # 移除時會連同不再使用的相依套件一併清理

# 3. 查看套件描述、版本與來源 Repo
$ dnf info nginx

# 4. 🌟 軟體群組安裝 (Group Install) —— MIS 架站最速秘技
$ dnf group list                # 列出可用的軟體群組
$ sudo dnf groupinstall "Development Tools"   # 一鍵安裝 gcc, make, git 等編譯器大全包
```

### 2. 🌟 救命神技：`dnf history` 與「時光機一鍵回滾」

當在線上環境不小心更新了錯誤套件，導致資料庫或網站炸掉時，`dnf` 內建歷史異動還原機制：

```bash showLineNumbers
# 1. 查看最近的 dnf 安裝與修改紀錄，取得 Transaction ID (例如 ID=15)
$ dnf history
ID     | Command line             | Date and time    | Action(s) | Altered
----------------------------------------------------------------------------
    15 | install nginx            | 2026-07-26 13:00 | Install   |    5
    14 | update mysql             | 2026-07-25 10:00 | Update    |    2

# 2. 查看第 15 次操作究竟改了哪些檔案與套件
$ dnf history info 15

# 3. 🌟 一鍵時光機回滾：取消第 15 次的操作 (自動將升級後的包退回舊版，或將裝好的包拆掉)
$ sudo dnf history undo 15
```

### 3. 底層 `rpm` 實務使用情境

當廠商提供專屬的 commercial `.rpm` 包時，會使用底層 `rpm` 指令：

```bash showLineNumbers
# -i (Install), -v (Verbose 詳細顯示), -h (Hash 顯示進度條 #)
$ sudo rpm -ivh enterprise-app-1.2-1.el8.x86_64.rpm

# 查詢檔案屬於誰
$ rpm -qf /etc/my.cnf
mysql-server-8.0.32-1.el8.x86_64
```

---

## 2. Ubuntu / Debian 陣營 (`dpkg` 與現代 `apt`)

在現今 Ubuntu 20.04 / 22.04 / 24.04 LTS 中，官方建議在命令行操作中一律採用介面更人性化、帶有著色與進度條提示的 **`apt`** 取代早期的 `apt-get` 與 `apt-cache`。

### 1. `apt` 實務操作指令大全

```bash showLineNumbers
# 1. 更新本地套件庫清單 index (🌟 每次安裝新套件前的必要第一步)
$ sudo apt update

# 2. 升級所有可更新的套件
$ sudo apt upgrade -y

# 3. remove 與 purge 的核心差別
$ sudo apt remove nginx       # 移除軟體，但「保留」/etc/nginx 裡的設定檔
$ sudo apt purge nginx        # 徹底卸載：連同所有設定檔完全清除乾淨
```

### 2. 🌟 底層 `dpkg` 離線安裝與「斷頭相依性修復」

在 Debian 系執行本地檔案安裝時，最常遇見的問題是：

```bash showLineNumbers
# 1. 嘗試安裝 Google Chrome 的 deb 包
$ sudo dpkg -i google-chrome-stable_current_amd64.deb
dpkg: error processing package ... dependency problems - leaving unconfigured
```

遇到 `dpkg -i` 報錯「缺少相依性無法配置」時，千萬別緊張！不用手動慢慢下載相依套件，只要下這行修復神指令：

```bash showLineNumbers
# 🌟 自動幫系統上網找齊剛剛 deb 缺少的相依性並完成安裝！
$ sudo apt --fix-broken install
# (或是縮寫：sudo apt -f install)
```

---

## 3. 第三方套件庫拓展 (EPEL 與官方 Repo 金鑰導入)

標準安裝的 Linux 套件庫為了穩定性，所收錄的套件版本常偏舊或缺少某些常用開源軟體（例如 `htop`、`jq`、`nginx`）。企業中極常需要外掛合法安全的第三方套件庫：

### 1. RedHat / Rocky 陣營：安裝 EPEL (Extra Packages for Enterprise Linux)

EPEL 是由 Fedora 社群官方維護、高品質且符合 RHEL 標準的額外套件擴充庫：

```bash showLineNumbers
# 1. 一鍵啟用 EPEL 套件庫
$ sudo dnf install -y epel-release

# 2. 啟用後，即可輕鬆安裝 nginx, redis, htop 等原本預設沒有的工具
$ sudo dnf install -y htop jq
```

### 2. Ubuntu 陣營：安全添加第三方官方 Repo (以 Docker / PostgreSQL 為例)

現代 Ubuntu **已棄用將 PPA 金鑰直接寫入傳統 `/etc/apt/trusted.gpg` 的不安全做法**，必須將金鑰分開保存於 `/etc/apt/keyrings/`：

```bash showLineNumbers
# 1. 建立 GPG 金鑰儲存目錄
$ sudo install -m 0755 -d /etc/apt/keyrings

# 2. 下載官方公鑰並轉成 gpg 格式寫入
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 3. 新增獨立的 source repo 設定至 /etc/apt/sources.list.d/
$ echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
       | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. 更新清單後即可安裝最新版官方套件
$ sudo apt update && sudo apt install -y docker-ce
```

---

## 4. 企業維運現場三大高階實戰情境 (MIS / SRE 經驗談)

### 情境一：執行指令時跳錯 `Could not get lock /var/lib/dpkg/lock-frontend` 或 `yum.pid` 被鎖定

- **狀況描述**：想要裝軟體，系統卻提示 `Waiting for process xxx to complete` 或 `Could not get lock` 拒絕執行。
- **根因與解決金律**：
  - 代表後台有另一個程序（如 `unattended-upgrades` 系統自動背景安全升級、或是先前的套件安裝被意外退出）正在使用套件資料庫。
  - **排查命令**：使用 `$ lsof /var/lib/dpkg/lock` 或 `$ ps aux | grep -i apt` 抓出是誰佔住了鎖。
  - **安全處置**：
    1. 若是正常的系統更新，請耐性等待它跑完。
    2. 若確認是已經卡死無回應的孤兒程序，先用 `sudo kill -9 <PID>` 終止行程。
    3. **極限手段**：只有在確定無行程執行時，才能手動移除鎖定檔 `$ sudo rm /var/lib/dpkg/lock*` 並執行 `$ sudo dpkg --configure -a` 修復受損的資料庫狀態。

### 情境二：如何「鎖定特定軟體版本」防範系統更新時遭意外升級（Version Lock / Hold）？

- **狀況描述**：企業 K8s 叢集主機中的 `kubelet`、`docker`，或資料庫伺服器中的 `mysql-server`，必須嚴格維持在特定小版本，**絕對不准在執行 `dnf upgrade` 或 `apt upgrade` 時被升級改壞**！
- **RedHat / Rocky 陣營做法 (dnf versionlock 插件)**：

  ```bash showLineNumbers
  # 1. 安裝 versionlock 擴充模組
  $ sudo dnf install -y python3-dnf-plugin-versionlock

  # 2. 鎖定 docker 與 kubelet 不允許隨升級更動
  $ sudo dnf versionlock add docker* kubelet*

  # 3. 查詢目前被鎖定的軟體清單
  $ dnf versionlock list

  # 4. 未來要解除鎖定：
  $ sudo dnf versionlock delete docker*
  ```

- **Ubuntu / Debian 陣營做法 (`apt-mark hold`)**：

  ```bash showLineNumbers
  # 1. 鎖定套件禁止改動
  $ sudo apt-mark hold kubelet docker-ce

  # 2. 查看已鎖定的清單
  $ apt-mark showhold

  # 3. 解除鎖定
  $ sudo apt-mark unhold kubelet
  ```

### 情境三：如何在「完全無法連上網際網路」的內網隔離機房 (Air-Gapped) 安裝軟體與完整依賴？

- **狀況描述**：金融交易伺服器與高資安隔離主機無法連外網，用一般手動抓單一個 rpm/deb 放進去裝，往往跳出「缺 30 個相依套件」的無限無窮地獄。
- **解決方案 (在另一台同版本可上網的中繼主機地下載全套離線包)**：
  - **RedHat 陣營**：利用 `dnf download --resolve --alldeps`：
    ```bash
    # 在可上網的主機中，自動把 nginx 及其「所有」依賴套件下載至當前資料夾，但不進行安裝
    $ dnf download --resolve --alldeps nginx
    # 打包這個資料夾拷貝進內網隔離主機後，一鍵離線安裝所有 rpm：
    $ sudo dnf install -y *.rpm
    ```
  - **Ubuntu 陣營**：利用 `apt-offline` 或手動下載：
    ```bash
    $ sudo apt-get download $(apt-cache depends --recurse --no-recommends --no-suggests \
      --no-conflicts --no-breaks --no-replaces --no-enhances nginx | grep "^\w")
    ```
