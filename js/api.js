/*
  Único punto de contacto con el backend Java.
  El resto del front (catalogo.js, login.js, etc.) solo conoce estas funciones,
  nunca hace fetch() directo — así un cambio de URL o de forma de los datos solo se toca aquí.
*/
(function () {
  const ENDPOINTS = {
    registro: "http://localhost:8080/api/v1/users/register",
    login: "http://localhost:8080/api/v1/users/login",
    productos: "http://localhost:8080/api/v1/products/products",
    productoDetalle: "http://localhost:8080/api/v1/products",
    pedidos: "http://localhost:8080/api/v1/orders/create"
  };

  async function request(url, options = {}) {
    let res;
    try {
      res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options
      });
    } catch (e) {
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
    if (!res.ok) {
      let msg = "Ocurrió un error inesperado";
      try {
        const data = await res.json();
        msg = data.message || data.Message || msg;
      } catch (e) { }
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  window.Api = {
    registro(data) {
      return request(ENDPOINTS.registro, { method: "POST", body: JSON.stringify(data) })
        .then((user) => ({ id: user.id, nombre: user.nombre, email: user.email }));
    },

    login(data) {
      return request(ENDPOINTS.login, { method: "POST", body: JSON.stringify(data) })
        .then((user) => ({ id: user.id, nombre: user.nombre, email: user.email }));
    },

    getProductos(categoria, orderAsc, nombre) {
      const params = new URLSearchParams();
      if (categoria && categoria !== "todos") params.set("category", categoria);
      if (orderAsc === true || orderAsc === false) params.set("orderAsc", orderAsc);
      if (nombre) params.set("name", nombre);
      const qs = params.toString();
      return request(ENDPOINTS.productos + (qs ? `?${qs}` : ""));
    },

    getProducto(id) {
      return request(`${ENDPOINTS.productoDetalle}/${id}`);
    },

    crearPedido(payload) {
      const body = {
        userId: payload.usuarioId,
        payMethod: payload.metodoPago,
        items: payload.items.map((it) => ({ productId: it.productoId, amount: it.cantidad }))
      };
      return request(ENDPOINTS.pedidos, { method: "POST", body: JSON.stringify(body) });
    }
  };
})();
