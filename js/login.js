$(document).ready(function () {
    const $form = $("#loginForm");
    const $errorBox = $("#errorMsg");
    const $btn = $("#loginBtn");

    $form.on("submit", function (e) {
        e.preventDefault();

        // 1. Clear previous errors
        $errorBox.addClass("d-none").text("");
        
        // 2. Get Values
        const email = $("#email").val().trim();
        const password = $("#password").val().trim();

        // 3. Simple Frontend Validation
        if (!email || !password) {
            showError("Please fill in all fields.");
            return;
        }

        // 4. Show Loading State
        const originalText = $btn.text();
        $btn.prop("disabled", true).text("Verifying...");

        // 5. AJAX Request
        $.ajax({
            url: "../php/login.php",
            type: "POST",
            data: {
                email: email,
                password: password
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    localStorage.setItem("token", response.token);
                    localStorage.setItem("user_role", response.role);
                    localStorage.setItem("user_name", response.user_name);

                    if (response.role === 'farmer') {
                        window.location.href = "farmerDashboard.html"; 
                    } else {
                        // Default fallback (e.g. for simple users or admins)
                        window.location.href = "homePage.html";
                    }
                } else {
                    showError(response.error);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                let msg = "Server Error. Please try again.";
                if(xhr.responseJSON && xhr.responseJSON.error) {
                    msg = xhr.responseJSON.error;
                }
                showError(msg);
            },
            complete: function () {
                // Reset Button
                $btn.prop("disabled", false).text(originalText);
            }
        });
    });

    function showError(message) {
        $errorBox.removeClass("d-none").text(message);
    }
});