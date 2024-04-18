const db = require("../db/connection");

exports.selectAllTopics = () => {
  return db
    .query(
      `
    SELECT * FROM topics;
    `
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.checkTopicExists = (topic) => {
  if (topic) {
    return db.query(
        `
        SELECT *
        FROM topics
        WHERE slug = $1;
        `, [topic])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Not found" });
        }
      });
  }
};

exports.insertTopic = ({slug, description}) => {
  return db.query(`
  INSERT INTO topics
    (slug, description)
  VALUES
    ($1, $2)
  RETURNING *;
  `, [slug, description])
  .then(({rows})=>{
    return rows[0]
  })
}
