const SUPABASE_URL = "https://sissxncuyhlwnnasikfi.supabase.co";
const SUPABASE_KEY = "sb_publishable_6IAQPaXyp3hr4lDsWhJK1g_KJb49aGH";

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
let orders = [];
let storeSettings = {
  promo: "🔥 AKSIYA: Bugun 5 kg dan ortiq xaridlarga yetkazib berish BEPUL!",
  time: "Bugun, 05:30",
  origin: "Yaylov boqma moli",
  isOpen: true
};

function hasSupabase() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_KEY && SUPABASE_KEY.length > 10;
}

function sbHeaders() {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };
}

function updateStoreStatusUI() {
  const btn = document.getElementById("storeStatusBtn");
  if (!btn) return;
  const open = storeSettings.isOpen !== false;
  btn.classList.toggle("open", open);
  btn.classList.toggle("closed", !open);
  btn.innerText = open ? "🟢 Do'kon Ochiq" : "🔴 Do'kon Yopiq";
}

async function persistSettings() {
  localStorage.setItem("ugm_settings", JSON.stringify(storeSettings));
  if (!hasSupabase()) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/store_settings?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      id: 1,
      promo: storeSettings.promo,
      cut_time: storeSettings.time,
      origin: storeSettings.origin,
      is_open: storeSettings.isOpen !== false
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error("Sozlamani saqlashda xato:", errText);
  }
}

async function toggleStoreOpenStatus() {
  storeSettings.isOpen = !(storeSettings.isOpen !== false);
  updateStoreStatusUI();
  await persistSettings();
}

async function clearPromoBanner() {
  storeSettings.promo = "";
  document.getElementById("setPromo").value = "";
  await persistSettings();
  alert("Aksiya tugatildi va mijozlar saytida yashirildi!");
}

function handleImageFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxW = 700;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/jpeg", 0.72);
      document.getElementById("pImgUrl").value = compressed;
      showPreview(compressed);
    };
    img.src = ev.target.result;
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

async function loadOrders() {
  const container = document.getElementById("ordersList");
  if (!hasSupabase()) {
    container.innerHTML = `<p style="color:#a8a29e;font-size:0.86rem;">Buyurtmalarni ko'rish uchun Supabase kalitini ulang.</p>`;
    return;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: sbHeaders()
    });
    if (res.ok) {
      orders = await res.json();
      renderOrders();
    } else {
      const t = await res.text();
      container.innerHTML = `<p style="color:#f87171;font-size:0.86rem;">Xato: ${t}</p>`;
    }
  } catch (err) {
    console.warn("Buyurtmalarni yuklashda xato:", err);
  }
}

function renderOrders() {
  const container = document.getElementById("ordersList");
  const newCount = orders.filter(o => o.status !== "Yetkazildi").length;
  const statEl = document.getElementById("statOrders");
  if (statEl) statEl.innerText = newCount;

  if (!orders || orders.length === 0) {
    container.innerHTML = `<p style="color:#a8a29e;font-size:0.88rem;">Hozircha yangi buyurtmalar yo'q.</p>`;
    return;
  }

  container.innerHTML = orders.map(o => {
    const isDone = o.status === "Yetkazildi";
    const items = Array.isArray(o.items) ? o.items : [];
    const dateStr = o.created_at ? new Date(o.created_at).toLocaleString("uz-UZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "";

    const addrHtml = o.address && o.address.includes("http")
      ? `<a href="${o.address.replace("GPS: ", "")}" target="_blank" style="color:#38bdf8;text-decoration:underline;">📍 Xaritada ochish (GPS)</a>`
      : (o.address || "Do'kondan olish");

    return `
      <div class="order-card ${isDone ? "done" : ""}">
        <div class="order-top">
          <div>
            <strong>👤 ${o.customer_name}</strong> • <a href="tel:${o.customer_phone}" style="color:#e5b869;text-decoration:none;">📞 ${o.customer_phone}</a>
            <div style="font-size:0.8rem;color:#a8a29e;">🕒 ${dateStr} • ${o.delivery_type || ""} • ${o.payment_type || ""}</div>
          </div>
          <span class="order-badge ${isDone ? "done" : ""}">${isDone ? "✅ Yetkazildi" : "🔔 Yangi zakaz"}</span>
        </div>

        <div style="font-size:0.86rem;">📍 <b>Manzil:</b> ${addrHtml} ${o.delivery_time ? `(${o.delivery_time})` : ""}</div>
        ${o.note ? `<div style="font-size:0.84rem;color:#fbbf24;">📝 <b>Izoh:</b> ${o.note}</div>` : ""}

        <div class="order-items-box">
          ${items.map((it, idx) => `<div>${idx + 1}. <b>${it.name}</b> (${it.cut || ""}) — ${it.qty} ${it.unit} = ${(it.price * it.qty).toLocaleString("uz-UZ")} so'm</div>`).join("")}
        </div>

        <div class="order-footer">
          <strong style="color:#e5b869;font-size:1rem;">💰 Jami: ${Number(o.total_price).toLocaleString("uz-UZ")} so'm</strong>
          <div style="display:flex;gap:6px;">
            ${!isDone ? `<button type="button" class="btn btn-sm btn-stock" onclick="markOrderDone(${o.id})">✅ Yetkazildi</button>` : ""}
            <button type="button" class="btn btn-sm btn-del" onclick="deleteOrder(${o.id})">🗑️ O'chirish</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

async function markOrderDone(id) {
  if (!hasSupabase()) return;
  await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
    method: "PATCH",
    headers: sbHeaders(),
    body: JSON.stringify({ status: "Yetkazildi" })
  });
  await loadOrders();
}

async function deleteOrder(id) {
  if (!confirm("Bu buyurtmani o'chirasizmi?")) return;
  if (hasSupabase()) {
    await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      method: "DELETE",
      headers: sbHeaders()
    });
  }
  await loadOrders();
}

async function loadRemoteData() {
  const localProds = JSON.parse(localStorage.getItem("ugm_products") || "null");
  const localSet = JSON.parse(localStorage.getItem("ugm_settings") || "null");
  if (localSet) storeSettings = { ...storeSettings, ...localSet };

  if (!hasSupabase()) {
    products = localProds || [...INITIAL_PRODUCTS];
    fillSettingsForm();
    updateStoreStatusUI();
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
        products = rows.map(r => ({
          id: Number(r.id),
          name: r.name,
          category: r.category,
          price: Number(r.price),
          unit: r.unit || "kg",
          inStock: Boolean(r.in_stock),
          img: r.img || "",
          desc: r.desc || ""
        }));
        localStorage.setItem("ugm_products", JSON.stringify(products));
      } else {
        products = localProds || [...INITIAL_PRODUCTS];
        await syncAllProductsToSupabase();
      }
    }

    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/store_settings?id=eq.1&select=*`, {
      headers: sbHeaders()
    });
    if (sRes.ok) {
      const sRows = await sRes.json();
      if (sRows && sRows[0]) {
        storeSettings = {
          promo: sRows[0].promo !== null && sRows[0].promo !== undefined ? sRows[0].promo : storeSettings.promo,
          time: sRows[0].cut_time || storeSettings.time,
          origin: sRows[0].origin || storeSettings.origin,
          isOpen: sRows[0].is_open !== false
        };
        localStorage.setItem("ugm_settings", JSON.stringify(storeSettings));
      }
    }
  } catch (err) {
    products = localProds || [...INITIAL_PRODUCTS];
  }

  fillSettingsForm();
  updateStoreStatusUI();
  renderAdminList();
  await loadOrders();
}

async function upsertProductToSupabase(prod, idx = 0) {
  if (!hasSupabase()) return;
  await fetch(`${SUPABASE_URL}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      id: Number(prod.id),
      name: prod.name,
      category: prod.category,
      price: Number(prod.price),
      unit: prod.unit || "kg",
      in_stock: Boolean(prod.inStock),
      img: prod.img || "",
      desc: prod.desc || "",
      sort_order: idx
    })
  });
}

async function syncAllProductsToSupabase() {
  if (!hasSupabase()) return;
  const payload = products.map((p, idx) => ({
    id: Number(p.id),
    name: p.name,
    category: p.category,
    price: Number(p.price),
    unit: p.unit || "kg",
    in_stock: Boolean(p.inStock),
    img: p.img || "",
    desc: p.desc || "",
    sort_order: idx
  }));
  await fetch(`${SUPABASE_URL}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...sbHeaders(), "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(payload)
  });
}

function handleLogin(e) {
  e.preventDefault();
  const savedPass = localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_ADMIN_PASS;
  if (document.getElementById("loginPassword").value === savedPass) {
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
  if (hasSupabase()) {
    await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
      method: "DELETE",
      headers: sbHeaders()
    });
  }
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
  storeSettings.promo = document.getElementById("setPromo").value.trim();
  storeSettings.time = document.getElementById("setTime").value.trim();
  storeSettings.origin = document.getElementById("setOrigin").value.trim();
  await persistSettings();
  alert("Sozlamalar saqlandi!");
}

function renderAdminList() {
  const list = document.getElementById("adminProductList");
  const total = products.length;
  const inStockCount = products.filter(p => p.inStock).length;

  const totalEl = document.getElementById("statTotal");
  if (totalEl) totalEl.innerText = total;
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
