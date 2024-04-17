const { getAllUsers, getUser } = require("../controllers/users.controllers")

const usersRouter = require("express").Router()

usersRouter.get('/', getAllUsers)
usersRouter.get('/:username', getUser)

module.exports = usersRouter