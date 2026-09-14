(function () {
  const params = new URLSearchParams(location.search);
  const next = params.get("next");
  const nextUrl = next ? `${next}.html` : "index.html";

  const existing = Session.get();
  if (existing) {
    document.querySelector(".auth-card").innerHTML = `
      <h1>Ya iniciaste sesión</h1>
      <p style="text-align:center; color:#5B5343; margin-bottom:20px;">Hola, ${existing.nombre.split(" ")[0]}</p>
      <button class="btn btn-dark btn-block" id="goHome">Ir al inicio</button>
      <button class="btn btn-outline btn-block" id="logoutBtn" style="margin-top:10px; border-color:var(--linea); color:var(--suelo);">Cerrar sesión</button>
    `;
    document.getElementById("goHome").addEventListener("click", () => (location.href = nextUrl));
    document.getElementById("logoutBtn").addEventListener("click", () => {
      Session.clear();
      location.reload();
    });
    return;
  }

  const tabBtns = document.querySelectorAll(".tab-btn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  tabBtns.forEach((b) => {
    b.addEventListener("click", () => {
      tabBtns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const isLogin = b.dataset.tab === "login";
      loginForm.style.display = isLogin ? "block" : "none";
      registerForm.style.display = isLogin ? "none" : "block";
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPass").value;
    Api.login({ email, password })
      .then((user) => {
        Session.set(user);
        PassgroUI.toast("Bienvenido, " + user.nombre.split(" ")[0], "success");
        location.href = nextUrl;
      })
      .catch((err) => PassgroUI.toast(err.message, "error"));
  });

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPass").value;
    Api.registro({ nombre, email, password })
      .then((user) => {
        Session.set(user);
        PassgroUI.toast("Cuenta creada. ¡Bienvenido, " + user.nombre.split(" ")[0] + "!", "success");
        location.href = nextUrl;
      })
      .catch((err) => PassgroUI.toast(err.message, "error"));
  });
})();
