/**
 * auth.js - Admin & Candidate Authentication and Access Guards
 * Handles admin and candidate session checks using localStorage, login and logout controls.
 */

const AUTH_KEYS = {
  ADMIN_SESSION: 'web_psikotes_admin_session',
  CANDIDATE_SESSION: 'web_psikotes_candidate_session'
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
      if (window.location.pathname.includes('/admin/')) {
        window.location.href = 'login.html';
      } else {
        window.location.href = 'admin/login.html';
      }
    } else if (loggedIn && isLoginScreen) {
      // Already logged in and visiting login page, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  },

  /**
   * Attempt candidate login
   * @param {string} email 
   * @param {string} password 
   * @returns {Object} { success: boolean, message: string }
   */
  loginCandidate(email, password) {
    const candidates = StorageManager.getRegisteredCandidates();
    const candidate = candidates.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!candidate) {
      return { success: false, message: 'Email tidak terdaftar sebagai peserta!' };
    }

    if (candidate.password !== password) {
      return { success: false, message: 'Password salah!' };
    }

    if (candidate.status === 'completed') {
      return { success: false, message: 'Anda sudah menyelesaikan ujian psikotes ini!' };
    }

    // Set candidate session
    localStorage.setItem(AUTH_KEYS.CANDIDATE_SESSION, JSON.stringify({
      loggedIn: true,
      email: candidate.email,
      name: candidate.name,
      phone: candidate.phone,
      position: candidate.position,
      experience: candidate.experience,
      timestamp: new Date().getTime()
    }));

    // Update status to active
    StorageManager.updateCandidateStatus(candidate.email, 'active');

    return { success: true };
  },

  /**
   * Log out candidate
   */
  logoutCandidate() {
    localStorage.removeItem(AUTH_KEYS.CANDIDATE_SESSION);
    sessionStorage.removeItem('web_psikotes_current_candidate');
    sessionStorage.removeItem('web_psikotes_shuffled_questions');
    sessionStorage.removeItem('web_psikotes_candidate_answers');
    sessionStorage.removeItem('web_psikotes_timer_end');
    sessionStorage.removeItem('web_psikotes_test_started');
  },

  /**
   * Check if candidate is logged in
   * @returns {boolean}
   */
  isCandidateLoggedIn() {
    const sessionStr = localStorage.getItem(AUTH_KEYS.CANDIDATE_SESSION);
    if (!sessionStr) return false;

    try {
      const session = JSON.parse(sessionStr);
      const now = new Date().getTime();
      const expiry = 6 * 60 * 60 * 1000; // 6 hours
      if (now - session.timestamp > expiry) {
        this.logoutCandidate();
        return false;
      }
      return session.loggedIn === true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get current candidate details
   * @returns {Object|null}
   */
  getCandidateSession() {
    const sessionStr = localStorage.getItem(AUTH_KEYS.CANDIDATE_SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  },

  /**
   * Protect candidate routes (biodata.html and test.html)
   */
  guardCandidateRoute() {
    const isLoginScreen = window.location.pathname.endsWith('login.html');
    const loggedIn = this.isCandidateLoggedIn();

    if (!loggedIn && !isLoginScreen) {
      // Redirect to login if not logged in
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin/')) {
        window.location.href = '../login.html';
      } else {
        window.location.href = 'login.html';
      }
    } else if (loggedIn && isLoginScreen) {
      // Redirect to biodata if logged in
      window.location.href = 'biodata.html';
    }
  }
};

// Automatically execute route guard when the script is loaded
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('/admin/')) {
    AuthManager.guardAdminRoute();
  } else if (path.endsWith('biodata.html') || path.endsWith('test.html') || path.endsWith('login.html')) {
    AuthManager.guardCandidateRoute();
  }
});
