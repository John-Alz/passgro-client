(function () {
  const gridEl = document.getElementById("featuredGrid");
  const FEATURED_COUNT = 3;

  function pickRandom(list, n) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  }

  function render(list) {
    if (list.length === 0) {
      gridEl.innerHTML = `<p class="catalogo-empty">Aún no hay productos disponibles.</p>`;
      return;
    }
    gridEl.innerHTML = list.map((p) => `
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
        const producto = list.find((p) => String(p.id) === btn.dataset.id);
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
  }

  Api.getProductos()
    .then((list) => render(pickRandom(list, Math.min(FEATURED_COUNT, list.length))))
    .catch((err) => {
      gridEl.innerHTML = `
        <div class="state-box">
          <div class="state-icon">${PassgroUI.errorIcon()}</div>
          <p>${err.message}</p>
        </div>
      `;
    });
})();
