(function () {
  const contentEl = document.getElementById("productoContent");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  let cantidad = 1;
  let producto = null;

  function render() {
    contentEl.innerHTML = `
      <div class="producto-grid">
        <div class="producto-photo">
          ${producto.imagenUrl ? `<img src="${producto.imagenUrl}" alt="${producto.nombre}">` : PassgroUI.sackSvg()}
        </div>
        <div class="producto-info">
          <span class="stock-tag" style="position:static; display:inline-flex; margin-bottom:12px;">${producto.stockEstado}</span>
          <h1>${producto.nombre}</h1>
          <span class="npk mono">NPK ${producto.npk} · ${producto.peso}</span>
          <div class="price">${PassgroUI.fmt(producto.precio)}</div>
          <p class="desc">${producto.descripcion}</p>
          <div class="qty-selector">
            <button class="qty-btn" id="qtyMinus">−</button>
            <span class="qty-val" id="qtyVal">${cantidad}</span>
            <button class="qty-btn" id="qtyPlus">+</button>
          </div>
          <button class="btn btn-primary btn-block" id="addBtn">Agregar al carrito</button>
        </div>
      </div>
    `;
    document.getElementById("qtyMinus").addEventListener("click", () => {
      if (cantidad > 1) cantidad--;
      document.getElementById("qtyVal").textContent = cantidad;
    });
    document.getElementById("qtyPlus").addEventListener("click", () => {
      cantidad++;
      document.getElementById("qtyVal").textContent = cantidad;
    });
    document.getElementById("addBtn").addEventListener("click", () => {
      CartStore.addItem(producto, cantidad);
      PassgroUI.refreshCartBadge();
      PassgroUI.toast("Producto agregado al carrito");
    });
  }

  function renderError(msg, allowRetry) {
    contentEl.innerHTML = `
      <div class="state-box">
        <div class="state-icon">${PassgroUI.errorIcon()}</div>
        <p>${msg}</p>
        <div class="state-actions">
          <a href="catalogo.html" class="btn btn-outline">Volver al catálogo</a>
          ${allowRetry ? `<button class="btn btn-dark" id="retryLoad">Reintentar</button>` : ""}
        </div>
      </div>
    `;
    if (allowRetry) document.getElementById("retryLoad").addEventListener("click", load);
  }

  function load() {
    contentEl.innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p>Cargando producto…</p>
      </div>
    `;
    Promise.all([Api.getProducto(id), PassgroUI.delay(1000)])
      .then(([p]) => {
        producto = p;
        render();
      })
      .catch((err) => renderError(err.message, true));
  }

  if (!id) {
    renderError("No se indicó un producto.", false);
  } else {
    load();
  }
})();
