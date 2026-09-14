(function(){
  function loadCart(){
    try{ return JSON.parse(localStorage.getItem("passgro_cart")) || {}; }
    catch(e){ return {}; }
  }
  function saveCart(){
    try{ localStorage.setItem("passgro_cart", JSON.stringify(state.cart)); }
    catch(e){ /* localStorage no disponible */ }
  }

  const state = {
    user: null,
    users: [{ name:"Cliente Demo", email:"demo@passgro.co", pass:"1234" }],
    cart: loadCart(), // id -> qty, persistido para compartirse entre páginas
    payMethod: "nequi"
  };

  const PRODUCTS = [
    { id:"p1", cat:"organico", name:"Abono Orgánico Compostado", npk:"3-2-2", peso:"40 kg", precio:38000, stock:"Disponible", desc:"Compost estabilizado a base de residuos vegetales. Ideal para mejorar estructura de suelo." },
    { id:"p2", cat:"quimico", name:"Fertilizante NPK Triple 15", npk:"15-15-15", peso:"50 kg", precio:112000, stock:"Disponible", desc:"Fórmula balanceada para etapa de crecimiento en cultivos de ciclo corto y largo." },
    { id:"p3", cat:"organico", name:"Gallinaza Procesada", npk:"2-3-1", peso:"46 kg", precio:29500, stock:"Últimas unidades", desc:"Alto contenido de materia orgánica, tratada para reducir patógenos y olor." },
    { id:"p4", cat:"foliar", name:"Fertilizante Foliar Foliar-K", npk:"0-0-30", peso:"1 L", precio:47000, stock:"Disponible", desc:"Aplicación foliar rica en potasio para llenado de fruto y grano." },
    { id:"p5", cat:"quimico", name:"Urea Granulada 46%", npk:"46-0-0", peso:"50 kg", precio:98000, stock:"Disponible", desc:"Fuente concentrada de nitrógeno de liberación rápida para praderas y cereales." },
    { id:"p6", cat:"quimico", name:"Fertilizante MAP", npk:"12-52-0", peso:"50 kg", precio:135000, stock:"Disponible", desc:"Alto en fósforo, recomendado para siembra y desarrollo de raíz." },
    { id:"p7", cat:"organico", name:"Humus de Lombriz", npk:"1-1-1", peso:"25 kg", precio:33000, stock:"Disponible", desc:"Enmienda orgánica rica en microorganismos benéficos para el suelo." },
    { id:"p8", cat:"foliar", name:"Bioestimulante Foliar Enraizador", npk:"5-15-5", peso:"1 L", precio:52000, stock:"Pocas unidades", desc:"Favorece el desarrollo radicular en almácigos y trasplante." },
    { id:"p9", cat:"quimico", name:"Cal Agrícola Dolomita", npk:"—", peso:"40 kg", precio:21000, stock:"Disponible", desc:"Corrige acidez del suelo y aporta calcio y magnesio disponibles." }
  ];

  const CATS = [
    { id:"todos", label:"Todos" },
    { id:"organico", label:"Orgánicos" },
    { id:"quimico", label:"Químicos" },
    { id:"foliar", label:"Foliares" }
  ];

  const fmt = n => "$" + n.toLocaleString("es-CO");

  let toastTimer;
  function toast(msg){
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove("show"), 2200);
  }

  function sackSvg(){
    return `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <path d="M22 20h28l4 10-3 26a5 5 0 0 1-5 4.4H26A5 5 0 0 1 21 56l-3-26 4-10Z" fill="#EFE6C8" stroke="#8C6239" stroke-width="1.6"/>
      <path d="M27 20c0-6 4-10 9-10s9 4 9 10" stroke="#8C6239" stroke-width="1.6"/>
      <line x1="24" y1="30" x2="48" y2="30" stroke="#C99A3E" stroke-width="1.4"/>
      <line x1="23" y1="38" x2="49" y2="38" stroke="#C99A3E" stroke-width="1.4"/>
      <line x1="23" y1="46" x2="49" y2="46" stroke="#C99A3E" stroke-width="1.4"/>
    </svg>`;
  }

  const filtersEl = document.getElementById("filters");
  let activeCat = "todos";
  function renderFilters(){
    filtersEl.innerHTML = CATS.map(c =>
      `<button class="filter-btn ${c.id===activeCat?'active':''}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
    filtersEl.querySelectorAll(".filter-btn").forEach(b=>{
      b.addEventListener("click", ()=>{ activeCat = b.dataset.cat; renderFilters(); renderProducts(); });
    });
  }

  const gridEl = document.getElementById("productGrid");
  function renderProducts(){
    const list = activeCat === "todos" ? PRODUCTS : PRODUCTS.filter(p=>p.cat===activeCat);
    gridEl.innerHTML = list.map(p => `
      <article class="product-card">
        <div class="product-photo">
          <span class="stock-tag">${p.stock}</span>
          ${sackSvg()}
        </div>
        <div class="product-body">
          <h3>${p.name}</h3>
          <span class="npk mono">NPK ${p.npk}</span>
          <p class="desc">${p.desc}</p>
          <div class="price-row">
            <div class="price">${fmt(p.precio)}<span> / ${p.peso}</span></div>
          </div>
          <button class="add-btn" data-id="${p.id}">Agregar al carrito</button>
        </div>
      </article>
    `).join("");
    gridEl.querySelectorAll(".add-btn").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        addToCart(btn.dataset.id);
        btn.textContent = "Agregado ✓";
        btn.classList.add("added");
        setTimeout(()=>{ btn.textContent="Agregar al carrito"; btn.classList.remove("added"); }, 1100);
      });
    });
  }

  function addToCart(id){
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    renderCart();
    toast("Producto agregado al carrito");
  }
  function changeQty(id, delta){
    if(!state.cart[id]) return;
    state.cart[id] += delta;
    if(state.cart[id] <= 0) delete state.cart[id];
    saveCart();
    renderCart();
  }
  function removeItem(id){ delete state.cart[id]; saveCart(); renderCart(); }

  function cartCount(){ return Object.values(state.cart).reduce((a,b)=>a+b,0); }
  function cartSubtotal(){
    return Object.entries(state.cart).reduce((sum,[id,qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      return sum + (p ? p.precio*qty : 0);
    },0);
  }

  function renderCart(){
    document.getElementById("cartCount").textContent = cartCount();
    const itemsEl = document.getElementById("cartItems");
    const entries = Object.entries(state.cart);
    if(entries.length===0){
      itemsEl.innerHTML = `<div class="cart-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4BC9F" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7H5.6"/></svg>
        <p>Tu carrito está vacío.</p></div>`;
    } else {
      itemsEl.innerHTML = entries.map(([id,qty])=>{
        const p = PRODUCTS.find(x=>x.id===id);
        return `<div class="cart-item">
          <div class="thumb">${sackSvg()}</div>
          <div class="cart-item-info">
            <h4>${p.name}</h4>
            <span class="npk mono">NPK ${p.npk}</span>
            <div class="qty-row">
              <button class="qty-btn" data-act="minus" data-id="${id}">−</button>
              <span class="qty-val">${qty}</span>
              <button class="qty-btn" data-act="plus" data-id="${id}">+</button>
              <span class="remove-link" data-id="${id}">Quitar</span>
            </div>
          </div>
          <div class="item-price">${fmt(p.precio*qty)}</div>
        </div>`;
      }).join("");
      itemsEl.querySelectorAll(".qty-btn").forEach(b=>{
        b.addEventListener("click", ()=>changeQty(b.dataset.id, b.dataset.act==="plus"?1:-1));
      });
      itemsEl.querySelectorAll(".remove-link").forEach(b=>{
        b.addEventListener("click", ()=>removeItem(b.dataset.id));
      });
    }
    document.getElementById("cartSubtotal").textContent = fmt(cartSubtotal());
  }

  const overlay = document.getElementById("overlay");
  const cartPanel = document.getElementById("cartPanel");
  const loginModal = document.getElementById("loginModal");
  const checkoutModal = document.getElementById("checkoutModal");

  function closeAll(){
    overlay.classList.remove("open");
    cartPanel.classList.remove("open");
    loginModal.classList.remove("open");
    checkoutModal.classList.remove("open");
  }
  overlay.addEventListener("click", closeAll);

  document.getElementById("cartBtn").addEventListener("click", ()=>{
    overlay.classList.add("open"); cartPanel.classList.add("open");
  });
  document.getElementById("closeCart").addEventListener("click", closeAll);

  function openLogin(){ overlay.classList.add("open"); loginModal.classList.add("open"); }
  document.getElementById("closeLogin").addEventListener("click", closeAll);
  document.getElementById("footerLogin").addEventListener("click", (e)=>{ e.preventDefault(); openLogin(); });

  document.getElementById("closeCheckout").addEventListener("click", closeAll);

  const tabBtns = document.querySelectorAll(".tab-btn");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  tabBtns.forEach(b=>{
    b.addEventListener("click", ()=>{
      tabBtns.forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      const isLogin = b.dataset.tab === "login";
      loginForm.style.display = isLogin ? "block" : "none";
      registerForm.style.display = isLogin ? "none" : "block";
    });
  });

  function renderUserSlot(){
    const slot = document.getElementById("userSlot");
    if(state.user){
      slot.innerHTML = `<div class="user-chip"><span>Hola, ${state.user.name.split(" ")[0]}</span><button id="logoutBtn">Salir</button></div>`;
      document.getElementById("logoutBtn").addEventListener("click", ()=>{
        state.user = null; renderUserSlot(); toast("Sesión cerrada");
      });
    } else {
      slot.innerHTML = `<button class="btn btn-outline" id="loginBtn">Iniciar sesión</button>`;
      document.getElementById("loginBtn").addEventListener("click", openLogin);
    }
  }

  loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const pass = document.getElementById("loginPass").value;
    const found = state.users.find(u=>u.email.toLowerCase()===email && u.pass===pass);
    if(found){
      state.user = found; renderUserSlot(); closeAll(); toast("Bienvenido, " + found.name.split(" ")[0]);
      loginForm.reset();
    } else {
      toast("Correo o contraseña incorrectos");
    }
  });

  registerForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const pass = document.getElementById("regPass").value;
    if(state.users.find(u=>u.email.toLowerCase()===email)){
      toast("Ya existe una cuenta con ese correo"); return;
    }
    const newUser = { name, email, pass };
    state.users.push(newUser);
    state.user = newUser;
    renderUserSlot(); closeAll(); toast("Cuenta creada. ¡Bienvenido, " + name.split(" ")[0] + "!");
    registerForm.reset();
  });

  const PAY_METHODS = [
    { id:"nequi", name:"Nequi", desc:"Transferencia inmediata al 322 302 5678" },
    { id:"bancolombia", name:"Bancolombia", desc:"Transferencia a cuenta de ahorros Passgro" },
    { id:"tarjeta", name:"Tarjeta débito / crédito", desc:"Pago seguro con tarjeta" },
    { id:"contraentrega", name:"Contraentrega", desc:"Pagas en efectivo al recibir el pedido" }
  ];

  function renderCheckout(){
    const body = document.getElementById("checkoutBody");
    if(cartCount()===0){
      body.innerHTML = `<p style="color:#5B5343;">Tu carrito está vacío. Agrega productos del catálogo para continuar.</p>`;
      return;
    }
    body.innerHTML = `
      <div class="order-summary mono">
        ${Object.entries(state.cart).map(([id,qty])=>{
          const p = PRODUCTS.find(x=>x.id===id);
          return `<div><span>${p.name} x${qty}</span><span>${fmt(p.precio*qty)}</span></div>`;
        }).join("")}
        <div style="border-top:1px solid var(--linea); margin-top:8px; padding-top:8px; font-weight:600;">
          <span>Total</span><span>${fmt(cartSubtotal())}</span>
        </div>
      </div>
      <div class="pay-options" id="payOptions">
        ${PAY_METHODS.map(m=>`
          <label class="pay-opt ${state.payMethod===m.id?'selected':''}" data-id="${m.id}">
            <input type="radio" name="pay" value="${m.id}" ${state.payMethod===m.id?'checked':''}>
            <div><div class="pname">${m.name}</div><div class="pdesc">${m.desc}</div></div>
          </label>
        `).join("")}
      </div>
      <button class="btn btn-primary btn-block" id="confirmOrder">Confirmar pedido</button>
      <p class="form-note">(PSE, Wompi, ePayco, etc.).</p>
    `;
    document.querySelectorAll(".pay-opt").forEach(opt=>{
      opt.addEventListener("click", ()=>{
        state.payMethod = opt.dataset.id;
        document.querySelectorAll(".pay-opt").forEach(o=>o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });
    document.getElementById("confirmOrder").addEventListener("click", ()=>{
      const total = cartSubtotal();
      const method = PAY_METHODS.find(m=>m.id===state.payMethod).name;
      body.innerHTML = `
        <div class="confirm-box">
          <div class="check">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3 style="font-family:'Fraunces',serif; font-size:1.15rem; margin-bottom:8px;">Pedido registrado</h3>
          <p style="color:#5B5343; font-size:.9rem; max-width:320px; margin:0 auto 16px;">
            Total: <b class="mono">${fmt(total)}</b> · Método: <b>${method}</b><br>
            Un asesor de Passgro te confirmará el pedido por WhatsApp al 322 302 5678.
          </p>
          <a href="https://wa.me/573223025678" target="_blank" class="btn btn-primary">Confirmar por WhatsApp</a>
        </div>
      `;
      state.cart = {};
      saveCart();
      renderCart();
    });
  }

  document.getElementById("checkoutBtn").addEventListener("click", ()=>{
    if(cartCount()===0){ toast("Agrega productos antes de pagar"); return; }
    overlay.classList.add("open");
    checkoutModal.classList.add("open");
    cartPanel.classList.remove("open");
    renderCheckout();
  });

  if(filtersEl) renderFilters();
  if(gridEl) renderProducts();
  renderCart();
  renderUserSlot();
})();
