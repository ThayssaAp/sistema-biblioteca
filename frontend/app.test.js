"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const home = readFileSync(path.join(__dirname, "index.html"), "utf8");

test("tela inicial apresenta os dois perfis com destinos separados", () => {
  assert.match(home, /<nav[^>]+aria-label="Tipo de acesso"/);
  assert.match(home, /href="\.\/portal-leitor\/"[\s\S]*>[\s\S]*Sou leitor/);
  assert.match(home, /href="\.\/login\/"[\s\S]*>[\s\S]*Sou funcionário/);
  assert.match(home, /id="page-title"/);
  assert.doesNotMatch(home, /<script\b/);
  assert.match(home, /rel="stylesheet" href="\.\/styles\.css"/);
});

test("tela inicial mantém os caminhos de autenticação sem misturar sessões", () => {
  const operatorLogin = readFileSync(path.join(__dirname, "login", "index.html"), "utf8");
  const readerLogin = readFileSync(path.join(__dirname, "portal-leitor", "index.html"), "utf8");

  assert.match(operatorLogin, /href="\.\.\/">Voltar para seleção de acesso/);
  assert.match(readerLogin, /href="\.\.\/">Voltar para seleção de acesso/);
});
