---
id: typeorm
title: "TypeORM 專案結構、三大角色與實戰指令"
sidebar_label: "\u200B9-2 TypeORM 結構與三大角色"
sidebar_position: 18

description: "本篇筆記完整整理 TypeORM 在 Node.js / Express 開發中的專案目錄結構、DataSource 連線設定結構，以及三大核心角色：Entity (設計圖)、Migration (施工單) 與 Seeder (搬家具)。內容包含資料庫初始化流程、各角色實作範例與日常開發指令速查。"
keywords: [TypeORM, 專案結構, DataSource, Entity, Migration, Seeder, EntitySchema, PostgreSQL, learning, hexschool, nodejs-course]
---

import Head from '@docusaurus/Head';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Head>
  <script type="application/ld+json">
    {`
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "TypeORM 專案結構、三大角色與實戰指令",
        "datePublished": "2026-08-01T19:03:00.000Z",
        "author": [{
            "@type": "Person",
            "name": "liwen"
        }],
        "description": "本篇筆記完整整理 TypeORM 在 Node.js / Express 開發中的專案目錄結構、DataSource 連線設定結構，以及三大核心角色：Entity (設計圖)、Migration (施工單) 與 Seeder (搬家具)。內容包含資料庫初始化流程、各角色實作範例與日常開發指令速查。"
      }
    `}
  </script>
</Head>


# TypeORM 專案結構、三大角色與實戰指令

在 Node.js / Express 專案中引入 TypeORM 時，建立清晰的專案目錄架構與連線配置至關重要。本篇筆記完整說明 TypeORM 的**專案結構**、**連線架構 (`DataSource`)**，以及驅動資料庫管理的三大核心角色——**Entity**、**Migration** 與 **Seeder**，並整理日常開發必備的操作指令。

---

## 零、TypeORM 專案結構與連線架構

### 1. 專案目錄結構

標準的 Express + TypeORM 專案目錄分工如下：

```text
node-js-week8-demo/
├── .env                  # 資料庫連線環境變數 (DB_HOST, DB_PORT, DB_USERNAME...)
├── db/
│   ├── data-source.js    # TypeORM 集中連線設定檔 (DataSource)
│   ├── seed.js           # Seeder 測試資料播種腳本
│   └── migrations/       # Migration 施工單檔案庫
├── entities/             # Entity 設計圖 (如 CreditPackage.js, User.js...)
├── routes/               # Express 路由 (透過 getRepository 執行 API CRUD)
└── app.js / bin/www.js   # 伺服器入口檔 (啟動前執行 dataSource.initialize())
```

### 2. 連線設定結構 (`db/data-source.js`)

在 TypeORM 中，透由 `DataSource` 物件進行集中式連線管理：

```javascript title="db/data-source.js"
require('dotenv').config()
const { DataSource } = require('typeorm')
const CreditPackage = require('../entities/CreditPackage')

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5434),
  username: process.env.DB_USERNAME || 'student',
  password: process.env.DB_PASSWORD || 'student666',
  database: process.env.DB_DATABASE || 'livefit_demo',

  // ⚠️ 鐵律：synchronize 固定為 false！關閉自動同步，結構變更一律走 Migration
  synchronize: false,

  entities: [CreditPackage],          // 註冊所有的 Entity
  migrations: ['db/migrations/*.js'], // 註冊 Migration 檔案路徑
})

module.exports = { dataSource }
```

### 3. 伺服器啟動初始化結構

在伺服器門口 (`bin/www.js` 或 `app.js`)，必須先完成連線初始化才能對外提供服務：

```javascript title="bin/www.js"
const { dataSource } = require('../db/data-source')

dataSource.initialize()
  .then(() => {
    console.log('✅ 資料庫連線成功！')
    app.listen(process.env.PORT || 3000, () => {
      console.log('伺服器啟動於 http://localhost:3000')
    })
  })
  .catch((error) => {
    console.error('❌ 資料庫連線失敗：', error)
    process.exit(1) // 連不上資料庫直接收攤
  })
```

---

## 一、三大角色分工心智模型

| 角色 | 檔案位置 | 比喻說明 | 職責與資料庫影響 |
| --- | --- | --- | --- |
| **Entity** | `entities/*.js` | **畫設計圖** | 使用 `EntitySchema` 描述 Table 欄位與型別（資料庫**毫無反應**） |
| **Migration** | `db/migrations/*.js` | **施工單** | 紀錄資料庫變更的 SQL 腳本（執行 `migration:run` 才修改**結構**） |
| **Seeder** | `db/seed.js` | **搬家具** | 寫入測試或初始化預設資料（執行 `seed` 才寫入**資料**） |

:::tip[💡 關鍵心智模型]
修改 Entity 設計圖時資料庫不會改變——**只有 `migration:run` 會變更結構、只有 `seed` 會變更資料**。
:::

---

## 二、角色一：Entity (畫設計圖)

Entity 負責定義資料表的結構、欄位型別與約束條件。

### 範例程式碼 (`entities/CreditPackage.js`)

```javascript title="entities/CreditPackage.js"
const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CreditPackage',        // 程式內識別名稱 (getRepository 用)
  tableName: 'CREDIT_PACKAGE',  // 資料庫實際 Table 名稱
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true,
    },
    credit_amount: {
      type: 'integer',
      nullable: false,
    },
    price: {
      type: 'numeric',
      precision: 10,
      scale: 2,
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false,
    },
  },
})
```

---

## 三、角色二：Migration (施工單)

Migration 記錄每次資料庫結構的改動 SQL，並透過版本控管確保所有人的資料庫一致。

### 使用指令

<Tabs>
  <TabItem value="generate" label="1. 產生施工單 (Generate)" default>
    ```bash
    # 自動比對 Entity 與現有 DB 差異並生成 Migration 檔案
    npm run migration:generate -- db/migrations/Init
    ```
  </TabItem>
  <TabItem value="run" label="2. 正式動工 (Run)">
    ```bash
    # 執行未跑過的 Migration，真正修改資料庫結構
    npm run migration:run
    ```
  </TabItem>
  <TabItem value="revert" label="3. 還原上一步 (Revert)">
    ```bash
    # 還原最近一次執行的 Migration
    npm run migration:revert
    ```
  </TabItem>
</Tabs>

### 生成的 Migration 範例程式碼 (`db/migrations/<timestamp>-Init.js`)

```javascript
module.exports = class Init1722513600000 {
  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "CREDIT_PACKAGE" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "credit_amount" integer NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_CREDIT_PACKAGE_NAME" UNIQUE ("name"),
        CONSTRAINT "PK_CREDIT_PACKAGE_ID" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "CREDIT_PACKAGE"`);
  }
}
```

---

## 四、角色三：Seeder (搬家具)

Seeder 負責在結構建立完成後，清空舊資料並灌入初始測試資料。

### 使用指令

```bash
# 執行播種腳本灌入測試資料
npm run seed
```

### 範例程式碼 (`db/seed.js`)

```javascript title="db/seed.js"
const { dataSource } = require('./data-source')

async function clearAll() {
  for (const name of ['Course', 'User', 'Skill', 'CreditPackage']) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute()
    }
  }
}

async function main() {
  await dataSource.initialize()
  await clearAll()

  const packageRepo = dataSource.getRepository('CreditPackage')

  await packageRepo.save([
    { name: '7 堂組合包方案', credit_amount: 7, price: 1400 },
    { name: '14 堂組合包方案', credit_amount: 14, price: 2520 },
    { name: '21 堂組合包方案', credit_amount: 21, price: 4800 },
  ])

  console.log('🌱 seed 測試資料灌入完成！')
  await dataSource.destroy()
}

main().catch((e) => {
  console.error('seed 失敗：', e.message)
  process.exit(1)
})
```

---

## 五、API 讀寫結構 (Repository CRUD 範例)

在 Express 路由中取得 Repository 進行 API 資料存取：

```javascript title="routes/creditPackage.js"
const express = require('express')
const router = express.Router()
const { dataSource } = require('../db/data-source')

// GET /api/credit-package —— 取得清單
router.get('/', async (req, res, next) => {
  try {
    const packages = await dataSource.getRepository('CreditPackage').find({
      select: ['id', 'name', 'credit_amount', 'price']
    })
    res.status(200).json({ status: 'success', data: packages })
  } catch (error) {
    next(error)
  }
})

// POST /api/credit-package —— 新增資料
router.post('/', async (req, res, next) => {
  try {
    const { name, credit_amount, price } = req.body
    const packageRepo = dataSource.getRepository('CreditPackage')

    const newPackage = packageRepo.create({ name, credit_amount, price })
    const result = await packageRepo.save(newPackage)

    res.status(200).json({ status: 'success', data: result })
  } catch (error) {
    next(error)
  }
})

module.exports = router
```

---

## 六、日常操作指令速查表

| 操作情境 | 執行指令 | 說明 |
| --- | --- | --- |
| **自動生成施工單** | `npm run migration:generate -- db/migrations/名稱` | 比對 Entity 與 DB 差異建立 SQL 腳本 |
| **執行變更結構** | `npm run migration:run` | 執行未執行的 Migration 變更 Table |
| **還原上一版變更** | `npm run migration:revert` | 撤銷上一次 `up()` 的結構異動 |
| **灌入測試資料** | `npm run seed` | 執行 Seeder 寫入初始化測試數據 |
