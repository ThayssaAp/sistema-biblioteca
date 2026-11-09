"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  formatCpf,
  validPassword,
  validateLogin,
  validatePasswordChange,
  createClient,
  storageKeys
} = require("./app.js");

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

test("valida CPF, senha e confirmação do primeiro acesso", () => {
  assert.equal(formatCpf("52998224725"), "529.982.247-25");
  assert.equal(validPassword("Leitor123"), true);
  assert.equal(validPassword("curta1"), false);
  assert.deepEqual(validateLogin({ cpf: "123", password: "" }), {
    cpf: "Informe um CPF válido.",
    password: "Informe sua senha."
  });
  assert.deepEqual(validatePasswordChange({ new_password: "Leitor123", password_confirmation: "diferente" }), {
    password_confirmation: "As senhas não conferem."
  });
  assert.equal(validatePasswordChange({
    new_password: "Temp1234",
    password_confirmation: "Temp1234",
    temporary_password: "Temp1234"
  }).new_password, "A nova senha deve ser diferente da senha temporária.");
});

test("cliente do leitor usa endpoints e sessão separados do operador", async () => {
  const values = new Map([
    ["biblioteca.authToken", "token-operador"],
    [storageKeys.token, null]
  ]);
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const requests = [];
  const client = createClient({ apiBaseUrl: "https://api.test" }, async (url, options) => {
    requests.push({ url, options });
    return response(200, {
      authToken: "token-leitor",
      requiresPasswordChange: true,
      reader: { id: 8, cpf: "52998224725", name: "João" }
    });
  }, storage, () => {});

  const result = await client.login("529.982.247-25", "Temp1234");
  assert.equal(result.requiresPasswordChange, true);
  assert.equal(requests[0].url, "https://api.test/auth/login");
  assert.equal(requests[0].options.headers.Authorization, undefined);
  assert.equal(values.get(storageKeys.token), "token-leitor");
  assert.equal(values.get("biblioteca.authToken"), "token-operador");
});

test("troca de senha usa bearer do leitor e remove o estado pendente", async () => {
  const values = new Map([[storageKeys.token, "token-leitor"], [storageKeys.pending, "true"]]);
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  let request;
  const client = createClient({ apiBaseUrl: "https://api.test" }, async (url, options) => {
    request = { url, options };
    return response(200, { authToken: "token-final", reader: { id: 8, cpf: "52998224725", name: "João" } });
  }, storage, () => {});
  await client.changePassword("Leitor123", "Leitor123");
  assert.equal(request.url, "https://api.test/auth/change-password");
  assert.equal(request.options.headers.Authorization, "Bearer token-leitor");
  assert.equal(values.has(storageKeys.pending), false);
});

test("telas do portal possuem login, troca obrigatória e acessibilidade básica", () => {
  const directory = __dirname;
  const login = readFileSync(path.join(directory, "index.html"), "utf8");
  const change = readFileSync(path.join(directory, "change-password.html"), "utf8");
  assert.match(login, /id="reader-login-form"/);
  assert.match(login, /href="\.\.\/login\/"/);
  assert.match(change, /id="password-change-form"/);
  assert.match(change, /for="password_confirmation"/);
  const home = readFileSync(path.join(directory, "home.html"), "utf8");
  assert.match(home, /id="form-status"/);
});
