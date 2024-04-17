const { selectAllUsers, selectUser } = require("../models/users.models")

exports.getAllUsers = (req,res,next) => {
    selectAllUsers()
    .then((users)=>{
        res.status(200).send({users})
    })
}

exports.getUser = (req,res,next) => {
    const {username} = req.params
    selectUser(username)
    .then((user)=>{
        res.status(200).send({user})
    })
    .catch(next)
}