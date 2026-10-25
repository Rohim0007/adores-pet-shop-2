/* =====================================================
   ADORE'S PET - CHECKOUT.JS (3-Step Checkout & Districts)
===================================================== */

function loadDistrictsDropdown(){
    const distSelect = document.getElementById("checkoutDistrict");
    if(!distSelect) return;
    let options = `<option value="">জেলা নির্বাচন করুন</option>`;
    const allDistricts = [
        "Dhaka", "Chattogram", "Gazipur", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh", "Comilla",
        "Faridpur", "Cox's Bazar", "Narayanganj", "Tangail", "Kishoreganj", "Manikganj", "Munshiganj", "Narsingdi", "Netrokona",
        "Sherpur", "Jamalpur", "Brahmanbaria", "Chandpur", "Noakhali", "Feni", "Lakshmipur", "Bagerhat", "Chuadanga", "Jashore",
        "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
        "Bandarban", "Khagrachhari", "Rangamati", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh",
        "Thakurgaon", "Habiganj", "Moulvibazar", "Sunamganj", "Bogra", "Joypurhat", "Naogaon", "Natore", "Pabna", "Sirajganj"
    ];
    allDistricts.sort().forEach(d => {
        options += `<option value="${d}">${d}</option>`;
    });
    distSelect.innerHTML = options;
}

function onDistrictChange(){
    const dist = document.getElementById("checkoutDistrict").value;
    const thanaSelect = document.getElementById("checkoutThana");
    if(!thanaSelect) return;

    let thanas = bdDistrictsWithThanas[dist] || ["সদর থানা", "অন্যান্য এলাকা"];
    let html = `<option value="">থানা/এলাকা বাছুন</option>`;
    thanas.forEach(t => {
        html += `<option value="${t}">${t}</option>`;
    });
    thanaSelect.innerHTML = html;
    calculateDeliveryCharge();
}

function goToCheckoutStep(){
    if(cart.length === 0){ showCustomAlert("আপনার কার্ট খালি!"); return; }
    closeCartModal();
    loadDistrictsDropdown();
    calculateDeliveryCharge();
    document.getElementById("checkoutStepModal")?.classList.add("show");
}

function closeCheckoutModal(){ document.getElementById("checkoutStepModal")?.classList.remove("show"); }

function hasLiveAnimals(){
    return cart.some(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(!p) return false;
        const cat = p.category.toLowerCase();
        return cat.includes("rabbit") || cat.includes("hamster");
    });
}

function calculateDeliveryCharge(){
    const dist = document.getElementById("checkoutDistrict")?.value || "";
    let subtotal = 0;
    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(p){
            const pr = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += pr * item.qty;
        }
    });

    let delivery = 0;
    const isLive = hasLiveAnimals();

    if(dist !== ""){
        if(isLive){
            delivery = (dist === "Dhaka") ? 400 : 500;
        } else {
            delivery = (dist === "Dhaka") ? 80 : 150;
        }
    }

    document.getElementById("checkoutSubtotal").innerText = subtotal;
    document.getElementById("checkoutDeliveryCharge").innerText = delivery;
    document.getElementById("checkoutGrandTotal").innerText = subtotal + delivery;

    const noticeBox = document.getElementById("advanceNoticeBox");
    const noticeTitle = document.getElementById("paymentNoticeTitle");
    const noticeDesc = document.getElementById("paymentNoticeDesc");
    const trxLabel = document.getElementById("trxIdLabel");

    if(isLive){
        noticeBox.style.display = "block";
        noticeTitle.innerText = "⚠️ পশুপাখির জন্য অগ্রিম ডেলিভারি চার্জ বাধ্যতামূলক!";
        noticeDesc.innerHTML = `খরগোশ বা হ্যামস্টার অর্ডারের জন্য ডেলিভারি চার্জ (<b>৳${delivery}</b>) অগ্রিম বিকাশ/নগদে পাঠিয়ে ট্রানজেকশন আইডি দিন।`;
        trxLabel.innerHTML = "ট্রানজেকশন আইডি (TrxID) / বিকাশ নাম্বার * (বাধ্যতামূলক)";
    } else {
        noticeBox.style.display = "block";
        noticeTitle.innerText = "ℹ️ পেমেন্ট অপশন (ক্যাশ অন ডেলিভারি)";
        noticeDesc.innerHTML = `খাবার বা এক্সেসরিজের ক্ষেত্রে ক্যাশ অন ডেলিভারি প্রযোজ্য। চাইলে ডেলিভারি চার্জ অগ্রিম দিতে পারেন।`;
        trxLabel.innerHTML = "ট্রানজেকশন আইডি (TrxID) / বিকাশ নাম্বার (অপশনাল)";
    }
}

function confirmOrderSubmit(){
    const name = document.getElementById("checkoutName")?.value.trim();
    const phone = document.getElementById("checkoutPhone")?.value.trim();
    const dist = document.getElementById("checkoutDistrict")?.value;
    const thana = document.getElementById("checkoutThana")?.value;
    const addr = document.getElementById("checkoutAddress")?.value.trim();
    const trxId = document.getElementById("checkoutTrxId")?.value.trim();

    if(!name || !phone || !dist || !thana || !addr){
        showCustomAlert("দয়া করে নাম, ফোন, জেলা, থানা এবং সম্পূর্ণ ঠিকানা পূরণ করুন।");
        return;
    }

    if(hasLiveAnimals() && !trxId){
        showCustomAlert("পশুপাখির অর্ডারের জন্য অবশ্যই ডেলিভারি চার্জ পাঠিয়ে TrxID বা বিকাশ নাম্বারটি লিখুন।");
        return;
    }

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
    const del = Number(document.getElementById("checkoutDeliveryCharge")?.innerText || 0);
    const total = sub + del;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `${addr}, থানা/এলাকা: ${thana}, জেলা: ${dist}`;

    myOrders.unshift({
        id: orderId, date: new Date().toLocaleDateString('bn-BD'),
        name, phone, district: dist, thana, address: fullAddress, trxId: trxId || 'N/A', itemsText: itemsTxt, tableHtml, subtotal: sub, delivery: del, total, status: 'pending'
    });
    saveMyOrders();

    emailjs.send("service_5am5end", "template_45wz8f9", {
        customer_name: name, customer_phone: phone, district: dist, address: fullAddress, order_items: itemsHtml, subtotal: sub, delivery_charge: del, total, trx_id: trxId || 'None'
    }).catch(e => console.log(e));

    const waMsg = `🛒 *New Order - ADORE'S PET*\n🆔 ${orderId}\n👤 ${name}\n📞 ${phone}\n📍 ${dist} (${thana})\n🏠 ${addr}\n💳 TrxID: ${trxId || 'N/A'}\n💰 Total: ৳${total}`;
    window.open(`https://wa.me/8801681578599?text=` + encodeURIComponent(waMsg), '_blank');

    cart = [];
    saveCart();
    updateCartBadge();
    renderProducts();
    closeCheckoutModal();
    showSuccessPopup("অর্ডার সফলভাবে জমা হয়েছে! ধন্যবাদ।");
}
