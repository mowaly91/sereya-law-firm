// ========================================
// PAGE: Deadlines List (Global View)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, DEADLINE_TYPES, DEADLINE_STATUS_BADGE } from '../../data/models.js';
import { setPageTitle, formatDate, daysUntil, isOverdue } from '../../main.js';

export function renderDeadlineList(container) {
    setPageTitle('المواعيد النهائية');

    const deadlines = Store.getAll(ENTITIES.DEADLINES);

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-time'></i> المواعيد النهائية</h1>
          <div class="page-header-sub">${deadlines.filter(d => d.status === 'مفتوح').length} موعد مفتوح</div>
        </div>
      </div>
      
      <div class="filter-bar">
        <select class="filter-select" id="filter-dl-type">
          <option value="">كل الأنواع</option>
          ${DEADLINE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-dl-status">
          <option value="">كل الحالات</option>
          <option value="مفتوح">مفتوح</option>
          <option value="مكتمل">مكتمل</option>
          <option value="منتهي">منتهي</option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>النوع</th>
              <th>القضية</th>
              <th>من</th>
              <th>إلى</th>
              <th>المتبقي</th>
              <th>المسؤول</th>
              <th>الحالة</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody id="dl-table-body">
          </tbody>
        </table>
      </div>
    </div>
  `;

    function renderRows() {
        const typeFilter = document.getElementById('filter-dl-type').value;
        const statusFilter = document.getElementById('filter-dl-status').value;

        let filtered = deadlines;
        if (typeFilter) filtered = filtered.filter(d => d.deadlineType === typeFilter);
        if (statusFilter) filtered = filtered.filter(d => d.status === statusFilter);

        filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

        const tbody = document.getElementById('dl-table-body');

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><p>لا توجد مواعيد نهائية</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(d => {
            const caseData = Store.getById(ENTITIES.CASES, d.caseId);
            const responsible = Store.getById(ENTITIES.USERS, d.responsibleUserId);
            const badgeClass = DEADLINE_STATUS_BADGE[d.status] || 'open';
            const days = daysUntil(d.endDate);
            const overdue = d.status === 'مفتوح' && days < 0;
            const approaching = d.status === 'مفتوح' && days >= 0 && days <= 3;

            return `
        <tr class="${overdue ? 'risk-flag high' : approaching ? 'risk-flag medium' : ''}">
          <td><strong>${d.deadlineType}</strong></td>
          <td>
            <a href="#/cases/${d.caseId}" style="color: var(--text-link);">
              ${caseData ? caseData.caseNo + '/' + caseData.year : '—'}
            </a>
          </td>
          <td>${formatDate(d.startDate)}</td>
          <td>${formatDate(d.endDate)}</td>
          <td>
            ${d.status === 'مفتوح' ? (
                    overdue ? `<span class="badge badge-blocked">متأخر ${Math.abs(days)} يوم</span>` :
                        days === 0 ? '<span class="badge badge-progress">اليوم!</span>' :
                            `<span class="badge ${approaching ? 'badge-progress' : 'badge-open'}">${days} يوم</span>`
                ) : '—'}
          </td>
          <td>${responsible ? responsible.name : '—'}</td>
          <td><span class="badge badge-${badgeClass}">${d.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${d.caseId}'">عرض ←</button>
          </td>
        </tr>
      `;
        }).join('');
    }

    renderRows();

    document.getElementById('filter-dl-type').addEventListener('change', renderRows);
    document.getElementById('filter-dl-status').addEventListener('change', renderRows);
}

export default { renderDeadlineList };
