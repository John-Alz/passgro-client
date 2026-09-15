/*
  Formulario de contacto sin backend propio (fuera del alcance de los 5 endpoints):
  al enviarlo solo muestra una confirmación local, no manda datos a ningún lado.
*/
(function () {
  const card = document.getElementById("contactoFormCard");

  function formHtml() {
    return `
      <form id="contactoForm">
        <h3>Envíanos un mensaje</h3>
        <div class="field"><label>Tu nombre</label><input type="text" id="cName" required placeholder="Juan Pérez"></div>
        <div class="field"><label>Correo electrónico</label><input type="email" id="cEmail" required placeholder="juan@ejemplo.com"></div>
        <div class="field"><label>Teléfono</label><input type="tel" id="cPhone" required placeholder="300 123 4567"></div>
        <div class="field"><label>Mensaje</label><textarea id="cMessage" rows="4" required placeholder="¿En qué te podemos ayudar?"></textarea></div>
        <button type="submit" class="btn btn-dark btn-block">Enviar mensaje</button>
      </form>
    `;
  }

  function bindForm() {
    document.getElementById("contactoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      showSent();
    });
  }

  function showSent() {
    card.innerHTML = `
      <div class="contacto-sent">
        <div class="sent-icon">📬</div>
        <h3>¡Mensaje enviado!</h3>
        <p>Te responderemos dentro de las próximas 24 horas.</p>
        <button class="btn btn-outline" id="sendAnotherBtn" style="border-color:var(--linea); color:var(--suelo);">Enviar otro mensaje</button>
      </div>
    `;
    document.getElementById("sendAnotherBtn").addEventListener("click", () => {
      card.innerHTML = formHtml();
      bindForm();
    });
  }

  bindForm();
})();
