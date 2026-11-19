(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const LOGIN_URL = "../login/index.html";

  function createLoansClient(config, fetchImplementation) {
    const operationsBaseUrl = typeof config?.operationsApiBaseUrl === "string"
      ? config.operationsApiBaseUrl.replace(/\/+$/, "")
      : typeof config?.apiBaseUrl === "string" ? config.apiBaseUrl.replace(/\/+$/, "") : "";
    const finesBaseUrl = typeof config?.finesApiBaseUrl === "string"
      ? config.finesApiBaseUrl.replace(/\/+$/, "")
      : operationsBaseUrl;
    const request = fetchImplementation || root.fetch.bind(root);
    if (!operationsBaseUrl || !finesBaseUrl) throw new Error("API_BASE_URL_REQUIRED");

    async function send(baseUrl, path, token, options = {}) {
      const response = await request(`${baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {})
        }
      });
      let body = null;
      try { body = await response.json(); } catch { /* empty response is allowed for errors below */ }
      if (!response.ok) {
        const error = typeof body?.message === "string" ? body.message : "Não foi possível concluir a operação.";
        const failure = new Error(error);
        failure.code = response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "REQUEST_FAILED";
        throw failure;
      }
      return body;
    }

    return Object.freeze({
      createLoan: (token, data) => send(operationsBaseUrl, "/emprestimo", token, { method: "POST", body: JSON.stringify(data) }),
      listLoans: (token, params) => send(operationsBaseUrl, `/emprestimos${params ? `?${new URLSearchParams(params)}` : ""}`, token),
      returnLoan: (token, data) => send(operationsBaseUrl, "/emprestimos/devolucao", token, { method: "POST", body: JSON.stringify(data) }),
      renewLoan: (token, data) => send(operationsBaseUrl, "/emprestimos/renovacao", token, { method: "POST", body: JSON.stringify(data) }),
      listFines: (token, params) => send(finesBaseUrl, `/multas${params ? `?${new URLSearchParams(params)}` : ""}`, token)
    });
  }

  const publicApi = Object.freeze({ createLoansClient });
  if (typeof module !== "undefined" && module.exports) module.exports = publicApi;
  if (typeof root.document === "undefined") return;

  const storage = root.sessionStorage;
  const token = storage.getItem(TOKEN_KEY);
  const status = root.document.getElementById("page-status");
  const operatorLabel = root.document.getElementById("operator-label");
  const loansView = root.document.getElementById("loans-view");
  const finesView = root.document.getElementById("fines-view");
  const loansList = root.document.getElementById("loans-list");
  const finesList = root.document.getElementById("fines-list");
  const route = new URLSearchParams(root.location.search).get("view") === "fines" ? "fines" : "loans";
  let client;

  function setStatus(message, state = "error") { status.textContent = message; status.dataset.state = state; }
  function clearSession() { storage.removeItem(TOKEN_KEY); storage.removeItem(OPERATOR_KEY); }
  function handleError(error) {
    if (error?.code === "UNAUTHORIZED") { clearSession(); root.location.replace(LOGIN_URL); return; }
    setStatus(error?.message || "Não foi possível concluir a operação.");
  }
  function query(form) {
    return Object.fromEntries([...new FormData(form)].filter(([, value]) => value !== ""));
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
  }
  function money(cents) { return `R$ ${(Number(cents || 0) / 100).toFixed(2).replace(".", ",")}`; }
  function renderLoans(items) {
    if (!Array.isArray(items) || items.length === 0) { loansList.innerHTML = '<p class="empty">Nenhum empréstimo encontrado.</p>'; return; }
    loansList.innerHTML = `<table><thead><tr><th>Código</th><th>Leitor</th><th>Exemplar</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map((loan) => {
      const code = escapeHtml(loan.code);
      const dueAt = loan.due_at ? new Date(loan.due_at).toLocaleString("pt-BR") : "";
      const isOverdue = loan.status === "Ativo" && loan.due_at && new Date(loan.due_at).getTime() < Date.now();
      return `<tr><td>${code}</td><td>${escapeHtml(loan.reader_name || loan.reader_id)}</td><td>${escapeHtml(loan.book_title || loan.book_id)}</td><td>${escapeHtml(dueAt)}${isOverdue ? " · atrasado" : ""}</td><td>${escapeHtml(loan.status)}</td><td>${loan.status === "Ativo" ? `<button class="secondary-button" data-return="${code}">Devolver</button> <button class="secondary-button" data-renew="${code}">Renovar</button>` : ""}</td></tr>`;
    }).join("")}</tbody></table>`;
    loansList.querySelectorAll("[data-return]").forEach((button) => button.addEventListener("click", () => operate("returnLoan", { loan_code: button.dataset.return })));
    loansList.querySelectorAll("[data-renew]").forEach((button) => button.addEventListener("click", () => operate("renewLoan", { loan_code: button.dataset.renew, renewal_source: "Balcão" })));
  }
  function renderFines(items) {
    if (!Array.isArray(items) || items.length === 0) { finesList.innerHTML = '<p class="empty">Nenhuma multa encontrada.</p>'; return; }
    finesList.innerHTML = `<table><thead><tr><th>Empréstimo</th><th>Leitor</th><th>Atraso</th><th>Valor</th><th>Status</th></tr></thead><tbody>${items.map((fine) => `<tr><td>${escapeHtml(fine.loan_code || fine.loan_id)}</td><td>${escapeHtml(fine.reader_name || fine.reader_id)}</td><td>${escapeHtml(fine.overdue_days)} dia(s)</td><td>${money(fine.amount_cents)}</td><td>${escapeHtml(fine.status)}</td></tr>`).join("")}</tbody></table>`;
  }
  async function loadLoans() { try { renderLoans(await client.listLoans(token, query(root.document.getElementById("loan-search")))); } catch (error) { handleError(error); } }
  async function loadFines() { try { renderFines(await client.listFines(token, query(root.document.getElementById("fine-search")))); } catch (error) { handleError(error); } }
  async function operate(action, data) { try { await client[action](token, data); setStatus("Operação concluída.", "success"); await loadLoans(); } catch (error) { handleError(error); } }

  if (!token) { root.location.replace(LOGIN_URL); return; }
  try { client = createLoansClient(root.BIBLIOTECA_CONFIG); } catch { setStatus("A tela ainda não está configurada para conectar ao sistema."); return; }
  const operator = JSON.parse(storage.getItem(OPERATOR_KEY) || "null");
  if (operator) operatorLabel.textContent = `${operator.name} · ${operator.role === "ADMIN" ? "Administrador" : "Funcionário"}`;
  loansView.hidden = route !== "loans"; finesView.hidden = route !== "fines";
  root.document.getElementById(`${route}-tab`).setAttribute("aria-current", "page");
  root.document.getElementById("logout-button").addEventListener("click", () => { clearSession(); root.location.replace(LOGIN_URL); });
  root.document.getElementById("loan-form").addEventListener("submit", async (event) => { event.preventDefault(); try { const data = Object.fromEntries(new FormData(event.currentTarget)); await client.createLoan(token, { reader_id: Number(data.reader_id), book_id: Number(data.book_id) }); event.currentTarget.reset(); setStatus("Empréstimo registrado.", "success"); await loadLoans(); } catch (error) { handleError(error); } });
  root.document.getElementById("loan-search").addEventListener("submit", (event) => { event.preventDefault(); loadLoans(); });
  root.document.getElementById("fine-search").addEventListener("submit", (event) => { event.preventDefault(); loadFines(); });
  root.document.getElementById("refresh-loans").addEventListener("click", loadLoans);
  root.document.getElementById("refresh-fines").addEventListener("click", loadFines);
  if (route === "loans") loadLoans(); else loadFines();
})(globalThis);
