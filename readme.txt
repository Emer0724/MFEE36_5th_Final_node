// PORT=3055

在一個回應裡, 不可以呼叫兩次以下的方法:

res.end()
res.json()
res.send()
res.redirect()
res.render()
---------------------------------

req.query   # 取得 query string parameters
req.body
req.file
req.files
req.params  # 路徑的參數


---------------------------------

REST, RESTful API

CRUD
  create    : POST
  read      : GET
  update    : PUT, PATCH
  delete    : DELETE
---------------------------------
RESTful path

  POST
    /products     # 新增商品資料
      
  GET
    /products     # 取得列表資料
    /products/20  # 取得單項商品的資料
  PUT
    /products/20  # 修改單項商品的資料
  DELETE
    /products/20  # 刪除單項商品的資料



---------------------------------
錯誤先行: error first


