// ========================================
// SHARED ACTION MODALS
// Used by: action-list.js + case-detail.js
//
// Exports:
//   openPartnerEditActionModal(actionId, onSuccess)  → Partner/Admin full edit
//   openProgressUpdateModal(actionId, onSuccess)     → Lawyer progress update
// ========================================

import Store from '../../data/store.js';
import {
  ENTITIES, PRIORITY_LEVELS, ASSIGNABLE_ROLES
} from '../../data/models.js';
import { openModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { logAudit, logActionFieldChanges } from '../../data/audit.js';
import { canEditActions } from '../../data/permissions.js';
import { getActionTypes } from '../../data/lookup-service.js';

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER / ADMIN — FULL EDIT MODAL
// All fields editable. Client mandatory. Sensitive fields require Edit Reason.
// ─────────────────────────────────────────────────────────────────────────────
export function openPartnerEditActionModal(actionId, onSuccess) {
  if (!canEditActions()) {
    showToast('تعديل الإجراءات متاح للشركاء فقط', 'error');
    return;
  }

  const action = Store.getById(ENTITIES.ACTIONS, actionId);
  if (!action) return;

  const allClients = Store.getAll(ENTITIES.CLIENTS);
  const allCases = Store.getAll(ENTITIES.CASES);
  const allUsers = Store.getAll(ENTITIES.USERS);
  const assignableUsers = allUsers.filter(u => u.active && ASSIGNABLE_ROLES.includes(u.role));
  const isCompleted = action.status === 'مكتمل';
  const ACTION_TYPES = getActionTypes(); // live from admin settings

  function getCasesForClient(clientId) {
    if (!clientId) return [];
    return allCases.filter(c => {
      const ids = c.clientIds || (c.clientId ? [c.clientId] : []);
      return ids.includes(clientId)
        || c.primaryClientId === clientId
        || c.clientId === clientId;
    });
  }

  const casesForCurrentClient = getCasesForClient(action.clientId);

  const content = `
    <form id="edit-action-partner-form" autocomplete="off">

      ${isCompleted ? `
      <div style="background:var(--status-progress-bg);border-right:3px solid var(--status-progress);
                  padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);
                  margin-bottom:var(--space-4);font-size:var(--text-sm);">
        <i class='bx bx-error'></i> هذا الإجراء مكتمل. تعديل تفاصيل التنفيذ يتطلب إدخال سبب التعديل.
      </div>` : ''}

      <div class="form-hint" style="color:var(--risk-high);margin-bottom:var(--space-4);">
        <i class='bx bx-error'></i> الحقول المشار إليها بـ <strong>(حساس)</strong> تتطلب ذكر سبب التعديل
      </div>

      <!-- Type + Priority -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-action-type">
            ${ACTION_TYPES.map(t => `<option value="${t}" ${action.actionType === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ea-priority">
            <option value="">بدون أولوية</option>
            ${PRIORITY_LEVELS.map(p => `<option value="${p}" ${action.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="form-label">عنوان / وصف الإجراء</label>
        <input type="text" class="form-input" id="ea-title"
               value="${(action.title || '').replace(/"/g, '&quot;')}" />
      </div>

      <!-- Client (MANDATORY) + Case (optional, cascades) -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-client" required>
            <option value="">اختر العميل</option>
            ${allClients.map(c => `<option value="${c.id}" ${action.clientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
          <div class="form-hint">يجب أن يبقى الإجراء مرتبطاً بعميل دائماً</div>
        </div>
        <div class="form-group">
          <label class="form-label">القضية
            <span class="form-optional">(اختياري – حساس)</span></label>
          <select class="form-select" id="ea-case">
            <option value="">بدون قضية (مستوى العميل)</option>
            ${casesForCurrentClient.map(c =>
    `<option value="${c.id}" ${action.caseId === c.id ? 'selected' : ''}>${c.caseNo}/${c.year} – ${c.subject}</option>`
  ).join('')}
          </select>
        </div>
      </div>

      <!-- Responsible + Due Date -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-responsible">
            ${assignableUsers.map(u =>
    `<option value="${u.id}" ${action.responsibleUserId === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`
  ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ea-due-date" value="${action.dueDate || ''}" />
        </div>
      </div>

      <!-- Post-completion execution fields (Partner can edit) -->
      ${isCompleted ? `
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <input type="date" class="form-input" id="ea-exec-date" value="${action.executionDate || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <textarea class="form-textarea" id="ea-exec-details" style="min-height:60px;">${action.executionDetails || ''}</textarea>
        </div>
      </div>` : ''}

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="ea-notes">${action.notes || ''}</textarea>
      </div>

      <!-- Edit Reason — required when sensitive fields change -->
      <div class="form-group">
        <label class="form-label" style="color:var(--risk-high);">
          سبب التعديل <span class="required">*</span>
        </label>
        <textarea class="form-textarea" id="ea-edit-reason"
          placeholder="اذكر سبب التعديل بوضوح (مطلوب عند تعديل الحقول الحساسة)..."></textarea>
        <div class="form-hint">
          مطلوب عند تغيير: نوع الإجراء، المسؤول، العميل، القضية، أو تفاصيل التنفيذ
        </div>
      </div>

      <div id="ea-errors" class="form-error mt-4" style="display:none;"></div>
    </form>`;

  const footer = `
    <button class="btn btn-primary" id="ea-save-btn">💾 حفظ التعديلات</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`;

  openModal('تعديل الإجراء (شريك)', content, { footer, large: true });

  // Cascade: Client → Cases
  document.getElementById('ea-client')?.addEventListener('change', () => {
    const clientId = document.getElementById('ea-client').value;
    const caseEl = document.getElementById('ea-case');
    if (!caseEl) return;
    const list = getCasesForClient(clientId);
    caseEl.innerHTML = '<option value="">بدون قضية (مستوى العميل)</option>'
      + list.map(c => `<option value="${c.id}">${c.caseNo}/${c.year} – ${c.subject}</option>`).join('');
  });

  // Save
  document.getElementById('ea-save-btn').addEventListener('click', () => {
    const newActionType = document.getElementById('ea-action-type').value;
    const newTitle = document.getElementById('ea-title').value.trim();
    const newPriority = document.getElementById('ea-priority').value;
    const newClientId = document.getElementById('ea-client').value;
    const newCaseId = document.getElementById('ea-case')?.value || '';
    const newResponsible = document.getElementById('ea-responsible').value;
    const newDueDate = document.getElementById('ea-due-date').value;
    const newNotes = document.getElementById('ea-notes').value.trim();
    const newExecDate = isCompleted
      ? (document.getElementById('ea-exec-date')?.value || action.executionDate)
      : action.executionDate;
    const newExecDetails = isCompleted
      ? (document.getElementById('ea-exec-details')?.value?.trim() || action.executionDetails)
      : action.executionDetails;
    const editReason = document.getElementById('ea-edit-reason').value.trim();

    const sensitiveChanged = [
      action.actionType !== newActionType,
      action.responsibleUserId !== newResponsible,
      action.clientId !== newClientId,
      action.caseId !== newCaseId,
      isCompleted && (action.executionDate !== newExecDate || action.executionDetails !== newExecDetails)
    ].some(Boolean);

    const errors = [];
    if (!newClientId) errors.push('العميل مطلوب – لا يمكن إزالة ربط الإجراء بعميل');
    if (!newActionType) errors.push('نوع الإجراء مطلوب');
    if (!newResponsible) errors.push('المحامي المسؤول مطلوب');
    if (sensitiveChanged && !editReason)
      errors.push('سبب التعديل مطلوب عند تغيير الحقول الحساسة');

    // Validate case ↔ client consistency
    if (newCaseId) {
      const caseData = Store.getById(ENTITIES.CASES, newCaseId);
      if (caseData) {
        const cids = caseData.clientIds || (caseData.clientId ? [caseData.clientId] : []);
        const ok = cids.includes(newClientId)
          || caseData.primaryClientId === newClientId
          || caseData.clientId === newClientId;
        if (!ok) errors.push('القضية المختارة لا تنتمي للعميل المحدد');
      }
    }

    if (errors.length > 0) {
      const errDiv = document.getElementById('ea-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = errors.join('<br>');
      return;
    }

    const newSnapshot = {
      actionType: newActionType,
      title: newTitle,
      priority: newPriority,
      clientId: newClientId,
      caseId: newCaseId,
      responsibleUserId: newResponsible,
      dueDate: newDueDate,
      notes: newNotes,
      executionDate: newExecDate,
      executionDetails: newExecDetails
    };

    // Per-field audit diff (Spec F)
    logActionFieldChanges(actionId, action, newSnapshot, editReason);
    Store.update(ENTITIES.ACTIONS, actionId, newSnapshot);

    showToast('تم حفظ التعديلات بنجاح', 'success');
    closeModal();
    if (typeof onSuccess === 'function') onSuccess();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LAWYER — PROGRESS UPDATE MODAL
// Limited scope: status + progress notes + execution (to complete).
// Cannot change: Type, Client, Case, Responsible, Priority, Due Date.
// ─────────────────────────────────────────────────────────────────────────────
export function openProgressUpdateModal(actionId, onSuccess) {
  const action = Store.getById(ENTITIES.ACTIONS, actionId);
  if (!action) return;

  if (action.status === 'مكتمل') {
    showToast('هذا الإجراء مكتمل بالفعل ولا يمكن تعديل تقدمه', 'warning');
    return;
  }

  const content = `
    <form id="progress-update-form" autocomplete="off">

      <!-- Read-only action context -->
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);
                  padding:var(--space-3) var(--space-4);margin-bottom:var(--space-4);
                  font-size:var(--text-sm);">
        <div><strong>نوع الإجراء:</strong> ${action.actionType}</div>
        ${action.title ? `<div><strong>الوصف:</strong> ${action.title}</div>` : ''}
        ${action.dueDate ? `<div><strong>الاستحقاق:</strong> ${action.dueDate}</div>` : ''}
      </div>

      <!-- Status -->
      <div class="form-group">
        <label class="form-label">الحالة <span class="required">*</span></label>
        <select class="form-select" id="pu-status">
          <option value="مفتوح"       ${action.status === 'مفتوح' ? 'selected' : ''}>مفتوح</option>
          <option value="قيد التنفيذ" ${action.status === 'قيد التنفيذ' ? 'selected' : ''}>قيد التنفيذ</option>
          <option value="معلق"        ${action.status === 'معلق' ? 'selected' : ''}>معلق</option>
          <option value="مكتمل"       >مكتمل</option>
        </select>
      </div>

      <!-- Progress notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات التقدم</label>
        <textarea class="form-textarea" id="pu-notes"
          placeholder="أضف ملاحظات حول التقدم في تنفيذ الإجراء...">${action.notes || ''}</textarea>
      </div>

      <!-- Execution fields — shown/required only when status = مكتمل -->
      <div id="pu-completion-fields" style="display:none;">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ <span class="required">*</span></label>
          <input type="date" class="form-input" id="pu-exec-date" value="${action.executionDate || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات <span class="required">*</span></label>
          <textarea class="form-textarea" id="pu-exec-details"
            placeholder="رقم المحضر، مرجع التصريح، إيصال التقديم...">${action.executionDetails || ''}</textarea>
        </div>
      </div>

      <div id="pu-errors" class="form-error mt-4" style="display:none;"></div>
    </form>`;

  const footer = `
    <button class="btn btn-primary" id="pu-save-btn">✓ حفظ التقدم</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`;

  openModal('تحديث تقدم الإجراء', content, { footer });

  // Show/hide execution fields based on status selection
  const statusEl = document.getElementById('pu-status');
  const completionEl = document.getElementById('pu-completion-fields');
  statusEl?.addEventListener('change', () => {
    completionEl.style.display = statusEl.value === 'مكتمل' ? 'block' : 'none';
  });

  // Save
  document.getElementById('pu-save-btn').addEventListener('click', () => {
    const newStatus = document.getElementById('pu-status').value;
    const newNotes = document.getElementById('pu-notes').value.trim();
    const newExecDate = document.getElementById('pu-exec-date')?.value || '';
    const newExecDetails = document.getElementById('pu-exec-details')?.value?.trim() || '';

    const errors = [];
    if (newStatus === 'مكتمل') {
      if (!newExecDate) errors.push('تاريخ التنفيذ مطلوب لإكمال الإجراء');
      if (!newExecDetails) errors.push('تفاصيل التنفيذ / الإثبات مطلوبة لإكمال الإجراء');
    }

    if (errors.length > 0) {
      const errDiv = document.getElementById('pu-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = errors.join('<br>');
      return;
    }

    const updates = { status: newStatus, notes: newNotes };
    if (newStatus === 'مكتمل') {
      updates.executionDate = newExecDate;
      updates.executionDetails = newExecDetails;
    }

    Store.update(ENTITIES.ACTIONS, actionId, updates);

    const auditAction = newStatus === 'مكتمل' ? 'complete' : 'status_change';
    logAudit(ENTITIES.ACTIONS, actionId, auditAction, {
      oldStatus: action.status,
      newStatus,
      notes: newNotes
    });

    const label = newStatus === 'مكتمل' ? 'تم إكمال الإجراء ✓' : `تم تحديث الحالة إلى: ${newStatus}`;
    showToast(label, 'success');
    closeModal();
    if (typeof onSuccess === 'function') onSuccess();
  });
}

export default { openPartnerEditActionModal, openProgressUpdateModal };
