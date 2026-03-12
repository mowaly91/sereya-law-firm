// ========================================
// PAGE: User Management (Admin)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, USER_ROLES, createUser } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal } from '../../components/modal.js';
import { isPartner, getAuthToken } from '../../data/permissions.js';
import { logAudit } from '../../data/audit.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${u.id}" title="تعديل"><i class='bx bx-edit'></i></button>
                    ${u.email ? `<button class="btn btn-ghost btn-sm send-invite" data-id="${u.id}" data-email="${u.email}" title="إرسال دعوة"><i class='bx bx-envelope'></i></button>` : ''}
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

    container.querySelectorAll('.send-invite').forEach(btn => {
        btn.addEventListener('click', () => sendInvite(btn.dataset.id, btn.dataset.email));
    });
}

async function sendInvite(userId, email) {
    const token = getAuthToken();
    try {
        const res = await fetch(`${API_BASE}/auth/send-invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();

        if (!res.ok) {
            showToast(data.error || 'فشل إرسال الدعوة', 'error');
            return;
        }

        // Show invite link in a modal so admin can copy it
        const linkHtml = `
        <div style="margin-bottom: 16px;">
          <p style="color:var(--text-secondary); margin-bottom: 12px;">
            ${data.emailSent ? `✅ تم إرسال الدعوة إلى <strong>${email}</strong>` : `⚠️ لم يتم إرسال البريد (SMTP غير مهيأ). انسخ الرابط أدناه وأرسله للمستخدم:`}
          </p>
          <div style="background:var(--bg-input); border:1px solid var(--border-primary); border-radius:var(--radius-md); padding:12px; word-break:break-all; font-size:var(--text-xs); color:var(--text-secondary); direction:ltr; text-align:left;">
            ${data.inviteLink}
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="navigator.clipboard.writeText('${data.inviteLink}').then(()=>this.textContent='✓ تم النسخ')">
            <i class='bx bx-copy'></i> نسخ الرابط
          </button>
        </div>`;

        openModal('رابط الدعوة', linkHtml, {
            footer: `<button class="btn btn-primary" onclick="document.getElementById('active-modal')?.remove()">إغلاق</button>`
        });

    } catch (err) {
        showToast('تعذر الاتصال بالخادم', 'error');
    }
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
