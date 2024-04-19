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
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.selectAllArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

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
        `;
  const sqlQueryArray = [];

  const pageOffset = Number(limit) * (Number(p) - 1);

  if (topic) {
    sqlQueryArray.push(topic);
    sqlQueryString += `WHERE topic = $1 `;
  }

  sqlQueryString += `
        GROUP BY articles.article_id
        ORDER BY ${sort_by} ${order} 
        OFFSET $${sqlQueryArray.length + 1} ROWS FETCH NEXT $${
    sqlQueryArray.length + 2
  } ROWS ONLY;`;

  sqlQueryArray.push(pageOffset, limit);

  return db.query(sqlQueryString, sqlQueryArray).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleComments = (article_id, limit = 10, p = 1) => {
  const pageOffset = Number(limit) * (Number(p) - 1)
  return db
    .query(
      `
    SELECT * 
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC
    OFFSET $2 ROWS FETCH NEXT $3 ROWS ONLY;
    `,
      [article_id, pageOffset, limit]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertArticleComment = (article_id, { username, body }) => {
  return db
    .query(
      `
    INSERT INTO comments
        (body, author, article_id )
    VALUES
        ($1, $2, $3)
    RETURNING *;
    `,
      [body, username, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
    `,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return rows[0];
    });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(
      `
    SELECT *
    FROM articles
    WHERE article_id = $1;
    `,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
    });
};

exports.insertArticle = ({ title, topic, author, body, article_img_url }) => {
  let sqlQueryString = `INSERT INTO articles `;
  const sqlQueryArray = [title, topic, author, body];

  if (article_img_url) {
    sqlQueryString += `
        (title, topic, author, body, article_img_url) 
      VALUES 
        ($1, $2, $3, $4, $5) `;
    sqlQueryArray.push(article_img_url);
  } else {
    sqlQueryString += `
        (title, topic, author, body) 
      VALUES 
        ($1, $2, $3, $4) `;
  }
  sqlQueryString += `RETURNING *, 0 AS comment_count;`;
  return db.query(sqlQueryString, sqlQueryArray).then(({ rows }) => {
    return rows[0];
  });
};

exports.countArticlesAndPages = (topic, limit = 10, p = 1) => {
  let sqlQueryString = `SELECT article_id FROM articles `;
  const sqlQueryArray = [];
  if (topic) {
    sqlQueryString += `WHERE topic = $1;`;
    sqlQueryArray.push(topic);
  }
  return db.query(sqlQueryString, sqlQueryArray)
  .then(({ rows }) => {
    const total_count = rows.length
    const pageOffset = Number(limit) * (Number(p) - 1);
    if (pageOffset >= total_count && total_count !== 0){
      return Promise.reject({status: 404, msg: "Not found"})
    }
    const page_count = {current_page: Number(p), total_pages: Math.ceil(total_count / Number(limit))}
    return [total_count, page_count]
  });
};

exports.removeArticle = (article_id) =>{
  return db.query(`
  DELETE FROM articles
  WHERE article_id = $1
  RETURNING *;
  `, [article_id])
  .then(({rows})=>{
    if (rows.length === 0){
      return Promise.reject({status:404, msg: "Not found"})
    }
  })
}
