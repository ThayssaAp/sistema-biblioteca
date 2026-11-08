"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

// Mock fetch API
const mockFetch = (response) => {
  global.fetch = async () => ({
    ok: response.ok,
    json: async () => response.body,
  });
};

test("Cadastro de leitor com sucesso", async () => {
  mockFetch({ ok: true, body: { reader: { name: "João", email: "joao@email.com", phone: "123456789" } } });

  const form = document.createElement("form");
  form.innerHTML = `
    <input id="name" value="João" />
    <input id="email" value="joao@email.com" />
    <input id="phone" value="123456789" />
    <div id="message"></div>
  `;
  document.body.appendChild(form);

  require("./app.js");
  form.dispatchEvent(new Event("submit"));

  const message = document.getElementById("message").textContent;
  assert.equal(message, "Leitor cadastrado com sucesso!");
});

test("Consulta de leitores com sucesso", async () => {
  mockFetch({
    ok: true,
    body: {
      readers: [
        { name: "João", email: "joao@email.com", phone: "123456789" },
        { name: "Maria", email: "maria@email.com", phone: null },
      ],
    },
  });

  const leitoresDiv = document.createElement("div");
  leitoresDiv.id = "leitores";
  document.body.appendChild(leitoresDiv);

  require("./app.js");
  await new Promise((resolve) => setTimeout(resolve, 0)); // Aguarda DOMContentLoaded

  const leitores = leitoresDiv.children;
  assert.equal(leitores.length, 2);
  assert.equal(leitores[0].textContent, "João - joao@email.com - 123456789");
  assert.equal(leitores[1].textContent, "Maria - maria@email.com - Sem telefone");
});