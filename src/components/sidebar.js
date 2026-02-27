// ========================================
// COMPONENT: Sidebar Navigation
// ========================================

import Store from '../data/store.js';
import { ENTITIES } from '../data/models.js';
import { getCurrentUser, isPartner } from '../data/permissions.js';
import { closeMobileSidebar } from '../main.js';

export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const user = getCurrentUser();

  // Count open actions and deadlines for badges
  const openActions = Store.count(ENTITIES.ACTIONS, a => a.status !== 'مكتمل');
  const openDeadlines = Store.count(ENTITIES.DEADLINES, d => d.status === 'مفتوح');

  sidebar.innerHTML = `
    <div class="sidebar-logo flex flex-col items-center gap-2">
      <img src="/logo-transparent.png" alt="Saryia Logo" style="width: 120px; margin-bottom: -10px;" />
      <h2 style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--accent-primary);">مكتب سرية للمحاماه</h2>
      <div class="logo-sub">نظام إدارة القضايا</div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="sidebar-section">
        <div class="sidebar-section-title">الرئيسية</div>
        <button class="sidebar-link active" data-route="/dashboard" onclick="window.location.hash='/dashboard'">
          <span class="icon"><i class='bx bxs-dashboard'></i></span>
          لوحة التحكم
        </button>
      </div>
      
      <div class="sidebar-section">
        <div class="sidebar-section-title">إدارة القضايا</div>
        <button class="sidebar-link" data-route="/clients" onclick="window.location.hash='/clients'">
          <span class="icon"><i class='bx bxs-group'></i></span>
          العملاء
        </button>
        <button class="sidebar-link" data-route="/cases" onclick="window.location.hash='/cases'">
          <span class="icon"><i class='bx bxs-folder-open'></i></span>
          القضايا
        </button>
        <button class="sidebar-link" data-route="/calendar" onclick="window.location.hash='/calendar'">
          <span class="icon"><i class='bx bxs-calendar'></i></span>
          التقويم
        </button>
        <button class="sidebar-link" data-route="/actions" onclick="window.location.hash='/actions'">
          <span class="icon"><i class='bx bxs-zap'></i></span>
          الإجراءات
          ${openActions > 0 ? `<span class="badge">${openActions}</span>` : ''}
        </button>
        <button class="sidebar-link" data-route="/deadlines" onclick="window.location.hash='/deadlines'">
          <span class="icon"><i class='bx bxs-time'></i></span>
          المواعيد النهائية
          ${openDeadlines > 0 ? `<span class="badge">${openDeadlines}</span>` : ''}
        </button>
      </div>
      
      ${isPartner() ? `
      <div class="sidebar-section">
        <div class="sidebar-section-title">الإدارة</div>
        <button class="sidebar-link" data-route="/admin/mapping" onclick="window.location.hash='/admin/mapping'">
          <span class="icon"><i class='bx bx-git-git-branch'></i></span>
          ربط القرارات
        </button>
        <button class="sidebar-link" data-route="/admin/users" onclick="window.location.hash='/admin/users'">
          <span class="icon"><i class='bx bxs-user-detail'></i></span>
          المستخدمون
        </button>
        <button class="sidebar-link" data-route="/admin/audit" onclick="window.location.hash='/admin/audit'">
          <span class="icon"><i class='bx bx-list-check'></i></span>
          سجل المراجعة
        </button>
        <button class="sidebar-link" data-route="/admin/settings" onclick="window.location.hash='/admin/settings'">
          <span class="icon"><i class='bx bxs-cog'></i></span>
          إعدادات النظام
        </button>
      </div>
      ` : ''}
    </nav>
    
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">${user ? user.name.charAt(0) : '?'}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user ? user.name : 'مستخدم'}</div>
        <div class="sidebar-user-role">${user ? user.role : ''}</div>
      </div>
    </div>
  `;
  // Close sidebar on mobile when a link is clicked
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });
}

export default { renderSidebar };
