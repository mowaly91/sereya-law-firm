// ========================================
// PAGE: User Management (Admin)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, USER_ROLES, createUser } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal } from '../../components/modal.js';
import { isPartner } from '../../data/permissions.js';
import { logAudit } from '../../data/audit.js';

export function renderUserManagement(container) {
    setPageTitle('إدارة المستخدمين');

    if (!isPartner()) {
        container.innerHTML = '<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';
        return;
    }

    const users = Store.getAll(ENTITIES.USERS);

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-user-detail'></i> إدارة المستخدمين</h1>
          <div class="page-header-sub">${users.length} مستخدم</div>
        </div>
        <button class="btn btn-primary" id="add-user-btn"><i class='bx bx-plus'></i> إضافة مستخدم</button>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.name}</strong></td>
                <td><span class="badge badge-open">${u.role}</span></td>
                <td>${u.email || '—'}</td>
                <td>${u.phone || '—'}</td>
                <td><span class="badge ${u.active ? 'badge-active' : 'badge-expired'}">${u.active ? 'نشط' : 'غير نشط'}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${u.id}"><i class='bx bx-edit'></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

    container.querySelector('#add-user-btn').addEventListener('click', () => openUserModal(null, container));

    container.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const user = Store.getById(ENTITIES.USERS, btn.dataset.id);
            if (user) openUserModal(user, container);
        });
    });
}

function openUserModal(existing, container) {
    const isEdit = !!existing;

    const content = `
    <form>
      <div class="form-group">
        <label class="form-label">الاسم <span class="required">*</span></label>
        <input type="text" class="form-input" id="user-name" value="${existing?.name || ''}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الدور <span class="required">*</span></label>
        <select class="form-select" id="user-role" required>
          ${USER_ROLES.map(r => `<option value="${r}" ${existing?.role === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" class="form-input" id="user-email" value="${existing?.email || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">الهاتف</label>
          <input type="text" class="form-input" id="user-phone" value="${existing?.phone || ''}" />
        </div>
      </div>
      ${isEdit ? `
      <div class="form-group">
        <label class="form-checkbox">
          <input type="checkbox" id="user-active" ${existing?.active ? 'checked' : ''} />
          <span>مستخدم نشط</span>
        </label>
      </div>
      ` : ''}
    </form>
  `;

    const footer = `
    <button class="btn btn-primary" id="save-user">${isEdit ? '💾 حفظ' : '✓ إضافة'}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

    openModal(isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم', content, { footer });

    document.getElementById('save-user').addEventListener('click', () => {
        const data = createUser({
            name: document.getElementById('user-name').value.trim(),
            role: document.getElementById('user-role').value,
            email: document.getElementById('user-email').value.trim(),
            phone: document.getElementById('user-phone').value.trim(),
            active: isEdit ? document.getElementById('user-active')?.checked : true
        });

        if (!data.name) {
            showToast('اسم المستخدم مطلوب', 'error');
            return;
        }

        if (isEdit) {
            Store.update(ENTITIES.USERS, existing.id, data);
            logAudit(ENTITIES.USERS, existing.id, 'update', data);
        } else {
            const newUser = Store.create(ENTITIES.USERS, data);
            logAudit(ENTITIES.USERS, newUser.id, 'create', data);
        }

        showToast(isEdit ? 'تم تحديث المستخدم' : 'تم إضافة المستخدم', 'success');
        closeModal();
        renderUserManagement(container);
    });
}

export default { renderUserManagement };
