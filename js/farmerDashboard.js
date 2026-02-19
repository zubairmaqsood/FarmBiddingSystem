$(document).ready(function () {
  /* ============================================================
       1. AUTHENTICATION
       ============================================================ */
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("user_role");

  if (!token || role !== "farmer") {
    alert("Access Denied. Please login as a Farmer.");
    window.location.href = "login.html";
    return;
  }

  console.log("Farmer Dashboard Authenticated");

  /* ============================================================
       2. SETUP DATE RESTRICTIONS (15-Day Minimum Logic)
       ============================================================ */
  // Calculate Today + 15 Days
  const targetDate = new Date();

  // 2. Add 15 Days
  targetDate.setDate(targetDate.getDate() + 15);

  // 3. Reset Time to Midnight (00:00:00)
  // This allows the user to pick ANY time on that day
  targetDate.setHours(0, 0, 0, 0);

  // 4. Adjust for Timezone (Important for correct input format)
  targetDate.setMinutes(
    targetDate.getMinutes() - targetDate.getTimezoneOffset(),
  );

  // 5. Format to "YYYY-MM-DDTHH:MM"
  const minDateString = targetDate.toISOString().slice(0, 16);

  // 6. Apply to Input
  $("#endTime").attr("min", minDateString);

  $("#openAuctionModalBtn").click(function () {
    // Reset Form & UI
    $("#bidForm")[0].reset();
    $("#modalErrorMsg").addClass("d-none").text("");
    $("#previewContainer").addClass("d-none");
    $("#imagePreview").attr("src", "");

    // Pre-fill Date (User Convenience)
    $("#endTime").val(minDateString);

    // Open Bootstrap Modal
    $("#bidFormModal").modal("show");
  });

  $("#imageInput").change(function (e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max 5MB.");
      $(this).val("");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      $("#imagePreview").attr("src", e.target.result);
      $("#previewContainer").removeClass("d-none");
    };
    reader.readAsDataURL(file);
  });

  /* ============================================================
       5. FORM SUBMISSION & VALIDATION
       ============================================================ */
  $("#bidForm").on("submit", function (e) {
    e.preventDefault();

    // --- A. GET VALUES ---
    const title = $("#aucTitle").val().trim();
    const price = parseFloat($("#basePrice").val());
    const qty = parseFloat($("#aucQty").val());
    const desc = $("#aucDesc").val().trim();
    const endTimeVal = $("#endTime").val();
    const imageFile = $("#imageInput")[0].files[0];

    // --- B. VALIDATION ---

    // 1. Basic Fields
    if (title.length < 3)
      return showError("Item Name must be at least 3 characters.");
    if (isNaN(price) || price <= 0)
      return showError("Price must be a valid positive number.");
    if (isNaN(qty) || qty <= 0)
      return showError("Quantity must be a valid positive number.");
    if (desc.length < 10)
      return showError("Description must be at least 10 characters.");

    // 2. Date Validation (Strict 15-Day Rule)
    if (!endTimeVal) return showError("Please select an end date.");

    const selectedTime = new Date(endTimeVal).getTime();

    // Calculate Minimum Allowed Time (Midnight of 15th day)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    minDate.setHours(0, 0, 0, 0); // Reset to midnight

    if (selectedTime < minDate.getTime()) {
      return showError("Auction duration must be at least 15 days from today.");
    }

    // 3. Image Validation (Required)
    if (!imageFile) return showError("Please upload an item image.");

    // --- C. SEND DATA (AJAX) ---
    const formData = new FormData(this);
    const $btn = $("#saveBtn");
    const originalText = $btn.html();

    // UI Loading
    $btn
      .prop("disabled", true)
      .html(
        '<span class="spinner-border spinner-border-sm"></span> Publishing...',
      );
    $("#modalErrorMsg").addClass("d-none");

    $.ajax({
      url: "../php/createBid.php",
      type: "POST",
      data: formData,
      headers: { Authorization: "Bearer " + token },
      contentType: false,
      processData: false,
      dataType: "json",
      success: function (response) {
        if (response.success) {
          alert("✅ Auction Created Successfully!");
          $("#bidFormModal").modal("hide"); // Close Modal
          location.reload(); // Refresh Page
        } else {
          showError(response.error);
        }
      },
      error: function (xhr) {
        console.error("Error:", xhr.responseText);
        let msg = "Server Error. Please try again.";
        if (xhr.responseJSON && xhr.responseJSON.error) {
          msg = xhr.responseJSON.error;
        }
        showError(msg);
      },
      complete: function () {
        $btn.prop("disabled", false).html(originalText);
      },
    });
  });

  /* ============================================================
       HELPER FUNCTIONS
       ============================================================ */
  function showError(msg) {
    $("#modalErrorMsg").text(msg).removeClass("d-none");
    // Scroll modal to top so user sees error
    $(".modal-body").animate({ scrollTop: 0 }, "fast");
  }
});
