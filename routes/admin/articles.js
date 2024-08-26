const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { Op } = require("sequelize");

router.get("/", async function (req, res) {
  try {
    const query = req.query;

    // 当前是第几页，如果不传，那就是第一页
    const currentPage = Math.abs(Number(query.currentPage)) || 1;

    // 每页显示多少条数据，如果不传，那就显示10条
    const pageSize = Math.abs(Number(query.pageSize)) || 10;

    // 计算 offset
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };

    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }

    // 将 findAll 方法改为 findAndCountAll 方法
    // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
    // count 是查询到的数据的总数，rows 中才是最终查询到的数据
    const { count, rows } = await Article.findAndCountAll(condition);

    // 返回查询结果
    res.json({
      status: true,
      message: "查询文章列表成功。",
      data: {
        articles: rows,
        pagination: {
          total: count,
          currentPage,
          pageSize,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "查询文章失败",
      errors: [eroor.message],
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
      errors: [eroor.message],
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
      errors: [eroor.message],
    });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);
    if (article) {
      await article.destroy();
      res.json({
        status: true,
        message: "删除文章成功",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "删除文章失败",
        errors: [error.message],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "删除文章失败",
      errors: [eroor.message],
    });
  }
});

router.put("/:id", async function (req, res) {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);
    if (article) {
      await article.update(req.body);
      res.json({
        status: true,
        message: "更新文章成功",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "文章未找到",
        errors: [error.message],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "查找文章失败",
      errors: [eroor.message],
    });
  }
});

module.exports = router;
