let auctions = []
$(document).ready(function () {
  

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
    // const data = [
    // { 
    //     auc_title: "Expired Garlic", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-05 11:00:00", // Yesterday (Expired)
    //     image_path: "../img/garlic.webp" 
    // },
    // { 
    //     auc_title: "Sold Out Spinach", 
    //     base_price: 15, 
    //     highest_bid: 30, 
    //     bid_count: 8, 
    //     end_time: "2026-01-06 18:00:00", // Today at 6:00 PM (Expired 3 hours ago)
    //     image_path: "../img/spinach.webp" 
    // },

    // // --- ENDING SOON (Less than 3 hours from 9:25 PM) ---
    // { 
    //     auc_title: "Red Chilies", 
    //     base_price: 50, 
    //     highest_bid: 85, 
    //     bid_count: 15, 
    //     // 2 Minutes from now (9:34 PM)
    //     end_time: "2026-01-06 21:34:00", 
    //     image_path: "../img/chili.webp" 
    // },
    // { 
    //     auc_title: "Fresh Coriander", 
    //     base_price: 20, 
    //     highest_bid: 45, 
    //     bid_count: 22, 
    //     end_time: "2026-01-06 23:55:00", // Today 11:55 PM (~2.5 hours left)
    //     image_path: "../img/coriander.webp" 
    // },
    // { 
    //     auc_title: "Bell Peppers", 
    //     base_price: 100, 
    //     highest_bid: 150, 
    //     bid_count: 9, 
    //     end_time: "2026-01-07 00:15:00", // Tomorrow 12:15 AM (Technically < 3 hours)
    //     image_path: "../img/pepper.webp" 
    // },

    // // --- LIVE AUCTIONS (More than 3 hours left) ---
    // { 
    //     auc_title: "Organic Tomato", 
    //     base_price: 24, 
    //     highest_bid: 50, 
    //     bid_count: 4, 
    //     end_time: "2026-01-07 10:00:00", // Tomorrow Morning (Live)
    //     image_path: "../img/tomato.webp" 
    // },
    // { 
    //     auc_title: "Organic Tomato", 
    //     base_price: 24, 
    //     highest_bid: 50, 
    //     bid_count: 4, 
    //     end_time: "2026-01-07 10:00:00", // Tomorrow Morning (Live)
    //     image_path: "../img/tomato.webp" 
    // },
    // { 
    //     auc_title: "Large Potatoes", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-07 00:35:00", 
    //     image_path: "../img/potato.webp" 
    // },
    // { 
    //     auc_title: "Large Potatoes", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-07 00:35:00", 
    //     image_path: "../img/potato.webp" 
    // },
    // { 
    //     auc_title: "Large Potatoes", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-07 00:35:00", 
    //     image_path: "../img/potato.webp" 
    // },
    // { 
    //     auc_title: "Large Potatoes", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-07 00:35:00", 
    //     image_path: "../img/potato.webp" 
    // },
    // { 
    //     auc_title: "Large Potatoes", 
    //     base_price: 40, 
    //     highest_bid: 120, 
    //     bid_count: 12, 
    //     end_time: "2026-01-07 00:35:00", 
    //     image_path: "../img/potato.webp" 
    // },
    // { 
    //     auc_title: "Fresh Onions", 
    //     base_price: 234, 
    //     highest_bid: 500, 
    //     bid_count: 43, 
    //     end_time: "2026-01-10 12:00:00", // 4 Days from now (Live)
    //     image_path: "../img/onion.webp" 
    // }
    // ];
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

 function viewDetails(){
    console.log("vew button")
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

      const $bidBtn = $("<button>")
        .addClass("btn btn-outline-success align-self-start mt-auto")

        .text("Bid Now")

        .attr("data-bs-toggle", "modal")
        .attr("data-bs-target","#bidModal")
        // store auction details in data attributes to know on which auction bid is being placed
        .attr("data-auc-id", cardData.auc_id)
        .attr("data-auc-title", cardData.auc_title)
        .attr("data-auc-highest-bid", cardData.highest_bid)

      const $viewBtn = $("<button>")
        .addClass("btn btn-outline-success align-self-end mt-auto")

        .text("View Details")

        .click(viewDetails)

      $buttonDiv.append($bidBtn, $viewBtn);

      // Append all childrens to card body

      $cardBody.append($h4, $price1, $price2, $bidCount, $timeText, $buttonDiv);

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
    const $card = createCards(cardData);
    const diff = new Date(cardData.end_time).getTime() - now;
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
