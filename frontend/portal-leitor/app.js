(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.readerAuthToken";
  const READER_KEY = "biblioteca.reader";
  const PENDING_KEY = "biblioteca.readerPasswordChange";
  const LOGIN_URL = "./index.html";
  const CHANGE_URL = "./change-password.html";
  const HOME_URL = "./home.html";

  function normalizeCpf(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCpf(value) {
    return normalizeCpf(value).slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  function validPassword(value) {
    return typeof value === "string" && value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
  }

  function validateLogin(data) {
    const errors = {};
    if (normalizeCpf(data.cpf).length !== 11) errors.cpf = "Informe um CPF válido.";
    if (!data.password) errors.password = "Informe sua senha.";
    return errors;
  }

  function validatePasswordChange(data) {
    const errors = {};
    if (!validPassword(data.new_password)) errors.new_password = "Use ao menos 8 caracteres, uma letra e um dígito.";
    if (data.new_password !== data.password_confirmation) errors.password_confirmation = "As senhas não conferem.";
    if (data.new_password === data.temporary_password) errors.new_password = "A nova senha deve ser diferente da senha temporária.";
    return errors;
  }

  function createClient(config, fetchImplementation, storage, redirect) {
    const baseUrl = String((config || {}).apiBaseUrl || "").replace(/\/+$/, "");
    const request = fetchImplementation || root.fetch.bind(root);
    if (!baseUrl) throw new Error("API_BASE_URL_REQUIRED");

    function clear() {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(READER_KEY);
      storage.removeItem(PENDING_KEY);
    }

    async function readJson(response) {
      try {
        return await response.json();
      } catch {
        throw new Error("INVALID_API_RESPONSE");
      }
    }

    async function call(path, options) {
      const token = storage.getItem(TOKEN_KEY);
      const headers = Object.assign({ Accept: "application/json" }, (options || {}).headers || {});
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await request(`${baseUrl}${path}`, Object.assign({}, options, { headers }));
      if (response.status === 401) {
        clear();
        redirect(LOGIN_URL);
        throw new Error("SESSION_INVALID");
      }
      return response;
    }

    return Object.freeze({
      async login(cpf, password) {
        const response = await request(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ cpf: normalizeCpf(cpf), password })
        });
        if (!response.ok) throw new Error("AUTHENTICATION_FAILED");
        const result = await readJson(response);
        if (typeof result.authToken !== "string" || !result.reader || typeof result.reader.id !== "number") {
          throw new Error("INVALID_API_RESPONSE");
        }
        storage.setItem(TOKEN_KEY, result.authToken);
        storage.setItem(READER_KEY, JSON.stringify(result.reader));
        storage.setItem(PENDING_KEY, String(result.requiresPasswordChange === true));
        return result;
      },
      async changePassword(newPassword, passwordConfirmation) {
        const response = await call("/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ new_password: newPassword, password_confirmation: passwordConfirmation })
        });
        if (!response.ok) {
          const body = await readJson(response).catch(() => ({}));
          throw new Error(body.message || body.error || "PASSWORD_CHANGE_FAILED");
        }
        const result = await readJson(response);
        if (typeof result.authToken !== "string" || !result.reader) throw new Error("INVALID_API_RESPONSE");
        storage.setItem(TOKEN_KEY, result.authToken);
        storage.setItem(READER_KEY, JSON.stringify(result.reader));
        storage.removeItem(PENDING_KEY);
        return result;
      },
      async currentReader() {
        const response = await call("/auth/me");
        if (!response.ok) throw new Error("SESSION_INVALID");
        return readJson(response);
      },
      clear
    });
  }

  function messageFromResponse(response, fallback) {
    return response.json().then((body) => (body && (body.message || body.error)) || fallback).catch(() => fallback);
  }

  function setupLogin(document, client, storage, location) {
    const form = document.getElementById("reader-login-form");
    if (!form) return;
    const cpf = document.getElementById("cpf");
    const password = document.getElementById("password");
    const status = document.getElementById("form-status");
    const button = document.getElementById("submit-button");
    const fields = ["cpf", "password"];
    cpf.focus();
    cpf.addEventListener("input", () => { cpf.value = formatCpf(cpf.value); });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateLogin(data);
      fields.forEach((field) => { document.getElementById(`${field}-error`).textContent = errors[field] || ""; });
      const firstError = fields.find((field) => errors[field]);
      if (firstError) { document.getElementById(firstError).focus(); return; }
      button.disabled = true;
      status.dataset.state = "loading";
      status.textContent = "Validando...";
      try {
        const result = await client.login(data.cpf, data.password);
        password.value = "";
        location.replace(result.requiresPasswordChange ? CHANGE_URL : HOME_URL);
      } catch {
        status.textContent = "Não foi possível entrar. Confira suas credenciais e tente novamente.";
        password.value = "";
        password.focus();
      } finally {
        button.disabled = false;
      }
    });
  }

  function setupPasswordChange(document, client, location) {
    const form = document.getElementById("password-change-form");
    if (!form) return;
    const status = document.getElementById("form-status");
    const button = document.getElementById("submit-button");
    const fields = ["new_password", "password_confirmation"];
    document.getElementById("new_password").focus();
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validatePasswordChange(data);
      fields.forEach((field) => { document.getElementById(`${field}-error`).textContent = errors[field] || ""; });
      const firstError = fields.find((field) => errors[field]);
      if (firstError) { document.getElementById(firstError).focus(); return; }
      button.disabled = true;
      status.dataset.state = "loading";
      status.textContent = "Salvando nova senha...";
      try {
        await client.changePassword(data.new_password, data.password_confirmation);
        form.reset();
        location.replace(HOME_URL);
      } catch (error) {
        status.textContent = error.message === "A nova senha deve ser diferente da senha temporária."
          ? error.message
          : "Não foi possível alterar a senha. Tente novamente.";
      } finally {
        button.disabled = false;
      }

      function setupHome(document, client, storage, location) {
        const heading = document.getElementById("page-title");
        if (!heading) return;
        const logout = document.getElementById("logout-link");
        if (logout) {
          logout.addEventListener("click", (event) => {
            event.preventDefault();
            client.clear();
            location.replace(LOGIN_URL);
          });
        }
        if (!storage.getItem(TOKEN_KEY)) {
          location.replace(LOGIN_URL);
          return;
        }
        if (storage.getItem(PENDING_KEY) === "true") {
          location.replace(CHANGE_URL);
          return;
        }
        client.currentReader().catch(() => {
          location.replace(LOGIN_URL);
        });
      }
    });
  }

  const api = Object.freeze({
    normalizeCpf,
    formatCpf,
    validPassword,
    validateLogin,
    validatePasswordChange,
    createClient,
    storageKeys: Object.freeze({ token: TOKEN_KEY, reader: READER_KEY, pending: PENDING_KEY })
  });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.document) return;

  const storage = root.sessionStorage;
  let client;
  try {
    client = createClient(root.BIBLIOTECA_LEITOR_CONFIG, root.fetch.bind(root), storage, (url) => root.location.replace(url));
  } catch {
    const status = root.document.getElementById("form-status");
    if (status) status.textContent = "A tela ainda não está configurada para conectar ao sistema.";
    return;
  }
  setupLogin(root.document, client, storage, root.location);
  setupPasswordChange(root.document, client, root.location);
  setupHome(root.document, client, storage, root.location);
})(globalThis);
