---
id: 09-disk-management
title: 💾 磁碟管理
sidebar_label: "磁碟管理"
sidebar_position: 9
description: "全面掌握 Linux 磁碟與檔案系統管理：從底層 Inode、檔案系統與磁碟分割機制，到 lsblk/df/du 空間排查、gdisk/mkfs/mount 實戰掛載、SWAP 交換區配置，以及常見維運與排錯技巧。"
keywords: [Linux, disk, inode, df, du, gdisk, mkfs, mount, fstab, swap, lvm]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 磁碟管理

在 Linux 系統維運與後端伺服器管理中，磁碟空間與檔案系統的健全度直接關係到服務的營運穩定性。無論是處理資料庫讀寫瓶頸、伺服器硬碟滿載警報，或是為雲端虛擬主機進行線上硬碟擴容，掌握磁碟管理的底層運作機制與實務命令皆是工程師的必備戰力。本篇筆記將從 Linux 檔案系統架構與 Inode 底層出發，一步步帶你實戰磁碟查詢與空間檢視、磁碟分割 (`gdisk`)、格式化 (`mkfs`)、掛載配置 (`mount`/`fstab`)、加裝新硬碟 7 步標準作業流程，以及 SWAP 虛擬記憶體配置，最後匯整現場最高頻的 5 大踩坑與排錯手冊。

---

### 1. 檔案系統與底層架構

#### 檔案系統概念與對比

**檔案系統 (File System)** 是作業系統用來在硬碟儲存裝置上「組織、索引與讀取檔案」的方法與資料結構。如果將一塊磁碟比喻為一棟沒有隔間的巨大倉庫，檔案系統就像是在倉庫內建立編號貨架與帳冊索引系統，讓系統隨時能快速找到、讀取與安全寫入每一份檔案。

| 檔案系統 | 主要特點 | 適用場景 |
| :--- | :--- | :--- |
| **Ext4** | 傳統且極為穩定，支援高達 1EB 分割區，相容性最高，預設開啟日誌功能。 | 雲端伺服器標準環境、日常通用主機 |
| **XFS** | 專為高效能與大型檔案設計，具備優異的平行讀寫與擴充性 (64-bit 檔案系統)。 | RedHat / CentOS / Rocky Linux 預設檔案系統 |
| **Btrfs** | 具備快照 (Snapshot)、RAID、寫入時複製 (CoW) 與自愈檢查 (Scrubbing) 特性。 | NAS 儲存系統、容器磁碟池、高進階資料備份需求 |

:::info[💡 為什麼要區分不同的檔案系統？]
不同的檔案系統在「小檔案讀寫效能」、「大容量硬碟支援」、「快照機制」與「故障回復能力」上有很大不同。在企業級 Linux 維運中，通常將作業系統核心目錄部署於 **Ext4 / XFS**，以追求極限穩定與效能。
:::

#### 索引式檔案系統

Linux 主流檔案系統（如 Ext4 / XFS）均屬於**索引式檔案系統 (Indexed File System)**。它的核心概念是將磁碟空間切分為三個主要的區域來運作：

1. **Superblock (超級區塊)**：記錄整個檔案系統的總體資訊，例如 Block 與 Inode 的總量、使用量、剩餘量，以及檔案系統的掛載時間與狀態。
2. **Inode Table (索引節點表格)**：負責記錄檔案的「詮釋資料 (Metadata)」，包含檔案的讀寫權限、擁有者、大小、修改時間，以及最關鍵的——**指向檔案實際資料區塊 (Data Block) 的編號清單**。
3. **Data Block (資料區塊)**：實際儲存檔案內容資料的地方，標準區塊大小通常為 **4KB**。

:::tip[💡 索引式 vs 非索引式檔案系統的差別]
- **索引式 (Linux Ext4/XFS)**：系統開啟檔案時，先讀取該檔案的 Inode，找到 Data Block 號碼後，磁頭/晶片直接定址跳轉讀取。無論檔案碎片如何分佈，都能精準定址。
- **非索引式 (早期 FAT)**：採用鏈結式索引，讀取檔案時必須從第一個 Block 一步一步順著鏈結往下找。如果磁碟碎片過多，讀取速度會大幅退化。
:::

#### 日誌檔案系統

在早期沒有日誌記錄的檔案系統中，若系統在寫入檔案的途中發生「突然斷電」或「當機」，可能導致 Inode Table 與 Data Block 的紀錄不一致，重新開機時需要花費數小時檢查整個磁碟。

**日誌檔案系統 (Journaling File System)** 透過在磁碟內切出一個獨立的 **日誌區塊 (Journal Area)** 來解決這個問題：

1. **預寫日誌 (Log Intent)**：在準備修改檔案前，系統會先將「即將寫入的動作與 Metadata」以日誌形式記錄在 Journal 區塊。
2. **實際寫入 (Commit)**：開始對實際的 Data Block 與 Inode 執行寫入。
3. **清除日誌 (Release)**：完成寫入後，把 Journal 區塊中的待辦記錄標記為完成。

:::note[🛡️ 日誌檔案系統的安全屏障]
萬一寫入中途突然停電，系統復原開機時不需要全硬碟掃描，只需要檢查 Journal 區塊裡「未完成的交易 (Pending Log)」，即可在數秒內重做或復原該次操作。
:::

#### index node (Inode)

**index node (縮寫為 Inode)** 是 Linux 磁碟管理中最重要的核心結構。

每個檔案或目錄在 Linux 檔案系統裡都擁有唯一對應的一個 **Inode 編號**。一個 Inode 內部紀錄的資訊包含：
- 檔案的存取模式 (`read/write/execute` 權限)
- 檔案的擁有者 ID (`uid`) 與群組 ID (`gid`)
- 檔案的容量大小 (Size)
- 檔案的時間戳記：`ctime` (狀態變更)、`mtime` (內容修改)、`atime` (最新讀取)
- 指向資料存放位置的 **Data Block 指標清單**

```bash showLineNumbers
# 檢視檔案的 Inode 編號與詳細 Metadata
$ stat /etc/passwd
  File: /etc/passwd
  Size: 2603      	Blocks: 8          IO Block: 4096   regular file
Device: fd01h/64769d	Inode: 131093      Links: 1
Access: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)
Access: 2026-07-26 10:00:00.000000000 +0800
Modify: 2026-07-26 10:00:00.000000000 +0800
Change: 2026-07-26 10:00:00.000000000 +0800
```

:::warning[💡 驚喜真相：Inode 裡面沒有「檔案名稱」！]
Inode 本身**不記錄檔案名稱**。檔案名稱是記錄在該檔案「上一層目錄 (Directory) 的 Data Block 裡」。
當我們對目錄執行 `ls` 時，系統其實是在讀取該目錄的 Data Block，將「檔案名稱」與相對應的「Inode 編號」對照印出！
:::

#### Hard Link 與 Symbolic Link

在掌握了 Inode 觀念後，就能順利理解 Linux 中最經典的兩種檔案連結方式：**硬連結 (Hard Link)** 與 **軟連結 (Symbolic Link / 符號連結)**。

- **硬連結 (Hard Link - `ln`)**：
  - 在目錄的 Data Block 中，建立一組「新的檔案名稱」，指向**完全相同的一個 Inode 編號**。
  - 沒有建立新的 Inode，亦不在硬碟新佔用資料區塊。
  - **刪除原檔案時，硬連結依然可以正常讀取資料**（直到所有指向該 Inode 的計數 `Links` 歸零時，資料才會正式被系統回收）。
  - ⚠️ **限制**：**不可跨越不同的檔案系統**建立硬連結，也不能對「目錄 (Directory)」建立硬連結。
- **軟連結 (Symbolic Link / Soft Link - `ln -s`)**：
  - 類似 Windows 的「桌面捷徑」。系統會為它建立一個**全新的 Inode 與檔案**，檔案內的資料為**「目標檔案的路徑字串」**。
  - 可以跨檔案系統連結，也能對目錄建立捷徑。
  - ⚠️ **限制**：如果原檔案被刪除或更名，軟連結就會變成「死鏈 (Broken Link)」，無法再讀取資料。

```bash showLineNumbers
# 實戰對比 Hard Link 與 Symbolic Link
$ echo "Hello Linux" > file.txt
$ ln file.txt file_hard.txt          # 硬連結 (預設)
$ ln -s file.txt file_soft.txt       # 軟連結 (-s 參數)

# 檢視 Inode 差異 (-i 顯示第一欄 Inode 編號)
$ ls -li
131093 -rw-r--r-- 2 root root 12 Jul 26 10:00 file.txt
131093 -rw-r--r-- 2 root root 12 Jul 26 10:00 file_hard.txt      # Inode 與原檔相同
131094 lrwxrwxrwx 1 root root  8 Jul 26 10:00 file_soft.txt -> file.txt # 獨立 Inode
```

---

### 2. 磁碟與空間查詢工具

#### lsblk (檢視區塊設備與樹狀圖)

`lsblk` (List Block Devices) 是列出系統中目前所有**區塊設備（硬碟、分割區、虛擬磁碟）樹狀結構**的首選工具。

```bash showLineNumbers
# 搭配 -f 顯示檔案系統類型、UUID 與掛載點
$ lsblk -f
NAME   FSTYPE LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINTS
sda
├─sda1 vfat         4CD2-9F1C                             485.2M    10% /boot/efi
└─sda2 ext4         8c7d853e-d9a2-4d76-b6b3-9c8a9d123456   18.2G    52% /
sdb
└─sdb1 xfs          e5a1b3c8-1122-3344-5566-77889900aabb    9.8G     2% /data
```

- **核心欄位意義**：
  - `NAME`：裝置名稱（如 `sda` 為主硬碟，`sda1`, `sda2` 為其分割區）。
  - `FSTYPE`：檔案系統格式（如 `ext4`, `xfs`, `vfat`）。
  - `UUID`：全域唯一識別碼（設定 `/etc/fstab` 自動掛載最重要的依據）。
  - `MOUNTPOINTS`：目前掛載於 Linux 目錄樹的哪一個資料夾路徑。

#### df 與 du (空間監控與大胃王追蹤)

當伺服器報警提示硬碟快滿了，後端與系統維運工程師的排查 S.O.P 絕對是：**「先看總量 (`df`) ➡️ 再抓大胃王 (`du`)」**！

- **`df` (Disk Free - 查看磁碟總體剩餘空間)**：
  ```bash showLineNumbers
  # 1. 以人類易讀的單位 (-h) 查看使用量
  $ df -h
  Filesystem      Size  Used Avail Use% Mounted on
  /dev/sda2        40G   21G   18G  54% /
  /dev/sdb1       100G  5.2G   95G   6% /data

  # 2. ⚠️ 關鍵技能：查看 Inode 剩餘量 (-i)
  $ df -i
  Filesystem      Inodes  IUsed   IFree IUse% Mounted on
  /dev/sda2      2621440  85210 2536230    4% /
  ```
  :::tip[💡 為什麼務必要看 `df -i`？]
  如果主機塞了上百萬個幾 KB 的 Cache 或 Log 小檔案，會出現「`df -h` 硬碟容量還有 50%，系統卻報錯 `No space left on device`」的狀況，這正是因為 Inode 已經消耗殆盡 (`df -i` Use% = 100%)。
  :::

- **`du` (Disk Usage - 追蹤資料夾佔用的實際大小)**：
  ```bash showLineNumbers
  # 查詢目前資料夾下「第一層」每一個目錄與檔案的佔用大小，並排序
  $ du -h --max-depth=1 | sort -h
  12K	./config
  180M	./cache
  4.2G	./logs
  4.4G	.       # 總計
  ```

---

### 3. 分割、格式化與掛載操作

#### MBR 與 GPT 分割表

| 分割表規範 | 支援最大硬碟容量 | 支援最大主分割區數量 | 特色與限制 |
| :--- | :--- | :--- | :--- |
| **MBR** | **2TB** | 4 個主分割區 | 傳統開機架構，超過 4 個分割區時須切割擴充分割區與邏輯分割區。 |
| **GPT** | **8ZB** | 128 個主分割區 | 現代 UEFI 標準規範，自帶硬碟首尾 **雙重備份分割表 (Backup Header)**。 |

#### gdisk (GPT 分割實戰)

對 Linux 磁碟進行分割時，傳統的 `fdisk` 適合 MBR，而現代 **GPT 磁碟建議一律使用 `gdisk` 工具**。

```bash showLineNumbers
# 對新的磁碟 /dev/sdb 進行 GPT 分割
$ sudo gdisk /dev/sdb

# --- gdisk 常用互動式熱鍵 ---
# ?  : 查看所有可用命令
# p  : 印出目前的分割表 (Print partition table)
# n  : 新增一個分割區 (New partition)
# d  : 刪除一個分割區 (Delete partition)
# t  : 修改分割區類型 (預設 8300 為 Linux 檔案系統，8200 為 SWAP)
# w  : 儲存變更並離開 (Write to disk)
```

:::tip[💡 分割完必備的更新步驟：`partprobe`]
當你在伺服器上透過 `gdisk /dev/sdb` 建立新分割區後，請務必執行 `sudo partprobe`，讓作業系統在「不重新開機」的情況下，立刻重新讀取並同步新的分割表！
:::

#### mkfs (檔案系統格式化)

完成硬碟分割 (`gdisk`) 後，分割區目前依然是一塊沒有貨架的空地。必須透過 **`mkfs` (Make File System)** 進行「格式化」，寫入 Superblock 與 Inode 結構，才能正式使用。

<Tabs>
  <TabItem value="ext4" label="格式化為 Ext4" default>
    ```bash showLineNumbers
    # 將分割區 /dev/sdb1 格式化為傳統穩定的 Ext4 檔案系統
    $ sudo mkfs.ext4 /dev/sdb1
    ```
  </TabItem>
  <TabItem value="xfs" label="格式化為 XFS">
    ```bash showLineNumbers
    # 將分割區 /dev/sdb1 格式化為現代高效能的 XFS 檔案系統 (CentOS/Rocky 標準)
    $ sudo mkfs.xfs /dev/sdb1
    ```
  </TabItem>
</Tabs>

#### blkid (查詢唯一裝置識別碼 UUID)

硬碟格式化完畢後，系統會為其產出一組**唯一的 UUID (Universally Unique Identifier)**。可以使用 `blkid` 查看：

```bash showLineNumbers
$ sudo blkid /dev/sdb1
/dev/sdb1: UUID="e5a1b3c8-1122-3344-5566-77889900aabb" TYPE="xfs" PARTLABEL="Linux filesystem"
```

:::info[💡 為什麼強烈推薦在掛載時用 UUID，而不要用 `/dev/sdb1`？]
伺服器的裝置代號 (`/dev/sda`, `/dev/sdb`) 是作業系統開機時「依照接頭偵測順序」命名的。萬一插拔硬碟或雲端新增硬碟時順序跳轉，原本的 `sdb1` 可能變為 `sdc1` 導致掛載錯置。**使用 UUID 能夠永久唯一且精準地識別硬碟身份**。
:::

#### mount / umount (手動與回圈掛載)

要把格式化好的分割區接到 Linux 的目錄樹狀圖中，稱為**掛載 (Mount)**；將其脫離則稱為**卸載 (Unmount，命令為 `umount`)**。

```bash showLineNumbers
# 1. 建立掛載點資料夾並掛載
$ sudo mkdir -p /data
$ sudo mount /dev/sdb1 /data

# 2. 實務常用：以回圈掛載 (Loop Mount) 讀取 ISO 映像檔
$ sudo mount -o loop /root/ubuntu.iso /mnt/iso

# 3. 卸載設備 (可指定目錄或設備路徑)
$ sudo umount /data
```

:::warning[🚨 卸載遇到 `target is busy` 怎麼處理？]
若目前終端機停留在 `/data` 目錄裡，或後端應用程式正在讀取 `/data/file.log`，系統都會阻止卸載並報錯 `target is busy`！
**排查解決方案**：
```bash
# 找出是哪一個 PID 正在存取 /data 目錄
$ lsof +D /data
# 查詢並終止佔用的進程 (使用前需謹慎確認進程身分)
$ fuser -m -v /data
```
:::

---

### 4. 開機自動掛載與情境實戰

#### 開機自動掛載 (/etc/fstab)

使用手動 `mount` 只在當期開機有效。欲使主機重新開機時自動掛載磁碟，必須設定 **`/etc/fstab` (File System Table)** 設定檔。

`/etc/fstab` 由**六個標準欄位**組成：

| 欄位順序 | 欄位名稱 | 設定說明 | 實戰範例 |
| :---: | :--- | :--- | :--- |
| **1** | **裝置識別 (Device/UUID)** | 強烈建議一律使用 `UUID=...` | `UUID=e5a1b3c8-1...` |
| **2** | **掛載點 (Mount Point)** | 接駁至 Linux 樹狀目錄的路徑 | `/data` |
| **3** | **檔案系統 (Filesystem)** | 如 `ext4`, `xfs`, `swap` | `xfs` |
| **4** | **掛載參數 (Options)** | 推薦 `defaults`；**外接或雲端附加硬碟強烈推薦補上 `nofail`** | `defaults,nofail` |
| **5** | **備份旗標 (Dump)** | 是否透過 dump 指令備份 (`0` 代表不備份) | `0` |
| **6** | **開機檢查順序 (Fsck)** | `0` 不檢查，`1` 為根目錄 `/` 優先，`2` 為其他分割區 | `2` |

<Tabs>
  <TabItem value="ext4-fstab" label="標準 Ext4 系統區配置" default>
    ```bash title="/etc/fstab" showLineNumbers
    UUID=8c7d853e-d9a2-4d76-b6b3-9c8a9d123456  /       ext4  defaults          0  1
    ```
  </TabItem>
  <TabItem value="xfs-fstab" label="外接/附加 XFS 硬碟配置 (帶 nofail)">
    ```bash title="/etc/fstab" showLineNumbers
    UUID=e5a1b3c8-1122-3344-5566-77889900aabb  /data   xfs   defaults,nofail   0  2
    ```
  </TabItem>
</Tabs>

:::caution[🔴 致命的開機卡死陷阱：務必使用 `nofail` 與 `mount -a` 測試！]
1. **防禦卡死的保命參數 `nofail`**：將外部或額外附掛硬碟寫入 `/etc/fstab` 時，萬一該硬碟故障或被拔除，未加上 `nofail` 參數會導致開機卡死於 "Emergency mode" 維修模式！加入 `nofail` 後，即便硬碟不存在也會略過並順利開機。
2. **每次修改完 `/etc/fstab` 後的唯一檢驗規範**：
   存檔離開編輯器後，**永遠第一時間執行以下指令測試語法**：
   ```bash
   $ sudo mount -a
   ```
   只要沒有出現任何報錯，即代表 `/etc/fstab` 語法正確！切勿沒檢查就直接開機。
:::

#### 情境範例：加裝新硬碟 (實戰 7 步 SOP)

在實務現場（如雲端 AWS EC2 掛載 EBS 磁碟、機房實體主機插入 SATA/NVMe 新硬碟），把一顆全新空白的硬碟接上 Linux 主機並永久生效，標準的作業流程包含以下 **7 大步驟**：

1. **步驟 1：偵測與辨識新硬碟 (`lsblk`)**
   - 剛接上新硬碟時，先以 `lsblk -p` 檢視系統是否偵測到未分割的硬碟設備（如 `/dev/sdb` 或 `/dev/nvme1n1`）。
   ```bash
   $ lsblk -p
   # 檢查哪一顆硬碟底下沒有分割區也沒有 MOUNTPOINTS
   ```

2. **步驟 2：進行 GPT 分割 (`gdisk`)**
   - 使用 `gdisk` 對新硬碟切出分割區：
   ```bash
   $ sudo gdisk /dev/sdb
   # 互動熱鍵順序：
   # n -> 按 Enter (預設第一個分割區) -> 按 Enter (預設起點) -> 按 Enter (預設使用全硬碟空間) -> 8300 (Linux filesystem)
   # p (檢查表單正確建立出 /dev/sdb1) -> w (寫入分割表並離開) -> Y
   ```
   - ⚡ **必做防呆**：執行 `sudo partprobe /dev/sdb` 讓核心即時讀取新分割區。

3. **步驟 3：格式化為檔案系統 (`mkfs`)**
   - 將剛產生的 `/dev/sdb1` 分割區格式化為現代高效能 XFS（或傳統 Ext4）檔案系統：
   ```bash
   $ sudo mkfs.xfs /dev/sdb1
   # 若偏好 Ext4：sudo mkfs.ext4 /dev/sdb1
   ```

4. **步驟 4：建立掛載點資料夾 (`mkdir`)**
   - 建立欲銜接本硬碟的 Linux 目錄路徑（例如 `/mnt/data`）：
   ```bash
   $ sudo mkdir -p /mnt/data
   ```

5. **步驟 5：當前臨時掛載測試 (`mount`)**
   - 先以命令列進行手動掛載，驗證硬碟是否能正常讀寫：
   ```bash
   $ sudo mount /dev/sdb1 /mnt/data
   # 查看容量與掛載狀態是否成功：
   $ df -Th /mnt/data
   ```

6. **步驟 6：查詢唯一識別碼 UUID (`blkid`)**
   - 為防止開機硬碟順序跳轉，使用 `blkid` 查詢其專屬 UUID：
   ```bash
   $ sudo blkid /dev/sdb1
   # 取得輸出：/dev/sdb1: UUID="e5a1b3c8-1122-3344-5566-77889900aabb" TYPE="xfs"
   ```

7. **步驟 7：設定 `/etc/fstab` 永久掛載與安全檢定 (`mount -a`)**
   - 編輯設定檔，加入開機自動掛載設定（**外接硬碟務必補上 `nofail` 參數**）：
   ```bash title="/etc/fstab"
   UUID=e5a1b3c8-1122-3344-5566-77889900aabb  /mnt/data  xfs  defaults,nofail  0  2
   ```
   - 🚨 **終極保命驗證（嚴禁沒測試直接重新開機！）**：
   ```bash
   # 1. 卸載剛剛手動掛載的目錄
   $ sudo umount /mnt/data
   # 2. 執行 mount -a 測試 fstab 語法是否完全正確
   $ sudo mount -a
   # 3. 再次檢查 /mnt/data 是否順利自動被掛回
   $ df -Th /mnt/data
   ```
   只要步驟 3 看到 `/mnt/data` 成功掛回來且沒有任何報錯，就代表整個加裝新硬碟流程 100% 成功，重新開機萬無一失！

#### SWAP 交換空間管理

**SWAP (交換空間)** 扮演著記憶體不足時的最後防禦。當主機物理記憶體 (RAM) 將耗盡時，核心會將記憶體裡閒置的頁面 (Pages) 暫時遷移至 hard disk 的 SWAP 區塊，避免觸發 **OOM Killer (Out of Memory)** 砍掉應用服務。

在雲端虛擬機 (例如 AWS EC2 小記憶體規格) 中，最常見有效的做法是建立 **Swap File (交換檔案)**：

```bash showLineNumbers
# 步驟 1：使用 dd 建立一個 2GB 的檔案
$ sudo dd if=/dev/zero of=/swapfile bs=1M count=2048

# 步驟 2：設定嚴格權限 (只限 root 讀寫，防範資安風險)
$ sudo chmod 600 /swapfile

# 步驟 3：將檔案格式化為 SWAP 格式
$ sudo mkswap /swapfile

# 步驟 4：立即啟用交換檔案
$ sudo swapon /swapfile

# 步驟 5：檢查 SWAP 掛載狀況
$ free -h

# 步驟 6：設定 /etc/fstab 永久掛載 (於最底端加入下行)
# /swapfile  none  swap  sw  0  0
```

---

### 5. 磁碟維運與常見排錯技巧

收錄系統工程師在戰場上最高頻遇到的 **5 大磁碟維運與排錯狀況**：

#### 1. 明明 `df -h` 還有空間，卻報錯 `No space left on device`？
- **原因**：硬碟被數十萬至數百萬個微型小檔案（如 Session 暫存、Log 碎片、Crontab 郵件記錄）塞滿，導致硬碟容量未滿但 **Inode 表格被消耗殆盡 (`df -i` Use% = 100%)**。
- **標準 4 步排查、清除與防護 SOP**：
  1. **確認爆滿分割區 (`df -i`)**：
     ```bash
     $ df -i
     # 查看哪一個掛載點 (例如 / 或 /var) 的 IUse% 達到了 100%
     ```
  2. **定位兇手資料夾**：
     ```bash
     # 統計第一層目錄下的檔案數量並從大到小排序：
     $ for i in /*; do echo -n "$i: "; find "$i" -xdev | wc -l; done | sort -k 2 -n -r
     # 找到數量最大的目錄 (例如 /var) 後，再縮小範圍往下追查 /var/*
     ```
  3. **安全刪除海量小檔案 (🚨 警告：切勿直接用 `rm -rf *`！)**：
     當一個目錄下有上百萬個檔案時，直接執行 `rm -rf *` 會因展開的指令參數過長而跳錯 `Argument list too long`！必須改用以下三種高階清除方式：
     ```bash
     # 🟢 解法 A (最推薦)：使用 find 搭配 -delete 現場逐筆刪除 (不會展開參數)
     $ find /var/lib/php/sessions/ -type f -delete

     # 🟢 解法 B：使用 find 搭配 xargs 分批傳送給 rm 刪除
     $ find /var/lib/php/sessions/ -type f | xargs -r rm -f

     # 🟢 解法 C (極速黑魔法🚀)：檔案高達數百萬時，以 rsync 用空目錄結構替換，刪除速度最快
     $ mkdir -p /tmp/empty
     $ rsync -a --delete /tmp/empty/ /var/lib/php/sessions/
     ```
  4. **治本預防方針**：
     - **Crontab 排程自清**：定期清掉超過 N 天（例如 7 天）的舊暫存：
       ```bash
       0 3 * * * find /var/lib/php/sessions/ -type f -mtime +7 -delete
       ```
     - **格式化密度調整 (`mkfs`)**：若特定磁碟天生必須儲存數億個微型檔案，格式化時加上 `-i 4096` 參數調大 Inode 總量比例：
       ```bash
       $ sudo mkfs.ext4 -i 4096 /dev/sdb1
       ```

#### 2. 刪除了幾 GB 的 Log 檔案，為什麼 `df -h` 硬碟空間完全沒釋放？
- **原因**：使用 `rm error.log` 刪除了檔案，但後端的 Nginx / 應用程序**正以 File Descriptor 開啟著該檔案**，磁碟狀態處於隱形的 `(deleted)` 佔用中。
- **解法**：
  ```bash
  # 找出誰還抓著已刪除的檔案不放
  $ sudo lsof | grep deleted
  # 解決方式：重新啟動該服務 (如 sudo systemctl restart nginx)
  # 預防技巧：未來清空運行中的 Log 檔案時，改用清空指令取代 rm
  $ > error.log
  ```

#### 3. 雲端控制台加大了硬碟到 100GB，為什麼主機裡的 `df -h` 依然顯示 40GB？
- **原因**：雲端擴充的是「物理區塊容量」，還需指示系統對「檔案系統」進行線上擴張。
- **解法**：
  ```bash
  # 1. 擴充硬碟分割區邊界
  $ sudo growpart /dev/sda 2
  ```

  <Tabs>
    <TabItem value="resize-ext4" label="Ext4 線上擴充" default>
      ```bash showLineNumbers
      # 針對 Ext4 分割區進行拉伸
      $ sudo resize2fs /dev/sda2
      ```
    </TabItem>
    <TabItem value="resize-xfs" label="XFS 線上擴充">
      ```bash showLineNumbers
      # 針對 XFS 檔案系統 (注意：傳入參數為掛載點目錄路徑！)
      $ sudo xfs_growfs /
      ```
    </TabItem>
  </Tabs>

#### 4. 掛載點忙碌報錯 `target is busy`
- **原因**：目前終端機停留在該掛載目錄下，或某個程序正在讀取目錄內的檔案。
- **解法**：使用 `lsof +D <mount_point>` 或 `fuser -m <mount_point>` 定位並關閉該進程。

#### 5. 修改 `/etc/fstab` 語法錯誤導致重新開機卡在維修模式 (Emergency Mode)
- **急救手冊**：
  1. 在伺服器控制台輸入 `root` 密碼進入單人救援模式 (Single User Mode)。
  2. 由於根目錄此時為唯讀，需以**可讀寫 (rw)** 模式重新掛載根目錄：
     ```bash
     $ mount -o remount,rw /
     ```
  3. 編輯 `/etc/fstab` 修正錯誤的 UUID 或參數，存檔後輸入 `reboot` 即可順利開機。
