const { selectAllTopics, insertTopic } = require("../models/topics.models");

exports.getAllTopics = (req, res, next) => {
  selectAllTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
    const topic = req.body
    insertTopic(topic)
    .then((topic)=>{
        res.status(201).send({topic})
    })
    .catch(next)
};
