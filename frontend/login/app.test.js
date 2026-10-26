"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAuthClient,
  storeSession,
  clearSession,
  storageKeys
} = require("./app.js");

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    json: async () => body
  };
}

test("login sends matrícula and senha and returns only a valid operator session", async () => {
  let request;
  const client = createAuthClient(
    { apiBaseUrl: "https://library.example/api:group" },
    async (url, options) => {
      request = { url, options };
      return response(200, {
        authToken: "token-value",
        operator: {
          id: 7,
          matricula: "ADS0001",
          name: "Operador",
          role: "FUNCIONARIO"
        }
      });
    }
  );

  const result = await client.login("ADS0001", "password123");

  assert.equal(request.url, "https://library.example/api:group/auth/login");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(JSON.parse(request.options.body), {
    matricula: "ADS0001",
    password: "password123"
  });
  assert.equal(result.operator.role, "FUNCIONARIO");
});

test("login rejects API errors and malformed operator profiles", async () => {
  const rejectedClient = createAuthClient(
    { apiBaseUrl: "https://library.example/api:group" },
    async () => response(401, { message: "bad credentials" })
  );
  await assert.rejects(rejectedClient.login("ADS0001", "bad"), {
    message: "AUTHENTICATION_FAILED"
  });

  const malformedClient = createAuthClient(
    { apiBaseUrl: "https://library.example/api:group" },
    async () => response(200, {
      authToken: "token-value",
      operator: { id: 7, matricula: "ADS0001", name: "Operador", role: "admin" }
    })
  );
  await assert.rejects(malformedClient.login("ADS0001", "password123"), {
    message: "INVALID_API_RESPONSE"
  });
});

test("current operator request uses the Xano bearer token", async () => {
  let request;
  const client = createAuthClient(
    { apiBaseUrl: "https://library.example/api:group/" },
    async (url, options) => {
      request = { url, options };
      return response(200, {
        id: 7,
        matricula: "ADS0001",
        name: "Operador",
        role: "ADMIN"
      });
    }
  );

  const operator = await client.currentOperator("token-value");

  assert.equal(request.url, "https://library.example/api:group/auth/me");
  assert.equal(request.options.headers.Authorization, "Bearer token-value");
  assert.equal(operator.role, "ADMIN");
});

test("session storage contains token and public operator only and clears both", () => {
  const values = new Map();
  const storage = {
    setItem: (key, value) => values.set(key, value),
    getItem: (key) => values.get(key),
    removeItem: (key) => values.delete(key)
  };

  storeSession(storage, {
    authToken: "token-value",
    operator: { id: 7, matricula: "ADS0001", name: "Operador", role: "ADMIN" }
  });

  assert.equal(storage.getItem(storageKeys.token), "token-value");
  assert.equal(JSON.parse(storage.getItem(storageKeys.operator)).role, "ADMIN");
  assert.equal([...values.values()].some((value) => String(value).includes("password")), false);

  clearSession(storage);
  assert.equal(values.size, 0);
});
