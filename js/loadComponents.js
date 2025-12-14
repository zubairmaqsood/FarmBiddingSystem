/* ============================================
   LOAD COMPONENTS - Header & Footer
   ============================================ */

/**
 * Load external HTML component into specified element
 * @param {string} elementId - ID of target element
 * @param {string} filePath - Path to HTML file
 */
function loadComponent(elementId, filePath) {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return Promise.reject(new Error(`Element not found: ${elementId}`));
  }

  return fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      element.innerHTML = data;
      console.log(`✓ Loaded: ${filePath}`);
      return data;
    })
    .catch(error => {
      console.error(`Error loading ${filePath}:`, error);
      element.innerHTML = `<div class="alert alert-danger">Failed to load component</div>`;
      throw error;
    });
}

/**
 * Detect the correct path for header/footer based on current location
 * @returns {object} Object containing headerPath and footerPath
 */
function detectComponentPaths() {
  const pathname = window.location.pathname;
  const filename = pathname.split('/').pop();
  
  // Determine if we're in root directory or subdirectory
  const isInRootDirectory = 
    filename === 'homePage.html' || 
    filename === 'index.html' ||
    pathname === '/' ||
    !pathname.includes('/html/');
  
  let headerPath, footerPath;
  
  if (isInRootDirectory) {
    // Root directory: homePage.html, index.html
    headerPath = 'html/component/header.html';
    footerPath = 'html/component/footer.html';
  } else {
    // Subdirectory: /html/*.html
    headerPath = '../html/component/header.html';
    footerPath = '../html/component/footer.html';
  }
  
  console.log(`📍 Detected location: ${isInRootDirectory ? 'Root' : 'Subdirectory'}`);
  console.log(`📄 Header path: ${headerPath}`);
  console.log(`📄 Footer path: ${footerPath}`);
  
  return { headerPath, footerPath };
}

/**
 * Load header and footer components
 * Returns a Promise that resolves when both are loaded
 */
function loadHeaderAndFooter() {
  const { headerPath, footerPath } = detectComponentPaths();
  
  const headerPromise = loadComponent('header-placeholder', headerPath);
  const footerPromise = loadComponent('footer-placeholder', footerPath);

  return Promise.all([headerPromise, footerPromise])
    .then(() => {
      console.log('✓ Header and Footer loaded successfully');
      
      // Initialize header functionality after loading
      initializeHeaderComponents();
      
      // Initialize auth state in header
      if (window.authUtils && window.authUtils.initializeHeaderAuth) {
        window.authUtils.initializeHeaderAuth();
      }
    })
    .catch(error => {
      console.error('❌ Error loading header/footer:', error);
    });
}

/* ============================================
   HEADER COMPONENT INITIALIZATION
   ============================================ */

/**
 * Initialize all header interactive components
 */
function initializeHeaderComponents() {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initializeDarkMode();
    initializeSearchBox();
    initializeNavigationHighlight();
    initializeNotificationHandlers();
    initializeStickyHeader();
  }, 100);
}

/* ============================================
   DARK MODE TOGGLE
   ============================================ */

function initializeDarkMode() {
  const darkToggle = document.getElementById('darkToggle');
  
  if (!darkToggle) {
    console.log('ℹ️ Dark mode toggle not found (may not be in header yet)');
    return;
  }
  
  const darkIcon = darkToggle.querySelector('i');
  const root = document.documentElement;

  // Check saved preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.dataset.theme = savedTheme;
  updateDarkModeIcon(savedTheme, darkIcon, darkToggle);

  darkToggle.addEventListener('click', () => {
    const currentTheme = root.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme, darkIcon, darkToggle);
  });
  
  console.log('✓ Dark mode initialized');
}

function updateDarkModeIcon(theme, icon, toggle) {
  if (!icon) return;
  
  if (theme === 'dark') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    if (toggle) toggle.title = 'Switch to Light Mode';
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    if (toggle) toggle.title = 'Switch to Dark Mode';
  }
}

/* ============================================
   SEARCH BOX WITH AUTOCOMPLETE
   ============================================ */

function initializeSearchBox() {
  const searchBox = document.getElementById('searchBox');
  const suggestionsBox = document.getElementById('suggestions');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchBox || !suggestionsBox) {
    console.log('ℹ️ Search box not found (may not be in header yet)');
    return;
  }

  const searchData = [
    { text: 'John Deere 5055E Tractor', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Livestock Equipment Auction', icon: 'fa-warehouse', category: 'Auction' },
    { text: 'Hay Baler - New Holland', icon: 'fa-boxes', category: 'Equipment' },
    { text: 'Farm Machinery Sale - Iowa', icon: 'fa-map-marker-alt', category: 'Location' },
    { text: 'Irrigation Systems', icon: 'fa-water', category: 'Equipment' },
    { text: 'Upcoming Auctions This Week', icon: 'fa-calendar', category: 'Auction' },
    { text: 'Case IH Tractors', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Local Farm Equipment Dealers', icon: 'fa-store', category: 'Company' },
    { text: 'Kubota Compact Tractors', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Grain Storage Equipment', icon: 'fa-warehouse', category: 'Equipment' },
  ];

  let searchTimeout;
  let selectedSuggestionIndex = -1;

  // Input event - show suggestions
  searchBox.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.toLowerCase().trim();

    if (!query) {
      suggestionsBox.style.display = 'none';
      return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
      const matches = searchData.filter(item =>
        item.text.toLowerCase().includes(query)
      );

      suggestionsBox.innerHTML = '';

      if (matches.length > 0) {
        matches.forEach(item => {
          const div = document.createElement('div');
          div.className = 'suggestion-item';
          div.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <div class="flex-grow-1">
              <div>${highlightMatch(item.text, query)}</div>
              <small class="text-muted">${item.category}</small>
            </div>
          `;
          div.onclick = () => {
            searchBox.value = item.text;
            suggestionsBox.style.display = 'none';
            performSearch(item.text);
          };
          suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
      } else {
        suggestionsBox.innerHTML = `
          <div class="suggestion-item text-muted">
            <i class="fas fa-search"></i> 
            No results found for "${query}"
          </div>`;
        suggestionsBox.style.display = 'block';
      }
    }, 300);
  });

  // Keyboard navigation
  searchBox.addEventListener('keydown', function(e) {
    const suggestions = suggestionsBox.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
      updateSelectedSuggestion(suggestions, selectedSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex = selectedSuggestionIndex <= 0 
        ? suggestions.length - 1 
        : selectedSuggestionIndex - 1;
      updateSelectedSuggestion(suggestions, selectedSuggestionIndex);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0) {
        e.preventDefault();
        suggestions[selectedSuggestionIndex].click();
      } else {
        performSearch(this.value);
        suggestionsBox.style.display = 'none';
      }
    } else if (e.key === 'Escape') {
      suggestionsBox.style.display = 'none';
      selectedSuggestionIndex = -1;
    }
  });

  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', () => performSearch(searchBox.value));
  }

  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
      selectedSuggestionIndex = -1;
    }
  });
  
  console.log('✓ Search box initialized');
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

function updateSelectedSuggestion(suggestions, index) {
  suggestions.forEach((suggestion, i) => {
    if (i === index) {
      suggestion.style.background = 'rgba(127, 201, 127, 0.2)';
      suggestion.scrollIntoView({ block: 'nearest' });
    } else {
      suggestion.style.background = '';
    }
  });
}

function performSearch(query) {
  if (query.trim()) {
    console.log('Searching for:', query);
    
    // Determine search results page path based on current location
    const pathname = window.location.pathname;
    const isInRoot = !pathname.includes('/html/');
    const searchPath = isInRoot ? 'html/search.html' : 'search.html';
    
    window.location.href = `${searchPath}?q=${encodeURIComponent(query)}`;
  }
}

/* ============================================
   NAVIGATION HIGHLIGHTING
   ============================================ */

function initializeNavigationHighlight() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    const linkPage = linkHref ? linkHref.split('/').pop() : '';
    
    if (linkPage === currentPage || 
        linkHref === currentPage ||
        (currentPage === '' && (linkPage === 'index.html' || linkPage === 'homePage.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
  
  console.log('✓ Navigation highlighting initialized');
}

/* ============================================
   NOTIFICATION & ACTION HANDLERS
   ============================================ */

function initializeNotificationHandlers() {
  // Notifications button
  const notifBtn = document.querySelector('.icon-btn[title="Notifications"]');
  if (notifBtn) {
    notifBtn.addEventListener('click', function() {
      console.log('Notifications clicked');
      alert('Notifications feature - Coming soon!');
    });
  }

  // Messages button
  const msgBtn = document.querySelector('.icon-btn[title="Messages"]');
  if (msgBtn) {
    msgBtn.addEventListener('click', function() {
      console.log('Messages clicked');
      alert('Messages feature - Coming soon!');
    });
  }

  // Watchlist button
  const watchlistBtn = document.querySelector('.icon-btn[title="Watchlist"]');
  if (watchlistBtn) {
    watchlistBtn.addEventListener('click', function() {
      const pathname = window.location.pathname;
      const isInRoot = !pathname.includes('/html/');
      const watchlistPath = isInRoot ? 'html/watchlist.html' : 'watchlist.html';
      window.location.href = watchlistPath;
    });
  }
  
  console.log('✓ Notification handlers initialized');
}

/* ============================================
   STICKY HEADER ON SCROLL
   ============================================ */

function initializeStickyHeader() {
  const mainHeader = document.querySelector('.main-header');
  
  if (!mainHeader) {
    console.log('ℹ️ Main header not found');
    return;
  }

  let lastScrollTop = 0;
  mainHeader.style.transition = 'transform 0.3s ease-in-out';

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down - hide header
      mainHeader.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up - show header
      mainHeader.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
  });
  
  console.log('✓ Sticky header initialized');
}

/* ============================================
   INITIALIZE ON PAGE LOAD
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  console.log('%c🚜 Farm Bidding System', 'color: #2c5f2d; font-size: 20px; font-weight: bold;');
  console.log('%cWelcome to the best agricultural auction platform!', 'color: #7fc97f; font-size: 14px;');
  
  // Load header and footer
  loadHeaderAndFooter();
});

/* ============================================
   EXPORT FUNCTIONS
   ============================================ */

// Make functions available globally if needed
window.loadComponent = loadComponent;
window.loadHeaderAndFooter = loadHeaderAndFooter;
window.detectComponentPaths = detectComponentPaths;

/* ============================================
   DARK MODE TOGGLE
   ============================================ */

function initializeDarkMode() {
  const darkToggle = document.getElementById('darkToggle');
  
  if (!darkToggle) return;
  
  const darkIcon = darkToggle.querySelector('i');
  const root = document.documentElement;

  // Check saved preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  root.dataset.theme = savedTheme;
  updateDarkModeIcon(savedTheme, darkIcon, darkToggle);

  darkToggle.addEventListener('click', () => {
    const currentTheme = root.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme, darkIcon, darkToggle);
  });
}

function updateDarkModeIcon(theme, icon, toggle) {
  if (!icon) return;
  
  if (theme === 'dark') {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    if (toggle) toggle.title = 'Switch to Light Mode';
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    if (toggle) toggle.title = 'Switch to Dark Mode';
  }
}

/* ============================================
   SEARCH BOX WITH AUTOCOMPLETE
   ============================================ */

function initializeSearchBox() {
  const searchBox = document.getElementById('searchBox');
  const suggestionsBox = document.getElementById('suggestions');
  const searchBtn = document.querySelector('.search-btn');

  if (!searchBox || !suggestionsBox) return;

  const searchData = [
    { text: 'John Deere 5055E Tractor', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Livestock Equipment Auction', icon: 'fa-warehouse', category: 'Auction' },
    { text: 'Hay Baler - New Holland', icon: 'fa-boxes', category: 'Equipment' },
    { text: 'Farm Machinery Sale - Iowa', icon: 'fa-map-marker-alt', category: 'Location' },
    { text: 'Irrigation Systems', icon: 'fa-water', category: 'Equipment' },
    { text: 'Upcoming Auctions This Week', icon: 'fa-calendar', category: 'Auction' },
    { text: 'Case IH Tractors', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Local Farm Equipment Dealers', icon: 'fa-store', category: 'Company' },
    { text: 'Kubota Compact Tractors', icon: 'fa-tractor', category: 'Equipment' },
    { text: 'Grain Storage Equipment', icon: 'fa-warehouse', category: 'Equipment' },
  ];

  let searchTimeout;
  let selectedSuggestionIndex = -1;

  // Input event - show suggestions
  searchBox.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    const query = this.value.toLowerCase().trim();

    if (!query) {
      suggestionsBox.style.display = 'none';
      return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
      const matches = searchData.filter(item =>
        item.text.toLowerCase().includes(query)
      );

      suggestionsBox.innerHTML = '';

      if (matches.length > 0) {
        matches.forEach(item => {
          const div = document.createElement('div');
          div.className = 'suggestion-item';
          div.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <div class="flex-grow-1">
              <div>${highlightMatch(item.text, query)}</div>
              <small class="text-muted">${item.category}</small>
            </div>
          `;
          div.onclick = () => {
            searchBox.value = item.text;
            suggestionsBox.style.display = 'none';
            performSearch(item.text);
          };
          suggestionsBox.appendChild(div);
        });
        suggestionsBox.style.display = 'block';
      } else {
        suggestionsBox.innerHTML = `
          <div class="suggestion-item text-muted">
            <i class="fas fa-search"></i> 
            No results found for "${query}"
          </div>`;
        suggestionsBox.style.display = 'block';
      }
    }, 300);
  });

  // Keyboard navigation
  searchBox.addEventListener('keydown', function(e) {
    const suggestions = suggestionsBox.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
      updateSelectedSuggestion(suggestions, selectedSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex = selectedSuggestionIndex <= 0 
        ? suggestions.length - 1 
        : selectedSuggestionIndex - 1;
      updateSelectedSuggestion(suggestions, selectedSuggestionIndex);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0) {
        e.preventDefault();
        suggestions[selectedSuggestionIndex].click();
      } else {
        performSearch(this.value);
        suggestionsBox.style.display = 'none';
      }
    } else if (e.key === 'Escape') {
      suggestionsBox.style.display = 'none';
      selectedSuggestionIndex = -1;
    }
  });

  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', () => performSearch(searchBox.value));
  }

  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
      selectedSuggestionIndex = -1;
    }
  });
}

function highlightMatch(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

function updateSelectedSuggestion(suggestions, index) {
  suggestions.forEach((suggestion, i) => {
    if (i === index) {
      suggestion.style.background = 'rgba(127, 201, 127, 0.2)';
      suggestion.scrollIntoView({ block: 'nearest' });
    } else {
      suggestion.style.background = '';
    }
  });
}

function performSearch(query) {
  if (query.trim()) {
    console.log('Searching for:', query);
    // Redirect to search results page or filter current page
    window.location.href = `../html/search.html?q=${encodeURIComponent(query)}`;
  }
}

/* ============================================
   NAVIGATION HIGHLIGHTING
   ============================================ */

function initializeNavigationHighlight() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        linkHref === `./${currentPage}` ||
        linkHref === `../${currentPage}` ||
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ============================================
   NOTIFICATION & ACTION HANDLERS
   ============================================ */

function initializeNotificationHandlers() {
  // Notifications button
  const notifBtn = document.querySelector('.icon-btn[title="Notifications"]');
  if (notifBtn) {
    notifBtn.addEventListener('click', function() {
      console.log('Notifications clicked');
      // TODO: Implement notification dropdown
      alert('Notifications feature - Coming soon!');
    });
  }

  // Messages button
  const msgBtn = document.querySelector('.icon-btn[title="Messages"]');
  if (msgBtn) {
    msgBtn.addEventListener('click', function() {
      console.log('Messages clicked');
      // TODO: Implement messages dropdown
      alert('Messages feature - Coming soon!');
    });
  }

  // Watchlist button
  const watchlistBtn = document.querySelector('.icon-btn[title="Watchlist"]');
  if (watchlistBtn) {
    watchlistBtn.addEventListener('click', function() {
      window.location.href = '../html/watchlist.html';
    });
  }
}

/* ============================================
   STICKY HEADER ON SCROLL
   ============================================ */

function initializeStickyHeader() {
  const mainHeader = document.querySelector('.main-header');
  
  if (!mainHeader) return;

  let lastScrollTop = 0;
  mainHeader.style.transition = 'transform 0.3s ease-in-out';

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down - hide header
      mainHeader.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up - show header
      mainHeader.style.transform = 'translateY(0)';
    }

    lastScrollTop = scrollTop;
  });
}

/* ============================================
   INITIALIZE ON PAGE LOAD
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  console.log('%c🚜 Farm Bidding System', 'color: #2c5f2d; font-size: 20px; font-weight: bold;');
  console.log('%cWelcome to the best agricultural auction platform!', 'color: #7fc97f; font-size: 14px;');
  
  // Load header and footer
  loadHeaderAndFooter();
});

/* ============================================
   EXPORT FUNCTIONS
   ============================================ */

// Make functions available globally if needed
window.loadComponent = loadComponent;
window.loadHeaderAndFooter = loadHeaderAndFooter;