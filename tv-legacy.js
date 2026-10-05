(function () {
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
    ["salada-fruta", "Salada de fruta", "🍓"],
    ["tapioca", "Tapioca", "🥥"],
    ["graviola", "Graviola", "🍈"],
    ["brigadeiro", "Brigadeiro", "🍫"],
    ["banana", "Banana", "🍌"],
    ["amendoim", "Amendoim", "🥜"],
    ["cupuacu", "Cupuaçu", "🍈"]
  ];
  var state = {};
  var menu = document.getElementById("menu");
  var connection = document.getElementById("connection");
  var updated = document.getElementById("updated");

  function defaults() {
    var obj = {};
    for (var i = 0; i < FLAVORS.length; i++) obj[FLAVORS[i][0]] = true;
    return obj;
  }

  function render() {
    var html = "";
    for (var i = 0; i < FLAVORS.length; i++) {
      var item = FLAVORS[i];
      var id = item[0], name = item[1], icon = item[2];
      var available = state[id] !== false;
      html += '<article class="flavor-card">';
      html += '<div class="flavor-icon">' + icon + '</div>';
      html += '<div class="flavor-name">' + name + '</div>';
      html += '<div class="flavor-price">R$ 2,00</div>';
      if (!available) html += '<div class="sold-overlay"><span class="sold-x">✕</span></div>';
      html += '</article>';
    }
    menu.innerHTML = html;
    updated.textContent = "Atualizado: " + new Date().toLocaleTimeString("pt-BR");
  }

  function start() {
    state = defaults();
    render();

    if (typeof firebase === "undefined") {
      connection.className = "connection error";
      connection.textContent = "Erro: navegador incompatível com Firebase";
      return;
    }

    try {
      firebase.initializeApp(firebaseConfigLegacy);
      var db = firebase.database();
      db.ref("flavors").on("value", function (snapshot) {
        state = defaults();
        var data = snapshot.val() || {};
        for (var key in data) state[key] = data[key];
        render();
        connection.className = "connection live";
        connection.textContent = "● CONECTADO • sincronização pela internet";
      }, function () {
        connection.className = "connection error";
        connection.textContent = "Erro ao ler o Firebase";
      });
    } catch (e) {
      connection.className = "connection error";
      connection.textContent = "Erro na conexão com o Firebase";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
