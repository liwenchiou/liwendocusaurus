---
id: 01-environment
title: 🐧 環境建置與觀念
sidebar_label: "​環境建置與觀念"
sidebar_position: 1
description: "介紹什麼是 Linux，以及如何透過 Docker 快速建置 Rocky Linux 環境，為後續的學習打下基礎。"
keywords: [Linux, Rocky Linux, Docker, 環境建置]
---


# Linux 學習筆記

本系列筆記整理自《Linux 系統管理達人養成實務攻略》，旨在建立紮實的 Linux 系統管理與維運基礎。無論是針對日常伺服器管理、自動化部署，或是準備 RHCSA (Red Hat Certified System Administrator) 認證，熟悉 Linux 底層運作邏輯與指令都是不可或缺的核心技能。內容涵蓋從基礎的環境建置、權限管控、系統資源監控，到進階的磁碟與網路管理，透過循序漸進的實務操作，帶你一步步掌握現代系統管理員 (Sysadmin) 的必備武器。

## 什麼是 Linux？

簡單來說，Linux 是一套免費、開源且穩定性極高的作業系統 (Operating System)。但嚴格來說，**Linux 其實只是一個「核心 (Kernel)」**，負責與電腦硬體溝通、分配資源（如 CPU、記憶體）。我們平常聽到或使用的 Linux 系統，都是以這個核心為基礎，加上各種系統程式與應用軟體包裝而成的「發行版 (Distribution，常簡稱 Distro)」。

:::info[💡 為什麼有這麼多種 Linux 系統？]
因為 Linux 核心是開源的，任何人都可以拿去修改並組裝成自己的作業系統版本。目前市場上主要分為兩大主流體系：

- **Red Hat 體系**：例如 RHEL, CentOS, Rocky Linux, AlmaLinux。以企業級的穩定度著稱，是許多大型企業與伺服器的首選，也是本系列筆記的學習重點。
- **Debian 體系**：例如 Debian, Ubuntu。以龐大的社群支援與套件庫聞名，常見於雲端主機與一般開發者環境。
  :::

**為什麼選擇學習 Rocky Linux？**
過去企業常使用免費的 CentOS 作為伺服器系統，但隨著官方改變 CentOS 的發布策略，**Rocky Linux** 成為了接替 CentOS 的完美開源替代方案。它與商用的 Red Hat Enterprise Linux (RHEL) 保持 100% 原始碼相容 (Bug-for-Bug Compatible)，這意味著你在 Rocky Linux 上學到的所有指令與技能，都能直接無縫應用在企業主流的 RHEL 伺服器環境中。

## 透過 Docker 安裝 Rocky Linux

為了方便學習與練習，本筆記將使用 Docker 來啟動 Rocky Linux 容器。如果你還不熟悉 Docker，可以先參考另一篇：[Docker 學習筆記](https://garden.liwen.studio/docs/learning/docker-notes)。

1. 確保 Docker 已經啟動後，輸入以下指令來建立並進入 Rocky Linux 容器：

```bash
docker run -it --name my-rocky rockylinux:9.3.20231119-minimal /bin/bash
```

:::info[💡 為什麼直接從 Docker Desktop 點擊啟動會立刻關閉？]
很多新手在下載 `rockylinux` 映像檔後，會習慣性地去 Docker Desktop 介面中直接按下「Run」按鈕，結果發現容器瞬間就顯示 Exited（秒退），**核心原因是：缺乏常駐的前景行程 (Foreground Process)**。

- **原理**：傳統虛擬機 (VM) 開機後會執行完整的系統初始化 (systemd) 並在背景常駐；但 Docker 容器的生命週期，完全繫結於它的主行程 (PID 1)。
- **狀況**：像 `rockylinux` 這類基礎映像檔，預設並沒有在背景執行任何長期運作的服務 (例如 Web 伺服器)。當你在圖形介面直接啟動它時，Docker 執行完預設指令就會認為任務已完成，導致容器隨即結束。
- **解法**：這也就是為什麼我們必須打開終端機，手動輸入上面的啟動指令，並加上 `-it` (互動模式) 指定 `/bin/bash` 作為進入點，這樣容器才會為了等待你輸入指令而保持開啟！
  :::

2. 執行指令後，我們就會進入 Rocky Linux 的互動模式 (Interactive mode)。可以輸入 `ls` 指令測試一下，看看根目錄下的結構：

**輸入指令**：

```bash
ls
```

**輸出結果**：

```text
afs  dev  home   lib64       media  opt   root  sbin  sys  usr
bin  etc  lib    lost+found  mnt    proc  run   srv   tmp  var
```

### 🏢 實境演練：確認作業系統版本

**情境背景**：
你剛剛啟動了容器，但老闆說：「你確定這是我們要的 Rocky Linux 9 嗎？」為了確認，你需要檢查系統底層的版本資訊檔。

**你的操作流程**：
```bash
# 查看系統發行版資訊檔 (os-release)
$ cat /etc/os-release

# 輸出結果：
NAME="Rocky Linux"
VERSION="9.3 (Blue Onyx)"
ID="rocky"
ID_LIKE="rhel centos fedora"
# ...看到這些字眼，確認是 Rocky Linux 9 無誤！
```

恭喜你已經成功將 Rocky Linux 環境建置成功，可以安心繼續往下練習了！
