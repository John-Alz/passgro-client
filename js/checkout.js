(function () {
  const body = document.getElementById("checkoutBody");

  const PAY_METHODS = [
    { id: "nequi", name: "Nequi", desc: "Transferencia inmediata al 322 302 5678" },
    { id: "bancolombia", name: "Bancolombia", desc: "Transferencia a cuenta de ahorros Passgro" },
    { id: "tarjeta", name: "Tarjeta débito / crédito", desc: "Pago seguro con tarjeta" },
    { id: "contraentrega", name: "Contraentrega", desc: "Pagas en efectivo al recibir el pedido" }
  ];
  let payMethod = "nequi";

  const user = Session.get();
  if (!user) {
    location.href = "login.html?next=checkout";
    return;
  }

  const cart = CartStore.getAll();
  const entries = Object.values(cart);
  if (entries.length === 0) {
    body.innerHTML = `<p class="checkout-empty">Tu carrito está vacío. Agrega productos del catálogo para continuar.</p>`;
    return;
  }

  function renderForm() {
    const subtotal = CartStore.getSubtotal();
    body.innerHTML = `
      <div class="order-summary mono">
        ${entries.map((item) => `<div><span>${item.nombre} x${item.cantidad}</span><span>${PassgroUI.fmt(item.precio * item.cantidad)}</span></div>`).join("")}
        <div style="border-top:1px solid var(--linea); margin-top:8px; padding-top:8px; font-weight:600;">
          <span>Total</span><span>${PassgroUI.fmt(subtotal)}</span>
        </div>
      </div>
      <div class="pay-options" id="payOptions">
        ${PAY_METHODS.map((m) => `
          <label class="pay-opt ${payMethod === m.id ? "selected" : ""}" data-id="${m.id}">
            <input type="radio" name="pay" value="${m.id}" ${payMethod === m.id ? "checked" : ""}>
            <div><div class="pname">${m.name}</div><div class="pdesc">${m.desc}</div></div>
          </label>
        `).join("")}
      </div>
      <button class="btn btn-primary btn-block" id="confirmOrder">Confirmar pedido</button>
      <p class="form-note">(PSE, Wompi, ePayco, etc.).</p>
    `;
    document.querySelectorAll(".pay-opt").forEach((opt) => {
      opt.addEventListener("click", () => {
        payMethod = opt.dataset.id;
        document.querySelectorAll(".pay-opt").forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
    document.getElementById("confirmOrder").addEventListener("click", confirmOrder);
  }

  function confirmOrder() {
    const btn = document.getElementById("confirmOrder");
    btn.disabled = true;
    btn.textContent = "Procesando…";
    const total = CartStore.getSubtotal();
    const methodName = PAY_METHODS.find((m) => m.id === payMethod).name;
    const payload = {
      usuarioId: user.id,
      metodoPago: methodName,
      items: entries.map((item) => ({
        productoId: Number(item.id),
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }))
    };

    Api.crearPedido(payload)
      .then(() => {
        CartStore.clear();
        PassgroUI.refreshCartBadge();
        body.innerHTML = `
          <div class="confirm-box">
            <div class="check">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3 style="font-family:'Fraunces',serif; font-size:1.15rem; margin-bottom:8px;">Pedido registrado</h3>
            <p style="color:#5B5343; font-size:.9rem; max-width:320px; margin:0 auto 16px;">
              Total: <b class="mono">${PassgroUI.fmt(total)}</b> · Método: <b>${methodName}</b><br>
              Un asesor de Passgro te confirmará el pedido por WhatsApp al 322 302 5678.
            </p>
            <a href="https://wa.me/573223025678" target="_blank" class="btn btn-primary">Confirmar por WhatsApp</a>
          </div>
        `;
      })
      .catch((err) => {
        PassgroUI.toast(err.message, "error");
        btn.disabled = false;
        btn.textContent = "Confirmar pedido";
      });
  }

  renderForm();
})();
