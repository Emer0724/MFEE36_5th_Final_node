console.log('arg2:', process.argv[2]);

if (process.argv[2] === 'production') {
    require('dotenv').config({
        path: __dirname + '/production.env'
    });
} else {
    require('dotenv').config()
}


// const multer = require('multer');
// const upload = multer({dest:'tmp_uploads/'});
const upload = require(__dirname + '/modules/img-upload');
const express = require('express');

const session = require('express-session');
const moment = require('moment-timezone'); const MysqlStore = require('express-mysql-session')(session);




const dayjs = require('dayjs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require(__dirname + '/modules/mysql2');
const sessionStore = new MysqlStore({}, db);
const app = express();

// 設定使用的樣版引擎
app.set('view engine', 'ejs');

// const whitelist = ['http://127.0.0.1:5500/'];
const whitelist = ['http://localhost:3000'];

const corsOptions = {
    credentials: true,
    origin: (origin, cb) => {
        console.log({ origin });
        cb(null, true);
    }
}

app.use(cors(corsOptions));


app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'dfgdfFSaegdh46749849ASDFDAR',
    store: sessionStore,

    cookie: {
        maxAge: 1200_000,
    }

}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 自訂 middleware
app.use((req, res, next) => {

    // template helper functions
    res.locals.toDateString = (d) => {
        const fm = 'YYYY-MM-DD';
        const djs = dayjs(d);
        return djs.format(fm);
    };
    res.locals.toDatetimeString = (d) => {
        const fm = 'YYYY-MM-DD  HH:mm:ss';
        const djs = dayjs(d);
        return djs.format(fm);
    };

    const auth = req.get('Authorization');
    if (auth && auth.indexOf('Bearer ') === 0) {
        const token = auth.slice(7);
        let jwtData = null
        try {
            jwtData = jwt.verify(token, process.env.JWT_SECRET)

            // 測試的情況, 預設是登入

            // jwtData = {
            //   id: 12,
            //   email: 'test@test.com'
            // }
        } catch (ex) { }
        if (jwtData) {
            res.locals.jwtData = jwtData; // 標記有沒有使用 token
        }
    }


    next();
});



app.get('/', (req, res) => {
    /*
    res.send(`<h2>Hello</h2>
    <p>${process.env.DB_USER}</p>`);
    */
    res.render('home', { name: 'Shinder', db_user: process.env.DB_USER });
});
app.get('/123', (req, res) => {
    res.send(`<h2>123---</h2>`);
});

app.get('/json', (req, res) => {
    res.json({
        name: 'shinder',
        age: 28,
    });
});
app.get('/json-sales', (req, res) => {
    const sales = require(__dirname + '/data/sales');

    res.send(sales[0].name)
});
app.get('/json-sales2', (req, res) => {
    const sales = require(__dirname + '/data/sales');

    res.render('json-sales2', { sales });

});


app.get('/try-qs', (req, res) => {
    res.json(req.query);
});

// middleware
// const urlencodedParser = express.urlencoded({extended: false})
// const jsonParser = express.json()

app.post('/try-post', (req, res) => {
    console.log(req.body);
    res.json(req.body);
});

app.get('/try-post-form', (req, res) => {
    //res.render('try-post-form', {account:'', password:''});
    res.render('try-post-form');
});
app.post('/try-post-form', (req, res) => {
    res.render('try-post-form', req.body);
});

app.post('/try-upload', upload.single('avatar'), (req, res) => {
    console.log(req.file)
    res.json(req.file);
});

app.post('/try-uploads', upload.array('photo', 10), (req, res) => {
    console.log(req.files)
    res.json(req.files.map(f => f.filename));
});


// app.use('/ab',require(__dirname+'/routes/address-book'))
app.use('/blog', require(__dirname + '/routes/blog'))
app.use('/cart', require(__dirname + '/routes/cart'))
app.use('/market', require(__dirname + '/routes/market'))
app.use('/member', require(__dirname + '/routes/member'))
app.use('/used', require(__dirname + '/routes/used'))


//session 範例
app.get('/try-sess', (req, res) => {
    req.session.count = req.session.count || 0;
    req.session.count++;
    req.session.name = 'dfsf';
    res.json({
        count: req.session.count,
        name: req.session.name,
        session: req.session,
    })
})
//日期範例
app.get('/try-moment', (req, res) => {
    const fm = 'YYYY-MM-DD HH:mm:ss';
    const dayjs1 = dayjs();
    const dayjs2 = dayjs('2023/08/16');
    const d3 = new Date();
    const moment1 = moment();
    res.json({
        d1: dayjs1.format(fm),
        d2: dayjs2.format(fm),
        d3: d3,
        m1: moment1.format(fm),
        m2: moment1.tz('Europe/London').format(fm),
    })
});
//get db資料範例
app.get('/try-db', async (req, res) => {
    // const [rows] = await db.query(`SELECT * FROM \`address_book\` LIMIT 2`);
    const [rows] = await db.query('select * from  book_info order by ISBN desc limit 2')
    res.json(rows);
});


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

// app.get('/yahoo', async (req, res) => {
//     fetch('https://tw.yahoo.com/')
//         .then(r => r.text())
//         .then(txt => {
//             res.send(txt)
//         })
// });

/*
app.get('/a.html', (req, res)=>{
  res.json({
    name: '假的 html',
  });
});
*/

app.post('/login', async (req, res) => {
    const output = {
        success: false,
        code: 0,
        error: ''
    };
    if (!req.body.email || !req.body.password) {
        output.error = '欄位資料不足'
        return res.json(output)
    }

    // const sql = "SELECT * FROM members WHERE email=?";
    const sql = "SELECT * FROM member WHERE email=?";
    const [rows] = await db.query(sql, [req.body.email]);
    if (!rows.length) {
        // 帳號是錯的
        output.code = 402;
        output.error = '帳號或密碼錯誤'
        return res.json(output)
    }
    const verified = await bcrypt.compare(req.body.password, rows[0].password);
    if (!verified) {
        // 密碼是錯的
        output.code = 406;
        output.error = '帳號或密碼錯誤'
        return res.json(output)
    }
    output.success = true;

    // 包 jwt 傳給前端
    const token = jwt.sign({
        id: rows[0].sid,
        email: rows[0].email
    }, process.env.JWT_SECRET);

    output.data = {
        id: rows[0].id,
        email: rows[0].email,
        nickname: rows[0].nickname,
        token,
    }
    res.json(output)

});



// 設定靜態內容的資料夾
/*
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap/dist'));
app.use(express.static('node_modules/jquery/dist'));
*/
app.get('*', express.static('public'));
app.get('*', express.static('node_modules/bootstrap/dist'));
app.get('*', express.static('node_modules/jquery/dist'));

app.use((req, res) => {
    res.type('text/html').status(404).send(`<h1>找不到頁面</h1>`);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`啟動~ port: ${port}`);
})