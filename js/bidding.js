/* ============================================
   BIDDING PAGE JAVASCRIPT
   ============================================ */

// Sample auction data
const auctionItems = [
  {
    id: 1,
    name: "John Deere 8R 410 Tractor",
    category: "Tractors",
    currentBid: 125000,
    startingBid: 100000,
    minIncrement: 1000,
    timeLeft: "2h 30m",
    bids: 45,
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    seller: "Green Valley Farms",
    rating: 4.8,
    description: "Well-maintained 2020 model with low hours. Includes GPS guidance system and premium cab.",
    location: "Iowa, USA",
    condition: "Excellent",
    year: 2020,
    hours: 850
  },
  {
    id: 2,
    name: "Case IH Axial-Flow 9250",
    category: "Harvesters",
    currentBid: 285000,
    startingBid: 250000,
    minIncrement: 2000,
    timeLeft: "5h 15m",
    bids: 67,
    image: "https://images.unsplash.com/photo-1566421842506-2c37bba84bb7?w=400",
    seller: "Midwest Equipment",
    rating: 4.9,
    description: "2019 combine harvester with advanced grain monitoring. Ready for harvest season.",
    location: "Nebraska, USA",
    condition: "Very Good",
    year: 2019,
    hours: 1200
  },
  {
    id: 3,
    name: "New Holland T7.315",
    category: "Tractors",
    currentBid: 95000,
    startingBid: 80000,
    minIncrement: 1000,
    timeLeft: "30m",
    bids: 89,
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400",
    seller: "Prairie Auctions",
    rating: 4.7,
    description: "High-performance tractor with powerful engine and smooth transmission.",
    location: "Kansas, USA",
    condition: "Good",
    year: 2018,
    hours: 2400,
    urgent: true
  },
  {
    id: 4,
    name: "Kubota M7-172 Premium",
    category: "Tractors",
    currentBid: 78000,
    startingBid: 65000,
    minIncrement: 500,
    timeLeft: "1d 4h",
    bids: 23,
    image: "https://images.unsplash.com/photo-1628618305113-c5bfe4f74ff9?w=400",
    seller: "Farm Solutions Co",
    rating: 4.6,
    description: "Reliable workhorse with exceptional fuel efficiency and comfort.",
    location: "Texas, USA",
    condition: "Very Good",
    year: 2021,
    hours: 600
  },
  {
    id: 5,
    name: "Claas Lexion 8900",
    category: "Harvesters",
    currentBid: 420000,
    startingBid: 380000,
    minIncrement: 5000,
    timeLeft: "3d 2h",
    bids: 34,
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400",
    seller: "Elite Farm Equipment",
    rating: 5.0,
    description: "Top-of-the-line combine with industry-leading capacity and efficiency.",
    location: "Illinois, USA",
    condition: "Excellent",
    year: 2022,
    hours: 450
  },
  {
    id: 6,
    name: "Massey Ferguson 8S.265",
    category: "Tractors",
    currentBid: 112000,
    startingBid: 95000,
    minIncrement: 1000,
    timeLeft: "45m",
    bids: 56,
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
    seller: "Agricultural Solutions",
    rating: 4.8,
    description: "Feature-rich tractor with precision farming technology.",
    location: "Minnesota, USA",
    condition: "Excellent",
    year: 2021,
    hours: 980,
    urgent: true
  }
];

// Current state
let currentViewItem = null;

// ============================================
// INITIALIZE PAGE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  renderAuctionGrid();
  console.log('Bidding page initialized');
});

// ============================================
// RENDER AUCTION GRID
// ============================================
function renderAuctionGrid(items = auctionItems) {
  const grid = document.getElementById('auctionGrid');
  const noResults = document.getElementById('noResults');
  
  if (!grid) return;
  
  if (items.length === 0) {
    grid.style.display = 'none';
    if (noResults) noResults.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  if (noResults) noResults.style.display = 'none';
  
  grid.innerHTML = items.map(item => `
    <div class="auction-card ${item.urgent ? 'urgent' : ''}" data-id="${item.id}">
      <!-- Minimal View -->
      <div class="card-minimal">
        <img src="${item.image}" alt="${item.name}" class="item-image">
        <h3 class="item-name">${item.name}</h3>
        <p class="current-bid">$${item.currentBid.toLocaleString()}</p>
        <p class="time-left"><i class="fas fa-clock"></i> ${item.timeLeft} left</p>
        <p class="bid-count">${item.bids} bids</p>
      </div>
      
      <!-- Detailed View (on hover) -->
      <div class="card-detailed">
        <img src="${item.image}" alt="${item.name}" class="item-image">
        <h3 class="item-name">${item.name}</h3>
        <p class="current-bid">$${item.currentBid.toLocaleString()}</p>
        <div class="info-row">
          <span class="info-label"><i class="fas fa-clock"></i> Time Left:</span>
          <span class="time-left">${item.timeLeft}</span>
        </div>
        <div class="info-row">
          <span class="info-label"><i class="fas fa-gavel"></i> Bids:</span>
          <span>${item.bids}</span>
        </div>
        <div class="info-row">
          <span class="info-label"><i class="fas fa-map-marker-alt"></i> Location:</span>
          <span>${item.location}</span>
        </div>
        <p class="description">${item.description}</p>
        
        <div class="card-actions">
          <button class="btn btn-bid" onclick="openQuickBid(${item.id})">
            <i class="fas fa-gavel"></i> Quick Bid
          </button>
          <button class="btn btn-details" onclick="showDetail(${item.id})">
            <i class="fas fa-info-circle"></i> Details
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function searchItems() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase();
  
  const filtered = auctionItems.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.location.toLowerCase().includes(query)
  );
  
  renderAuctionGrid(filtered);
}

// ============================================
// QUICK BID MODAL
// ============================================
function openQuickBid(itemId) {
  // Check if user is logged in
  if (!window.authUtils || !window.authUtils.checkAuthStatus()) {
    alert('Please login to place a bid');
    window.authUtils.redirectToLogin();
    return;
  }
  
  const item = auctionItems.find(i => i.id === itemId);
  if (!item) return;
  
  currentViewItem = item;
  
  const modal = document.getElementById('bidModal');
  const itemName = document.getElementById('bidItemName');
  const currentPrice = document.getElementById('bidCurrentPrice');
  const bidAmount = document.getElementById('bidAmount');
  const bidRange = document.getElementById('quickBidRange');
  
  if (modal) {
    itemName.textContent = item.name;
    currentPrice.textContent = `$${item.currentBid.toLocaleString()}`;
    bidAmount.value = '';
    bidAmount.min = item.currentBid + item.minIncrement;
    bidAmount.placeholder = `Min: $${(item.currentBid + item.minIncrement).toLocaleString()}`;
    bidRange.textContent = `Minimum bid: $${(item.currentBid + item.minIncrement).toLocaleString()}`;
    
    modal.classList.add('show');
  }
}

function closeBidModal() {
  const modal = document.getElementById('bidModal');
  if (modal) {
    modal.classList.remove('show');
  }
  currentViewItem = null;
}

// ============================================
// PLACE BID
// ============================================
function placeBid() {
  if (!currentViewItem) return;
  
  const bidAmount = document.getElementById('bidAmount');
  const amount = parseFloat(bidAmount.value);
  
  if (!amount || isNaN(amount)) {
    alert('Please enter a valid bid amount');
    return;
  }
  
  const minBid = currentViewItem.currentBid + currentViewItem.minIncrement;
  
  if (amount < minBid) {
    alert(`Bid must be at least $${minBid.toLocaleString()}`);
    return;
  }
  
  // Simulate bid placement
  currentViewItem.currentBid = amount;
  currentViewItem.bids += 1;
  
  alert(`Bid placed successfully!\nYour bid: $${amount.toLocaleString()}`);
  
  closeBidModal();
  renderAuctionGrid();
}

// ============================================
// DETAIL PAGE
// ============================================
function showDetail(itemId) {
  const item = auctionItems.find(i => i.id === itemId);
  if (!item) return;
  
  currentViewItem = item;
  
  const mainPage = document.getElementById('mainPage');
  const detailPage = document.getElementById('detailPage');
  
  if (mainPage) mainPage.style.display = 'none';
  
  if (detailPage) {
    detailPage.innerHTML = `
      <button class="back-btn" onclick="hideDetail()">
        <i class="fas fa-arrow-left"></i> Back to Auctions
      </button>
      
      <div class="detail-container">
        <div class="detail-image-section">
          <img src="${item.image}" alt="${item.name}">
        </div>
        
        <div class="detail-info-section">
          <span class="status-badge status-${item.timeLeft.includes('m') ? 'ending' : 'active'}">
            ${item.timeLeft.includes('m') ? '⚡ Ending Soon' : '✅ Active'}
          </span>
          
          <h1 class="detail-title">${item.name}</h1>
          
          <div class="detail-price-box">
            <div class="detail-current-bid">$${item.currentBid.toLocaleString()}</div>
            <div class="time-left"><i class="fas fa-clock"></i> ${item.timeLeft} remaining</div>
            <div class="bid-count">${item.bids} bids placed</div>
          </div>
          
          <div class="seller-card">
            <div class="seller-header">
              <div class="seller-avatar">${item.seller.charAt(0)}</div>
              <div class="seller-info">
                <h3>${item.seller}</h3>
                <div class="rating">
                  ${'★'.repeat(Math.floor(item.rating))}${'☆'.repeat(5 - Math.floor(item.rating))}
                  ${item.rating.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-info-grid">
            <div class="detail-info-item">
              <div class="label">Location</div>
              <div class="value"><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
            </div>
            <div class="detail-info-item">
              <div class="label">Condition</div>
              <div class="value"><i class="fas fa-check-circle"></i> ${item.condition}</div>
            </div>
            <div class="detail-info-item">
              <div class="label">Year</div>
              <div class="value"><i class="fas fa-calendar"></i> ${item.year}</div>
            </div>
            <div class="detail-info-item">
              <div class="label">Hours</div>
              <div class="value"><i class="fas fa-tachometer-alt"></i> ${item.hours} hrs</div>
            </div>
          </div>
          
          <div class="bid-section">
            <h3>Place Your Bid</h3>
            <div class="bid-input-group">
              <input 
                type="number" 
                id="detailBidAmount" 
                placeholder="Enter amount" 
                min="${item.currentBid + item.minIncrement}"
                value="${item.currentBid + item.minIncrement}"
              >
              <button onclick="placeDetailBid()">
                <i class="fas fa-gavel"></i> Place Bid
              </button>
            </div>
            <div class="bid-range-info">
              Minimum bid: $${(item.currentBid + item.minIncrement).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-description">
        <h3>Description</h3>
        <p>${item.description}</p>
        <p>This ${item.year} ${item.name} is in ${item.condition.toLowerCase()} condition with only ${item.hours} operating hours. 
        Located in ${item.location}, this equipment is ready for immediate use and comes with full service history.</p>
      </div>
    `;
    
    detailPage.classList.add('show');
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideDetail() {
  const mainPage = document.getElementById('mainPage');
  const detailPage = document.getElementById('detailPage');
  
  if (detailPage) detailPage.classList.remove('show');
  if (mainPage) mainPage.style.display = 'block';
  
  currentViewItem = null;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function placeDetailBid() {
  // Check if user is logged in
  if (!window.authUtils || !window.authUtils.checkAuthStatus()) {
    alert('Please login to place a bid');
    window.authUtils.redirectToLogin();
    return;
  }
  
  if (!currentViewItem) return;
  
  const bidAmount = document.getElementById('detailBidAmount');
  const amount = parseFloat(bidAmount.value);
  
  if (!amount || isNaN(amount)) {
    alert('Please enter a valid bid amount');
    return;
  }
  
  const minBid = currentViewItem.currentBid + currentViewItem.minIncrement;
  
  if (amount < minBid) {
    alert(`Bid must be at least $${minBid.toLocaleString()}`);
    return;
  }
  
  // Simulate bid placement
  currentViewItem.currentBid = amount;
  currentViewItem.bids += 1;
  
  alert(`✅ Bid placed successfully!\n\nYour bid: $${amount.toLocaleString()}\nItem: ${currentViewItem.name}`);
  
  // Refresh detail view
  showDetail(currentViewItem.id);
}

// Close modal on outside click
window.onclick = function(event) {
  const modal = document.getElementById('bidModal');
  if (event.target === modal) {
    closeBidModal();
  }
}