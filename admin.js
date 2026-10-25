/* =====================================================
   ADORE'S PET - ADMIN.JS (Admin Dashboard Management)
===================================================== */

emailjs.init({ publicKey: "P7lqeBS7YKyU3Kpaq" });

let products = JSON.parse(localStorage.getItem("adoresProducts")) || defaultProducts;
let myOrders = JSON.parse(localStorage.getItem("adoresMyOrders")) || [];
let vacationMode = JSON.parse(localStorage.getItem("adoresVacationMode")) || false;
let currentAdminPassword = localStorage.getItem("adoresAdminPass") || "DJ778899";

function saveProducts(){
    try { localStorage.setItem("adoresProducts", JSON.stringify(products)); } 
    catch(e){ alert("মেমরি ফুল!"); }
}
function saveMyOrders(){ localStorage.setItem("adoresMyOrders", JSON.stringify(myOrders)); }

function toggleVacationMode(){
    const checkbox = document.getElementById("adminVacationCheckbox");
    if(checkbox){
        vacationMode = checkbox.checked;
        localStorage.setItem("adoresVacationMode", JSON.stringify(vacationMode));
        alert(vacationMode ? "ভ্যাকেশন মোড চালু করা হয়েছে!" : "ভ্যাকেশন মোড বন্ধ করা হয়েছে।");
    }
}

function changeAdminPassword(){
    const newPass = document.getElementById("newAdminPasswordInput")?.value.trim();
    if(!newPass){ alert("নতুন পাসওয়ার্ড লিখুন।"); return; }
    localStorage.setItem("adoresAdminPass", newPass);
    currentAdminPassword = newPass;
    document.getElementById("newAdminPasswordInput").value = "";
    alert("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");
}

function renderAdminProducts(){
    const container = document.getElementById("adminProducts");
    if(!container) return;
    if(products.length === 0){ container.innerHTML = "কোনো পণ্য নেই।"; return; }
    container.innerHTML = products.map(p => `
        <div class="admin-product-card">
            <div class="admin-product-info">
                <img src="${p.images?.[0] || ''}" alt="">
                <div>
                    <div style="font-weight:700; font-size:13px;">${escapeHTML(p.name)}</div>
                    <div style="font-size:12px; color:#64748b;">Price: ৳${p.price} | Stock: ${p.stock}</div>
                </div>
            </div>
            <div>
                <button onclick="openEditModal('${p.id}')" style="background:#2563eb; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteProduct('${p.id}')" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `).join("");
}

function addProduct(){
    const name = document.getElementById("productName")?.value.trim();
    const price = Number(document.getElementById("productPrice")?.value);
    const disc = document.getElementById("productDiscountPrice")?.value.trim() ? Number(document.getElementById("productDiscountPrice")?.value) : null;
    const stock = Number(document.getElementById("productStock")?.value);
    const age = document.getElementById("productAge")?.value.trim();
    const color = document.getElementById("productColor")?.value.trim();
    const category = document.getElementById("productCategory")?.value;
    const rating = document.getElementById("productRating")?.value.trim() || "4.8";
    const desc = document.getElementById("productDesc")?.value.trim();
    const u1 = document.getElementById("imageUrl1")?.value.trim();
    const u2 = document.getElementById("imageUrl2")?.value.trim();
    const u3 = document.getElementById("imageUrl3")?.value.trim();
    const vUrl = document.getElementById("productVideoUrlInput")?.value.trim();

    let imgs = [u1, u2, u3].filter(Boolean);
    if(imgs.length === 0) imgs = ["https://i.postimg.cc/CdyZqRY5/file-000000006ecc71f899e85a5cc31b0405.png"];

    if(!name || price <= 0){ alert("সঠিক নাম ও দাম দিন।"); return; }

    products.unshift({
        id: String(Date.now()), name, price, discountPrice: disc, stock, age, color, category, rating, desc, images: imgs, videoUrl: vUrl
    });

    saveProducts();
    renderAdminProducts();
    alert("পণ্য সফলভাবে যোগ করা হয়েছে!");
}

function deleteProduct(id){
    products = products.filter(x => String(x.id) !== String(id));
    saveProducts();
    renderAdminProducts();
}

function openEditModal(id){
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;
    document.getElementById("editProductId").value = p.id;
    document.getElementById("editProductName").value = p.name;
    document.getElementById("editProductPrice").value = p.price;
    document.getElementById("editProductDiscountPrice").value = p.discountPrice !== null ? p.discountPrice : "";
    document.getElementById("editProductStock").value = p.stock;
    document.getElementById("editProductAge").value = p.age || "";
    document.getElementById("editProductImgUrl").value = p.images?.[0] || "";
    document.getElementById("editProductVideoUrl").value = p.videoUrl || "";
    document.getElementById("editModal")?.classList.add("show");
}

function closeEditModal(){ document.getElementById("editModal")?.classList.remove("show"); }

function saveEditProduct(){
    const id = document.getElementById("editProductId")?.value;
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;
    p.name = document.getElementById("editProductName")?.value.trim();
    p.price = Number(document.getElementById("editProductPrice")?.value);
    p.discountPrice = document.getElementById("editProductDiscountPrice")?.value.trim() ? Number(document.getElementById("editProductDiscountPrice")?.value) : null;
    p.stock = Number(document.getElementById("editProductStock")?.value);
    p.age = document.getElementById("editProductAge")?.value.trim();
    const u = document.getElementById("editProductImgUrl")?.value.trim();
    if(u) p.images = [u];
    p.videoUrl = document.getElementById("editProductVideoUrl")?.value.trim();

    saveProducts();
    renderAdminProducts();
    closeEditModal();
    alert("সংশোধন সফল হয়েছে!");
}

function renderAdminOrders(){
    const container = document.getElementById("adminOrdersListContainer");
    if(!container) return;
    const pending = myOrders.filter(o => !o.status || o.status === 'pending');
    
    const pendingBadge = document.getElementById("pendingNotifBadge");
    if(pendingBadge) pendingBadge.innerText = pending.length + " নতুন অর্ডার";

    container.innerHTML = myOrders.map((o, idx) => `
        <div style="background:white; border:1px solid #cbd5e1; border-radius:10px; padding:10px; margin-bottom:10px;">
            <div style="font-weight:800; color:#00897b;">${o.id} - ৳${o.total}</div>
            <div style="font-size:12px; margin:4px 0;">${escapeHTML(o.name)} (${o.phone})<br>${escapeHTML(o.address)}<br><b>TrxID:</b> ${escapeHTML(o.trxId || 'N/A')}</div>
        </div>
    `).join("");
}

function toggleAdminOrderList(){
    const panel = document.getElementById("collapsibleOrderPanel");
    if(panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function escapeHTML(str){
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Run initial admin functions */
renderAdminProducts();
renderAdminOrders();
const cb = document.getElementById("adminVacationCheckbox");
if(cb) cb.checked = vacationMode;
