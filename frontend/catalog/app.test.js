"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  createCatalogClient,
  bookPayloadFromEntries,
  actionErrorMessage,
  canManageGenres,
  initialCatalogView,
  storageKeys,
  ageRatings,
  bookStatuses
} = require("./app.js");

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
      return {
        ok: true,
        json: async () => url.endsWith("/books")
          ? { id: 4, code: "#ADS0004", status: "Disponível" }
          : { id: 4 }
      };
    }
  );

  const createdBook = await client.createBook("token", {
    title: "Livro",
    genre_id: 2,
    age_rating: "Livre"
  });
  await client.createGenre("token", "Fantasia");
  await client.updateGenre("token", 2, "Ficção");
  await client.deleteGenre("token", 2);

  assert.deepEqual(calls.map((call) => call.options.method), ["POST", "POST", "PATCH", "DELETE"]);
  assert.equal(calls[0].url, "https://catalog.example.test/books");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    title: "Livro",
    genre_id: 2,
    age_rating: "Livre"
  });
  assert.equal(createdBook.code, "#ADS0004");
  assert.equal(createdBook.status, "Disponível");
  assert.deepEqual(JSON.parse(calls[2].options.body), { genre_id: 2, name: "Ficção" });
  assert.equal(calls[3].options.headers.Authorization, "Bearer token");
});

test("book form payload trims text and converts numeric fields", () => {
  const payload = bookPayloadFromEntries([
    ["title", "  Duna  "],
    ["isbn", "  9781234567897 "],
    ["publication_year", "1965"],
    ["genre_id", "2"],
    ["age_rating", "12+"]
  ]);

  assert.deepEqual(payload, {
    title: "Duna",
    isbn: "9781234567897",
    publication_year: 1965,
    genre_id: 2,
    age_rating: "12+"
  });
  assert.equal("status" in payload, false);
  assert.equal("code" in payload, false);
});

test("book form payload omits optional ISBN and publication year", () => {
  const payload = bookPayloadFromEntries([
    ["title", "Livro"],
    ["isbn", ""],
    ["publication_year", ""],
    ["genre_id", "3"],
    ["age_rating", "Livre"]
  ]);

  assert.deepEqual(payload, {
    title: "Livro",
    genre_id: 3,
    age_rating: "Livre"
  });
});

test("book search sends all supported filters and omits empty ones", async () => {
  const calls = [];
  const client = createCatalogClient(
    { apiBaseUrl: "https://auth.example.test", catalogApiBaseUrl: "https://catalog.example.test" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => [] };
    }
  );

  const books = await client.listBooks("session-token", {
    code: "#ADS0001",
    title: "Dom Casmurro & Cia",
    genre_id: "2",
    status: "Disponível",
    unused: ""
  });

  assert.equal(
    calls[0].url,
    "https://catalog.example.test/books?code=%23ADS0001&title=Dom+Casmurro+%26+Cia&genre_id=2&status=Dispon%C3%ADvel"
  );
  assert.equal(calls[0].options.method, "GET");
  assert.deepEqual(books, []);
});

test("book form exposes native validation and accessible labels", () => {
  const html = readFileSync(path.join(__dirname, "index.html"), "utf8");

  assert.match(html, /<label for="book-title">Título/);
  assert.match(html, /id="book-title"[^>]*required/);
  assert.match(html, /id="book-isbn"[^>]*minlength="10"[^>]*maxlength="13"[^>]*pattern="\[A-Za-z0-9\]\{10,13\}"/);
  assert.match(html, /id="book-year"[^>]*type="number"[^>]*min="1000"/);
  assert.match(html, /<label for="book-genre">Gênero/);
  assert.match(html, /id="book-genre"[^>]*required/);
  assert.match(html, /<label for="book-age">Faixa etária/);
  assert.match(html, /id="book-age"[^>]*required/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /id="filter-code"[^>]*type="search"/);
  assert.match(html, /id="filter-title"[^>]*type="search"/);
  assert.match(html, /id="filter-genre"[^>]*name="genre_id"/);
  assert.match(html, /id="filter-status"[^>]*name="status"/);
  assert.match(html, /href="\.\.\/menu\/index\.html">Menu principal/);
});

test("catalog results use text rendering and a narrow-screen scroll container", () => {
  const app = readFileSync(path.join(__dirname, "app.js"), "utf8");
  const css = readFileSync(path.join(__dirname, "styles.css"), "utf8");

  assert.match(app, /function appendGenreOptions\(select, placeholder\)/);
  assert.match(app, /client\.listGenres\(token\)/);
  assert.match(app, /setStatus\(`Exemplar cadastrado com o código \$\{created\.code\}\.`, "success"\)/);
  assert.match(app, /setStatus\("Aguarde\.\.\.", "success"\)/);
  assert.match(app, /catch \(error\) \{\s*setStatus\(actionErrorMessage\(error\)\)/);
  assert.match(app, /emptyState\.hidden = books\.length > 0/);
  assert.match(app, /cell\.textContent = cellData\.value \|\| "—"/);
  assert.doesNotMatch(app, /\.innerHTML\s*=/);
  assert.match(css, /\.table-wrap\s*\{\s*overflow-x:\s*auto;/);
  assert.match(css, /@media \(max-width: 760px\)/);
});

test("book schema and API keep the code sequence backend-controlled", () => {
  const table = readFileSync(path.join(__dirname, "../../xano/table/book.xs"), "utf8");
  const createApi = readFileSync(path.join(__dirname, "../../xano/api/catalog/books_POST.xs"), "utf8");

  assert.match(table, /int id/);
  assert.match(table, /text\? code/);
  assert.match(table, /btree\|unique.*name: "code"/);
  assert.match(table, /int genre_id\s*\{\s*table = "genre"/);
  assert.match(createApi, /precondition \(\$book\.id <= 9999\)/);
  assert.match(createApi, /"#ADS%04d"\|sprintf:\$book\.id/);
  assert.match(createApi, /status: "Disponível"/);
  assert.doesNotMatch(createApi, /^\s*text\?? code\b/m);
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

test("catalog opens the requested task and protects the genres view by role", () => {
  assert.deepEqual(initialCatalogView("?view=create-view", "FUNCIONARIO"), {
    viewId: "create-view",
    accessDenied: false
  });
  assert.deepEqual(initialCatalogView("?view=search-view", "ADMIN"), {
    viewId: "search-view",
    accessDenied: false
  });
  assert.deepEqual(initialCatalogView("?view=genres-view", "ADMIN"), {
    viewId: "genres-view",
    accessDenied: false
  });
  assert.deepEqual(initialCatalogView("?view=genres-view", "FUNCIONARIO"), {
    viewId: "search-view",
    accessDenied: true
  });
  assert.deepEqual(initialCatalogView("?view=unknown", "ADMIN"), {
    viewId: "search-view",
    accessDenied: false
  });
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
