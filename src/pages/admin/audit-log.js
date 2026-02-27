// ========================================
// PAGE: Audit Log (Admin)
// ========================================

import { setPageTitle, formatDate } from '../../main.js';
import { getRecentAudit, formatAuditAction } from '../../data/audit.js';
import { isPartner } from '../../data/permissions.js';

export function renderAuditLog(container) {
    setPageTitle('سجل المراجعة');

    if (!isPartner()) {
        container.innerHTML = '<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';
        return;
    }

    const logs = getRecentAudit(100);

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bx-list-check'></i> سجل المراجعة</h1>
          <div class="page-header-sub">آخر ${logs.length} عملية</div>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>المستخدم</th>
              <th>العملية</th>
              <th>الكيان</th>
              <th>معرف الكيان</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? `<tr><td colspan="5"><div class="empty-state"><p>لا توجد عمليات مسجلة</p></div></td></tr>` : ''}
            ${logs.map(log => {
        const entityLabel = {
            'clients': 'عميل',
            'cases': 'قضية',
            'sessions': 'جلسة',
            'actions': 'إجراء',
            'deadlines': 'موعد نهائي',
            'users': 'مستخدم',
            'decision_map': 'ربط قرار'
        }[log.entityType] || log.entityType;

        const time = new Date(log.timestamp);
        const timeStr = time.toLocaleString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        return `
                <tr>
                  <td class="text-sm">${timeStr}</td>
                  <td>${log.userName || '—'}</td>
                  <td><span class="badge badge-${log.action === 'create' ? 'open' : log.action === 'delete' ? 'blocked' : 'progress'}">${formatAuditAction(log.action)}</span></td>
                  <td>${entityLabel}</td>
                  <td class="text-xs" style="font-family: monospace; color: var(--text-tertiary);">${log.entityId ? log.entityId.substr(0, 12) : '—'}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export default { renderAuditLog };
