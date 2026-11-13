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
import { getDatabase, ref, push, onChildAdded, onValue, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

const CHAT_ID = "messenger-loop"; 
let me = { code: "", realName: "", admin: false };
let myNicknames = {}; 

// ---- DOM ----
const loginScreen = document.getElementById("loginScreen");
const codeInput = document.getElementById("codeInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const appEl = document.getElementById("app");
const meAvatar = document.getElementById("meAvatar");
const meRealName = document.getElementById("meRealName");
const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("messageForm");
const inputEl = document.getElementById("messageInput");
const onlineList = document.getElementById("onlineList");

// ---- GİRİŞ YAPMA ----
loginBtn.onclick = () => {
  const code = codeInput.value.trim();
  if (!code) { loginError.textContent = "Kod gerekli"; return; }

  onValue(ref(db, `users/${code}`), (snap) => {
    const userData = snap.val();
    if (!userData) {
      loginError.textContent = "Geçersiz giriş kodu!";
      return;
    }
    
    me = { code: code, realName: userData.realName, admin: userData.admin || false };
    myNicknames = JSON.parse(localStorage.getItem(`nicknames_${code}`)) || {};

    loginScreen.classList.add("hidden");
    appEl.classList.remove("hidden");
    
    meAvatar.textContent = me.realName.charAt(0).toUpperCase();
    meRealName.textContent = me.realName;
    
    listenMessages();
    listenOnlineUsers();
    inputEl.focus();
  }, { onlyOnce: true });
};

codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") loginBtn.click(); });

// ---- ÇEVRİMİÇİ KULLANICILAR ----
function listenOnlineUsers() {
  const onlineRef = ref(db, `chats/${CHAT_ID}/online`);
  
  set(ref(db, `chats/${CHAT_ID}/online/${me.code}`), me.realName);
  
  window.addEventListener('beforeunload', () => {
    remove(ref(db, `chats/${CHAT_ID}/online/${me.code}`));
  });

  onValue(onlineRef, (snap) => {
    const users = snap.val() || {};
    onlineList.innerHTML = "";
    for (let code in users) {
      const li = document.createElement("li");
      const displayName = myNicknames[users[code]] || users[code];
      li.textContent = displayName;
      if (code === me.code) li.style.fontWeight = "bold";
      onlineList.appendChild(li);
    }
  });
}

// ---- MESAJ DİNLEME VE GÖSTERME ----
function listenMessages() {
  const msgsRef = ref(db, `chats/${CHAT_ID}/messages`);
  onChildAdded(msgsRef, (snap) => {
    const m = snap.val();
    m.id = snap.key; 
    if (!m || !m.text) return;
    renderMessage(m);
  });
}

function renderMessage(m) {
  const div = document.createElement("div");
  const mine = m.sender === me.realName; 
  div.className = "msg-container" + (mine ? " me" : "");
  
  const time = m.ts ? new Date(m.ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
  
  let senderName = m.sender;
  if (!mine) {
    senderName = myNicknames[m.sender] || m.sender;
  }

  div.innerHTML = `
    <div class="msg">
      ${!mine ? `<span class="sender" data-name="${m.sender}">${escapeHtml(senderName)}</span>` : ""}
      ${escapeHtml(m.text)}
      <span class="time">${time}</span>
      <button class="delete-btn" title="Sil">✖</button>
    </div>`;

  const delBtn = div.querySelector(".delete-btn");
  if (mine || me.admin) {
    delBtn.onclick = () => {
      if(confirm("Bu mesajı silmek istediğine emin misin?")) {
        remove(ref(db, `chats/${CHAT_ID}/messages/${m.id}`));
        div.remove();
      }
    };
  } else {
    delBtn.remove();
  }

  const nameSpan = div.querySelector(".sender");
  if (nameSpan) {
    nameSpan.onclick = () => {
      const realName = nameSpan.getAttribute("data-name");
      const newNick = prompt(`${realName} kişisine vermek istediğin takma ad (Sadece sende görünür):`, myNicknames[realName] || realName);
      if (newNick !== null && newNick.trim() !== "") {
        myNicknames[realName] = newNick.trim();
        localStorage.setItem(`nicknames_${me.code}`, JSON.stringify(myNicknames));
        nameSpan.textContent = newNick.trim();
      }
    };
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ---- MESAJ GÖNDERME ----
formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  push(ref(db, `chats/${CHAT_ID}/messages`), {
    sender: me.realName,
    text,
    ts: Date.now()
  });

  inputEl.value = "";
  inputEl.focus();
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
