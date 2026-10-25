/* =====================================================
   ADORE'S PET - CHECKOUT.JS (District/Area & Order Submission)
===================================================== */

function openCheckoutModal(){
    if(cart.length === 0){
        showCustomAlert("আপনার কার্ট খালি রয়েছে।");
        return;
    }
    closeCartModal();
    populateDistricts();
    document.getElementById("checkoutFormModal")?.classList.add("show");
}

function closeCheckoutModal(){
    document.getElementById("checkoutFormModal")?.classList.remove("show");
}

function populateDistricts(){
    const distSelect = document.getElementById("checkoutDistrictSelect");
    if(!distSelect) return;
    
    distSelect.innerHTML = Object.keys(bangladeshDistricts).map(d => `<option value="${d}">${d}</option>`).join("");
    onDistrictChange();
}

function onDistrictChange(){
    const distSelect = document.getElementById("checkoutDistrictSelect");
    const areaSelect = document.getElementById("checkoutAreaSelect");
    if(!distSelect || !areaSelect) return;

    const selectedDist = distSelect.value;
    const areas = bangladeshDistricts[selectedDist] || [];
    
    areaSelect.innerHTML = areas.map(a => `<option value="${a}">${a}</option>`).join("");
}

function submitOrder(){
    const name = document.getElementById("checkoutName")?.value.trim();
    const phone = document.getElementById("checkoutPhone")?.value.trim();
    const district = document.getElementById("checkoutDistrictSelect")?.value;
    const area = document.getElementById("checkoutAreaSelect")?.value;
    const address = document.getElementById("checkoutAddress")?.value.trim();
    const trxId = document.getElementById("checkoutTrxId")?.value.trim() || "COD/Not Provided";

    if(!name || !phone || !district || !area || !address){
        showCustomAlert("দয়া করে আপনার নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা দিন।");
        return;
    }

    let subtotal = 0;
    let itemsTextArr = [];
    let tableHtmlArr = [];

    cart.forEach(item => {
        let p = products.find(x => String(x.id) === String(item.id));
        if(p){
            let price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            let itemTotal = price * item.qty;
            subtotal += itemTotal;
            itemsTextArr.push(`• ${p.name} (Qty: ${item.qty}) - ৳${itemTotal}`);
            tableHtmlArr.push(`<tr><td style="padding:6px; border-bottom:1px solid #e2e8f0;">${escapeHTML(p.name)}</td><td style="padding:6px; border-bottom:1px solid #e2e8f0; text-align:center;">${item.qty}</td><td style="padding:6px; border-bottom:1px solid #e2e8f0; text-align:right;">৳${itemTotal}</td></tr>`);
        }
    });

    let deliveryCost = 100;
    let total = subtotal + deliveryCost;
    let orderId = "AP-" + Math.floor(100000 + Math.random() * 900000);

    let fullAddress = `${address}, Area: ${area}, District: ${district}`;
    let itemsTextStr = itemsTextArr.join("\n");
    let tableHtmlStr = tableHtmlArr.join("");

    let newOrder = {
        id: orderId,
        name,
        phone,
        address: fullAddress,
        trxId,
        itemsText: itemsTextStr,
        tableHtml: tableHtmlStr,
        subtotal,
        delivery: deliveryCost,
        total,
        status: 'pending',
        date: new Date().toLocaleString()
    };

    // Deduct stock
    cart.forEach(item => {
        let p = products.find(x => String(x.id) === String(item.id));
        if(p){
            p.stock = Math.max(0, p.stock - item.qty);
        }
    });
    saveProducts();
    renderProducts();

    myOrders.unshift(newOrder);
    saveMyOrders();

    // Clear cart
    cart = [];
    saveCart();
    updateCartBadge();

    closeCheckoutModal();

    // Send via EmailJS if configured
    try {
        emailjs.send("service_default", "template_default", {
            order_id: orderId,
            customer_name: name,
            customer_phone: phone,
            customer_address: fullAddress,
            order_items: itemsTextStr,
            total_amount: total,
            trx_id: trxId
        }).catch(err => console.log("EmailJS send err:", err));
    } catch(e) {}

    showSuccessPopup(`আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে!<br><b>অর্ডার আইডি:</b> ${orderId}<br>খুব শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।`);
}
