---
id: typeorm
title: "typeorm"
sidebar_label: "typeorm"
sidebar_position: 11

description: "typeorm 專案結構與核心速查：包含專案目錄架構、DataSource 連線設定結構、三大角色 (Entity, Migration, Seeder)、程式碼範例與常用的 Migration / Seed 執行指令。"
keywords: [typeorm, engineering, npm-packages]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# typeorm

`typeorm` 是 Node.js 環境中經典且功能全備的 ORM 套件。本篇提供 TypeORM 的**專案目錄結構**、**連線設定結構 (`DataSource`)**、**三大角色 (Entity / Migration / Seeder)** 範例與常用指令。

---

## 一、專案目錄結構

```text
.
├── .env                  # 資料庫連線環境變數
├── db/
│   ├── data-source.js    # TypeORM DataSource 集中設定
│   ├── seed.js           # Seeder 測試資料腳本
│   └── migrations/       # Migration 施工單目錄
├── entities/             # Entity 設計圖 (如 CreditPackage.js)
├── routes/               # Express API 路由 (getRepository CRUD)
└── app.js                # 入口檔 (執行 dataSource.initialize())
```

---

## 二、DataSource 連線結構 (`db/data-source.js`)

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

  synchronize: false, // ⚠️ 結構變更一律走 Migration，生產環境勿設為 true
  entities: [CreditPackage],
  migrations: ['db/migrations/*.js'],
})

module.exports = { dataSource }
```

---

## 三、三大角色對照表與範例

| 角色 | 比喻 | 職責說明與資料庫影響 |
| --- | --- | --- |
| **Entity** | 畫設計圖 | 使用 `EntitySchema` 描述 Table 欄位與型別（不改動 DB） |
| **Migration** | 施工單 | 紀錄結構變更 SQL（`migration:run` 才改動 DB 結構） |
| **Seeder** | 搬家具 | 寫入測試/預設資料（`seed` 才寫入 DB 資料） |

### 1. Entity (`entities/CreditPackage.js`)

```javascript title="entities/CreditPackage.js"
const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CreditPackage',
  tableName: 'CREDIT_PACKAGE',
  columns: {
    id: { primary: true, type: 'uuid', generated: 'uuid', nullable: false },
    name: { type: 'varchar', length: 50, nullable: false, unique: true },
    credit_amount: { type: 'integer', nullable: false },
    price: { type: 'numeric', precision: 10, scale: 2, nullable: false },
    created_at: { type: 'timestamp', createDate: true, nullable: false },
  },
})
```

### 2. Migration 檔 (`db/migrations/<timestamp>-Init.js`)

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
        CONSTRAINT "PK_CREDIT_PACKAGE_ID" PRIMARY KEY ("id")
      )
    `);
  }
  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "CREDIT_PACKAGE"`);
  }
}
```

### 3. Seeder 播種檔 (`db/seed.js`)

```javascript title="db/seed.js"
const { dataSource } = require('./data-source')

async function main() {
  await dataSource.initialize()
  const packageRepo = dataSource.getRepository('CreditPackage')

  await packageRepo.save([
    { name: '7 堂組合包方案', credit_amount: 7, price: 1400 },
    { name: '14 堂組合包方案', credit_amount: 14, price: 2520 },
  ])

  console.log('🌱 seed 灌入成功！')
  await dataSource.destroy()
}

main()
```

---

## 四、常用指令速查

```bash
# 1. 自動比對 Entity 生成 Migration 施工單
npm run migration:generate -- db/migrations/Init

# 2. 執行未跑過的 Migration (變更 DB 結構)
npm run migration:run

# 3. 還原上一次 Migration
npm run migration:revert

# 4. 灌入測試資料
npm run seed
```
