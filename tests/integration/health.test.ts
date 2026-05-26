import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Health & system", () => {
  it("GET /api/v1/health returns OK", async () => {
    const res = await request(app).get("/api/v1/health").expect(200);
    expect(res.body.status).toBe("OK");
    expect(res.body.service).toContain("Food App");
  });

  it("GET /api/v1/system/status returns phase info", async () => {
    const res = await request(app).get("/api/v1/system/status").expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.phase).toBeGreaterThanOrEqual(17);
    expect(res.body.data.mongodb).toBe("connected");
  });
});
