---
id: 15-file-search-regex
title: 🔍 尋找檔案與字串過濾 (Log 探勘神技)
sidebar_label: "尋找檔案與字串過濾"
sidebar_position: 15
---

# 尋找檔案與字串過濾 (Log 探勘神技)

當伺服器發生資安滲透、日誌異常爆發或效能卡頓時，Linux 三劍客與現代工具 `find`、`grep`、`awk` 是你在數萬筆系統紀錄裡進行資料探勘 (Data Mining) 的瑞士軍刀。

---

## 1. `find`：根據屬性、大小與時間搜尋主機檔案

```bash showLineNumbers
# 1. 依檔案名稱過濾 (-name 可以支援通配符)
$ sudo find /var/log/ -name "*.log"

# 2. 🌟 依檔案大小過濾 (尋找大於 100MB 且修改時間在 7 天內的檔案)
$ sudo find /var/ -type f -size +100M -mtime -7

# 3. 🌟 搭配執行指令 (-exec)：找到 30 天以前的舊日誌並自動清除
$ sudo find /var/log/app -name "*.log" -type f -mtime +30 -delete
```

---

## 2. `grep` / `ripgrep (rg)`：高速正規表示法字串比對

```bash showLineNumbers
# 1. 忽略大小寫 (-i)，並列出匹配所在的檔案名稱與行號 (-rn)
$ grep -rni "error" /var/log/nginx/

# 2. 🌟 反向排除 (-v)：列出 Nginx access.log 中所有不包含 " 200 " (非成功請求) 的列
$ grep -v " 200 " /var/log/nginx/access.log

# 3. 查閱錯誤訊息的「前後線索」(-C 3 表示同時印出匹配行的 上 3 行 與 下 3 行 上下文)
$ grep -C 3 "NullPointerException" /opt/app/error.log
```

---

## 3. 日誌探勘與維運三大高階實戰情境範例

### 情境一：主機出現 `No space left on device`，如何在 5 秒內找出一夕之間灌滿硬碟的兇手？

- **實戰指令**：
  ```bash
  # 從系統根目錄尋找超過 500MB 的檔案，並把它們交給 ls -lh 依序列出完整容量資訊
  $ sudo find / -type f -size +500M -exec ls -lh {} + 2>/dev/null | awk '{print $5, $9}'
  ```

### 情境二：網站遭 DDoS 或暴力測試，如何用 `grep` + `awk` 瞬間統計出「發送 502/404 最多的 前 10 個 IP 排行榜」？

- **實戰指令 (Web Access Log 分析精華)**：
  ```bash showLineNumbers
  # 步驟拆解：抓取 502 報錯 -> 印出第 1 欄(IP) -> 排序 -> 統計重複次數 -> 依照數值反向排列 -> 取前 10 名
  $ grep " 502 " /var/log/nginx/access.log \
      | awk '{print $1}' \
      | sort \
      | uniq -c \
      | sort -nr \
      | head -n 10
  ```

### 情境三：想在專案數千隻原始碼檔案中，快速找出「哪隻程式碼偷偷硬編碼 (Hardcode) 了資料庫連線密碼」？

- **實戰指令**：
  ```bash
  # -R 遞迴搜尋, -i 忽略大小寫, -l 只顯示檔名不印出內容, --exclude-dir 排除不要查的資料夾
  $ grep -Ril --exclude-dir={node_modules,.git,vendor} "password *=" /opt/my-project/
  ```
