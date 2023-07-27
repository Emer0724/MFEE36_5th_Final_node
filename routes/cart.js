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
       let keyword = req.query.keyword || '';  //關鍵字由於發時用get的 所以用query來抓字
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

 router.get('/test2',async(req,res)=>{
   let output = {
      totalMember:0,
      member:[],
   }
  const memsql = `SELECT * FROM member `;
    [member] = await db.query(memsql);
     output = {...output, member}; //取代輸出預設值 為正確數值
       return res.json(output);
})


router.post('/addToCart',async(req,res)=>{
  const ISBN = req.body.ISBN;
  const checksql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = 1`;
  const [checkresult] = await db.query(checksql,[ISBN])
   console.log("我是checkresult");
   console.log(checkresult);
  if(checkresult.length === 0){
    const createsql = `INSERT INTO cart (member_id,ISBN, count, createAt,updateAt) VALUES (1,?,1,?,?)`;
    const [result] = await db.query(createsql,[ISBN,currentDateTime,currentDateTime])
    return res.json(result)
  }else{
    const updatesql = `UPDATE cart SET count = ?, updateAt =? WHERE ISBN = ? AND member_id = 1`;
    const currentCount = checkresult[0].count;
    const newCount = currentCount + 1;
    const [updateResult] = await db.query(updatesql, [newCount,currentDateTime,ISBN]);
   return res.json(updateResult)
  }
})

router.get('/cart',async(req,res)=>{
  let output = {
     totalcart:0,
     cart:[],
  }
const cartsql = `SELECT book_info.pic,book_info.book_name,book_info.ISBN,book_info.price,cart.count FROM cart JOIN book_info ON cart.ISBN = book_info.ISBN`;
   [cart] = await db.query(cartsql);
    output = {...output, cart}; //取代輸出預設值 為正確數值
      return res.json(output);
})

router.post('/cart/plus',async(req,res)=>{
    const ISBN = req.body.ISBN;
    const plussql = `UPDATE cart SET count = count + 1, updateAt = ? WHERE ISBN = ? AND member_id = 1`;
    const [updateResult] = await db.query(plussql, [currentDateTime,ISBN]);
    const updatedCount = updateResult.affectedRows === 1 ? updateResult.changedRows : 0;
    return res.json({ updatedCount });
})

router.post('/cart/cut', async (req, res) => {
  const ISBN = req.body.ISBN;
  const cutsql = `UPDATE cart SET count = count - 1, updateAt = ? WHERE ISBN = ? AND member_id = 1`;
  const [updateResult] = await db.query(cutsql, [currentDateTime, ISBN]);

  if (updateResult.affectedRows === 1 && updateResult.changedRows === 1) {
    const checkSql = `SELECT count FROM cart WHERE ISBN = ? AND member_id = 1`;
    const [checkResult] = await db.query(checkSql, [ISBN]);
    const updatedCount = checkResult[0].count;

    if (updatedCount < 1) {
      const deleteSql = `DELETE FROM cart WHERE ISBN = ? AND member_id = 1`;
      await db.query(deleteSql, [ISBN]);
      return res.json({ message: 'Item deleted from cart.' });
    }
    return res.json({ message: 'Item quantity updated.' });
  }

  return res.status(400).json({ error: 'Failed to update cart.' });
});


router.post('/cart/delete',async(req,res)=>{
  const ISBN = req.body.ISBN;
  const deletesql = `DELETE FROM cart WHERE ISBN = ? AND member_id = 1`;
  await db.query(deletesql, [ISBN]);
  return res.json({ message: 'Item deleted from cart.' });
})

module.exports = router;


