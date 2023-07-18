const dayjs = require('dayjs')//時間格式
const express=require('express');
const { now } = require('moment');//時間格式-有時區
const { query } = require('../modules/mysql2');
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
   return res.send('二手書喔喔喔')
})
router.get('/trydb',async(req,res)=>{
const [rows] = await db.query( "select * from book_info")
return res.json([rows])
})
router.post('/trypost',multipartParser,async(req,res)=>{
    const sql="INSERT INTO `likes`(`client_id`, `ISBN`, `date`) VALUES (?,?,?)"
    const data={...req.body}
    // const date= new Date
    // const currentDateTime =moment().format('YYYY-MM-DD HH:mm:ss');
    const [result]=await db.query(sql,[data.client_id,data.ISBN,currentDateTime])
    return res.json({result,data})
    })
router.get('/display/book_info',async(req,res)=>{
    const ISBN= req.query.ISBN
    const sql="select ISBN,book_name,pic,publish,author from book_info where ISBN=?"
    const [rows]=await db.query(sql,ISBN)
    return res.json(rows)
})
module.exports = router;