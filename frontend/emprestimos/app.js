(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const LOGIN_URL = "../login/index.html";

  function availableBooks(list) {
    const items = Array.isArray(list) ? list : Array.isArray(list?.items) ? list.items : Array.isArray(list?.books) ? list.books : [];
    return items.filter((book) => {
      if (!book) return false;
      if (book.available === true) return true;
      const status = String(book.status || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return status === "disponivel";
    });
  }

  function readerOptionLabel(reader) { return `${reader.name} — CPF ${reader.cpf}`; }
  function bookOptionLabel(book) { return `${book.code || `#${book.id}`} — ${book.title}`; }

  function normalizeSearch(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  }

  function createLoansClient(config, fetchImplementation) {
    const operationsBaseUrl = typeof config?.operationsApiBaseUrl === "string"
      ? config.operationsApiBaseUrl.replace(/\/+$/, "")
      : typeof config?.apiBaseUrl === "string" ? config.apiBaseUrl.replace(/\/+$/, "") : "";
    const readersBaseUrl = typeof config?.readersApiBaseUrl === "string"
      ? config.readersApiBaseUrl.replace(/\/+$/, "")
      : typeof config?.apiBaseUrl === "string"
        ? config.apiBaseUrl.replace(/\/+$/, "").replace(/\/api:[^/]+$/, "/api:leitores")
        : "";
    const catalogBaseUrl = typeof config?.catalogApiBaseUrl === "string" ? config.catalogApiBaseUrl.replace(/\/+$/, "") : "";
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
      listReaders: (token) => {
        if (!readersBaseUrl) throw new Error("API_BASE_URL_REQUIRED");
        return send(readersBaseUrl, "/leitores", token);
      },
      listBooksForLoan: (token) => {
        if (!catalogBaseUrl) throw new Error("API_BASE_URL_REQUIRED");
        return send(catalogBaseUrl, "/books", token);
      },
      createLoan: (token, data) => send(operationsBaseUrl, "/emprestimo", token, { method: "POST", body: JSON.stringify(data) }),
      listLoans: (token, params) => send(operationsBaseUrl, `/emprestimos${params ? `?${new URLSearchParams(params)}` : ""}`, token),
      returnLoan: (token, data) => send(operationsBaseUrl, "/emprestimos/devolucao", token, { method: "POST", body: JSON.stringify(data) }),
      renewLoan: (token, data) => send(operationsBaseUrl, "/emprestimos/renovacao", token, { method: "POST", body: JSON.stringify(data) }),
      listFines: (token, params) => send(finesBaseUrl, `/multas${params ? `?${new URLSearchParams(params)}` : ""}`, token),
      payFine: (token, data) => send(finesBaseUrl, "/multas/pagamento", token, { method: "POST", body: JSON.stringify(data) })
    });
  }

  const publicApi = Object.freeze({ createLoansClient, availableBooks, readerOptionLabel, bookOptionLabel });
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
  const readerSelect = root.document.getElementById("reader-select");
  const readerSearch = root.document.getElementById("reader-search");
  const bookSelect = root.document.getElementById("book-select");
  const bookSearch = root.document.getElementById("book-search");
  const route = new URLSearchParams(root.location.search).get("view") === "fines" ? "fines" : "loans";
  let client;
  let readers = [];
  let books = [];

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
    finesList.innerHTML = `<table><thead><tr><th>Empréstimo</th><th>Leitor</th><th>Atraso</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>${items.map((fine) => `<tr><td>${escapeHtml(fine.loan_code || fine.loan_id)}</td><td>${escapeHtml(fine.reader_name || fine.reader_id)}</td><td>${escapeHtml(fine.overdue_days)} dia(s)</td><td>${money(fine.amount_cents)}</td><td>${escapeHtml(fine.status)}</td><td>${fine.status === "Pendente" ? `<button class="secondary-button" type="button" data-pay-fine="${escapeHtml(fine.id)}">Registrar pagamento</button>` : ""}</td></tr>`).join("")}</tbody></table>`;
    finesList.querySelectorAll("[data-pay-fine]").forEach((button) => button.addEventListener("click", () => payFine(button.dataset.payFine, button)));
  }
  function renderSelectOptions(select, searchInput, items, messages, labelFor) {
    const selectedValue = select.value;
    const searchTerm = normalizeSearch(searchInput.value);
    const matchingItems = items.filter((item) => normalizeSearch(labelFor(item)).includes(searchTerm));
    const placeholder = root.document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = items.length
      ? matchingItems.length || !searchTerm ? messages.default : `Nenhum resultado para "${searchInput.value}"`
      : messages.empty;
    select.replaceChildren(placeholder);
    for (const item of matchingItems) {
      const option = root.document.createElement("option");
      option.value = String(item.id);
      option.textContent = labelFor(item);
      select.append(option);
    }
    select.value = matchingItems.some((item) => String(item.id) === selectedValue) ? selectedValue : "";
  }
  function renderLoanOptions() {
    renderSelectOptions(readerSelect, readerSearch, readers, {
      default: "Selecione um leitor",
      empty: "Nenhum leitor encontrado"
    }, readerOptionLabel);
    renderSelectOptions(bookSelect, bookSearch, books, {
      default: "Selecione um exemplar disponível",
      empty: "Nenhum exemplar disponível"
    }, bookOptionLabel);
  }
  async function loadLoanOptions() {
    const [readerResponse, bookResponse] = await Promise.all([
      client.listReaders(token),
      client.listBooksForLoan(token)
    ]);
    const rawReaders = Array.isArray(readerResponse) ? readerResponse : Array.isArray(readerResponse?.items) ? readerResponse.items : Array.isArray(readerResponse?.readers) ? readerResponse.readers : [];
    readers = rawReaders.filter((r) => r && (r.name || r.cpf));
    books = availableBooks(bookResponse);
    renderLoanOptions();
  }
  async function loadLoans() { try { renderLoans(await client.listLoans(token, query(root.document.getElementById("loan-search")))); } catch (error) { handleError(error); } }
  async function refreshLoanData() {
    const results = await Promise.allSettled([loadLoanOptions(), loadLoans()]);
    if (results[0].status === "rejected") handleError(results[0].reason);
  }
  async function loadFines() { try { renderFines(await client.listFines(token, query(root.document.getElementById("fine-search")))); } catch (error) { handleError(error); } }
  async function operate(action, data) { try { await client[action](token, data); setStatus("Operação concluída.", "success"); await refreshLoanData(); } catch (error) { handleError(error); } }
  async function payFine(fineId, button) {
    if (!root.confirm("Confirmar o pagamento desta multa no balcão?")) return;
    button.disabled = true;
    try {
      await client.payFine(token, { fine_id: Number(fineId) });
      setStatus("Pagamento da multa registrado no balcão.", "success");
      await loadFines();
    } catch (error) {
      button.disabled = false;
      handleError(error);
    }
  }

  if (!token) { root.location.replace(LOGIN_URL); return; }
  try { client = createLoansClient(root.BIBLIOTECA_CONFIG); } catch { setStatus("A tela ainda não está configurada para conectar ao sistema."); return; }
  const operator = JSON.parse(storage.getItem(OPERATOR_KEY) || "null");
  if (operator) operatorLabel.textContent = `${operator.name} · ${operator.role === "ADMIN" ? "Administrador" : "Funcionário"}`;
  loansView.hidden = route !== "loans"; finesView.hidden = route !== "fines";
  root.document.getElementById(`${route}-tab`).setAttribute("aria-current", "page");
  root.document.getElementById("logout-button").addEventListener("click", () => { clearSession(); root.location.replace(LOGIN_URL); });
  root.document.getElementById("loan-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; try { const data = Object.fromEntries(new FormData(form)); await client.createLoan(token, { reader_id: Number(data.reader_id), book_id: Number(data.book_id) }); form.reset(); setStatus("Empréstimo registrado.", "success"); renderLoanOptions(); await refreshLoanData(); } catch (error) { handleError(error); } });
  readerSearch.addEventListener("input", renderLoanOptions);
  bookSearch.addEventListener("input", renderLoanOptions);
  root.document.getElementById("loan-search").addEventListener("submit", (event) => { event.preventDefault(); loadLoans(); });
  root.document.getElementById("fine-search").addEventListener("submit", (event) => { event.preventDefault(); loadFines(); });
  root.document.getElementById("refresh-loans").addEventListener("click", refreshLoanData);
  root.document.getElementById("refresh-fines").addEventListener("click", loadFines);
  if (route === "loans") refreshLoanData(); else loadFines();
})(globalThis);
