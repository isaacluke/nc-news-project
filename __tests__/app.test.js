const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const app = require("../app");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET 200: Responds with all topics, each of which with the properties of slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});

describe("/api", () => {
  test("GET 200: Responds with a description of all other endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("/api/articles", () => {
  test("GET 200: Responds with an array of articles with the appropriate properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("GET 200: The articles should be sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("GET 200: Endpoint accepts a topic query, which responds with all articles with the specified topic value", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles.length).toBe(12);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: "mitch",
            author: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("GET 200: Responds with an empty array when a valid topic has no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(0);
      });
  });
  test("GET 404: topic not found", () => {
    return request(app)
      .get("/api/articles?topic=invalid")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
      });
  });
  test("GET 400: invalid query", () => {
    return request(app)
      .get("/api/articles?invalid=mitch")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
  test("GET 200: Endpoint accepts a sort_by query, which responds with the articles sorted by specified column", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("comment_count", { descending: true });
      });
  });
  test("GET 400: invalid sort_by column", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
  test("GET 200: Endpoint accepts a order query, which responds with the articles ordered by specified asc or desc", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("created_at");
      });
  });
  test("GET 200: order defaults to descending", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("GET 400: invalid order request", () => {
    return request(app)
      .get("/api/articles?order=invalid")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad request");
      });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: Responds with an object with the articles properties", () => {
      return request(app)
        .get("/api/articles/6")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          const testArticle = {
            article_id: 6,
            title: "A",
            topic: "mitch",
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            created_at: "2020-10-18T01:00:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(testArticle);
        });
    });
    test("GET 400: Invalid article_id type received", () => {
      return request(app)
        .get("/api/articles/invalid-input")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 404: article_id not found", () => {
      return request(app)
        .get("/api/articles/10000")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("GET 200: Responds with an article object that now also includes comment_count", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article.comment_count).toBe(11);
        });
    });
  });
  describe("PATCH", () => {
    test("PATCH 200: Accepts a increment of votes and responds with the updated article", () => {
      const testPatch = { inc_votes: 20 };
      return request(app)
        .patch("/api/articles/1")
        .send(testPatch)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          const testArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 120,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(testArticle);
        });
    });
    test("PATCH 200: Accepts a negative number and decrements the articles vote property", () => {
      const testPatch = { inc_votes: -20 };
      return request(app)
        .patch("/api/articles/1")
        .send(testPatch)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          const testArticle = {
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 80,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          };
          expect(article).toMatchObject(testArticle);
        });
    });
    test("PATCH 400: Invalid article_id type received", () => {
      const testPatch = { inc_votes: 20 };
      return request(app)
        .patch("/api/articles/invalid-type")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 404: article_id not found", () => {
      const testPatch = { inc_votes: 20 };
      return request(app)
        .patch("/api/articles/999")
        .send(testPatch)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("PATCH 400: invalid request body", () => {
      const testPatch = { inc_votes: "invalid type" };
      return request(app)
        .patch("/api/articles/1")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: request body of incorrect type", () => {
      const testPatch = { invalid: 20 };
      return request(app)
        .patch("/api/articles/1")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: Responds with an array of comments for the given article with the appropriate properties", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(11);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        });
    });
    test("GET 200: Responds with an empty array when an article has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(0);
        });
    });
    test("GET 200: Comments should be served by order of most recent to oldest", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 400: Invalid article_id type received", () => {
      return request(app)
        .get("/api/articles/invalid-input/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 404: article_id not found", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Accepts an object with a username and body, and responds with a posted comment", () => {
      const testComment = {
        username: "butter_bridge",
        body: "This is a test comment",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(testComment)
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          const expectedComment = {
            comment_id: 19,
            body: "This is a test comment",
            votes: 0,
            author: "butter_bridge",
            article_id: 2,
            created_at: expect.any(String),
          };
          expect(comment).toMatchObject(expectedComment);
        });
    });
    test("POST 400: Invalid article_id type received", () => {
      const testComment = {
        username: "butter_bridge",
        body: "This is a test comment",
      };
      return request(app)
        .post("/api/articles/invalid-input/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 404: article not found", () => {
      const testComment = {
        username: "butter_bridge",
        body: "This is a test comment",
      };
      return request(app)
        .post("/api/articles/100/comments")
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("POST 400: Invalid comment request received", () => {
      const testComment = {
        invalid: "butter_bridge",
        body: "This is a test comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 404: username not found", () => {
      const testComment = {
        username: "invalid",
        body: "This is a test comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("DELETE 204: Deletes specified comment and responds with 204 and no content", () => {
      return request(app).delete("/api/comments/3").expect(204);
    });
    test("DELETE 400: Invalid comment_id type", () => {
      return request(app)
        .delete("/api/comments/invalid-type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("DELETE 404: comment_id not found", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
  });
});

describe("/api/users", () => {
  test("GET 200: Responds with an array of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("/*", () => {
  test("ALL 404: Responds with a path not found when an incorrect path is invalid", () => {
    return request(app)
      .get("/invalid")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Path not found");
      });
  });
});
