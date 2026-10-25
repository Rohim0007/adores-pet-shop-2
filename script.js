/* =====================================================
   ADORE'S PET - SCRIPT.JS (UPDATED & CLEANED)
===================================================== */

emailjs.init({ publicKey: "P7lqeBS7YKyU3Kpaq" });

const defaultProducts = [
{
    id: "1",
    name: "Nipple Feeder",
    price: 50,
    discountPrice: 40,
    stock: 10,
    category: "Accessories",
    color: "Silver/Red",
    age: "",
    desc: "Stainless steel automatic nipple feeder for pets.",
    rating: "4.8",
    images: ["https://i.postimg.cc/CdyZqRY5/file-000000006ecc71f899e85a5cc31b0405.png"],
    videoUrl: ""
},
{
    id: "2",
    name: "Dwarf Rabbit Pair",
    price: 2800,
    discountPrice: 2500,
    stock: 5,
    category: "Rabbit",
    color: "Mixed Color",
    age: "2 Months",
    desc: "Healthy & active pair of Netherland Dwarf Rabbits.",
    rating: "4.8",
    images: ["https://i.postimg.cc/hGyVG8y6/file-000000006f14720b98a7a5a54d184cb0.png"],
    videoUrl: ""
}
];

let products = JSON.parse(localStorage.getItem("adoresProducts")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("adoresCart")) || [];
let myOrders = JSON.parse(localStorage.getItem("adoresMyOrders")) || [];
let vacationMode = JSON.parse(localStorage.getItem("adoresVacationMode")) || false;
let currentAdminPassword = localStorage.getItem("adoresAdminPass") || "DJ778899";
let currentCategory = "";
let currentAdminTab = "pending";
let activeSelectedProductId = null;

function saveProducts(){
    try { localStorage.setItem("adoresProducts", JSON.stringify(products)); } 
    catch(e){ showCustomAlert("ব্রাউজারের মেমরি ফুল! দয়া করে ক্যাশ ক্লিয়ার করুন।"); }
}
function saveCart(){ localStorage.setItem("adoresCart", JSON.stringify(cart)); }
function saveMyOrders(){ localStorage.setItem("adoresMyOrders", JSON.stringify(myOrders)); }

function openSupportModal(){ document.getElementById("supportModal").classList.add("show"); }
function closeSupportModal(){ document.getElementById("supportModal").classList.remove("show"); }

function forgotPassword(){
    showCustomAlert("আপনার বর্তমান অ্যাডমিন পাসওয়ার্ড হলো: " + currentAdminPassword);
}

function changeAdminPassword(){
    const newPass = document.getElementById("newAdminPasswordInput").value.trim();
    if(!newPass){ showCustomAlert("নতুন পাসওয়ার্ড লিখুন।"); return; }
    localStorage.setItem("adoresAdminPass", newPass);
    currentAdminPassword = newPass;
    document.getElementById("newAdminPasswordInput").value = "";
    showSuccessPopup("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!");
}

function toggleVacationMode(){
    const checkbox = document.getElementById("adminVacationCheckbox");
    if(checkbox){
        vacationMode = checkbox.checked;
        localStorage.setItem("adoresVacationMode", JSON.stringify(vacationMode));
        checkVacationStatus();
        showSuccessPopup(vacationMode ? "ভ্যাকেশন মোড চালু করা হয়েছে!" : "ভ্যাকেশন মোড বন্ধ করা হয়েছে।");
    }
}

function checkVacationStatus(){
    const vBox = document.getElementById("vacationBoxContainer");
    const nContent = document.getElementById("normalHomeContent");
    const bottomNav = document.querySelector(".bottom-nav");
    
    if(vBox && nContent){
        vBox.style.display = vacationMode ? "block" : "none";
        nContent.style.display = vacationMode ? "none" : "block";
    }
    if(bottomNav){
        bottomNav.style.display = vacationMode ? "none" : "flex";
    }
}

function showCustomAlert(msg){
    const alertMsg = document.getElementById("customAlertMessage");
    const alertModal = document.getElementById("customAlertModal");
    if(alertMsg && alertModal){
        alertMsg.innerText = msg;
        alertModal.classList.add("show");
    }
}
function closeCustomAlert(){ document.getElementById("customAlertModal")?.classList.remove("show"); }

function showSuccessPopup(msg){
    const popupText = document.getElementById("successPopupText");
    const thankyouModal = document.getElementById("thankyouModal");
    if(popupText && thankyouModal){
        popupText.innerHTML = msg;
        thankyouModal.classList.add("show");
    }
}
function closeThankYouModal(){ document.getElementById("thankyouModal")?.classList.remove("show"); }

function goHome(){
    currentCategory = "";
    const searchInput = document.getElementById("searchInput");
    if(searchInput) searchInput.value = "";
    document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
    renderProducts();
}

function selectCategory(cat, btn){
    currentCategory = cat;
    document.querySelectorAll(".chip-btn").forEach(b => b.classList.remove("active"));
    if(btn) btn.classList.add("active");
    const searchInput = document.getElementById("searchInput");
    if(searchInput) searchInput.value = "";
    renderProducts();
}

function renderProducts(){
    const grid = document.getElementById("productsGrid");
    const title = document.getElementById("productsTitle");
    const search = document.getElementById("searchInput")?.value.trim().toLowerCase() || "";

    if(!grid) return;

    let filtered = products;
    if(currentCategory){
        if(title) title.innerText = currentCategory + " Supplies";
        filtered = filtered.filter(p => p.category.toLowerCase() === currentCategory.toLowerCase());
    } else if(search){
        if(title) title.innerText = 'Search Results';
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    } else {
        if(title) title.innerText = "Popular Pet Supplies";
    }

    if(filtered.length === 0){
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#64748b;">কোনো পণ্য পাওয়া যায়নি।</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const mainImg = p.images?.[0] || 'https://i.postimg.cc/CdyZqRY5/file-000000006ecc71f899e85a5cc31b0405.png';
        const hasDiscount = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;
        const price = hasDiscount ? p.discountPrice : p.price;
        const stockCls = p.stock > 0 ? "stock-in" : "stock-out";
        const stockTxt = p.stock > 0 ? `Stock: ${p.stock} Pcs` : `Out of Stock`;

        return `
            <div class="product-card" onclick="openProductModal('${p.id}')">
                <div class="product-img-wrap">
                    <img src="${mainImg}" alt="${escapeHTML(p.name)}">
                    ${hasDiscount ? `<div class="discount-badge-tag">OFFER</div>` : ''}
                    <div class="rating-badge"><i class="fa-solid fa-star"></i> ${p.rating || '4.8'}</div>
                    ${p.color ? `<div class="color-badge">${escapeHTML(p.color)}</div>` : ''}
                </div>
                <div class="product-info">
                    <div class="product-name">${escapeHTML(p.name)}</div>
                    ${p.age ? `<div class="age-pill-badge">Age: ${escapeHTML(p.age)}</div>` : ''}
                    <span class="stock-pill-badge ${stockCls}">${stockTxt}</span>
                    <div class="product-footer-row">
                        <div>
                            ${hasDiscount ? `<span class="old-price-strike">৳${p.price}</span>` : ''}
                            <span class="product-price ${hasDiscount ? 'discounted' : ''}">৳${price}</span>
                        </div>
                        <span class="view-details-tag">View Details</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function openProductModal(id){
    const p = products.find(x => String(x.id) === String(id));
    if(!p) return;
    activeSelectedProductId = p.id;

    document.getElementById("modalProdName").innerText = p.name;
    document.getElementById("modalProdDetails").innerText = p.desc || "বিবরণ নেই।";

    const hasDiscount = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;
    const price = hasDiscount ? p.discountPrice : p.price;
    document.getElementById("modalPriceContainer").innerHTML = hasDiscount ? 
        `<span style="font-size:12px; color:#94a3b8; text-decoration:line-through;">৳${p.price}</span><br><span style="font-size:22px; font-weight:900; color:#ef4444;">৳${price}</span>` :
        `<span style="font-size:22px; font-weight:900; color:var(--teal);">৳${p.price}</span>`;

    const stockBadge = document.getElementById("modalProdStock");
    stockBadge.className = "stock-pill-badge " + (p.stock > 0 ? "stock-in" : "stock-out");
    stockBadge.innerText = p.stock > 0 ? `Stock: ${p.stock} Pcs` : `Out of Stock`;

    const ageBadge = document.getElementById("modalProdAge");
    if(p.age){ ageBadge.style.display = "inline-flex"; ageBadge.innerText = `Age: ${p.age}`; } 
    else { ageBadge.style.display = "none"; }

    const vContainer = document.getElementById("modalVideoLinkContainer");
    const vAnchor = document.getElementById("modalVideoAnchor");
    if(p.videoUrl && p.videoUrl.trim() !== ""){
        vAnchor.href = p.videoUrl.trim();
        vContainer.style.display = "block";
    } else { if(vContainer) vContainer.style.display = "none"; }

    const mainImg = document.getElementById("modalMainImg");
    const thumbContainer = document.getElementById("modalThumbnails");
    if(thumbContainer) thumbContainer.innerHTML = "";
    let imgs = p.images?.filter(Boolean) || ['https://i.postimg.cc/CdyZqRY5/file-000000006ecc71f899e85a5cc31b0405.png'];
    
    if(thumbContainer) thumbContainer.style.display = imgs.length > 1 ? "flex" : "none";
    if(mainImg) mainImg.src = imgs[0];

    imgs.forEach((src, idx) => {
        const thumb = document.createElement("img");
        thumb.src = src;
        thumb.style.cssText = "width:50px; height:50px; object-fit:cover; border-radius:8px; cursor:pointer; border:2px solid " + (idx === 0 ? "var(--teal)" : "#cbd5e1");
        thumb.onclick = () => { if(mainImg) mainImg.src = src; };
        if(thumbContainer) thumbContainer.appendChild(thumb);
    });

    document.getElementById("productDetailModal")?.classList.add("show");
}

function closeProductModal(){ document.getElementById("productDetailModal")?.classList.remove("show"); }

function addModalProductToCart(){
    if(vacationMode){ showCustomAlert("শপ বর্তমানে বন্ধ আছে।"); return; }
    if(activeSelectedProductId){ addToCart(activeSelectedProductId); closeProductModal(); }
}

function searchProducts(){ renderProducts(); }

function addToCart(id){
    if(vacationMode){ showCustomAlert("শপ বর্তমানে বন্ধ আছে।"); return; }
    const p = products.find(x => String(x.id) === String(id));
    if(!p || p.stock <= 0){ showCustomAlert("পণ্যটি স্টকে নেই।"); return; }
    let item = cart.find(x => String(x.id) === String(id));
    if(item){
        if(item.qty >= p.stock){ showCustomAlert("সর্বোচ্চ স্টক পার হয়ে গেছে।"); return; }
        item.qty++;
    } else { cart.push({ id: String(id), qty: 1 }); }
    saveCart();
    updateCartBadge();
    showSuccessPopup("কার্টে যোগ করা হয়েছে!");
}

function updateCartBadge(){
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById("cartCount");
    if(badge){ badge.innerText = count; badge.style.display = count > 0 ? "flex" : "none"; }
}

function updateCart(){
    const container = document.getElementById("cartItems");
    let subtotal = 0;
    if(!container) return;
    if(cart.length === 0){
        container.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">কার্ট খালি রয়েছে।</p>`;
    } else {
        container.innerHTML = cart.map(item => {
            const p = products.find(x => String(x.id) === String(item.id));
            if(!p) return "";
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += price * item.qty;
            const img = p.images?.[0] || '';
            return `
                <div class="cart-item">
                    <img src="${img}" alt="">
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:14px;">${escapeHTML(p.name)}</div>
                        <div style="color:var(--teal); font-weight:800; font-size:14px; margin:4px 0;">৳${price * item.qty}</div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <button onclick="changeCartQty('${p.id}', -1)" style="padding:4px 10px; cursor:pointer;">-</button>
                            <span style="font-weight:800;">${item.qty}</span>
                            <button onclick="changeCartQty('${p.id}', 1)" style="padding:4px 10px; cursor:pointer;">+</button>
                            <button onclick="removeFromCart('${p.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:4px 8px; border-radius:6px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
    const subElem = document.getElementById("subtotal");
    if(subElem) subElem.innerText = subtotal;
    updateDelivery();
    updateCartBadge();
}

function changeCartQty(id, chg){
    let item = cart.find(x => String(x.id) === String(id));
    let p = products.find(x => String(x.id) === String(id));
    if(!item || !p) return;
    item.qty += chg;
    if(item.qty <= 0) cart = cart.filter(x => String(x.id) !== String(id));
    else if(item.qty > p.stock) item.qty = p.stock;
    saveCart();
    updateCart();
}

function removeFromCart(id){
    cart = cart.filter(x => String(x.id) !== String(id));
    saveCart();
    updateCart();
}

function openCart(){ document.getElementById("cartOverlay")?.classList.add("show"); updateCart(); }
function closeCart(){ document.getElementById("cartOverlay")?.classList.remove("show"); }

function updateDelivery(){
    const dist = document.getElementById("customerDistrict")?.value || "";
    let delivery = 0;
    if(cart.length > 0 && dist !== ""){
        delivery = (dist === "Dhaka") ? 80 : 150;
    }
    const sub = Number(document.getElementById("subtotal")?.innerText || 0);
    const delElem = document.getElementById("deliveryCharge");
    const grandElem = document.getElementById("grandTotal");
    if(delElem) delElem.innerText = delivery;
    if(grandElem) grandElem.innerText = sub + delivery;
}

function placeOrder(){
    if(vacationMode){ showCustomAlert("শপ বন্ধ আছে।"); return; }
    if(cart.length === 0){ showCustomAlert("কার্ট খালি!"); return; }
    const name = document.getElementById("customerName")?.value.trim();
    const phone = document.getElementById("customerPhone")?.value.trim();
    const dist = document.getElementById("customerDistrict")?.value;
    const addr = document.getElementById("customerAddress")?.value.trim();

    if(!name || !phone || !dist || !addr){ showCustomAlert("সব তথ্য পূরণ করুন।"); return; }

    let sub = 0, itemsHtml = "", itemsTxt = "", tableHtml = "";
    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(!p) return;
        const pr = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
        const tot = pr * item.qty;
        sub += tot;
        itemsHtml += `• ${p.name} (${item.qty}টি) - ৳${tot}<br>`;
        itemsTxt += `• ${p.name} (${item.qty}টি) - ৳${tot}\n`;
        tableHtml += `<tr><td>${escapeHTML(p.name)}</td><td>${item.qty}</td><td>৳${tot}</td></tr>`;
        p.stock -= item.qty;
        if(p.stock < 0) p.stock = 0;
    });

    saveProducts();
    const del = Number(document.getElementById("deliveryCharge")?.innerText || 0);
    const total = sub + del;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    myOrders.unshift({
        id: orderId, date: new Date().toLocaleDateString('bn-BD'),
        name, phone, district: dist, address: addr, itemsText: itemsTxt, tableHtml, subtotal: sub, delivery: del, total, status: 'pending'
    });
    saveMyOrders();

    emailjs.send("service_5am5end", "template_45wz8f9", {
        customer_name: name, customer_phone: phone, district: dist, address: addr, order_items: itemsHtml, subtotal: sub, delivery_charge: del, total
    }).catch(e => console.log(e));

    const waMsg = `🛒 *New Order*\n🆔 ${orderId}\n👤 ${name}\n📞 ${phone}\n📍 ${dist}\n🏠 ${addr}\n💰 Total: ৳${total}`;
    window.open(`https://wa.me/8801681578599?text=` + encodeURIComponent(waMsg), '_blank');

    cart = [];
    saveCart();
    updateCartBadge();
    renderProducts();
    closeCart();
    showSuccessPopup("অর্ডার সফলভাবে জমা হয়েছে!");
}

function openOrdersModal(){
    const container = document.getElementById("userOrdersList");
    if(!container) return;
    if(myOrders.length === 0){
        container.innerHTML = `<p style="text-align:center; color:#64748b;">কোনো অর্ডার নেই।</p>`;
    } else {
        container.innerHTML = myOrders.map((o, idx) => `
            <div class="order-card">
                <div class="order-card-header"><span>${o.id}</span><span>৳${o.total}</span></div>
                <div style="font-size:12px; margin-bottom:6px;">${o.itemsText.replace(/\n/g, '<br>')}</div>
                <button onclick="openVoucher(${idx})" style="background:var(--teal); color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px;">ভাউচার দেখুন</button>
            </div>
        `).join("");
    }
    document.getElementById("ordersModal")?.classList.add("show");
}
function closeOrdersModal(){ document.getElementById("ordersModal")?.classList.remove("show"); }

function openVoucher(idx){
    const o = myOrders[idx];
    if(!o) return;
    const custInfo = document.getElementById("voucherCustomerInfo");
    const tableBody = document.getElementById("voucherTableBody");
    const totalsBox = document.getElementById("voucherTotalsBox");
    
    if(custInfo) custInfo.innerHTML = `<strong>ID:</strong> ${o.id}<br><strong>Name:</strong> ${escapeHTML(o.name)}<br><strong>Phone:</strong> ${escapeHTML(o.phone)}`;
    if(tableBody) tableBody.innerHTML = o.tableHtml;
    if(totalsBox) totalsBox.innerHTML = `Subtotal: ৳${o.subtotal}<br>Delivery: ৳${o.delivery}<br><strong>Total: ৳${o.total}</strong>`;
    
    document.getElementById("voucherModal")?.classList.add("show");
}
function closeVoucherModal(){ document.getElementById("voucherModal")?.classList.remove("show"); }

let scCount = 0;
function handleSecretClick(){
    scCount++;
    if(scCount === 3){ scCount = 0; openAdminLoginModal(); }
    setTimeout(() => { scCount = 0; }, 1000);
}
function openAdminLoginModal(){ document.getElementById("adminLoginModal")?.classList.add("show"); }
function closeAdminLoginModal(){ document.getElementById("adminLoginModal")?.classList.remove("show"); }

function submitAdminLogin(){
    const pass = document.getElementById("modalAdminPassword")?.value;
    if(pass === currentAdminPassword){
        window.location.href = "admin.html";
    } else { showCustomAlert("ভুল পাসওয়ার্ড!"); }
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

    if(!name || price <= 0){ showCustomAlert("সঠিক নাম ও দাম দিন।"); return; }

    products.unshift({
        id: String(Date.now()), name, price, discountPrice: disc, stock, age, color, category, rating, desc, images: imgs, videoUrl: vUrl
    });

    saveProducts();
    renderAdminProducts();
    showSuccessPopup("পণ্য সফলভাবে যোগ করা হয়েছে!");
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
    showSuccessPopup("সংশোধন সফল হয়েছে!");
}

function renderAdminOrders(){
    const container = document.getElementById("adminOrdersListContainer");
    if(!container) return;
    const pending = myOrders.filter(o => !o.status || o.status === 'pending');
    
    const countPending = document.getElementById("countPending");
    const pendingBadge = document.getElementById("pendingNotifBadge");
    
    if(countPending) countPending.innerText = pending.length;
    if(pendingBadge) pendingBadge.innerText = pending.length + " নতুন অর্ডার";

    container.innerHTML = myOrders.map((o, idx) => `
        <div style="background:white; border:1px solid #cbd5e1; border-radius:10px; padding:10px; margin-bottom:10px;">
            <div style="font-weight:800; color:var(--teal);">${o.id} - ৳${o.total}</div>
            <div style="font-size:12px; margin:4px 0;">${escapeHTML(o.name)} (${o.phone})<br>${escapeHTML(o.address)}</div>
            <button onclick="openVoucher(${idx})" style="background:var(--teal); color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer;">ভাউচার</button>
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

/* Run initial functions safely */
updateCartBadge();
renderProducts();
checkVacationStatus();

if(document.getElementById("adminProducts")){
    renderAdminProducts();
    renderAdminOrders();
    const cb = document.getElementById("adminVacationCheckbox");
    if(cb) cb.checked = vacationMode;
}
