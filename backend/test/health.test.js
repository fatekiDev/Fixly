import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

test("liveness endpoint works without a database connection", async () => {
  const app = createApp({
    clientOrigins: ["http://localhost:8081"],
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health/live`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });

    const readiness = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    assert.equal(readiness.status, 503);
    assert.deepEqual(await readiness.json(), {
      status: "unavailable",
      database: "disconnected",
    });
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("root endpoint identifies the API", async () => {
  const app = createApp({
    clientOrigins: ["http://localhost:8081"],
  });
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      name: "Fixly API",
      status: "running",
      health: "/api/health",
      live: "/api/health/live",
    });
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
