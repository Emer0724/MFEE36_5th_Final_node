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


router.get('/display',(req,res)=>{
   return res.send('blog/test')
})

router.get('/bookreview', async (req, res) => {
   try {
     const query = 'SELECT * FROM book_review';
     const result = await db.query(query);
     res.json(result);
   } catch (err) {
     console.error('查詢失敗：', err);
     res.status(500).json({ error: '錯誤' });
   }
 });
 
 module.exports = router;