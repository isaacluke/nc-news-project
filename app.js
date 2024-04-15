const express = require("express")

const endpoints = require('./endpoints.json')
const { getAllTopics } = require("./controllers/topics.controllers")
const { getArticle } = require("./controllers/articles.controllers")

const app = express()

app.get("/api/topics", getAllTopics)
app.get("/api", (req,res,next)=>{
    res.status(200).send({endpoints})
})
app.get("/api/articles/:article_id", getArticle)

app.all("/*", (req,res,next)=>{
    res.status(404).send({msg: "Path not found"})
})


app.use((err,req,res,next)=>{
    if (err.code === '22P02'){
        res.status(400).send({msg: "Bad request"})
    }
    next(err)
})

app.use((err,req,res,next)=>{
    if (err.status && err.msg){
        res.status(err.status).send({msg: err.msg})
    }
    next(err)
})

app.use((err,req,res,next)=>{
    res.status(500).send({msg: "Internal server error"})
})

module.exports = app