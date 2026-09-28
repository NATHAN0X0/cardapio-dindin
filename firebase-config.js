// CONFIGURAÇÃO DO FIREBASE
// 1. Crie um projeto em https://console.firebase.google.com/
// 2. Adicione um aplicativo Web ao projeto.
// 3. Ative Realtime Database.
// 4. Copie o objeto firebaseConfig fornecido pelo Firebase para dentro deste arquivo.
//
// Enquanto os campos abaixo estiverem vazios, o site funciona em MODO DEMONSTRAÇÃO
// usando o armazenamento local do navegador.

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

export const firebaseEnabled =
  Object.values(firebaseConfig).every(value => String(value).trim() !== "");
