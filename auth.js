// Authentication System for LinguaSign
// Developer Access: Username: Admin | Password: AbdullahShafiq5757

// Credentials Database (In production, this would be on a secure backend)
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'AbdullahShafiq5757'
};

// Storage for user sessions and accounts
const AUTH_STORAGE_KEY = 'linguasign_auth';
const USERS_STORAGE_KEY = 'linguasign_users';

// Initialize authentication system on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeAuth();
});

function initializeAuth() {
  // Check if already logged in
  if (isUserLoggedIn()) {
    redirectToDashboard();
  }

  // Setup form switching
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin = document.getElementById('switch-to-login');

  if (switchToSignup) {
    switchToSignup.addEventListener('click', function(e) {
      e.preventDefault();
      showSignupForm();
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', function(e) {
      e.preventDefault();
      showLoginForm();
    });
  }

  // Setup password visibility toggles
  setupPasswordToggles();

  // Setup form submissions
  const loginFormElement = document.getElementById('login-form-element');
  const signupFormElement = document.getElementById('signup-form-element');

  if (loginFormElement) {
    loginFormElement.addEventListener('submit', handleLoginSubmit);
  }

  if (signupFormElement) {
    signupFormElement.addEventListener('submit', handleSignupSubmit);
  }

  // Setup password validation feedback
  setupPasswordValidation();
}

// Form Visibility Management
function showLoginForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  if (loginForm) loginForm.style.display = 'block';
  if (signupForm) signupForm.style.display = 'none';
  clearFormErrors();
}

function showSignupForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  if (loginForm) loginForm.style.display = 'none';
  if (signupForm) signupForm.style.display = 'block';
  clearFormErrors();
}

// Password Visibility Toggle
function setupPasswordToggles() {
  const toggles = document.querySelectorAll('.password-toggle');
  
  toggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const input = this.parentElement.querySelector('input');
      
      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '👁️‍🗨️';
        this.setAttribute('aria-label', 'Hide password');
      } else {
        input.type = 'password';
        this.textContent = '👁️';
        this.setAttribute('aria-label', 'Show password');
      }
    });
  });
}

// Password Validation
function setupPasswordValidation() {
  const passwordInput = document.getElementById('signup-password');
  
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      validatePasswordRequirements(this.value);
    });
  }
}

function validatePasswordRequirements(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password)
  };

  // Update UI
  updateRequirement('req-length', requirements.length);
  updateRequirement('req-uppercase', requirements.uppercase);
  updateRequirement('req-number', requirements.number);

  return requirements.length && requirements.uppercase && requirements.number;
}

function updateRequirement(id, met) {
  const element = document.getElementById(id);
  if (element) {
    if (met) {
      element.classList.add('met');
    } else {
      element.classList.remove('met');
    }
  }
}

// Login Handler
function handleLoginSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;

  // Validate inputs
  let hasError = false;

  if (!username) {
    showError('login-username-error', 'Username is required');
    hasError = true;
  }

  if (!password) {
    showError('login-password-error', 'Password is required');
    hasError = true;
  }

  if (hasError) return;

  // Check credentials (comparing with admin account)
  if (username === ADMIN_CREDENTIALS.username && 
      password === ADMIN_CREDENTIALS.password) {
    // Login successful
    loginUser({
      username: username,
      role: 'admin',
      loginTime: new Date().toISOString()
    }, remember);
  } else {
    // Check user database for registered accounts
    const users = getUsersFromStorage();
    const user = users.find(u => u.username === username && u.password === hashPassword(password));

    if (user) {
      loginUser({
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: 'user',
        loginTime: new Date().toISOString()
      }, remember);
    } else {
      showError('login-username-error', 'Invalid username or password');
      addErrorClass('login-username');
      addErrorClass('login-password');
    }
  }
}

// Signup Handler
function handleSignupSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const fullname = document.getElementById('signup-fullname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const terms = document.getElementById('signup-terms').checked;

  // Validate inputs
  let hasError = false;

  if (!fullname) {
    showError('signup-fullname-error', 'Full name is required');
    hasError = true;
  }

  if (!email || !isValidEmail(email)) {
    showError('signup-email-error', 'Valid email is required');
    hasError = true;
  }

  if (!username || username.length < 3) {
    showError('signup-username-error', 'Username must be at least 3 characters');
    hasError = true;
  }

  // Check if username already exists
  const users = getUsersFromStorage();
  if (users.some(u => u.username === username)) {
    showError('signup-username-error', 'Username already taken');
    hasError = true;
  }

  if (!validatePasswordRequirements(password)) {
    showError('signup-password-error', 'Password does not meet requirements');
    hasError = true;
  }

  if (password !== confirmPassword) {
    showError('signup-confirm-error', 'Passwords do not match');
    hasError = true;
  }

  if (!terms) {
    showError('signup-terms-error', 'You must agree to the terms');
    hasError = true;
  }

  if (hasError) return;

  // Create new user
  const newUser = {
    id: generateUserId(),
    fullname: fullname,
    email: email,
    username: username,
    password: hashPassword(password), // Store hashed password
    createdAt: new Date().toISOString()
  };

  // Add to storage
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Show success message
  const successMessage = document.getElementById('signup-success');
  if (successMessage) {
    successMessage.style.display = 'block';
  }

  // Redirect to login after delay
  setTimeout(function() {
    showLoginForm();
    document.getElementById('login-username').value = username;
    document.getElementById('login-username').focus();
  }, 1500);
}

// Login User Session
function loginUser(userData, rememberMe) {
  const authData = {
    isLoggedIn: true,
    user: userData,
    loginTime: new Date().toISOString()
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

  if (rememberMe) {
    localStorage.setItem('remember_me', 'true');
  }

  // Show success message
  const successMessage = document.getElementById('login-success');
  if (successMessage) {
    successMessage.style.display = 'block';
  }

  // Redirect to dashboard
  setTimeout(function() {
    redirectToDashboard();
  }, 1000);
}

// Redirect to Home Page
function redirectToDashboard() {
  // Redirect to home page after successful login
  window.location.href = 'home.html';
}

// Check if User is Logged In
function isUserLoggedIn() {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return false;

  try {
    const data = JSON.parse(authData);
    return data.isLoggedIn === true;
  } catch {
    return false;
  }
}

// Logout User
function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem('remember_me');
  window.location.href = 'login.html';
}

// Get Current User
function getCurrentUser() {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) return null;

  try {
    const data = JSON.parse(authData);
    return data.user;
  } catch {
    return null;
  }
}

// Helper Functions

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.add('show');
  }
}

function addErrorClass(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.classList.add('error');
  }
}

function clearFormErrors() {
  const errors = document.querySelectorAll('.error-message');
  errors.forEach(error => {
    error.classList.remove('show');
    error.textContent = '';
  });

  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.classList.remove('error');
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simple hashing function (for demonstration - use bcrypt in production)
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// User Storage Management
function getUsersFromStorage() {
  const usersData = localStorage.getItem(USERS_STORAGE_KEY);
  if (!usersData) return [];

  try {
    return JSON.parse(usersData);
  } catch {
    return [];
  }
}

function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Export for use in other pages
window.LinguaSignAuth = {
  isLoggedIn: isUserLoggedIn,
  getCurrentUser: getCurrentUser,
  logout: logoutUser,
  login: loginUser
};
