const express = require("express")

const endpoints = require('./endpoints.json')
const { getAllTopics } = require("./controllers/topics.controllers")

const app = express()

app.get("/api/topics", getAllTopics)
app.get("/api", (req,res,next)=>{
    res.status(200).send({endpoints})
})

app.all("/*", (req,res,next)=>{
    res.status(404).send({msg: "Path not found"})
})


app.use((err,req,res,next)=>{
    res.status(500).send({msg: "Internal server error"})
})

module.exports = app