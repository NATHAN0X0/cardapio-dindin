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
  ["salada-fruta", "Salada de fruta", ""],
  ["tapioca", "Tapioca", ""],
  ["graviola", "Graviola", "🍈"],
  ["brigadeiro", "Brigadeiro", ""],
  ["banana", "Banana", "🍌"],
  ["amendoim", "Amendoim", "🥜"],
  ["cupuacu", "Cupuaçu", ""]
];

const DEMO_KEY = "dindin_status_v1";
const defaultState = Object.fromEntries(FLAVORS.map(([id]) => [id, true]));

let state = loadDemoState();
let remote = null;
let currentUser = null;
let firebaseConnected = false;

const menuEl = document.querySelector("#menu");
const adminListEl = document.querySelector("#adminList");
const connectionEl = document.querySelector("#connection");
const updatedEl = document.querySelector("#updated");

function setConnection(type, text) {
  if (!connectionEl) return;
  connectionEl.classList.remove("demo", "live", "error");
  connectionEl.classList.add(type);
  connectionEl.textContent = text;
}

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

async function writeFlavor(id, value) {
  if (!remote || !firebaseConnected) return;
  await remote.set(remote.ref(remote.db, `flavors/${id}`), value);
}

async function toggleFlavor(id) {
  const previous = state[id] !== false;
  const next = !previous;

  // Em modo demo, grava localmente. No Firebase, o estado local só é confirmado
  // pelo listener onValue depois que a gravação for aceita.
  if (!remote || !firebaseConnected) {
    state[id] = next;
    saveDemoState();
    render();
    return;
  }

  try {
    await writeFlavor(id, next);
  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar no Firebase. Verifique sua conexão e as regras do Realtime Database.");
  }
}

async function setAll(value) {
  if (!remote || !firebaseConnected) {
    state = Object.fromEntries(FLAVORS.map(([id]) => [id, value]));
    saveDemoState();
    render();
    return;
  }

  try {
    await Promise.all(FLAVORS.map(([id]) => writeFlavor(id, value)));
  } catch (error) {
    console.error(error);
    alert("Não foi possível salvar todos os sabores no Firebase.");
  }
}

function resetDemo() {
  state = { ...defaultState };
  saveDemoState();
  render();
}

document.querySelector("#allAvailable")?.addEventListener("click", () => setAll(true));
document.querySelector("#allSoldOut")?.addEventListener("click", () => setAll(false));
document.querySelector("#resetDemo")?.addEventListener("click", resetDemo);

document.querySelector("#loginButton")?.addEventListener("click", () => login());
document.querySelector("#loginPassword")?.addEventListener("keydown", event => {
  if (event.key === "Enter") login();
});
document.querySelector("#logoutButton")?.addEventListener("click", () => logout());

let authRemote = null;

async function login() {
  if (!authRemote) return;

  const email = document.querySelector("#loginEmail")?.value.trim();
  const password = document.querySelector("#loginPassword")?.value;
  const message = document.querySelector("#authMessage");

  if (!email || !password) {
    if (message) message.textContent = "Digite o e-mail e a senha.";
    return;
  }

  try {
    if (message) message.textContent = "Entrando...";
    await authRemote.signInWithEmailAndPassword(authRemote.auth, email, password);
    if (message) message.textContent = "Login realizado com sucesso.";
  } catch (error) {
    console.error(error);
    if (message) message.textContent = "E-mail ou senha incorretos.";
  }
}

async function logout() {
  if (!authRemote) return;
  try {
    await authRemote.signOut(authRemote.auth);
  } catch (error) {
    console.error(error);
  }
}

function updateAdminAuthUI() {
  const adminControls = document.querySelector("#adminControls");
  const authBox = document.querySelector("#authBox");
  const loginButton = document.querySelector("#loginButton");
  const logoutButton = document.querySelector("#logoutButton");
  const email = document.querySelector("#loginEmail");
  const password = document.querySelector("#loginPassword");
  const message = document.querySelector("#authMessage");

  if (!adminControls) return;

  if (!firebaseEnabled) {
    adminControls.hidden = false;
    if (authBox) authBox.hidden = true;
    return;
  }

  if (currentUser) {
    adminControls.hidden = false;
    if (loginButton) loginButton.hidden = true;
    if (logoutButton) logoutButton.hidden = false;
    if (email) email.disabled = true;
    if (password) password.disabled = true;
    if (message) message.textContent = `Logado como ${currentUser.email}`;
  } else {
    adminControls.hidden = true;
    if (loginButton) loginButton.hidden = false;
    if (logoutButton) logoutButton.hidden = true;
    if (email) email.disabled = false;
    if (password) password.disabled = false;
    if (message) message.textContent = "Faça login para controlar os sabores.";
  }
}

async function connectFirebase() {
  if (!firebaseEnabled) {
    setConnection("demo", "Modo demonstração • sem sincronização entre aparelhos");
    updateAdminAuthUI();
    return;
  }

  setConnection("demo", "Conectando ao Firebase...");

  try {
    const [{ initializeApp }, database, authModule] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js"),
      import("https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js")
    ]);

    const { getDatabase, ref, onValue, set } = database;
    const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } = authModule;

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const auth = getAuth(app);

    remote = { db, ref, onValue, set };
    authRemote = { auth, signInWithEmailAndPassword, signOut };

    onValue(ref(db, "flavors"), snapshot => {
      const remoteState = snapshot.val() || {};
      state = { ...defaultState, ...remoteState };
      firebaseConnected = true;
      render();
      setConnection("live", "● CONECTADO • sincronização pela internet");
    }, error => {
      console.error(error);
      firebaseConnected = false;
      setConnection("error", "Erro ao ler o Firebase • verifique as regras do banco");
      updateAdminAuthUI();
    });

    onAuthStateChanged(auth, user => {
      currentUser = user;
      updateAdminAuthUI();
    });
  } catch (error) {
    console.error(error);
    firebaseConnected = false;
    setConnection("error", "Erro na conexão com o Firebase");
    updateAdminAuthUI();
  }
}

render();
updateAdminAuthUI();
connectFirebase();
