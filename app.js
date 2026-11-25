// Supabase ulanish sozlamalari (sizning loyihangizga moslangan)
const SUPABASE_URL = "https://sissxncuyhlwnnasikfi.supabase.co";
const SUPABASE_KEY = "PUBLISHABLE_KEY_NI_SHU_YERGA_YOYING"; // Rasmdagi Publishable keyni to'liq qo'ying

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

let products = [];
let storeSettings = {
  promo: "🔥 AKSIYA: Bugun 5 kg dan ortiq xaridlarga yetkazib berish BEPUL!",
  time: "Bugun, 05:30",
  origin: "Yaylov boqma moli"
};

function hasSupabase() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_KEY && !SUPABASE_KEY.includes("SHU_YERGA");
}

function sbHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}

function mapDbToProduct(row) {
  return {
    id: Number(row.id),
    name: row.name,
    category: row.category,
    price: Number(row.price),
    unit: row.unit || "kg",
    inStock: Boolean(row.in_stock),
    img: row.img || "",
    desc: row.desc || ""
  };
}

function mapProductToDb(p, orderIdx = 0) {
  return {
    id: Number(p.id),
    name: p.name,
    category: p.category,
    price: Number(p.price),
    unit: p.unit || "kg",
    in_stock: Boolean(p.inStock),
    img: p.img || "",
    desc: p.desc || "",
    sort_order: orderIdx
  };
}

async function loadRemoteData() {
  const localProds = JSON.parse(localStorage.getItem("ugm_products") || "null");
  const localSet = JSON.parse(localStorage.getItem("ugm_settings") || "null");
  if (localSet) storeSettings = localSet;

  if (!hasSupabase()) {
    products = localProds || [...INITIAL_PRODUCTS];
    fillSettingsForm();
    renderAdminList();
    return;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=sort_order.asc,id.asc`, {
      headers: sbHeaders()
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        products = rows.map(mapDbToProduct);
        localStorage.setItem("ugm_products", JSON.stringify(products));
      } else {
        products = localProds || [...INITIAL_PRODUCTS];
        await syncAllProductsToSupabase();
      }
    } else {
      products = localProds || [...INITIAL_PRODUCTS];
    }

    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/store_settings?id=eq.1&select=*`, {
      headers: sbHeaders()
    });
    if (sRes.ok) {
      const sRows = await sRes.json();
      if (sRows && sRows[0]) {
        storeSettings = {
          promo: sRows[0].promo || storeSettings.promo,
          time: sRows[0].cut_time || storeSettings.time,
          origin: sRows[0].origin || storeSettings.origin
        };
        localStorage.setItem("ugm_settings", JSON.stringify(storeSettings));
      }
    }
  } catch (err) {
    console.warn("Supabase o'qishda lokal ma'lumot ishlatildi:", err);
    products = localProds || [...INITIAL_PRODUCTS];
  }

  fillSettingsForm();
  renderAdminList();
}

async function upsertProductToSupabase(prod, idx = 0) {
  if (!hasSupabase()) return;
  await fetch(`${SUPABASE_URL}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(mapProductToDb(prod, idx))
  });
}

async function deleteProductFromSupabase(id) {
  if (!hasSupabase()) return;
  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
    method: "DELETE",
    headers: sbHeaders()
  });
}

async function syncAllProductsToSupabase() {
  if (!hasSupabase()) return;
  const payload = products.map((p, idx) => mapProductToDb(p, idx));
  await fetch(`${SUPABASE_URL}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });
}

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
  loadRemoteData();
}

function saveProductsLocal() {
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

async function saveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById("editId").value;
  const name = document.getElementById("pName").value.trim();
  const category = document.getElementById("pCategory").value;
  const price = Number(document.getElementById("pPrice").value);
  const unit = document.getElementById("pUnit").value;
  const img = document.getElementById("pImgUrl").value.trim() || "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600";
  const desc = document.getElementById("pDesc").value.trim();

  let savedItem;
  let idx = 0;

  if (editId) {
    idx = products.findIndex(p => p.id === Number(editId));
    if (idx !== -1) {
      products[idx] = { ...products[idx], name, category, price, unit, img, desc };
      savedItem = products[idx];
    }
  } else {
    savedItem = { id: Date.now(), name, category, price, unit, inStock: true, img, desc };
    products.unshift(savedItem);
    idx = 0;
  }

  saveProductsLocal();
  if (savedItem) await upsertProductToSupabase(savedItem, idx);
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

async function toggleStock(id) {
  const idx = products.findIndex(item => item.id === id);
  if (idx === -1) return;
  products[idx].inStock = !products[idx].inStock;
  saveProductsLocal();
  await upsertProductToSupabase(products[idx], idx);
}

async function deleteProduct(id) {
  if (!confirm("Bu mahsulotni o'chirishga ishonchingiz komilmi?")) return;
  products = products.filter(item => item.id !== id);
  saveProductsLocal();
  await deleteProductFromSupabase(id);
}

function resetForm() {
  document.getElementById("productForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").innerText = "+ Yangi mahsulot qo'shish";
  document.getElementById("submitBtn").innerText = "Saqlash";
  document.getElementById("cancelEditBtn").hidden = true;
  showPreview("");
}

async function resetDefaultProducts() {
  if (!confirm("Standart mahsulotlar ro'yxatini qayta tiklaysizmi?")) return;
  products = [...INITIAL_PRODUCTS];
  saveProductsLocal();
  await syncAllProductsToSupabase();
}

function fillSettingsForm() {
  document.getElementById("setPromo").value = storeSettings.promo || "";
  document.getElementById("setTime").value = storeSettings.time || "";
  document.getElementById("setOrigin").value = storeSettings.origin || "";
}

async function saveStoreSettings(e) {
  e.preventDefault();
  storeSettings = {
    promo: document.getElementById("setPromo").value.trim(),
    time: document.getElementById("setTime").value.trim(),
    origin: document.getElementById("setOrigin").value.trim()
  };
  localStorage.setItem("ugm_settings", JSON.stringify(storeSettings));

  if (hasSupabase()) {
    await fetch(`${SUPABASE_URL}/rest/v1/store_settings?on_conflict=id`, {
      method: "POST",
      headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: 1,
        promo: storeSettings.promo,
        cut_time: storeSettings.time,
        origin: storeSettings.origin
      })
    });
  }
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
