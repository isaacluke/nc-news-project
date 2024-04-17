const {
  selectArticle,
  selectAllArticles,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotes,
  checkArticleExists,
} = require("../models/articles.models");
const { checkTopicExists } = require("../models/topics.models");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { topic , sort_by , order } = req.query;
  const validQueries = ["topic", "sort_by", "order"];
  const requestQueries = Object.keys(req.query);
  if (!requestQueries.every((query) => validQueries.includes(query))) {
    res.status(400).send({ msg: "Bad request" });
  }
  Promise.all([selectAllArticles(topic, sort_by, order), checkTopicExists(topic)])
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    selectArticleComments(article_id),
    checkArticleExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  insertArticleComment(article_id, comment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
