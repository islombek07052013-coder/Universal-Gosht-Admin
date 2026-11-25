const ADMIN_PASS_KEY = "ugm_admin_pass";
const DEFAULT_ADMIN_PASS = "1234";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Mol lahm go'shti (suyaksiz)", category: "gosht", price: 98000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=700&q=80", desc: "Yangi so'yilgan yosh buqa go'shti, yumshoq va suyaksiz." },
  { id: 2, name: "Qo'y go'shti (qovurg'a va son)", category: "gosht", price: 95000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?auto=format&fit=crop&w=700&q=80", desc: "Taom va qozonkabob uchun saralangan yangi qo'y go'shti." },
  { id: 3, name: "Mol qiymasi (yog'li / yog'siz)", category: "gosht", price: 88000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=80", desc: "Manti, somsa va kotletlar uchun yangi chiqarilgan qiyma." },
  { id: 4, name: "Butun broyler tovuq (xom)", category: "tovuq", price: 34000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=700&q=80", desc: "Tozalangan, pishirilmagan yangi xom broyler tovuq." },
  { id: 5, name: "Tovuq filesi va son qismi (xom)", category: "tovuq", price: 42000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=80", desc: "Suyaksiz tovuq ko'krak filesi va son go'shti." },
  { id: 6, name: "Yangi Sazan balig'i", category: "baliq", price: 48000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80", desc: "Yangi tutilgan sazan balig'i, tozalab beriladi." },
  { id: 7, name: "Mol oyog'i (xom, tozalangan)", category: "kallapocha", price: 28000, unit: "dona", inStock: true, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=700&q=80", desc: "Kuydirilgan, tozalangan va bo'laklangan alohida mol oyog'i." },
  { id: 8, name: "Mol jigari (yangi, xom)", category: "kallapocha", price: 55000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=700&q=80", desc: "Yangi so'yilgan molning yumshoq jigari." },
  { id: 9, name: "Xom Qazi (bog'langan)", category: "kallapocha", price: 135000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=700&q=80", desc: "Ziravorlar bilan bog'langan, pishirishga tayyor xom qazi." },
  { id: 10, name: "Marinadlangan Shashlik (xom)", category: "tayyor", price: 92000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80", desc: "Ko'mirga qo'yishga tayyor marinadlangan xom jaz shashlik." },
  { id: 11, name: "Tovuq qanotchalari marinad (xom)", category: "tayyor", price: 45000, unit: "kg", inStock: true, img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=700&q=80", desc: "Duxovka yoki mangalda pishirish uchun tayyor xom qanotchalar." }
];

let products = JSON.parse(localStorage.getItem("ugm_products") || "null") || INITIAL_PRODUCTS;
let storeSettings = JSON.parse(localStorage.getItem("ugm_settings") || "null") || {
  promo: "🔥 AKSIYA: Bugun 5 kg dan ortiq xaridlarga yetkazib berish BEPUL!",
  time: "Bugun, 05:30",
  origin: "Yaylov boqma moli"
};

function handleLogin(e) {
  e.preventDefault();
  const savedPass = localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASS;
  const entered = document.getElementById("loginPassword").value;
  if (entered === savedPass) {
    sessionStorage.setItem("ugm_admin_auth", "1");
    showAdminApp();
  } else {
    alert("Parol noto'g'ri!");
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("ugm_admin_auth");
  document.getElementById("adminApp").hidden = true;
  document.getElementById("loginScreen").style.display = "flex";
}

function showAdminApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("adminApp").hidden = false;
  fillSettingsForm();
  renderAdminList();
}

function saveProductsToStorage() {
  localStorage.setItem("ugm_products", JSON.stringify(products));
  renderAdminList();
}

function handleImageFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("pImgUrl").value = reader.result;
    showPreview(reader.result);
  };
  reader.readAsDataURL(file);
}

function showPreview(src) {
  const wrap = document.getElementById("imgPreviewWrap");
  const img = document.getElementById("imgPreview");
  if (src) {
    img.src = src;
    wrap.hidden = false;
  } else {
    wrap.hidden = true;
  }
}

function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById("editId").value;
  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price = Number(document.getElementById("pPrice").value);
  const unit = document.getElementById("pUnit").value;
  const img = document.getElementById("pImgUrl").value.trim() || "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600";
  const desc = document.getElementById("pDesc").value.trim();

  if (editId) {
    const idx = products.findIndex(p => p.id === Number(editId));
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, category, price, unit, img, desc };
    }
  } else {
    const newId = Date.now();
    products.unshift({ id: newId, name, category, price, unit, inStock: true, img, desc });
  }

  saveProductsToStorage();
  resetForm();
}

function editProduct(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  document.getElementById("editId").value = p.id;
  document.getElementById("pName").value = p.name;
  document.getElementById("pCategory").value = p.category;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pUnit").value = p.unit;
  document.getElementById("pImgUrl").value = p.img;
  document.getElementById("pDesc").value = p.desc || "";
  showPreview(p.img);

  document.getElementById("formTitle").innerText = "✏️ Mahsulotni tahrirlash";
  document.getElementById("submitBtn").innerText = "Yangilash";
  document.getElementById("cancelEditBtn").hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleStock(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;
  p.inStock = !p.inStock;
  saveProductsToStorage();
}

function deleteProduct(id) {
  if (!confirm("Bu mahsulotni o'chirishga ishonchingiz komilmi?")) return;
  products = products.filter(item => item.id !== id);
  saveProductsToStorage();
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").innerText = "+ Yangi mahsulot qo'shish";
  document.getElementById("submitBtn").innerText = "Saqlash";
  document.getElementById("cancelEditBtn").hidden = true;
  showPreview("");
}

function resetDefaultProducts() {
  if (!confirm("Standart mahsulotlar ro'yxatini qayta tiklaysizmi?")) return;
  products = [...INITIAL_PRODUCTS];
  saveProductsToStorage();
}

function fillSettingsForm() {
  document.getElementById("setPromo").value = storeSettings.promo || "";
  document.getElementById("setTime").value = storeSettings.time || "";
  document.getElementById("setOrigin").value = storeSettings.origin || "";
}

function saveStoreSettings(e) {
  e.preventDefault();
  storeSettings = {
    promo: document.getElementById("setPromo").value.trim(),
    time: document.getElementById("setTime").value.trim(),
    origin: document.getElementById("setOrigin").value.trim()
  };
  localStorage.setItem("ugm_settings", JSON.stringify(storeSettings));
  alert("Aksiya va bugungi kirim sozlamalari saqlandi!");
}

function renderAdminList() {
  const list = document.getElementById("adminProductList");
  const total = products.length;
  const inStockCount = products.filter(p => p.inStock).length;

  document.getElementById("statTotal").innerText = total;
  document.getElementById("statInStock").innerText = inStockCount;
  document.getElementById("statOutStock").innerText = total - inStockCount;

  list.innerHTML = products.map(p => `
    <div class="admin-row">
      <div class="row-left">
        <img src="${p.img}" alt="${p.name}" class="row-thumb" onerror="this.src='https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200'">
        <div>
          <div class="row-title">${p.name}</div>
          <div class="row-meta">
            <span class="row-price">${Number(p.price).toLocaleString("uz-UZ")} so'm</span> / ${p.unit} • ${p.category}
          </div>
        </div>
      </div>
      <div class="row-actions">
        <button type="button" class="btn btn-sm btn-stock ${p.inStock ? "" : "out"}" onclick="toggleStock(${p.id})">
          ${p.inStock ? "✔ Sotuvda bor" : "✕ Tugagan"}
        </button>
        <button type="button" class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">✏️ Tahrir</button>
        <button type="button" class="btn btn-sm btn-del" onclick="deleteProduct(${p.id})">🗑️</button>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("ugm_admin_auth") === "1") {
    showAdminApp();
  }
});
