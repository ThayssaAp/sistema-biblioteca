(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";

  function createAuthClient(config, fetchImplementation) {
    const baseUrl = typeof config?.apiBaseUrl === "string"
      ? config.apiBaseUrl.replace(/\/+$/, "")
      : "";
    const request = fetchImplementation || root.fetch.bind(root);

    if (!baseUrl) {
      throw new Error("API_BASE_URL_REQUIRED");
    }

    async function readJson(response) {
      try {
        return await response.json();
      } catch {
        throw new Error("INVALID_API_RESPONSE");
      }
    }

    function isOperator(operator) {
      return operator
        && Number.isInteger(operator.id)
        && typeof operator.matricula === "string"
        && typeof operator.name === "string"
        && ["FUNCIONARIO", "ADMIN"].includes(operator.role);
    }

    return Object.freeze({
      async login(matricula, password) {
        const response = await request(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matricula, password })
        });

        if (!response.ok) {
          throw new Error("AUTHENTICATION_FAILED");
        }

        const result = await readJson(response);
        if (typeof result.authToken !== "string" || !isOperator(result.operator)) {
          throw new Error("INVALID_API_RESPONSE");
        }
        return result;
      },

      async currentOperator(token) {
        const response = await request(`${baseUrl}/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("SESSION_INVALID");
        }

        const operator = await readJson(response);
        if (!isOperator(operator)) {
          throw new Error("INVALID_API_RESPONSE");
        }
        return operator;
      }
    });
  }

  function storeSession(storage, result) {
    storage.setItem(TOKEN_KEY, result.authToken);
    storage.setItem(OPERATOR_KEY, JSON.stringify(result.operator));
  }

  function clearSession(storage) {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
  }

  const publicApi = Object.freeze({
    createAuthClient,
    storeSession,
    clearSession,
    storageKeys: Object.freeze({ token: TOKEN_KEY, operator: OPERATOR_KEY })
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }

  if (typeof root.document === "undefined") {
    return;
  }

  const form = root.document.getElementById("login-form");
  if (!form) {
    return;
  }

  const matriculaInput = root.document.getElementById("matricula");
  const passwordInput = root.document.getElementById("password");
  const status = root.document.getElementById("login-status");
  const submitButton = root.document.getElementById("submit-button");
  const buttonLabel = root.document.getElementById("button-label");
  const sessionPanel = root.document.getElementById("session-panel");
  const operatorName = root.document.getElementById("operator-name");
  const operatorRole = root.document.getElementById("operator-role");
  const logoutButton = root.document.getElementById("logout-button");
  const storage = root.sessionStorage;

  let authClient;
  try {
    authClient = createAuthClient(root.BIBLIOTECA_CONFIG, root.fetch.bind(root));
  } catch {
    status.textContent = "A tela ainda não está configurada para conectar ao sistema.";
    form.hidden = true;
    return;
  }

  function showAuthenticated(operator) {
    form.hidden = true;
    sessionPanel.hidden = false;
    operatorName.textContent = operator.name;
    operatorRole.textContent = operator.role === "ADMIN" ? "Administrador" : "Funcionário";
    setStatus("Autenticação realizada com sucesso.", "success");
  }

  function showLogin() {
    sessionPanel.hidden = true;
    form.hidden = false;
    operatorName.textContent = "";
    operatorRole.textContent = "";
    passwordInput.value = "";
  }

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "error";
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    buttonLabel.textContent = isLoading ? "Validando..." : "Entrar";
    matriculaInput.readOnly = isLoading;
    passwordInput.readOnly = isLoading;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "error");

    const matricula = matriculaInput.value.trim();
    const password = passwordInput.value;
    if (!matricula || !password) {
      setStatus("Informe sua matrícula e senha.");
      (matricula ? passwordInput : matriculaInput).focus();
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.login(matricula, password);
      storeSession(storage, result);
      passwordInput.value = "";
      showAuthenticated(result.operator);
    } catch {
      setStatus("Não foi possível entrar. Confira suas credenciais e tente novamente.");
      passwordInput.value = "";
      passwordInput.focus();
    } finally {
      setLoading(false);
    }
  });

  logoutButton.addEventListener("click", () => {
    clearSession(storage);
    showLogin();
    setStatus("Sessão encerrada.", "success");
    matriculaInput.focus();
  });

  const savedToken = storage.getItem(TOKEN_KEY);
  if (savedToken) {
    setStatus("Verificando sua sessão...", "success");
    authClient.currentOperator(savedToken)
      .then((operator) => {
        storage.setItem(OPERATOR_KEY, JSON.stringify(operator));
        showAuthenticated(operator);
      })
      .catch(() => {
        clearSession(storage);
        showLogin();
        setStatus("Sua sessão expirou. Entre novamente.");
      });
  } else {
    matriculaInput.focus();
  }
})(globalThis);
