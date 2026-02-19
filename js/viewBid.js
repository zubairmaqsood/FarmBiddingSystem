$(document).ready(function () {
  // 1. Get ID from URL (e.g. details.html?id=5)
  const urlParams = new URLSearchParams(window.location.search);
  const aucId = urlParams.get("aucId");
  // 2. Check if ID exists
  if (!aucId) {
    // HIDE Loader, SHOW Error
    $("#loadingSpinner").addClass("d-none");
    $("#errorContainer").removeClass("d-none");
  } else {
    // 3. ID Found -> Fetch Data
    fetchAuctionDetails(aucId);
  }
});

function fetchAuctionDetails(id) {
  // Simulate AJAX Call (Replace this with $.get or $.post to your PHP)
  // For now, I will mimic the result
  $.get(
    "../php/viewBid.php",
    { id: id },
    function (data) {
      // If fetching real data, uncomment above and use 'data' variable
      // Here is how you populate the UI:
      if (!data || data.error) {
        $("#loadingSpinner").addClass("d-none");
        $("#errorContainer").removeClass("d-none");
        $("#errorMessage").text(data.error);
        return;
      }
      // Populate Fields
      $("#detailImg").attr("src", data.image_path);
      $("#detailImg").attr("alt", data.auc_title);
      $("#detailTitle").text(data.auc_title);
      $("#detailFarmer").text(data.farmer_name || "Unknown");
      $("#detailHighestBid").text(data.highest_bid + " Rs");
      $("#detailBasePrice").text(data.base_price + " Rs");
      $("#detailDesc").text(data.auc_desc || "No description provided.");
      $("#detailBidCount").text(data.bid_count);
      $("#detailStatus").text(data.auc_status);
      $("#detailPhone").text(data.ph_no || "Not available");
      $("#detailBidderName").text(data.highest_bidder_name || "No bids yet");
      $("#detailQty").text(data.auc_qty + " Kg");
      let locationText = data.city;
      if (data.farm_location) {
        locationText += " (" + data.farm_location + ")";
      }
      $("#detailLocation").text(locationText || "Location not available");
      
      // 2. CHECK STATUS
      if (data.auc_status === "Expired") {
        const currentUserId = getUserIdFromToken();
        // A. Stop Timer & Update UI
        $("#detailTimer")
          .text("Auction Ended")
          .removeClass("text-danger")
          .addClass("text-secondary");
        $("#mainBidBtn").hide(); // Hide the normal bid button

        // B. Create the Winner HTML
        let winnerHtml = "";

        if (data.highest_bidder_id && data.highest_bidder_id == currentUserId) {
          // --- CASE: LOGGED IN USER WON ---
          winnerHtml = `
            <div class="card bg-success text-white text-center shadow mt-3 p-4">
                <div class="card-body">
                    <h2 class="display-6 fw-bold">🎉 You Won! 🎉</h2>
                    <p class="fs-5">You secured this deal for <strong>${data.highest_bid} Rs</strong></p>
                    <button class="btn btn-light fw-bold mt-2 text-success">
                        <i class="bi bi-whatsapp"></i> Contact Farmer
                    </button>
                </div>
            </div>`;
        } else if (data.highest_bidder_id) {
          // --- CASE: SOMEONE ELSE WON ---
          winnerHtml = `
            <div class="alert alert-secondary text-center mt-3 p-4">
                <h4><i class="bi bi-hammer"></i> Sold Out</h4>
                <p class="mb-0">Winner: <strong>${data.highest_bidder_name}</strong></p>
                <p>Winning Bid: <strong>${data.highest_bid} Rs</strong></p>
            </div>`;
        } else {
          // --- CASE: NO BIDS (Unsold) ---
          winnerHtml = `
            <div class="alert alert-warning text-center mt-3">
                <h4>Unsold</h4>
                <p>This auction ended with no bids.</p>
            </div>`;
        }

        // C. Append the box where the button used to be
        $("#mainBidBtn").parent().html(winnerHtml);
      } else {
        // Setup Bid Button Data
        $("#mainBidBtn")
          .data("aucId", id)
          .data("aucTitle", data.auc_title)
          .data("aucHighestBid", data.highest_bid);

        // Start Timer
        startTimer(data.end_time);

        // Show Content
        $("#loadingSpinner").addClass("d-none");
        $("#detailsContainer").removeClass("d-none");
      }
    },
    "json",
  ).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("AJAX Error:", textStatus, errorThrown);

    // Set a generic technical error message
    $("#errorMessage").text(jqXHR.responseText);

    // Show the error box
    $("#loadingSpinner").addClass("d-none");
    $("#errorContainer").removeClass("d-none");
  });
}

// --- Helper Function to Extract User ID from JWT Token ---
function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        // A JWT has 3 parts separated by dots: Header.Payload.Signature
        // We want the Payload (index 1)
        const base64Url = token.split('.')[1];
        
        // Fix Base64Url format (replace - with + and _ with /)
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        
        // Decode the Base64 string
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        // Parse JSON and return the ID
        return JSON.parse(jsonPayload).user_id;
    } catch (e) {
        console.error("Error decoding token:", e);
        return null;
    }
}

$(document).on("click", ".bid-btn-trigger", function (e) {
  e.preventDefault(); // Stop any default action

  const $btn = $(this);
  const originalText = $btn.text();
  const token = localStorage.getItem("token");
  // 1. Quick Frontend Check (Save server load)
  if (!token) {
    $("#loginPromptModal").modal("show");
    return;
  }

  // 2. Show Loading State on Button
  $btn.prop("disabled", true).text("Verifying...");

  // 3. Send AJAX to verify token
  $.ajax({
    url: "../php/viewBid.php",
    type: "POST",
    data: {
      action: "verify_token", // Tell PHP what to do
      token: token, // Send token in body as backup
    },
    headers: { Authorization: "Bearer " + token },
    dataType: "json",
    success: function (response) {
      if (response.success && response.role === "buyer") {
        // ✅ TOKEN VALID: Open the modal manually now
        // Populate modal data like before
        $("#modalAucId").val($btn.data("aucId"));
        $("#modalAucTitle").text($btn.data("aucTitle"));
        $("#modalHighestBid").val($btn.data("aucHighestBid") + " Rs");

        // Show the modal
        $("#bidModal").modal("show");
      } else {
        alert("Access Denied: You must be a logged-in Buyer.");
      }
    },
    error: function (xhr) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token"); // Clear bad token
    },
    complete: function () {
      // Reset button state regardless of success/error
      $btn.prop("disabled", false).text(originalText);
    },
  });
});

// Timer Logic
function startTimer(endTimeStr) {
  const safeEndTime = endTimeStr.replace(" ", "T");
  const endTime = new Date(safeEndTime).getTime();

  const timeInterval = setInterval(function () {
    const now = new Date().getTime();
    const diff = endTime - now;

    if (diff <= 0) {
      clearInterval(timerInterval);

      $("#detailTimer")
        .text("Auction Ended")
        .addClass("text-secondary")
        .removeClass("text-danger");

      // 3. DISABLE BUTTON INSTANTLY
      $("#mainBidBtn")
        .prop("disabled", true)
        .removeClass("btn-success")
        .addClass("btn-secondary")
        .text("Processing Result...");

      setTimeout(function () {
        location.reload();
      }, 2000);
    } else {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      $("#detailTimer").text(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
  }, 1000);
}

$("#bidForm").submit(function (event) {
  event.preventDefault();
  $("#bidSubmitBtn").prop("disabled", true).text("Placing Bid...");
  $currentHighestBid = parseFloat($("#detailHighestBid").text());
  const $basePrice = parseFloat($("#detailBasePrice").text());
  const $newBidAmount = parseFloat($(this).find("input[name='bid_amount']").val(),);
  const token = localStorage.getItem("token"); // <--- Get Token

  // 2. Clear previous errors & Set Loading
  $("#modalError").text("")
  if ($currentHighestBid > $newBidAmount) {
    $("#modalError").text("Bid amount must be higher than current highest bid.");
    $("#bidSubmitBtn").prop("disabled", false).text("Place Bid");
    return;
  }
  if ($newBidAmount < $basePrice) {
    $("#modalError").text(
      `Bid amount must be at least the Base Price (${$basePrice} Rs).`
    );
    // Reset button
    $("#bidSubmitBtn").prop("disabled", false).text("Place Bid");
    return;
  }
  if (!token) {
    alert("You are logged out. Please login again.");
    window.location.href = "login.html";
    return;
  }
  $bidCount = $("#detailBidCount").text();
  $aucId = $(this).find("input[name='auc_id']").val();
  $.ajax({
    url: "../php/viewBid.php",
    type: "POST",
    headers: { Authorization: "Bearer " + token }, // <--- SEND TOKEN HERE
    data: {
      action: "place_bid",
      auc_id: $aucId,
      bid_amount: $newBidAmount,
    },
    dataType: "json",
    success: function (data) {
      if (data.success) {
        alert("Bid placed successfully!");

        // Update UI immediately without reload
        $("#detailHighestBid").text($newBidAmount + " Rs");

        let currentCount = parseInt($("#detailBidCount").text()) || 0;
        $("#detailBidCount").text(currentCount + 1);

        $("#detailBidderName").text(data.bidder_name); // Immediate feedback

        // Update Button Data for next bid
        $("#mainBidBtn").data("aucHighestBid", $newBidAmount);

        // Reset Modal
        $("#bidModal").modal("hide");
        $("#bidForm")[0].reset();
      } else {
        $("#modalError").text("").text(data.error);
      }
    },
    error: function (jqXHR) {
      console.error("AJAX Error:", jqXHR.responseText);
      $("#modalError")
        .text("")
        .text(
          "Server Error: " + (jqXHR.responseJSON?.error || "Unknown Error"),
        );
    },
    complete: function () {
      $("#bidSubmitBtn").prop("disabled", false).text("Place Bid");
    },
  });
});
