import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

async function databaseReachable(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

const dbReady = await databaseReachable();
const testEmail = `auth-test-${Date.now()}@example.com`;
const password = "password123";

describe("auth API", { skip: !dbReady }, () => {
  const app = createApp();
  let userAccessToken = "";

  before(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: "admin-auth-test@example.com" } });
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: "admin-auth-test@example.com" } });
    await prisma.$disconnect();
  });

  it("registers a user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: testEmail,
      password,
      firstName: "Test",
      lastName: "User",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.accessToken);
    assert.equal(res.body.user.email, testEmail);
    assert.equal(res.body.user.role, "USER");
    userAccessToken = res.body.accessToken as string;
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: testEmail,
      password,
      firstName: "Test",
      lastName: "User",
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
  });

  it("logs in with correct password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password,
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
    userAccessToken = res.body.accessToken as string;
  });

  it("rejects wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: "wrong-password",
    });
    assert.equal(res.status, 401);
  });

  it("rejects /me without token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    assert.equal(res.status, 401);
  });

  it("returns /me with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${userAccessToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, testEmail);
    assert.equal(res.body.user.firstName, "Test");
  });

  it("USER cannot access admin overview", async () => {
    const res = await request(app)
      .get("/api/v1/admin/overview")
      .set("Authorization", `Bearer ${userAccessToken}`);
    assert.equal(res.status, 403);
  });

  it("ADMIN can access admin overview", async () => {
    const admin = await prisma.user.create({
      data: {
        email: "admin-auth-test@example.com",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
        role: "ADMIN",
        firstName: "Admin",
        lastName: "User",
        isActive: true,
      },
    });
    const { signAccessToken } = await import("../lib/tokens.js");
    const adminAccessToken = await signAccessToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const res = await request(app)
      .get("/api/v1/admin/overview")
      .set("Authorization", `Bearer ${adminAccessToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.stats);
  });
});
