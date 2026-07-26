---
id: 13-ssh-security
title: 🔐 SSH 與金鑰管理 (遠端登入與安全)
sidebar_label: "SSH 與金鑰管理"
sidebar_position: 13
---

# SSH 與金鑰管理 (遠端登入與安全)

在 Linux 生產環境中，**嚴禁開放 root 帳號透過「密碼」直接進行遠端 SSH 登入**。任何企業級主機都必須導入「非對稱加密金鑰 (Asymmetric SSH Key)」與「跳板機 (Bastion / Jump Host)」架構。

---

## 1. 現代 SSH 金鑰對建立與安全派發 (`Ed25519` vs `RSA`)

早期的 2048-bit RSA 效能與安全性已被推翻，現代 Linux 一律推薦建立 **Ed25519 橢圓曲線金鑰**。

### 實踐 SOP：從建立到讓 `amy` 能在自己的筆電成功登入伺服器

整個流程分為 **「客戶端 (amy 的電腦)」** 與 **「伺服器端 (Linux 主機)」** 兩半，請依照以下 3 個步驟進行：

#### 步驟一：amy 在「自己的電腦 (客戶端)」建立 Ed25519 金鑰對

不論 amy 使用的是 Mac、Linux 還是 Windows (PowerShell / Git Bash)，都在自己的電腦執行：

```bash showLineNumbers
# 1. 在本地建立最頂級的 Ed25519 金鑰對 (-t 演算法, -C 備記註釋標記)
$ ssh-keygen -t ed25519 -C "amy@company.com"
```

執行後，會在 amy 電腦的 `~/.ssh/` 目錄下產生兩個檔案：

- **`~/.ssh/id_ed25519` (私鑰 Private Key)**：**絕對不可以外流**，留在 amy 自己的電腦裡！
- **`~/.ssh/id_ed25519.pub` (公鑰 Public Key)**：這是要上傳寄給伺服器管理員或放入主機的鑰匙孔。

#### 步驟二：將公鑰 (`id_ed25519.pub`) 派發部署到「遠端伺服器」

公鑰必須寫入遠端主機上 `amy` 家目錄的 `~/.ssh/authorized_keys` 檔案中：

- **方法 A (若目前還能用密碼登入，最快)：使用 `ssh-copy-id` 一鍵派發**
  ```bash showLineNumbers
  # 在 amy 的電腦執行，系統會要求輸入一次 amy 在遠端主機的密碼
  $ ssh-copy-id -i ~/.ssh/id_ed25519.pub amy@192.168.1.100
  ```
- **方法 B (實務現場真實做法：誰會打落長的 echo 啊？)**
  實務上絕對不會有人在 CLI 手動輸入那長達幾十個字元的 SSH 金鑰代碼！工程師真實的懶人作法有三招：
  1. **最常做的「右鍵貼上法」**：
     管理員直接下 `$ sudo vim /home/amy/.ssh/authorized_keys`，用滑鼠 **「右鍵貼上 (Paste)」** amy 從 Slack 傳來的公鑰文字，存檔離開！
  2. **自動化指令 `ssh-copy-id` (讓 amy 自己跑)**：
     若目前還允許密碼登入，叫 amy 在他筆電敲 `$ ssh-copy-id amy@192.168.1.100`，系統會自動建目錄、自動設權限、自動貼好金鑰，完全免人工。
  3. **現代 DevOps / 雲端後台法**：
     在 AWS EC2、GitHub 或 GitLab，直接將 amy 的公鑰貼在「網頁後台設定頁面」，機器開機時自動注入，主機裡連一行指令都不用下！
  
  > 🚨 **唯一要留意的防呆 (權限檢查)**：不論用什麼方法貼，主機上的 `/home/amy/.ssh` 目錄權限必須是 `700`，且 `authorized_keys` 檔案必須是 `600`，所有人必須是 `amy:amy`，否則 SSH 檢查過嚴會報 `Permission denied`！

#### 步驟三：amy 在自己的電腦上直接使用無密碼安全登入

公鑰放入伺服器後，amy 在自己的 Terminal 就能直接無密碼登入：

```bash showLineNumbers
# 基本登入指令（系統預設會自動抓取 ~/.ssh/id_ed25519 進行私鑰比對）
$ ssh amy@192.168.1.100

# 如果私鑰不是預設名稱，可使用 -i 手動指定私鑰路徑
$ ssh -i ~/.ssh/my_custom_key amy@192.168.1.100
```

> 💡 **進階工作流技巧：使用 `~/.ssh/config` 讓 amy 不用記 IP 與參數**
> amy 可以在自己電腦建立/編輯 `~/.ssh/config`，加入以下配置：
>
> ```ini
> Host dev-server
>     HostName 192.168.1.100
>     User amy
>     Port 22
>     IdentityFile ~/.ssh/id_ed25519
> ```
>
> 日後 amy 在自己電腦命令列只需輸入 `$ ssh dev-server`，或者使用 **VS Code Remote-SSH** 點選 `dev-server`，即可秒速無感遠端開發！

---

## 2. `/etc/ssh/sshd_config` 企業主機安全硬化 4 大金律

編輯伺服器設定檔 `/etc/ssh/sshd_config` 後，執行 `$ sudo systemctl reload sshd` 即刻防範暴力破解：

```ini title="/etc/ssh/sshd_config 安全規範" showLineNumbers
Port 2222                        # 1. 變更預設連接埠 (選配，避開網際網路 95% 的腳本機器人掃描)
PermitRootLogin no               # 2. 🌟 關鍵：嚴禁 root 帳號直接透過 SSH 登入
PasswordAuthentication no        # 3. 🌟 關鍵：全面禁用純文字密碼登入，僅准許 SSH Key 授權
PubkeyAuthentication yes         # 4. 開啟公鑰認證
```

---

## 3. SSH 與安全維運三大實戰情境範例

### 情境一：為什麼放了公鑰，SSH 仍跳出 `Permission denied (publickey)` 拒絕登入？

- **狀況描述**：已經將 `id_ed25519.pub` 放進遠端主機的 `~/.ssh/authorized_keys`，但登入時一直報錯。
- **根因與診斷金律**：
  - OpenSSH 對伺服器上 **帳號家目錄與 `~/.ssh` 相關檔案的 UGO 權限擁有極嚴格的安全審查！** 只要有一處權限開放太多給群組或其他人（例如設定成 `777`），SSHD 會視為「已被染指的安全漏洞」而強制拒絕驗證！
  - **權限修復黃金 SOP**：
    ```bash
    $ chmod 700 ~/.ssh                       # 僅所有人權限 rwx
    $ chmod 600 ~/.ssh/authorized_keys       # 僅所有人權限 rw-
    $ chmod go-w ~                           # 家目錄本身絕不能允許 Group 或 Others 有寫入權限
    ```

### 情境二：如何用 SSH Config (`~/.ssh/config`) 一行指令自動穿透「跳板機 (Jump Host)」？

- **狀況描述**：資料庫主機 (`10.0.1.50`) 在內部 VNet，不可直接連接，必須先登入跳板機 (`203.0.113.10`) 才能再 SSH 過去，每次打兩段指令超痛苦。
- **實戰設定 (`~/.ssh/config`)**：

  ```ini title="~/.ssh/config 設定範例" showLineNumbers
  Host jump-server
      HostName 203.0.113.10
      User admin
      IdentityFile ~/.ssh/id_ed25519

  Host db-prod
      HostName 10.0.1.50
      User dbadmin
      ProxyJump jump-server          # 🌟 關鍵：宣告要經由 jump-server 當跳板穿透
      IdentityFile ~/.ssh/id_ed25519
  ```

  設定好後，在 Terminal 只要敲入 `$ ssh db-prod`，OpenSSH 就會全自動為你在後台串接跳板穿透到內網資料庫！

### 情境三：如何透過 SSH 隧道 (Local Port Forwarding) 開通內網網頁與資料庫？

- **狀況描述**：想連向內網專用的 Kibana 儀表板或後台管理 Web (`http://10.0.1.80:8080`)，但不允許開啟外部防火牆。
- **實戰指令**：
  ```bash
  # -L [本地通訊埠]:[目標內網IP]:[目標連接埠]
  $ ssh -N -L 8080:10.0.1.80:8080 admin@jump-server
  ```
  執行後，直接打開你筆電的瀏覽器訪問 `http://localhost:8080`，流量就會以全程 SSL/SSH 加密形式安全穿透！
