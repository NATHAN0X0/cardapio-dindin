/* tv-legacy.js
   Versão compatível com navegadores antigos/Android 7.
   A TV consulta o Firebase Realtime Database pela API REST,
   sem carregar o SDK moderno do Firebase.
*/

(function () {
  "use strict";

  var DATABASE_URL = "https://cardapio-dindin-default-rtdb.firebaseio.com";

  var FLAVORS = [
    ["chocolate", "Chocolate", "🍫"],
    ["buriti", "Buriti", "🫐"],
    ["maracuja", "Maracujá", "🥭"],
    ["abacate", "Abacate", "🥑"],
    ["acai", "Açaí", "🫐"],
    ["coco", "Coco", "🥥"],
    ["uva", "Uva", "🍇"],
    ["morango", "Morango", "🍓"],
    ["abacaxi", "Abacaxi", "🍍"],
    ["pudim", "Pudim", "🍮"],
    ["salada-fruta", "Salada de fruta", ""],
    ["tapioca", "Tapioca", ""],
    ["graviola", "Graviola", "🍈"],
    ["brigadeiro", "Brigadeiro", ""],
    ["banana", "Banana", "🍌"],
    ["amendoim", "Amendoim", "🥜"],
    ["cupuacu", "Cupuaçu", ""]
  ];

  var defaultState = {};
  var i;

  for (i = 0; i < FLAVORS.length; i++) {
    defaultState[FLAVORS[i][0]] = true;
  }

  var state = copyState(defaultState);

  var menuEl = document.getElementById("menu");
  var connectionEl = document.getElementById("connection");
  var updatedEl = document.getElementById("updated");

  function copyState(source) {
    var result = {};
    var key;

    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = source[key];
      }
    }

    return result;
  }

  function setConnection(text, type) {
    if (!connectionEl) return;

    connectionEl.className = "connection " + (type || "");
    connectionEl.textContent = text;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderTV() {
    if (!menuEl) return;

    var html = "";

    for (var n = 0; n < FLAVORS.length; n++) {

      var item = FLAVORS[n];
      var id = item[0];
      var name = item[1];
      var icon = item[2];

      var available = state[id] !== false;

      html += '<article class="flavor-card ' +
        (available ? "" : "sold-out") + '">';

      html += '<div class="flavor-icon">' +
        escapeHtml(icon) +
        '</div>';

      html += '<div class="flavor-name">' +
        escapeHtml(name) +
        '</div>';

      html += '<div class="flavor-price">R$ 2,00</div>';

      if (!available) {

        html += '<div class="sold-overlay">';

        html += '<span class="x">✕</span>';

        html += '<span>ESGOTADO</span>';

        html += '</div>';
      }

      html += '</article>';
    }

    menuEl.innerHTML = html;

    if (updatedEl) {
      updatedEl.textContent =
        "Atualizado: " +
        new Date().toLocaleTimeString("pt-BR");
    }
  }

  function readFirebase() {

    var xhr = new XMLHttpRequest();

    var url = DATABASE_URL + "/flavors.json";

    try {

      xhr.open("GET", url, true);

      xhr.timeout = 15000;

      xhr.onreadystatechange = function () {

        if (xhr.readyState !== 4) return;

        if (xhr.status >= 200 && xhr.status < 300) {

          try {

            var remoteState =
              JSON.parse(xhr.responseText);

            if (!remoteState ||
                typeof remoteState !== "object") {

              remoteState = {};
            }

            state = copyState(defaultState);

            for (var key in remoteState) {

              if (
                Object.prototype.hasOwnProperty.call(
                  remoteState,
                  key
                )
              ) {
                state[key] = remoteState[key];
              }
            }

            renderTV();

            setConnection(
              "● CONECTADO • sincronização pela internet",
              "live"
            );

          } catch (parseError) {

            setConnection(
              "Erro ao interpretar os dados",
              "error"
            );
          }

        } else {

          setConnection(
            "Sem conexão com o Firebase • tentando novamente...",
            "error"
          );
        }
      };

      xhr.onerror = function () {

        setConnection(
          "Sem conexão com o Firebase • tentando novamente...",
          "error"
        );
      };

      xhr.ontimeout = function () {

        setConnection(
          "Tempo de conexão esgotado • tentando novamente...",
          "error"
        );
      };

      xhr.send(null);

    } catch (error) {

      setConnection(
        "Erro ao conectar • tentando novamente...",
        "error"
      );
    }
  }

  function start() {

    renderTV();

    setConnection(
      "Conectando ao Firebase...",
      "demo"
    );

    readFirebase();

    window.setInterval(
      readFirebase,
      5000
    );
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();
  }

}());
