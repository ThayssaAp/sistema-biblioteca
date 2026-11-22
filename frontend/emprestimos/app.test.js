"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createLoansClient } = require("./app.js");

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

test("fine screen offers payment only for pending fines and refreshes the fine list", () => {
  const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

  assert.match(source, /fine\.status === "Pendente"/);
  assert.match(source, /data-pay-fine/);
  assert.match(source, /Confirmar o pagamento desta multa no balcão/);
  assert.match(source, /await loadFines\(\)/);
});
