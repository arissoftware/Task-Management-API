import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";

describe("HTTP application", () => {
  it("returns a healthy status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
  });

  it("rejects malformed registration input before accessing the database", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ fullName: "J", email: "bad", password: "short" });
    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("protects task routes", async () => {
    const response = await request(app).get("/api/v1/tasks");
    expect(response.status).toBe(401);
  });
});
