const dayjs = require('dayjs')//時間格式
const express=require('express');
const { now } = require('moment');//時間格式-有時區
const db=require(__dirname+'/../modules/mysql2')
const router=express.Router()
const upload = require(__dirname + '/../modules/img-upload');
const multipartParser = upload.none();
const moment = require('moment-timezone');
//寫入 時間用 currentDateTime
const date= new Date
const currentDateTime =moment().format('YYYY-MM-DD HH:mm:ss');
//token驗證
// if(! res.locals.jwtData){
//    output.error = '沒有 token 驗證'
//    return res.json(output);
//  }else{
//    output.jwtData=res.locals.jwtData
//  }

//1.商品加入購物車
//2.按鈕控制 數量 價格計算 酷碰使用的折數 知音幣折抵 
//3.從 ISBN 和used_id join進入書的圖片 書名 ISBN 價格 數量 總價 進入購物車存放
//4.紀錄input輸入的資料 寄件人資訊 跟 付款寄送方式  還有會員會自動導入個人資訊 外加運費填入
//5.總金額結算
//6.連接 綠界 linepay 付款的api
//7.結帳完成 產生流水號 刪除購物車 加入至order資料表
//8.訂單記錄 join進order_detail 的 isbn 找出書的紀錄

router.get('/test1',async (req, res)=>{
   //設定輸出的預設值
     let output = {
         redirect: '', //導向何處
         totalRows:0,  //總共幾筆
         perPage: 25,  //每次顯示幾項
         totalPages: 0, //總共幾頁
         page: 1,  //第幾頁
         rows: [] //資訊都在裡面
       }
 
       const perPage = 10;//設定每次顯示幾項
       let keyword = req.query.keyword || '';  //關鍵字由於發送方式是用get的 所以用query來抓字
       let page = req.query.page ? parseInt(req.query.page) : 1; //輸入第幾頁時會到第幾頁 預設是第一頁
       if(!page || page<1) {
         output.redirect = req.baseUrl; //
         return res.json(output);
       };
        let where = ' WHERE 1 ';
        if(keyword) {
          const kw_escaped = db.escape('%'+keyword+'%'); 
          where += ` AND ( 
           \`book_name\` LIKE ${kw_escaped} 
           OR
            \`description\` LIKE ${kw_escaped}
            )
          `;
        }
       const t_sql = `SELECT COUNT(1) totalRows FROM book_info ${where}`;   
       const [[{totalRows}]] = await db.query(t_sql);
       let totalPages = 0; //先宣告頁數 預設值 數字歸０
       let rows = [];  //宣告內容物 預設值 空陣列
       if(totalRows){
         totalPages = Math.ceil(totalRows/perPage); //總頁面數量 ＝ 總筆數/一頁出現筆數
         if(page > totalPages) {
           output.redirect = req.baseUrl + '?page=' + totalPages;
           return res.json(output);
         };
         const sql = ` SELECT * FROM book_info ${where} LIMIT ${perPage*(page-1)}, ${perPage}`;
         [rows] = await db.query(sql);
       }
       output = {...output, totalRows, perPage, totalPages, page, rows}; //取代輸出預設值 為正確數值
       return res.json(output);
 });

 router.post('/addToCart',async(req,res)=>{
  const ISBN = req.body.ISBN;
  const member =req.body.member;
  const checksql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = ?`;
  const [checkresult] = await db.query(checksql,[ISBN,member])
  if(checkresult.length === 0){
    const createsql = `INSERT INTO cart (member_id,ISBN,count,createAt,updateAt) VALUES (?,?,1,?,?)`;
    const [result] = await db.query(createsql,[member,ISBN,currentDateTime,currentDateTime])
     res.json(result)
  }else{
    const updatesql = `UPDATE cart SET count = ?, updateAt =? WHERE ISBN = ? AND member_id = ?`;
    const currentCount = checkresult[0].count;
    const newCount = currentCount + 1;
    const [updateResult] = await db.query(updatesql, [newCount,currentDateTime,ISBN,member]);
    res.json(updateResult)
  }
})
router.get('/count',async(req,res)=>{
  const member = req.query.member
  const countsql = `SELECT count FROM cart WHERE member_id=?`
  const [result] = await db.query(countsql,[member])
  console.log(result);
  res.json(result);
})

router.get('/cart',async(req,res)=>{
  const member = req.query.member;
  const cartsql = `SELECT 
  cart.member_id,
  book_info.pic,
  book_info.book_name,
  book_info.ISBN,
  book_info.price,
  cart.count,
  cart.used_id
  FROM cart 
  JOIN book_info 
  ON cart.ISBN = book_info.ISBN
  WHERE cart.member_id = ?`;
  const [result] = await db.query(cartsql, [member]);
  res.send(result);
})

router.put('/cart/plus',async(req,res)=>{
    const ISBN = req.body.ISBN;
    const member = req.body.member;
    const plussql = `UPDATE cart SET count = count + 1, updateAt = ? WHERE ISBN = ? AND member_id = ?`;
    const [updateResult] = await db.query(plussql, [currentDateTime,ISBN,member]);
    if (updateResult.affectedRows === 1 && updateResult.changedRows === 1) {
      const cartQuantitySql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = ?`;
      const [selectedItem] = await db.query(cartQuantitySql, [ISBN, member]);
      const updatedCount = selectedItem[0]?.count || 0;
      res.json({ updatedCount });
    } else {
      res.status(500).json({ error: "抓取失敗" });
    }
  });

  router.put('/cart/cut', async (req, res) => {
    const ISBN = req.body.ISBN;
    const member = req.body.member;
    const cutsql = `UPDATE cart SET count = count - 1, updateAt = ? WHERE ISBN = ? AND member_id = ?`;
    const [updateResult] = await db.query(cutsql, [currentDateTime, ISBN, member]);
  
    if (updateResult.affectedRows === 1 && updateResult.changedRows === 1) {
      const checkSql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = ?`;
      const [checkResult] = await db.query(checkSql, [ISBN, member]);
      const updatedCount = checkResult[0].count;
      if (updatedCount > 0) {
        res.json({ message: '商品已減少.' });
      }else {
        const deleteSql = `DELETE FROM cart WHERE ISBN = ? AND member_id = ?`;
        await db.query(deleteSql, [ISBN, member]);
        res.json({ message: '商品已刪除' });
      }
    } else {
      res.status(400).json({ error: '更新失敗' });
    }
  });


router.post('/cart/delete',async(req,res)=>{
  const ISBN = req.body.ISBN;
  const member = req.body.member;
  const deletesql = `DELETE FROM cart WHERE ISBN = ? AND member_id = ?`;
  await db.query(deletesql, [ISBN,member]);
  res.json({ message: 'Item deleted from cart.' });
})

router.get('/cart/coupon', async (req, res) => {
  const member = req.query.member; // 获取查询参数 member 的值
  const checksql = `
    SELECT
      member_coupon.coupon_mid,
      member_coupon.coupon_id,
      coupon.coupon_name,
      coupon.coupon_discount
      FROM
      member_coupon
      JOIN
      coupon
      ON
      coupon.coupon_id=member_coupon.coupon_id
      WHERE
      member_coupon.member_id= ?
      AND
      member_coupon.use_status is null`;
  const [result] = await db.query(checksql, [member]);
  res.send(result);
});

router.get('/cart/usetoken', async (req, res) => {
  const member = req.query.member; // 获取查询参数 member 的值
  const checksql = `SELECT token FROM member WHERE member_id=?`;
  const [result] = await db.query(checksql, [member]);
  res.send(result);
});


router.get("/cart/recommand",async(req,res)=>{
  const member = req.query.member;
  console.log(member);
  const checksql = `SELECT book_info.ISBN,book_info.pic,book_info.book_name FROM recommand JOIN book_info ON recommand.ISBN=book_info.ISBN WHERE recommand.member_id=?`;
  const [result] = await db.query(checksql,[member])
  res.json(result)
})

router.get('/cartmember', async (req, res) => {
  const member = req.query.member;
  const checksql = `SELECT name,mobile,city,district,address from member where member_id=?`
  const [result] = await db.query(checksql, [member]); // 使用 await 等待資料庫查詢完成
  res.json(result); // 回傳 JSON 格式的資料
});


router.post('/cart/complete',async(req,res)=>{
  const data = req.body;
  const countdata = data.countData;
  const pricefinal = data.pricefinal;//already price
  const formdata = data.formData;
  const member =data.member1;

  let ship, shipcost;
  if (formdata.shippingMethod === "宅配到家+100") {
    ship = 1;
    shipcost = 1;
  } else {
    ship = 2;
    shipcost = 2;
  }

  let payment;
  if (formdata.paymentMethod === "linepay") {
    payment = 2;
  } else {
    payment = 1;
  }

  let coupon;
  if(countdata.selectcoupon===1){
    coupon = 0
  }else{
    coupon = countdata.selectcoupon
  }
  const useCouponValue = parseFloat(countdata.selectcoupon);
  //處理表單進order1 order_id流水馬
  function generateRandomNumber() {
    const characters = '0123456789';
    let code = '';
    while (code.length < 8) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      const randomCharacter = characters.charAt(randomIndex);
  
      if (code.indexOf(randomCharacter) === -1) {
        code += randomCharacter;
      }
    }
    return code;
  }
  const randomNumber = generateRandomNumber();
  const createsql = 
  `INSERT INTO order_1
  (order_id,member_id,customer_name,customer_phone,customer_address,shipping,shipping_cost,choosestore,total_price,payment,status,createAt,updateAt,use_token,use_coupon)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  const [formresult] = await 
  db.query(createsql,[randomNumber,member,formdata.recipientName,formdata.recipientPhone,formdata.recipientAddress,ship,shipcost,formdata.recipientstore,pricefinal,payment,1,currentDateTime,currentDateTime,countdata.selectedCurrencyOption,coupon])
  res.send({ order_id: randomNumber, result: formresult });
  //如果會員使用知音幣,會員幣要清除

  if(countdata.selectedCurrencyOption>0){
    const cleansql = `UPDATE member SET token = ? WHERE member_id = ?`
    await db.query(cleansql,[0,member])
  }
  //如果會員已使用折價卷 要從null改成顯示y
  console.log(countdata.selectcouponid);
  if(countdata.selectcouponid>0){
    const used = "y"
    const changestatesql = `UPDATE member_coupon SET 	use_status = ? WHERE member_id =? AND coupon_id = ? AND coupon_mid = ?`
    await db.query(changestatesql,[used,member,countdata.selectcouponid,countdata.selectcouponmid])
  }
  //處理cart 進 order_detail
  const createordersql = 
  `INSERT INTO order_detail (ISBN, used_id, order_id, count, subtotal, createAt, updateAt)
  SELECT 
  cart.ISBN,
  cart.used_id, 
  order_1.order_id,
  cart.count, 
  cart.count * book_info.price, 
  ?,
  ?
  FROM cart
  JOIN order_1 ON cart.member_id = order_1.member_id
  JOIN book_info ON cart.ISBN = book_info.ISBN;`
  await db.query(createordersql,[currentDateTime,currentDateTime])
  //處理二手書 進入訂單資料表後 要將賣出狀況改成y
  const updateused = `UPDATE used SET sale =? WHERE used_id IN (SELECT used_id FROM order_detail);`
  await db.query(updateused,['y'])
  //完成後清空
  const clearCartSQL = `DELETE FROM cart WHERE member_id = ?;`;
  await db.query(clearCartSQL,[member]);

  
})
// member_id,customer_name,customer_phone,customer_address,shipping,shipping_cost,choosestore,total_price,payment,status,createAt,updateAt,use_token,use_coupon
router.get('/order',async(req,res)=>{
  const member =req.query.member;
  const showitemsql = `
  SELECT 
  order_id,
  customer_name,
  customer_phone,
  shipping_cost,
  total_price,
  status,
  createAt,
  use_token,
  use_coupon
  FROM
  order_1
  WHERE
  member_id =?;
  `;
  //付款方式 物流方式 運費 狀態 要前端換算
  //門市寄貨跟宅配擇一的判斷
 const [result] = await db.query(showitemsql,[member])
 res.send(result);
})

router.post('/orderdetail',async(req,res)=>{
  const data = req.body;
  const showitemsql = `
  SELECT 
  order_1.customer_name,
  order_1.customer_phone,
  order_1.customer_address,
  order_1.shipping,
  order_1.shipping_cost,
  order_1.choosestore,
  order_1.createAt,
  order_detail.ISBN,
  order_detail.used_id,
  order_detail.count,
  order_detail.subtotal,
  book_info.price,
  book_info.pic,
  book_info.book_name
  FROM
  order_detail
  JOIN
  order_1
  ON
  order_detail.order_id  = order_1.order_id
  JOIN
  book_info
  ON
  order_detail.ISBN = book_info.ISBN
  WHERE
  order_detail.order_id = ?;
 `
 const [result] = await db.query(showitemsql,[data.orderid])
 res.send(result)
})


module.exports = router;