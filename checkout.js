/* =====================================================
   ADORE'S PET - CHECKOUT.JS (Checkout, Districts & EmailJS)
===================================================== */

let currentDeliveryCharge = 0;

function openCheckoutModal(){
    if(cart.length === 0){ showCustomAlert("আপনার কার্ট খালি!"); return; }
    closeCartModal();

    let subtotal = 0;
    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(p){
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += price * item.qty;
        }
    });

    document.getElementById("chkSubtotal").innerText = subtotal;
    document.getElementById("chkTotal").innerText = subtotal;

    // Populate Districts
    const distSelect = document.getElementById("checkoutDistrict");
    if(distSelect){
        distSelect.innerHTML = `<option value="">জেলা নির্বাচন করুন</option>` + Object.keys(bdDistrictsWithThanas).map(d => `<option value="${d}">${d}</option>`).join("");
    }
    const thanaSelect = document.getElementById("checkoutThana");
    if(thanaSelect){
        thanaSelect.innerHTML = `<option value="">প্রথমে জেলা নির্বাচন করুন</option>`;
    }

    document.getElementById("checkoutStepModal")?.classList.add("show");
}

function closeCheckoutModal(){ document.getElementById("checkoutStepModal")?.classList.remove("show"); }

function onDistrictChange(){
    const dist = document.getElementById("checkoutDistrict").value;
    const thanaSelect = document.getElementById("checkoutThana");
    if(!thanaSelect) return;

    if(bdDistrictsWithThanas[dist]){
        thanaSelect.innerHTML = bdDistrictsWithThanas[dist].map(t => `<option value="${t}">${t}</option>`).join("");
    } else {
        thanaSelect.innerHTML = `<option value="">প্রথমে জেলা নির্বাচন করুন</option>`;
    }

    // Delivery charge calculation
    currentDeliveryCharge = (dist === "Dhaka") ? 70 : 130;
    updateCheckoutTotals();
}

function onThanaChange(){
    updateCheckoutTotals();
}

function updateCheckoutTotals(){
    let subtotal = 0;
    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(p){
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            subtotal += price * item.qty;
        }
    });
    const total = subtotal + currentDeliveryCharge;
    document.getElementById("chkSubtotal").innerText = subtotal;
    document.getElementById("chkDelivery").innerText = currentDeliveryCharge;
    document.getElementById("chkTotal").innerText = total;
}

function proceedToPayment(){
    const name = document.getElementById("checkoutName")?.value.trim();
    const phone = document.getElementById("checkoutPhone")?.value.trim();
    const district = document.getElementById("checkoutDistrict")?.value;
    const thana = document.getElementById("checkoutThana")?.value;
    const address = document.getElementById("checkoutAddress")?.value.trim();

    if(!name || !phone || !district || !thana || !address){
        showCustomAlert("দয়া করে সমস্ত ডেলিভারি তথ্য সঠিকভাবে পূরণ করুন।");
        return;
    }

    closeCheckoutModal();
    document.getElementById("paymentStepModal")?.classList.add("show");
}

function closePaymentModal(){ document.getElementById("paymentStepModal")?.classList.remove("show"); }

function finalizeOrder(){
    const senderNum = document.getElementById("paySenderNumber")?.value.trim();
    const trxId = document.getElementById("payTrxId")?.value.trim();

    if(!senderNum || !trxId){
        showCustomAlert("দয়া করে আপনার বিকাশ/নগদ নাম্বার এবং TrxID দিন।");
        return;
    }

    const name = document.getElementById("checkoutName").value.trim();
    const phone = document.getElementById("checkoutPhone").value.trim();
    const district = document.getElementById("checkoutDistrict").value;
    const thana = document.getElementById("checkoutThana").value;
    const address = document.getElementById("checkoutAddress").value.trim();
    const fullAddress = `${address}, ${thana}, ${district}`;

    let subtotal = Number(document.getElementById("chkSubtotal").innerText);
    let total = Number(document.getElementById("chkTotal").innerText);
    let orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    let itemsText = "";
    let tableHtml = "";

    cart.forEach(item => {
        const p = products.find(x => String(x.id) === String(item.id));
        if(p){
            const price = (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price) ? p.discountPrice : p.price;
            itemsText += `- ${p.name} (Qty: ${item.qty}) - ৳${price * item.qty}\n`;
            tableHtml += `<tr><td style="padding:6px; border-bottom:1px solid #eee;">${escapeHTML(p.name)}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:center;">${item.qty}</td><td style="padding:6px; border-bottom:1px solid #eee; text-align:right;">৳${price * item.qty}</td></tr>`;
            
            // Reduce stock
            p.stock -= item.qty;
            if(p.stock < 0) p.stock = 0;
        }
    });

    saveProducts();

    const newOrder = {
        id: orderId,
        name, phone, address: fullAddress,
        subtotal, delivery: currentDeliveryCharge, total,
        senderNum, trxId,
        itemsText, tableHtml,
        status: 'pending',
        cancelledByAdmin: false,
        date: new Date().toLocaleString()
    };

    myOrders.unshift(newOrder);
    saveMyOrders();

    // Send Email via EmailJS
    try {
        emailjs.send("service_370p085", "template_a03d7ro", {
            order_id: orderId,
            customer_name: name,
            customer_phone: phone,
            customer_address: fullAddress,
            order_items: itemsText,
            subtotal: subtotal,
            delivery: currentDeliveryCharge,
            total_amount: total,
            sender_number: senderNum,
            trx_id: trxId
        });
    } catch(e) {}

    cart = [];
    saveCart();
    updateCartBadge();

    closePaymentModal();
    showSuccessPopup(`আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!<br><b>Order ID:</b> ${orderId}`);
}
