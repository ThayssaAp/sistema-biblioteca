(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const LOGIN_URL = "../login/index.html";

  function isValidCpf(value) {
    const cpf = String(value || "").replace(/\D/g, "");
    if (cpf.length !== 11 || cpf.split("").every((digit) => digit === cpf[0])) return false;
    let sum = 0;
    for (let index = 0; index < 9; index += 1) sum += Number(cpf[index]) * (10 - index);
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (digit !== Number(cpf[9])) return false;
    sum = 0;
    for (let index = 0; index < 10; index += 1) sum += Number(cpf[index]) * (11 - index);
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    return digit === Number(cpf[10]);
  }

  function normalizeCpf(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatCpf(value) {
    const digits = normalizeCpf(value).slice(0, 11);
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatPhone(value) {
    const digits = normalizePhone(value).slice(0, 11);
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\(\d{2}\))\s?(\d{5})(\d)/, "$1 $2-$3");
  }

  function formatBirthDate(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 8);
    return digits
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  }

  function normalizeBirthDate(value) {
    const match = String(value || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  }

  function isValidBirthDate(value) {
    const isoDate = normalizeBirthDate(value);
    if (!isoDate) return false;
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day
      && date <= todayUtc;
  }

  function validateReader(data) {
    const errors = {};
    if (!isValidCpf(data.cpf)) errors.cpf = "Informe um CPF válido.";
    ["name", "birth_date", "address", "phone"].forEach((field) => {
      if (!String(data[field] || "").trim()) errors[field] = "Este campo é obrigatório.";
    });
    if (data.birth_date && !isValidBirthDate(data.birth_date)) {
      errors.birth_date = "Informe uma data válida no formato dd/mm/aaaa.";
    }
    if (data.phone && normalizePhone(data.phone).length !== 11) {
      errors.phone = "Informe um telefone válido com 11 dígitos.";
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Informe um e-mail válido.";
    }
    if (!data.temporary_password || data.temporary_password.length < 8 || !/[A-Za-z]/.test(data.temporary_password) || !/[0-9]/.test(data.temporary_password)) {
      errors.temporary_password = "Use ao menos 8 caracteres, uma letra e um dígito.";
    }
    return errors;
  }

  function chooseSearchFilter(value) {
    const text = String(value || "").trim();
    return /^[\d.-]+$/.test(text) ? { cpf: text } : { nome: text };
  }

  function createClient(config, fetchImplementation, storage, redirect) {
    const baseUrl = String((config || {}).apiBaseUrl || "").replace(/\/+$/, "");
    const request = fetchImplementation || root.fetch.bind(root);
    if (!baseUrl) throw new Error("API_BASE_URL_REQUIRED");

    function token() {
      return storage.getItem(TOKEN_KEY);
    }
    function requireToken() {
      const current = token();
      if (!current) {
        redirect();
        throw new Error("SESSION_REQUIRED");
      }
      return current;
    }
    async function call(path, options) {
      const authToken = requireToken();
      const response = await request(`${baseUrl}${path}`, Object.assign({}, options, {
        headers: Object.assign({ Accept: "application/json", Authorization: `Bearer ${authToken}` }, (options || {}).headers || {})
      }));
      if (response.status === 401) {
        storage.removeItem(TOKEN_KEY);
        storage.removeItem("biblioteca.operator");
        redirect();
        throw new Error("SESSION_INVALID");
      }
      return response;
    }
    return Object.freeze({
      createReader(data) {
        const payload = Object.assign({}, data, {
          cpf: normalizeCpf(data.cpf),
          phone: normalizePhone(data.phone),
          birth_date: normalizeBirthDate(data.birth_date)
        });
        if (!String(payload.email || "").trim()) {
          delete payload.email;
        } else {
          payload.email = payload.email.trim();
        }
        return call("/leitores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      },
      listReaders(filter, page, perPage) {
        const params = new URLSearchParams(Object.assign({}, filter, { page, per_page: perPage }));
        return call(`/leitores?${params.toString()}`);
      }
    });
  }

  function messageFromResponse(response, fallback) {
    return response.json().then((body) => {
      const message = body && (body.message || body.error);
      return message || fallback;
    }).catch(() => fallback);
  }

  function setupRegistration(document, client) {
    const form = document.getElementById("reader-form");
    if (!form) return;
    const cpf = document.getElementById("cpf");
    const status = document.getElementById("form-status");
    const button = document.getElementById("submit-button");
    const phone = document.getElementById("phone");
    const birthDate = document.getElementById("birth_date");
    const fields = ["cpf", "name", "birth_date", "address", "phone", "email", "temporary_password"];
    const setStatus = (text, state) => {
      status.textContent = text;
      status.dataset.state = state || "error";
    };
    cpf.addEventListener("input", () => { cpf.value = formatCpf(cpf.value); });
    phone.addEventListener("input", () => { phone.value = formatPhone(phone.value); });
    birthDate.addEventListener("input", () => { birthDate.value = formatBirthDate(birthDate.value); });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateReader(data);
      fields.forEach((field) => {
        const error = document.getElementById(`${field}-error`);
        if (error) error.textContent = errors[field] || "";
      });
      const firstError = fields.find((field) => errors[field]);
      if (firstError) {
        document.getElementById(firstError).focus();
        setStatus("Corrija os campos indicados.");
        return;
      }
      button.disabled = true;
      button.textContent = "Salvando...";
      setStatus("Salvando leitor...", "loading");
      client.createReader(data).then((response) => {
        if (response.ok) {
          form.reset();
          setStatus(`Leitor ${data.name.trim()} cadastrado com sucesso.`, "success");
          cpf.focus();
        } else if (response.status === 409) {
          document.getElementById("cpf-error").textContent = "CPF já cadastrado.";
          cpf.focus();
          setStatus("Não foi possível cadastrar o leitor.");
        } else {
          return messageFromResponse(response, "Não foi possível cadastrar o leitor.").then((message) => {
            if (message === "CPF já cadastrado.") {
              document.getElementById("cpf-error").textContent = message;
              cpf.focus();
            }
            setStatus(message);
          });
        }
      }).catch((error) => {
        if (error.message !== "SESSION_INVALID" && error.message !== "SESSION_REQUIRED") {
          setStatus("Não foi possível conectar ao sistema.");
        }
      }).finally(() => {
        button.disabled = false;
        button.textContent = "Cadastrar leitor";
      });
    });
    cpf.focus();
  }

  function setupConsultation(document, client) {
    const form = document.getElementById("search-form");
    if (!form) return;
    const input = document.getElementById("search");
    const status = document.getElementById("results-status");
    const body = document.getElementById("readers-body");
    const previous = document.getElementById("previous-page");
    const next = document.getElementById("next-page");
    let page = 1;
    const perPage = 20;
    const render = (result) => {
      body.replaceChildren();
      (result.items || []).forEach((reader) => {
        const row = document.createElement("tr");
        [reader.cpf, reader.name, reader.birth_date, reader.address, reader.phone, reader.email || "—"].forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });
        body.appendChild(row);
      });
      status.textContent = result.items && result.items.length ? `${result.total} leitor(es) encontrado(s).` : "Nenhum leitor encontrado.";
      previous.disabled = page <= 1;
      next.disabled = page * perPage >= (result.total || 0);
    };
    const search = () => {
      status.textContent = "Consultando...";
      previous.disabled = true;
      next.disabled = true;
      client.listReaders(chooseSearchFilter(input.value), page, perPage).then((response) => {
        if (!response.ok) return messageFromResponse(response, "Não foi possível consultar os leitores.").then((message) => { throw new Error(message); });
        return response.json();
      }).then(render).catch((error) => {
        if (error.message !== "SESSION_INVALID" && error.message !== "SESSION_REQUIRED") status.textContent = error.message || "Não foi possível consultar os leitores.";
      });
    };
    form.addEventListener("submit", (event) => { event.preventDefault(); page = 1; search(); });
    previous.addEventListener("click", () => { if (page > 1) { page -= 1; search(); } });
    next.addEventListener("click", () => { page += 1; search(); });
    input.focus();
  }

  const api = Object.freeze({
    isValidCpf,
    normalizeCpf,
    formatCpf,
    normalizePhone,
    formatPhone,
    formatBirthDate,
    normalizeBirthDate,
    isValidBirthDate,
    validateReader,
    chooseSearchFilter,
    createClient
  });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (!root.document) return;
  if (!root.sessionStorage.getItem(TOKEN_KEY)) {
    root.location.href = LOGIN_URL;
    return;
  }
  try {
    const client = createClient(root.BIBLIOTECA_LEITORES_CONFIG, root.fetch.bind(root), root.sessionStorage, () => { root.location.href = LOGIN_URL; });
    setupRegistration(root.document, client);
    setupConsultation(root.document, client);
  } catch (error) {
    if (error.message === "API_BASE_URL_REQUIRED") {
      const status = root.document.getElementById("form-status") || root.document.getElementById("results-status");
      if (status) status.textContent = "A tela ainda não está configurada para conectar ao sistema.";
    }
  }
})(globalThis);
