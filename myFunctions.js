$(document).ready(function() {
    // إخفاء وإظهار التفاصيل عند الضغط على المربع
    $('.show-details').change(function() {
        $(this).closest('.meal-row').next('.details-row').toggle();
    });

    // إظهار النموذج عند الضغط على متابعة
    $('#proceedBtn').click(function() {
        if ($('.select-meal:checked').length > 0) {
            $('#orderFormContainer').show();
        } else {
            alert("يرجى اختيار وجبة واحدة على الأقل.");
        }
    });

    // التحقق عند الإرسال
    $('#submitBtn').click(function() {
        let isValid = true;
        let errorMsg = "";

        // 1. التحقق من الاسم (أحرف عربية فقط)
        let namePattern = /^[\u0600-\u06FF\s]+$/;
        let name = $('#fullName').val();
        if (name !== "" && !namePattern.test(name)) {
            isValid = false;
            errorMsg += "الاسم يجب أن يكون بالأحرف العربية فقط.\n";
        }

        // 2. التحقق من الرقم الوطني (11 خانة والبداية 01-14)
        let nid = $('#nationalID').val();
        let nidPattern = /^(0[1-14]|1[0-4])\d{9}$/; 
        // ملاحظة: التحقق من الخانتين يساراً 01-14
        if (nid === "" || !/^\d{11}$/.test(nid) || parseInt(nid.substring(0,2)) > 14 || parseInt(nid.substring(0,2)) < 1) {
            isValid = false;
            errorMsg += "الرقم الوطني يجب أن يكون 11 خانة مع ترميز محافظة صحيح (01-14).\n";
        }

        // 3. التحقق من تاريخ الولادة dd-mm-yyyy
        let dob = $('#dob').val();
        let dobPattern = /^\d{2}-\d{2}-\d{4}$/;
        if (dob !== "" && !dobPattern.test(dob)) {
            isValid = false;
            errorMsg += "التاريخ يجب أن يكون بصيغة dd-mm-yyyy.\n";
        }

        // 4. رقم الموبايل (سيريتل أو MTN)
        let mobile = $('#mobile').val();
        let mobPattern = /^09[3-9]\d{7}$/;
        if (mobile !== "" && !mobPattern.test(mobile)) {
            isValid = false;
            errorMsg += "رقم الموبايل غير صحيح.\n";
        }

        if (isValid) {
            calculateTotal();
        } else {
            alert(errorMsg);
        }
    });

    function calculateTotal() {
        let total = 0;
        let selectedMeals = "";

        $('.select-meal:checked').each(function() {
            let row = $(this).closest('.meal-row');
            let price = parseInt(row.find('.price').text());
            let name = row.find('td:eq(1)').text();
            total += price;
            selectedMeals += name + "\n";
        });

        // حسم 5% ضريبة
        let taxDeduction = total * 0.05;
        let finalAmount = total - taxDeduction;

        alert("الوجبات المختارة:\n" + selectedMeals + "\nالمجموع بعد حسم 5% ضريبة: " + finalAmount + " ل.س");
    }
});