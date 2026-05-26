import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Search APIs", () => {
  it("GET /api/v1/search requires q", async () => {
    await request(app).get("/api/v1/search").expect(400);
  });

  it("GET /api/v1/search?q=biryani returns search payload", async () => {
    const res = await request(app).get("/api/v1/search").query({ q: "biryani" }).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.search).toBeDefined();
    expect(Array.isArray(res.body.data.search.restaurants)).toBe(true);
    expect(Array.isArray(res.body.data.search.foods)).toBe(true);
  });

  it("GET /api/v1/search/trending returns array", async () => {
    const res = await request(app).get("/api/v1/search/trending").expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.trending)).toBe(true);
  });
});
