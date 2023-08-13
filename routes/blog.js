const dayjs = require("dayjs"); //時間格式
const express = require("express");
const { now } = require("moment"); //時間格式-有時區
const path = require("path");
const db = require(__dirname + "/../modules/mysql2");
const router = express.Router();
const upload = require(__dirname + "/../modules/img-upload");
const multipartParser = upload.none();
const moment = require("moment-timezone");
//寫入 時間用 currentDateTime
const date = new Date();
const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
const upload_avatar = require(__dirname + "/../modules/img-upload_blogimg");
const fs = require("fs");
//token驗證
// if(! res.locals.jwtData){
//    output.error = '沒有 token 驗證'
//    return res.json(output);
//  }else{
//    output.jwtData=res.locals.jwtData
//  }

router.get("/display", (req, res) => {
  return res.send("blog/test");
});

router.get("/asc", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10; // 每頁顯示的部落格文章數量
    const offset = (page - 1) * limit;

    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id ORDER BY `add_date` ASC LIMIT ? OFFSET ?";
    const [result] = await db.query(query, [limit, offset]);

    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //部落格最舊
});

router.get("/desc", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10; // 每頁顯示的部落格文章數量
    const offset = (page - 1) * limit;

    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id ORDER BY `add_date` DESC LIMIT ? OFFSET ?";
    const [result] = await db.query(query, [limit, offset]);

    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //部落格最新
});

router.get("/taglove/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 1 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag愛情
});

router.get("/taglove/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 1 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag愛情
});

router.get("/tagtravel/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 2 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag旅遊
});

router.get("/tagtravel/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 2 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag旅遊
});

router.get("/taglife/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 3 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag生活
});

router.get("/taglife/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 3 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag生活
});

router.get("/tagwork/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 4 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag工作
});

router.get("/tagwork/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 4 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag工作
});

router.get("/tageducate/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 5 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag教育
});

router.get("/tageducate/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 5 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag教育
});

router.get("/tagbook/desc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 6 ORDER BY `add_date` DESC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag書
});

router.get("/tagbook/asc", async (req, res) => {
  try {
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, blog.tag_id, tag.tag_classification, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.tag_id = 6 ORDER BY `add_date` ASC LIMIT 10";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //tag書
});

router.get("/book/asc", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10; // 每頁顯示的書評數量
    const offset = (page - 1) * limit;

    const query =
      'SELECT book_info.book_name, book_info.pic, book_review.score, book_review.add_date, book_review.book_review, member.nickname, member.mem_avatar FROM book_review INNER JOIN member ON book_review.member_id = member.member_id INNER JOIN book_info ON book_info.ISBN = book_review.ISBN ORDER BY `score` ASC LIMIT ? OFFSET ?';
    const [result] = await db.query(query, [limit, offset]);

    return res.json(result);
  } catch (err) {
    console.error('查詢失敗：', err);
    res.status(500).json({ error: '錯誤' });
  }//無限滾動的書評評分最低
});

router.get('/book/desc', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10; // 每頁顯示的書評數量
    const offset = (page - 1) * limit;

    const query =
      'SELECT book_info.book_name, book_info.pic, book_review.score, book_review.add_date, book_review.book_review, member.nickname, member.mem_avatar FROM book_review INNER JOIN member ON book_review.member_id = member.member_id INNER JOIN book_info ON book_info.ISBN = book_review.ISBN ORDER BY `score` DESC LIMIT ? OFFSET ?';
    const [result] = await db.query(query, [limit, offset]);

    return res.json(result);
  } catch (err) {
    console.error('查詢失敗：', err);
    res.status(500).json({ error: '錯誤' });
  }//無限滾動的書評評分最高
});

router.get("/:blogsid", async (req, res) => {
  try {
    const blogId = req.params.blogsid;
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, member.nickname, member.member_id, member.mem_avatar, tag.tag_classification FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.blog_sid = ?";
    const [result] = await db.query(query, [blogId]);
    // 檢查文章是否存在，如果不存在返回 404 狀態碼
    if (result.length === 0) {
      return res.status(404).json({ error: "文章不存在" });
    }
    const query1 =
      "SELECT blog.blog_sid, member.nickname, member.mem_avatar, reply.reply_content, reply.add_date FROM blog LEFT JOIN reply ON blog.blog_sid = reply.blog_sid INNER JOIN member ON member.member_id = reply.member_id WHERE blog.blog_sid = ?";
    const [result1] = await db.query(query1, [blogId]);
    // 返回文章內容和留言數據
    return res.json([result, result1]);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  }
});

router.get("/checklike/:blog_sid", async (req, res) => {
  try {
    const blog_sid = req.params.blog_sid;
    const query = "SELECT COUNT(*) AS count FROM `like1` WHERE blog_sid = ?";
    const [result] = await db.query(query, [blog_sid]);
    const isAdded = result[0].count > 0;
    return res.json({ isAdded });
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //檢查有沒有最愛這筆資料
});

router.post("/like/:userId", multipartParser, async (req, res) => {
  const data = req.body;
  console.log(req.body);
  const sql =
    "INSERT INTO `like1`" + "(`blog_id`, `member_id`)" + "VALUES ( ?, ?)";
  const [result] = await db.query(sql, [data.blog_sid, data.user]);
  res.json({
    result,
    postData: req.body,
  }); //最愛
});

router.delete("/deletelike/:userId", async (req, res) => {
  const blog_id = req.params.userId;
  try {
    const sql = "DELETE FROM `like1` WHERE `blog_id` = ?";
    const [result] = await db.query(sql, [blog_id]);
    if (result.affectedRows === 1) {
      res.json({
        message: "成功",
      });
    } else {
      res.status(404).json({
        error: "沒有文章",
      });
    }
  } catch (error) {
    console.error("錯誤:", error);
    res.status(500).json({ error: "錯誤" });
  } //取消最愛
});

router.get("/looklike/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT like1.member_id, like1.blog_id, member.nickname, member.mem_avatar, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date FROM like1 INNER JOIN blog ON like1.blog_id = blog.blog_sid INNER JOIN member ON blog.member_id = member.member_id WHERE like1.member_id = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //查詢個人頁最愛
});

router.get("/looktrack/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT track.member1_id, track.member2_id, member.nickname, member.mem_avatar FROM track INNER JOIN member ON track.member2_id = member.member_id WHERE track.member1_id = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //查詢個人頁追蹤
});

router.get("/lookblog/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT blog.blog_sid, blog.blog_title, blog.blog_img, blog.blog_post, blog.add_date, member.member_id, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id WHERE blog.member_id = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //查詢個人頁作品
});

router.get("/lookbook/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT member.member_id, member.nickname, member.mem_avatar, book_review.book_review, book_review.book_review_sid, book_review.ISBN, book_review.score, book_review.add_date, book_info.pic, book_info.book_name FROM book_review INNER JOIN member ON book_review.member_id = member.member_id INNER JOIN book_info ON book_review.ISBN = book_info.ISBN WHERE book_review.member_id = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //查詢個人頁書評
});

router.post("/track/:userId", multipartParser, async (req, res) => {
  const data = req.body;
  console.log(req.body);
  const sql =
    "INSERT INTO `track`" + "(`member1_id`, `member2_id`)" + "VALUES ( ?, ?)";
  const [result] = await db.query(sql, [data.user, data.member_id]);
  res.json({
    result,
    postData: req.body,
  }); //追蹤
});

router.delete("/deletetrack/:userId", async (req, res) => {
  const member2_id = req.params.userId;
  try {
    const sql = "DELETE FROM `track` WHERE `member2_id` = ?";
    const [result] = await db.query(sql, [member2_id]);
    if (result.affectedRows === 1) {
      res.json({
        message: "成功",
      });
    } else {
      res.status(404).json({
        error: "沒有用戶",
      });
    }
  } catch (error) {
    console.error("錯誤:", error);
    res.status(500).json({ error: "錯誤" });
  } //取消追蹤
});

router.get("/nav/follow", async (req, res) => {
  try {
    const query =
      "SELECT member.nickname, member.mem_avatar,blog.blog_sid, blog.blog_title FROM blog INNER JOIN member ON blog.member_id = member.member_id ORDER BY RAND() LIMIT 5";
    const [result] = await db.query(query);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //抓追隨列表資料
});

router.get("/nav/like/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = `
      SELECT COUNT(*) AS likeCount
      FROM like1
      WHERE member_id = ?`;
    const [result] = await db.query(query, [userId]);
    return res.json(result[0].likeCount);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //抓最愛總數
});

router.get("/nav/track/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = `
      SELECT COUNT(*) AS trackCount
      FROM track
      WHERE member1_id = ?`;
    const [result] = await db.query(query, [userId]);
    return res.json(result[0].trackCount);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //抓追蹤總數
});

router.post("/reply/upload", multipartParser, async (req, res) => {
  const data = req.body;
  const sql =
    "INSERT INTO `reply`" +
    "(`blog_sid`, `member_id`, `reply_content`,`add_date`)" +
    "VALUES ( ?, ?, ?, NOW())";
  const [result] = await db.query(sql, [
    data.blog_sid,
    data.member_id,
    data.inputValue,
  ]);
  res.json({
    result,
    postData: req.body,
  }); //上傳留言
});

router.post("/bookreview/edit/:id", multipartParser, async (req, res) => {
  const data = req.body;
  const reviewId = req.params.id;
  const sql =
    "UPDATE `book_review` SET " +
    "`member_id` = ?, " +
    "`ISBN` = ?, " +
    "`score` = ?, " +
    "`book_review` = ?, " +
    "`add_date` = NOW() " +
    "WHERE `book_review_sid` = ?";

  try {
    const [result] = await db.query(sql, [
      data.memberData,
      data.ISBN,
      data.score,
      data.content,
      reviewId, // 將URL中的書評ID傳遞到SQL查詢中
    ]);
    res.json({
      result,
      postData: req.body,
    });
  } catch (error) {
    console.error("更新書評時出錯：", error);
    res.status(500).json({ error: "更新書評時出錯" });
  }
});

router.post("/blog/upload", multipartParser, async (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const data = req.body;
  const base64Image = data.image;
  let imageName = null;

  if (base64Image) {
    const imageName = `${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
    const imagePath = path.join(__dirname, "../public/blogimg", imageName);

    const imageData = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    fs.writeFile(imagePath, imageData, async (err) => {
      if (err) {
        console.error("Error saving image:", err);
        return res.status(500).json({ error: "Failed to save image." });
      }

      const sql =
        "INSERT INTO `blog`" +
        "(`member_id`, `blog_title`, `blog_img`, `tag_id`, `blog_post`,`add_date`)" +
        "VALUES (?, ?, ?, ?, ?, NOW())";

      const [result] = await db.query(sql, [
        data.member_id,
        data.title,
        imageName,
        data.tag,
        data.content,
      ]);

      res.json({
        result,
        postData: req.body,
      });
    });
  } else {
    const sql =
      "INSERT INTO `blog`" +
      "(`member_id`, `blog_title`, `blog_img`, `tag_id`, `blog_post`,`add_date`)" +
      "VALUES (?, ?, ?, ?, ?, NOW())";

    const [result] = await db.query(sql, [
      data.member_id,
      data.title,
      imageName,
      data.tag,
      data.content,
    ]);

    res.json({
      result,
      postData: req.body,
    });
  } //上傳作品
});

router.post("/bookreview/upload", multipartParser, async (req, res) => {
  const data = req.body;

  const sql =
    "INSERT INTO `book_review`" +
    "(`member_id`, `ISBN`, `score`, `book_review`, `add_date`)" +
    "VALUES ( ?, ?, ?, ?, NOW())";
  const [result] = await db.query(sql, [
    data.memberData,
    data.ISBN,
    data.score,
    data.content,
  ]);
  res.json({
    result,
    postData: req.body,
  }); //上傳書評
});

router.get("/edit/lookbook/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT member.member_id, member.nickname, member.mem_avatar, book_review.book_review, book_review.book_review_sid, book_review.ISBN, book_review.score, book_review.add_date, book_info.pic, book_info.book_name FROM book_review INNER JOIN member ON book_review.member_id = member.member_id INNER JOIN book_info ON book_review.ISBN = book_info.ISBN WHERE book_review.book_review_sid = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //編輯的書評資料
});

router.put(
  "/bookreview/edit/:book_review_sid",
  multipartParser,
  async (req, res) => {
    const data = req.body;
    const bookReviewSid = req.params.book_review_sid;
    const currentTime = new Date();

    const sql =
      "UPDATE `book_review` SET " +
      "`member_id` = ?, `ISBN` = ?, `score` = ?, `book_review` = ?, `add_date` = ?" +
      "WHERE `book_review_sid` = ?";
    const [result] = await db.query(sql, [
      data.memberData,
      data.ISBN,
      data.score,
      data.content,
      currentTime,
      bookReviewSid,
    ]);
    res.json({
      result,
      updatedData: req.body,
    }); //编辑書評
  }
);

router.get("/edit/lookblog/:user", async (req, res) => {
  try {
    const userId = req.params.user;
    const query =
      "SELECT blog.blog_sid, blog.blog_title,blog.tag_id, blog.blog_img, blog.blog_post, blog.add_date, member.member_id, member.nickname, member.mem_avatar FROM blog INNER JOIN member ON blog.member_id = member.member_id INNER JOIN tag ON tag.tag_id = blog.tag_id WHERE blog.blog_sid = ?";
    const [result] = await db.query(query, [userId]);
    return res.json(result);
  } catch (err) {
    console.error("查詢失敗：", err);
    res.status(500).json({ error: "錯誤" });
  } //查詢個人頁作品
});

router.delete("/delete/blog/:blogId", async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const deleteQuery = "DELETE FROM blog WHERE blog_sid = ?";
    const [result] = await db.query(deleteQuery, [blogId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "找不到要删除的blog" });
    }

    return res.json({ message: "blog已成功删除" });
  } catch (err) {
    console.error("删除失败：", err);
    res.status(500).json({ error: "删除失败" });
  }
});

router.put("/blog/edit/:blog_sid", multipartParser, async (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const data = req.body;
  const base64Image = data.image;
  const blogSid = req.params.blog_sid;
  const currentTime = new Date();
  let imageName = null;

  if (base64Image) {
    const imageName = `${year}${month}${day}_${hours}${minutes}${seconds}.jpg`;
    const imagePath = path.join(__dirname, "../public/blogimg", imageName);

    const imageData = Buffer.from(
      base64Image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    fs.writeFile(imagePath, imageData, async (err) => {
      if (err) {
        console.error("Error saving image:", err);
        return res.status(500).json({ error: "Failed to save image." });
      }

      const sql =
        "UPDATE `blog` SET " +
        "`member_id` = ?, `blog_title` = ?, `blog_img` = ?, `tag_id` = ?, `blog_post` = ?, `add_date` = ?" +
        "WHERE `blog_sid` = ?";

      const [result] = await db.query(sql, [  
        data.member_id,
        data.title,
        imageName,
        data.tag,
        data.content,
        currentTime,  
        blogSid,
      ]);

      res.json({
        result,
        postData: req.body,
      });
    });
  }//編輯作品
});

module.exports = router;
