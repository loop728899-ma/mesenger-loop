// ============================================================
// Firebase config (senin projen)
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
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, push, onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ---- Sabitler ----
const CHAT_ID = "messenger-loop";  // veritabanındaki oda adı
let me = "";

// ---- DOM ----
const loginScreen = document.getElementById("loginScreen");
const loginBtn    = document.getElementById("loginBtn");
const usernameInput = document.getElementById("usernameInput");
const loginError  = document.getElementById("loginError");
const appEl       = document.getElementById("app");
const meAvatar    = document.getElementById("meAvatar");
const chatAvatar  = document.getElementById("chatAvatar");
const chatName    = document.getElementById("chatName");
const chatSub     = document.getElementById("chatSub");
const messagesEl  = document.getElementById("messages");
const formEl      = document.getElementById("messageForm");
const inputEl     = document.getElementById("messageInput");

// ---- Giriş ----
loginBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) { loginError.textContent = "Adını gir"; return; }
  if (name.length > 20) { loginError.textContent = "En fazla 20 karakter"; return; }

  me = name;
  loginScreen.classList.add("hidden");
  appEl.classList.remove("hidden");
  meAvatar.textContent = name.charAt(0).toUpperCase();
  chatAvatar.textContent = "#";
  chatName.textContent = "Genel";
  chatSub.textContent = "grup";

  listenMessages();
  inputEl.focus();
};
usernameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loginBtn.click(); });

// ---- Mesaj dinle ----
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

// ---- Mesaj gönder ----
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