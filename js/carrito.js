(function () {
  const itemsEl = document.getElementById("cartItems");
  const subtotalEl = document.getElementById("cartSubtotal");
  const itemCountEl = document.getElementById("cartItemCount");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function render() {
    const cart = CartStore.getAll();
    const entries = Object.values(cart);
    if (entries.length === 0) {
      itemsEl.innerHTML = `<div class="cart-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4BC9F" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.6"/></svg>
        <p>Tu carrito está vacío.</p></div>`;
    } else {
      itemsEl.innerHTML = entries.map((item) => `
        <div class="cart-item">
          <div class="thumb">${item.imagenUrl ? `<img src="${item.imagenUrl}" alt="${item.nombre}">` : PassgroUI.sackSvg()}</div>
          <div class="cart-item-info">
            <h4>${item.nombre}</h4>
            <div class="qty-row">
              <button class="qty-btn" data-act="minus" data-id="${item.id}">−</button>
              <span class="qty-val">${item.cantidad}</span>
              <button class="qty-btn" data-act="plus" data-id="${item.id}">+</button>
            </div>
          </div>
          <div class="item-price-col">
            <div class="item-price">${PassgroUI.fmt(item.precio * item.cantidad)}</div>
            <span class="remove-link" data-id="${item.id}">Quitar</span>
          </div>
        </div>
      `).join("");
      itemsEl.querySelectorAll(".qty-btn").forEach((b) => {
        b.addEventListener("click", () => {
          CartStore.updateQty(b.dataset.id, b.dataset.act === "plus" ? 1 : -1);
          render();
        });
      });
      itemsEl.querySelectorAll(".remove-link").forEach((b) => {
        b.addEventListener("click", () => {
          CartStore.removeItem(b.dataset.id);
          render();
        });
      });
    }
    itemCountEl.textContent = CartStore.getCount();
    subtotalEl.textContent = PassgroUI.fmt(CartStore.getSubtotal());
    totalEl.textContent = PassgroUI.fmt(CartStore.getSubtotal());
    PassgroUI.refreshCartBadge();
  }

  checkoutBtn.addEventListener("click", () => {
    if (CartStore.getCount() === 0) {
      PassgroUI.toast("Agrega productos antes de pagar");
      return;
    }
    location.href = "checkout.html";
  });

  render();
})();
