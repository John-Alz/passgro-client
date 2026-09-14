(function () {
  const CATS = [
    { id: "todos", label: "Todos" },
    { id: "compost", label: "Compost" },
    { id: "estiercol_guano", label: "Estiércol y Guano" },
    { id: "mejorador_suelo", label: "Mejoradores de Suelo" },
    { id: "liquido_concentrado", label: "Líquidos Concentrados" }
  ];
  const PAGE_SIZE = 9;

  const SORTS = [
    { id: "asc", label: "Menor precio", orderAsc: true },
    { id: "desc", label: "Mayor precio", orderAsc: false }
  ];

  const filtersEl = document.getElementById("filters");
  const sortFiltersEl = document.getElementById("sortFilters");
  const searchInputEl = document.getElementById("searchInput");
  const gridEl = document.getElementById("productGrid");
  const paginationEl = document.getElementById("pagination");
  const titleEl = document.getElementById("catalogTitle");
  const countEl = document.getElementById("catalogCount");
  let activeCat = "todos";
  let activeSort = null; // null | "asc" | "desc" — opcional, no acumulable
  let searchTerm = "";
  let allProducts = [];
  let currentPage = 1;
  let categoryCounts = {};

  let searchTimer;
  searchInputEl.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = searchInputEl.value.trim();
      loadProducts();
    }, 400);
  });

  function renderFilters() {
    filtersEl.innerHTML = CATS.map((c) => {
      const count = categoryCounts[c.id];
      return `<button class="cat-item ${c.id === activeCat ? "active" : ""}" data-cat="${c.id}">
        <span>${c.label}</span>
        ${count !== undefined ? `<span class="cat-count">${count}</span>` : ""}
      </button>`;
    }).join("");
    filtersEl.querySelectorAll(".cat-item").forEach((b) => {
      b.addEventListener("click", () => {
        activeCat = b.dataset.cat;
        renderFilters();
        updateHeading();
        loadProducts();
      });
    });
  }

  function updateHeading() {
    const cat = CATS.find((c) => c.id === activeCat);
    titleEl.textContent = activeCat === "todos" ? "Todos los productos" : cat.label;
  }

  function loadCategoryCounts() {
    Api.getProductos().then((list) => {
      categoryCounts = { todos: list.length };
      CATS.forEach((c) => {
        if (c.id !== "todos") categoryCounts[c.id] = list.filter((p) => p.categoria === c.id).length;
      });
      renderFilters();
    }).catch(() => { /* si falla, el sidebar simplemente queda sin contadores */ });
  }

  function renderSortFilters() {
    sortFiltersEl.innerHTML = SORTS.map(
      (s) => `<button class="sort-btn ${s.id === activeSort ? "active" : ""}" data-sort="${s.id}">${s.label}</button>`
    ).join("");
    sortFiltersEl.querySelectorAll(".sort-btn").forEach((b) => {
      b.addEventListener("click", () => {
        activeSort = activeSort === b.dataset.sort ? null : b.dataset.sort;
        renderSortFilters();
        loadProducts();
      });
    });
  }

  function renderPagination() {
    const totalPages = Math.ceil(allProducts.length / PAGE_SIZE);
    if (totalPages <= 1) {
      paginationEl.innerHTML = "";
      return;
    }
    let btns = `<button class="page-btn" id="pagePrev" ${currentPage === 1 ? "disabled" : ""}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      btns += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    btns += `<button class="page-btn" id="pageNext" ${currentPage === totalPages ? "disabled" : ""}>›</button>`;
    paginationEl.innerHTML = btns;

    paginationEl.querySelectorAll("[data-page]").forEach((b) => {
      b.addEventListener("click", () => goToPage(Number(b.dataset.page)));
    });
    const prevBtn = document.getElementById("pagePrev");
    const nextBtn = document.getElementById("pageNext");
    if (prevBtn) prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
  }

  function goToPage(page) {
    currentPage = page;
    renderPage();
    gridEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPage() {
    if (allProducts.length === 0) {
      const msg = searchTerm
        ? `No se encontraron productos para "${searchTerm}".`
        : "No hay productos en esta categoría.";
      gridEl.innerHTML = `<p class="catalogo-empty">${msg}</p>`;
      paginationEl.innerHTML = "";
      return;
    }
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allProducts.slice(start, start + PAGE_SIZE);

    gridEl.innerHTML = pageItems.map((p) => `
      <article class="product-card" data-id="${p.id}">
        <div class="product-photo">
          <span class="stock-tag">${p.stockEstado}</span>
          ${p.imagenUrl ? `<img src="${p.imagenUrl}" alt="${p.nombre}">` : PassgroUI.sackSvg()}
        </div>
        <div class="product-body">
          <h3><a href="producto.html?id=${p.id}">${p.nombre}</a></h3>
          <span class="npk mono">NPK ${p.npk}</span>
          <p class="desc">${p.descripcion}</p>
          <div class="price-row">
            <div class="price">${PassgroUI.fmt(p.precio)}<span> / ${p.peso}</span></div>
          </div>
          <button class="add-btn" data-id="${p.id}">Agregar al carrito</button>
        </div>
      </article>
    `).join("");

    gridEl.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".add-btn")) return;
        location.href = `producto.html?id=${card.dataset.id}`;
      });
    });
    gridEl.querySelectorAll(".add-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const producto = allProducts.find((p) => String(p.id) === btn.dataset.id);
        CartStore.addItem(producto, 1);
        PassgroUI.refreshCartBadge();
        PassgroUI.toast("Producto agregado al carrito");
        btn.textContent = "Agregado ✓";
        btn.classList.add("added");
        setTimeout(() => {
          btn.textContent = "Agregar al carrito";
          btn.classList.remove("added");
        }, 1100);
      });
    });

    renderPagination();
  }

  function loadProducts() {
    gridEl.innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p>Cargando productos…</p>
      </div>
    `;
    paginationEl.innerHTML = "";
    const sort = SORTS.find((s) => s.id === activeSort);
    Promise.all([Api.getProductos(activeCat, sort ? sort.orderAsc : undefined, searchTerm), PassgroUI.delay(1000)])
      .then(([list]) => {
        allProducts = list;
        currentPage = 1;
        countEl.textContent = `${list.length} producto${list.length === 1 ? "" : "s"} encontrado${list.length === 1 ? "" : "s"}`;
        renderPage();
      })
      .catch((err) => {
        countEl.textContent = "";
        gridEl.innerHTML = `
          <div class="state-box">
            <div class="state-icon">${PassgroUI.errorIcon()}</div>
            <p>${err.message}</p>
            <div class="state-actions">
              <button class="btn btn-dark" id="retryLoad">Reintentar</button>
            </div>
          </div>
        `;
        document.getElementById("retryLoad").addEventListener("click", loadProducts);
      });
  }

  renderFilters();
  renderSortFilters();
  updateHeading();
  loadCategoryCounts();
  loadProducts();
})();
