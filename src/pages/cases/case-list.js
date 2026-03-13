// ========================================
// PAGE: Case List
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, CASE_TYPES, CASE_STATUSES, CASE_STATUS_BADGE, CASE_TYPES_EN } from '../../data/models.js';
import { setPageTitle, formatDate } from '../../main.js';
import { can } from '../../data/permissions.js';

export function renderCaseList(container) {
    setPageTitle('القضايا');

    const cases = Store.getAll(ENTITIES.CASES);
    const clients = Store.getAll(ENTITIES.CLIENTS);
    const users = Store.getAll(ENTITIES.USERS);

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-folder-open'></i> القضايا</h1>
          <div class="page-header-sub">${cases.length} قضية</div>
        </div>
        ${can('createCase') ? `<button class="btn btn-primary" onclick="window.location.hash='/cases/new'"><i class='bx bx-plus'></i> إضافة قضية</button>` : ''}
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="case-search" placeholder="بحث برقم القضية أو اسم العميل أو الخصم..." />
        </div>
        <select class="filter-select" id="filter-type">
          <option value="">كل الأنواع</option>
          ${CASE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-status">
          <option value="">كل الحالات</option>
          ${CASE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>رقم القضية</th>
              <th>النوع</th>
              <th>العميل</th>
              <th>الخصم</th>
              <th>المحكمة</th>
              <th>الموضوع</th>
              <th>المرحلة</th>
              <th>الحالة</th>
              <th>المسؤول</th>
            </tr>
          </thead>
          <tbody id="case-table-body">
          </tbody>
        </table>
      </div>
    </div>
  `;

    function renderRows() {
        const search = document.getElementById('case-search').value.toLowerCase();
        const typeFilter = document.getElementById('filter-type').value;
        const statusFilter = document.getElementById('filter-status').value;

        let filtered = cases;

        if (search) {
            filtered = filtered.filter(c => {
                const client = Store.getById(ENTITIES.CLIENTS, c.clientId);
                return c.caseNo.includes(search) ||
                    c.subject.toLowerCase().includes(search) ||
                    c.opponentName.toLowerCase().includes(search) ||
                    c.court.toLowerCase().includes(search) ||
                    (client && client.name.toLowerCase().includes(search));
            });
        }

        if (typeFilter) filtered = filtered.filter(c => c.caseType === typeFilter);
        if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);

        const tbody = document.getElementById('case-table-body');

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>لا توجد قضايا</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(c => {
            const client = Store.getById(ENTITIES.CLIENTS, c.clientId);
            const owner = Store.getById(ENTITIES.USERS, c.ownerId);
            const typeClass = CASE_TYPES_EN[c.caseType] || 'civil';
            const statusClass = CASE_STATUS_BADGE[c.status] || 'active';

            return `
        <tr class="clickable-row" onclick="window.location.hash='/cases/${c.id}'">
          <td><strong>${c.caseNo || ''}/${c.year || ''}</strong></td>
          <td><span class="badge badge-${typeClass}">${c.caseType || '—'}</span></td>
          <td>${client ? client.name : '—'}</td>
          <td>${c.opponentName || '—'}</td>
          <td class="text-sm">${c.court || '—'}</td>
          <td class="text-sm">${c.subject || '—'}</td>
          <td>${c.stageType || '—'}</td>
          <td><span class="badge badge-${statusClass}">${c.status || '—'}</span></td>
          <td class="text-sm">${owner ? owner.name : '—'}</td>
        </tr>
      `;
        }).join('');
    }

    renderRows();

    document.getElementById('case-search').addEventListener('input', renderRows);
    document.getElementById('filter-type').addEventListener('change', renderRows);
    document.getElementById('filter-status').addEventListener('change', renderRows);
}

export default { renderCaseList };
