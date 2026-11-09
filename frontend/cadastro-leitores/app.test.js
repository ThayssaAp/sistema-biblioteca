"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  validateReader,
  createClient
} = require("../leitores/app.js");

test("fluxo atual de cadastro valida senha temporária e campos obrigatórios", () => {
  const errors = validateReader({
    cpf: "529.982.247-25",
    name: "João",
    birth_date: "25/05/1990",
    address: "Rua A",
    phone: "(11) 98765-4321",
    email: "",
    temporary_password: "Temp1234"
  });
  assert.deepEqual(errors, {});
});

test("cliente atual cadastra leitor pelo endpoint de leitores", async () => {
  const storage = {
    getItem: () => "token-operador",
    removeItem: () => {}
  };
  let request;
  const client = createClient({ apiBaseUrl: "https://api.test" }, async (url, options) => {
    request = { url, options };
    return { ok: true, status: 201, json: async () => ({ id: 8 }) };
  }, storage, () => {});

  await client.createReader({
    cpf: "529.982.247-25",
    name: "João",
    birth_date: "25/05/1990",
    address: "Rua A",
    phone: "(11) 98765-4321",
    temporary_password: "Temp1234"
  });

  assert.equal(request.url, "https://api.test/leitores");
  assert.equal(request.options.headers.Authorization, "Bearer token-operador");
});

test("páginas atuais de leitores permanecem ligadas ao app compartilhado", () => {
  const directory = path.join(__dirname, "..", "leitores");
  const registration = readFileSync(path.join(directory, "cadastro.html"), "utf8");
  const consultation = readFileSync(path.join(directory, "consulta.html"), "utf8");
  assert.match(registration, /id="reader-form"/);
  assert.match(registration, /name="temporary_password"/);
  assert.match(consultation, /id="search-form"/);
  assert.match(registration, /src="\.\/app\.js"/);
  assert.match(consultation, /src="\.\/app\.js"/);
});
