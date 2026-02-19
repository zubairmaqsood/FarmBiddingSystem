$(document).ready(function () {
 
    const $form = $("#signupForm");
    
       // --- Password Toggle Logic ---

    function togglePasswordVisibility(buttonSelector, inputSelector) {
        $(buttonSelector).on('click', function () {
            const $input = $(inputSelector);
            const $icon = $(this).find("i");
            
            // 1. Check current type
            const currentType = $input.attr("type");
            
            // 2. Toggle Type (password <-> text)
            if (currentType === "password") {
                $input.attr("type", "text");
                // Change icon to "Slash" (meaning 'click to hide')
                $icon.removeClass("bi-eye").addClass("bi-eye-slash");
            } else {
                $input.attr("type", "password");
                // Change icon back to "Eye" (meaning 'click to show')
                $icon.removeClass("bi-eye-slash").addClass("bi-eye");
            }
        });
    }

    // Initialize for both fields
    togglePasswordVisibility("#togglePassword", "#password");
    togglePasswordVisibility("#toggleConfirmPassword", "#confirmPassword");
    // Toggle Fields Logic
    const $userTypeSelect = $('#userType');
    const $buyerFields = $('#buyerFields');
    const $farmerFields = $('#farmerFields');

    $userTypeSelect.on('change', function() {
        if ($(this).val() === 'buyer') {
            $buyerFields.show();
            $farmerFields.hide();
        } else if ($(this).val() === 'farmer') {
            $buyerFields.hide();
            $farmerFields.show();
        } else {
            $buyerFields.hide();
            $farmerFields.hide();
        }
    });

    // Validation Regex Patterns
    const patterns = {
        cnic: /^\d{5}-\d{7}-\d{1}$/,  // e.g. 35202-1234567-1
        phone: /^03\d{9}$/,           // e.g. 03001234567
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };

    $form.on("submit", function (e) {
        e.preventDefault();

        // 1. Get Values
        const userType = $userTypeSelect.val();
        const fullName = $("#fullName").val().trim();
        const cnic = $("#cnic").val().trim();
        const email = $("#email").val().trim();
        const phone = $("#phone").val().trim();
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();

        // 2. Validate Common Fields
        if (!userType) { alert("Please select a User Type."); return; }
        if (!fullName) { alert("Full Name is required."); return; }
        
        if (!patterns.cnic.test(cnic)) { alert("Invalid CNIC Format (Use 12345-1234567-1)"); return; }
        if (!patterns.phone.test(phone)) { alert("Invalid Phone Number (Must start with 03 and have 11 digits)"); return; }
        if (!patterns.email.test(email)) { alert("Invalid Email Address"); return; }
        
        if (password.length < 6) { alert("Password must be at least 6 characters."); return; }
        if (password !== confirmPassword) { alert("Passwords do not match."); return; }

        // 3. Prepare FormData (Crucial for Files)
        // Note: We use 'this' to pass the raw form DOM element
        const formData = new FormData(this); 
        
        // Append action manually since it's not an input field
        formData.append("action", "signup");

        // 4. Specific Validation (Manual checks before sending)
        if (userType === "buyer") {
            const buyerType = $("#buyerType").val();
            const companyName = $("#companyName").val().trim();
            const companyAddress = $("#companyAddress").val().trim();
            const companyType = $("#companyType").val();
            const businessDoc = $("#businessDoc")[0].files[0];

            if (!buyerType) { alert("Please select a Buyer Type."); return; }
            
            formData.append("buyerType", buyerType);
            formData.append("companyName", companyName);
            formData.append("companyAddress", companyAddress);
            formData.append("companyType", companyType); 
            if (businessDoc) formData.append("businessDoc", businessDoc);

        } 
        else if (userType === "farmer") {
            const farmLocation = $("#farmLocation").val().trim();
            const farmSize = $("#farmSize").val().trim();
            const city = $("#city").val().trim();
            const registryFile = $("#registryFile")[0].files[0];

            if (!city) { alert("City is required."); return; }
            if (!farmSize) { alert("Farm Size is required."); return; }
            if (!farmLocation) { alert("Farm Location is required."); return; }
            if (!registryFile) { alert("Please upload the Registry Document."); return; }

            formData.append("farmLocation", farmLocation);
            formData.append("farmSize", farmSize);
            formData.append("city", city);
            formData.append("registryFile", registryFile);
        }

        // 5. UI Loading State
        const $submitBtn = $("#signupBtn");
        const originalText = $submitBtn.text();
        $submitBtn.prop("disabled", true).text("Creating Account...");

        // 6. Send AJAX Request
        $.ajax({
            url: "../php/signup.php",
            type: "POST",
            data: formData,
            dataType: "json",
            processData: false, // Don't process the files into strings
            contentType: false, // Don't set content-type header (Browser does it)

            success: function(data) {
                if (data.success) {
                    alert("Account Created Successfully! Redirecting...");
                    
                    // Save Session Data
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user_role", data.role);
                    localStorage.setItem("user_name", fullName);

                    // Redirect
                    if (data.role === "buyer") {
                        window.location.href = "../html/homePage.html";
                    } else {
                        window.location.href = "../html/farmerDashboard.html";
                    }
                } else {
                    alert("Error: " + data.error);
                    $submitBtn.prop("disabled", false).text(originalText);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("AJAX Error:", textStatus, errorThrown);
                console.error("Server Response:", jqXHR.responseText);
                
                // Try to parse JSON error if available, else generic message
                let msg = "Server Error. Please try again.";
                try {
                    const response = JSON.parse(jqXHR.responseText);
                    if(response.error) msg = response.error;
                } catch(e) {}
                
                alert(msg);
                $submitBtn.prop("disabled", false).text(originalText);
            }
        });
    });
});