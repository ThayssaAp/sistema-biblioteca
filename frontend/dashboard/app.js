(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const LOGIN_URL = "../login/index.html";
  const METRIC_FIELDS = Object.freeze([
    "total_readers",
    "readers_with_active_loans",
    "available_books",
    "borrowed_books",
    "overdue_loans",
    "pending_fines"
  ]);

  function normalizeDashboard(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("INVALID_DASHBOARD_RESPONSE");
    }
    const normalized = {};
    for (const field of METRIC_FIELDS) {
      if (!Number.isFinite(data[field]) || data[field] < 0) {
        throw new Error("INVALID_DASHBOARD_RESPONSE");
      }
      normalized[field] = data[field];
    }
    return normalized;
  }

  function createDashboardClient(config, fetchImplementation) {
    const baseUrl = typeof config?.apiBaseUrl === "string"
      ? config.apiBaseUrl.replace(/\/+$/, "")
      : "";
    const request = fetchImplementation || root.fetch.bind(root);
    if (!baseUrl) {
      throw new Error("API_BASE_URL_REQUIRED");
    }

    async function send(path, token) {
      const response = await request(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      let body = null;
      try {
        body = await response.json();
      } catch {
        if (response.ok) throw new Error("INVALID_API_RESPONSE");
      }
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("SESSION_INVALID");
        }
        throw new Error(typeof body?.message === "string"
          ? body.message
          : "DASHBOARD_REQUEST_FAILED");
      }
      return body;
    }

    return Object.freeze({
      currentOperator: (token) => send("/auth/me", token),
      dashboard: async (token) => normalizeDashboard(await send("/admin/dashboard", token))
    });
  }

  const publicApi = Object.freeze({
    createDashboardClient,
    normalizeDashboard,
    metricFields: METRIC_FIELDS,
    storageKeys: Object.freeze({ token: TOKEN_KEY, operator: OPERATOR_KEY })
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }
  if (typeof root.document === "undefined") return;

  const storage = root.sessionStorage;
  const token = storage.getItem(TOKEN_KEY);
  const status = root.document.getElementById("page-status");
  const retryButton = root.document.getElementById("retry-button");
  const content = root.document.getElementById("dashboard-content");
  const operatorLabel = root.document.getElementById("operator-label");
  const logoutButton = root.document.getElementById("logout-button");
  let client;
  let loading = false;

  function setStatus(message, state = "error") {
    status.textContent = message;
    status.dataset.state = state;
  }

  function clearSession() {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
  }

  function render(data) {
    const mappings = {
      total_readers: "metric-total-readers",
      readers_with_active_loans: "metric-readers-active",
      available_books: "metric-available-books",
      borrowed_books: "metric-borrowed-books",
      overdue_loans: "metric-overdue-loans",
      pending_fines: "metric-pending-fines"
    };
    for (const [field, elementId] of Object.entries(mappings)) {
      root.document.getElementById(elementId).textContent = String(data[field]);
    }
    content.hidden = false;
  }

  async function load() {
    if (loading) return;
    loading = true;
    retryButton.hidden = true;
    content.hidden = true;
    setStatus("Aguarde enquanto carregamos os indicadores.", "success");

    try {
      const operator = await client.currentOperator(token);
      if (!operator || operator.role !== "ADMIN") {
        clearSession();
        root.location.replace(LOGIN_URL);
        return;
      }
      operatorLabel.textContent = `${operator.name} · Administrador`;
      const data = await client.dashboard(token);
      render(data);
      setStatus("Indicadores atualizados.", "success");
    } catch (error) {
      content.hidden = true;
      if (error?.message === "SESSION_INVALID") {
        clearSession();
        root.location.replace(LOGIN_URL);
        return;
      }
      setStatus(error?.message === "INVALID_DASHBOARD_RESPONSE"
        ? "Não foi possível interpretar os indicadores."
        : "Não foi possível carregar os indicadores.");
      retryButton.hidden = false;
    } finally {
      loading = false;
    }
  }

  logoutButton.addEventListener("click", () => {
    clearSession();
    root.location.replace(LOGIN_URL);
  });
  retryButton.addEventListener("click", load);

  if (!token) {
    clearSession();
    root.location.replace(LOGIN_URL);
    return;
  }

  try {
    client = createDashboardClient(root.BIBLIOTECA_CONFIG, root.fetch.bind(root));
  } catch (error) {
    setStatus(error.message || "Não foi possível configurar o Dashboard.");
  }
  if (client) load();
})(typeof window !== "undefined" ? window : globalThis);
