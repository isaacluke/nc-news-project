const { selectArticle, selectAllArticles } = require("../models/articles.models")

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
        console.log(articles)
        res.status(200).send({articles})
    })
}