const {
  getAllArticles,
  getArticle,
  getArticleComments,
  patchArticleVotes,
  postArticleComment,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controllers");

const articlesRouter = require("express").Router();

articlesRouter
  .route("/")
  .get(getAllArticles)
  .post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchArticleVotes)
  .delete(deleteArticle)

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articlesRouter