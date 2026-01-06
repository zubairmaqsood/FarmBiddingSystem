$(document).ready(function () {

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

    // 3. Handle Moving Logic
    const parentId = $card.parent().attr("id");

    if (diff <= THREE_HOURS_MS) {
      // Should be in Ending Soon
      if (parentId !== "endingSoon") {
        $timeText.removeClass("text-success").addClass("text-danger");
        $card.detach().prependTo("#endingSoon"); // Move it
      }
    } else {
      // Should be in Live Auction
      if (parentId !== "liveAuction") {
        $timeText.removeClass("text-danger").addClass("text-success");
        $card.detach().appendTo("#liveAuction"); // Move it
      }
    }
  });
}

  setTimeout(() => {
    const data = [
    // --- EXPIRED ITEMS (Time < Jan 6, 21:25) ---
    { 
        title: "Expired Garlic", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-05 11:00:00", // Yesterday (Expired)
        img: "../img/garlic.webp" 
    },
    { 
        title: "Sold Out Spinach", 
        base: 15, 
        highestBid: 30, 
        bids: 8, 
        endTime: "2026-01-06 18:00:00", // Today at 6:00 PM (Expired 3 hours ago)
        img: "../img/spinach.webp" 
    },

    // --- ENDING SOON (Less than 3 hours from 9:25 PM) ---
    { 
        title: "Red Chilies", 
        base: 50, 
        highestBid: 85, 
        bids: 15, 
        // 2 Minutes from now (9:34 PM)
        endTime: "2026-01-06 21:34:00", 
        img: "../img/chili.webp" 
    },
    { 
        title: "Fresh Coriander", 
        base: 20, 
        highestBid: 45, 
        bids: 22, 
        endTime: "2026-01-06 23:55:00", // Today 11:55 PM (~2.5 hours left)
        img: "../img/coriander.webp" 
    },
    { 
        title: "Bell Peppers", 
        base: 100, 
        highestBid: 150, 
        bids: 9, 
        endTime: "2026-01-07 00:15:00", // Tomorrow 12:15 AM (Technically < 3 hours)
        img: "../img/pepper.webp" 
    },

    // --- LIVE AUCTIONS (More than 3 hours left) ---
    { 
        title: "Organic Tomato", 
        base: 24, 
        highestBid: 50, 
        bids: 4, 
        endTime: "2026-01-07 10:00:00", // Tomorrow Morning (Live)
        img: "../img/tomato.webp" 
    },
    { 
        title: "Organic Tomato", 
        base: 24, 
        highestBid: 50, 
        bids: 4, 
        endTime: "2026-01-07 10:00:00", // Tomorrow Morning (Live)
        img: "../img/tomato.webp" 
    },
    { 
        title: "Large Potatoes", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-07 00:35:00", 
        img: "../img/potato.webp" 
    },
    { 
        title: "Large Potatoes", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-07 00:35:00", 
        img: "../img/potato.webp" 
    },
    { 
        title: "Large Potatoes", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-07 00:35:00", 
        img: "../img/potato.webp" 
    },
    { 
        title: "Large Potatoes", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-07 00:35:00", 
        img: "../img/potato.webp" 
    },
    { 
        title: "Large Potatoes", 
        base: 40, 
        highestBid: 120, 
        bids: 12, 
        endTime: "2026-01-07 00:35:00", 
        img: "../img/potato.webp" 
    },
    { 
        title: "Fresh Onions", 
        base: 234, 
        highestBid: 500, 
        bids: 43, 
        endTime: "2026-01-10 12:00:00", // 4 Days from now (Live)
        img: "../img/onion.webp" 
    }
];

    const $liveContainer = $("#liveAuction");
    const $endingContainer = $("#endingSoon");
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    data.forEach(function (cardData) {
        //Card creation
        
        const $card = $("<div>");
        
        $card.addClass("card custom-card");
        $card.attr("data-endtime", cardData.endTime);

      //Image creation

      const $img = $("<img>").addClass("card-img-top cardImg");

      $img.attr("src", cardData.img);

      $img.attr("alt", cardData.title);

      // Card body creation

      const $cardBody = $("<div>");

      $cardBody.addClass("card-body d-flex flex-column cardBody");

      // Title

      const $h4 = $("<h4>")
        .addClass("card-title cardTitle")

        .text(cardData.title);

      // Prices

      const $price1 = $("<h6>")
        .addClass("fs-5 fw-bold cardLabel")

        .text("Starting Price: " + cardData.base + " Rs");

      const $price2 = $("<h6>")
        .addClass("fw-bold fs-5 cardLabel")

        .text("Top Bid: " + cardData.highestBid + " Rs");

      // Stats

      const $bidCount = $("<p>")
        .addClass("card-text mb-0 fs-5 cardBid")

        .text("📊 " + cardData.bids + " bids Placed");

      const $timeText = $("<p>").addClass("card-text mb-2 fs-5 cardTime");

      const $buttonDiv = $("<div>").addClass(
        "d-flex justify-content-between align-items-center mt-auto"
      );

      // Button

      const $bidBtn = $("<button>")
        .addClass("btn btn-outline-success align-self-start mt-auto")

        .text("Bid Now");

      const $viewBtn = $("<button>")
        .addClass("btn btn-outline-success align-self-end mt-auto")

        .text("View Details");

      $buttonDiv.append($bidBtn, $viewBtn);

      // Append all childrens to card body

      $cardBody.append($h4, $price1, $price2, $bidCount, $timeText, $buttonDiv);

      // Append Image and Body into Main Card

      $card.append($img, $cardBody);

      // 2. Initial Placement Logic
      const now = new Date().getTime();
      const diff = new Date(cardData.endTime).getTime() - now;

      $timeText.text("⏰ " + formatTime(diff));

      if (diff <= THREE_HOURS_MS) {
        $timeText.addClass("text-danger");
        $endingContainer.append($card);
      } else {
        $timeText.addClass("text-success");
        $liveContainer.append($card);
      }
    });

    $(".loadingSpinner").remove();

    updateButtonVisibility();

    setInterval(function () {
      updateAllCards();
      updateButtonVisibility();
    }, 1000);
  }, 3000);
});

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
