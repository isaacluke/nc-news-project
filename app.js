const cors = require('cors');
const express = require("express");

const apiRouter = require('./routes/api.router');
const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handlePathErrors,
} = require("./errors");

const app = express();

app.use(cors())
app.use(express.json());

app.use('/api', apiRouter);

app.all("/*", handlePathErrors);

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;
