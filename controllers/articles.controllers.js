const { selectArticle, selectAllArticles, selectArticleComments } = require("../models/articles.models")

exports.getArticle = (req,res,next) => {
    const {article_id} = req.params
    selectArticle(article_id)
    .then((article)=>{
        res.status(200).send({article})
    })
    .catch((err)=>{
        next(err)
    })
}

exports.getAllArticles = (req,res,next) => {
    selectAllArticles()
    .then((articles)=>{
        res.status(200).send({articles})
    })
}

exports.getArticleComments = (req,res,next) => {
    const {article_id} = req.params
    selectArticleComments(article_id)
    .then((comments)=>{
        res.status(200).send({comments})
    })
    .catch((err)=>{
        next(err)
    })
}