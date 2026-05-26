import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

const unique = Date.now();

describe("Auth API", () => {
  it("POST /api/v1/auth/register creates customer", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "E2E Test User",
        email: `e2e_${unique}@test.com`,
        mobile: String(unique).slice(-10).padStart(10, "9"),
        password: "Test@123456",
        role: "customer",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(`e2e_${unique}@test.com`);
  });

  it("POST /api/v1/auth/login rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: `e2e_${unique}@test.com`,
        password: "wrong-password",
      })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});
