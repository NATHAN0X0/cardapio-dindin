import { firebaseConfig, firebaseEnabled } from "./firebase-config.js";

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
  ["salada-fruta", "Salada de fruta", "🍓"],
  ["tapioca", "Tapioca", "🥥"],
  ["graviola", "Graviola", "🍈"],
  ["brigadeiro", "Brigadeiro", "🍫"],
  ["banana", "Banana", "🍌"],
  ["amendoim", "Amendoim", "🥜"],
  ["cupuacu", "Cupuaçu", "🍈"]
];

const DEMO_KEY = "dindin_status_v1";
const defaultState = Object.fromEntries(FLAVORS.map(([id]) => [id, true]));

let state = loadDemoState();
let remote = null;

const menuEl = document.querySelector("#menu");
const adminListEl = document.querySelector("#adminList");
const connectionEl = document.querySelector("#connection");
const updatedEl = document.querySelector("#updated");

function loadDemoState() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_KEY));
    return { ...defaultState, ...(saved || {}) };
  } catch {
    return { ...defaultState };
  }
}

function saveDemoState() {
  localStorage.setItem(DEMO_KEY, JSON.stringify(state));
}

function renderTV() {
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

  if (updatedEl) {
    updatedEl.textContent = "Atualizado: " + new Date().toLocaleTimeString("pt-BR");
  }
}

function renderAdmin() {
  if (!adminListEl) return;

  adminListEl.innerHTML = FLAVORS.map(([id, name, icon]) => {
    const available = state[id] !== false;
    return `
      <button class="admin-item ${available ? "is-available" : "is-sold"}" data-id="${id}">
        <span class="admin-icon">${icon}</span>
        <span class="admin-name">${name}</span>
        <span class="admin-status">${available ? "DISPONÍVEL" : "ESGOTADO"}</span>
        <span class="admin-check">${available ? "✓" : "✕"}</span>
      </button>
    `;
  }).join("");

  adminListEl.querySelectorAll(".admin-item").forEach(button => {
    button.addEventListener("click", () => toggleFlavor(button.dataset.id));
  });
}

function render() {
  renderTV();
  renderAdmin();
}

async function toggleFlavor(id) {
  state[id] = !state[id];
  if (!firebaseEnabled) saveDemoState();

  if (remote) {
    try {
      await remote.set(remote.ref(remote.db, `flavors/${id}`), state[id]);
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar no Firebase. Verifique a configuração.");
    }
  }
  render();
}

async function setAll(value) {
  for (const [id] of FLAVORS) state[id] = value;
  if (!firebaseEnabled) saveDemoState();

  if (remote) {
    try {
      await Promise.all(
        FLAVORS.map(([id]) =>
          remote.set(remote.ref(remote.db, `flavors/${id}`), value)
        )
      );
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar no Firebase. Verifique a configuração.");
    }
  }
  render();
}

document.querySelector("#allAvailable")?.addEventListener("click", () => setAll(true));
document.querySelector("#allSoldOut")?.addEventListener("click", () => setAll(false));
document.querySelector("#resetDemo")?.addEventListener("click", () => {
  state = { ...defaultState };
  saveDemoState();
  render();
});

async function connectFirebase() {
  if (!firebaseEnabled) {
    connectionEl?.classList.add("demo");
    if (connectionEl) connectionEl.textContent = "Modo demonstração • sem sincronização entre aparelhos";
    return;
  }

  try {
    const [{ initializeApp }, database] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js")
    ]);

    const { getDatabase, ref, onValue, set } = database;
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    remote = { db, ref, onValue, set };

    onValue(ref(db, "flavors"), snapshot => {
      const remoteState = snapshot.val() || {};
      state = { ...defaultState, ...remoteState };
      render();
    });

    connectionEl?.classList.remove("demo");
    connectionEl?.classList.add("live");
    if (connectionEl) connectionEl.textContent = "● AO VIVO • sincronização pela internet";
  } catch (error) {
    console.error(error);
    connectionEl?.classList.add("error");
    if (connectionEl) connectionEl.textContent = "Erro na conexão • usando demonstração";
  }
}

render();
connectFirebase();
