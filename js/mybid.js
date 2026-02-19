$(document).ready(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("user_role");
  const userId = getUserIdFromToken(token); // Helper function at bottom

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // 1. Customize Header based on Role
  if (role === "buyer") {
    $("#pageTitle").text("My Bids");
    $("#pageSubtitle").text("Track the status of your offers");
  } else {
    $("#pageTitle").text("My Listings");
    $("#pageSubtitle").text("Track your active and sold crops");
  }

  // 2. Fetch Data
  $.ajax({
    url: "../php/myBid.php",
    type: "GET",
    headers: { Authorization: "Bearer " + token },
    dataType: "json",
    success: function (response) {
      $("#loadingSpinner").addClass("d-none");
      const $container = $("#bidsContainer");
      const $noActivityMsg = $("#noActivityMsg");

      $container.empty();
      $noActivityMsg.addClass("d-none");

      // 1. Check Success Flag
      if (!response.success) {
        $("#errorMessage").text("Server reported an error.");
        $("#errorContainer").removeClass("d-none");
        return;
      }

      // 2. Get the DATA array from the response object
      const data = response.data; // <--- THIS IS THE KEY CHANGE

      // 3. Check if empty
      if (!Array.isArray(data) || data.length === 0) {
        if (role === "buyer") {
          $("#noActivityText").text("You haven't placed any bids yet.");
        } else {
          $("#noActivityText").text("You haven't created any auctions yet.");
        }
        $noActivityMsg.removeClass("d-none");
        return;
      }

      // 3. Loop and Render
      data.forEach((item) => {
        let cardHtml = "";

        if (role === "buyer") {
          cardHtml = createBuyerCard(item, userId);
        } else {
          cardHtml = createFarmerCard(item);
        }

        $container.append(cardHtml);
      });
    },
    error: function (xhr) {
      $("#loadingSpinner").addClass("d-none");
      $("#errorContainer").removeClass("d-none");
      $("#errorMessage").text("Error loading data: " + xhr.statusText);
    },
  });
});

// --- RENDER BUYER CARD ---
function createBuyerCard(bid, myUserId) {
  let badgeClass = "badge-secondary";
  let badgeText = bid.auc_status;

  // Logic: Determine Winning/Outbid status
  if (bid.auc_status === "Live") {
    if (bid.highest_bidder_id == myUserId) {
      badgeClass = "badge-winning";
      badgeText = "Winning";
    } else {
      badgeClass = "badge-outbid";
      badgeText = "Outbid";
    }
  } else if (bid.auc_status === "Expired") {
    if (bid.highest_bidder_id == myUserId) {
      badgeClass = "badge-winning"; // Or a 'Won' gold color
      badgeText = "You Won!";
    } else {
      badgeClass = "badge-closed";
      badgeText = "Lost";
    }
  }

  return `
    <div class="col-lg-10">
      <div class="card shadow-lg border-0">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-md-3">
              <h5 class="fw-bold text-dark">${bid.auc_title}</h5>
              <p class="text-muted mb-0"><i class="fas fa-user-tag"></i> Seller: ${bid.farmer_name}</p>
            </div>
            <div class="col-md-2">
              <span class="badge ${badgeClass} fs-6">${badgeText}</span>
            </div>
            <div class="col-md-2">
              <p class="mb-0 text-secondary small">Your Bid</p>
              <p class="fw-bold text-dark">${parseFloat(bid.my_bid).toLocaleString()} Rs</p>
            </div>
            <div class="col-md-2">
              <p class="mb-0 text-secondary small">Highest</p>
              <p class="fw-bold text-dark">${parseFloat(bid.highest_bid).toLocaleString()} Rs</p>
            </div>
            <div class="col-md-3 text-end">
              <a href="details.html?aucId=${bid.auc_id}" class="btn btn-outline-primary btn-sm rounded-pill px-4">View Auction</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// --- RENDER FARMER CARD ---
function createFarmerCard(auc) {
  let badgeClass = "bg-primary";
  if (auc.auc_status === "Expired") badgeClass = "bg-secondary";

  return `
    <div class="col-lg-10">
      <div class="card shadow-lg border-0 border-start border-4 border-primary">
        <div class="card-body p-4">
          <div class="row align-items-center">
            <div class="col-md-4">
              <h5 class="fw-bold text-dark">${auc.auc_title}</h5>
              <p class="text-muted mb-0"><small>Posted on: ${new Date(auc.start_time).toLocaleDateString()}</small></p>
            </div>
            <div class="col-md-2">
              <span class="badge ${badgeClass} fs-6">${auc.auc_status}</span>
            </div>
            <div class="col-md-3">
              <p class="mb-0 text-secondary small">Current Highest Bid</p>
              <p class="fw-bold text-success fs-5">${parseFloat(auc.highest_bid).toLocaleString()} Rs</p>
            </div>
            <div class="col-md-3 text-end">
              <a href="details.html?aucId=${auc.auc_id}" class="btn btn-primary btn-sm rounded-pill px-4">Manage</a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// Helper: Decode JWT
function getUserIdFromToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload).user_id;
  } catch (e) {
    return null;
  }
}
