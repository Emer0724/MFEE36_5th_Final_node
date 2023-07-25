const dayjs = require('dayjs')//時間格式
const express = require('express'); //express引入
const { now } = require('moment');//時間格式-有時區
const db = require(__dirname + '/../modules/mysql2')//__dirname 表當前執行檔案位置  用途:當前執行檔案連結資料庫
const router = express.Router() //express內建route功能 [get、post、put、delete]
const upload = require(__dirname + '/../modules/img-upload');//引導到圖片上傳的檔案
const multipartParser = upload.none();
const moment = require('moment-timezone');
//寫入 時間用 currentDateTime
const date = new Date
const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
//token驗證
// if(! res.locals.jwtData){
//    output.error = '沒有 token 驗證'
//    return res.json(output);
//  }else{
//    output.jwtData=res.locals.jwtData
//  }




router.get("/", async (req, res) => {  //處理GET請求時執行async
   let output = {
      redirect: "", //重新導向
      totalRows: 0, //表示
      perPage: 25, //每頁顯示25筆資料
      totalPages: 0, //總頁數
      page: 1, //目前頁數
      rows: [], //空陣列 用於存放內容
   };
   const perPage = 16;   //處理分頁與關鍵字搜尋
   let keyword = req.query.keyword || ""; //設置關鍵字變數,req.query.keyword  reqeust物件的方法 取得get方法的query string的值 這邊的"keyword"是自定義的
   let page = req.query.page ? parseInt(req.query.page) : 1; //儲存目前所在的頁數 若有page參數則轉為整數,若無則回傳一
   if (!page || page < 1) { //若'page'為undifined 或小於一
      output.redirect = req.baseUrl;
      return res.json(output); //則回第一頁
   }

   let where = " WHERE 1 ";
   if (keyword) {  //若有給關鍵字則執行以下  利用關鍵字在bookname、author欄位做搜尋
      const kw_escaped = db.escape("%" + keyword + "%");//%值 % SQL語法用於模糊匹配 
      where += ` AND ( 
           \`bookname\` LIKE ${kw_escaped}  
           OR
           \`author\` LIKE ${kw_escaped}
           )
         `;
   }

   const t_sql = `SELECT COUNT(1) totalRows FROM book_info ${where}`; //計算符合WHERE的總行數 在上方已經改寫了WHERE內容了
   console.log(t_sql);
   const [[{ totalRows }]] = await db.query(t_sql); //解構賦值
   let totalPages = 0;
   let rows = [];
   if (totalRows) {
      totalPages = Math.ceil(totalRows / perPage);  //將總欄數除以上方設定的每頁資料筆數 來算出總頁數 Math.ceil無條件進位
      if (page > totalPages) {  //當輸入頁數大於最大頁數執行以下
         output.redirect = req.baseUrl + "?page=" + totalPages; //導向最後一頁
         return res.json(output);
      }
      const sql = ` SELECT * FROM book_info ${where} LIMIT ${perPage * (page - 1)
         }, ${perPage}`;
      [rows] = await db.query(sql);
   }
   output = { ...output, totalRows, perPage, totalPages, page, rows, keyword };
   return res.json(output);
});




//[育葶大大的sample]
router.get('/book_category', async (req, res) => {
   try {
      const sql = `
  SELECT a.category_id,a.category_name,a.category_parentID,b.category_name as ft_category_name FROM category as a left join category as b on a.category_parentID=b.category_id`
      const [rows] = await db.query(sql)
      res.json(rows);
   } catch (err) {

   }

})



router.get("/:ISBN", async (req, res) => {
   const output = {
      success: false,
      error: "",
      row: null,
   };
   const ISBN = parseInt(req.params.ISBN) || 0;
   if (!ISBN) {
      // 沒有 sid
      output.error = "沒有 sid !";
   } else {
      const sql = `SELECT * FROM book_info WHERE ISBN=${ISBN}`;
      const [rows] = await db.query(sql);

      if (rows.length) {
         output.success = true;
         output.row = rows[0];
      } else {
         // 沒有資料
         output.error = "沒有資料 !";
      }
   }
   res.json(output);
});









router.get('/error', (req, res) => {
   db.query('SELECT * FROM book_info', (err, results) => {
      if (err) {
         console.error('資料庫查詢錯誤:', err.message);
         return res.status(500).json({ error: '資料庫查詢錯誤' });
      }
      return res.json(results);
   });
});
module.exports = router;