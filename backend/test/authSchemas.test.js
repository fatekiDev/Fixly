import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "../src/schemas/authSchemas.js";

test("registration accepts a valid member account", () => {
  const result = registerSchema.safeParse({
    name: "Ana Miembro",
    email: "ana@fixly.cl",
    password: "una-clave-segura",
  });
  assert.equal(result.success, true);
});

test("registration rejects short and bcrypt-overflow passwords", () => {
  assert.equal(
    registerSchema.safeParse({
      name: "Ana",
      email: "ana@fixly.cl",
      password: "short",
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      name: "Ana",
      email: "ana@fixly.cl",
      password: "ñ".repeat(37),
    }).success,
    false,
  );
});

test("login rejects malformed emails and missing passwords", () => {
  assert.equal(loginSchema.safeParse({ email: "no-es-correo", password: "x" }).success, false);
});
