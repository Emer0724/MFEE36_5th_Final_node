console.log('arg2:', process.argv[2])
console.log(process.argv)
if (process.argv[2] === 'production') {
    require('dotenv').config({
        path: __dirname + '/production.env'
    });
} else {
    require('dotenv').config()
}


// const multer=require('multer');
// const upload=multer({dest:'tmp_uploads/'})
const upload = require(__dirname + '/modules/img-upload')
const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const MysqlStore = require('express-mysql-session')(session)
const dayjs = require('dayjs');
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const db = require(__dirname + '/modules/mysql2')
const sessionStore = new MysqlStore({}, db)
const app = express();


app.set('view engine', 'ejs')
const whitelist = ['http://127.0.0.1:5500/']
const corsOptions = {
    credentials: true,
    origin: (origin, cb) => {
        console.log({ origin });
        cb(null, true)

    }
}

app.use(cors(corsOptions))
app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: "dfgdfFSaegdh46749849ASDFDAR",
    store: sessionStore,
    cookie: {
        maxAge: 1200_000,
    }
}))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
//自訂 middleware
app.use((req, res, next) => {

    // template helper functions
    res.locals.toDateString = (d) => {
        const fm = 'YYYY-MM-DD';
        const djs = dayjs(d)
        return djs.format(fm)
    };
    res.locals.toDatatimeString = (d) => {
        const fm = 'YYYY-MM-DD HH:mm:ss';
        const djs = dayjs(d)
        return djs.format(fm)
    };
    //貼課堂的也許有誤
    const auth = req.get('Authorization');
    if (auth && auth.indexOf('Bearer ') === 0) {
        const token = auth.slice(7);
        let jwtData = null
        try {
            jwtData = jwt.verify(token, process.env.JWT_SECRET)
            //         jwtData = {
            //     id: 12,
            //     email: 'test@test.com'
            //   }
        } catch (ex) { }
        if (jwtData) {
            res.locals.jwtData = jwtData;
        }
    }
    next()
})



// app.use('/ab',require(__dirname+'/routes/address-book'))
app.use('/blog', require(__dirname + '/routes/blog'))
app.use('/cart', require(__dirname + '/routes/cart'))
app.use('/market', require(__dirname + '/routes/market'))
app.use('/member', require(__dirname + '/routes/member'))
app.use('/used', require(__dirname + '/routes/used'))


//session 範例
app.get('/try-sess', (req, res) => {
    req.session.count = req.session.count || 0,
        req.session.count++;
    req.session.name = 'dfsf';
    res.json({
        const: req.session.count,
        name: req.session.name,
        session: req.session
    })
})

//日期範例
app.get('/try-moment', (req, res) => {
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const dayjs1 = dayjs();
    const dayjs2 = dayjs('2023/08/16');
    const d3 = new Date();
    const moment1 = moment()
    res.json({
        d1: dayjs1.format(fm),
        d2: dayjs2.format(fm),
        d3: d3,
        m1: moment1.format(fm),
        m2: moment1.tz('EEurope/London').format(fm),
    })

})


//get db資料範例
app.get('/try-db', async (req, res) => {
    const [rows] = await db.query('select * from  book_info order by ISBN desc limit 2')
    res.json({ rows })


})
//密碼 hush
app.get('/try-bcrypt', async (req, res) => {
    const hash = await bcrypt.hash('banana', 10);
    res.send(hash);
})
//密碼解 hush
app.get('/try-bcrypt2', async (req, res) => {
    const hash = '$2a$10$uQVpRde/yHvKK93Ua4DONuwqWSFmIn21VvWvSOwLAFE8pIGkislGW';
    const result = await bcrypt.compare('banana', hash);
    res.send({ result })
})

// middleware
// const urlencodedParser=express.urlencoded({extended: false})
// const jsonParser=express.json()
//表單 post 案例
app.post('/try-post', upload.none(), (req, res) => {
    console.log(req.body)

    res.json(req.body)
});

// app.get('/a.html',(req,res)=>{
//     res.json({name:'哈哈',age:567})
// });
// 設定靜態內容的資料夾
app.get('*', express.static('public'))
app.use(express.static('node_modules/bootstrap/dist'))
app.use(express.static('node_modules/jquery/dist'))

app.use((req, res) => {
    res.type('text/html')
    res.status(404)
    res.send(`<h2>404找不到網頁<h2>`)
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`啟動~PORT:${port}`)
})