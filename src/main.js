// ========================================
// MAIN APP ENTRY POINT
// ========================================

import { registerRoute, initRouter, navigate } from './router.js';
import { seedIfEmpty } from './data/seed.js';
import { getCurrentUser, setCurrentUser } from './data/permissions.js';
import Store from './data/store.js';
import { ENTITIES } from './data/models.js';
import { renderSidebar } from './components/sidebar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderClientList } from './pages/clients/client-list.js';
import { renderClientForm } from './pages/clients/client-form.js';
import { renderCaseList } from './pages/cases/case-list.js';
import { renderCaseForm } from './pages/cases/case-form.js';
import { renderCaseDetail } from './pages/cases/case-detail.js';
import { renderActionList } from './pages/actions/action-list.js';
import { renderDeadlineList } from './pages/deadlines/deadline-list.js';
import { renderDecisionMapping } from './pages/admin/decision-mapping.js';
import { renderUserManagement } from './pages/admin/users.js';
import { renderAuditLog } from './pages/admin/audit-log.js';
import { renderAdminSettings } from './pages/admin/settings.js';
import { renderCalendar } from './pages/calendar/calendar.js';
import { initNotificationEngine } from './components/notification.js';

// Initialize
function init() {
  // Seed demo data
  seedIfEmpty();

  // Ensure current user
  let user = getCurrentUser();
  if (!user) {
    const users = Store.getAll(ENTITIES.USERS);
    if (users.length > 0) {
      setCurrentUser(users[0]);
    }
  }

  // Render sidebar
  renderSidebar();

  // Inject mobile sidebar overlay
  injectSidebarOverlay();

  // Inject bottom nav for mobile
  injectBottomNav();

  // Register routes
  registerRoute('/', renderDashboard);
  registerRoute('/dashboard', renderDashboard);
  registerRoute('/clients', renderClientList);
  registerRoute('/clients/new', renderClientForm);
  registerRoute('/clients/:id/edit', renderClientForm);
  registerRoute('/cases', renderCaseList);
  registerRoute('/cases/new', renderCaseForm);
  registerRoute('/cases/:id', renderCaseDetail);
  registerRoute('/cases/:id/edit', renderCaseForm);
  registerRoute('/actions', renderActionList);
  registerRoute('/deadlines', renderDeadlineList);
  registerRoute('/calendar', renderCalendar);
  registerRoute('/admin/mapping', renderDecisionMapping);
  registerRoute('/admin/users', renderUserManagement);
  registerRoute('/admin/audit', renderAuditLog);
  registerRoute('/admin/settings', renderAdminSettings);

  // Render topbar
  renderTopbar();

  // Start router
  initRouter();

  // Update bottom nav active state on each route
  window.addEventListener('hashchange', () => {
    updateBottomNavActive(window.location.hash.replace('#', '') || '/dashboard');
  });

  // Start notification engine
  initNotificationEngine();

  // Default to dashboard
  if (!window.location.hash || window.location.hash === '#') {
    navigate('/dashboard');
  }
}

function renderTopbar() {
  const topbar = document.getElementById('topbar');
  const user = getCurrentUser();

  topbar.innerHTML = `
    <div class="topbar-start">
      <button class="hamburger-btn" id="mobile-menu-btn" aria-label="فتح القائمة">
        <span></span><span></span><span></span>
      </button>
      <div class="topbar-title" id="topbar-page-title">لوحة التحكم</div>
    </div>
    <div class="topbar-actions">
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary topbar-username">${user ? user.name : ''}</span>
        <select id="user-switcher" class="filter-select" style="min-width: 120px; font-size: var(--text-xs);">
          ${Store.getAll(ENTITIES.USERS).map(u =>
    `<option value="${u.id}" ${user && user.id === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`
  ).join('')}
        </select>
      </div>
    </div>
  `;

  // User switcher
  topbar.querySelector('#user-switcher').addEventListener('change', (e) => {
    const selectedUser = Store.getById(ENTITIES.USERS, e.target.value);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      location.reload();
    }
  });

  // Mobile hamburger
  const menuBtn = document.getElementById('mobile-menu-btn');
  menuBtn.addEventListener('click', toggleMobileSidebar);
}

// ---- Mobile sidebar helpers ----
export function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('open');
    overlay && overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  sidebar.classList.remove('open');
  overlay && overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function injectSidebarOverlay() {
  if (document.getElementById('sidebar-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  overlay.className = 'sidebar-overlay';
  overlay.addEventListener('click', closeMobileSidebar);
  document.getElementById('app').appendChild(overlay);
}

function injectBottomNav() {
  if (document.getElementById('bottom-nav')) return;
  const openActions = Store.count(ENTITIES.ACTIONS, a => a.status !== 'مكتمل');
  const nav = document.createElement('nav');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';
  nav.innerHTML = `
    <button class="bottom-nav-item" data-route="/dashboard" onclick="window.location.hash='/dashboard'">
      <span class="bn-icon"><i class='bx bxs-dashboard'></i></span>
      لوحة التحكم
    </button>
    <button class="bottom-nav-item" data-route="/cases" onclick="window.location.hash='/cases'">
      <span class="bn-icon"><i class='bx bxs-folder-open'></i></span>
      القضايا
    </button>
    <button class="bottom-nav-item" data-route="/clients" onclick="window.location.hash='/clients'">
      <span class="bn-icon"><i class='bx bxs-group'></i></span>
      العملاء
    </button>
    <button class="bottom-nav-item" data-route="/actions" onclick="window.location.hash='/actions'">
      <span class="bn-icon"><i class='bx bxs-zap'></i></span>
      ${openActions > 0 ? `<span class="bn-badge">${openActions}</span>` : ''}
      الإجراءات
    </button>
    <button class="bottom-nav-item" data-route="/calendar" onclick="window.location.hash='/calendar'">
      <span class="bn-icon"><i class='bx bxs-calendar'></i></span>
      التقويم
    </button>
  `;
  document.getElementById('app').appendChild(nav);
  updateBottomNavActive(window.location.hash.replace('#', '') || '/dashboard');
}

function updateBottomNavActive(route) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.querySelectorAll('.bottom-nav-item').forEach(btn => {
    const r = btn.dataset.route;
    btn.classList.toggle('active', route === r || (r !== '/' && route.startsWith(r)));
  });
}


// Page title updater
export function setPageTitle(title) {
  const el = document.getElementById('topbar-page-title');
  if (el) el.textContent = title;
}

// Utility: format date for display
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateStr) {
  return daysUntil(dateStr) < 0;
}

// Start app
document.addEventListener('DOMContentLoaded', init);
