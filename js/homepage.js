let auctions = []
$(document).ready(function () {
  const $navBtn = $("#navbarButton");
  const token = localStorage.getItem("token");

  // A. Set Button Text on Load
  if (token) {
    $navBtn.text("Logout");
    // Optional: Add a visual cue, like making it red for logout
  } else {
    $navBtn.text("Login");
  }

  // B. Handle Button Click
  $navBtn.off("click").on("click", function (e) {
    e.preventDefault();
    
    // Check token again at the moment of clicking
    if (localStorage.getItem("token")) {
      // --- LOGOUT ACTION ---
      if (confirm("Are you sure you want to log out?")) {
        // Clear stored data
        localStorage.removeItem("token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_name");
        
        $(this).text("Login");
      }
    } else {
      // --- LOGIN ACTION ---
      window.location.href = "login.html";
    }
  });

  function updateButtonVisibility() {
    // Live Auction Buttons
    const $live = $("#liveAuction");
    if ($live.children().length < 5) {
      $live.siblings(".scrollButton").hide();
    } else {
      $live.siblings(".scrollButton").show();
    }

    // Ending Soon Buttons
    const $ending = $("#endingSoon");
    if ($ending.children().length < 5) {
      $ending.siblings(".scrollButton").hide();
    } else {
      $ending.siblings(".scrollButton").show();
    }
  }

  function updateAllCards() {
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const now = new Date().getTime();

    // Loop through currently visible cards
    $(".custom-card").each(function () {
      const $card = $(this);
      const endTimeStr = $card.attr("data-endtime");
      const diff = new Date(endTimeStr).getTime() - now;
      const $timeText = $card.find(".cardTime"); // Select the text element

      // 1. Update Text
      $timeText.text("⏰ " + formatTime(diff));

      // 2. Handle Expiration
      if (diff <= 0) {
        $card.remove();
        return; // Stop processing this card
      }

      if ($card.closest("#searchResultsGrid").length > 0) {
            return; // STOP! Don't move this card, just update its time.
      }
      // 3. Handle Moving Logic
      const parentId = $card.parent().attr("id");

      if (diff <= THREE_HOURS_MS) {
        // Should be in Ending Soon
        if (parentId !== "endingSoon") {
          $timeText.removeClass("text-success").addClass("text-danger");
          $card.detach().prependTo("#endingSoon"); 
        }
      } else {
        // Should be in Live Auction
        if (parentId !== "liveAuction") {
          $timeText.removeClass("text-danger").addClass("text-success");
          $card.detach().appendTo("#liveAuction"); 
        }
      }
    });
  }

  $("#bidModal").on("show.bs.modal",function(event){
    const $button = $(event.relatedTarget)//button who trigger modal to open
    const aucId = $button.data("aucId")
    const aucTitle = $button.data("aucTitle")
    const aucHighestBid = $button.data("aucHighestBid")

    const $modal = $(this)
    $modal.find("#modalAucId").val(aucId)
    $modal.find("#modalAucTitle").text(aucTitle)
    $modal.find("#modalHighestBid").val(aucHighestBid+" Rs")
  })

  $.get("../php/homePage.php", function (data) {
   
    auctions = data
    //dislplay cards for homepage
    renderAuctions(data)

    $(".loadingSpinner").remove();

    updateButtonVisibility();

    setInterval(function () {
      updateAllCards();
      updateButtonVisibility();
    }, 1000);
  },"json")
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("PHP Error:", errorThrown);
    console.error("Response Text:", textStatus);
  });
});


function formatTime(ms) {
    if (ms <= 0) return "Expired";
    const parts = [];
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) parts.push(days + "d");
    if (hours > 0) parts.push(hours + "h");
    parts.push(minutes + "m " + seconds + "s");
    return parts.join(" ");
}


//for creating cards dynamically
function createCards(cardData){
     //Card creation

      const $card = $("<div>");

      $card.addClass("card custom-card");
      $card.attr("data-endtime", cardData.end_time);
      $card.attr("id",cardData.auc_id)

      //Image creation

      const $img = $("<img>").addClass("card-img-top cardImg");

      $img.attr("src", cardData.image_path);

      $img.attr("alt", cardData.auc_title);

      // Card body creation

      const $cardBody = $("<div>");

      $cardBody.addClass("card-body d-flex flex-column cardBody");

      // Title

      const $h4 = $("<h4>")
        .addClass("card-title cardTitle")

        .text(cardData.auc_title);

        // Quantity
      const $qty = $("<h6>")
        .addClass("text-muted mb-2") // Grey color, small margin
        .html("<i class='bi bi-box-seam'></i> Qty: " + cardData.auc_qty + " Kg");

      // Prices

      const $price1 = $("<h6>")
        .addClass("fs-5 fw-bold cardLabel")

        .text("Starting Price: " + cardData.base_price + " Rs");

      const $price2 = $("<h6>")
        .addClass("fw-bold fs-5 cardLabel")

        .text("Top Bid: " + cardData.highest_bid + " Rs");

      // Stats

      const $bidCount = $("<p>")
        .addClass("card-text mb-0 fs-5 cardBid")
        
        .text("📊 " + cardData.bid_count + " bids Placed");

      const $timeText = $("<p>").addClass("card-text mb-2 fs-5 cardTime");

      const $buttonDiv = $("<div>").addClass(
        "d-flex justify-content-between align-items-center mt-auto"
      );

      // Button

      const $viewBtn = $("<button>")
        .addClass("btn btn-outline-success align-self-end mt-auto")

        .text("View Details")

        .click(function(){
          window.location.href = "viewBid.html?aucId="+cardData.auc_id
        })

      $buttonDiv.append($viewBtn);

      // Append all childrens to card body

      $cardBody.append($h4, $price1, $price2,$qty, $bidCount, $timeText, $buttonDiv);

      // Append Image and Body into Main Card

      $card.append($img, $cardBody);

      // 2. Initial Placement Logic
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = new Date(cardData.end_time).getTime() - now;

      $timeText.text("⏰ " + formatTime(diff));
      if (diff <= THREE_HOURS_MS) { 
      $timeText.addClass("text-danger");
    } else {
      $timeText.addClass("text-success");
    }   
    return $card;
}

//for rendering cards on homepage
function renderAuctions(data){
  const $liveContainer = $("#liveAuction");
  const $endingContainer = $("#endingSoon");
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  const now = new Date().getTime();

  data.forEach(function (cardData) {
    const diff = new Date(cardData.end_time).getTime() - now;
    if (diff <= 0) {
      return; // This acts like 'continue' in a forEach loop
    }
    const $card = createCards(cardData);

    if (diff <= THREE_HOURS_MS) { 
      $endingContainer.append($card);
    } else {
      $liveContainer.append($card);
    }   
  });  
}

//for search bar query
function search(event){
  event.preventDefault();
  const $auctionConainer = $("#mainAucContainer")
  const $searchContainer = $("#searchResultsSection")
  const query = event.target.auction.value.toLowerCase().trim()
  if(query){
    $auctionConainer.addClass("d-none")
    $searchContainer.removeClass("d-none")
    const filteredAuctions = auctions.filter(auc => auc.auc_title.toLowerCase().includes(query))
    renderSearchResults(filteredAuctions)
  }else{
    clearSearch()
  }
}

// Detect when the user clears the search input (including clicking the built-in 'x')
$("#searchInput").on("input", function() {
    // If the text box is empty...
    if ($(this).val().trim() === "") {
      clearSearch();
    }
});

//to switch back to main auction view from search results
function clearSearch(){
  $("#searchInput").val("")
  $("#searchResultsSection").addClass("d-none");
  $("#mainAucContainer").removeClass("d-none");
}

//to show cards in search results
function renderSearchResults(data){
  const $resultBadge = $("#resultCountBadge")
  const $noResultMsg = $("#noResultsMsg")
  const $resultsGrid = $("#searchResultsGrid")
  $resultsGrid.empty()
  $resultBadge.text(data.length+" Results Found")
  if (data.length !== 0){
    $noResultMsg.addClass("d-none")
    data.forEach(function(cardData){
      const $card = createCards(cardData)
      const $colWrapper = $("<div>").addClass("col-12 col-sm-6 col-md-4 col-lg-3");
      $colWrapper.append($card);
      $resultsGrid.append($colWrapper);
    })
  }else{
    $noResultMsg.removeClass("d-none")
  }
}

//for sliding cards on homepage
function scrollContainer(containerId, direction) {
  const container = document.getElementById(containerId);
  const card = container.querySelector(".card");
  const cardWidth = card.offsetWidth;
  const scrollAmt = cardWidth * 3 + 24; 
  if (direction === "left") {
    container.scrollBy({ left: -scrollAmt, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmt, behavior: "smooth" });
  }
}
