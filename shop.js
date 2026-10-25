/* =====================================================
   ADORE'S PET - SHOP.JS (Customer Shop, Cart & Track Order)
===================================================== */

emailjs.init({ publicKey: "P7lqeBS7YKyU3Kpaq" });

let products = JSON.parse(localStorage.getItem("adoresProducts")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("adoresCart")) || [];
let myOrders = JSON.parse(localStorage.getItem("adoresMyOrders")) || [];
let vacationMode = JSON.parse(localStorage.getItem("adoresVacationMode")) || false;
let currentAdminPassword = localStorage.getItem("adoresAdminPass") || "DJ778899";
let currentCategory = "";
let activeSelectedProductId = null;

function saveProducts(){
    try { localStorage.setItem("adoresProducts", JSON.stringify(products)); } 
    catch(e){ showCustomAlert("ব্রাউজারের মেমরি ফুল! ক্যাশ ক্লিয়ার করুন।"); }
}
function saveCart(){ localStorage.setItem("adoresCart", JSON.stringify(cart)); }
function saveMyOrders(){ localStorage.setItem("adoresMyOrders", JSON.stringify(myOrders)); }

function openSupportModal(){ document.getElementById("supportModal")?.classList.add("show"); }
function closeSupportModal(){ document.getElementById("supportModal")?.classList.remove("show"); }

function forgotPassword(){
    showCustomAlert("আপনার বর্তমান অ্যাডমিন পাসওয়ার্ড হলো: " + currentAdminPassword);
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

function trackMyOrderFromSuccess(){
    closeThankYouModal();
    openOrdersModal();
}

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
        if(title) title.innerText = "জনপ্রিয় প্রোডাক্ট সমূহ";
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

function openCartModal(){
    const container = document.getElementById("cartItemsContainer");
    let subtotal = 0;
    if(!container) return;

    if(cart.length === 0){
        container.innerHTML = `<p style="text-align:center; padding:30px; color:#64748b;">আপনার কার্ট খালি রয়েছে।</p>`;
    } else {
        container.innerHTML = cart.map(item => {
            const p = products.find(x => String(x.id) === String(item.id));
            if(!p) return "";
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += price * item.qty;
            const img = p.images?.[0] || '';
            return `
                <div style="display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
                    <img src="${img}" style="width:55px; height:55px; object-fit:cover; border-radius:8px;" alt="">
                    <div style="flex:1;">
                        <div style="font-weight:700; font-size:13.5px;">${escapeHTML(p.name)}</div>
                        <div style="color:var(--teal); font-weight:800; font-size:13px; margin:2px 0;">৳${price * item.qty}</div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button onclick="changeCartQty('${p.id}', -1)" style="padding:2px 8px; cursor:pointer;">-</button>
                            <span style="font-weight:800; font-size:13px;">${item.qty}</span>
                            <button onclick="changeCartQty('${p.id}', 1)" style="padding:2px 8px; cursor:pointer;">+</button>
                            <button onclick="removeFromCart('${p.id}')" style="background:#fee2e2; color:#ef4444; border:none; padding:3px 6px; border-radius:6px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }
    document.getElementById("cartSubtotalText").innerText = subtotal;
    document.getElementById("cartStepModal")?.classList.add("show");
}

function closeCartModal(){ document.getElementById("cartStepModal")?.classList.remove("show"); }

function changeCartQty(id, chg){
    let item = cart.find(x => String(x.id) === String(id));
    let p = products.find(x => String(x.id) === String(id));
    if(!item || !p) return;
    item.qty += chg;
    if(item.qty <= 0) cart = cart.filter(x => String(x.id) !== String(id));
    else if(item.qty > p.stock) item.qty = p.stock;
    saveCart();
    openCartModal();
    updateCartBadge();
}

function removeFromCart(id){
    cart = cart.filter(x => String(x.id) !== String(id));
    saveCart();
    openCartModal();
    updateCartBadge();
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
    
    if(custInfo) custInfo.innerHTML = `<strong>ID:</strong> ${o.id}<br><strong>Name:</strong> ${escapeHTML(o.name)}<br><strong>Phone:</strong> ${escapeHTML(o.phone)}<br><strong>Address:</strong> ${escapeHTML(o.address)}<br><strong>TrxID:</strong> ${escapeHTML(o.trxId)}`;
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

function escapeHTML(str){
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* Run initial functions */
updateCartBadge();
renderProducts();
checkVacationStatus();
