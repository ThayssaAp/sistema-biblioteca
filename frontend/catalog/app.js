(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const AGE_RATINGS = ["Livre", "10+", "12+", "14+", "16+", "18+", "Não informada"];
  const BOOK_STATUSES = ["Disponível", "Emprestado"];
  const DEFAULT_ACTION_ERROR = "Não foi possível concluir a operação. Verifique os dados e tente novamente.";
  const GENRE_IN_USE_ERROR = "Não é possível remover um gênero que está associado a exemplares.";
  const GENRE_DUPLICATE_ERROR = "Já existe um gênero com esse nome.";

  function actionErrorMessage(error) {
    if (error?.message === "GENRE_IN_USE") {
      return GENRE_IN_USE_ERROR;
    }
    if (error?.message === "GENRE_DUPLICATE") {
      return GENRE_DUPLICATE_ERROR;
    }
    return DEFAULT_ACTION_ERROR;
  }

  function canManageGenres(role) {
    return role === "ADMIN";
  }

  function initialCatalogView(search, role) {
    const requestedView = new URLSearchParams(search || "").get("view");
    if (requestedView === "create-view" || requestedView === "search-view") {
      return { viewId: requestedView, accessDenied: false };
    }
    if (requestedView === "genres-view") {
      return canManageGenres(role)
        ? { viewId: requestedView, accessDenied: false }
        : { viewId: "search-view", accessDenied: true };
    }
    return { viewId: "search-view", accessDenied: false };
  }

  function bookPayloadFromEntries(entries) {
    const book = Object.fromEntries(entries);
    book.title = book.title.trim();
    book.genre_id = Number(book.genre_id);
    if (book.publication_year === "") {
      delete book.publication_year;
    } else {
      book.publication_year = Number(book.publication_year);
    }
    if (!book.isbn) {
      delete book.isbn;
    } else {
      book.isbn = book.isbn.trim();
    }
    return book;
  }

  function createCatalogClient(config, fetchImplementation) {
    const authBaseUrl = typeof config?.apiBaseUrl === "string"
      ? config.apiBaseUrl.replace(/\/+$/, "")
      : "";
    const catalogBaseUrl = typeof config?.catalogApiBaseUrl === "string"
      ? config.catalogApiBaseUrl.replace(/\/+$/, "")
      : "";
    const request = fetchImplementation || root.fetch.bind(root);

    if (!authBaseUrl || !catalogBaseUrl) {
      throw new Error("API_BASE_URL_REQUIRED");
    }

    async function send(baseUrl, path, token, options) {
      const response = await request(`${baseUrl}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...(options?.body ? { "Content-Type": "application/json" } : {}),
          ...options?.headers
        }
      });

      let result;
      try {
        result = await response.json();
      } catch {
        if (response.ok) {
          throw new Error("INVALID_API_RESPONSE");
        }
      }
      if (!response.ok) {
        if (typeof result?.message === "string"
          && result.message.includes("Não é possível remover um gênero associado a exemplares.")) {
          throw new Error("GENRE_IN_USE");
        }
        if (typeof result?.message === "string"
          && result.message.includes("Já existe um gênero com esse nome.")) {
          throw new Error("GENRE_DUPLICATE");
        }
        throw new Error(response.status === 401 || response.status === 403
          ? "UNAUTHORIZED"
          : "CATALOG_REQUEST_FAILED");
      }
      return result;
    }

    return Object.freeze({
      currentOperator(token) {
        return send(authBaseUrl, "/auth/me", token, { method: "GET" });
      },
      listGenres(token) {
        return send(catalogBaseUrl, "/genres", token, { method: "GET" });
      },
      createGenre(token, name) {
        return send(catalogBaseUrl, "/genres", token, {
          method: "POST",
          body: JSON.stringify({ name })
        });
      },
      updateGenre(token, genreId, name) {
        return send(catalogBaseUrl, "/genres", token, {
          method: "PATCH",
          body: JSON.stringify({ genre_id: genreId, name })
        });
      },
      deleteGenre(token, genreId) {
        return send(catalogBaseUrl, "/genres", token, {
          method: "DELETE",
          body: JSON.stringify({ genre_id: genreId })
        });
      },
      createBook(token, book) {
        return send(catalogBaseUrl, "/books", token, {
          method: "POST",
          body: JSON.stringify(book)
        });
      },
      listBooks(token, filters) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(filters || {})) {
          if (value !== "") {
            params.set(key, value);
          }
        }
        const query = params.toString();
        return send(catalogBaseUrl, `/books${query ? `?${query}` : ""}`, token, { method: "GET" });
      }
    });
  }

  const publicApi = Object.freeze({
    createCatalogClient,
    bookPayloadFromEntries,
    actionErrorMessage,
    canManageGenres,
    initialCatalogView,
    storageKeys: Object.freeze({ token: TOKEN_KEY, operator: OPERATOR_KEY }),
    ageRatings: AGE_RATINGS,
    bookStatuses: BOOK_STATUSES
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }

  if (typeof root.document === "undefined") {
    return;
  }

  const status = root.document.getElementById("page-status");
  const storage = root.sessionStorage;
  const token = storage.getItem(TOKEN_KEY);

  function setStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state || "error";
  }

  function clearSessionAndReturn() {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
    root.location.replace("../login/index.html");
  }

  if (!token) {
    setStatus("Sua sessão não está ativa. Entre novamente para acessar o acervo.");
    root.setTimeout(() => root.location.replace("../login/index.html"), 1200);
    return;
  }

  let client;
  try {
    client = createCatalogClient(root.BIBLIOTECA_CONFIG, root.fetch.bind(root));
  } catch {
    setStatus("A tela do acervo ainda não está configurada para conectar ao sistema.");
    return;
  }

  const operatorLabel = root.document.getElementById("operator-label");
  const logoutButton = root.document.getElementById("logout-button");
  const navButtons = Array.from(root.document.querySelectorAll("[data-view]"));
  const views = Array.from(root.document.querySelectorAll(".task-view"));
  const genresTab = root.document.getElementById("genres-tab");
  const searchForm = root.document.getElementById("search-form");
  const booksList = root.document.getElementById("books-list");
  const emptyState = root.document.getElementById("empty-state");
  const filterGenre = root.document.getElementById("filter-genre");
  const bookGenre = root.document.getElementById("book-genre");
  const bookForm = root.document.getElementById("book-form");
  const genreForm = root.document.getElementById("genre-form");
  const genreList = root.document.getElementById("genre-list");
  const yearInput = root.document.getElementById("book-year");
  let operator;
  let genres = [];

  yearInput.max = String(new Date().getFullYear());

  function showView(viewId) {
    if (viewId === "genres-view" && !canManageGenres(operator?.role)) {
      return;
    }
    for (const view of views) {
      view.hidden = view.id !== viewId;
    }
    for (const button of navButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.view === viewId));
    }
    setStatus("", "success");
  }

  function appendGenreOptions(select, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));
    for (const genre of genres) {
      select.add(new Option(genre.name, String(genre.id)));
    }
  }

  function renderGenres() {
    appendGenreOptions(filterGenre, "Todos os gêneros");
    appendGenreOptions(bookGenre, "Selecione um gênero");
    genreList.replaceChildren();

    for (const genre of genres) {
      const item = root.document.createElement("li");
      item.className = "genre-item";

      const input = root.document.createElement("input");
      input.type = "text";
      input.value = genre.name;
      input.maxLength = 80;
      input.setAttribute("aria-label", `Nome do gênero ${genre.name}`);
      input.required = true;

      const saveButton = root.document.createElement("button");
      saveButton.type = "button";
      saveButton.className = "secondary-button";
      saveButton.textContent = "Salvar";
      saveButton.setAttribute("aria-label", `Salvar gênero ${genre.name}`);
      saveButton.addEventListener("click", async () => {
        if (!input.reportValidity()) {
          return;
        }
        await runAction(async () => {
          await client.updateGenre(token, genre.id, input.value.trim());
          await loadGenres();
          setStatus("Gênero atualizado.", "success");
        }, saveButton);
      });

      const deleteButton = root.document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "secondary-button";
      deleteButton.textContent = "Remover";
      deleteButton.setAttribute("aria-label", `Remover gênero ${genre.name}`);
      deleteButton.addEventListener("click", async () => {
        if (!root.confirm(`Remover o gênero "${genre.name}"?`)) {
          return;
        }
        await runAction(async () => {
          await client.deleteGenre(token, genre.id);
          await loadGenres();
          setStatus("Gênero removido.", "success");
        }, deleteButton);
      });

      item.append(input, saveButton, deleteButton);
      genreList.append(item);
    }

    if (genres.length === 0) {
      const item = root.document.createElement("li");
      item.className = "empty-state";
      item.textContent = "Nenhum gênero cadastrado.";
      genreList.append(item);
    }
  }

  function renderBooks(books) {
    booksList.replaceChildren();
    emptyState.hidden = books.length > 0;

    for (const book of books) {
      const row = root.document.createElement("tr");
      const cells = [
        { value: book.code, className: "book-code" },
        { value: book.title },
        { value: book.genre_name },
        { value: book.age_rating === "Não informada" ? "Não informada (18+)" : book.age_rating }
      ];

      for (const cellData of cells) {
        const cell = root.document.createElement("td");
        cell.textContent = cellData.value || "—";
        if (cellData.className) {
          cell.className = cellData.className;
        }
        row.append(cell);
      }

      const statusCell = root.document.createElement("td");
      const badge = root.document.createElement("span");
      badge.className = "status-badge";
      badge.dataset.status = book.status;
      badge.textContent = book.status;
      statusCell.append(badge);
      row.append(statusCell);
      booksList.append(row);
    }
  }

  async function loadGenres() {
    const result = await client.listGenres(token);
    if (!Array.isArray(result) || result.some((genre) => !Number.isInteger(genre.id) || typeof genre.name !== "string")) {
      throw new Error("INVALID_API_RESPONSE");
    }
    genres = result;
    renderGenres();
  }

  async function loadBooks(filters) {
    const result = await client.listBooks(token, filters);
    if (!Array.isArray(result)) {
      throw new Error("INVALID_API_RESPONSE");
    }
    renderBooks(result);
  }

  async function runAction(action, button) {
    if (button) {
      button.disabled = true;
    }
    setStatus("Aguarde...", "success");
    try {
      await action();
      if (status.textContent === "Aguarde...") {
        setStatus("", "success");
      }
    } catch (error) {
      setStatus(actionErrorMessage(error));
    } finally {
      if (button) {
        button.disabled = false;
      }
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  logoutButton.addEventListener("click", () => {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
    root.location.replace("../login/index.html");
  });

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(searchForm);
    const filters = Object.fromEntries(formData.entries());
    await runAction(() => loadBooks(filters), searchForm.querySelector('[type="submit"]'));
  });

  root.document.getElementById("clear-filters").addEventListener("click", async (event) => {
    searchForm.reset();
    await runAction(() => loadBooks({}), event.currentTarget);
  });

  root.document.getElementById("cancel-create").addEventListener("click", () => {
    bookForm.reset();
    showView("search-view");
  });

  bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(bookForm);
    const book = bookPayloadFromEntries(formData.entries());

    await runAction(async () => {
      const created = await client.createBook(token, book);
      if (!created || typeof created.code !== "string") {
        throw new Error("INVALID_API_RESPONSE");
      }
      bookForm.reset();
      await loadGenres();
      await loadBooks({});
      showView("search-view");
      setStatus(`Exemplar cadastrado com o código ${created.code}.`, "success");
    }, bookForm.querySelector('[type="submit"]'));
  });

  genreForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nameInput = root.document.getElementById("genre-name");
    await runAction(async () => {
      await client.createGenre(token, nameInput.value.trim());
      genreForm.reset();
      await loadGenres();
      setStatus("Gênero adicionado.", "success");
    }, genreForm.querySelector('[type="submit"]'));
  });

  async function initialize() {
    try {
      operator = await client.currentOperator(token);
    } catch (error) {
      if (error?.message === "UNAUTHORIZED") {
        clearSessionAndReturn();
        return;
      }
      setStatus("Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.");
      return;
    }

    if (!operator || !Number.isInteger(operator.id) || typeof operator.name !== "string"
      || !["FUNCIONARIO", "ADMIN"].includes(operator.role)) {
      clearSessionAndReturn();
      return;
    }

    storage.setItem(OPERATOR_KEY, JSON.stringify(operator));
    operatorLabel.textContent = `${operator.name} · ${operator.role === "ADMIN" ? "Administrador" : "Funcionário"}`;
    genresTab.hidden = !canManageGenres(operator.role);

    try {
      await loadGenres();
      await loadBooks({});
      const initialView = initialCatalogView(root.location.search, operator.role);
      showView(initialView.viewId);
      setStatus(initialView.accessDenied
        ? "A gestão de gêneros está disponível somente para Admin."
        : "", initialView.accessDenied ? "error" : "success");
    } catch {
      setStatus("Não foi possível carregar o acervo. Tente novamente.");
    }
  }

  initialize();
})(globalThis);
