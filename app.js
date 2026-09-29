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
let authRemote = null;
let currentUser = null;

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
    authRemote = { auth, signInWithEmailAndPassword, onAuthStateChanged, signOut };

    onValue(ref(db, "flavors"), snapshot => {
      const remoteState = snapshot.val() || {};
      state = { ...defaultState, ...remoteState };
      render();
    }, error => {
      console.error(error);
      connectionEl?.classList.add("error");
      if (connectionEl) connectionEl.textContent = "Erro ao ler o Firebase";
    });

    onAuthStateChanged(auth, user => {
      currentUser = user;
      updateAdminAuthUI();
    });

    document.querySelector("#loginButton")?.addEventListener("click", async () => {
      const email = document.querySelector("#loginEmail")?.value.trim();
      const password = document.querySelector("#loginPassword")?.value;
      const message = document.querySelector("#authMessage");
      if (!email || !password) {
        if (message) message.textContent = "Digite o e-mail e a senha.";
        return;
      }
      try {
        if (message) message.textContent = "Entrando...";
        await signInWithEmailAndPassword(auth, email, password);
        if (message) message.textContent = "Login realizado com sucesso.";
      } catch (error) {
        console.error(error);
        if (message) message.textContent = "E-mail ou senha incorretos.";
      }
    });

    document.querySelector("#logoutButton")?.addEventListener("click", async () => {
      await signOut(auth);
    });

    connectionEl?.classList.remove("demo");
    connectionEl?.classList.add("live");
    if (connectionEl) connectionEl.textContent = "● CONECTADO • sincronização pela internet";
  } catch (error) {
    console.error(error);
    connectionEl?.classList.add("error");
    if (connectionEl) connectionEl.textContent = "Erro na conexão com o Firebase";
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

  if (!firebaseEnabled) {
    adminControls?.removeAttribute("hidden");
    if (authBox) authBox.hidden = true;
    return;
  }

  if (currentUser) {
    adminControls?.removeAttribute("hidden");
    if (loginButton) loginButton.hidden = true;
    if (logoutButton) logoutButton.hidden = false;
    if (email) email.disabled = true;
    if (password) password.disabled = true;
    if (message) message.textContent = `Logado como ${currentUser.email}`;
  } else {
    if (adminControls) adminControls.hidden = true;
    if (loginButton) loginButton.hidden = false;
    if (logoutButton) logoutButton.hidden = true;
    if (email) email.disabled = false;
    if (password) password.disabled = false;
    if (message) message.textContent = "Faça login para controlar os sabores.";
  }
}


render();
connectFirebase();
