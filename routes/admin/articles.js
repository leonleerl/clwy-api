const express = require("express");
const router = express.Router();
const { Article } = require("../../models");

router.get("/", async function (req, res) {
  const condition = {
    order: [["id", "DESC"]],
  };
  const articles = await Article.findAll(condition);
  res.json({
    status: true,
    message: "查询文章成功",
    data: {
      articles,
    },
  });
});

module.exports = router;
