// ========================================
// PAGE: Dashboard
// ========================================

import Store from '../data/store.js';
import { ENTITIES, CASE_STATUS_BADGE, ACTION_STATUS_BADGE, CASE_TYPES_EN } from '../data/models.js';
import { setPageTitle, formatDate, daysUntil, isOverdue } from '../main.js';
import { getCurrentUser, getUserRoleKey } from '../data/permissions.js';

export function renderDashboard(container) {
    setPageTitle('لوحة التحكم');

    const currentUser = getCurrentUser();
    const roleKey = currentUser ? getUserRoleKey(currentUser) : null;
    const isRestrictedView = roleKey === 'lawyer' || roleKey === 'trainee';

    const cases = Store.getAll(ENTITIES.CASES);
    const sessions = Store.getAll(ENTITIES.SESSIONS);
    // For restricted roles: only show actions assigned to this user
    let actions = Store.getAll(ENTITIES.ACTIONS);
    if (isRestrictedView && currentUser) {
        actions = actions.filter(a => a.responsibleUserId === currentUser.id);
    }
    const deadlines = Store.getAll(ENTITIES.DEADLINES);
    const clients = Store.getAll(ENTITIES.CLIENTS);

    // Stats
    const activeCases = cases.filter(c => c.status === 'نشطة').length;
    const openActions = actions.filter(a => a.status !== 'مكتمل').length;
    const openDeadlines = deadlines.filter(d => d.status === 'مفتوح').length;

    // Upcoming sessions (next 7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const upcomingSessions = sessions
        .filter(s => {
            if (!s.nextSessionDate) return false;
            const d = new Date(s.nextSessionDate);
            return d >= today && d <= in7Days;
        })
        .sort((a, b) => new Date(a.nextSessionDate) - new Date(b.nextSessionDate));

    // Also include cases with first session in next 7 days that have no sessions yet
    const casesWithUpcoming = cases.filter(c => {
        if (!c.firstSessionDate) return false;
        const d = new Date(c.firstSessionDate);
        return d >= today && d <= in7Days;
    });

    // Open actions grouped by type
    const actionsByType = {};
    actions.filter(a => a.status !== 'مكتمل').forEach(a => {
        if (!actionsByType[a.actionType]) actionsByType[a.actionType] = [];
        actionsByType[a.actionType].push(a);
    });

    // Risk flags
    const risks = [];

    // Sessions within 3 days with open required actions
    upcomingSessions.forEach(s => {
        const d = daysUntil(s.nextSessionDate);
        if (d <= 3) {
            const sessionActions = actions.filter(a => a.sessionId === s.id && a.status !== 'مكتمل');
            if (sessionActions.length > 0) {
                const caseData = Store.getById(ENTITIES.CASES, s.caseId);
                risks.push({
                    level: 'high',
                    icon: "<i class='bx bxs-circle'></i>",
                    text: `جلسة خلال ${d} أيام مع ${sessionActions.length} إجراء مفتوح – القضية ${caseData ? caseData.caseNo : ''}/${caseData ? caseData.year : ''}`
                });
            }
        }
    });

    // Open detention actions
    actions.filter(a => a.actionType === 'حضور تجديد حبس' && a.status !== 'مكتمل').forEach(a => {
        const caseData = Store.getById(ENTITIES.CASES, a.caseId);
        risks.push({
            level: 'high',
            icon: "<i class='bx bxs-bell-ring'></i>",
            text: `إجراء حبس احتياطي مفتوح – القضية ${caseData ? caseData.caseNo : ''}/${caseData ? caseData.year : ''}`
        });
    });

    // Overdue actions
    actions.filter(a => a.status !== 'مكتمل' && a.dueDate && isOverdue(a.dueDate)).forEach(a => {
        const caseData = Store.getById(ENTITIES.CASES, a.caseId);
        risks.push({
            level: 'medium',
            icon: "<i class='bx bx-error'></i>",
            text: `إجراء متأخر: ${a.actionType} – القضية ${caseData ? caseData.caseNo : ''}/${caseData ? caseData.year : ''}`
        });
    });

    // Overdue deadlines
    deadlines.filter(d => d.status === 'مفتوح' && d.endDate && isOverdue(d.endDate)).forEach(d => {
        const caseData = Store.getById(ENTITIES.CASES, d.caseId);
        risks.push({
            level: 'high',
            icon: "<i class='bx bxs-circle'></i>",
            text: `موعد نهائي متأخر: ${d.deadlineType} – القضية ${caseData ? caseData.caseNo : ''}/${caseData ? caseData.year : ''}`
        });
    });

    container.innerHTML = `
    <div class="animate-fade-in">
      <!-- Stats Cards -->
      <div class="dashboard-stats">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${activeCases}</div>
              <div class="card-label">قضايا نشطة</div>
            </div>
            <div class="card-icon green"><i class='bx bxs-folder-open'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${openActions}</div>
              <div class="card-label">إجراءات مفتوحة</div>
            </div>
            <div class="card-icon amber"><i class='bx bxs-zap'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${openDeadlines}</div>
              <div class="card-label">مواعيد نهائية</div>
            </div>
            <div class="card-icon red"><i class='bx bxs-time'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${clients.length}</div>
              <div class="card-label">العملاء</div>
            </div>
            <div class="card-icon blue"><i class='bx bxs-group'></i></div>
          </div>
        </div>
      </div>
      
      <!-- Risk Flags -->
      ${risks.length > 0 ? `
        <div class="widget widget-full-width mb-6">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-flag'></i> تنبيهات المخاطر</div>
            <span class="badge badge-blocked">${risks.length}</span>
          </div>
          <div class="widget-body">
            <div class="risk-flags-container">
              ${risks.map(r => `
                <div class="risk-flag ${r.level}">
                  <span class="risk-icon">${r.icon}</span>
                  <span>${r.text}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}
      
      <!-- Widgets Grid -->
      <div class="dashboard-widgets">
        <!-- Upcoming Sessions -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-calendar'></i> الجلسات القادمة (7 أيام)</div>
            <span class="badge badge-open">${upcomingSessions.length + casesWithUpcoming.length}</span>
          </div>
          <div class="widget-body">
            ${(upcomingSessions.length + casesWithUpcoming.length) === 0 ? `
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد جلسات قادمة</p>
              </div>
            ` : ''}
            ${casesWithUpcoming.map(c => {
        const client = Store.getById(ENTITIES.CLIENTS, c.clientId);
        const d = daysUntil(c.firstSessionDate);
        return `
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${c.caseNo}/${c.year}</div>
                    <div class="widget-item-sub">${client ? client.name : ''} – ${c.subject}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${d <= 1 ? 'text-accent' : ''}">${formatDate(c.firstSessionDate)}</div>
                    <div class="text-xs ${d <= 1 ? 'text-accent' : 'text-secondary'}">${d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} أيام`}</div>
                  </div>
                </div>
              `;
    }).join('')}
            ${upcomingSessions.map(s => {
        const caseData = Store.getById(ENTITIES.CASES, s.caseId);
        const d = daysUntil(s.nextSessionDate);
        return `
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${s.caseId}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${caseData ? caseData.caseNo + '/' + caseData.year : ''}</div>
                    <div class="widget-item-sub">${s.decisionResult} → ${s.sessionType}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${d <= 1 ? 'text-accent' : ''}">${formatDate(s.nextSessionDate)}</div>
                    <div class="text-xs ${d <= 1 ? 'text-accent' : 'text-secondary'}">${d === 0 ? 'اليوم' : d === 1 ? 'غداً' : `خلال ${d} أيام`}</div>
                  </div>
                </div>
              `;
    }).join('')}
          </div>
        </div>
        
        <!-- Open Actions by Type -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-zap'></i> الإجراءات المفتوحة</div>
            <span class="badge badge-progress">${openActions}</span>
          </div>
          <div class="widget-body">
            ${Object.keys(actionsByType).length === 0 ? `
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد إجراءات مفتوحة</p>
              </div>
            ` : ''}
            ${Object.entries(actionsByType).map(([type, acts]) => `
              <div class="widget-item">
                <div class="widget-item-info">
                  <div class="widget-item-title">${type}</div>
                  <div class="widget-item-sub">${acts.length} إجراء</div>
                </div>
                <span class="badge badge-progress">${acts.length}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Open Deadlines -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-time'></i> المواعيد النهائية</div>
            <span class="badge badge-blocked">${openDeadlines}</span>
          </div>
          <div class="widget-body">
            ${deadlines.filter(d => d.status === 'مفتوح').length === 0 ? `
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد مواعيد نهائية مفتوحة</p>
              </div>
            ` : ''}
            ${deadlines
            .filter(d => d.status === 'مفتوح')
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
            .map(d => {
                const caseData = Store.getById(ENTITIES.CASES, d.caseId);
                const days = daysUntil(d.endDate);
                const overdueClass = days < 0 ? 'badge-blocked' : days <= 3 ? 'badge-progress' : 'badge-open';
                return `
                  <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${d.caseId}'">
                    <div class="widget-item-info">
                      <div class="widget-item-title">${d.deadlineType}</div>
                      <div class="widget-item-sub">القضية ${caseData ? caseData.caseNo + '/' + caseData.year : ''}</div>
                    </div>
                    <div>
                      <div class="widget-item-date">${formatDate(d.endDate)}</div>
                      <span class="badge ${overdueClass}">${days < 0 ? 'متأخر' : days === 0 ? 'اليوم' : `${days} يوم`}</span>
                    </div>
                  </div>
                `;
            }).join('')}
          </div>
        </div>
        
        <!-- Recent Cases -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-folder-open'></i> آخر القضايا</div>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases'">عرض الكل ←</button>
          </div>
          <div class="widget-body">
            ${cases.slice(-5).reverse().map(c => {
                const client = Store.getById(ENTITIES.CLIENTS, c.clientId);
                const typeClass = CASE_TYPES_EN[c.caseType] || 'civil';
                return `
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">${c.caseNo}/${c.year} – ${c.subject}</div>
                    <div class="widget-item-sub">${client ? client.name : ''}</div>
                  </div>
                  <span class="badge badge-${typeClass}">${c.caseType}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export default { renderDashboard };
