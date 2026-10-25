/* =====================================================
   ADORE'S PET - ADMIN.JS (Tabs, Popups & Product Fixes)
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
                <img src="${p.images?.[0] || 'https://i.postimg.cc/CdyZqRY5/file-000000006ecc71f899e85a5cc31b0405.png'}" alt="">
                <div style="min-width:0;">
                    <div style="font-weight:800; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHTML(p.name)}</div>
                    <div style="font-size:11.5px; color:#64748b;">৳${p.price} | Stock: ${p.stock}</div>
                </div>
            </div>
            <div class="admin-product-actions">
                <button onclick="openEditModal('${p.id}')" style="background:#2563eb;"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteProduct('${p.id}')" style="background:#ef4444;"><i class="fa-solid fa-trash"></i></button>
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

/* ORDER TABS & POPUP MANAGEMENT */
function updateOrderCounts(){
    const pending = myOrders.filter(o => !o.status || o.status === 'pending');
    const completed = myOrders.filter(o => o.status === 'completed');
    const cancelled = myOrders.filter(o => o.status === 'cancelled');

    if(document.getElementById("countPending")) document.getElementById("countPending").innerText = pending.length;
    if(document.getElementById("countCompleted")) document.getElementById("countCompleted").innerText = completed.length;
    if(document.getElementById("countCancelled")) document.getElementById("countCancelled").innerText = cancelled.length;
}

function openOrderModal(status){
    const container = document.getElementById("adminModalOrdersContainer");
    const title = document.getElementById("modalOrderTitle");
    if(!container) return;

    // Highlight active tab
    ['pending', 'completed', 'cancelled'].forEach(s => {
        const btn = document.getElementById("tabBtn" + s.charAt(0).toUpperCase() + s.slice(1));
        if(btn) btn.classList.toggle("active", s === status);
    });

    let filtered = myOrders.filter(o => {
        if(status === 'pending') return !o.status || o.status === 'pending';
        return o.status === status;
    });

    if(title) {
        let titleName = status === 'pending' ? 'পেন্ডিং অর্ডারসমূহ' : (status === 'completed' ? 'কমপ্লিট অর্ডারসমূহ' : 'ক্যানসেলড অর্ডারসমূহ');
        title.innerText = titleName + ` (${filtered.length}টি)`;
    }

    if(filtered.length === 0){
        container.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">এই ক্যাটাগরিতে কোনো অর্ডার নেই।</p>`;
    } else {
        container.innerHTML = filtered.map(o => `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; font-weight:800; color:#00897b; margin-bottom:6px;">
                    <span>${o.id}</span>
                    <span>৳${o.total}</span>
                </div>
                <div style="font-size:12.5px; color:#334155; line-height:1.5; margin-bottom:10px;">
                    <b>নাম:</b> ${escapeHTML(o.name)} (${o.phone})<br>
                    <b>ঠিকানা:</b> ${escapeHTML(o.address)}<br>
                    <b>TrxID:</b> ${escapeHTML(o.trxId || 'N/A')}<br>
                    <div style="margin-top:4px; background:#fff; padding:6px; border-radius:8px; border:1px solid #e2e8f0;">
                        <b>পণ্যসমূহ:</b><br>${o.itemsText ? o.itemsText.replace(/\n/g, '<br>') : 'তথ্য নেই'}
                    </div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button onclick="updateOrderStatus('${o.id}', 'pending')" style="flex:1; padding:6px; font-size:11px; font-weight:700; border:none; border-radius:6px; background:${(!o.status || o.status==='pending')?'#00897b':'#e2e8f0'}; color:${(!o.status || o.status==='pending')?'#fff':'#334155'}; cursor:pointer;">Pending</button>
                    <button onclick="updateOrderStatus('${o.id}', 'completed')" style="flex:1; padding:6px; font-size:11px; font-weight:700; border:none; border-radius:6px; background:${o.status==='completed'?'#10b981':'#e2e8f0'}; color:${o.status==='completed'?'#fff':'#334155'}; cursor:pointer;">Complete</button>
                    <button onclick="updateOrderStatus('${o.id}', 'cancelled')" style="flex:1; padding:6px; font-size:11px; font-weight:700; border:none; border-radius:6px; background:${o.status==='cancelled'?'#ef4444':'#e2e8f0'}; color:${o.status==='cancelled'?'#fff':'#334155'}; cursor:pointer;">Cancel</button>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("adminOrderModal")?.classList.add("show");
}

function closeOrderModal(){ document.getElementById("adminOrderModal")?.classList.remove("show"); }

function updateOrderStatus(orderId, newStatus){
    let order = myOrders.find(o => o.id === orderId);
    if(order){
        order.status = newStatus;
        localStorage.setItem("adoresMyOrders", JSON.stringify(myOrders));
        updateOrderCounts();
        openOrderModal(newStatus); // Refresh current modal view
    }
}

function escapeHTML(str){
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Run initial admin functions */
renderAdminProducts();
updateOrderCounts();
const cb = document.getElementById("adminVacationCheckbox");
if(cb) cb.checked = vacationMode;
