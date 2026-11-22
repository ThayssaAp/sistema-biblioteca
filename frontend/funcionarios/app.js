(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const LOGIN_URL = "../login/index.html";

  function normalizeCpf(value) {
    return String(value || "").replace(/[^0-9]/g, "");
  }

  function isValidPassword(value) {
    return String(value || "").length >= 8
      && /[A-Za-z]/.test(value)
      && /[0-9]/.test(value);
  }

  function operatorPayload(entries) {
    const payload = Object.fromEntries(entries);
    payload.matricula = String(payload.matricula || "").trim();
    payload.name = String(payload.name || "").trim();
    payload.cpf = normalizeCpf(payload.cpf);
    payload.address = String(payload.address || "").trim();
    payload.phone = String(payload.phone || "").trim();
    payload.password = String(payload.password || "");
    payload.role = payload.role === "ADMIN" ? "ADMIN" : "FUNCIONARIO";
    payload.email = String(payload.email || "").trim();
    if (!payload.email) {
      delete payload.email;
    }
    return payload;
  }

  function createOperatorsClient(config, fetchImplementation) {
    const authUrl = typeof config?.apiBaseUrl === "string" ? config.apiBaseUrl.replace(/\/+$/, "") : "";
    const membersUrl = authUrl;
    const request = fetchImplementation || root.fetch.bind(root);
    if (!authUrl || !membersUrl) {
      throw new Error("API_BASE_URL_REQUIRED");
    }

    async function send(baseUrl, path, token, options = {}) {
      const response = await request(`${baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...options.headers
        }
      });
      let body = null;
      try {
        body = await response.json();
      } catch {
        if (response.ok) throw new Error("INVALID_API_RESPONSE");
      }
      if (!response.ok) {
        const message = typeof body?.message === "string" ? body.message : "Não foi possível concluir a operação.";
        throw Object.assign(new Error(message), {
          code: response.status === 401 || response.status === 403 ? "UNAUTHORIZED" : "REQUEST_FAILED"
        });
      }
      return body;
    }

    return Object.freeze({
      currentOperator: (token) => send(authUrl, "/auth/me", token, { method: "GET" }),
      list: (token, params) => send(membersUrl, `/admin/operators${params ? `?${new URLSearchParams(params)}` : ""}`, token, { method: "GET" }),
      create: (token, data) => send(membersUrl, "/admin/operators", token, { method: "POST", body: JSON.stringify(data) }),
      updateRole: (token, userId, role) => send(membersUrl, "/admin/user_role", token, { method: "POST", body: JSON.stringify({ user_id: userId, new_role: role }) }),
      deactivate: (token, userId, reason) => send(membersUrl, "/admin/operator_deactivate", token, { method: "POST", body: JSON.stringify({ user_id: userId, reason }) })
    });
  }

  const publicApi = Object.freeze({
    createOperatorsClient,
    normalizeCpf,
    isValidPassword,
    operatorPayload,
    storageKeys: Object.freeze({ token: TOKEN_KEY, operator: OPERATOR_KEY })
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }
  if (typeof root.document === "undefined") return;

  const storage = root.sessionStorage;
  const token = storage.getItem(TOKEN_KEY);
  const status = root.document.getElementById("page-status");
  const operatorLabel = root.document.getElementById("operator-label");
  const operatorsList = root.document.getElementById("operators-list");
  const emptyState = root.document.getElementById("empty-state");
  const searchForm = root.document.getElementById("search-form");
  const operatorForm = root.document.getElementById("operator-form");
  const navButtons = Array.from(root.document.querySelectorAll("[data-view]"));
  const views = Array.from(root.document.querySelectorAll(".task-view"));
  const previousPage = root.document.getElementById("previous-page");
  const nextPage = root.document.getElementById("next-page");
  const pageLabel = root.document.getElementById("page-label");
  const dialog = root.document.getElementById("deactivate-dialog");
  const deactivateForm = root.document.getElementById("deactivate-form");
  const deactivateReason = root.document.getElementById("deactivate-reason");
  const deactivateLabel = root.document.getElementById("deactivate-label");

  let client;
  let operator;
  let page = 1;
  let search = {};
  let total = 0;
  let perPage = 20;
  let selectedOperator;
  let inProgress = false;

  function setStatus(message, state = "error") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function clearSession() {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
  }

  function handleError(error) {
    if (error?.code === "UNAUTHORIZED") {
      clearSession();
      root.location.replace(LOGIN_URL);
      return;
    }
    setStatus(error?.message || "Não foi possível concluir a operação.");
  }

  function showView(viewId) {
    for (const view of views) view.hidden = view.id !== viewId;
    for (const button of navButtons) button.setAttribute("aria-pressed", String(button.dataset.view === viewId));
  }

  async function loadOperators() {
    try {
      const response = await client.list(token, { ...search, page, per_page: perPage });
      const items = Array.isArray(response.items) ? response.items : [];
      total = Number(response.total || 0);
      operatorsList.replaceChildren();
      emptyState.hidden = items.length > 0;

      for (const item of items) {
        const row = root.document.createElement("tr");
        const values = [
          item.matricula,
          item.name,
          item.role === "ADMIN" ? "Admin" : "Funcionário",
          item.active === false ? "Desativado" : "Ativo"
        ];
        for (const value of values) {
          const cell = root.document.createElement("td");
          cell.textContent = value || "—";
          row.append(cell);
        }
        const actions = root.document.createElement("td");
        const isSelf = item.id === operator.id;
        if (!isSelf && item.active !== false) {
          const nextRole = item.role === "ADMIN" ? "FUNCIONARIO" : "ADMIN";
          const roleButton = root.document.createElement("button");
          roleButton.type = "button";
          roleButton.className = "role-button";
          roleButton.textContent = nextRole === "ADMIN" ? "Promover a Admin" : "Tornar Funcionário";
          roleButton.addEventListener("click", async () => {
            if (!root.confirm(`Alterar o perfil de "${item.name}" para ${nextRole}?`)) return;
            try {
              await client.updateRole(token, item.id, nextRole);
              setStatus("Perfil atualizado.", "success");
              await loadOperators();
            } catch (error) {
              handleError(error);
            }
          });
          actions.append(roleButton);

          const deactivateButton = root.document.createElement("button");
          deactivateButton.type = "button";
          deactivateButton.className = "role-button";
          deactivateButton.textContent = "Desativar";
          deactivateButton.addEventListener("click", () => {
            selectedOperator = item;
            deactivateLabel.textContent = `Digite a justificativa para desativar ${item.name} (${item.matricula}).`;
            deactivateReason.value = "";
            dialog.showModal();
          });
          actions.append(deactivateButton);
        } else {
          const selfLabel = root.document.createElement("span");
          selfLabel.textContent = isSelf ? "Conta atual" : "Desativado";
          actions.append(selfLabel);
        }
        row.append(actions);
        operatorsList.append(row);
      }

      const lastPage = Math.max(1, Math.ceil(total / perPage));
      previousPage.disabled = page <= 1;
      nextPage.disabled = page >= lastPage;
      pageLabel.textContent = `Página ${page} de ${lastPage}`;
    } catch (error) {
      handleError(error);
    }
  }

  navButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  root.document.getElementById("logout-button").addEventListener("click", () => {
    clearSession();
    root.location.replace(LOGIN_URL);
  });
  root.document.getElementById("cancel-deactivate").addEventListener("click", () => {
    dialog.close();
    selectedOperator = undefined;
  });
  deactivateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inProgress || !selectedOperator || !deactivateForm.reportValidity()) return;
    inProgress = true;
    try {
      await client.deactivate(token, selectedOperator.id, deactivateReason.value);
      dialog.close();
      selectedOperator = undefined;
      setStatus("Operador desativado.", "success");
      await loadOperators();
    } catch (error) {
      handleError(error);
    } finally {
      inProgress = false;
    }
  });
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    search = Object.fromEntries([...new FormData(searchForm)].filter(([, value]) => value !== ""));
    page = 1;
    await loadOperators();
  });
  previousPage.addEventListener("click", async () => {
    if (page <= 1) return;
    page -= 1;
    await loadOperators();
  });
  nextPage.addEventListener("click", async () => {
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    if (page >= lastPage) return;
    page += 1;
    await loadOperators();
  });

  const cpfInput = root.document.getElementById("cpf");
  cpfInput.addEventListener("input", () => {
    const digits = normalizeCpf(cpfInput.value).slice(0, 11);
    cpfInput.value = digits.length > 9
      ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
      : digits.length > 6
        ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
        : digits.length > 3
          ? `${digits.slice(0, 3)}.${digits.slice(3)}`
          : digits;
  });

  operatorForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inProgress || !operatorForm.reportValidity()) return;
    const data = operatorPayload(new FormData(operatorForm).entries());
    if (normalizeCpf(data.cpf).length !== 11) {
      setStatus("Informe um CPF com 11 dígitos.");
      return;
    }
    if (!isValidPassword(data.password)) {
      setStatus("A senha deve ter ao menos 8 caracteres, uma letra e um dígito.");
      return;
    }

    inProgress = true;
    const submitButton = root.document.getElementById("create-submit");
    submitButton.disabled = true;
    try {
      await client.create(token, data);
      operatorForm.reset();
      setStatus("Funcionário cadastrado.", "success");
      showView("list-view");
      search = {};
      page = 1;
      await loadOperators();
    } catch (error) {
      handleError(error);
    } finally {
      submitButton.disabled = false;
      inProgress = false;
    }
  });

  async function initialize() {
    if (!token) {
      root.location.replace(LOGIN_URL);
      return;
    }
    try {
      client = createOperatorsClient(root.BIBLIOTECA_CONFIG);
      operator = await client.currentOperator(token);
    } catch (error) {
      if (error?.code === "UNAUTHORIZED") clearSession();
      root.location.replace(LOGIN_URL);
      return;
    }
    if (!operator || operator.role !== "ADMIN") {
      clearSession();
      root.location.replace(LOGIN_URL);
      return;
    }
    operatorLabel.textContent = `${operator.name} · Administrador`;
    storage.setItem(OPERATOR_KEY, JSON.stringify(operator));
    showView("list-view");
    await loadOperators();
  }

  initialize();
})(globalThis);
