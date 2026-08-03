---
id: quest-8
title: "Node.js 主線任務八：用 Migration 建資料表與 Seeding 實戰 (LiveFit & School)"
sidebar_label: "\u200B第八週"
sidebar_position: 8

description: "> 🛑 防暴雷警示：本篇筆記包含 2026 Node.js 直播班第八週主線任務（LiveFit 健身房與學校成績系統雙關聯）的完整解答與實作細節。內容涵蓋第一關 LiveFit 3 張資料表與第二關 School 4 張資料表的 EntitySchema 宣告、外來鍵關聯、DataSource 集中設定、Migration 建表與 Seeder 資料播種。"
keywords: [Node.js, 主線任務八, TypeORM, EntitySchema, Migration, Seeder, LiveFit, School, learning, hexschool, nodejs-course, main-quests]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


> 🛑 **防暴雷警示**：以下筆記包含主線任務的完整解答與實作細節，強烈建議先親手透過 `EntitySchema` 劃定資料表藍圖並跑過一次 Migration，卡關再來對照參考喔！

本次任務重點為從零開始打造資料庫底層架構。我們將分別在 **第一關：LiveFit 健身房 (3 張表)** 與 **第二關：學校成績 (4 張表)** 中，運用 TypeORM 的 `EntitySchema` 宣告 Table 欄位與外來鍵關聯，透過 Migration 生成資料庫變更檔案並發動建表，最後透過 Seeder 清空與寫入合乎規範的初始測試資料。

---

## 第一關：LiveFit 健身房 (3 張資料表實作)

### 1. 定義 Entity (`entities/*.js`)

#### 教練實體 (`entities/USER.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`livefit/entities/USER.js`)</summary>

```javascript title="livefit/entities/USER.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "USER",
  tableName: "USER",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false },
    email: { type: "varchar", length: 320, nullable: false, unique: true },
    role: { type: "varchar", length: 20, nullable: false },
    created_at: { type: "timestamp", createDate: true, nullable: false },
    updated_at: { type: "timestamp", updateDate: true, nullable: false },
  },
});
```

</details>

#### 技能實體 (`entities/SKILL.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`livefit/entities/SKILL.js`)</summary>

```javascript title="livefit/entities/SKILL.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "SKILL",
  tableName: "SKILL",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false, unique: true },
  },
});
```

</details>

#### 課程實體與雙重關聯 (`entities/COURSE.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`livefit/entities/COURSE.js`)</summary>

```javascript title="livefit/entities/COURSE.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "COURSE",
  tableName: "COURSE",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 100, nullable: false },
    description: { type: "text", nullable: false },
    start_at: { type: "timestamp", nullable: false },
    end_at: { type: "timestamp", nullable: false },
    max_participants: { type: "integer", nullable: false },
    created_at: { type: "timestamp", createDate: true, nullable: false },
    updated_at: { type: "timestamp", updateDate: true, nullable: false },
  },
  relations: {
    user: {
      target: "USER",
      type: "many-to-one",
      joinColumn: { name: "user_id" },
    },
    skill: {
      target: "SKILL",
      type: "many-to-one",
      joinColumn: { name: "skill_id" },
    },
  },
});
```

</details>

---

### 2. 註冊 Entity (`db/data-source.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`livefit/db/data-source.js`)</summary>

```javascript title="livefit/db/data-source.js"
require("dotenv").config();
const { DataSource } = require("typeorm");
const User = require("../entities/USER");
const Skill = require("../entities/SKILL");
const Course = require("../entities/COURSE");

const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || "student",
  password: process.env.DB_PASSWORD || "student666",
  database: process.env.DB_DATABASE || "livefit",

  synchronize: false, // ⚠️ 鐵律：synchronize 固定為 false

  entities: [User, Skill, Course],
  migrations: ["db/migrations/*.js"],
});

module.exports = { dataSource };
```

</details>

---

### 3. 生成與執行 Migration

```bash
cd livefit
npm run migration:generate -- db/migrations/Init
npm run migration:run
```

---

### 4. Seeder 寫入關聯資料 (`db/seed.js`)

:::tip[💡 關鍵點：關聯寫入技巧]
在寫入 `COURSE` 時，無需手動取出 ID，直接將已 `save` 的教練與技能 Entity 物件作為 `user` 與 `skill` 屬性傳入，TypeORM 會自動提煉外來鍵寫入 DB。
:::

<details>
<summary>💻 點擊展開程式碼解答 (`livefit/db/seed.js`)</summary>

```javascript title="livefit/db/seed.js"
const { dataSource } = require("./data-source");

async function clearAll() {
  // 被 FK 參考的表最後刪除 (先刪 COURSE，再刪 USER 與 SKILL)
  for (const name of ["COURSE", "USER", "SKILL"]) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute();
    }
  }
}

async function main() {
  await dataSource.initialize();
  await clearAll();

  const skillRepo = dataSource.getRepository("SKILL");
  const userRepo = dataSource.getRepository("USER");
  const courseRepo = dataSource.getRepository("COURSE");

  // 1. 先建立基礎資料表 (SKILL, USER)
  const [weightTraining, yoga, spinning] = await skillRepo.save([
    { name: "重訓" },
    { name: "瑜珈" },
    { name: "飛輪" },
  ]);

  const [haige, xiaomei] = await userRepo.save([
    { name: "海格教練", email: "coach1@livefit.tw", role: "COACH" },
    { name: "小美教練", email: "coach2@livefit.tw", role: "COACH" },
  ]);

  // 2. 建立帶有外來鍵關聯的 COURSE 資料
  await courseRepo.save([
    {
      name: "肌力入門班",
      description: "從基本動作開始建立肌力",
      start_at: "2026-08-03 19:00:00",
      end_at: "2026-08-03 20:00:00",
      max_participants: 16,
      user: haige,
      skill: weightTraining,
    },
    {
      name: "週末飛輪",
      description: "燃脂飆汗飛輪課",
      start_at: "2026-08-08 10:00:00",
      end_at: "2026-08-08 11:00:00",
      max_participants: 12,
      user: xiaomei,
      skill: spinning,
    },
    {
      name: "晨間瑜珈",
      description: "喚醒身體的早晨瑜珈",
      start_at: "2026-08-05 07:00:00",
      end_at: "2026-08-05 08:00:00",
      max_participants: 8,
      user: xiaomei,
      skill: yoga,
    },
    {
      name: "核心特訓",
      description: "強化核心肌群穩定度",
      start_at: "2026-08-06 19:00:00",
      end_at: "2026-08-06 20:00:00",
      max_participants: 10,
      user: haige,
      skill: weightTraining,
    },
  ]);

  console.log("🌱 LiveFit seed 完成！");
  await dataSource.destroy();
}

main().catch((e) => {
  console.error("seed 失敗：", e.message);
  process.exit(1);
});
```

</details>

---

## 第二關：學校成績 (4 張資料表實作)

第二關共有 4 張資料表：`CLASS` (班級)、`SUBJECT` (科目)、`STUDENT` (學生) 與 `GRADE` (成績)。

### 1. 定義 Entity (`school/entities/*.js`)

#### 班級實體 (`school/entities/CLASS.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`school/entities/CLASS.js`)</summary>

```javascript title="school/entities/CLASS.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Class",
  tableName: "CLASS",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false },
  },
});
```

</details>

#### 科目實體 (`school/entities/SUBJECT.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`school/entities/SUBJECT.js`)</summary>

```javascript title="school/entities/SUBJECT.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Subject",
  tableName: "SUBJECT",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false },
  },
});
```

</details>

#### 學生實體與班級關聯 (`school/entities/STUDENT.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`school/entities/STUDENT.js`)</summary>

```javascript title="school/entities/STUDENT.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Student",
  tableName: "STUDENT",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    name: { type: "varchar", length: 50, nullable: false },
  },
  relations: {
    class: {
      target: "Class",
      type: "many-to-one",
      joinColumn: { name: "class_id" },
      nullable: false,
    },
  },
});
```

</details>

#### 成績實體與雙重關聯 (`school/entities/GRADE.js`)

<details>
<summary>💻 點擊展開程式碼解答 (`school/entities/GRADE.js`)</summary>

```javascript title="school/entities/GRADE.js"
const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Grade",
  tableName: "GRADE",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid", nullable: false },
    score: { type: "integer", nullable: false },
  },
  relations: {
    student: {
      target: "Student",
      type: "many-to-one",
      joinColumn: { name: "student_id" },
      nullable: false,
    },
    subject: {
      target: "Subject",
      type: "many-to-one",
      joinColumn: { name: "subject_id" },
      nullable: false,
    },
  },
});
```

</details>

---

### 2. 註冊 Entity 與 Migration

把四個 Entity 匯入並註冊至 `school/db/data-source.js` 的 `entities` 陣列後，在 `school/` 目錄執行 Migration 指令：

```bash
cd school
npm run migration:generate -- db/migrations/Init
npm run migration:run
```

---

### 3. Seeder 清空與播種實作 (`school/db/seed.js`)

:::warning[⚠️ 避坑預警：Seeder 清空與寫入順序]
* **寫入順序**：先寫入獨立表 (`Class`, `Subject`)，再寫入 `Student`，最後才寫入包含雙外來鍵的 `Grade`。
* **清空順序**：必須**先刪除帶有外來鍵的 `Grade`**，最後才刪除被參考的 `Class` 與 `Subject`，否則會觸發外來鍵約束報錯！
:::

<details>
<summary>💻 點擊展開程式碼解答 (`school/db/seed.js`)</summary>

```javascript title="school/db/seed.js"
const { dataSource } = require('./data-source')

/** 清空：被 FK 指著的表最後刪（GRADE 先刪，CLASS / SUBJECT 最後刪）。 */
async function clearAll() {
  const ORDER = [
    'Grade',
    'Student',
    'Class',
    'Subject',
  ]
  for (const name of ORDER) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute()
    }
  }
}

async function main() {
  await dataSource.initialize()
  await clearAll()

  const classRepo = dataSource.getRepository('Class')
  const subjectRepo = dataSource.getRepository('Subject')
  const studentRepo = dataSource.getRepository('Student')
  const gradeRepo = dataSource.getRepository('Grade')

  // 1. 建立班級與科目
  const [class1, class2] = await classRepo.save([
    { name: '一年一班' },
    { name: '一年二班' },
  ])

  const [chinese, math] = await subjectRepo.save([
    { name: '國文' },
    { name: '數學' },
  ])

  // 2. 建立學生 (接上對應班級)
  const [ming, hua] = await studentRepo.save([
    { name: '王小明', class: class1 },
    { name: '李小華', class: class2 },
  ])

  // 3. 建立成績 (接上學生與科目)
  await gradeRepo.save([
    { score: 95, student: ming, subject: chinese },
    { score: 88, student: hua, subject: math },
  ])

  console.log('🌱 School seed 完成！')
  await dataSource.destroy()
}

main().catch((e) => {
  console.error('seed 失敗：', e.message)
  process.exit(1)
})
```

</details>

---

## 本地單元測試驗收

分別在 `livefit/` 與 `school/` 資料夾下執行驗收：

```bash
# 驗收第一關 LiveFit
cd livefit && npm test

# 驗收第二關 School
cd ../school && npm test
```

* **LiveFit 關卡通過標籤**：`Tests: 13 passed, 13 total`
* **School 關卡通過標籤**：`Tests: 11 passed, 11 total`
