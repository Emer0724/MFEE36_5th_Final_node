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
     const query = 'SELECT book_info.book_name, book_review.score, book_review.add_date, book_review.book_review, member.nickname, member.mem_avatar FROM book_review INNER JOIN member ON book_review.member_id = member.member_id INNER JOIN book_info ON book_info.ISBN = book_review.ISBN'
     const [result] = await db.query(query)
     return res.json(result);
   } catch (err) {
     console.error('查詢失敗：', err)
     res.status(500).json({ error: '錯誤' })
   }//抓書評資料
 });

 router.get('/blog', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0
    const query = `SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id ORDER BY blog.add_date ASC LIMIT 10 OFFSET ${offset}`;
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error('查詢失敗：', err)
    res.status(500).json({ error: '錯誤' })
  }
});

module.exports = router;