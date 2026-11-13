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
import { getDatabase, ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// --- Yönetici Şifresi ---
const ADMIN_PASS = "admin123"; // Buradan şifreni değiştirebilirsin

const adminAuth = document.getElementById("adminAuth");
const adminPanel = document.getElementById("adminPanel");
const authBtn = document.getElementById("authBtn");
const adminPass = document.getElementById("adminPass");
const authError = document.getElementById("authError");

authBtn.onclick = () => {
  if (adminPass.value === ADMIN_PASS) {
    adminAuth.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    loadAdminUsers();
  } else {
    authError.textContent = "Hatalı şifre!";
  }
};
adminPass.addEventListener("keydown", (e) => { if (e.key === "Enter") authBtn.click(); });

// --- Kullanıcı Ekleme ---
document.getElementById("addUserBtn").onclick = () => {
  const code = document.getElementById("adminCode").value.trim();
  const name = document.getElementById("adminName").value.trim();
  if(!code || !name) return alert("Kod ve isim gerekli!");
  
  set(ref(db, `users/${code}`), { realName: name, admin: false }).then(() => {
    document.getElementById("adminCode").value = "";
    document.getElementById("adminName").value = "";
  });
};

// --- Kullanıcıları Listeleme ---
function loadAdminUsers() {
  onValue(ref(db, 'users'), (snap) => {
    const data = snap.val() || {};
    const ul = document.getElementById("adminUserList");
    ul.innerHTML = "";
    
    for (let code in data) {
      const li = document.createElement("li");
      li.innerHTML = `<span><b>${code}</b> = ${data[code].realName}</span> 
                      <button class="delete-user" data-code="${code}" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">Sil</button>`;
      ul.appendChild(li);
    }

    document.querySelectorAll(".delete-user").forEach(btn => {
      btn.onclick = (e) => {
        const codeToDel = e.target.getAttribute("data-code");
        if (confirm(`${codeToDel} kodlu kullanıcıyı silmek istiyor musunuz?`)) {
          remove(ref(db, `users/${codeToDel}`));
        }
      };
    });
  });
}
