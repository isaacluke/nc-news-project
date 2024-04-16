const db = require("../db/connection");

exports.selectArticle = (article_id) => {
  return db
    .query(
      `
    SELECT 
        articles.article_id, 
        articles.title,
        articles.topic,
        articles.author,
        articles.body,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
    CAST(COUNT(comments.comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments
    ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
    `, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectAllArticles = (topic) => {
    let sqlQueryString = `
        SELECT  
            articles.article_id, 
            articles.title,
            articles.topic,
            articles.author,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            CAST(COUNT(comments.comment_id) AS INT) AS comment_count
        FROM articles
        LEFT JOIN comments
        ON comments.article_id = articles.article_id
        `
    const sqlQueryArray = []

    if (topic){
        sqlQueryArray.push(topic)
        sqlQueryString += `WHERE topic = $1`
    }

    sqlQueryString += `
        GROUP BY articles.article_id
        ORDER BY created_at DESC;`


  return db
    .query(sqlQueryString, sqlQueryArray)
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectArticleComments = (article_id) => {
    return db.query(`
    SELECT * 
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `, [article_id])
    .then(({rows})=>{
        return rows
    })
}

exports.insertArticleComment = (article_id, {username, body}) => {
    return db.query(`
    INSERT INTO comments
        (body, author, article_id )
    VALUES
        ($1, $2, $3)
    RETURNING *;
    `, [body, username, article_id])
    .then(({rows})=>{
        return rows[0]
    })
}

exports.updateArticleVotes = (article_id, inc_votes) => {
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `, [inc_votes, article_id])
    .then(({rows})=>{
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Not found" });
          }
        return rows[0]
    })
}

exports.checkArticleExists = (article_id) => {
    return db.query(`
    SELECT *
    FROM articles
    WHERE article_id = $1;
    `, [article_id])
    .then(({rows})=>{
        if (rows.length === 0){
            return Promise.reject({ status: 404, msg: "Not found" })
        }
    })
}