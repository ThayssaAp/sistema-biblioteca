"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  isValidCpf,
  normalizeCpf,
  formatCpf,
  formatPhone,
  formatBirthDate,
  normalizeBirthDate,
  validateReader,
  chooseSearchFilter,
  createClient
} = require("./app.js");

test("valida e normaliza CPF", () => {
  assert.equal(isValidCpf("529.982.247-25"), true);
  assert.equal(isValidCpf("52998224725"), true);
  assert.equal(isValidCpf("935.411.347-80"), true);
  assert.equal(isValidCpf("123.456.789-09"), true);
  assert.equal(isValidCpf("111.111.111-11"), false);
  assert.equal(isValidCpf("000.000.000-00"), false);
  assert.equal(isValidCpf("111.111.111-11"), false);
  assert.equal(isValidCpf("529.982.247-26"), false);
  assert.equal(isValidCpf("123"), false);
  assert.equal(normalizeCpf("529.982.247-25"), "52998224725");
  assert.equal(formatCpf("52998224725"), "529.982.247-25");
});

test("aplica máscaras de telefone e data e normaliza a data para a API", () => {
  assert.equal(formatPhone("11987654321"), "(11) 98765-4321");
  assert.equal(formatBirthDate("25051990"), "25/05/1990");
  assert.equal(normalizeBirthDate("25/05/1990"), "1990-05-25");
});

test("valida campos obrigatórios e e-mail", () => {
  const errors = validateReader({ cpf: "123", name: " ", birth_date: "", address: "", phone: "", email: "invalido", temporary_password: "" });
  assert.deepEqual(errors, {
    cpf: "Informe um CPF válido.",
    name: "Este campo é obrigatório.",
    birth_date: "Este campo é obrigatório.",
    address: "Este campo é obrigatório.",
    phone: "Este campo é obrigatório.",
    email: "Informe um e-mail válido.",
    temporary_password: "Use ao menos 8 caracteres, uma letra e um dígito."
  });
});

test("rejeita data inexistente e telefone incompleto", () => {
  const errors = validateReader({
    cpf: "529.982.247-25",
    name: "João",
    birth_date: "31/02/2000",
    address: "Rua A",
    phone: "(11) 9876-4321"
  });
  assert.equal(errors.birth_date, "Informe uma data válida no formato dd/mm/aaaa.");
  assert.equal(errors.phone, "Informe um telefone válido com 11 dígitos.");
});

test("escolhe filtro CPF para máscara e nome para texto", () => {
  assert.deepEqual(chooseSearchFilter("529.982.247-25"), { cpf: "529.982.247-25" });
  assert.deepEqual(chooseSearchFilter("silva"), { nome: "silva" });
});

test("cliente envia bearer token sem persistir dados do leitor", async () => {
  const values = new Map([["biblioteca.authToken", "token-teste"]]);
  const storage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  let request;
  const client = createClient({ apiBaseUrl: "https://api.test" }, async (url, options) => {
    request = { url, options };
    return { ok: true, status: 200, json: async () => ({}) };
  }, storage, () => {});

  await client.createReader({ cpf: "529.982.247-25", name: "João" });
  assert.equal(request.options.headers.Authorization, "Bearer token-teste");
  assert.equal(storage.getItem("biblioteca.reader"), null);
});

test("cliente não envia e-mail vazio quando o campo é opcional", async () => {
  const storage = {
    getItem: () => "token-teste",
    removeItem: () => {}
  };
  let body;
  const client = createClient({ apiBaseUrl: "https://api.test" }, async (url, options) => {
    body = JSON.parse(options.body);
    return { ok: true, status: 200, json: async () => ({}) };
  }, storage, () => {});

  await client.createReader({
    cpf: "529.982.247-25",
    name: "João",
    birth_date: "25/05/1990",
    address: "Rua A",
    phone: "(11) 98765-4321",
    email: "   ",
    temporary_password: "Temp1234"
  });
  assert.equal(Object.prototype.hasOwnProperty.call(body, "email"), false);
});

test("cliente encerra sessão e redireciona quando o token expira", async () => {
  const values = new Map([["biblioteca.authToken", "expirado"], ["biblioteca.operator", "{}"]]);
  const storage = {
    getItem: (key) => values.get(key) || null,
    removeItem: (key) => values.delete(key)
  };
  let redirected = false;
  const client = createClient({ apiBaseUrl: "https://api.test" }, async () => ({ ok: false, status: 401, json: async () => ({}) }), storage, () => { redirected = true; });
  await assert.rejects(() => client.listReaders({}, 1, 20), { message: "SESSION_INVALID" });
  assert.equal(redirected, true);
  assert.equal(storage.getItem("biblioteca.authToken"), null);
  assert.equal(storage.getItem("biblioteca.operator"), null);
});

test("reader screens return to the authenticated menu and retain session guards", () => {
  const registrationHtml = readFileSync(path.join(__dirname, "cadastro.html"), "utf8");
  const consultationHtml = readFileSync(path.join(__dirname, "consulta.html"), "utf8");
  const app = readFileSync(path.join(__dirname, "app.js"), "utf8");

  assert.match(registrationHtml, /href="\.\.\/menu\/index\.html">Menu principal/);
  assert.match(consultationHtml, /href="\.\.\/menu\/index\.html">Menu principal/);
  assert.match(app, /if \(!root\.sessionStorage\.getItem\(TOKEN_KEY\)\)/);
  assert.match(app, /root\.location\.href = LOGIN_URL/);
});
