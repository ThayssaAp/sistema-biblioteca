"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { createDashboardClient, normalizeDashboard } = require("./app.js");

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

test("dashboard client sends bearer token to auth and dashboard endpoints", async () => {
  const requests = [];
  const client = createDashboardClient(
    { apiBaseUrl: "https://library.example/api/" },
    async (url, options) => {
      requests.push({ url, options });
      if (url.endsWith("/auth/me")) {
        return response(200, { id: 8, matricula: "ADS0008", name: "Admin", role: "ADMIN" });
      }
      return response(200, {
        total_readers: 12,
        readers_with_active_loans: 4,
        available_books: 30,
        borrowed_books: 8,
        overdue_loans: 2,
        pending_fines: 3
      });
    }
  );

  await client.currentOperator("session-token");
  const data = await client.dashboard("session-token");
  assert.equal(requests[0].url, "https://library.example/api/auth/me");
  assert.equal(requests[1].url, "https://library.example/api/admin/dashboard");
  assert.equal(requests[1].options.headers.Authorization, "Bearer session-token");
  assert.equal(data.total_readers, 12);
});

test("dashboard client rejects unauthorized sessions and malformed responses", async () => {
  const unauthorized = createDashboardClient(
    { apiBaseUrl: "https://library.example/api" },
    async () => response(403, { message: "Acesso negado" })
  );
  await assert.rejects(unauthorized.dashboard("token"), { message: "SESSION_INVALID" });

  assert.throws(() => normalizeDashboard({}), { message: "INVALID_DASHBOARD_RESPONSE" });
  assert.throws(() => normalizeDashboard(null), { message: "INVALID_DASHBOARD_RESPONSE" });
});

test("dashboard normalizes zero values and preserves all six indicators", () => {
  const data = normalizeDashboard({
    total_readers: 0,
    readers_with_active_loans: 0,
    available_books: 0,
    borrowed_books: 0,
    overdue_loans: 0,
    pending_fines: 0
  });
  assert.deepEqual(data, {
    total_readers: 0,
    readers_with_active_loans: 0,
    available_books: 0,
    borrowed_books: 0,
    overdue_loans: 0,
    pending_fines: 0
  });
});

test("dashboard page exposes six accessible metric cards and retry state", () => {
  const html = readFileSync(path.join(__dirname, "index.html"), "utf8");
  assert.match(html, /<section id="dashboard-content" class="metrics-grid"/);
  assert.match(html, /Leitores cadastrados/);
  assert.match(html, /Leitores com empréstimos ativos/);
  assert.match(html, /Livros disponíveis/);
  assert.match(html, /Livros emprestados/);
  assert.match(html, /Empréstimos em atraso/);
  assert.match(html, /Multas pendentes/);
  assert.match(html, /id="retry-button"/);
  assert.match(html, /role="status" aria-live="polite"/);
});
