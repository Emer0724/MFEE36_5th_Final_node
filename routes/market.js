const dayjs = require("dayjs"); //時間格式
const express = require("express"); //express引入
const { now } = require("moment"); //時間格式-有時區
const db = require(__dirname + "/../modules/mysql2"); //__dirname 表當前執行檔案位置  用途:當前執行檔案連結資料庫
const router = express.Router(); //express內建route功能 [get、post、put、delete]
const upload = require(__dirname + "/../modules/img-upload"); //引導到圖片上傳的檔案
const multipartParser = upload.none();
const moment = require("moment-timezone");
//寫入 時間用 currentDateTime
const date = new Date();

const currentDateTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
//token驗證
// if(! res.locals.jwtData){
//    output.error = '沒有 token 驗證'
//    return res.json(output);
//  }else{
//    output.jwtData=res.locals.jwtData
//  }


//主頁展示-亂數
router.get("/display_random", async (req, res) => {
  try {
    console.log('隨機囉')
    // 執行 SQL 查詢，使用 ORDER BY RAND() 取得隨機資料
    const [rows] = await db.query(`SELECT * FROM book_info ORDER BY RAND() LIMIT 16`);


    console.log(`rows: ${rows}`);

    // 回傳 JSON 格式的資料作為 API 響應
    return res.json({ rows });
  } catch (error) {
    // 處理錯誤並回傳錯誤訊息
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});
//主頁展示
router.get("/display", async (req, res) => {
  const category_id = req.query.category_id; // 從 URL 取得前端送過來的 category ID / label
  const label = req.query.label;
  console.log(category_id)
  console.log(label)
  try {
    const sql = `select * from book_info where category_id=? `;
    const [rows] = await db.query(sql, category_id); //將要求送往資料庫
    const totalRows = rows.length; // 取得資料總數
    //TO DO 有空可做category_id=1 設為亂數呈現
    if (!rows[0]) {
      //檢查rows[]陣列第一項是否為空 若為null / undefined 經 "!"後會為ture
      return res.status(404).json({ error: "無該分類資料" });
    } else {
      const totalPages = Math.ceil(totalRows / 16); //.ceil 無條件進位
      let page = req.query.page ? parseInt(req.query.page) : 1;
      if (page > totalPages) {
        const lastPage = totalPages;
        return res.redirect(`${req.baseUrl}?page=${lastPage}`);
      }
      console.log(totalPages);
      return res.json({ rows, totalRows, category_id, label, totalPages });
    }
  } catch (error) {
    console.error("查詢資料庫發生錯誤", error);
    res.status(500).json({ error: "查詢資料庫發生錯誤" });
  }
});

//詳細頁資料
router.get("/detail", async (req, res) => {
  const ISBN = req.query.ISBN; // 從 URL 取得前端送過來的 category ID
  try {
    const sql = `select * from book_info where ISBN=? `;
    const [rows] = await db.query(sql, ISBN);
    return res.json({ rows });
    // res.json({ rows, totalRows })
  } catch (error) {
    console.error("查詢資料庫發生錯誤", error);
    res.status(500).json({ error: "查詢資料庫發生錯誤" });
  }
});
//麵包屑取值
router.get("/bcs", async (req, res) => {
  const category_id = req.query.category_id; // 從 URL 取得前端送過來的 category ID
  try {
    const sql = `select * from category where category_id=? `;
    const [rows] = await db.query(sql, category_id);
    return res.json({ rows });
  } catch (error) {
    console.error("查詢資料庫發生錯誤", error);
    res.status(500).json({ error: "查詢資料庫發生錯誤" });
  }
});

//收藏功能
router.post("/recommand", async (req, res) => {
  const { member_id, ISBN } = req.body;
  console.log(member_id);
  try {
    const [rows] = await db.query(
      `SELECT * FROM recommand WHERE ISBN='${ISBN}' AND member_id=${member_id};`
    );

    if (rows.length === 0) {
      await db.query(
        `INSERT INTO recommand (ISBN, member_id, created_date, updated) VALUES (?, ?, ?, ?)`,
        [ISBN, member_id, currentDateTime, currentDateTime]
      ); //若無這筆 就新增
    } else {
    }


    return res.json({ rows })
  } catch (error) {
    console.error('查詢資料庫發生錯誤', error);
    res.status(500).json({ error: '查詢資料庫發生錯誤' });
  }
})
//收藏功能--刪除
router.delete("/recommand", async (req, res) => {
  const { member_id, ISBN } = req.body;
  try {
    await db.query(
      `DELETE FROM recommand WHERE ISBN=${ISBN} AND member_id=${member_id}`
    );
    return res.json({ message: "刪除成功" });
  } catch {
    console.error("刪除資料庫發生錯誤", error);
    res.status(500).json({ error: "刪除資料庫發生錯誤" });
  }
});
//加入購物車
router.post("/addToCart", async (req, res) => {
  const { member_id, ISBN } = req.body; // 從請求中取得 member_id 和 ISBN
  console.log(member_id);
  console.log(ISBN);
  const checksql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = ? AND status_id is null	`;
  const [checkresult] = await db.query(checksql, [ISBN, member_id]);
  if (checkresult.length === 0) {
    const createsql = `INSERT INTO cart (member_id, ISBN,status_id, count, createAt, updateAt) VALUES (?, ?,?, 1, ?, ?)`;
    const [result] = await db.query(createsql, [
      member_id,
      ISBN,
      null,
      currentDateTime,
      currentDateTime,
    ]);
    res.json(result);
  } else {
    const updatesql = `UPDATE cart SET count = ?, updateAt = ? WHERE ISBN = ? AND member_id = ?  AND status_id is null`;
    const currentCount = checkresult[0].count;
    const newCount = currentCount + 1;
    const [updateResult] = await db.query(updatesql, [
      newCount,
      currentDateTime,
      ISBN,
      member_id,
    ]);
    res.json(updateResult);
  }
});

//加入購物車 (二手)
router.post("/addToCartUsed", async (req, res) => {
  const { member_id, ISBN, status_id } = req.body; // 從請求中取得 member_id 和 ISBN
  console.log(member_id);
  console.log(ISBN);
  console.log(status_id);
  const checksql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = ? AND status_id = ?`;
  const [checkresult] = await db.query(checksql, [ISBN, member_id, status_id]);
  if (checkresult.length === 0) {
    const createsql = `INSERT INTO cart (member_id, ISBN, status_id, count, createAt, updateAt) VALUES (?, ?, ?,1, ?, ?)`;
    const [result] = await db.query(createsql, [
      member_id,
      ISBN,
      status_id,
      currentDateTime,
      currentDateTime,
    ]);
    res.json(result);
  } else {
    const updatesql = `UPDATE cart SET count = ?, updateAt = ? WHERE ISBN = ? AND member_id = ? AND status_id = ?`;
    const currentCount = checkresult[0].count;
    const newCount = currentCount + 1;
    const [updateResult] = await db.query(updatesql, [
      newCount,
      currentDateTime,
      ISBN,
      member_id,
      status_id,
    ]);
    res.json(updateResult);
  }
});

//usedList
router.get("/usedList", async (req, res) => {
  const ISBN = req.query.ISBN; // 從 URL 取得前端送過來的 category ID
  try {
    const sql = `select * from used where ISBN=? `;
    const [rows] = await db.query(sql, [ISBN]);
    return res.json([rows]);
  } catch (error) {
    console.error("查詢資料庫發生錯誤", error);
    res.status(500).json({ error: "查詢資料庫發生錯誤" });
  }
});

//wishList

router.get("/wishlist", async (req, res) => {
  const member_id = req.query.member_id;
  console.log(member_id)
  try {
    const sql = `select * from recommand where member_id=? `
    const [rows] = await db.query(sql, [member_id])
    return res.json([rows])
  } catch (error) {
    console.error('查詢資料庫發生錯誤', error);
    res.status(500).json({ error: '查詢資料庫發生錯誤' });
  }
});
//wishList-刪除
router.delete("/removewish", async (req, res) => {
  const { ISBN, member_id } = req.body
  console.log(123)
  console.log(ISBN)
  console.log(member_id)
  try {
    await db.query(`DELETE FROM recommand WHERE ISBN=${ISBN} AND member_id=${member_id}`);
    return res.json({ message: "刪除成功" });
  } catch (error) {
    console.error('刪除資料庫發生錯誤', error);
    res.status(500).json({ error: '刪除資料庫發生錯誤' });
  }
})

// router.get("/wishlist", async (req, res) => {
//    const member_id = req.query.member_id;
//    console.log(member_id)
//    try {
//       const sql = `select * from recommand where member_id=? `
//       const [rows] = await db.query(sql, [member_id])
//       const totalRows = rows.length;
//       const totalPages = Math.ceil(totalRows / 16);
//       console.log('胖老爹')
//       console.log(rows)
//       console.log(totalPages)
//       console.log(totalRows)
//       return res.json({ rows, totalRows, totalPages })
//    } catch (error) {
//       console.error('查詢資料庫發生錯誤', error);
//       res.status(500).json({ error: '查詢資料庫發生錯誤' });
//    }
// });
//wishList-刪除
router.delete("/removewish", async (req, res) => {
  const { ISBN, member_id } = req.body;
  console.log(123);
  console.log(ISBN);
  console.log(member_id);
  try {
    await db.query(
      `DELETE FROM recommand WHERE ISBN=${ISBN} AND member_id=${member_id}`
    );
    return res.json({ message: "刪除成功" });
  } catch (error) {
    console.error("刪除資料庫發生錯誤", error);
    res.status(500).json({ error: "刪除資料庫發生錯誤" });
  }
});
//coupon
router.get("/coupon", async (req, res) => {
  const member_id = req.query.member_id;
  try {
    const sql1 = `select coupon_id,use_status,coupon_mid,coupon_name,coupon_discount,end_time from member_coupon JOIN coupon using(coupon_id) where member_id=?AND use_status IS null`; //查詢未使用的優惠券資料
    const sql2 = `select coupon_id,use_status,coupon_mid,coupon_name,coupon_discount,end_time from member_coupon JOIN coupon using(coupon_id) where member_id=?AND use_status IS NOT null`;//查詢已使用的優惠券資料
    const [rows1] = await db.query(sql1, member_id);
    const [rows2] = await db.query(sql2, member_id);
    console.log([rows1, rows2]);
    return res.json([rows1, rows2]);
  } catch (error) {
    console.error("查詢資料庫發生錯誤", error);
    res.status(500).json({ error: "查詢資料庫發生錯誤" });
  }
});

//優惠碼
router.post('/getCoupon', async (req, res) => {
  const { code, member_id } = req.body; // 從請求中取得 member_id 和 code
  // console.log(code)
  // console.log(member_id)
  // console.log('有連到，改寫後端')

  const sql1 = `SELECT coupon_id FROM coupon WHERE code = ?`;
  const [rows1] = await db.query(sql1, code);

  if (rows1.length > 0) {
    const couponId = rows1[0].coupon_id;
    console.log("取得 coupon_id:", couponId);

    // 檢查優惠券是否已經被該會員新增過
    const sqlCheck = `SELECT * FROM member_coupon WHERE member_id = ? AND coupon_id = ?`;
    const [existingRows] = await db.query(sqlCheck, [member_id, couponId]);

    if (existingRows.length > 0) {
      console.log('該會員已經新增過此優惠券');
      res.status(400).json({ error: '該優惠券已經新增過' });
      return;
    }

    // 新增資料到 member_coupon
    const sql2 = `INSERT INTO member_coupon (member_id, coupon_id) VALUES (?, ?)`;
    const values = [member_id, couponId];

    try {
      await db.query(sql2, values);
      console.log("成功新增資料到 member_coupon");
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("新增資料到 member_coupon 時發生錯誤:", error);
      res.status(500).json({ error: "新增資料時發生錯誤" });
    }
  } else {
    console.log("找不到符合的優惠券");
    res.status(404).json({ error: "找不到符合的優惠券" }); // 報錯訊息
  }
});

//錯誤頁面
router.get("/error", (req, res) => {
  db.query("SELECT * FROM book_info", (err, results) => {
    if (err) {
      console.error("資料庫查詢錯誤:", err.message);
      return res.status(500).json({ error: "資料庫查詢錯誤" });
    }
    return res.json(results);
  });
});
module.exports = router;
