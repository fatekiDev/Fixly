import test from "node:test";
import assert from "node:assert/strict";
import { closureUpdate, moderationUpdate } from "../src/domain/alertWorkflow.js";

test("admin approval publishes a pending alert", () => {
  assert.deepEqual(
    moderationUpdate({ moderationStatus: "pending", status: "new" }, true),
    { moderationStatus: "approved", status: "new" },
  );
});

test("admin rejection declines a pending alert", () => {
  assert.deepEqual(
    moderationUpdate({ moderationStatus: "pending", status: "new" }, false),
    { moderationStatus: "declined", status: "declined" },
  );
});

test("moderation cannot be repeated", () => {
  assert.throws(
    () => moderationUpdate({ moderationStatus: "approved", status: "new" }, true),
    { status: 409 },
  );
});

test("approved closure moves to the approved state", () => {
  assert.deepEqual(
    closureUpdate({ status: "awaiting_review" }, true),
    { status: "approved" },
  );
});

test("rejected closure returns to manager work", () => {
  assert.deepEqual(
    closureUpdate({ status: "awaiting_review" }, false),
    { status: "in_progress" },
  );
});

test("closure review cannot be repeated", () => {
  assert.throws(
    () => closureUpdate({ status: "approved" }, true),
    { status: 409 },
  );
});
