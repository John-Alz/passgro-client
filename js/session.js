(function () {
  const KEY = "passgro_session";

  window.Session = {
    get() {
      try { return JSON.parse(localStorage.getItem(KEY)); }
      catch (e) { return null; }
    },
    set(user) {
      localStorage.setItem(KEY, JSON.stringify(user));
    },
    clear() {
      localStorage.removeItem(KEY);
    }
  };
})();
