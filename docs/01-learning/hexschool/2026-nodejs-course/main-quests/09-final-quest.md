---
id: final-quest
title: "Node.js 最終任務：期末專案 API 實作與套件依賴除錯"
sidebar_label: "\u200B最終任務"
sidebar_position: 9

description: "2026 Node.js 直播班期末最終任務實作筆記。涵蓋後端 M1~M6 API 實作、常見的 GitHub Actions 部署錯誤排查，以及如何徹底拔除 package-lock.json 中殘留的 zod 模組，確保專案乾淨且順利通過自動化測試。"
keywords:
  [
    Node.js,
    最終任務,
    期末專案,
    API 實作,
    package-lock.json,
    zod,
    GitHub Actions,
    learning,
    hexschool,
    nodejs-course,
    main-quests,
  ]
---

> 🛑 **防暴雷警示**：以下筆記包含 2026 Node.js 直播班期末最終任務 M1~M6 的完整解答與實作細節，強烈建議先自己想過商業邏輯與條件判斷後，卡關再來對照參考喔！

本篇筆記總結了 2026 Node.js 直播班「期末最終任務」的開發實戰經驗。這次的專案涵蓋了從 M1 到 M6 的完整後端 API 實作，並記錄了在專案開發後期遇到的套件依賴與 GitHub Actions 自動化測試部署問題。

---

## 1. M1 實作：基礎公開 API (技能與方案)

M1 的重點在於建立基礎的「教練技能」與「購課方案」CRUD。需特別注意輸入欄位的型別驗證與必填判斷。

<details>
<summary>💻 點擊展開程式碼解答 (`backend/routes/skill.js` & `backend/routes/creditPackage.js`)</summary>

```javascript title="backend/routes/skill.js"
const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../utils/dataSource");
const Skill = require("../entities/Skill");
const { sendSuccess, sendFailed } = require("../utils/responseFormat");
const { isValidString, isValidUUID } = require("../utils/validations");

// 新增教練技能的 API
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!isValidString(name, 50)) {
      return sendFailed(res, 400, "欄位驗證失敗");
    }
    const skillRepo = AppDataSource.getRepository(Skill);

    // 先去資料庫找找看是不是已經有這個技能了
    const existingSkill = await skillRepo.findOne({ where: { name } });
    if (existingSkill) {
      return sendFailed(res, 409, "資料重複");
    }

    // 確定沒有重複就把它存進去
    const newSkill = skillRepo.create({ name });
    await skillRepo.save(newSkill);

    return sendSuccess(res, 201, {
      id: newSkill.id,
      name: newSkill.name,
    });
  } catch (error) {
    next(error);
  }
});

// 取得所有技能列表
router.get("/", async (req, res, next) => {
  try {
    const skillRepo = AppDataSource.getRepository(Skill);
    const skills = await skillRepo.find();

    // 把資料整理成前端要的長相
    const data = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    }));

    return sendSuccess(res, 200, data);
  } catch (error) {
    next(error);
  }
});

// 刪除某個不需要的技能
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return sendFailed(res, 400, "欄位驗證失敗"); // 測試檔說如果 id 亂寫要回傳 400 Failed
    }

    const skillRepo = AppDataSource.getRepository(Skill);
    const existingSkill = await skillRepo.findOne({ where: { id } });

    if (!existingSkill) {
      // 如果資料庫根本找不到這個 id，也要回報錯誤給前端
      return sendFailed(res, 400, "查無此技能"); // 看測試檔寫的，這裡要失敗
    }

    await skillRepo.delete(id);
    return sendSuccess(res, 200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

</details>

---

## 2. M2 實作：會員註冊、登入與個人資料

M2 結合了 JWT Token 驗證機制 (`verifyToken`) 與 `bcrypt` 密碼加密，用來保護會員的個資安全。

<details>
<summary>💻 點擊展開程式碼解答 (`backend/routes/user.js`)</summary>

```javascript title="backend/routes/user.js"
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { AppDataSource } = require("../utils/dataSource");
const User = require("../entities/User");
const { sendSuccess, sendFailed } = require("../utils/responseFormat");
const { generateToken, verifyToken } = require("../utils/auth");
const {
  isValidString,
  isValidEmail,
  isValidPassword,
} = require("../utils/validations");

const saltRounds = 10;

// 會員註冊的 API
router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!isValidString(name, 50) || !isValidEmail(email)) {
      return sendFailed(res, 400, "欄位驗證失敗");
    }
    if (!isValidPassword(password)) {
      return sendFailed(
        res,
        400,
        "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字",
      );
    }

    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return sendFailed(res, 409, "Email 已被註冊");
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = userRepo.create({
      name,
      email,
      password: hashPassword,
      role: "USER",
    });
    await userRepo.save(newUser);

    return sendSuccess(res, 201, {
      user: {
        id: newUser.id,
        name: newUser.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 處理會員登入
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.trim().length === 0
    ) {
      return sendFailed(res, 400, "欄位驗證失敗");
    }
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return sendFailed(res, 400, "使用者不存在或密碼輸入錯誤");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendFailed(res, 400, "使用者不存在或密碼輸入錯誤");
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
    });

    return sendSuccess(res, 200, {
      token,
      user: {
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 抓取會員自己的個人資料 (要帶 token)
router.get("/profile", verifyToken, async (req, res, next) => {
  try {
    return sendSuccess(res, 200, {
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

</details>

---

## 3. M3 實作：公開課程查詢與報名邏輯

M3 開始進入實戰的核心。查詢課程時需判斷時間區間 (`LessThanOrEqual`, `MoreThan`)；報名時則需層層把關：「是否重複報名」、「是否有剩餘堂數」以及「課程是否滿班」。

:::tip[💡 報名邏輯防呆檢查點]

1. 課程是否存在？
2. 是否已經報名過？ (連取消的也要算，不能再報)
3. 使用者是否還有堂數？ (總買的 - 所有還未取消的報名)
4. 課程是否還有名額？ (檢查該課程還沒取消的有效報名數)
   :::

<details>
<summary>💻 點擊展開程式碼解答 (`backend/routes/coursePublic.js`)</summary>

```javascript title="backend/routes/coursePublic.js"
const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../utils/dataSource");
const Course = require("../entities/Course");
const { sendSuccess, sendFailed } = require("../utils/responseFormat");
const { LessThanOrEqual, MoreThan } = require("typeorm");
const { verifyToken } = require("../utils/auth");
const CourseBooking = require("../entities/CourseBooking");
const CreditPurchase = require("../entities/CreditPurchase");
const { isValidUUID } = require("../utils/validations");

// 讓會員報名課程 (記得掛上 verifyToken)
router.post("/:courseId", verifyToken, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!isValidUUID(courseId)) {
      return sendFailed(res, 400, "參數格式錯誤");
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const bookingRepo = AppDataSource.getRepository(CourseBooking);
    const purchaseRepo = AppDataSource.getRepository(CreditPurchase);

    // 第一關：檢查這堂課到底存不存在
    const course = await courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      return sendFailed(res, 400, "查無此課程");
    }

    // 第二關：檢查這個人是不是已經報名過同一堂課了
    const existingBooking = await bookingRepo.findOne({
      where: {
        user: { id: req.user.id },
        course: { id: courseId },
      },
    });

    if (existingBooking) {
      return sendFailed(res, 400, "已經報名過此課程");
    }

    // 第三關：算一下他還有沒有堂數可以扣
    const purchases = await purchaseRepo.find({
      where: { user: { id: req.user.id } },
    });
    const totalCredits = purchases.reduce(
      (sum, p) => sum + p.purchased_credits,
      0,
    );

    const { IsNull } = require("typeorm");
    const allActiveBookings = await bookingRepo.find({
      where: {
        user: { id: req.user.id },
        cancelled_at: IsNull(),
      },
    });
    const creditRemain = totalCredits - allActiveBookings.length;

    if (creditRemain <= 0) {
      return sendFailed(res, 400, "已無可使用堂數");
    }

    // 第四關：檢查這堂課還有沒有位子 (只算還沒取消的有效報名)
    const courseActiveBookings = await bookingRepo.find({
      where: {
        course: { id: courseId },
        cancelled_at: IsNull(),
      },
    });

    if (courseActiveBookings.length >= course.max_participants) {
      return sendFailed(res, 400, "已達最大參加人數，無法參加");
    }

    // 四關都過了！幫他建立報名紀錄
    const newBooking = bookingRepo.create({
      user: req.user,
      course,
    });
    await bookingRepo.save(newBooking);

    return sendSuccess(res, 201, null);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
```

</details>

---

## 4. M4~M6 實作：教練後台與營收計算

後台管理中，最困難的屬「營收計算 (`/coaches/revenue`)」。我們需要先算出「全站平均單堂均價」，再乘上教練在該月成功開設並被報名的有效人數。

<details>
<summary>💻 點擊展開程式碼解答 (`backend/routes/admin.js`)</summary>

```javascript title="backend/routes/admin.js"
const express = require("express");
const router = express.Router();
const { AppDataSource } = require("../utils/dataSource");
const User = require("../entities/User");
const Coach = require("../entities/Coach");
const Course = require("../entities/Course");
const { sendSuccess, sendFailed } = require("../utils/responseFormat");
const { verifyToken } = require("../utils/auth");

// 自己寫一個檢查權限的 Middleware，專門用來擋掉不是教練的人
const isCoach = async (req, res, next) => {
  const coachRepo = AppDataSource.getRepository(Coach);
  const coach = await coachRepo.findOne({
    where: { user: { id: req.user.id } },
    relations: { skills: true },
  });

  if (!coach) {
    return sendFailed(res, 403, "此使用者不是教練");
  }

  req.coach = coach; // 把查到的教練資料掛在 req 上，後面的 API 就可以直接拿來用了
  next();
};

const CreditPurchase = require("../entities/CreditPurchase");
const CreditPackage = require("../entities/CreditPackage");
const CourseBooking = require("../entities/CourseBooking");

// 算一下教練這個月賺了多少錢 (M6 作業的重頭戲)
router.get("/coaches/revenue", verifyToken, isCoach, async (req, res, next) => {
  try {
    const { month } = req.query; // 前端會傳 'january' 這種英文月份過來
    if (!month) {
      return sendFailed(res, 400, "缺少 month 參數");
    }

    // 老師說要先把英文月份轉成 0 到 11，才好丟給 Date 用
    const monthNames = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthIndex = monthNames.indexOf(month.toLowerCase());

    if (monthIndex === -1) {
      return sendFailed(res, 400, "無效的月份");
    }

    const currentYear = new Date().getFullYear();
    // 抓出這個月的第一天，還有這個月最後一天的最後一秒
    const startDate = new Date(currentYear, monthIndex, 1);
    const endDate = new Date(currentYear, monthIndex + 1, 0, 23, 59, 59, 999);

    // 第1步：算出「單堂均價」 (全部方案加總的錢 ÷ 全部加總的堂數)
    const packageRepo = AppDataSource.getRepository(CreditPackage);
    const allPackages = await packageRepo.find();

    let totalPrice = 0;
    let totalCredits = 0;
    for (const pkg of allPackages) {
      totalPrice += Number(pkg.price);
      totalCredits += Number(pkg.credit_amount);
    }

    // 防呆一下，萬一根本沒人買過方案，除以 0 會爆掉
    const perCreditPrice = totalCredits > 0 ? totalPrice / totalCredits : 0;

    // 第2步：找出這個教練在這個月裡，有幾筆成功 (沒被取消) 的報名紀錄
    const bookingRepo = AppDataSource.getRepository(CourseBooking);
    const { Between, IsNull } = require("typeorm");

    const bookings = await bookingRepo.find({
      where: {
        course: { user: { id: req.user.id } }, // 確認這堂課真的是這個教練開的
        created_at: Between(startDate, endDate),
        cancelled_at: IsNull(),
      },
      relations: { course: { user: true } },
    });

    const activeBookingCount = bookings.length;

    // 第3步：算薪水 (報名人數 × 單堂均價，記得要無條件捨去，不能算小數點)
    const revenue = Math.floor(activeBookingCount * perCreditPrice);

    return sendSuccess(res, 200, {
      total: {
        revenue,
        participants: activeBookingCount,
        course_count: activeBookingCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

</details>

---

## 5. 踩坑紀錄：GitHub Actions 找不到模組錯誤 (zod 殘留)

在完成所有實作並推送到 GitHub 後，我們在 GitHub Actions 的測試流程中遇到了一個常見的報錯：

```bash
Error: Cannot find module 'zod'
```

### 🔍 錯誤原因分析

這個錯誤發生的原因在於：

1. 雖然我們在本地端的程式碼中為了統一風格已經移除了對 `zod` 的引用，但可能在之前的 Commit 中不小心推送了含有 `require('zod')` 的舊版本。
2. 另一個常見原因是：**套件雖然在 `package.json` 被移除了，但深層依賴仍然卡在 `package-lock.json` 裡面**。

### 🛠️ 清理步驟

為了解決這個問題，我們必須確保專案處於最乾淨的狀態：

1. **確保程式碼乾淨**：使用編輯器的全局搜尋檢查專案下所有 `.js` 檔案，確保沒有任何 `require('zod')` 的蹤跡。
2. **重新安裝套件**：
   在終端機進入後端資料夾，執行安裝指令讓系統自動更新 lock 檔：
   ```bash
   cd backend
   npm install
   ```
   （執行後，npm 會自動比對並移除 `package-lock.json` 中不需要的套件）。
3. **提交並推送更新**：
   ```bash
   git add .
   git commit -m "chore: 徹底拔除 package-lock.json 中的 zod 殘留"
   git push
   ```

推送到 GitHub 後，Actions 就會使用這份最乾淨的 `package-lock.json` 重新安裝環境，先前的模組找不到錯誤也就迎刃而解了！

---
