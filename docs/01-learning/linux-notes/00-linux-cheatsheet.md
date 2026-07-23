---
id: 00-linux-cheatsheet
title: 🐧 Linux 指令速查表
sidebar_label: "🔥 指令速查表"
sidebar_position: 0
description: "整理了 Linux 維運與系統管理最常用的核心指令速查表，隨查即用，快速解決實務需求。"
keywords: [Linux, cheatsheet, 指令速查表]
---

# Linux 指令速查表

這是一份根據前面的學習內容，所整理出的最實用指令速查表。忘記指令的時候，隨時打開這裡就對了！

## 📂 目錄操作 (Directory)

| 指令 | 常用參數 / 範例 | 說明 |
| --- | --- | --- |
| **`pwd`** | `pwd` | (Print Working Directory) 顯示目前所在絕對路徑 |
| **`cd`** | `cd /etc`, `cd ~`, `cd ..` | (Change Directory) 切換至指定目錄、家目錄、上一層 |
| **`ls`** | `ls -lah` | 列出目錄內容。`-l` 詳細資訊, `-a` 包含隱藏檔, `-h` 人類易讀 |
| **`mkdir`** | `mkdir -p a/b/c` | 建立新目錄。`-p` 允許遞迴建立父目錄 |
| **`rmdir`** | `rmdir empty_dir` | 刪除「空」目錄 (實務上更常直接用 `rm -r`) |

## 📄 檔案管理 (File)

| 指令 | 常用參數 / 範例 | 說明 |
| --- | --- | --- |
| **`touch`** | `touch file.txt` | 建立空檔案，或是更新現有檔案的時間 |
| **`cp`** | `cp -r src_dir dest_dir` | 複製檔案。複製整個資料夾需加 `-r` |
| **`mv`** | `mv old.txt new.txt` | 移動檔案。在同個路徑下移動等於「重新命名」 |
| **`rm`** | `rm -rf folder` | 刪除檔案或目錄。`-r` 遞迴刪除, `-f` 強制刪除不提示 |

## 👀 檢視與搜尋 (View & Search)

| 指令 | 常用參數 / 範例 | 說明 |
| --- | --- | --- |
| **`cat`** | `cat -n file.txt` | 一次性正序印出所有內容。`-n` 顯示行號 |
| **`tac`** | `tac file.log` | 倒序印出所有內容 (從最後一行印回來) |
| **`less`** | `less file.txt` | 分頁查看模式。可用 `/` 搜尋，按 `q` 離開 |
| **`head`** | `head -n 5 file.txt` | 查看檔案最前面的 N 行 |
| **`tail`** | `tail -n 10 -f app.log` | 查看最後 N 行。`-f` 會持續追蹤日誌更新 |
| **`grep`** | `grep -i "error" log` | 搜尋特定字串。`-i` 忽略大小寫, `-v` 反向排除 |
| **`find`** | `find / -name "*.log"` | 在系統中尋找檔案。可用 `-type f`, `-size +100M` 篩選 |

## ✍️ 文字編輯 (Editor)

| 指令 | 操作模式 | 說明 |
| --- | --- | --- |
| **`vi`** | `vi file.txt` | 啟動純文字編輯器 |
| **`i`** | (指令模式) | 進入**編輯模式** (Insert)，開始打字 |
| **`Esc`** | (編輯模式) | 退出編輯模式，回到**一般指令模式** |
| **`:wq`** | (底線命令) | 存檔並離開 (Write & Quit) |
| **`:q!`** | (底線命令) | 強制放棄修改並離開 |
| **`gg` / `G`** | (指令模式) | 跳轉到檔案的第一行 (`gg`) 或最後一行 (`G`) |
| **`yy` / `p`** | (指令模式) | 複製整行 (`yy`) / 貼上 (`p`) |
| **`dd` / `u`** | (指令模式) | 刪除/剪下整行 (`dd`) / 復原上一步驟 (`u`) |

## 📦 打包壓縮 (Archive & Compress)

| 指令 | 常用參數 / 範例 | 說明 |
| --- | --- | --- |
| **`tar`** | `tar -czvf bin.tar.gz /bin` | **打包並壓縮** (Create)。`f` 必須在最後面接檔名 |
| **`tar`** | `tar -xzvf bin.tar.gz` | **解壓縮** (eXtract) |
| **`zip`** | `zip -r data.zip folder` | 壓縮成跨平台的 zip 格式。目錄需加 `-r` |
| **`unzip`** | `unzip data.zip` | 解壓縮 zip 檔 |

## ⚙️ 系統變數與其他 (System & Misc)

| 指令 | 常用參數 / 範例 | 說明 |
| --- | --- | --- |
| **`|`** | `ls -l | grep txt` | **管線命令**：把左邊的輸出丟給右邊繼續處理 |
| **`env`** | `env` | 查看所有有 export 的全域環境變數 |
| **`which`** | `which ls` | 尋找指令對應的真實執行檔路徑 (只找 PATH) |
| **`type`** | `type cd` | 判斷該指令是內建指令 (builtin)、別名還是外部檔案 |
| **`alias`** | `alias ll='ls -lah'` | 建立指令別名 (暫時)。欲永久生效需寫入 `~/.bashrc` |
| **`man`** | `man ls` | 開啟該指令的官方使用手冊 (Manual) |
| **`apropos`**| `apropos directory` | 透過關鍵字反查不知道名稱的指令 |
