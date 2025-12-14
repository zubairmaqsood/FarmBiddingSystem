/* ============================================
   AUTHENTICATION JAVASCRIPT - INTEGRATED VERSION
   Supports both Modal Login AND Separate Login Page
   ============================================ */

// Utility Functions
const showMessage = (elementId, message, type = "error") => {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");
  element.classList.remove("auth-alert-error", "auth-alert-success");
  element.classList.add(`auth-alert-${type}`);

  setTimeout(() => {
    element.classList.remove("show");
  }, 5000);
};

const hideMessage = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove("show");
  }
};

const setButtonLoading = (button, loading) => {
  if (loading) {
    button.classList.add("loading");
    button.disabled = true;
  } else {
    button.classList.remove("loading");
    button.disabled = false;
  }
};

// Email Validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password Validation
const validatePassword = (password) => {
  return password.length >= 8;
};

// Password Strength Checker
const checkPasswordStrength = (password) => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
};

// ============================================
// REDIRECT URL MANAGEMENT
// ============================================

/**
 * Store the URL to redirect to after login
 * @param {string} url - The URL to redirect to
 */
const setRedirectUrl = (url) => {
  sessionStorage.setItem("redirectAfterLogin", url);
  console.log("📍 Stored redirect URL:", url);
};

/**
 * Get the stored redirect URL
 * @returns {string|null} The redirect URL or null
 */
const getRedirectUrl = () => {
  return sessionStorage.getItem("redirectAfterLogin");
};

/**
 * Clear the stored redirect URL
 */
const clearRedirectUrl = () => {
  sessionStorage.removeItem("redirectAfterLogin");
};

/**
 * Get the appropriate redirect path after login
 * @returns {string} The path to redirect to
 */
const getPostLoginRedirect = () => {
  // Check if there's a stored redirect URL
  const redirectUrl = getRedirectUrl();
  if (redirectUrl) {
    console.log("✓ Redirecting to stored URL:", redirectUrl);
    clearRedirectUrl();
    return redirectUrl;
  }

  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect");
  if (redirect) {
    console.log("✓ Redirecting to URL parameter:", redirect);
    return redirect;
  }

  // Default to home page
  console.log("✓ Redirecting to homepage (default)");
  return "../../homePage.html";
};

// ============================================
// LOGIN MODAL FUNCTIONS
// ============================================

/**
 * Open the login modal
 */
function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("login-modal-open");

    // Clear any previous messages
    hideMessage("loginErrorMessage");
    hideMessage("loginSuccessMessage");

    // Focus on email input
    setTimeout(() => {
      const emailInput = document.getElementById("loginEmail");
      if (emailInput) emailInput.focus();
    }, 100);

    console.log("✓ Login modal opened");
  } else {
    // If modal doesn't exist, redirect to login page
    console.log("ℹ️ Modal not found, redirecting to login page");
    redirectToLogin();
  }
}

/**
 * Close the login modal
 */
function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("login-modal-open");

    // Clear form
    const form = document.getElementById("loginForm");
    if (form) form.reset();

    // Clear messages
    hideMessage("loginErrorMessage");
    hideMessage("loginSuccessMessage");

    console.log("✓ Login modal closed");
  }
}

/**
 * Open signup modal (placeholder - implement if needed)
 */
function openSignupModal() {
  closeLoginModal();
  // TODO: Implement signup modal or redirect
  redirectToSignup();
}

// ============================================
// PASSWORD TOGGLE FUNCTIONALITY
// ============================================
const setupPasswordToggles = () => {
  const toggleButtons = document.querySelectorAll(".password-toggle");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const wrapper =
        this.closest(".login-input-wrapper") ||
        this.closest(".auth-input-wrapper") ||
        this.parentElement;
      const input = wrapper.querySelector(
        'input[type="password"], input[type="text"]'
      );
      const icon = this.querySelector("i");

      if (input && input.type === "password") {
        input.type = "text";
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
      } else if (input) {
        input.type = "password";
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      }
    });
  });

  console.log("✓ Password toggles initialized");
};

// ============================================
// PASSWORD STRENGTH INDICATOR (Signup)
// ============================================
const setupPasswordStrength = () => {
  const passwordInput = document.getElementById("password");
  const strengthFill = document.getElementById("strengthFill");
  const strengthText = document.getElementById("strengthText");

  if (passwordInput && strengthFill && strengthText) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;

      if (password.length === 0) {
        strengthFill.className = "strength-fill";
        strengthText.className = "strength-text";
        strengthText.textContent = "Password strength";
        return;
      }

      const strength = checkPasswordStrength(password);
      strengthFill.className = `strength-fill ${strength}`;
      strengthText.className = `strength-text ${strength}`;

      if (strength === "weak") {
        strengthText.textContent = "Weak password";
      } else if (strength === "medium") {
        strengthText.textContent = "Medium strength";
      } else {
        strengthText.textContent = "Strong password";
      }
    });

    console.log("✓ Password strength indicator initialized");
  }
};

// ============================================
// LOGIN FORM HANDLER - INTEGRATED VERSION
// ============================================
const setupLoginForm = () => {
  const loginForm = document.getElementById("loginForm");

  // Determine if we're in modal or page
  const isModal = document.getElementById("loginModal") !== null;
  const loginBtn = isModal
    ? document.getElementById("loginSubmitBtn")
    : document.getElementById("loginBtn");

  const errorMsgId = isModal ? "loginErrorMessage" : "errorMessage";
  const successMsgId = isModal ? "loginSuccessMessage" : "successMessage";
  const emailInputId = isModal ? "loginEmail" : "email";
  const passwordInputId = isModal ? "loginPassword" : "password";
  const rememberMeId = isModal ? "loginRememberMe" : "rememberMe";

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      hideMessage(errorMsgId);
      hideMessage(successMsgId);

      const email = document.getElementById(emailInputId).value.trim();
      const password = document.getElementById(passwordInputId).value;
      const rememberMe =
        document.getElementById(rememberMeId)?.checked || false;

      // Validation
      if (!email || !password) {
        showMessage(errorMsgId, "Please fill in all fields", "error");
        return;
      }

      if (!validateEmail(email)) {
        showMessage(errorMsgId, "Please enter a valid email address", "error");
        return;
      }

      // Set loading state
      setButtonLoading(loginBtn, true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // TODO: Replace with actual API call
        const response = await fakeLoginAPI(email, password, rememberMe);

        if (response.success) {
          const successMsg = isModal
            ? "Login successful! Refreshing page..."
            : "Login successful! Redirecting...";
          showMessage(successMsgId, successMsg, "success");

          // Store auth token and user info
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem("authToken", response.token);
          storage.setItem("userInfo", JSON.stringify(response.user));

          console.log("✓ User logged in:", response.user.name);

          // Handle redirect based on context
          setTimeout(() => {
            if (isModal) {
              // Modal: Close and refresh page
              closeLoginModal();

              // Update header without page reload
              if (window.authUtils && window.authUtils.initializeHeaderAuth) {
                window.authUtils.initializeHeaderAuth();
              }

              // Reload page to update content
              window.location.reload();
            } else {
              // Separate page: Redirect to stored URL or homepage
              const redirectUrl = getPostLoginRedirect();
              window.location.href = redirectUrl;
            }
          }, 1000);
        } else {
          showMessage(errorMsgId, response.message || "Login failed", "error");
        }
      } catch (error) {
        showMessage(
          errorMsgId,
          "An error occurred. Please try again.",
          "error"
        );
        console.error("Login error:", error);
      } finally {
        setButtonLoading(loginBtn, false);
      }
    });

    console.log("✓ Login form initialized", isModal ? "(Modal)" : "(Page)");
  }
};

// ============================================
// SIGNUP FORM HANDLER
// ============================================
const setupSignupForm = () => {
  const signupForm = document.getElementById("signupForm");
  const signupBtn = document.getElementById("signupBtn");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      hideMessage("errorMessage");
      hideMessage("successMessage");

      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      const userType = document.querySelector(
        'input[name="userType"]:checked'
      )?.value;
      const agreeTerms = document.getElementById("agreeTerms")?.checked;

      // Validation
      if (!fullName || !email || !password || !confirmPassword) {
        showMessage(
          "errorMessage",
          "Please fill in all required fields",
          "error"
        );
        return;
      }

      if (!validateEmail(email)) {
        showMessage(
          "errorMessage",
          "Please enter a valid email address",
          "error"
        );
        return;
      }

      if (!validatePassword(password)) {
        showMessage(
          "errorMessage",
          "Password must be at least 8 characters long",
          "error"
        );
        return;
      }

      if (password !== confirmPassword) {
        showMessage("errorMessage", "Passwords do not match", "error");
        return;
      }

      if (agreeTerms === false) {
        showMessage(
          "errorMessage",
          "Please agree to the Terms & Conditions",
          "error"
        );
        return;
      }

      // Set loading state
      setButtonLoading(signupBtn, true);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // TODO: Replace with actual API call
        const response = await fakeSignupAPI({
          fullName,
          email,
          phone,
          password,
          userType,
        });

        if (response.success) {
          showMessage(
            "successMessage",
            "Account created successfully! Redirecting to login...",
            "success"
          );

          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = "logIn.html";
          }, 2000);
        } else {
          showMessage(
            "errorMessage",
            response.message || "Signup failed",
            "error"
          );
        }
      } catch (error) {
        showMessage(
          "errorMessage",
          "An error occurred. Please try again.",
          "error"
        );
        console.error("Signup error:", error);
      } finally {
        setButtonLoading(signupBtn, false);
      }
    });

    console.log("✓ Signup form initialized");
  }
};

// ============================================
// SOCIAL LOGIN HANDLERS
// ============================================
const setupSocialLogin = () => {
  const googleBtns = document.querySelectorAll(".social-btn-google");
  const facebookBtns = document.querySelectorAll(".social-btn-facebook");

  const isModal = document.getElementById("loginModal") !== null;
  const errorMsgId = isModal ? "loginErrorMessage" : "errorMessage";

  googleBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Google login clicked");
      showMessage(errorMsgId, "Google login coming soon!", "error");
    });
  });

  facebookBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Facebook login clicked");
      showMessage(errorMsgId, "Facebook login coming soon!", "error");
    });
  });
};

// ============================================
// CLOSE MODAL ON OVERLAY CLICK
// ============================================
const setupModalClose = () => {
  const modal = document.getElementById("loginModal");
  const overlay = modal?.querySelector(".login-modal-overlay");

  if (overlay) {
    overlay.addEventListener("click", closeLoginModal);
  }

  // Close on ESC key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
      closeLoginModal();
    }
  });
};

// ============================================
// FAKE API FUNCTIONS (Replace with real API)
// ============================================
const fakeLoginAPI = async (email, password, rememberMe) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Demo credentials
  if (email === "demo@farm.com" && password === "password123") {
    return {
      success: true,
      token: "fake-jwt-token-" + Date.now(),
      user: {
        id: 1,
        name: "John Farmer",
        email: email,
      },
    };
  }

  return {
    success: false,
    message: "Invalid email or password",
  };
};

const fakeSignupAPI = async (userData) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (userData.email === "existing@farm.com") {
    return {
      success: false,
      message: "Email already registered",
    };
  }

  return {
    success: true,
    message: "Account created successfully",
  };
};

// ============================================
// CHECK AUTH STATUS
// ============================================
const checkAuthStatus = () => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  return !!token;
};

// ============================================
// LOGOUT FUNCTION
// ============================================
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("userInfo");
  clearRedirectUrl();

  console.log("✓ User logged out");

  // Check if we have modal, if so just reload, otherwise redirect to login page
  const hasModal = document.getElementById("loginModal") !== null;

  if (hasModal) {
    // Just reload the page, user will see they're logged out
    window.location.reload();
  } else {
    // Redirect to login page
    const currentPath = window.location.pathname;
    const isInRoot =
      currentPath === "/" ||
      currentPath.endsWith("homePage.html") ||
      !currentPath.includes("/html/");
    const loginPath = isInRoot
      ? "html/components/logIn.html"
      : "components/logIn.html";
    window.location.href = loginPath;
  }
};

// ============================================
// REDIRECT FUNCTIONS FOR HEADER INTEGRATION
// ============================================

/**
 * Redirect to login page with current page as redirect URL
 */
function redirectToLogin() {
  const currentPath = window.location.pathname;

  // Store current page for redirect after login
  setRedirectUrl(currentPath);
  console.log("📍 Redirecting to login from:", currentPath);

  // Determine correct path to login page based on current location
  const isInRoot =
    currentPath === "/" ||
    currentPath.endsWith("homePage.html") ||
    !currentPath.includes("/html/");
  const isInComponents = currentPath.includes("/components/");

  let loginPath;
  if (isInRoot) {
    loginPath = "html/components/logIn.html";
  } else if (isInComponents) {
    loginPath = "logIn.html";
  } else {
    loginPath = "components/logIn.html";
  }

  window.location.href = loginPath;
}

/**
 * Redirect to signup page
 */
function redirectToSignup() {
  const currentPath = window.location.pathname;
  const isInRoot =
    currentPath === "/" ||
    currentPath.endsWith("homePage.html") ||
    !currentPath.includes("/html/");
  const isInComponents = currentPath.includes("/components/");

  let signupPath;
  if (isInRoot) {
    signupPath = "html/components/signUp.html";
  } else if (isInComponents) {
    signupPath = "signUp.html";
  } else {
    signupPath = "components/signUp.html";
  }

  window.location.href = signupPath;
}

// ============================================
// INITIALIZE HEADER AUTH BUTTONS
// ============================================

function initializeHeaderAuth() {
  setTimeout(() => {
    const authStatus = checkAuthStatus();

    if (authStatus) {
      updateHeaderForLoggedInUser();
    } else {
      updateHeaderForGuest();
    }
  }, 100);
}

function updateHeaderForLoggedInUser() {
  const userInfoStr =
    localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");
  let userInfo = null;

  try {
    userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (e) {
    console.error("Error parsing user info:", e);
  }

  if (!userInfo) {
    console.warn("⚠️ No user info found");
    return;
  }

  console.log("✓ Updating header for logged-in user:", userInfo.name);

  // Update user name in dropdown
  const userNameElement = document.querySelector(".dropdown-menu .fw-bold");
  if (userNameElement) {
    userNameElement.textContent = userInfo.name || "User";
  }

  // Update email in dropdown
  const userEmailElement = document.querySelector(".dropdown-menu .text-muted");
  if (userEmailElement) {
    userEmailElement.textContent = userInfo.email || "";
  }

  // Update avatar
  const userAvatar = document.querySelector(".user-avatar");
  if (userAvatar) {
    const name = userInfo.name || "User";
    userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=52b788&color=fff`;
    userAvatar.alt = name;
  }

  // Add logout handler
  const logoutLinks = document.querySelectorAll(".dropdown-item.text-danger");
  logoutLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });
}

function updateHeaderForGuest() {
  console.log("ℹ️ User not logged in - setting up guest header");

  // Check if modal exists
  const hasModal = document.getElementById("loginModal") !== null;

  // Handle avatar/dropdown click for non-logged-in users
  const avatarBtn = document.querySelector(".user-avatar");
  const userDropdownToggle = avatarBtn
    ?.closest(".dropdown")
    ?.querySelector('[data-bs-toggle="dropdown"]');

  if (dropdownToggle) {
    // Remove dropdown functionality
    dropdownToggle.removeAttribute("data-bs-toggle");
    dropdownToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasModal) {
        openLoginModal(); // Open modal if available
      } else {
        redirectToLogin(); // Otherwise redirect to login page
      }
    });
  }

  if (avatarBtn) {
    avatarBtn.style.cursor = "pointer";
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasModal) {
        openLoginModal(); // Open modal if available
      } else {
        redirectToLogin(); // Otherwise redirect to login page
      }
    });
  }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "%c🚜 Farm Bidding System - Auth System",
    "color: #52b788; font-size: 16px; font-weight: bold;"
  );

  setupPasswordToggles();
  setupPasswordStrength();
  setupLoginForm();
  setupSignupForm();
  setupSocialLogin();
  setupModalClose();

  console.log("✓ Auth system initialized");

  if (checkAuthStatus()) {
    console.log("✓ User is logged in");
  } else {
    console.log("ℹ️ User is not logged in");
  }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.authUtils = {
  checkAuthStatus,
  logout,
  validateEmail,
  validatePassword,
  redirectToLogin,
  redirectToSignup,
  initializeHeaderAuth,
  setRedirectUrl,
  getRedirectUrl,
  clearRedirectUrl,
  openLoginModal,
  closeLoginModal,
  openSignupModal,
};

// Make modal functions globally available
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openSignupModal = openSignupModal;
