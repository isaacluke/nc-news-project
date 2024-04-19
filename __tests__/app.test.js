const request = require("supertest");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const app = require("../app");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  describe("GET", () => {
    test("GET 200: Responds with all topics, each of which with the properties of slug and description", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
                slug: expect.any(String),
                description: expect.any(String)
            })
          });
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Accepts a body with a slug and description, and responds with the posted topic", () => {
      const testTopic = {
        slug: "test topic",
        description: "This is a test topic",
      };
      return request(app)
        .post("/api/topics")
        .send(testTopic)
        .expect(201)
        .then(({ body }) => {
          const { topic } = body;
          const expectedTopic = {
            slug: "test topic",
            description: "This is a test topic",
          };
          expect(topic).toMatchObject(expectedTopic);
        });
    });
    test("POST 400: Request body invalid format", () => {
      const testTopic = {
        invalid: "test topic",
        description: "This is a test topic",
      };
      return request(app)
        .post("/api/topics")
        .send(testTopic)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
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
  describe("GET", () => {
    test("GET 200: Responds with an array of articles with the appropriate properties", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBeGreaterThan(0);
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
  });
  describe("GET queries", () => {
    test("GET 200: Endpoint accepts a topic query, which responds with all articles with the specified topic value", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBeGreaterThan(0);
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
    test("GET 404: Topic not found", () => {
      return request(app)
        .get("/api/articles?topic=invalid")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("GET 400: Invalid query", () => {
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
    test("GET 400: Invalid sort_by column", () => {
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
        .get("/api/articles?sort_by=title&&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("title");
        });
    });
    test("GET 200: Order defaults to descending", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    test("GET 400: Invalid order request", () => {
      return request(app)
        .get("/api/articles?order=invalid")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Accepts an article object of the correct format, and responds with the newly added article with additional properties.", () => {
      const testArticle = {
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "This is a test article body.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(testArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          const expectedArticle = {
            article_id: 14,
            title: "Test Article",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a test article body.",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            votes: 0,
            comment_count: 0,
          };
          expect(article).toMatchObject(expectedArticle);
        });
    });
    test("POST 201: Defaults article_img_url if not provided", () => {
      const testArticle = {
        title: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "This is a test article body.",
      };
      return request(app)
        .post("/api/articles")
        .send(testArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          const expectedArticle = {
            article_id: 14,
            title: "Test Article",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a test article body.",
            created_at: expect.any(String),
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            votes: 0,
            comment_count: 0,
          };
          expect(article).toMatchObject(expectedArticle);
        });
    });
    test("POST 404: Author not found", () => {
      const testArticle = {
        title: "Test Article",
        topic: "mitch",
        author: "invalid",
        body: "This is a test article body.",
      };
      return request(app)
        .post("/api/articles")
        .send(testArticle)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("POST 404: Topic not found", () => {
      const testArticle = {
        title: "Test Article",
        topic: "invalid",
        author: "butter_bridge",
        body: "This is a test article body.",
      };
      return request(app)
        .post("/api/articles")
        .send(testArticle)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("POST 400: Request body of invalid format", () => {
      const testArticle = {
        invalid: "Test Article",
        topic: "mitch",
        author: "butter_bridge",
        body: "This is a test article body.",
      };
      return request(app)
        .post("/api/articles")
        .send(testArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("GET pagination", () => {
    test("GET 200: Responds with a total_count property that displays the total number of articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(13);
        });
    });
    test("GET 200: total_count property reacts to filters applied", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(12);
        });
    });
    test("GET 200: Endpoint accepts a limit query, which limits the number of responses according to its value", () => {
      return request(app)
        .get("/api/articles?limit=7")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(7);
        });
    });
    test("GET 200: Limit query doesn't affect the total_count property", () => {
      return request(app)
        .get("/api/articles?limit=4&&topic=mitch&&sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(12);
        });
    });
    test("GET 200: Limit query defaults to 10", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(10);
        });
    });
    test("GET 400: Invalid limit type received", () => {
      return request(app)
        .get("/api/articles?limit=invalid_type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Negative integer received", () => {
      return request(app)
        .get("/api/articles?limit=-1")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 200: Endpoint accepts a page query, which specifies the page at which to start", () => {
      return request(app)
        .get("/api/articles?p=3&&limit=4&&sort_by=article_id&&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(4);
          articles.forEach((article) => {
            expect(article.article_id).toBeWithin(9, 13);
          });
        });
    });
    test("GET 400: Invalid page type received", () => {
      return request(app)
        .get("/api/articles?p=invalid_type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Integer less than or equal to 0 received for page", () => {
      return request(app)
        .get("/api/articles?p=0")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 404: Page not found if p received is too large", () => {
      return request(app)
        .get("/api/articles?p=3")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("GET 200: Responds with a page_count property that displays the total number of pages and the current page", () => {
      return request(app)
        .get("/api/articles?limit=4&&p=2")
        .expect(200)
        .then(({ body }) => {
          const { page_count } = body;
          expect(page_count).toMatchObject({current_page: 2, total_pages: 4});
        });
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
            created_at: expect.any(String),
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
            created_at: expect.any(String),
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
            created_at: expect.any(String),
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
    test("PATCH 400: Invalid request body", () => {
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
    test("PATCH 400: Request body of incorrect type", () => {
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
  describe("DELETE", () => {
    test("DELETE 204: Deletes specified article and its respective comments", () => {
      return request(app).delete("/api/articles/1").expect(204);
    });
    test("DELETE 400: Invalid article_id type", () => {
      return request(app)
        .delete("/api/articles/invalid-type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("DELETE 404: article_id not found", () => {
      return request(app)
        .delete("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
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
          expect(comments.length).toBeGreaterThan(0);
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
    test("POST 404: Article not found", () => {
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
    test("POST 404: Username not found", () => {
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
  describe("GET pagination", () => {
    test("GET 200: Responds with a total_count property that displays the total number of comments", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { total_count } = body;
          expect(total_count).toBe(11);
        });
    });
    test("GET 200: Endpoint accepts limit query, which limits the number of responses according to its value", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=7")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(7);
        });
    });
    test("GET 200: Limit query defaults to 10", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(10);
        });
    });
    test("GET 400: Invalid query", () => {
      return request(app)
        .get("/api/articles/1/comments?invalid=7")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Invalid limit type received", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=invalid_type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Negative number received for limit", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=-1")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 200: Endpoint accepts page query, which specifies the page at which to start", () => {
      return request(app)
        .get("/api/articles/1/comments?p=3&&limit=5")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments[0]).toMatchObject({
            comment_id: 9,
            body: "Superficially charming",
            article_id: 1,
            author: "icellusedkars",
            votes: 0,
            created_at: "2020-01-01T03:08:00.000Z",
          });
        });
    });
    test("GET 400: Invalid page type received", () => {
      return request(app)
        .get("/api/articles/1/comments?p=invalid_type")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Integer less than or equal to 0 received for page", () => {
      return request(app)
        .get("/api/articles/1/comments?p=0")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 404: Page not found if p received is too large", () => {
      return request(app)
        .get("/api/articles/1/comments?p=3")
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
  describe("PATCH", () => {
    test("PATCH 200: Accepts a increment of votes and responds with the updated comment", () => {
      const testPatch = { inc_votes: 3 };
      return request(app)
        .patch("/api/comments/1")
        .send(testPatch)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          const testComment = {
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 19,
            author: "butter_bridge",
            article_id: 9,
            created_at: expect.any(String),
          };
          expect(comment).toMatchObject(testComment);
        });
    });
    test("PATCH 200: Accepts a negative number and decrements the comment's vote property", () => {
      const testPatch = { inc_votes: -10 };
      return request(app)
        .patch("/api/comments/1")
        .send(testPatch)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          const testComment = {
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 6,
            author: "butter_bridge",
            article_id: 9,
            created_at: expect.any(String),
          };
          expect(comment).toMatchObject(testComment);
        });
    });
    test("PATCH 400: Invalid comment_id type received", () => {
      const testPatch = { inc_votes: 3 };
      return request(app)
        .patch("/api/comments/invalid-type")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 404: comment_id not found", () => {
      const testPatch = { inc_votes: 3 };
      return request(app)
        .patch("/api/comments/999")
        .send(testPatch)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found");
        });
    });
    test("PATCH 400: Invalid request body", () => {
      const testPatch = { inc_votes: "invalid type" };
      return request(app)
        .patch("/api/comments/1")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: Request body of incorrect type", () => {
      const testPatch = { invalid: 3 };
      return request(app)
        .patch("/api/comments/1")
        .send(testPatch)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Bad request");
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

describe("/api/users:username", () => {
  test("GET 200: Responds with the user object of the specified username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        const { user } = body;
        expect(user).toMatchObject({
          username: "butter_bridge",
          name: "jonny",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
      });
  });
  test("GET 404: Username not found", () => {
    return request(app)
      .get("/api/users/invalid_username")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found");
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
