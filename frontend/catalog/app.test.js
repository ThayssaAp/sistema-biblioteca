"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createCatalogClient, actionErrorMessage, canManageGenres, storageKeys, ageRatings, bookStatuses } = require("./app.js");

test("catalog requests send bearer token and request the books endpoint", async () => {
  const calls = [];
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test/v1/", catalogApiBaseUrl: "https://catalog.example.test/v1/" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => [] };
    }
  );

  await client.listBooks("session-token", { title: "Duna", status: "Disponível" });

  assert.equal(calls[0].url, "https://catalog.example.test/v1/books?title=Duna&status=Dispon%C3%ADvel");
  assert.equal(calls[0].options.method, "GET");
  assert.equal(calls[0].options.headers.Authorization, "Bearer session-token");
});

test("catalog client requests the authenticated genre list", async () => {
  const calls = [];
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => [{ id: 2, name: "Fantasia" }] };
    }
  );

  const genres = await client.listGenres("session-token");

  assert.equal(calls[0].url, "https://catalog.example.test/genres");
  assert.equal(calls[0].options.method, "GET");
  assert.equal(calls[0].options.headers.Authorization, "Bearer session-token");
  assert.deepEqual(genres, [{ id: 2, name: "Fantasia" }]);
});

test("session validation uses the existing authentication API group", async () => {
  const calls = [];
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test/v1", catalogApiBaseUrl: "https://catalog.example.test/v1" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ id: 1, name: "Operador", role: "FUNCIONARIO" }) };
    }
  );

  await client.currentOperator("session-token");

  assert.equal(calls[0].url, "https://auth.example.test/v1/auth/me");
  assert.equal(calls[0].options.headers.Authorization, "Bearer session-token");
});

test("catalog client sends create and genre mutation payloads", async () => {
  const calls = [];
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ id: 4 }) };
    }
  );

  await client.createBook("token", { title: "Livro", genre_id: 2 });
  await client.createGenre("token", "Fantasia");
  await client.updateGenre("token", 2, "Ficção");
  await client.deleteGenre("token", 2);

  assert.deepEqual(calls.map((call) => call.options.method), ["POST", "POST", "PATCH", "DELETE"]);
  assert.equal(calls[0].url, "https://catalog.example.test/books");
  assert.deepEqual(JSON.parse(calls[0].options.body), { title: "Livro", genre_id: 2 });
  assert.deepEqual(JSON.parse(calls[2].options.body), { genre_id: 2, name: "Ficção" });
  assert.equal(calls[3].options.headers.Authorization, "Bearer token");
});

test("catalog client rejects failed API requests", async () => {
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async () => ({ ok: false, json: async () => ({ error: "details not shown" }) })
  );

  await assert.rejects(client.listGenres("token"), { message: "CATALOG_REQUEST_FAILED" });
});

test("catalog client identifies attempts to delete a genre used by books", async () => {
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async () => ({
      ok: false,
      status: 403,
      json: async () => ({ message: "Não é possível remover um gênero associado a exemplares." })
    })
  );

  await assert.rejects(client.deleteGenre("token", 2), { message: "GENRE_IN_USE" });
});

test("catalog client identifies duplicate genre names", async () => {
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async () => ({
      ok: false,
      status: 400,
      json: async () => ({ message: "Já existe um gênero com esse nome." })
    })
  );

  await assert.rejects(client.createGenre("token", "teste generos 2026-11-08"), {
    message: "GENRE_DUPLICATE"
  });
});

test("catalog UI maps genre-specific and generic failures to text messages", () => {
  assert.equal(
    actionErrorMessage(new Error("GENRE_IN_USE")),
    "Não é possível remover um gênero que está associado a exemplares."
  );
  assert.equal(
    actionErrorMessage(new Error("GENRE_DUPLICATE")),
    "Já existe um gênero com esse nome."
  );
  assert.equal(
    actionErrorMessage(new Error("CATALOG_REQUEST_FAILED")),
    "Não foi possível concluir a operação. Verifique os dados e tente novamente."
  );
});

test("genre management is restricted to administrators", () => {
  assert.equal(canManageGenres("ADMIN"), true);
  assert.equal(canManageGenres("FUNCIONARIO"), false);
  assert.equal(canManageGenres(undefined), false);
});

test("catalog client identifies an expired authentication session", async () => {
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async () => ({ ok: false, status: 401, json: async () => ({ error: "unauthorized" }) })
  );

  await assert.rejects(client.currentOperator("expired-token"), { message: "UNAUTHORIZED" });
});

test("catalog session uses sessionStorage keys and domain choices", () => {
  assert.equal(storageKeys.token, "biblioteca.authToken");
  assert.equal(storageKeys.operator, "biblioteca.operator");
  assert.deepEqual(ageRatings, ["Livre", "10+", "12+", "14+", "16+", "18+", "Não informada"]);
  assert.deepEqual(bookStatuses, ["Disponível", "Emprestado"]);
});

test("catalog client requires a separate catalog API group URL", () => {
  assert.throws(
    () => createCatalogClient({ apiBaseUrl: "https://auth.example.test" }, async () => {}),
    { message: "API_BASE_URL_REQUIRED" }
  );
});
