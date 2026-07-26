---
id: 14-compression-backup
title: 🗜️ 檔案壓縮與解壓縮 (備份與還原)
sidebar_label: "檔案壓縮與解壓縮"
sidebar_position: 14
---

# 檔案壓縮與解壓縮 (備份與還原)

在主機日誌打包、應用程式版控部署以及資料庫災難復原時，熟悉檔案打包 (`tar`) 與現代高效壓縮引擎 (`gzip` / `xz` / `zstd`) 是 Linux 管理員必備基礎。

---

## 1. 現代 Linux 備份黃金組合：`tar` 打包 + 壓縮

`tar` (Tape Archive) 本身只將多個檔案**結合打包為一個檔案**，需配合後置壓縮參數：

| 參數格式                  | 壓縮引擎               | 壓縮比與效能特徵                             | 常用實務建議                          |
| :------------------------ | :--------------------- | :------------------------------------------- | :------------------------------------ |
| **`.tar.gz` (`-z`)**      | **`gzip`**             | 壓縮速度快、通用性最高 (100% 主機支援)       | 日常網站備份、一般設定檔備份首選      |
| **`.tar.xz` (`-J`)**      | **`xz`**               | 壓縮比極佳，但壓縮消耗較多 CPU 與時間        | 發布 Linux 系統映像檔或長期歷史庫歸檔 |
| **`.tar.zst` (`--zstd`)** | **`zstd` (Zstandard)** | **現代新趨勢**：速度媲美 gzip、壓縮比逼近 xz | 巨量 Log 資料與高效能容器封裝新標準   |

```bash showLineNumbers
# 1. 🌟 建立 tar.gz 壓縮包 (-c 建立, -z 使用 gzip, -v 詳細顯示, -f 指定檔案名稱)
$ tar -czvf web-backup-20260726.tar.gz /var/www/html /etc/nginx

# 2. 🌟 解壓縮到指定目錄 (-x 解壓, -C 指定還原目標位置)
$ sudo mkdir -p /tmp/restore
$ tar -xzvf web-backup-20260726.tar.gz -C /tmp/restore/

# 3. 🌟 不解壓縮，直接檢閱壓縮檔裡含有哪些檔案清單 (-t 檢視列表)
$ tar -tzvf web-backup-20260726.tar.gz
```

---

## 2. 企業檔案壓縮與還原三大實戰情境範例

### 情境一：備份專案資料夾時，如何「排除」快取與龐大的 Node.js/Python 依賴包？

- **狀況描述**：要打包 `/opt/web-app/` 進行異地備份，但不想把數十萬個無用的小檔案 `node_modules` 與 `.cache` 壓進去浪費空間。
- **實戰指令 (`--exclude`)**：
  ```bash
  $ tar --exclude='*/node_modules*' --exclude='*/.cache*' -czvf web-app-clean.tar.gz /opt/web-app/
  ```

### 情境二：硬碟剩餘空間不夠放備份檔，如何「透過 SSH 管線直接流式加密轉移」到別台伺服器？

- **狀況描述**：伺服器只剩 2GB 硬碟空間，但你想壓縮備份 20GB 的 `/var/lib/mysql`，根本沒空間產出本地壓縮檔。
- **實戰管線神技 (SSH Stream Tar)**：
  ```bash
  # 使用標準輸出 (-) 與管道 (|)，完全不在本機產生備份檔案，直接穿透網路存進遠端新機器！
  $ sudo tar -czvf - /var/lib/mysql | ssh root@new-server "cat > /data/backup/mysql-live.tar.gz"
  ```

### 情境三：如何從 50GB 的巨大 `.tar.gz` 檔案中，只「單獨解壓並抓出一份被誤刪的設定檔」？

- **狀況描述**：不小心改壞了 `/etc/nginx/nginx.conf`，想從幾千筆歷史檔案的 `.tar.gz` 裡單獨抽出那一個設定檔，不用解整個 50GB。
- **實戰指令 (指定相對路徑解壓)**：
  ```bash
  # 指令尾部加上想抽取的檔案「在包裡的正確相對路徑」，幾秒內就單獨抓出來！
  $ tar -xzvf full-server-backup.tar.gz var/www/etc/nginx/nginx.conf
  ```
