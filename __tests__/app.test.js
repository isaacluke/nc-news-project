const request = require("supertest")
const seed = require("../db/seeds/seed")
const db = require("../db/connection")
const app = require('../app')
const data = require('../db/data/test-data')

beforeEach(()=>seed(data))
afterAll(()=>db.end())

describe("/api/topics",()=>{
    test("GET 200: Responds with all topics, each of which with the properties of slug and description",()=>{
        return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({body})=>{
            const {topics} = body
            expect(topics.length).toBe(3)
            topics.forEach((topic)=>{
                expect(typeof topic.description).toBe('string')
                expect(typeof topic.slug).toBe('string')
            })
        })
    })
})

describe("/*",()=>{
    test("ALL 404: Responds with a path not found when an incorrect path is invalid",()=>{
        return request(app)
        .get("/invalid")
        .expect(404)
        .then(({body})=>{
            const {msg} = body
            expect(msg).toBe("Path not found")
        })
    })
})