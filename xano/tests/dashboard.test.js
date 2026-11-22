"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const endpoint = readFileSync(
  path.join(__dirname, "..", "api", "members_accounts", "admin", "dashboard_GET.xs"),
  "utf8"
);

test("dashboard endpoint is authenticated and restricted to Admin", () => {
  assert.match(endpoint, /auth = "user"/);
  assert.match(endpoint, /required_role: "ADMIN"/);
  assert.match(endpoint, /admin_user\.active != false/);
});

test("dashboard endpoint aggregates the six domain indicators", () => {
  assert.match(endpoint, /db\.query reader/);
  assert.match(endpoint, /readers_with_active_loans/);
  assert.match(endpoint, /available_books/);
  assert.match(endpoint, /borrowed_books/);
  assert.match(endpoint, /overdue_loans/);
  assert.match(endpoint, /pending_fines/);
});

test("dashboard excludes retired books and overdue active loans", () => {
  assert.match(endpoint, /\$db\.book\.deleted_at == null/);
  assert.match(endpoint, /\$db\.loan\.status == "Ativo" && \$db\.loan\.due_at < now/);
});

test("dashboard response has only aggregate numeric fields", () => {
  const numericFields = [
    "total_readers",
    "readers_with_active_loans",
    "available_books",
    "borrowed_books",
    "overdue_loans",
    "pending_fines"
  ];
  for (const field of numericFields) {
    assert.match(endpoint, new RegExp(`${field}: \\$`));
  }
  const responseBlock = endpoint.slice(endpoint.indexOf("response = {"));
  assert.doesNotMatch(responseBlock, /\bcpf\b|\bname\b|\bemail\b|\baddress\b|\bbook_title\b|\breader_name\b/i);
});
