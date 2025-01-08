const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { Op } = require("sequelize");

router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const condition = {
      order: [["id", "DESC"]],
    };
    // 如果有 title 查询参数，就添加到 where 条件中
    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }
    const articles = await Article.findAll(condition);
    res.json({
      status: true,
      message: "查询文章列表成功",
      data: {
        articles,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "查询文章列表失败",
      errors: [error.message],
    });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);
    if (article) {
      res.json({
        status: true,
        message: "查询文章成功",
        data: {
          article,
        },
      });
    } else {
      res.status(404).json({
        status: false,
        message: "文章未找到",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "查询文章失败",
      errors: [error.message],
    });
  }
});

router.post("/", async function (req, res) {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({
      status: true,
      message: "创建文章成功",
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "创建文章失败",
      error: [error.message],
    });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    // 获取文章 ID
    const { id } = req.params;

    // 查询文章
    const article = await Article.findByPk(id);

    if (article) {
      // 删除文章
      await article.destroy();

      res.json({
        status: true,
        message: "删除文章成功。",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "文章未找到。",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "删除文章失败。",
      errors: [error.message],
    });
  }
});

/**
 * 更新文章
 * PUT /admin/articles/:id
 */
router.put("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (article) {
      await article.update(req.body);

      res.json({
        status: true,
        message: "更新文章成功。",
        data: article,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "文章未找到。",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "更新文章失败。",
      errors: [error.message],
    });
  }
});

module.exports = router;
