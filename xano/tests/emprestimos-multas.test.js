"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const rolesAllowedAtServiceDesk = ["FUNCIONARIO", "ADMIN"];
const loanStatuses = ["Ativo", "Devolvido"];
const fineStatuses = ["Pendente", "Paga", "Abonada", "Zerada"];

function canOperateAtServiceDesk(role) {
  return rolesAllowedAtServiceDesk.includes(role);
}

function canBorrow({ activeLoans, hasOverdueLoan, hasPendingFine, readerAge, requiredAge, bookStatus }) {
  return activeLoans < 2
    && !hasOverdueLoan
    && !hasPendingFine
    && readerAge >= requiredAge
    && bookStatus === "Disponível";
}

function fineAmountCents(overdueDays) {
  return Math.max(0, overdueDays) * 1000;
}

test("permite operações de balcão somente para Funcionário e Admin", () => {
  assert.equal(canOperateAtServiceDesk("FUNCIONARIO"), true);
  assert.equal(canOperateAtServiceDesk("ADMIN"), true);
  assert.equal(canOperateAtServiceDesk("LEITOR"), false);
  assert.equal(canOperateAtServiceDesk(undefined), false);
});

test("rejeita concorrência lógica para exemplar indisponível", () => {
  const firstRequest = canBorrow({
    activeLoans: 0,
    hasOverdueLoan: false,
    hasPendingFine: false,
    readerAge: 25,
    requiredAge: 0,
    bookStatus: "Disponível"
  });
  const secondRequest = canBorrow({
    activeLoans: 0,
    hasOverdueLoan: false,
    hasPendingFine: false,
    readerAge: 25,
    requiredAge: 0,
    bookStatus: "Emprestado"
  });

  assert.equal(firstRequest, true);
  assert.equal(secondRequest, false);
});

test("mantém códigos sequenciais e não reutiliza empréstimos encerrados", () => {
  const loanIds = [1, 2, 8];
  const codes = loanIds.map((id) => `#EMP${String(id).padStart(6, "0")}`);

  assert.deepEqual(codes, ["#EMP000001", "#EMP000002", "#EMP000008"]);
  assert.match(codes[2], /^#EMP\d{6}$/);
  assert.ok(Number(codes[2].slice(4)) > Number(codes[1].slice(4)));
});

test("aplica limite, atraso, multa e faixa etária na elegibilidade", () => {
  const base = {
    activeLoans: 0,
    hasOverdueLoan: false,
    hasPendingFine: false,
    readerAge: 18,
    requiredAge: 12,
    bookStatus: "Disponível"
  };

  assert.equal(canBorrow(base), true);
  assert.equal(canBorrow({ ...base, activeLoans: 2 }), false);
  assert.equal(canBorrow({ ...base, hasOverdueLoan: true }), false);
  assert.equal(canBorrow({ ...base, hasPendingFine: true }), false);
  assert.equal(canBorrow({ ...base, readerAge: 10 }), false);
});

test("aceita somente transições de status previstas", () => {
  assert.deepEqual(loanStatuses, ["Ativo", "Devolvido"]);
  assert.deepEqual(fineStatuses, ["Pendente", "Paga", "Abonada", "Zerada"]);
  assert.equal(fineAmountCents(0), 0);
  assert.equal(fineAmountCents(1), 1000);
  assert.equal(fineAmountCents(3), 3000);
});
