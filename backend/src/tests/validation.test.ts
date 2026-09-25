import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loginSchema, registerSchema } from "../lib/validation.js";

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    });
    assert.equal(result.success, true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
    });
    assert.equal(result.success, false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short",
      firstName: "Jane",
      lastName: "Doe",
    });
    assert.equal(result.success, false);
  });

  it("rejects self-assigned role", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      role: "ADMIN",
    });
    assert.equal(result.success, false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "x",
    });
    assert.equal(result.success, true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad",
      password: "x",
    });
    assert.equal(result.success, false);
  });
});
