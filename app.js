const express = require("express");

const endpoints = require("./endpoints.json");
const { getAllTopics } = require("./controllers/topics.controllers");
const {
  getArticle,
  getAllArticles,
  getArticleComments,
  postArticleComment,
  patchArticleVotes,
} = require("./controllers/articles.controllers");
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handlePathErrors,
} = require("./errors");

const app = express();
app.use(express.json());

app.get("/api/topics", getAllTopics);
app.get("/api", (req, res, next) => {
  res.status(200).send({ endpoints });
});
app.get("/api/articles/:article_id", getArticle);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getArticleComments);

app.patch("/api/articles/:article_id", patchArticleVotes)

app.post("/api/articles/:article_id/comments", postArticleComment);

app.all("/*", handlePathErrors);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;
