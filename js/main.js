/**
 * main.js - Global App Configuration and UI Utilities
 * Integrates Dark Mode toggles, AOS scroll animations, Loading indicators, and Toast helpers.
 */

// Initialize global options
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize AOS (Animate on Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quad'
    });
  }

  // 2. Initialize Dark Mode Switcher
  ThemeManager.init();

  // 3. Set Active Sidebar/Navbar indicator
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.includes(href)) {
      link.classList.add('active');
    }
  });

  // 4. Initialize Bootstraps Tooltips if any exist
  if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
});

// Toast notification wrapper using SweetAlert2
const Toast = {
  success(message) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  },
  error(message) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true
    });
  },
  info(message) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
};

// Theme Management System
const ThemeManager = {
  themeKey: 'web_psikotes_dark_mode',

  init() {
    const themeToggleBtn = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem(this.themeKey) === 'true';

    // Apply saved theme preference
    this.setTheme(isDark);

    if (themeToggleBtn) {
      // Sync checkbox or button icon state
      themeToggleBtn.checked = isDark;
      
      themeToggleBtn.addEventListener('change', (e) => {
        const checkState = e.target.checked;
        this.setTheme(checkState);
      });
    }
  },

  setTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-mode');
      localStorage.setItem(this.themeKey, 'true');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-mode');
      localStorage.setItem(this.themeKey, 'false');
    }
  }
};

// Loading overlay control
const Loader = {
  show() {
    let loader = document.getElementById('app-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'app-loader';
      loader.innerHTML = `
        <div class="loader-spinner">
          <div class="spinner-border text-primary" role="status"></div>
          <span class="mt-2 text-white fw-bold">Memuat...</span>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.add('active');
  },
  hide() {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.remove('active');
    }
  }
};
