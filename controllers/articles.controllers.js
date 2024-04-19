const {
  selectArticle,
  selectAllArticles,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotes,
  checkArticleExists,
  insertArticle,
  countArticlesAndPages,
  removeArticle,
} = require("../models/articles.models");
const { countCommentsAndPages } = require("../models/comments.models");
const { checkTopicExists } = require("../models/topics.models");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  const validQueries = ["topic", "sort_by", "order", "limit", "p"];
  const requestQueries = Object.keys(req.query);
  if (!requestQueries.every((query) => validQueries.includes(query))) {
    res.status(400).send({ msg: "Bad request" });
  }
  Promise.all([
    selectAllArticles(topic, sort_by, order, limit, p),
    countArticlesAndPages(topic, limit, p),
    checkTopicExists(topic),
  ])
    .then(([articles, [total_count, page_count]]) => {
      res.status(200).send({ articles, total_count, page_count });
    })
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const {limit , p} = req.query
  const validQueries = ["limit", "p"]
  const requestQueries = Object.keys(req.query)
  if (!requestQueries.every((query)=> validQueries.includes(query))){
    res.status(400).send({msg: "Bad request"})
  }
  Promise.all([
    selectArticleComments(article_id, limit, p),
    countCommentsAndPages(article_id, limit, p),
    checkArticleExists(article_id),
  ])
    .then(([comments, total_count]) => {
      res.status(200).send({ comments, total_count });
    })
    .catch(next);
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  insertArticleComment(article_id, comment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const article = req.body;
  insertArticle(article)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticle = (req,res,next) => {
  const {article_id} = req.params
  removeArticle(article_id)
  .then(()=>{
    res.sendStatus(204)
  }) 
  .catch(next)
}
