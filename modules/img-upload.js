const multer=require("multer");
const {v4:uuidv4}=require('uuid');
const exyMap={
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
const storage= multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,__dirname+"/../public/img")
    },
    filename:(req,file,cb)=>{
        const ext=exyMap[file.mimetype]
        cb(null,uuidv4()+ext);

    }
})
const fileFilter=(req,file,cb)=>{
    cb(null,!!exyMap[file.mimetype]);
}
module.exports=multer({fileFilter,storage})