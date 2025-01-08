const express = require("express");
const router = express.Router();
const { Article } = require("../../models");
const { Op } = require("sequelize");
const { NotFoundError, success, failure } = require("../../utils/response");

/**
 * 查询文章列表
 * GET /admin/articles
 */
router.get("/", async function (req, res) {
  try {
    // 获取查询参数
    const query = req.query;

    // 获取分页所需要的两个参数，currentPage 和 pageSize
    // 如果没有传递这两个参数，就使用默认值
    // 默认是第1页
    // 默认每页显示 10 条数据
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;

    // 计算offset
    const offset = (currentPage - 1) * pageSize;

    // 定义查询条件
    const condition = {
      order: [["id", "DESC"]],

      // 在查询条件中添加 limit 和 offset
      limit: pageSize,
      offset: offset,
    };

    // 如果有 title 查询参数，就添加到 where 条件中
    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%`,
        },
      };
    }

    // 查询数据
    // 将 findAll 方法改为 findAndCountAll 方法
    // findAndCountAll 方法会返回一个对象，对象中有两个属性，一个是 count，一个是 rows，
    // count 是查询到的数据的总数，rows 中才是查询到的数据
    const { count, rows } = await Article.findAndCountAll(condition);

    // 返回查询结果
    success(res, "查询文章列表成功", {
      articles: rows,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });
  } catch (error) {
    failure(res, error);
  }
});

router.get("/:id", async function (req, res) {
  try {
    const article = await getArticle(req);
    success(res, "查询文章成功", { article });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 创建文章
 * POST /admin/articles
 */
router.post("/", async function (req, res) {
  try {
    // 白名单过滤
    const body = filterBody(req);

    // 使用过滤好的 body 数据，创建文章
    const article = await Article.create(body);

    success(res, "创建文章成功", { article }, 201);
  } catch (error) {
    failure(res, error);
  }
});

router.delete("/:id", async function (req, res) {
  try {
    // 查询文章
    const article = getArticle(req);

    // 删除文章
    await article.destroy();

    // 删除文章。文章已经被删掉了，不存在了，所以不需要传 data
    success(res, "删除文章成功。");
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 更新文章
 * PUT /admin/articles/:id
 */
router.put("/:id", async function (req, res) {
  try {
    // 白名单过滤
    const body = filterBody(req);

    const article = getArticle(req);

    await article.update(body);

    // 更新文章
    success(res, "更新文章成功。", { article });
  } catch (error) {
    failure(res, error);
  }
});

/**
 * 公共方法：查询当前文章
 */
async function getArticle(req) {
  // 获取文章 ID
  const { id } = req.params;

  // 查询当前文章
  const article = await Article.findByPk(id);

  // 如果没有找到，就抛出异常
  if (!article) {
    throw new NotFoundError(`ID: ${id}的文章未找到。`);
  }

  return article;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*)}}
 */
function filterBody(req) {
  return {
    title: req.body.title,
    content: req.body.content,
  };
}

module.exports = router;
