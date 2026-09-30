/*
  TV do cardápio.
  Usa a API REST do Firebase para continuar funcionando em TVs/Androids antigos.
  Não precisa de login: a TV apenas lê /flavors.
*/

window.__TV_APP_STARTED__ = true;

const DATABASE_URL = "https://cardapio-dindin-default-rtdb.firebaseio.com";
const FLAVORS = [
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

const defaultState = Object.fromEntries(FLAVORS.map(([id]) => [id, true]));
const menuEl = document.getElementById("menu");
const connectionEl = document.getElementById("connection");
const updatedEl = document.getElementById("updated");

let lastGoodState = { ...defaultState };
let requestTimer = null;

function setConnection(type, text) {
  if (!connectionEl) return;
  connectionEl.classList.remove("demo", "live", "error");
  connectionEl.classList.add(type);
  connectionEl.textContent = text;
}

function renderTV(state) {
  if (!menuEl) return;

  menuEl.innerHTML = FLAVORS.map(([id, name, icon]) => {
    const available = state[id] !== false;
    return `
      <article class="flavor-card ${available ? "" : "sold-out"}">
        <div class="flavor-icon">${icon}</div>
        <div class="flavor-name">${name}</div>
        <div class="flavor-price">R$ 2,00</div>
        ${available ? "" : `
          <div class="sold-overlay">
            <span class="x">✕</span>
            <span>ESGOTADO</span>
          </div>
        `}
      </article>
    `;
  }).join("");
}

function updateTime() {
  if (updatedEl) {
    updatedEl.textContent = "Atualizado: " + new Date().toLocaleTimeString("pt-BR");
  }
}

function readFirebase() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", DATABASE_URL + "/flavors.json", true);
  xhr.timeout = 10000;
  xhr.setRequestHeader("Accept", "application/json");

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;

    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const remoteState = JSON.parse(xhr.responseText || "{}") || {};
        lastGoodState = { ...defaultState, ...remoteState };
        renderTV(lastGoodState);
        updateTime();
        setConnection("live", "● CONECTADO • sincronização pela internet");
      } catch (error) {
        console.error("Resposta inválida do Firebase:", error);
        renderTV(lastGoodState);
        setConnection("error", "Firebase respondeu com dados inválidos • tentando novamente...");
      }
      scheduleNextRead(5000);
      return;
    }

    console.error("Firebase HTTP", xhr.status, xhr.statusText);
    renderTV(lastGoodState);
    setConnection("error", "Sem conexão com o Firebase • tentando novamente...");
    scheduleNextRead(5000);
  };

  xhr.onerror = function () {
    console.error("Falha de rede ao acessar o Firebase");
    renderTV(lastGoodState);
    setConnection("error", "Sem conexão com o Firebase • tentando novamente...");
    scheduleNextRead(5000);
  };

  xhr.ontimeout = function () {
    console.error("Tempo esgotado ao acessar o Firebase");
    renderTV(lastGoodState);
    setConnection("error", "Firebase demorou para responder • tentando novamente...");
    scheduleNextRead(5000);
  };

  try {
    xhr.send();
  } catch (error) {
    console.error("Não foi possível iniciar a requisição:", error);
    renderTV(lastGoodState);
    setConnection("error", "Não foi possível acessar o Firebase • tentando novamente...");
    scheduleNextRead(5000);
  }
}

function scheduleNextRead(delay) {
  if (requestTimer) clearTimeout(requestTimer);
  requestTimer = setTimeout(readFirebase, delay);
}

function start() {
  renderTV(lastGoodState);
  setConnection("demo", "Conectando ao Firebase...");
  readFirebase();
}

start();
