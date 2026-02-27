// ========================================
// PAGE: Admin System Settings (tabbed)
// Tabs: Notifications | Action Types | Decision Types
// ========================================

import Store from '../../data/store.js';
import { ENTITIES } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { isPartner } from '../../data/permissions.js';
import {
    getActionTypeRecords, getDecisionTypeRecords,
    addType, updateType, deleteType
} from '../../data/lookup-service.js';

export function renderAdminSettings(container) {
    setPageTitle('إعدادات النظام');

    if (!isPartner()) {
        container.innerHTML = '<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';
        return;
    }

    renderPage(container);
}

function renderPage(container, activeTab = 'notifications') {
    const workdayEndTime = Store.getSetting('workdayEndTime') || '17:00';
    const actionRecords = getActionTypeRecords();
    const decisionRecords = getDecisionTypeRecords();

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-cog'></i> إعدادات النظام</h1>
          <div class="page-header-sub">إدارة إعدادات النظام وقوائم القرارات والإجراءات</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="settings-tabs" style="display:flex;gap:var(--space-2);margin-bottom:var(--space-6);border-bottom:2px solid var(--border-secondary);">
        <button class="settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${activeTab === 'notifications' ? 'var(--accent-primary)' : 'var(--text-secondary)'};
                 border-bottom:2px solid ${activeTab === 'notifications' ? 'var(--accent-primary)' : 'transparent'};margin-bottom:-2px;transition:all var(--transition-fast);">
          🔔 إعدادات الإشعارات
        </button>
        <button class="settings-tab-btn ${activeTab === 'actions' ? 'active' : ''}" data-tab="actions"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${activeTab === 'actions' ? 'var(--accent-primary)' : 'var(--text-secondary)'};
                 border-bottom:2px solid ${activeTab === 'actions' ? 'var(--accent-primary)' : 'transparent'};margin-bottom:-2px;transition:all var(--transition-fast);">
          ⚡ أنواع الإجراءات <span class="badge badge-open" style="font-size:10px;">${actionRecords.length}</span>
        </button>
        <button class="settings-tab-btn ${activeTab === 'decisions' ? 'active' : ''}" data-tab="decisions"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${activeTab === 'decisions' ? 'var(--accent-primary)' : 'var(--text-secondary)'};
                 border-bottom:2px solid ${activeTab === 'decisions' ? 'var(--accent-primary)' : 'transparent'};margin-bottom:-2px;transition:all var(--transition-fast);">
          ⚖️ أنواع القرارات <span class="badge badge-open" style="font-size:10px;">${decisionRecords.length}</span>
        </button>
      </div>

      <!-- Tab: Notifications -->
      <div id="tab-notifications" style="display:${activeTab === 'notifications' ? 'block' : 'none'}">
        <div class="card" style="max-width:600px;">
          <h3 class="mb-4" style="color:var(--accent-primary);">🔔 إعدادات الإشعارات</h3>
          <div class="form-group">
            <label class="form-label">وقت نهاية يوم العمل <span class="required">*</span></label>
            <input type="time" class="form-input" id="workday-end-time" value="${workdayEndTime}" style="max-width:200px;" />
            <div class="form-hint">سيتم عرض إشعار بالجلسات غير المكتملة عند هذا الوقت يومياً</div>
          </div>
          <div class="flex gap-3 mt-6">
            <button class="btn btn-primary" id="save-settings-btn">💾 حفظ الإعدادات</button>
          </div>
        </div>
      </div>

      <!-- Tab: Action Types -->
      <div id="tab-actions" style="display:${activeTab === 'actions' ? 'block' : 'none'}">
        ${renderLookupTab('action', actionRecords, 'أنواع الإجراءات', '⚡')}
      </div>

      <!-- Tab: Decision Types -->
      <div id="tab-decisions" style="display:${activeTab === 'decisions' ? 'block' : 'none'}">
        ${renderLookupTab('decision', decisionRecords, 'أنواع القرارات', '⚖️')}
      </div>
    </div>`;

    // ── Tab switching ──────────────────────────────────────────────────────────
    container.querySelectorAll('.settings-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => renderPage(container, btn.dataset.tab));
    });

    // ── Notifications save ─────────────────────────────────────────────────────
    container.querySelector('#save-settings-btn')?.addEventListener('click', () => {
        const time = document.getElementById('workday-end-time').value;
        if (!time) { showToast('وقت نهاية يوم العمل مطلوب', 'error'); return; }
        Store.setSetting('workdayEndTime', time);
        showToast('تم حفظ الإعدادات بنجاح', 'success');
    });

    // ── Action Types CRUD ──────────────────────────────────────────────────────
    bindLookupTab(container, 'action', ENTITIES.LOOKUP_ACTION_TYPES, () => renderPage(container, 'actions'));

    // ── Decision Types CRUD ────────────────────────────────────────────────────
    bindLookupTab(container, 'decision', ENTITIES.LOOKUP_DECISION_TYPES, () => renderPage(container, 'decisions'));
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup Tab HTML builder
// ─────────────────────────────────────────────────────────────────────────────
function renderLookupTab(prefix, records, title, icon) {
    return `
    <div class="card">
      <div class="flex gap-4 align-center mb-4" style="justify-content:space-between;flex-wrap:wrap;">
        <h3 style="color:var(--accent-primary);margin:0;">${icon} ${title}</h3>
        <div class="flex gap-3 align-center" style="flex-wrap:wrap;">
          <input type="text" class="form-input" id="${prefix}-search"
                 placeholder="بحث..." style="max-width:200px;height:36px;padding:0 var(--space-3);" />
          <button class="btn btn-primary btn-sm" id="${prefix}-add-btn">
            <i class='bx bx-plus'></i> إضافة
          </button>
        </div>
      </div>

      <!-- Add row (hidden by default) -->
      <div id="${prefix}-add-row" style="display:none;margin-bottom:var(--space-4);">
        <div class="flex gap-3 align-center">
          <input type="text" class="form-input" id="${prefix}-add-input"
                 placeholder="اسم النوع الجديد..." style="flex:1;" />
          <button class="btn btn-primary btn-sm" id="${prefix}-add-confirm">✓ إضافة</button>
          <button class="btn btn-secondary btn-sm" id="${prefix}-add-cancel">إلغاء</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:60px;">#</th>
              <th>الاسم</th>
              <th style="width:120px;">إجراءات</th>
            </tr>
          </thead>
          <tbody id="${prefix}-list">
            ${records.map((r, i) => lookupRow(prefix, r, i + 1)).join('')}
          </tbody>
        </table>
      </div>
      ${records.length === 0 ? '<div class="empty-state"><p>لا توجد عناصر. أضف عنصراً جديداً.</p></div>' : ''}
    </div>`;
}

function lookupRow(prefix, r, index) {
    return `
    <tr data-id="${r.id}" class="${prefix}-row">
      <td class="text-secondary text-sm">${index}</td>
      <td>
        <span class="${prefix}-label">${r.label}</span>
        <input type="text" class="${prefix}-edit-input form-input" value="${r.label.replace(/"/g, '&quot;')}"
               style="display:none;width:100%;" />
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm ${prefix}-edit-btn" data-id="${r.id}" title="تعديل">
            <i class='bx bx-edit'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${prefix}-save-btn" data-id="${r.id}"
                  style="display:none;color:var(--status-open);" title="حفظ">
            <i class='bx bx-check'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${prefix}-cancel-btn" data-id="${r.id}"
                  style="display:none;" title="إلغاء">
            <i class='bx bx-x'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${prefix}-delete-btn" data-id="${r.id}"
                  style="color:var(--risk-high);" title="حذف">
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </td>
    </tr>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Event binding for each lookup tab
// ─────────────────────────────────────────────────────────────────────────────
function bindLookupTab(container, prefix, entity, rerender) {
    // Search filter
    container.querySelector(`#${prefix}-search`)?.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        container.querySelectorAll(`.${prefix}-row`).forEach(row => {
            const label = row.querySelector(`.${prefix}-label`)?.textContent?.toLowerCase() || '';
            row.style.display = label.includes(q) ? '' : 'none';
        });
    });

    // Show add row
    container.querySelector(`#${prefix}-add-btn`)?.addEventListener('click', () => {
        const row = container.querySelector(`#${prefix}-add-row`);
        row.style.display = 'block';
        container.querySelector(`#${prefix}-add-input`)?.focus();
    });
    container.querySelector(`#${prefix}-add-cancel`)?.addEventListener('click', () => {
        container.querySelector(`#${prefix}-add-row`).style.display = 'none';
        container.querySelector(`#${prefix}-add-input`).value = '';
    });

    // Confirm add
    container.querySelector(`#${prefix}-add-confirm`)?.addEventListener('click', () => {
        const input = container.querySelector(`#${prefix}-add-input`);
        const label = input?.value?.trim();
        if (!label) { showToast('الاسم مطلوب', 'error'); return; }
        addType(entity, label);
        showToast(`تمت إضافة "${label}"`, 'success');
        rerender();
    });

    // Inline edit
    container.querySelectorAll(`.${prefix}-edit-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            const row = container.querySelector(`[data-id="${btn.dataset.id}"].${prefix}-row`);
            row.querySelector(`.${prefix}-label`).style.display = 'none';
            row.querySelector(`.${prefix}-edit-input`).style.display = 'block';
            row.querySelector(`.${prefix}-edit-btn`).style.display = 'none';
            row.querySelector(`.${prefix}-delete-btn`).style.display = 'none';
            row.querySelector(`.${prefix}-save-btn`).style.display = 'inline-flex';
            row.querySelector(`.${prefix}-cancel-btn`).style.display = 'inline-flex';
            row.querySelector(`.${prefix}-edit-input`)?.focus();
        });
    });

    container.querySelectorAll(`.${prefix}-cancel-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            const row = container.querySelector(`[data-id="${btn.dataset.id}"].${prefix}-row`);
            row.querySelector(`.${prefix}-label`).style.display = '';
            row.querySelector(`.${prefix}-edit-input`).style.display = 'none';
            row.querySelector(`.${prefix}-edit-btn`).style.display = 'inline-flex';
            row.querySelector(`.${prefix}-delete-btn`).style.display = 'inline-flex';
            row.querySelector(`.${prefix}-save-btn`).style.display = 'none';
            row.querySelector(`.${prefix}-cancel-btn`).style.display = 'none';
        });
    });

    container.querySelectorAll(`.${prefix}-save-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            const row = container.querySelector(`[data-id="${btn.dataset.id}"].${prefix}-row`);
            const newLabel = row.querySelector(`.${prefix}-edit-input`)?.value?.trim();
            if (!newLabel) { showToast('الاسم لا يمكن أن يكون فارغاً', 'error'); return; }
            updateType(entity, btn.dataset.id, newLabel);
            showToast('تم التحديث', 'success');
            rerender();
        });
    });

    // Delete
    container.querySelectorAll(`.${prefix}-delete-btn`).forEach(btn => {
        btn.addEventListener('click', () => {
            if (!confirm('هل تريد حذف هذا العنصر؟')) return;
            const result = deleteType(entity, btn.dataset.id);
            if (result.ok) {
                if (result.warning) showToast(result.warning, 'warning', 6000);
                else showToast('تم الحذف', 'success');
                rerender();
            }
        });
    });
}

export default { renderAdminSettings };
