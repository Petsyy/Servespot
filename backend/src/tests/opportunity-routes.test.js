import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import app from "../../app.js";

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe("Opportunity route contract", () => {
  it("returns health ok", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.ok, true);
  });

  it("validates canonical detail route IDs", async () => {
    const response = await fetch(`${baseUrl}/api/opportunities/not-a-valid-id`);

    assert.equal(response.status, 400);
  });

  it("returns 410 for deprecated legacy route", async () => {
    const response = await fetch(`${baseUrl}/api/opportunities/all`);
    const body = await response.json();

    assert.equal(response.status, 410);
    assert.equal(typeof body.replacement, "string");
  });
});
