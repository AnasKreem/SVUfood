// All logic uses jQuery and matches the required function signatures:

// Data for Meals (code -> {name, price...}) for lookup in summary etc.
const mealsData = {
    "SF-001": {name: "وجبة سمك بوري مشوي لشخصين", price: 110000},
    "SF-002": {name: "شاورما دجاج", price: 75000},
    "SF-003": {name: "برغر لحم مزدوج", price: 90000},
    "SF-004": {name: "مشاوي مشكلة لشخصين", price: 150000},
    "SF-005": {name: "بيتزا مارغريتا", price: 65000}
};

$(document).ready(function() {
    // 1. Toggle details
    $(".toggle-details").on("change", function() {
        toggleDetails($(this).data("meal"));
    });

    // 2. "متابعة" (Continue) → Validate at least one meal, then show form
    $("#continue-btn").on("click", function() {
        let found = $(".select-meal:checked").length > 0;
        if (!found) {
            alert("الرجاء اختيار وجبة واحدة على الأقل");
        } else {
            showForm();
        }
    });

    // 3. "رجوع" button in form
    $("#back-btn").on("click", function() {
        showTable();
    });

    // 4. On submit - order form validation
    $("#order-form").on("submit", function(e) {
        e.preventDefault();
        let ok = true;

        // Clear all previous errors
        $(".error-msg").text("");

        // Full name: optional, if provided, must be Arabic
        let name = $("#customerName").val().trim();
        if (name.length > 0 && !validateName(name)) {
            $("#name-error").text("الاسم يجب أن يكون باللغة العربية فقط");
            ok = false;
        }

        // National ID: Required; must be valid
        let nid = $("#nationalId").val().trim();
        if (!validateNationalId(nid)) {
            $("#nid-error").text("الرقم الوطني يجب أن يتكون من 11 رقمًا ويبدأ برمز محافظة صحيح");
            ok = false;
        }

        // Date of birth: optional, if entered validate format and past date
        let dob = $("#dob").val();
        if (dob.length > 0 && !validateDOB(dob)) {
            $("#dob-error").text("تأكد من أن التاريخ بصيغة yyyy-mm-dd وأنه في الماضي");
            ok = false;
        }

        // Mobile: optional, if entered validate
        let mobile = $("#mobile").val().trim();
        if (mobile.length > 0 && !validateMobile(mobile)) {
            $("#mobile-error").text("الرقم غير صحيح. أدخل رقم سوري صحيح (091/092... أو 094/095...)");
            ok = false;
        }

        // Email: optional, if entered validate
        let email = $("#email").val().trim();
        if (email.length > 0 && !validateEmail(email)) {
            $("#email-error").text("صيغة البريد غير صحيحة");
            ok = false;
        }

        if (ok) {
            showOrderSummary();
        }
    });
// 5. Modal close
    $("#close-summary").on("click", function() {
        $("#order-summary").fadeOut();
    });
    // Clicking outside modal-content closes modal
    $("#order-summary").on("click", function(e) {
        if ($(e.target).is("#order-summary")) {
            $("#order-summary").fadeOut();
        }
    });
});

// 1. Show/collapse meal details row (via checkbox)
function toggleDetails(mealId) {
    let $detailsRow = $('.details-row[data-meal="' + mealId + '"]');
    $detailsRow.slideToggle(250);
}

// 2. Validate Arabic name (optional)
function validateName(value) {
    let regex = /^[\u0600-\u06FF\s]+$/;
    return regex.test(value);
}

// 3. Validate National ID (required: 11 digit, valid gov code)
function validateNationalId(value) {
    let regex = /^(0[1-9]|1[0-4])\d{9}$/;
    return regex.test(value);
}

// 4. Validate DOB (yyyy-mm-dd, past date)
function validateDOB(value) {
    let regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(value)) return false;
    let inpDate = new Date(value);
    let today = new Date();
    if (isNaN(inpDate.getTime())) return false;
    // Ensure it's strictly before today (not today)
    return inpDate < today;
}

// 5. Validate Syrian mobile number (optional)
function validateMobile(value) {
    let regex = /^09[1-6]\d{7}$/;
    return regex.test(value);
}

// 6. Validate email (optional)
function validateEmail(value) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
}

// 7. Show result modal with selected meals, pricing, taxes, customer name if provided
function showOrderSummary() {
    // 1. Collect selected meal codes
    let selectedCodes = [];
    $(".select-meal:checked").each(function() {
        selectedCodes.push($(this).data("meal"));
    });
    let summaryRows = "";
    let subtotal = 0;
    for (let i = 0; i < selectedCodes.length; ++i) {
        let code = selectedCodes[i];
        let meal = mealsData[code];
        summaryRows += "<tr><td>" + code + "</td><td>" + meal.name + "</td><td>" + meal.price.toLocaleString() + " ل.س</td></tr>";
        subtotal += meal.price;
    }
    let tax = Math.round(subtotal * 0.05);
    let total = subtotal + tax;
    let cname = $("#customerName").val().trim();
    let html = `<table>
            <thead>
                <tr><th>الرمز</th><th>اسم الوجبة</th><th>السعر</th></tr>
            </thead>
            <tbody>
                ${summaryRows}
            </tbody>
        </table>
        <div><strong>المجموع:</strong> ${subtotal.toLocaleString()} ل.س</div>
        <div><strong>ضريبة 5%:</strong> ${tax.toLocaleString()} ل.س</div>
        <div style="font-size:1.08em; margin-top:0.6em;"><strong>المبلغ النهائي:</strong> ${total.toLocaleString()} ل.س</div>
        ${cname.length > 0 ? `<div style="margin-top:0.9em;"><strong>اسم الزبون:</strong> ${cname}</div>` : ""}`;
    $("#summary-details").html(html);
    $("#order-summary").fadeIn();
}

// 8. Hide meals table, show form
function showForm() {
    $("#meals-table-section").hide();
    $("#order-form-section").fadeIn(250);
    // Clear previous errors/inputs if any:
    $("#order-form")[0].reset();
    $(".error-msg").text("");
}

// 9. Hide form, show table
function showTable() {
    $("#order-form-section").hide();
    $("#meals-table-section").fadeIn(250);
}