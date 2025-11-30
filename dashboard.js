// Dashboard JavaScript
// Handles user dashboard functionality and personalization

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  if (!window.LinguaSignAuth || !window.LinguaSignAuth.isLoggedIn()) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }

  // Initialize dashboard
  initializeDashboard();
});

function initializeDashboard() {
  // Load and display user information
  loadUserInformation();
  
  // Load user statistics
  loadUserStatistics();
  
  // Setup logout button
  setupLogoutButton();
  
  // Load activity data
  loadActivityData();
}

// Load User Information
function loadUserInformation() {
  const user = window.LinguaSignAuth.getCurrentUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Update greeting
  const greeting = document.getElementById('user-greeting');
  if (greeting) {
    const userName = user.fullname || user.username || 'User';
    greeting.textContent = userName.split(' ')[0]; // First name only
  }

  // Update account information
  const fullname = document.getElementById('account-fullname');
  if (fullname) {
    fullname.textContent = user.fullname || 'N/A';
  }

  const username = document.getElementById('account-username');
  if (username) {
    username.textContent = user.username || 'N/A';
  }

  const email = document.getElementById('account-email');
  if (email) {
    email.textContent = user.email || 'Not provided';
  }

  const accountType = document.getElementById('account-type');
  if (accountType) {
    accountType.textContent = user.role === 'admin' ? 'Administrator' : 'Premium User';
  }

  const joined = document.getElementById('account-joined');
  if (joined) {
    const joinDate = new Date(user.loginTime).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    joined.textContent = joinDate;
  }
}

// Load User Statistics
function loadUserStatistics() {
  const stats = getUserStatistics();

  const translationCount = document.getElementById('translation-count');
  if (translationCount) {
    translationCount.textContent = stats.totalTranslations;
  }

  const dailyCount = document.getElementById('daily-count');
  if (dailyCount) {
    dailyCount.textContent = stats.thisWeek;
  }

  const accuracy = document.getElementById('accuracy');
  if (accuracy) {
    accuracy.textContent = stats.accuracy;
  }
}

// Get User Statistics from Storage
function getUserStatistics() {
  const user = window.LinguaSignAuth.getCurrentUser();
  const storageKey = `stats_${user.username}`;
  const statsData = localStorage.getItem(storageKey);

  if (!statsData) {
    // Initialize default stats
    const defaultStats = {
      totalTranslations: 0,
      thisWeek: 0,
      accuracy: 98
    };
    localStorage.setItem(storageKey, JSON.stringify(defaultStats));
    return defaultStats;
  }

  try {
    return JSON.parse(statsData);
  } catch {
    return {
      totalTranslations: 0,
      thisWeek: 0,
      accuracy: 98
    };
  }
}

// Update User Statistics
function updateUserStatistics(updates) {
  const user = window.LinguaSignAuth.getCurrentUser();
  const storageKey = `stats_${user.username}`;
  const currentStats = getUserStatistics();
  const newStats = { ...currentStats, ...updates };
  localStorage.setItem(storageKey, JSON.stringify(newStats));
  loadUserStatistics();
}

// Load Activity Data
function loadActivityData() {
  const user = window.LinguaSignAuth.getCurrentUser();
  const activityList = document.getElementById('activity-list');

  if (!activityList) return;

  // Create initial activity entry for login
  const loginTime = new Date(user.loginTime);
  const timeAgo = getTimeAgo(loginTime);

  // Clear existing content if empty state
  if (activityList.innerHTML.includes('empty-state')) {
    activityList.innerHTML = '';
  }

  // Add login activity if not already present
  if (!document.querySelector('[data-activity-type="login"]')) {
    const loginActivity = document.createElement('div');
    loginActivity.className = 'activity-item';
    loginActivity.setAttribute('data-activity-type', 'login');
    loginActivity.innerHTML = `
      <div class="activity-icon">✓</div>
      <div class="activity-content">
        <p class="activity-title">Signed in to dashboard</p>
        <span class="activity-time">${timeAgo}</span>
      </div>
    `;
    activityList.insertBefore(loginActivity, activityList.firstChild);
  }
}

// Get Time Ago String
function getTimeAgo(date) {
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  
  return date.toLocaleDateString();
}

// Setup Logout Button
function setupLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        window.LinguaSignAuth.logout();
      }
    });
  }
}

// Add Translation to History
function addTranslationToHistory(translationData) {
  const user = window.LinguaSignAuth.getCurrentUser();
  const historyKey = `history_${user.username}`;
  let history = [];

  const existingHistory = localStorage.getItem(historyKey);
  if (existingHistory) {
    try {
      history = JSON.parse(existingHistory);
    } catch {
      history = [];
    }
  }

  // Add new translation
  history.unshift({
    id: generateId(),
    ...translationData,
    timestamp: new Date().toISOString()
  });

  // Keep only last 50 translations
  history = history.slice(0, 50);

  localStorage.setItem(historyKey, JSON.stringify(history));

  // Update statistics
  const stats = getUserStatistics();
  updateUserStatistics({
    totalTranslations: stats.totalTranslations + 1,
    thisWeek: stats.thisWeek + 1
  });

  // Reload history display
  displayTranslationHistory();
}

// Display Translation History
function displayTranslationHistory() {
  const user = window.LinguaSignAuth.getCurrentUser();
  const historyKey = `history_${user.username}`;
  const historyList = document.getElementById('history-list');

  if (!historyList) return;

  const historyData = localStorage.getItem(historyKey);
  let translations = [];

  if (historyData) {
    try {
      translations = JSON.parse(historyData);
    } catch {
      translations = [];
    }
  }

  if (translations.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No translations yet. Start translating to see your history!</p>';
    return;
  }

  historyList.innerHTML = translations.map((translation, index) => `
    <div class="history-item" style="animation-delay: ${index * 0.1}s;">
      <div class="history-header">
        <span class="history-title">${translation.title || 'Untitled Translation'}</span>
        <span class="history-date">${getTimeAgo(new Date(translation.timestamp))}</span>
      </div>
      <p class="history-preview">${translation.input ? translation.input.substring(0, 100) + '...' : 'N/A'}</p>
      <div class="history-actions">
        <button class="btn-small" onclick="viewTranslation('${translation.id}')">View</button>
        <button class="btn-small" onclick="deleteTranslation('${translation.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Helper Functions

function generateId() {
  return 'trans_' + Math.random().toString(36).substr(2, 9);
}

function viewTranslation(translationId) {
  console.log('View translation:', translationId);
  // Implement view functionality
}

function deleteTranslation(translationId) {
  const user = window.LinguaSignAuth.getCurrentUser();
  const historyKey = `history_${user.username}`;
  let history = [];

  const existingHistory = localStorage.getItem(historyKey);
  if (existingHistory) {
    try {
      history = JSON.parse(existingHistory);
    } catch {
      history = [];
    }
  }

  history = history.filter(t => t.id !== translationId);
  localStorage.setItem(historyKey, JSON.stringify(history));
  displayTranslationHistory();
}

// Export functions for use in other pages
window.DashboardUtil = {
  addTranslation: addTranslationToHistory,
  updateStats: updateUserStatistics,
  getStats: getUserStatistics
};
