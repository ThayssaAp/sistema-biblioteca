(function (root) {
  "use strict";

  const TOKEN_KEY = "biblioteca.authToken";
  const OPERATOR_KEY = "biblioteca.operator";
  const LOGIN_URL = "../login/index.html";
  const MENU_URL = "./index.html";

  const MENU_SECTIONS = Object.freeze([
    {
      title: "Sistema principal",
      roles: ["FUNCIONARIO", "ADMIN"],
      items: [
        {
          title: "Cadastrar livro",
          description: "Registre um novo exemplar doado.",
          href: "../catalog/index.html?view=create-view"
        },
        {
          title: "Consultar livros",
          description: "Pesquise o acervo e a disponibilidade dos exemplares.",
          href: "../catalog/index.html?view=search-view"
        },
        {
          title: "Cadastrar leitor",
          description: "Inclua um leitor no atendimento de balcão.",
          href: "../leitores/cadastro.html"
        },
        {
          title: "Consultar leitores",
          description: "Localize leitores cadastrados.",
          href: "../leitores/consulta.html"
        },
        {
          title: "Empréstimos",
          description: "Registro e acompanhamento de empréstimos.",
          href: "../emprestimos/index.html?view=loans"
        },
        {
          title: "Multas",
          description: "Consulta e acompanhamento de multas.",
          href: "../emprestimos/index.html?view=fines"
        }
      ]
    },
    {
      title: "Área do administrador",
      roles: ["ADMIN"],
      items: [
        {
          title: "Gêneros",
          description: "Cadastre e gerencie os gêneros do acervo.",
          href: "../catalog/index.html?view=genres-view"
        },
        {
          title: "Exclusão de livro",
          description: "Remoção administrativa de exemplares.",
          view: "book-deletion",
          comingSoon: true
        },
        {
          title: "Dashboard",
          description: "Indicadores da biblioteca.",
          view: "dashboard",
          comingSoon: true
        }
      ]
    }
  ]);

  const PLACEHOLDERS = Object.freeze({
    "book-deletion": {
      title: "Exclusão de livro",
      description: "A exclusão administrativa de exemplares será disponibilizada em uma próxima etapa.",
      roles: ["ADMIN"]
    },
    dashboard: {
      title: "Dashboard",
      description: "Os indicadores administrativos serão disponibilizados em uma próxima etapa.",
      roles: ["ADMIN"]
    }
  });

  function getMenuSections(role) {
    return MENU_SECTIONS
      .filter((section) => section.roles.includes(role))
      .map((section) => ({
        title: section.title,
        items: section.items.map((item) => ({
          ...item,
          href: item.view ? `${MENU_URL}?view=${encodeURIComponent(item.view)}` : item.href
        }))
      }));
  }

  function resolveMenuView(view, role) {
    if (!view) {
      return { type: "menu" };
    }
    const placeholder = PLACEHOLDERS[view];
    if (!placeholder) {
      return { type: "menu", message: "A opção solicitada não está disponível." };
    }
    if (!placeholder.roles.includes(role)) {
      return { type: "menu", message: "Esta opção está disponível somente para Admin." };
    }
    return { type: "placeholder", ...placeholder };
  }

  function createMenuClient(config, fetchImplementation) {
    const baseUrl = typeof config?.apiBaseUrl === "string"
      ? config.apiBaseUrl.replace(/\/+$/, "")
      : "";
    const request = fetchImplementation || root.fetch.bind(root);
    if (!baseUrl) {
      throw new Error("API_BASE_URL_REQUIRED");
    }

    return Object.freeze({
      async currentOperator(token) {
        const response = await request(`${baseUrl}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? "SESSION_INVALID"
            : "SESSION_REQUEST_FAILED");
        }
        let operator;
        try {
          operator = await response.json();
        } catch {
          throw new Error("INVALID_API_RESPONSE");
        }
        if (!operator
          || !Number.isInteger(operator.id)
          || typeof operator.matricula !== "string"
          || typeof operator.name !== "string"
          || !["FUNCIONARIO", "ADMIN"].includes(operator.role)) {
          throw new Error("INVALID_OPERATOR");
        }
        return operator;
      }
    });
  }

  const publicApi = Object.freeze({
    createMenuClient,
    getMenuSections,
    resolveMenuView,
    storageKeys: Object.freeze({ token: TOKEN_KEY, operator: OPERATOR_KEY })
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = publicApi;
  }

  if (typeof root.document === "undefined") {
    return;
  }

  const document = root.document;
  const storage = root.sessionStorage;
  const loadingView = document.getElementById("loading-view");
  const menuView = document.getElementById("menu-view");
  const placeholderView = document.getElementById("placeholder-view");
  const pageStatus = document.getElementById("page-status");
  const menuStatus = document.getElementById("menu-status");
  const retryButton = document.getElementById("retry-button");
  const operatorLabel = document.getElementById("operator-label");
  const logoutButton = document.getElementById("logout-button");
  const menuContent = document.getElementById("menu-content");
  const token = storage.getItem(TOKEN_KEY);

  function clearSession() {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(OPERATOR_KEY);
  }

  function showMenu(operator, route) {
    loadingView.hidden = true;
    operatorLabel.textContent = `${operator.name} · ${operator.role === "ADMIN" ? "Administrador" : "Funcionário"}`;

    if (route.type === "placeholder") {
      menuView.hidden = true;
      placeholderView.hidden = false;
      document.getElementById("placeholder-title").textContent = route.title;
      document.getElementById("placeholder-description").textContent = route.description;
      return;
    }

    placeholderView.hidden = true;
    menuView.hidden = false;
    menuStatus.textContent = route.message || "";
    menuStatus.dataset.state = route.message ? "error" : "success";

    for (const section of getMenuSections(operator.role)) {
      const group = document.createElement("section");
      group.className = "menu-group";
      const heading = document.createElement("h2");
      heading.textContent = section.title;
      group.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "menu-grid";
      for (const item of section.items) {
        const link = document.createElement("a");
        link.className = "menu-link";
        link.href = item.href;
        if (item.comingSoon) {
          link.dataset.comingSoon = "true";
        }
        const title = document.createElement("strong");
        title.textContent = item.title;
        const description = document.createElement("span");
        description.textContent = item.description;
        link.append(title, description);
        if (item.comingSoon) {
          const badge = document.createElement("span");
          badge.className = "coming-soon-badge";
          badge.textContent = "Em breve";
          link.appendChild(badge);
        }
        grid.appendChild(link);
      }
      group.appendChild(grid);
      menuContent.appendChild(group);
    }
  }

  async function initialize() {
    if (!token) {
      root.location.replace(LOGIN_URL);
      return;
    }

    retryButton.hidden = true;
    pageStatus.textContent = "Aguarde enquanto confirmamos seu acesso.";
    try {
      const client = createMenuClient(root.BIBLIOTECA_CONFIG, root.fetch.bind(root));
      const operator = await client.currentOperator(token);
      storage.setItem(OPERATOR_KEY, JSON.stringify(operator));
      const requestedView = new URLSearchParams(root.location.search).get("view");
      showMenu(operator, resolveMenuView(requestedView, operator.role));
    } catch (error) {
      if (error?.message === "SESSION_INVALID" || error?.message === "INVALID_OPERATOR") {
        clearSession();
        root.location.replace(LOGIN_URL);
        return;
      }
      pageStatus.textContent = error?.message === "API_BASE_URL_REQUIRED"
        ? "A tela ainda não está configurada para conectar ao sistema."
        : "Não foi possível validar sua sessão. Verifique sua conexão e tente novamente.";
      retryButton.hidden = false;
    }
  }

  logoutButton.addEventListener("click", () => {
    clearSession();
    root.location.replace(LOGIN_URL);
  });
  retryButton.addEventListener("click", initialize);
  initialize();
})(globalThis);
