// Authentication Check - Enforce login on all pages
// This file must be included in all protected pages

(function() {
  // Check authentication before page fully loads
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Pages that don't require authentication
  const publicPages = ['login.html'];
  
  // Check if current page is public
  const isPublicPage = publicPages.includes(currentPage);
  
  // Check if index.html is accessed without authentication
  const isIndexPage = currentPage === '' || currentPage === '/' || currentPage === 'index.html';
  
  if (!isPublicPage) {
    // Check if user is logged in
    const authData = localStorage.getItem('linguasign_auth');
    
    if (!authData) {
      // Not logged in - redirect to login
      window.location.href = 'login.html';
    }
  }
  
  // Also run check after DOM loads for extra safety
  document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isPublicPage = publicPages.includes(currentPage) || currentPage === '' || currentPage === '/';
    
    if (!isPublicPage) {
      const authData = localStorage.getItem('linguasign_auth');
      
      if (!authData) {
        window.location.href = 'login.html';
      }
    }
    
    // Add logout button to header if user is logged in
    setupLogoutButton();
  });
  
  // Setup logout functionality
  function setupLogoutButton() {
    const authData = localStorage.getItem('linguasign_auth');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isPublicPage = ['login.html', ''].includes(currentPage) || currentPage === '' || currentPage === '/';
    
    if (authData && !isPublicPage) {
      // Parse auth data to get username
      try {
        const auth = JSON.parse(authData);
        const username = auth.username;
        
        // Get or create controls section in header
        let controls = document.querySelector('.controls');
        
        // If no controls section, create one
        if (!controls) {
          const headerInner = document.querySelector('.header-inner');
          if (headerInner) {
            controls = document.createElement('div');
            controls.className = 'controls';
            headerInner.appendChild(controls);
          }
        }
        
        if (controls) {
          // Clear existing content
          controls.innerHTML = '';
          
          // Add user info
          const userInfo = document.createElement('span');
          userInfo.className = 'user-info';
          userInfo.innerHTML = `<i class="fas fa-user"></i> ${username}`;
          controls.appendChild(userInfo);
          
          // Add theme toggle
          const themeToggle = document.createElement('button');
          themeToggle.className = 'btn-icon';
          themeToggle.id = 'theme-toggle';
          themeToggle.title = 'Toggle theme';
          themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
          themeToggle.onclick = function(e) {
            e.preventDefault();
            if (typeof toggleTheme === 'function') {
              toggleTheme();
            }
          };
          controls.appendChild(themeToggle);
          
          // Add logout button
          const logoutBtn = document.createElement('button');
          logoutBtn.className = 'btn-logout';
          logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
          logoutBtn.title = 'Logout';
          logoutBtn.onclick = function(e) {
            e.preventDefault();
            logout();
          };
          controls.appendChild(logoutBtn);
          
          // Add CSS for user-info and logout button if not already present
          if (!document.getElementById('auth-check-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-check-styles';
            style.textContent = `
              .user-info {
                display: inline-block;
                padding: 0 12px;
                margin: 0 8px;
                color: var(--text);
                font-size: 14px;
                font-weight: 500;
              }
              
              .btn-logout {
                padding: 8px 16px;
                background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
              }
              
              .btn-logout:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(255, 71, 87, 0.4);
                background: linear-gradient(135deg, #ff6348 0%, #ff4757 100%);
              }
              
              .btn-logout:active {
                transform: translateY(0);
              }
              
              @media (max-width: 768px) {
                .user-info {
                  display: none;
                }
                
                .btn-logout {
                  padding: 6px 12px;
                  font-size: 12px;
                }
              }
            `;
            document.head.appendChild(style);
          }
        }
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
  }
  
  // Logout function
  window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('linguasign_auth');
      localStorage.removeItem('linguasign_users');
      window.location.href = 'login.html';
    }
  };
  
  // Setup session timeout (optional - logout after 30 minutes of inactivity)
  let sessionTimeout;
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(function() {
      const authData = localStorage.getItem('linguasign_auth');
      if (authData) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('linguasign_auth');
        window.location.href = 'login.html';
      }
    }, SESSION_TIMEOUT);
  }
  
  // Reset timeout on user activity
  if (localStorage.getItem('linguasign_auth')) {
    document.addEventListener('mousemove', resetSessionTimeout);
    document.addEventListener('keypress', resetSessionTimeout);
    document.addEventListener('click', resetSessionTimeout);
    
    // Initial timeout setup
    resetSessionTimeout();
  }
})();
