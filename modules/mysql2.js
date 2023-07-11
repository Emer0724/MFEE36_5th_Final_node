const mysql=require('mysql2')
const {DB_HOST,DB_USER,DB_PASS,DB_NAME}=process.env
console.log({DB_HOST,DB_USER,DB_PASS,DB_NAME})
const pool=mysql.createPool({
    host:DB_HOST,
    user:DB_USER,
    password:DB_PASS,
    database:DB_NAME,
    waitForConnections:true,
    connectionLimit:3,
    queueLimit:0,
})
module.exports=pool.promise()

//waitForConnections: true：這個選項表示當連接池中的連接數量達到限制時，新的連接請求會被暫時擱置，直到有可用的連接。換句話說，如果連接池中的連接數量達到了連接限制（connectionLimit），後續的連接請求會等待其他連接釋放並變得可用。

//connectionLimit: 3：這個選項指定了連接池的最大連接數量。在這裡，連接池最多允許同時建立 3 個資料庫連接。如果有更多的連接請求到達，而連接池已經達到了連接限制，那些連接請求將會等待（如果 waitForConnections 為 true）或者被拒絕（如果 waitForConnections 為 false）。

//queueLimit: 0：這個選項指定了等待佇列的最大長度。當連接池已滿且 waitForConnections 為 true 時，連接請求會被放入等待佇列，等待其他連接釋放。將 queueLimit 設為 0 表示當連接池已滿時，新的連接請求將會立即返回錯誤，而不是被放入等待佇列。