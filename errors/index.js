exports.handlePathErrors = (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "Not found" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "2201W") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.code === "2201X") {
    res.status(400).send({ msg: "Bad request" });
  }
  next(err);
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
};
