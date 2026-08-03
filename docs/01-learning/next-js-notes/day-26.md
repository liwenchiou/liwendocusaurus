---
title: "Day 26 - 檔案處理：整合 Cloudinary 實現高效圖片上傳"
sidebar_label: "Day 26 - 檔案處理"
sidebar_position: 26
description: "Next.js 30 天學習筆記系列 - 第 26 天：Day 26 - 檔案處理：整合 Cloudinary 實現高效圖片上傳。深入探討 Next.js 開發實戰技巧。"
keywords: [Day, 檔案處理, 整合, Cloudinary, 實現高效圖片上傳, learning, next-js-notes]
---


# Next.js 30 天全端實戰：Day 26 - 檔案處理：整合 Cloudinary 實現高效圖片上傳

## 一、 前言

在開發過程中，初學者常犯的錯誤是將圖片以 Base64 格式存在資料庫，或是直接存在伺服器的本地資料夾。這會導致資料庫肥大，或是在部署到 Vercel 等 Serverless 環境時，檔案因伺服器重啟而消失。

標準的做法是使用雲端服務。Cloudinary 不僅提供儲存空間，還能在抓取圖片時自動進行縮放、壓縮與轉檔。今天我們來實作一個讓使用者上傳文章封面圖的功能。

---

## 二、 本文：雲端儲存與 Client-side 上傳

### 1. 為什麼選擇 Cloudinary？

* 自動優化：透過網址參數就能調整圖片大小（例如：w_500, h_300）。
* CDN 加速：圖片會從離使用者最近的節點載入。
* 方案友善：提供免費額度，適合開發與測試。

### 2. 使用 CldUploadWidget (最速實作法)

Cloudinary 提供了官方的 Next.js 組件，讓我們不需要自己寫繁瑣的 `fetch` 與 `FileReader` 邏輯，就能擁有專業的上傳 UI。

[安裝指令]
```bash
npm install next-cloudinary
```

[範例程式碼：上傳按鈕組件]
```typescript
'use client';

import { CldUploadWidget } from 'next-cloudinary';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  return (
    <CldUploadWidget 
      uploadPreset="your_preset_name" // 在 Cloudinary 後台設定
      onSuccess={(result: any) => {
        onUpload(result.info.secure_url); // 取得上傳後的雲端網址
      }}
    >
      {({ open }) => (
        <button 
          type="button"
          onClick={() => open()}
          className="bg-blue-500 text-white p-2 rounded"
        >
          上傳圖片
        </button>
      )}
    </CldUploadWidget>
  );
}
```
### 3. 將網址存入資料庫

當 Cloudinary 回傳圖片網址後，我們只需透過 Server Action 將該字串存入 Prisma 即可。

[範例程式碼]
```typescript
// src/app/actions.ts
export async function updateCover(imageUrl: string) {
  await db.post.update({
    where: { id: '...' },
    data: { coverImage: imageUrl }
  });
  revalidatePath('/posts');
}
```
### 4. 安全性考量：Signed Uploads

為了防止濫用，我們不應該在前端暴露過多的權限。



1. **Unsigned Uploads**：適合簡單專案，任何人知道你的 Preset 名稱都能上傳。
2. **Signed Uploads**：推薦做法。前端上傳前先向 Next.js Server 請求一個「簽名（Signature）」，確保只有登入的使用者能發送上傳請求。


## 三、 結論：把儲存交給專業的來

檔案上傳不只是前端 `input` 的問題，更是後端架構與成本的平衡。

* 今日小結：
  - 永遠不要把圖片原始檔案存進資料庫。
  - 使用雲端服務（Cloudinary, AWS S3, Vercel Blob）來託管靜態檔案。
  - 結合 `next/image` 展示 Cloudinary 網址，能達到雙重優化效果。

* 開發者心得：實務上，圖片上傳後，我習慣在資料庫存入該圖片的 `public_id` 而非完整的網址。這樣未來如果更換域名或是調整 Cloudinary 的轉換規則，我只需要更改前端的渲染邏輯，而不需要去刷過一遍資料庫裡的舊資料。另外，記得要限制上傳檔案的大小（例如不得超過 5MB），這能有效防止你的流量配額被惡意耗盡。

---

參考來源：
1. Next Cloudinary Documentation (https://next.cloudinary.dev/)
2. Next.js - Image Optimization with Loaders (https://nextjs.org/docs/app/building-your-application/optimizing/images#loaders)