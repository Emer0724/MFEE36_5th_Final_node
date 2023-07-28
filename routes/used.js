const dayjs = require("dayjs"); //時間格式
const express = require("express");
const { now } = require("moment"); //時間格式-有時區
const { query } = require("../modules/mysql2");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const moment = require("moment-timezone");
//寫入 時間用 currentDateTime
const date = new Date();
const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
const jwt = require("jsonwebtoken");
//token驗證
// if(! res.locals.jwtData){
//    output.error = '沒有 token 驗證'
//    return res.json(output);
//  }else{
//    output.jwtData=res.locals.jwtData
//  }

router.get("/display", (req, res) => {
  return res.send("二手書喔喔喔");
});
router.get("/trydb", async (req, res) => {
  const [rows] = await db.query("select * from book_info");
  return res.json([rows]);
});
router.post("/trypost", multipartParser, async (req, res) => {
  const sql = "INSERT INTO `likes`(`client_id`, `ISBN`, `date`) VALUES (?,?,?)";
  const data = { ...req.body };
  // const date= new Date
  // const currentDateTime =moment().format('YYYY-MM-DD HH:mm:ss');
  const [result] = await db.query(sql, [
    data.client_id,
    data.ISBN,
    currentDateTime,
  ]);
  return res.json({ result, data });
});
//二手書上架書本資訊
router.get("/display/book_info", async (req, res) => {
  const ISBN = req.query.ISBN;
  const sql =
    "select ISBN,book_name,pic,publish,author from book_info where ISBN=?";
  const [rows] = await db.query(sql, ISBN);
  return res.json(rows);
});

//假token 過度用
router.post("/login", async (req, res) => {
  const output = {
    success: false,
    code: 402,
    error: "",
  };

  const sql = "select * from member where member_id=?";
  const [rows] = await db.query(sql, [req.body.member_id]);
  if (!rows.length) {
    output.code = 402;
    output.error = "無此member_id";
    return res.json(output);
  }

  output.success = true;
  // 包 jwt 傳給前端

  const token = jwt.sign(
    {
      member_id: rows[0].member_id,
      email: rows[0].email,
    },
    process.env.JWT_SECRET
  );
  output.data = {
    member_id: rows[0].member_id,
    email: rows[0].email,
    name: rows[0].name,
    nickname: rows[0].nickname,
    mem_avatar: rows[0].mem_avatar,
    token,
  };
  res.json(output);
});

//used-disply-get會員資料
router.get("/display/member/", async (req, res) => {
  output = { error: "" };
  console.log(res.locals.jwtData);
  if (!res.locals.jwtData) {
    output.error = "沒有 token 驗證";
    return res.json(output);
  } else {
    member_id = res.locals.jwtData.member_id;
    // console.log(res.locals.jwtData)
    const sql =
      "select member_id,name,mobile,email,city,district,address,full_address from member where member_id=?";
    const [rows] = await db.query(sql, member_id);
    return res.json(rows);
  }
  // const member_id = req.params.member_id;
});
//used-disply-post 寫入上架資料並回傳
router.post("/display/up-post", async (req, res) => {
  const data = { ...req.body };
  const used_state = "2";
  const sql =
    "INSERT INTO `used`( `ISBN`, `member_id`, `used_state`, `create_date`, `updated`) VALUES (?,?,?,?,?)";
  const [result] = await db.query(sql, [
    data.ISBN,
    data.member_id,
    used_state,
    currentDateTime,
    currentDateTime,
  ]);
  if (result.insertId) {
    const sql2 = `SELECT used_id,ISBN,book_name,member_id,name,mobile,email,city,district,address,full_address FROM used left JOIN book_info using(ISBN) LEFT JOIN member using(member_id) where used_id=?`;
    const [new_result] = await db.query(sql2, result.insertId);

    return res.json([result, new_result]);
  }
});
//刪除資料
router.patch("/display/delete_item/:used_id", async (req, res) => {
  const sql = "UPDATE `used` SET `deleted`=?,`updated`=? WHERE used_id=? ";
  const used_id = req.params.used_id;

  const deleted = "Y";
  const [result] = await db.query(sql, [deleted, currentDateTime, used_id]);
  return res.json(result);
});
//二手書進度
router.get("/change/item/", async (req, res) => {
  if (!res.locals.jwtData) {
    output.error = "沒有 token 驗證";
    return res.json(output);
  } else {
    //  output.jwtData=res.locals.jwtData
    let output = {
      redirect: "",
      totalRows: 0,
      perPage: 25,
      totalPages: 0,
      page: 1,
      rows: [],
      error: "",
    };
    const perPage = 25;
    const member_id = res.locals.jwtData.member_id;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let state = "";
    if (!req.query.book_state || req.query.book_state === "all") {
      state = "";
    } else if (req.query.book_state === "3") {
      state = `and used_state in (3,5)`;
    } else {
      state = ` and used_state=${req.query.book_state}`;
    }
    if (!page || page < 1) {
      output.redirect = req.baseUrl;
      return output;
    }
    const totalPages_sql = `select count(used_id) AS total,book_name,ISBN,used_state,status_name,a.price from used as a left join book_info using(ISBN) left join book_status using(status_id) where a.deleted is null and member_id=${member_id} ${state} order by used_state
     `;

    const [totalRows] = await db.query(totalPages_sql);

    if (totalRows[0].total === 0) {
      output.error = "no_data";
      return res.json(output);
    } else {
      const totalPages = Math.ceil(totalRows[0].total / perPage);
      const sql = `select used_id,book_name,ISBN,used_state,status_name,a.price from used as a left join book_info using(ISBN) left join book_status using(status_id) where a.deleted is null and member_id=${member_id} ${state} order by used_state,a.updated desc limit ${
        perPage * (page - 1)
      }, ${perPage} `;
      const [rows] = await db.query(sql);

      if (page > totalPages) {
        output.redirect = req.baseUrl;
        return output;
      }
      output = { ...output, perPage, totalPages, page, rows };
      return res.json(output);
    }
  }
});
//get book
router.get("/book_edit/:used_id", async (req, res) => {
  output = { error: "" };
  console.log(res.locals.jwtData);
  if (!res.locals.jwtData) {
    output.error = "沒有 token 驗證";
    return res.json(output);
  } else {
    member_id = res.locals.jwtData.member_id;
    const used_id = req.params.used_id;
    // console.log(used_id);
    const sql = `select a.used_id,a.ISBN,b.book_name,a.used_state,a.price,b.pic,c.status_name,a.updated,a.book_note,a.return_book from used as a left join book_info as b using(ISBN)  left join book_status as c using(status_id)  where used_id=? and member_id=? and a.deleted is null `;
    const [rows] = await db.query(sql, [used_id, member_id]);
    if (!rows[0]) {
      output.error = "沒有資料";
      return res.json(output);
    }
    const updated = moment(rows[0].updated).format("YYYY-MM-DD HH:mm:ss");
    // console.log(updated)
    const newRows = { ...rows[0], updated };
    console.log(newRows);
    return res.json(newRows);
  }
});
//放棄兌換
router.patch("/display/give_up_exchange/:used_id", async (req, res) => {
  const sql =
    "UPDATE `used` SET `used_state`=?,`updated`=?,return_book=? WHERE used_id=? ";
  const used_id = req.params.used_id;

  const used_state = "5";
  const return_book = "1";
  const [result] = await db.query(sql, [
    used_state,
    currentDateTime,
    return_book,
    used_id,
  ]);
  return res.json(result);
});

// 知音幣交易
router.patch("/used_book/exchange/:used_id", async (req, res) => {
  output = { error: "" };

  console.log(res.locals.jwtData);
  if (!res.locals.jwtData) {
    output.error = "沒有 token 驗證";
    return res.json(output);
  } else {
    const member_id = res.locals.jwtData.member_id;
    const used_id = req.params.used_id;

    const sql_member = ` select token from member where member_id=${member_id}`;
    let [token] = await db.query(sql_member);
    // console.log({ ...token[0] });

    token = { ...token[0] };
    // console.log(token)
    if (!token.token) {
      token = 0;
    } else {
      token = token.token;
    }
    console.log(token);

    const sql_used = `select price from used where used_id=? and member_id=? `;
    let [price] = await db.query(sql_used, [used_id, member_id]);
    // console.log(price)
    price = { ...price[0] }.price;
    console.log(price);

    const used_state = 4;
    const sql_used_update = `UPDATE used SET used_state =?,updated=? where used_id=? and member_id=?`;
    const [result_used] = await db.query(sql_used_update, [
      used_state,
      currentDateTime,
      used_id,
      member_id,
    ]);

    if (result_used.changedRows === 1) {
      let newToken = Number(token) + price;
      const sql_member_update = `UPDATE member SET token =?,updated=? where  member_id=?`;
      const [result_member] = await db.query(sql_member_update, [
        newToken,
        currentDateTime,
        member_id,
      ]);
      return res.json([result_used, result_member]);
    }
  }
});

//取書的銷量排行 sql=`select sort,ISBN,book_name,author,pic from book_info left join (SELECT SUM(count) AS sort ,ISBN FROM `order_detail` GROUP by ISBN ) as order_isbn using(ISBN) order by sort DESC limit 50`
//取分類的排行 sql=`select category_sort.cate_sum,a.category_id,a.category_name as sec_category,b.category_name as ft_category from (select SUM(sort) as cate_sum,category_id from book_info left join (SELECT SUM(count) AS sort ,ISBN FROM `order_detail` GROUP by ISBN ) as order_isbn using(ISBN) GROUP by category_id) as  category_sort LEFT JOIN category as a using (category_id) left join category as b on a.category_parentID=b.category_id ORDER by category_sort.cate_sum DESC`

router.get("/index/book_info/", async (req, res) => {
  const sql_info = `select sort,ISBN,book_name,author,pic from book_info left join (SELECT SUM(count) AS sort ,ISBN FROM order_detail GROUP by ISBN ) as order_isbn using(ISBN) order by sort DESC limit 40`;
  const [result_info] = await db.query(sql_info);
  const result_info_sort = result_info.map((v, i) => {
    v.sort_num = i + 1;
    v.state = "book_info";
    return v;
  });
  const sql_category = `select category_sort.cate_sum,a.category_id,a.category_name as sec_category,b.category_name as ft_category from (select SUM(sort) as cate_sum,category_id from book_info left join (SELECT SUM(count) AS sort ,ISBN FROM order_detail GROUP by ISBN ) as order_isbn using(ISBN) GROUP by category_id) as  category_sort LEFT JOIN category as a using (category_id) left join category as b on a.category_parentID=b.category_id ORDER by category_sort.cate_sum DESC limit 20`;
  const [result_category] = await db.query(sql_category);
  const result_category_sort = result_category.map((v, i) => {
    v.sort_num = i + 1;
    v.state = "category";
    return v;
  });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  //合併 result_info_sort and result_category_sort
  const combinedArray = result_info_sort.concat(result_category_sort);
  //打亂
  // shuffleArray(combinedArray);
  combinedArray.sort(() => Math.random() - 0.5);

  return res.json(combinedArray);
});

router.get("/getUsedinfo", async (req, res) => {
  output = { error: "" };
  console.log(res.locals.jwtData);
  if (!res.locals.jwtData) {
    output.error = "沒有 token 驗證";
    return res.json(output);
  } else {
    member_id = res.locals.jwtData.member_id;

    const sql = `select used_id,ISBN,book_name from used left join book_info using(ISBN) where member_id=? and used_state=2 and deleted is  null`;
    const [rows] = await db.query(sql, member_id);
    return res.json(rows);
  }
});

module.exports = router;
