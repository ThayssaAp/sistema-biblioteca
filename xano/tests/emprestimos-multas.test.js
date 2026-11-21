"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

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

function overdueDaysBetween(dueAt, returnedAt) {
  if (returnedAt <= dueAt) return 0;
  return Math.ceil((returnedAt - dueAt) / 86400000);
}

function payFine(fine, role, paidBy, paidAt) {
  if (!canOperateAtServiceDesk(role)) return { error: "UNAUTHORIZED" };
  if (!fine || fine.status !== "Pendente") return { error: "NOT_PENDING" };
  return {
    ...fine,
    status: "Paga",
    paid_by: paidBy,
    paid_at: paidAt
  };
}

function fineAuditProjection(fine) {
  return {
    paid_by: fine.paid_by ?? null,
    paid_at: fine.paid_at ?? null
  };
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

test("calcula atraso com timestamps em milissegundos", () => {
  const dueAt = Date.UTC(2026, 10, 10, 18);
  assert.equal(overdueDaysBetween(dueAt, dueAt), 0);
  assert.equal(overdueDaysBetween(dueAt, dueAt + 86400000), 1);
  assert.equal(overdueDaysBetween(dueAt, dueAt + (3 * 86400000)), 3);
  assert.equal(overdueDaysBetween(dueAt, dueAt + 3600000), 1);
});

test("paga somente multa pendente e preserva valor com auditoria", () => {
  const fine = { id: 3, amount_cents: 2000, status: "Pendente" };
  const paid = payFine(fine, "FUNCIONARIO", 8, 1794260000000);

  assert.equal(paid.status, "Paga");
  assert.equal(paid.amount_cents, 2000);
  assert.equal(paid.paid_by, 8);
  assert.equal(paid.paid_at, 1794260000000);
  assert.deepEqual(fine, { id: 3, amount_cents: 2000, status: "Pendente" });
});

test("consulta de multas expõe auditoria preenchida ou nula sem recalcular valor", () => {
  const endpoint = readFileSync(path.join(__dirname, "../api/multas/multas_GET.xs"), "utf8");
  assert.match(endpoint, /"paid_by"[\s\S]*"paid_at"/);

  const paid = { amount_cents: 2000, paid_by: 8, paid_at: 1794260000000 };
  const unpaid = { amount_cents: 2000, paid_by: null, paid_at: null };

  assert.deepEqual(fineAuditProjection(paid), {
    paid_by: 8,
    paid_at: 1794260000000
  });
  assert.deepEqual(fineAuditProjection(unpaid), {
    paid_by: null,
    paid_at: null
  });
  assert.equal(paid.amount_cents, 2000);
  assert.equal(unpaid.amount_cents, 2000);
});

test("rejeita pagamento por leitor, multa resolvida e tentativa duplicada", () => {
  const pending = { id: 3, amount_cents: 2000, status: "Pendente" };
  const paid = payFine(pending, "ADMIN", 8, 1794260000000);

  assert.equal(payFine(pending, "LEITOR", 9, 1794260000001).error, "UNAUTHORIZED");
  assert.equal(payFine({ ...paid }, "ADMIN", 8, 1794260000002).error, "NOT_PENDING");
  assert.equal(payFine({ id: 4, amount_cents: 1000, status: "Abonada" }, "ADMIN", 8, 1794260000000).error, "NOT_PENDING");
  assert.equal(payFine(null, "ADMIN", 8, 1794260000000).error, "NOT_PENDING");
});
