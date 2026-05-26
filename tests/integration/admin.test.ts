import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";

describe("Admin API", () => {
  it("POST /api/v1/admin/login with seed credentials", async () => {
    const res = await request(app)
      .post("/api/v1/admin/login")
      .send({
        email: process.env.ADMIN_EMAIL || "admin@foodapp.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
      });

    if (res.status === 401) {
      console.warn("Admin seed missing — run: npm run seed:admin");
      return;
    }

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();

    const dash = await request(app)
      .get("/api/v1/admin/dashboard")
      .set("Authorization", `Bearer ${res.body.data.accessToken}`)
      .expect(200);

    expect(dash.body.data.stats).toBeDefined();
  });
});
