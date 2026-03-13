// ========================================
// PAGE: Client List
// ========================================

import Store from '../../data/store.js';
import { ENTITIES } from '../../data/models.js';
import { setPageTitle, formatDate } from '../../main.js';
import { can } from '../../data/permissions.js';
import { showToast } from '../../components/toast.js';
import { confirmModal } from '../../components/modal.js';
import { logAudit } from '../../data/audit.js';

export function renderClientList(container) {
  setPageTitle('العملاء');

  const clients = Store.getAll(ENTITIES.CLIENTS);

  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-group'></i> العملاء</h1>
          <div class="page-header-sub">${clients.length} عميل</div>
        </div>
        <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="window.location.hash='/clients/import'">
                <i class='bx bxl-google-drive'></i> استيراد من درايف
            </button>
            <button class="btn btn-primary" id="add-client-btn">
                <i class='bx bx-plus'></i> إضافة عميل
            </button>
        </div>
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="client-search" placeholder="بحث بالاسم أو الرقم القومي أو الهاتف..." />
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الرقم القومي / السجل</th>
              <th>الهاتف</th>
              <th>رقم التوكيل</th>
              <th>مكتب التوثيق</th>
              <th>تاريخ التوكيل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody id="client-table-body">
            ${renderClientRows(clients)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search
  container.querySelector('#client-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nationalId.includes(q) ||
      c.phone.includes(q)
    );
    document.getElementById('client-table-body').innerHTML = renderClientRows(filtered);
    attachRowHandlers();
  });

  // Add client button
  container.querySelector('#add-client-btn').addEventListener('click', () => {
    window.location.hash = '/clients/new';
  });

  attachRowHandlers();
}

function renderClientRows(clients) {
  if (clients.length === 0) {
    return `<tr><td colspan="7"><div class="empty-state"><p>لا يوجد عملاء</p></div></td></tr>`;
  }
  return clients.map(c => {
    const driveLink = c.driveFolderUrl
      ? `<a href="${c.driveFolderUrl}" target="_blank" class="btn btn-ghost btn-sm" title="فتح مجلد درايف"><i class='bx bxl-google-drive text-blue-500'></i></a>`
      : '';

    return `
    <tr class="clickable-row" data-id="${c.id}">
      <td><strong>${c.name || '—'}</strong></td>
      <td>${c.nationalId || ''}</td>
      <td>${c.phone || ''}</td>
      <td>${c.poaNumber || ''}</td>
      <td>${c.notaryOffice || ''}</td>
      <td>${formatDate(c.poaDate)}</td>
      <td>
        <div class="table-actions">
          ${driveLink}
          <button class="btn btn-ghost btn-sm edit-client" data-id="${c.id}"><i class='bx bx-edit'></i></button>
          <button class="btn btn-ghost btn-sm delete-client" data-id="${c.id}"><i class='bx bx-trash'></i></button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

function attachRowHandlers() {
  document.querySelectorAll('.edit-client').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.hash = `/clients/${btn.dataset.id}/edit`;
    });
  });

  document.querySelectorAll('.delete-client').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmModal('حذف العميل', 'هل أنت متأكد من حذف هذا العميل؟', () => {
        Store.softDelete(ENTITIES.CLIENTS, btn.dataset.id);
        logAudit(ENTITIES.CLIENTS, btn.dataset.id, 'delete');
        showToast('تم حذف العميل', 'success');
        window.location.hash = '/clients';
        renderClientList(document.getElementById('page-content'));
      });
    });
  });
}

export default { renderClientList };
