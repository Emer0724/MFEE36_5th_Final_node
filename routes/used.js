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
const jwt=require('jsonwebtoken')
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
//二手書上架書本資訊
router.get('/display/book_info',async(req,res)=>{
    const ISBN= req.query.ISBN
    const sql="select ISBN,book_name,pic,publish,author from book_info where ISBN=?"
    const [rows]=await db.query(sql,ISBN)
    return res.json(rows)
})

//假token 過度用
router.post('/login',async(req,res)=>{
  
    const output={
        success:false,
        code:402,
        error:''
    }
    
    const sql='select * from member where member_id=?';
    const [rows]=await db.query(sql,[req.body.member_id]);
    if(! rows.length){
        output.code=402;
        output.error='無此member_id'
        return res.json(output)
    }
    
    output.success=true
  // 包 jwt 傳給前端
  const secretKey = '454645f4gs6fg54s6df';
  const token=jwt.sign({
    id:rows[0].member_id,
    email:rows[0].email
  },secretKey);
  output.data={
    member_id: rows[0].member_id,
    email:rows[0].email,
    name: rows[0].name,
    nickname: rows[0].nickname,
    mem_avatar:rows[0].mem_avatar,
    token,
  }
  res.json(output)
})

//used-disply-get會員資料
router.get('/display/member/:member_id',async(req,res)=>{
  const member_id=req.params.member_id
  const sql='select member_id,name,mobile,email,city,district,address,full_address from member where member_id=?'
  const[rows]=await db.query(sql,member_id)
  return res.json(rows)
})
module.exports = router;