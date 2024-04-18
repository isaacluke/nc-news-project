const db = require("../db/connection");

exports.removeComment = (comment_id) => {
  return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;
    `,
      [comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
    });
};

exports.updateCommentVotes = (comment_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;
    `,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.countCommentsAndPages = (article_id, limit = 10, p = 1) => {
  return db.query(
    `
        SELECT comment_id 
        FROM comments 
        WHERE article_id = $1`,
    [article_id]
  )
  .then(({rows})=>{
    const total_count = rows.length
    const pageOffset = Number(limit) * (Number(p) - 1)
    if (pageOffset >= total_count && total_count !== 0){
        return Promise.reject({status:404, msg: "Not found"})
    }
    return total_count
  })
};
