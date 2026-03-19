// ========================================
// PAGE: User Management (Admin)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, USER_ROLES, createUser } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal, confirmModal } from '../../components/modal.js';
import { isPartner, getAuthToken, getCurrentUser } from '../../data/permissions.js';
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

      <div class="card" style="margin-bottom:16px; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border-primary); border-radius:var(--radius-md);">
        <div style="display:flex; align-items:center; gap:10px; color:var(--text-secondary); font-size:var(--text-sm);">
          <i class='bx bx-info-circle' style="font-size:18px; color:var(--accent-primary);"></i>
          <span>لإضافة مستخدم جديد: أضف المستخدم وعيّن له كلمة مرور مباشرةً. المستخدم يمكنه تغيير كلمة مروره بعد تسجيل الدخول من أيقونة حسابه في الشريط العلوي.</span>
        </div>
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
              <th>كلمة المرور</th>
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
                  <button class="btn btn-ghost btn-sm set-password-btn" data-id="${u.id}" data-name="${u.name}" title="تعيين كلمة مرور">
                    <i class='bx bx-key'></i> تعيين كلمة مرور
                  </button>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${u.id}" title="تعديل"><i class='bx bx-edit'></i></button>
                    ${u.id === getCurrentUser()?.id ? '' : `<button class="btn btn-ghost btn-sm delete-user" data-id="${u.id}" data-name="${u.name}" title="حذف"><i class='bx bx-trash text-red-500'></i></button>`}
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

    container.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            confirmModal('حذف المستخدم', `هل أنت متأكد من حذف المستخدم <strong>${name}</strong>؟<br><br><span style="color:var(--text-secondary);font-size:13px;">لن يتمكن هذا المستخدم من الدخول للنظام مرة أخرى.</span>`, async () => {
                try {
                    const token = getAuthToken();
                    const res = await fetch(`${API_BASE}/users/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) {
                        const d = await res.json().catch(() => ({}));
                        throw new Error(d.error || 'فشل الحذف');
                    }
                    
                    Store.softDelete(ENTITIES.USERS, id);
                    logAudit(ENTITIES.USERS, id, 'delete', { name });
                    showToast('تم حذف المستخدم بنجاح', 'success');
                    renderUserManagement(container);
                } catch (e) {
                    showToast(e.message || 'حدث خطأ أثناء الاتصال بالخادم', 'error');
                }
            });
        });
    });

    container.querySelectorAll('.set-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openAdminSetPasswordModal(btn.dataset.id, btn.dataset.name);
        });
    });
}

// ── Admin Set Password Modal ─────────────────────────────────────────────────
async function openAdminSetPasswordModal(userId, userName) {
    const content = `
    <div style="margin-bottom:12px; color:var(--text-secondary); font-size:var(--text-sm);">
      تعيين كلمة مرور جديدة للمستخدم: <strong style="color:var(--text-primary);">${userName}</strong>
    </div>
    <div class="form-group">
      <label class="form-label">كلمة المرور الجديدة <span class="required">*</span></label>
      <input type="password" class="form-input" id="adm-pw" placeholder="8 أحرف على الأقل" autocomplete="new-password" />
    </div>
    <div class="form-group">
      <label class="form-label">تأكيد كلمة المرور <span class="required">*</span></label>
      <input type="password" class="form-input" id="adm-pw-confirm" placeholder="••••••••" autocomplete="new-password" />
    </div>
    <div id="adm-pw-error" class="form-error" style="display:none;"></div>
  `;

    const footer = `
    <button class="btn btn-primary" id="adm-pw-save"><i class='bx bx-check'></i> تعيين كلمة المرور</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

    openModal('تعيين كلمة مرور', content, { footer });

    document.getElementById('adm-pw-save').addEventListener('click', async () => {
        const pw = document.getElementById('adm-pw').value;
        const pw2 = document.getElementById('adm-pw-confirm').value;
        const errEl = document.getElementById('adm-pw-error');
        errEl.style.display = 'none';

        if (!pw || pw.length < 8) {
            errEl.textContent = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
            errEl.style.display = 'block';
            return;
        }
        if (pw !== pw2) {
            errEl.textContent = 'كلمتا المرور غير متطابقتين';
            errEl.style.display = 'block';
            return;
        }

        const btn = document.getElementById('adm-pw-save');
        btn.disabled = true;
        btn.textContent = 'جارٍ الحفظ...';

        try {
            const res = await fetch(`${API_BASE}/auth/admin-set-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ userId, password: pw })
            });
            const data = await res.json();
            if (!res.ok) {
                errEl.textContent = data.error || 'حدث خطأ';
                errEl.style.display = 'block';
                btn.disabled = false;
                btn.innerHTML = '<i class=\'bx bx-check\'></i> تعيين كلمة المرور';
                return;
            }
            showToast(`✅ تم تعيين كلمة مرور ${userName} بنجاح`, 'success');
            closeModal();
        } catch {
            errEl.textContent = 'تعذر الاتصال بالخادم';
            errEl.style.display = 'block';
            btn.disabled = false;
            btn.innerHTML = '<i class=\'bx bx-check\'></i> تعيين كلمة المرور';
        }
    });
}

// ── User Create / Edit Modal ─────────────────────────────────────────────────
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
      ` : `
      <div style="background:var(--bg-input); border:1px solid var(--border-primary); border-radius:var(--radius-md); padding:14px; margin-top:4px;">
        <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); margin-bottom:10px;">
          <i class='bx bx-key'></i> كلمة المرور الأولية
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">كلمة المرور <span class="required">*</span></label>
            <input type="password" class="form-input" id="user-password" placeholder="8 أحرف على الأقل" autocomplete="new-password" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">تأكيد كلمة المرور <span class="required">*</span></label>
            <input type="password" class="form-input" id="user-password-confirm" placeholder="••••••••" autocomplete="new-password" />
          </div>
        </div>
      </div>
      `}
      <div id="user-form-error" class="form-error" style="display:none; margin-top:8px;"></div>
    </form>
  `;

    const footer = `
    <button class="btn btn-primary" id="save-user">${isEdit ? '💾 حفظ' : '✓ إضافة المستخدم'}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

    openModal(isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم جديد', content, { footer });

    document.getElementById('save-user').addEventListener('click', async () => {
        const errEl = document.getElementById('user-form-error');
        errEl.style.display = 'none';

        const name = document.getElementById('user-name').value.trim();
        const role = document.getElementById('user-role').value;
        const email = document.getElementById('user-email').value.trim();
        const phone = document.getElementById('user-phone').value.trim();
        const active = isEdit ? document.getElementById('user-active')?.checked : true;

        if (!name) {
            errEl.textContent = 'اسم المستخدم مطلوب';
            errEl.style.display = 'block';
            return;
        }

        // For new users: validate password
        if (!isEdit) {
            const pw = document.getElementById('user-password').value;
            const pw2 = document.getElementById('user-password-confirm').value;
            if (!pw || pw.length < 8) {
                errEl.textContent = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
                errEl.style.display = 'block';
                return;
            }
            if (pw !== pw2) {
                errEl.textContent = 'كلمتا المرور غير متطابقتين';
                errEl.style.display = 'block';
                return;
            }

            // Create user securely and synchronously to avoid background-sync race conditions
            const data = { name, role, email, phone, active: true, password: pw };
            const btn = document.getElementById('save-user');
            btn.disabled = true;
            
            try {
                const token = getAuthToken();
                const res = await fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
                const responseData = await res.json();
                
                if (!res.ok) {
                    showToast(`خطأ: ${responseData.error || 'تعذر إضافة المستخدم'}`, 'error');
                    btn.disabled = false;
                    return;
                }
                
                // Add to local store manually since we bypassed the Store.create() queue
                const items = Store.getAll(ENTITIES.USERS);
                items.push(responseData);
                localStorage.setItem(`slf_users`, JSON.stringify(items));
                Store.emit('change', { entityType: ENTITIES.USERS, action: 'create', data: responseData });
                
                logAudit(ENTITIES.USERS, responseData.id, 'create', data);
                showToast(`✅ تم إضافة ${name} وتعيين كلمة مروره بنجاح`, 'success');
            } catch (err) {
                showToast('تعذر الاتصال بالخادم', 'error');
                btn.disabled = false;
                return;
            }
        } else {
            // Edit existing user
            const data = createUser({ name, role, email, phone, active });
            Store.update(ENTITIES.USERS, existing.id, data);
            logAudit(ENTITIES.USERS, existing.id, 'update', data);
            showToast('تم تحديث المستخدم', 'success');
        }

        closeModal();
        renderUserManagement(container);
    });
}

export default { renderUserManagement };
