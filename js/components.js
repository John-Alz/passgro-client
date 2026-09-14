/*
  Header, footer y utilidades de UI compartidas por las 6 páginas.
  Única fuente de verdad para ese HTML: cambiarlo aquí actualiza todas las vistas.
*/
(function () {
  function currentIsHome() {
    const p = location.pathname;
    return p.endsWith("/index.html") || p.endsWith("/") || p === "" || p.split("/").pop() === "";
  }

  function currentIsLogin() {
    return location.pathname.split("/").pop() === "login.html";
  }

  function headerHtml() {
    if (currentIsLogin()) {
      return `
        <header>
          <div class="nav wrap">
            <a href="index.html" class="logo">
              <img src="assets/img/logo.jpg" alt="Passgro" class="logo-img">
              Passgro
            </a>
          </div>
        </header>`;
    }
    const porQueHref = currentIsHome() ? "#por-que" : "index.html#por-que";
    const contactoHref = currentIsHome() ? "#contacto" : "index.html#contacto";
    return `
      <header>
        <div class="nav wrap">
          <a href="index.html" class="logo">
            <img src="assets/img/logo.jpg" alt="Passgro" class="logo-img">
            Passgro
          </a>
          <nav class="nav-links">
            <a href="index.html">Home</a>
            <a href="catalogo.html">Catálogo</a>
            <a href="${porQueHref}">Por qué Passgro</a>
            <a href="${contactoHref}">Contacto</a>
          </nav>
          <div class="nav-actions">
            <div id="userSlot"></div>
            <a class="icon-btn" id="cartBtn" href="carrito.html" aria-label="Ver carrito">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.6"/></svg>
              <span class="badge" id="cartCount">0</span>
            </a>
          </div>
        </div>
      </header>`;
  }

  function footerHtml() {
    const porQueHref = currentIsHome() ? "#por-que" : "index.html#por-que";
    return `
      <footer>
        <div class="wrap">
          <div class="footer-grid">
            <div>
              <div class="logo" style="margin-bottom:12px;">
                <img src="assets/img/logo.jpg" alt="Passgro" class="logo-img">
                Passgro
              </div>
              <p style="font-size:.85rem; max-width:280px;">Venta directa de abonos agrícolas, sin intermediarios. Del productor a tu cultivo.</p>
            </div>
            <div>
              <h4>Contacto</h4>
              <ul>
                <li><a href="tel:+573223025678">📞 322 302 5678</a></li>
                <li><a href="https://wa.me/573223025678" target="_blank">WhatsApp directo</a></li>
                <li><a href="mailto:contacto@passgro.co">contacto@passgro.co</a></li>
                <li><a href="https://www.instagram.com/passgro?igsi=MXNrcHhjMm81NTlscw==" target="_blank">Instagram @passgro</a></li>
              </ul>
            </div>
            <div>
              <h4>Enlaces</h4>
              <ul>
                <li><a href="catalogo.html">Catálogo</a></li>
                <li><a href="${porQueHref}">Por qué Passgro</a></li>
                <li><a href="login.html" id="footerLogin">Iniciar sesión</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 Passgro. Todos los derechos reservados.</span>
            <span>Ubala, Cundinamarca</span>
          </div>
        </div>
      </footer>

      <a href="https://wa.me/573223025678" target="_blank" class="float-wa" aria-label="Escribir por WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3.1 4.9 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.1-.4-.2Z"/></svg>
      </a>

      <div id="toast"></div>`;
  }

  function refreshUserSlot() {
    const slot = document.getElementById("userSlot");
    if (!slot) return;
    const user = window.Session ? window.Session.get() : null;
    if (user) {
      slot.innerHTML = `
        <div class="user-chip" id="userChip">
          <button class="user-chip-trigger" id="userChipTrigger">
            <img src="assets/img/profile.webp" alt="" class="user-avatar">
            <span>Hola, ${user.nombre.split(" ")[0]}</span>
          </button>
          <button id="logoutBtn" class="logout-btn">Cerrar sesion</button>
        </div>`;
      document.getElementById("userChipTrigger").addEventListener("click", () => {
        document.getElementById("userChip").classList.toggle("open");
      });
      document.getElementById("logoutBtn").addEventListener("click", () => {
        Session.clear();
        refreshUserSlot();
        PassgroUI.toast("Sesión cerrada");
        if (location.pathname.split("/").pop() === "carrito.html" || location.pathname.split("/").pop() === "checkout.html") {
          location.href = "index.html";
        }
      });
      const footerLogin = document.getElementById("footerLogin");
      if (footerLogin) footerLogin.textContent = "Mi cuenta";
    } else {
      slot.innerHTML = `<a class="btn btn-outline" href="login.html">Iniciar sesión</a>`;
      const footerLogin = document.getElementById("footerLogin");
      if (footerLogin) footerLogin.textContent = "Iniciar sesión";
    }
  }

  function refreshCartBadge() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = window.CartStore ? CartStore.getCount() : 0;
  }

  function mount() {
    const headerSlot = document.getElementById("site-header");
    const footerSlot = document.getElementById("site-footer");
    if (headerSlot) headerSlot.innerHTML = headerHtml();
    if (footerSlot) footerSlot.innerHTML = footerHtml();
    refreshUserSlot();
    refreshCartBadge();
  }

  const TOAST_ICONS = {
    success: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>`,
    error: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`
  };
  const TOAST_TITLES = { success: "¡Listo!", error: "Error" };

  let toastTimer;
  function toast(msg, type) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.classList.remove("toast-success", "toast-error");
    if (type === "success" || type === "error") {
      t.classList.add("toast-" + type);
      t.innerHTML = `
        <span class="toast-icon">${TOAST_ICONS[type]}</span>
        <span><strong>${TOAST_TITLES[type]}</strong><p>${msg}</p></span>
      `;
    } else {
      t.textContent = msg;
    }
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function fmt(n) {
    return "$" + Number(n).toLocaleString("es-CO");
  }

  function sackSvg() {
    return `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path d="M22 20h28l4 10-3 26a5 5 0 0 1-5 4.4H26A5 5 0 0 1 21 56l-3-26 4-10Z" fill="#EFE6C8" stroke="#8C6239" stroke-width="1.6"/>
      <path d="M27 20c0-6 4-10 9-10s9 4 9 10" stroke="#8C6239" stroke-width="1.6"/>
      <line x1="24" y1="30" x2="48" y2="30" stroke="#C99A3E" stroke-width="1.4"/>
      <line x1="23" y1="38" x2="49" y2="38" stroke="#C99A3E" stroke-width="1.4"/>
      <line x1="23" y1="46" x2="49" y2="46" stroke="#C99A3E" stroke-width="1.4"/>
    </svg>`;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function errorIcon() {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>`;
  }

  window.PassgroUI = { toast, fmt, sackSvg, errorIcon, delay, refreshUserSlot, refreshCartBadge };

  document.addEventListener("DOMContentLoaded", mount);
})();
