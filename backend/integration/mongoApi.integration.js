import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { after, before, test } from "node:test";
import { createApp } from "../src/app.js";
import { Alert } from "../src/models/Alert.js";
import { User } from "../src/models/User.js";

const mongoUri =
  process.env.MONGODB_TEST_URI || "mongodb://127.0.0.1:27017/fixly_test";
const emailSuffix = randomBytes(8).toString("hex");
const createdUserIds = [];
const createdAlertIds = [];
let server;
let baseUrl;

before(async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const app = createApp({
    clientOrigins: [],
    jwtSecret: randomBytes(48).toString("hex"),
    jwtExpiresIn: "5m",
  });
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
  await Alert.deleteMany({ _id: { $in: createdAlertIds } });
  await User.deleteMany({ _id: { $in: createdUserIds } });
  await mongoose.disconnect();
});

async function api(path, { method = "GET", token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

async function createPrivilegedUser(role, area) {
  const user = await User.create({
    name: `Integration ${role}`,
    email: `${role}-${area?.toLowerCase() || "default"}-${emailSuffix}@fixly.test`,
    passwordHash: "Integration-password-123!",
    role,
    ...(area ? { area } : {}),
  });
  createdUserIds.push(user.id);
  return user;
}

async function signIn(email, password = "Integration-password-123!") {
  const response = await api("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  assert.equal(response.status, 200);
  return response.data.token;
}

test("MongoDB-backed auth, permissions, alert workflow, and points", async () => {
  const health = await api("/api/health");
  assert.equal(health.status, 200);
  assert.deepEqual(health.data, { status: "ok", database: "connected" });

  const memberEmail = `member-${emailSuffix}@fixly.test`;
  const registration = await api("/api/auth/register", {
    method: "POST",
    body: {
      name: "Integration Member",
      email: memberEmail,
      password: "Integration-password-123!",
      role: "admin",
    },
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.data.user.role, "member");
  assert.equal("passwordHash" in registration.data.user, false);

  const memberId = registration.data.user.id;
  createdUserIds.push(memberId);
  const memberToken = registration.data.token;
  const manager = await createPrivilegedUser("manager", "Mantenimiento");
  const otherAreaManager = await createPrivilegedUser("manager", "Aseo");
  const admin = await createPrivilegedUser("admin");
  const managerToken = await signIn(manager.email);
  const otherAreaToken = await signIn(otherAreaManager.email);
  const adminToken = await signIn(admin.email);

  const memberProfile = await api("/api/auth/me", { token: memberToken });
  assert.equal(memberProfile.status, 200);
  assert.equal(memberProfile.data.user.id, memberId);

  const createdAlert = await api("/api/alerts", {
    method: "POST",
    token: memberToken,
    body: {
      title: "Integration water leak",
      description: "Water is leaking under the sink in the laboratory.",
      area: "Mantenimiento",
      urgency: "high",
      location: "Laboratory 1",
      building: "Building A",
    },
  });
  assert.equal(createdAlert.status, 201);
  assert.equal(createdAlert.data.alert.status, "new");
  assert.equal(createdAlert.data.alert.moderationStatus, "pending");
  assert.equal(createdAlert.data.alert.reporterId, memberId);
  createdAlertIds.push(createdAlert.data.alert.id);
  const alertId = createdAlert.data.alert.id;

  const forbiddenAccept = await api(`/api/alerts/${alertId}/accept`, {
    method: "POST",
    token: memberToken,
  });
  assert.equal(forbiddenAccept.status, 403);

  const wrongAreaAccept = await api(`/api/alerts/${alertId}/accept`, {
    method: "POST",
    token: otherAreaToken,
  });
  assert.equal(wrongAreaAccept.status, 403);

  const accepted = await api(`/api/alerts/${alertId}/accept`, {
    method: "POST",
    token: managerToken,
  });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.data.alert.managerId, manager.id);

  const resolved = await api(`/api/alerts/${alertId}/resolve`, {
    method: "POST",
    token: managerToken,
    body: { evidenceUrl: "https://example.test/evidence.jpg" },
  });
  assert.equal(resolved.status, 200);
  assert.equal(resolved.data.alert.status, "awaiting_review");

  const closures = await api("/api/alerts/closures/pending", { token: adminToken });
  assert.equal(closures.status, 200);
  assert.ok(closures.data.alerts.some((alert) => alert.id === alertId));

  const reviewed = await api(`/api/alerts/${alertId}/review`, {
    method: "POST",
    token: adminToken,
    body: { approved: true },
  });
  assert.equal(reviewed.status, 200);
  assert.equal(reviewed.data.alert.status, "approved");

  const points = await api(`/api/alerts/points/${memberId}`, { token: memberToken });
  assert.equal(points.status, 200);
  assert.equal(points.data.points, 100);
});
