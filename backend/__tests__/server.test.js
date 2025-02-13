const request = require("supertest");
const app = require("../server"); // Import your Express app

describe("Backend API Endpoints", () => {
  
  // Test if the server is running
  test("GET / should return a welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello! Backend is running!");
  });

  // Test token verification route (without a token)
  test("POST /verify-token should return 400 if no token is provided", async () => {
    const res = await request(app).post("/verify-token");
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Test fetching books (should return only published books)
  test("GET /books should return an array", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test fetching an invalid book ID
  test("GET /books/nonexistent should return 404", async () => {
    const res = await request(app).get("/books/nonexistent");
    expect(res.statusCode).toBe(404);
  });

});
