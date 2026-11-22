"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createLoansClient, availableBooks, readerOptionLabel, bookOptionLabel } = require("./app.js");

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

test("loan client sends authenticated operations to the configured API", async () => {
  const requests = [];
  const client = createLoansClient(
    {
      operationsApiBaseUrl: "https://library.example/operations/",
      finesApiBaseUrl: "https://library.example/fines/"
    },
    async (url, options) => {
      requests.push({ url, options });
      return response([]);
    }
  );

  await client.listLoans("token", { status: "Ativo" });
  await client.returnLoan("token", { loan_code: "#EMP000001" });
  await client.renewLoan("token", { loan_code: "#EMP000001", renewal_source: "Balcão" });
  await client.listFines("token", { reader_id: 4 });
  await client.payFine("token", { fine_id: 3 });

  assert.deepEqual(requests.map(({ url }) => url), [
    "https://library.example/operations/emprestimos?status=Ativo",
    "https://library.example/operations/emprestimos/devolucao",
    "https://library.example/operations/emprestimos/renovacao",
    "https://library.example/fines/multas?reader_id=4",
    "https://library.example/fines/multas/pagamento"
  ]);
  assert.equal(requests[1].options.headers.Authorization, "Bearer token");
  assert.equal(requests[2].options.headers["Content-Type"], "application/json");
  assert.equal(requests[4].options.method, "POST");
  assert.equal(requests[4].options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(requests[4].options.body), { fine_id: 3 });
});

test("loan form reference lists use the reader and catalog APIs", async () => {
  const requests = [];
  const client = createLoansClient(
    {
      apiBaseUrl: "https://library.example/readers/",
      catalogApiBaseUrl: "https://library.example/catalog/",
      operationsApiBaseUrl: "https://library.example/operations"
    },
    async (url, options) => {
      requests.push({ url, options });
      return url.endsWith("/leitores")
        ? response({ readers: [{ id: 8, name: "Ana Souza", cpf: "12345678900" }] })
        : response([
          { id: 2, code: "#ADS0002", title: "Livro disponível", status: "Disponivel" },
          { id: 3, title: "Disponível via flag", available: true },
          { id: 4, title: "Emprestado", status: "Emprestado" }
        ]);
    }
  );

  const readerResponse = await client.listReaders("token");
  const booksResponse = await client.listBooksForLoan("token");

  assert.deepEqual(requests.map(({ url }) => url), [
    "https://library.example/readers/leitores",
    "https://library.example/catalog/books"
  ]);
  assert.ok(requests.every(({ options }) => options.headers.Authorization === "Bearer token"));
  assert.deepEqual(readerResponse.readers.map((reader) => reader.id), [8]);
  assert.deepEqual(availableBooks(booksResponse).map((book) => book.id), [2, 3]);
  assert.equal(readerOptionLabel(readerResponse.readers[0]), "Ana Souza — CPF 12345678900");
  assert.equal(bookOptionLabel(booksResponse[0]), "#ADS0002 — Livro disponível");
  assert.equal(bookOptionLabel(booksResponse[1]), "#3 — Disponível via flag");
});

test("loan creation keeps numeric reader and book identifiers in the POST payload", async () => {
  let request;
  const client = createLoansClient(
    { operationsApiBaseUrl: "https://library.example/operations" },
    async (url, options) => {
      request = { url, options };
      return response({ id: 1 });
    }
  );

  await client.createLoan("token", { reader_id: 8, book_id: 2 });

  assert.equal(request.url, "https://library.example/operations/emprestimo");
  assert.deepEqual(JSON.parse(request.options.body), { reader_id: 8, book_id: 2 });
});

test("loan client preserves backend error messages and marks expired sessions", async () => {
  const client = createLoansClient(
    { apiBaseUrl: "https://library.example/api" },
    async () => response({ message: "O leitor possui multa pendente." }, 409)
  );
  await assert.rejects(
    client.createLoan("token", { reader_id: 1, book_id: 2 }),
    { message: "O leitor possui multa pendente.", code: "REQUEST_FAILED" }
  );
});

test("new-loan form uses searchable selects without changing existing numeric filters", () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  const loanForm = html.match(/<form id="loan-form"[\s\S]*?<\/form>/)[0];

  assert.match(loanForm, /id="reader-search"[^>]*type="search"[^>]*aria-controls="reader-select"/);
  assert.match(loanForm, /id="reader-select"[^>]*name="reader_id"[^>]*required/);
  assert.match(loanForm, /id="book-search"[^>]*type="search"[^>]*aria-controls="book-select"/);
  assert.match(loanForm, /id="book-select"[^>]*name="book_id"[^>]*required/);
  assert.match(html, /id="loan-search"[\s\S]*name="reader_id" type="number"/);
  assert.match(html, /id="fine-search"[\s\S]*name="reader_id" type="number"/);
  assert.doesNotMatch(loanForm, /<input name="(?:reader_id|book_id)" type="number"/);
});

test("fine screen offers payment only for pending fines and refreshes the fine list", () => {
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

  assert.match(source, /fine\.status === "Pendente"/);
  assert.match(source, /data-pay-fine/);
  assert.match(source, /Confirmar o pagamento desta multa no balcão/);
  assert.match(source, /await loadFines\(\)/);
});
