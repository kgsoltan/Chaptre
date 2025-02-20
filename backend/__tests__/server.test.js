const request = require('supertest');
const app = require('../server');

describe("Backend Endpoints", () => {
  // Test the root endpoint
  test("GET / should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello! Backend is running!");
  });

  // Test the S3 endpoint
  describe("S3 Endpoints", () => {
    test("GET /s3Url should return a signed URL object", async () => {
      const res = await request(app).get("/s3Url");
      expect(res.statusCode).toBe(200);
      // The response should have a 'url' property that is an object
      expect(res.body).toHaveProperty("url");
      expect(typeof res.body.url).toBe("object");
      // The URL object should contain uploadURL and imageName properties
      expect(res.body.url).toHaveProperty("uploadURL");
      expect(res.body.url).toHaveProperty("imageName");
    });
  });

  // Test the authors endpoints
  describe("Authors Endpoints", () => {
    test("GET /authors should return an array", async () => {
      const res = await request(app).get("/authors");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("PATCH /authors/:authorId/profile_pic_url returns 400 when missing profilePicUrl", async () => {
      // Here we use a dummy authorId "test-author"
      const res = await request(app)
        .patch("/authors/test-author/profile_pic_url")
        .send({}); // no profilePicUrl in body
      expect(res.statusCode).toBe(400);
    });
  });

  // Test the books endpoints
  describe("Books Endpoints", () => {
    test("GET /books should return an array", async () => {
      const res = await request(app).get("/books");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
