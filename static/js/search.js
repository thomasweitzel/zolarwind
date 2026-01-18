document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("search");
  if (!root) return;

  const input = document.getElementById("search-input");
  const clearButton = document.getElementById("search-clear");
  const results = document.getElementById("search-results");
  const status = document.getElementById("search-status");
  const resultTemplate = document.getElementById("search-result-template");
  const pagination = document.getElementById("search-pagination");

  const baseUrl = root.dataset.baseUrl || "";
  const noResultsText = root.dataset.noResults || "";
  const resultsTextOne = root.dataset.resultsOne || "";
  const resultsTextOther = root.dataset.resultsOther || "";
  const errorText = root.dataset.error || "";
  const loadingText = root.dataset.loading || "";
  const pageSize = Math.max(1, parseInt(root.dataset.pageSize || "10", 10) || 10);
  const pageLabel = root.dataset.pageLabel || "";
  const pageWindow = Math.max(1, parseInt(root.dataset.pageWindow || "3", 10) || 3);

  const setStatus = (text) => {
    if (!status) return;
    status.textContent = text || "";
  };

  const formatResults = (count) => {
    const template = count === 1 ? resultsTextOne : resultsTextOther;
    if (!template) return "";
    if (!template.includes("{count}")) return template;
    return template.replace("{count}", String(count));
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    try {
      return new URL(url, baseUrl).toString();
    } catch (error) {
      return url;
    }
  };

  const getSummary = (doc) => {
    const text = doc.description || doc.summary || doc.body || doc.content || "";
    if (text.length <= 180) return text;
    return `${text.slice(0, 177).trimEnd()}...`;
  };

  const clearResults = () => {
    if (results) results.innerHTML = "";
  };

  const renderResults = (items) => {
    clearResults();
    if (!results) return;

    items.forEach((item) => {
      if (!resultTemplate || !resultTemplate.content.firstElementChild) return;

      const url = normalizeUrl(item.id || item.url || item.permalink || item.path || "");
      const title = item.title || "";
      const summary = getSummary(item);

      const card = resultTemplate.content.firstElementChild.cloneNode(true);
      const titleLink = card.querySelector("[data-search-link]");
      const titleEl = card.querySelector("[data-search-title]");
      const summaryEl = card.querySelector("[data-search-summary]");

      if (titleLink) titleLink.href = url;
      if (titleEl) titleEl.textContent = title || url;

      if (summary && summaryEl) {
        summaryEl.textContent = summary;
      } else if (summaryEl) {
        summaryEl.remove();
      }

      results.appendChild(card);
    });
  };

  const applyQuery = (query, page) => {
    if (!query) {
      clearResults();
      setStatus("");
      clearPagination();
      return;
    }

    const matches = root.searchIndex.search(query, { prefix: true });
    if (!matches.length) {
      clearResults();
      setStatus(noResultsText);
      clearPagination();
      return;
    }

    root.searchMatches = matches;
    setStatus(formatResults(matches.length));
    renderPage(query, page || 1);
  };

  const updateQueryString = (query, page) => {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    if (page && page > 1) {
      url.searchParams.set("page", String(page));
    } else {
      url.searchParams.delete("page");
    }
    window.history.replaceState({}, "", url);
  };

  const getRequestedPage = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = parseInt(params.get("page") || "1", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  };

  const clearPagination = () => {
    if (pagination) pagination.innerHTML = "";
  };

  const renderPagination = (totalResults, currentPage, query) => {
    if (!pagination) return;
    clearPagination();

    const totalPages = Math.ceil(totalResults / pageSize);
    if (totalPages <= 1) return;

    const startWindow = Math.max(2, currentPage - pageWindow);
    const endWindow = Math.min(totalPages - 1, currentPage + pageWindow);

    const addButton = (page) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        page === currentPage
          ? "inline-flex items-center px-3 py-2 rounded-md font-medium text-neutral-200 bg-neutral-800"
          : "inline-flex items-center px-3 py-2 rounded-md font-medium text-neutral-200 hover:text-neutral-50 hover:bg-neutral-700 focus:outline-none focus:text-neutral-700 focus:bg-neutral-200";
      const label = pageLabel ? `${pageLabel} ${page}` : String(page);
      button.setAttribute("aria-label", label);
      button.textContent = String(page);
      button.addEventListener("click", () => {
        updateQueryString(query, page);
        renderPage(query, page);
      });
      pagination.appendChild(button);
    };

    const addEllipsis = () => {
      const span = document.createElement("span");
      span.className = "inline-flex items-center px-2 text-neutral-500";
      span.textContent = "...";
      pagination.appendChild(span);
    };

    addButton(1);

    if (startWindow > 2) {
      addEllipsis();
    }

    for (let page = startWindow; page <= endWindow; page += 1) {
      addButton(page);
    }

    if (endWindow < totalPages - 1) {
      addEllipsis();
    }

    if (totalPages > 1) {
      addButton(totalPages);
    }
  };

  const renderPage = (query, page) => {
    if (!root.searchMatches) return;
    const totalPages = Math.max(1, Math.ceil(root.searchMatches.length / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const pageItems = root.searchMatches.slice(start, start + pageSize);
    renderResults(pageItems);
    renderPagination(root.searchMatches.length, safePage, query);
  };

  const syncClearButton = () => {
    if (!clearButton) return;
    if (input && input.value) {
      clearButton.classList.remove("hidden");
    } else {
      clearButton.classList.add("hidden");
    }
  };

  const loadIndex = async () => {
    setStatus(loadingText);

    try {
      const rawDocs =
        (window.searchIndex &&
        window.searchIndex.documentStore &&
        window.searchIndex.documentStore.docs) ||
        (window.searchIndex && window.searchIndex.docs) ||
        null;
      if (!rawDocs) throw new Error("Search index not available");

      const documents = Object.values(rawDocs)
        .map((doc) => ({
          id: doc.id,
          title: doc.title || "",
          body: doc.body || "",
        }))
        .filter((doc) => doc.id && (doc.title || doc.body));

      root.searchIndex = new MiniSearch({
        fields: ["title", "body"],
        storeFields: ["title", "body"],
      });

      root.searchIndex.addAll(documents);

      setStatus("");

      const params = new URLSearchParams(window.location.search);
      const initialQuery = params.get("q") || "";
      const initialPage = getRequestedPage();
      if (input) {
        input.value = initialQuery;
      }
      applyQuery(initialQuery.trim(), initialPage);
      syncClearButton();
    } catch (error) {
      console.warn(error);
      setStatus(errorText);
    }
  };

  if (input) {
    input.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      updateQueryString(query, 1);
      applyQuery(query, 1);
      syncClearButton();
    });
  }

  if (clearButton && input) {
    clearButton.addEventListener("click", () => {
      input.value = "";
      updateQueryString("", 1);
      applyQuery("", 1);
      syncClearButton();
      input.focus();
    });
  }

  loadIndex();
});
