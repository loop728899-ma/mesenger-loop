// ============================================================
// Firebase config (Senin Projen)
// ============================================================
const firebaseConfig = {
  apiKey:            "AIzaSyBZVfs24QxwVux7uRC1LCeN2T0Y5vv-oj4",
  authDomain:        "messenger-loop-25432.firebaseapp.com",
  databaseURL:       "https://messenger-loop-25432-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "messenger-loop-25432",
  storageBucket:     "messenger-loop-25432.firebasestorage.app",
  messagingSenderId: "862907182195",
  appId:             "1:862907182195:web:5e0f20ee9c19ab61ea8e06"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ---- Sabitler ----
const CHAT_ID = "messenger-loop"; 
let me = "";

// ---- DOM ----
const loginScreen = document.getElementById("loginScreen");
const loginBtn    = document.getElementById("loginBtn");
const usernameInput = document.getElementById("usernameInput");
const loginError  = document.getElementById("loginError");
const appEl       = document.getElementById("app");
const meAvatar    = document.getElementById("meAvatar");
const messagesEl  = document.getElementById("messages");
const formEl      = document.getElementById("messageForm");
const inputEl     = document.getElementById("messageInput");

// ---- Giriş ----
loginBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) { loginError.textContent = "Lütfen adını gir"; return; }
  if (name.length > 20) { loginError.textContent = "En fazla 20 karakter"; return; }

  me = name;
  loginScreen.classList.add("hidden");
  appEl.classList.remove("hidden");
  
  // Sol üstteki kendi avatarın (Baş harfin)
  meAvatar.textContent = name.charAt(0).toUpperCase();

  listenMessages();
  inputEl.focus();
};

usernameInput.addEventListener("keydown", (e) => { 
  if (e.key === "Enter") loginBtn.click(); 
});

// ---- Mesaj Dinle ----
function listenMessages() {
  const msgsRef = ref(db, `chats/${CHAT_ID}/messages`);
  onChildAdded(msgsRef, (snap) => {
    const m = snap.val();
    if (!m || !m.text) return;
    renderMessage(m);
  });
}

function renderMessage(m) {
  const div = document.createElement("div");
  const mine = m.sender === me;
  div.className = "msg" + (mine ? " me" : "");
  const time = m.ts ? new Date(m.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
  
  div.innerHTML = `
    ${!mine ? `<span class="sender">${escapeHtml(m.sender || "?")}</span>` : ""}
    ${escapeHtml(m.text)}
    <span class="time">${time}</span>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---- Mesaj Gönder ----
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  push(ref(db, `chats/${CHAT_ID}/messages`), {
    sender: me,
    text,
    ts: Date.now()
  });

  inputEl.value = "";
  inputEl.focus();
});

// ---- Yardımcı ----
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
