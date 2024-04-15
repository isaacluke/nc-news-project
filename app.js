const express = require("express")

const { getAllTopics } = require("./controllers/topics.controllers")

const app = express()

app.get("/api/topics", getAllTopics)

app.all("/*", (req,res,next)=>{
    res.status(404).send({msg: "Path not found"})
})


app.use((err,req,res,next)=>{
    res.status(500).send({msg: "Internal server error"})
})

module.exports = app