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

 router.post('/addToCart', (req, res) => {
  const ISBN = req.body.ISBN;
  // 先查詢購物車中是否已經有該商品
  db.query(`SELECT * FROM cart WHERE ISBN = ? AND member_id = 1`, [ISBN], (error, results) => {
    console.log(results);
    if (error) {
      console.error('錯誤查詢訊息:', error);
      return res.status(500).json({ error: '購物車查詢失敗' });
    }
    else if (results.length > 0) {
      const currentCount = results[0].count;
      // 更新商品數量
      db.query(`UPDATE cart SET count = ? WHERE ISBN = ?,updateAt=NOW() AND member_id = 1`, [currentCount + 1, ISBN], (error, updateResults) => {
        if (error) {
          console.error('錯誤購物車更新:', error);
          return res.status(500).json({ error: '購物車更新失敗' });
        }
        console.log('成功更新購物車中的商品數量');
        return res.json({ message: '成功更新購物車中的商品數量' });
      });
    } else {
      // 插入一筆新的資料
      db.query(`INSERT INTO cart (member_id, cart_id, ISBN, count, createAt) VALUES (1, 1, ?, 1, NOW())`, [ISBN], (error, insertResults) => {
        if (error) {
          console.error('錯誤購物車新增', error);
          return res.status(500).json({ error: '購物車加入失敗' });
        }
        console.log('成功加入購物車');
        return res.json({ message: '成功加入購物車' });
      });
    }
  });
});



 router.get('/Cart',async(req,res)=>{
   let output = {
      totalPages: 0,
      perpage:0,
      page:0,
      totalcart:0,
      cart:[],
   }
   const perpage = 8;
   let page = req.query.page ? parseInt(req.query.page) : 1;
   const cartsqlcount = `SELECT COUNT(1) totalcart FROM cart`
   const [[{totalcart}]] = await db.query(cartsqlcount);
   let totalPages = 0;
   let cart = [];
   const joincart = `SELECT book_info.pic,book_info.book_name,book_info.price,cart.count FROM cart LEFT JOIN book_info ON cart.ISBN = book_info.ISBN`
   if(totalcart){
      totalPages = Math.ceil(totalcart/perpage);
      if(page > totalPages) {
         output.redirect = req.baseUrl + '?page=' + totalPages;
         return res.json(output);
       };
       const cartsql = ` SELECT * FROM cart LIMIT ${perpage*(page-1)}, ${perpage}`;
       [cart] = await db.query(cartsql);
     }
     output = {...output, totalcart, perpage, totalPages, page, cart}; //取代輸出預設值 為正確數值
       return res.json(output);
 })
 router



module.exports = router;













