import request from "supertest";
import app from "../app.js";
import { query } from "../config/db.js";

describe("Auth Controller", () => {
  beforeEach(async () => {
    await query("DELETE FROM users");
  });

  test("Register new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("userId");
  });
});
