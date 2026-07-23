/**
 * auth.js - Admin Authentication and Access Guards
 * Handles admin session checks using localStorage, login and logout controls.
 */

const AUTH_KEYS = {
  ADMIN_SESSION: 'web_psikotes_admin_session'
};

const AuthManager = {
  /**
   * Attempt admin login
   * @param {string} username 
   * @param {string} password 
   * @returns {boolean} login result
   */
  login(username, password) {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem(AUTH_KEYS.ADMIN_SESSION, JSON.stringify({
        loggedIn: true,
        timestamp: new Date().getTime(),
        username: username
      }));
      return true;
    }
    return false;
  },

  /**
   * Log out admin
   */
  logout() {
    localStorage.removeItem(AUTH_KEYS.ADMIN_SESSION);
    // Redirect to login page
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin/')) {
      window.location.href = 'login.html';
    } else {
      window.location.href = 'admin/login.html';
    }
  },

  /**
   * Check if admin is currently logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    const sessionStr = localStorage.getItem(AUTH_KEYS.ADMIN_SESSION);
    if (!sessionStr) return false;
    
    try {
      const session = JSON.parse(sessionStr);
      // Optional session expiry (e.g. 2 hours)
      const now = new Date().getTime();
      const expiry = 2 * 60 * 60 * 1000; // 2 hours
      if (now - session.timestamp > expiry) {
        this.logout();
        return false;
      }
      return session.loggedIn === true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Protect admin routes
   */
  guardAdminRoute() {
    const isLoginScreen = window.location.pathname.endsWith('login.html');
    const loggedIn = this.isLoggedIn();

    if (!loggedIn && !isLoginScreen) {
      // Not logged in and trying to access dashboard/result, redirect to login
      // Resolve path depending on where we are
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = 'login.html';
      } else {
        window.location.href = 'admin/login.html';
      }
    } else if (loggedIn && isLoginScreen) {
      // Already logged in and visiting login page, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  }
};

// Automatically execute route guard when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  // If path contains /admin/, apply route guard
  if (window.location.pathname.includes('/admin/')) {
    AuthManager.guardAdminRoute();
  }
});
