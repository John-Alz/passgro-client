/*
  Carrito persistido en localStorage como { [productoId]: {id, nombre, precio, cantidad} }.
  Guarda una foto del producto al momento de agregarlo para que carrito.html y
  checkout.html no dependan de volver a pedir el catálogo completo.
*/
(function () {
  const KEY = "passgro_cart";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); }
    catch (e) { /* localStorage no disponible */ }
  }

  window.CartStore = {
    getAll() {
      return load();
    },
    addItem(producto, cantidad) {
      const cart = load();
      const id = String(producto.id);
      if (cart[id]) {
        cart[id].cantidad += cantidad;
      } else {
        cart[id] = { id, nombre: producto.nombre, precio: producto.precio, imagenUrl: producto.imagenUrl || null, cantidad };
      }
      save(cart);
    },
    updateQty(id, delta) {
      const cart = load();
      const key = String(id);
      if (!cart[key]) return;
      cart[key].cantidad += delta;
      if (cart[key].cantidad <= 0) delete cart[key];
      save(cart);
    },
    removeItem(id) {
      const cart = load();
      delete cart[String(id)];
      save(cart);
    },
    clear() {
      save({});
    },
    getCount() {
      return Object.values(load()).reduce((sum, item) => sum + item.cantidad, 0);
    },
    getSubtotal() {
      return Object.values(load()).reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    }
  };
})();
