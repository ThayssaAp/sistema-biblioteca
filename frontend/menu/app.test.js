"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { createMenuClient, getMenuSections, resolveMenuView } = require("./app.js");

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

test("menu session validation uses auth/me and the current bearer token", async () => {
  let request;
  const client = createMenuClient(
    { apiBaseUrl: "https://library.example/api/" },
    async (url, options) => {
      request = { url, options };
      return response(200, {
        id: 8,
        matricula: "ADS0008",
        name: "Admin",
        role: "ADMIN"
      });
    }
  );

  const operator = await client.currentOperator("session-token");

  assert.equal(request.url, "https://library.example/api/auth/me");
  assert.equal(request.options.method, "GET");
  assert.equal(request.options.headers.Authorization, "Bearer session-token");
  assert.equal(operator.role, "ADMIN");
});

test("menu validation rejects expired sessions and unrecognized profiles", async () => {
  const expiredClient = createMenuClient(
    { apiBaseUrl: "https://library.example/api" },
    async () => response(401, {})
  );
  await assert.rejects(expiredClient.currentOperator("expired"), { message: "SESSION_INVALID" });

  const invalidRoleClient = createMenuClient(
    { apiBaseUrl: "https://library.example/api" },
    async () => response(200, { id: 1, matricula: "123", name: "Leitor", role: "LEITOR" })
  );
  await assert.rejects(invalidRoleClient.currentOperator("token"), { message: "INVALID_OPERATOR" });
});

test("employee menu includes shared tasks without administrator or reader portal options", () => {
  const sections = getMenuSections("FUNCIONARIO");
  const titles = sections.flatMap((section) => section.items.map((item) => item.title));
  const items = sections.flatMap((section) => section.items);

  assert.deepEqual(sections.map((section) => section.title), ["Sistema principal"]);
  assert.ok(titles.includes("Cadastrar livro"));
  assert.ok(titles.includes("Consultar livros"));
  assert.ok(titles.includes("Cadastrar leitor"));
  assert.ok(titles.includes("Consultar leitores"));
  assert.ok(titles.includes("Empréstimos"));
  assert.ok(titles.includes("Multas"));
  assert.equal(titles.includes("Gêneros"), false);
  assert.equal(titles.includes("Dashboard"), false);
  assert.equal(titles.some((title) => title.includes("Portal do Leitor")), false);
  assert.equal(items.find((item) => item.title === "Cadastrar livro").href, "../catalog/index.html?view=create-view");
  assert.equal(items.find((item) => item.title === "Consultar livros").href, "../catalog/index.html?view=search-view");
  assert.equal(items.find((item) => item.title === "Cadastrar leitor").href, "../leitores/cadastro.html");
  assert.equal(items.find((item) => item.title === "Consultar leitores").href, "../leitores/consulta.html");
  assert.equal(items.find((item) => item.title === "Empréstimos").href, "../emprestimos/index.html?view=loans");
  assert.equal(items.find((item) => item.title === "Multas").href, "../emprestimos/index.html?view=fines");
});

test("admin menu includes shared tasks and exclusive administrator options", () => {
  const sections = getMenuSections("ADMIN");
  const titles = sections.flatMap((section) => section.items.map((item) => item.title));

  assert.deepEqual(sections.map((section) => section.title), [
    "Sistema principal",
    "Área do administrador"
  ]);
  assert.ok(titles.includes("Gêneros"));
  assert.ok(titles.includes("Exclusão de livro"));
  assert.ok(titles.includes("Dashboard"));
  assert.equal(titles.some((title) => title.includes("Portal do Leitor")), false);
  const adminItems = sections[1].items;
  assert.equal(adminItems.find((item) => item.title === "Gêneros").href, "../catalog/index.html?view=genres-view");
  assert.equal(adminItems.find((item) => item.title === "Dashboard").href, "./index.html?view=dashboard");
});

test("placeholder routes enforce administrator access", () => {
  assert.equal(resolveMenuView("dashboard", "FUNCIONARIO").type, "menu");
  assert.match(resolveMenuView("dashboard", "FUNCIONARIO").message, /somente para Admin/);
  assert.equal(resolveMenuView("dashboard", "ADMIN").type, "placeholder");
  assert.equal(resolveMenuView("unknown", "ADMIN").type, "menu");
  assert.match(resolveMenuView("reader-portal", "ADMIN").message, /não está disponível/);
});

test("remaining future tasks have informational placeholders and a return path", () => {
  const expected = {
    "book-deletion": "Exclusão de livro",
    dashboard: "Dashboard"
  };
  const client = createMenuClient(
    { apiBaseUrl: "https://library.example/api" },
    async () => response(200, {
      id: 8,
      matricula: "ADS0008",
      name: "Admin",
      role: "ADMIN"
    })
  );
  const html = readFileSync(path.join(__dirname, "index.html"), "utf8");
  const app = readFileSync(path.join(__dirname, "app.js"), "utf8");

  assert.deepEqual(Object.keys(client), ["currentOperator"]);
  for (const [view, title] of Object.entries(expected)) {
    assert.equal(resolveMenuView(view, "ADMIN").title, title);
  }
  assert.match(html, /Em breve — esta funcionalidade está em construção/);
  assert.match(html, /href="\.\/index\.html">Voltar ao menu principal/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(app, /badge\.textContent = "Em breve"/);
});
