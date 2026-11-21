"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  createOperatorsClient,
  normalizeCpf,
  isValidPassword,
  operatorPayload
} = require("./app.js");

test("operator payload normalizes CPF and required fields", () => {
  assert.deepEqual(operatorPayload([
    ["matricula", "  ADM001  "],
    ["name", "  Maria Silva  "],
    ["cpf", "529.982.247-25"],
    ["address", " Rua Central  "],
    ["phone", "(61) 99999-0000"],
    ["email", ""],
    ["password", "Senha123"],
    ["role", "ADMIN"]
  ]), {
    matricula: "ADM001",
    name: "Maria Silva",
    cpf: "52998224725",
    address: "Rua Central",
    phone: "(61) 99999-0000",
    password: "Senha123",
    role: "ADMIN"
  });
});

test("operator CPF and password validation reject weak values", () => {
  assert.equal(normalizeCpf("529.982.247-25"), "52998224725");
  assert.equal(isValidPassword("Senha123"), true);
  assert.equal(isValidPassword("senha"), false);
  assert.equal(isValidPassword("12345678"), false);
});

test("operators client sends authenticated CRUD and lifecycle requests", async () => {
  const calls = [];
  const client = createOperatorsClient(
    { apiBaseUrl: "https://auth.example.test" },
    async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => url.includes("/admin/operators") && options.method === "GET"
        ? { items: [], total: 0, page: 1, per_page: 20 }
        : { id: 10, role: "FUNCIONARIO" } };
    }
  );

  await client.list("token", { page: 1, per_page: 20 });
  await client.create("token", { matricula: "F001", name: "Ana", cpf: "52998224725", address: "Rua", phone: "61", password: "Senha123", role: "FUNCIONARIO" });
  await client.updateRole("token", 10, "ADMIN");
  await client.deactivate("token", 10, "Desligamento");

  assert.equal(calls[0].url, "https://auth.example.test/admin/operators?page=1&per_page=20");
  assert.equal(calls[0].options.headers.Authorization, "Bearer token");
  assert.equal(calls[1].options.method, "POST");
  assert.equal(calls[2].options.method, "POST");
  assert.deepEqual(JSON.parse(calls[2].options.body), { user_id: 10, new_role: "ADMIN" });
  assert.deepEqual(JSON.parse(calls[3].options.body), { user_id: 10, reason: "Desligamento" });
});

test("employee management screen exposes accessible controls and protected actions", () => {
  const html = readFileSync(path.join(__dirname, "index.html"), "utf8");
  const app = readFileSync(path.join(__dirname, "app.js"), "utf8");
  const table = readFileSync(path.join(__dirname, "../../xano/table/user.xs"), "utf8");
  const login = readFileSync(path.join(__dirname, "../../xano/api/authentication/auth/login_POST.xs"), "utf8");
  const roleApi = readFileSync(path.join(__dirname, "../../xano/api/members_accounts/admin/user_role_POST.xs"), "utf8");
  const createApi = readFileSync(path.join(__dirname, "../../xano/api/members_accounts/admin/operators_POST.xs"), "utf8");
  const deactivateApi = readFileSync(path.join(__dirname, "../../xano/api/members_accounts/admin/operator_deactivate_POST.xs"), "utf8");

  assert.match(html, /id="operator-form"/);
  assert.match(html, /id="deactivate-dialog"/);
  assert.match(html, /id="deactivate-reason"[^>]*maxlength="500"[^>]*required/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(app, /isSelf = item\.id === operator\.id/);
  assert.match(app, /Tornar Funcionário|Promover a Admin/);
  assert.match(table, /bool\? active\?=true/);
  assert.match(table, /timestamp\? deactivated_at/);
  assert.match(login, /\$user\.active != false/);
  assert.doesNotMatch(roleApi, /precondition \(false\)/);
  assert.match(roleApi, /required_role: "ADMIN"/);
  assert.match(roleApi, /\$target_user\.id != \$admin_user\.id/);
  assert.match(createApi, /required_role: "ADMIN"/);
  assert.match(createApi, /Leitores\/validar_cpf/);
  assert.match(deactivateApi, /db\.transaction/);
  assert.match(deactivateApi, /\$target_user\.id != \$admin_user\.id/);
  assert.match(deactivateApi, /action: "operator_deactivate"/);
});
