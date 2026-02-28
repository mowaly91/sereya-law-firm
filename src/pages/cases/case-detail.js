// ========================================
// PAGE: Case Detail (Tabs: Sessions, Actions, Deadlines)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, CASE_STATUS_BADGE, CASE_TYPES_EN, ACTION_STATUS_BADGE, DEADLINE_STATUS_BADGE, SESSION_TYPES, DEADLINE_TYPES, NO_NEXT_DATE_REASONS, SESSION_STATUSES, createSession, createAction, createDeadline, PRIORITY_LEVELS, ASSIGNABLE_ROLES } from '../../data/models.js';
import { getActionTypes, getDecisionTypes } from '../../data/lookup-service.js';
import { setPageTitle, formatDate, daysUntil, isOverdue } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal, confirmModal } from '../../components/modal.js';
import { logAudit, logActionFieldChanges, getActionHistory } from '../../data/audit.js';
import { can, isPartner, canEditActions, getCurrentUser } from '../../data/permissions.js';
import { getMappingForDecision, doesDecisionRequireNextDate, doesDecisionCreateLinkedCase } from '../../config/decision-action-map.js';
import { openPartnerEditActionModal } from '../actions/action-modals.js';

export function renderCaseDetail(container, params = {}) {
  const caseData = Store.getById(ENTITIES.CASES, params.id);
  if (!caseData) {
    container.innerHTML = `<div class="empty-state"><h3>القضية غير موجودة</h3><button class="btn btn-primary" onclick="window.location.hash='/cases'">العودة للقضايا</button></div>`;
    return;
  }

  const client = Store.getById(ENTITIES.CLIENTS, caseData.primaryClientId || caseData.clientId);
  const allClientIds = caseData.clientIds || (caseData.clientId ? [caseData.clientId] : []);
  const allClients = allClientIds.map(id => Store.getById(ENTITIES.CLIENTS, id)).filter(Boolean);
  const clientDisplay = allClients.length > 1
    ? `${client ? client.name : '—'} وآخرون`
    : (client ? client.name : '—');
  const owner = Store.getById(ENTITIES.USERS, caseData.ownerId);
  const sessions = Store.query(ENTITIES.SESSIONS, s => s.caseId === params.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const actions = Store.query(ENTITIES.ACTIONS, a => a.caseId === params.id);
  const deadlines = Store.query(ENTITIES.DEADLINES, d => d.caseId === params.id);
  const users = Store.getAll(ENTITIES.USERS);

  const openActions = actions.filter(a => a.status !== 'مكتمل');
  const openDeadlines = deadlines.filter(d => d.status === 'مفتوح');
  const typeClass = CASE_TYPES_EN[caseData.caseType] || 'civil';
  const statusClass = CASE_STATUS_BADGE[caseData.status] || 'active';

  setPageTitle(`القضية ${caseData.caseNo}/${caseData.year}`);

  container.innerHTML = `
    <div class="animate-fade-in">
      <!-- Case Header -->
      <div class="case-detail-header">
        <div class="case-detail-info">
          <div class="case-badges">
            <span class="badge badge-${typeClass}">${caseData.caseType}</span>
            <span class="badge badge-${statusClass}">${caseData.status}</span>
            ${caseData.criminalStageType ? `<span class="badge badge-criminal">${caseData.criminalStageType}</span>` : ''}
          </div>
          <h1>القضية ${caseData.caseNo}/${caseData.year}</h1>
          <p class="text-secondary mb-4">${caseData.subject}</p>
          
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-item-label">العميل</div>
              <div class="detail-item-value">${clientDisplay} (${caseData.clientRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الخصم</div>
              <div class="detail-item-value">${caseData.opponentName} (${caseData.opponentRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المحكمة</div>
              <div class="detail-item-value">${caseData.court}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الدائرة</div>
              <div class="detail-item-value">${caseData.circuit}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المرحلة</div>
              <div class="detail-item-value">${caseData.stageType}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المسؤول</div>
              <div class="detail-item-value">${owner ? owner.name : '—'}</div>
            </div>
          </div>
        </div>
        <div class="case-detail-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases/${params.id}/edit'"><i class='bx bx-edit'></i> تعديل</button>
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases'">↩ العودة</button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="sessions">
          <i class='bx bx-list-check'></i> الجلسات <span class="tab-count">${sessions.length}</span>
        </button>
        <button class="tab-btn" data-tab="actions">
          <i class='bx bxs-zap'></i> الإجراءات <span class="tab-count">${actions.length}</span>
        </button>
        <button class="tab-btn" data-tab="deadlines">
          <i class='bx bxs-time'></i> المواعيد النهائية <span class="tab-count">${deadlines.length}</span>
        </button>
      </div>
      
      <!-- Sessions Tab -->
      <div class="tab-panel active" id="tab-sessions">
        <div class="flex justify-between items-center mb-4">
          <h3>الجلسات${caseData.caseType === 'جنائي' && caseData.criminalStageType === 'تحقيقات نيابة' ? ' / التحقيقات' : ''}</h3>
          <button class="btn btn-primary btn-sm" id="add-session-btn"><i class='bx bx-plus'></i> إضافة جلسة</button>
        </div>
        <div class="timeline" id="sessions-timeline">
          ${sessions.length === 0 ? '<div class="empty-state"><p>لا توجد جلسات بعد</p></div>' : ''}
          ${sessions.map(s => {
    const isInvestigation = s.sessionType === 'تحقيق';
    const isJudgment = s.decisionResult?.includes('حكم');
    const isClosed = s.status === 'مغلق';
    return `
              <div class="timeline-item">
                <div class="timeline-dot ${isJudgment ? 'judgment' : ''} ${isInvestigation ? 'investigation' : ''}"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <div class="timeline-date">${formatDate(s.date)}</div>
                    <div class="flex items-center gap-2">
                      <span class="session-status-badge ${isClosed ? 'session-status-closed' : 'session-status-open'}">${isClosed ? 'مغلق' : 'مفتوح'}</span>
                      <span class="badge badge-${isInvestigation ? 'criminal' : 'civil'}">${s.sessionType}</span>
                    </div>
                  </div>
                  <div class="timeline-title">${s.decisionResult || 'بدون قرار بعد'}</div>
                  ${s.closureReason ? `<div class="text-xs text-secondary mt-1">سبب الإغلاق: ${s.closureReason}</div>` : ''}
                  ${s.nextSessionDate ? `<div class="text-xs text-secondary mt-2">الجلسة التالية: ${formatDate(s.nextSessionDate)}</div>` : ''}
                  ${s.notes ? `<div class="timeline-desc mt-2">${s.notes}</div>` : ''}
                  <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm edit-session-btn" data-id="${s.id}"><i class='bx bx-edit'></i> تعديل</button>
                    ${!isClosed ? `<button class="btn btn-primary btn-sm close-session-btn" data-id="${s.id}">✓ إغلاق الجلسة</button>` : ''}
                  </div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>
      
      <!-- Actions Tab -->
      <div class="tab-panel" id="tab-actions">
        <div class="flex justify-between items-center mb-4">
          <h3>الإجراءات</h3>
          <div class="flex gap-2">
            ${openActions.length > 0 ? `<span class="badge badge-progress">${openActions.length} مفتوح</span>` : ''}
            <button class="btn btn-primary btn-sm" id="create-action-btn"><i class='bx bx-plus'></i> إنشاء إجراء</button>
          </div>
        </div>
        ${actions.length === 0 ? '<div class="empty-state"><p>لا توجد إجراءات بعد</p></div>' : ''}
        ${actions.map(a => {
    const responsible = Store.getById(ENTITIES.USERS, a.responsibleUserId);
    const clientData = a.clientId ? Store.getById(ENTITIES.CLIENTS, a.clientId) : null;
    const badgeClass = ACTION_STATUS_BADGE[a.status] || 'open';
    const overdue = a.dueDate && isOverdue(a.dueDate) && a.status !== 'مكتمل';
    const canEdit = canEditActions();          // Partner only
    const currentUser = getCurrentUser();
    // Complete button: Responsible Lawyer OR Partner
    const canComplete = a.status !== 'مكتمل'
      && (canEditActions()
        || (currentUser && a.responsibleUserId === currentUser.id));

    // Action History entries
    const history = getActionHistory(a.id);
    const historyHtml = history.length === 0
      ? '<div class="text-xs text-secondary" style="padding:var(--space-2) 0">لا توجد سجلات تعديل</div>'
      : history.map(h => {
        const fc = h.changes;
        const timeStr = new Date(h.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
        if (h.action === 'field_change' && fc && fc.field) {
          return `<div class="action-history-entry">
                        <span class="action-history-time">${timeStr}</span>
                        <span class="action-history-who">${h.userName}</span>
                        <span class="action-history-change">غيّر <strong>${fc.fieldLabel}</strong>: <span class="old-val">${fc.oldValue || '—'}</span> ← <span class="new-val">${fc.newValue || '—'}</span>${fc.editReason ? ` (السبب: ${fc.editReason})` : ''}</span>
                    </div>`;
        }
        const actionLabel = { create: 'إنشاء', complete: 'إكمال', update: 'تعديل', delete: 'حذف' }[h.action] || h.action;
        return `<div class="action-history-entry">
                    <span class="action-history-time">${timeStr}</span>
                    <span class="action-history-who">${h.userName}</span>
                    <span class="action-history-change">${actionLabel}</span>
                </div>`;
      }).join('');

    return `
            <div class="card mb-4 ${overdue ? 'risk-flag high' : ''}" style="border-right: 3px solid ${a.status === 'مكتمل' ? 'var(--status-completed)' : a.status === 'معلق' ? 'var(--status-blocked)' : 'var(--status-progress)'};"
                 data-action-id="${a.id}">

              <!-- Header row: type + badges + buttons -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${a.actionType}</strong>
                  <span class="badge badge-${badgeClass}">${a.status}</span>
                  ${overdue ? '<span class="badge badge-blocked">متأخر</span>' : ''}
                  ${!a.caseId ? '<span class="badge badge-open" style="font-size:9px;">مستوى العميل</span>' : ''}
                </div>
                <div class="flex gap-2">
                  ${canComplete ? `<button class="btn btn-primary btn-sm complete-action-btn" data-id="${a.id}">✓ إكمال</button>` : ''}
                  ${canEdit ? `<button class="btn btn-ghost btn-sm edit-action-btn" data-id="${a.id}" title="تعديل الإجراء (شريك فقط)"><i class='bx bx-edit'></i> تعديل</button>` : ''}
                </div>
              </div>

              <!-- Details -->
              ${clientData ? `<div class="text-xs text-secondary mb-1">العميل: <strong>${clientData.name}</strong></div>` : ''}
              <div class="text-sm text-secondary">المسؤول: ${responsible ? responsible.name : '—'}</div>
              ${a.title ? `<div class="text-sm text-secondary mt-1">الوصف: ${a.title}</div>` : ''}
              ${a.priority ? `<span class="badge badge-progress" style="margin-top:4px;display:inline-block;">أولوية: ${a.priority}</span>` : ''}
              ${a.dueDate ? `<div class="text-xs text-secondary mt-1">تاريخ الاستحقاق: ${formatDate(a.dueDate)}</div>` : ''}
              ${a.executionDate ? `<div class="text-xs text-accent mt-1">تم التنفيذ: ${formatDate(a.executionDate)}</div>` : ''}
              ${a.executionDetails ? `<div class="text-sm mt-2" style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-sm);">${a.executionDetails}</div>` : ''}
              ${a.notes ? `<div class="text-xs text-secondary mt-2">${a.notes}</div>` : ''}

              <!-- Sub-tasks -->
              ${a.subTasks && a.subTasks.length > 0 ? `
                <div class="mt-4">
                  <div class="text-xs font-semibold text-secondary mb-2">المهام الفرعية:</div>
                  <ul class="subtask-list">
                    ${a.subTasks.map((st, idx) => `
                      <li class="subtask-item ${st.completed ? 'completed' : ''}">
                        <input type="checkbox" ${st.completed ? 'checked' : ''} class="subtask-check" data-action-id="${a.id}" data-idx="${idx}" />
                        <span>${st.title}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}

              <!-- Action History (toggle) -->
              <div class="action-history" id="history-${a.id}">
                <button class="action-history-toggle" data-target="history-body-${a.id}">
                  🕒 سجل التعديلات (${history.length})
                </button>
                <div class="action-history-body" id="history-body-${a.id}" style="display:none;">
                  ${historyHtml}
                </div>
              </div>

            </div>
          `;
  }).join('')}
      </div>
      
      <!-- Deadlines Tab -->
      <div class="tab-panel" id="tab-deadlines">
        <div class="flex justify-between items-center mb-4">
          <h3>المواعيد النهائية</h3>
          <button class="btn btn-primary btn-sm" id="add-deadline-btn"><i class='bx bx-plus'></i> إضافة موعد</button>
        </div>
        ${deadlines.length === 0 ? '<div class="empty-state"><p>لا توجد مواعيد نهائية</p></div>' : ''}
        ${deadlines.map(d => {
    const responsible = Store.getById(ENTITIES.USERS, d.responsibleUserId);
    const badgeClass = DEADLINE_STATUS_BADGE[d.status] || 'open';
    const days = daysUntil(d.endDate);
    const overdue = d.status === 'مفتوح' && days < 0;
    const approaching = d.status === 'مفتوح' && days >= 0 && days <= 3;
    return `
            <div class="card mb-4" style="border-right: 3px solid ${overdue ? 'var(--risk-high)' : approaching ? 'var(--risk-medium)' : d.status === 'مكتمل' ? 'var(--status-completed)' : 'var(--status-open)'};">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${d.deadlineType}</strong>
                  <span class="badge badge-${badgeClass}">${d.status}</span>
                  ${overdue ? '<span class="badge badge-blocked">متأخر!</span>' : ''}
                  ${approaching ? '<span class="badge badge-progress">يقترب</span>' : ''}
                </div>
                ${d.status === 'مفتوح' ? `<button class="btn btn-primary btn-sm complete-deadline-btn" data-id="${d.id}">✓ إكمال</button>` : ''}
              </div>
              <div class="flex gap-6 text-sm text-secondary">
                <span>من: ${formatDate(d.startDate)}</span>
                <span>إلى: ${formatDate(d.endDate)}</span>
                <span>المسؤول: ${responsible ? responsible.name : '—'}</span>
              </div>
              ${d.status === 'مفتوح' ? `<div class="text-xs mt-2 ${overdue ? 'text-accent' : ''}">${overdue ? `متأخر بـ ${Math.abs(days)} يوم` : days === 0 ? 'اليوم!' : `متبقي ${days} يوم`}</div>` : ''}
              ${d.completionNote ? `<div class="text-sm mt-2" style="background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-sm);">ملاحظة الإكمال: ${d.completionNote}</div>` : ''}
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // Add Session
  container.querySelector('#add-session-btn')?.addEventListener('click', () => {
    openSessionModal(params.id, caseData, users, container, params);
  });

  // Create Action (Manual)
  container.querySelector('#create-action-btn')?.addEventListener('click', () => {
    const clientId = caseData.primaryClientId || caseData.clientId || '';
    openCreateActionModal(params.id, clientId, caseData, users, container, params);
  });

  // Edit Session buttons
  container.querySelectorAll('.edit-session-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const session = Store.getById(ENTITIES.SESSIONS, btn.dataset.id);
      if (session) openSessionModal(params.id, caseData, users, container, params, session, false);
    });
  });

  // Close Session buttons
  container.querySelectorAll('.close-session-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const session = Store.getById(ENTITIES.SESSIONS, btn.dataset.id);
      if (session) openSessionModal(params.id, caseData, users, container, params, session, true);
    });
  });

  // Complete Action  (Responsible user OR Partner)
  container.querySelectorAll('.complete-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openCompleteActionModal(btn.dataset.id, container, params);
    });
  });

  // Edit Action  (Partner ONLY) — delegates to shared action-modals.js
  container.querySelectorAll('.edit-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openPartnerEditActionModal(
        btn.dataset.id,
        () => renderCaseDetail(container, params)
      );
    });
  });

  // Action History toggles
  container.querySelectorAll('.action-history-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = document.getElementById(btn.dataset.target);
      if (!body) return;
      const isHidden = body.style.display === 'none';
      body.style.display = isHidden ? 'block' : 'none';
      btn.classList.toggle('open', isHidden);
    });
  });

  // Sub-task checkboxes
  container.querySelectorAll('.subtask-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const action = Store.getById(ENTITIES.ACTIONS, cb.dataset.actionId);
      if (action) {
        const idx = parseInt(cb.dataset.idx);
        action.subTasks[idx].completed = cb.checked;
        Store.update(ENTITIES.ACTIONS, action.id, { subTasks: action.subTasks });
        logAudit(ENTITIES.ACTIONS, action.id, 'update', { subTaskIndex: idx, completed: cb.checked });
      }
    });
  });

  // Add Deadline
  container.querySelector('#add-deadline-btn')?.addEventListener('click', () => {
    openDeadlineModal(params.id, users, container, params);
  });

  // Complete Deadline
  container.querySelectorAll('.complete-deadline-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openCompleteDeadlineModal(btn.dataset.id, container, params);
    });
  });
}

// ------ MANUAL ACTION CREATION MODAL (Case-Bound) ------
function openCreateActionModal(caseId, clientId, caseData, users, container, params) {
  // Only active users with assignable roles appear
  const assignableUsers = users.filter(u => u.active && ASSIGNABLE_ROLES.includes(u.role));

  const content = `
    <form id="create-action-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="ca-action-type" required>
            <option value="">اختر النوع</option>
            ${getActionTypes().map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ca-priority">
            <option value="">بدون أولوية</option>
            ${PRIORITY_LEVELS.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">وصف / عنوان الإجراء</label>
        <input type="text" class="form-input" id="ca-title" placeholder="وصف مختصر للإجراء..." />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
          <select class="form-select" id="ca-responsible" required>
            <option value="">اختر المحامي المسؤول</option>
            ${assignableUsers.map(u => `<option value="${u.id}" ${u.id === caseData.ownerId ? 'selected' : ''}>${u.name} (${u.role})</option>`).join('')}
          </select>
          <div class="form-hint">يُعرض فقط المستخدمون النشطون</div>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ca-due-date" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="ca-notes" placeholder="أي ملاحظات إضافية..."></textarea>
      </div>

      <div id="ca-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-create-action-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal('إنشاء إجراء يدوي', content, { footer, large: true });

  document.getElementById('save-create-action-btn').addEventListener('click', () => {
    const actionType = document.getElementById('ca-action-type').value;
    const title = document.getElementById('ca-title').value.trim();
    const priority = document.getElementById('ca-priority').value;
    const responsibleUserId = document.getElementById('ca-responsible').value;
    const dueDate = document.getElementById('ca-due-date').value;
    const notes = document.getElementById('ca-notes').value.trim();

    const errors = [];
    if (!actionType) errors.push('نوع الإجراء مطلوب');
    if (!responsibleUserId) errors.push('المحامي المسؤول مطلوب – يجب اختياره');

    if (errors.length > 0) {
      const errDiv = document.getElementById('ca-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = errors.join('<br>');
      return;
    }

    const actionData = createAction({
      clientId,
      caseId,
      sessionId: '',
      actionType,
      title,
      priority,
      responsibleUserId,
      status: 'مفتوح',
      dueDate,
      notes
    });

    const newAction = Store.create(ENTITIES.ACTIONS, actionData);
    logAudit(ENTITIES.ACTIONS, newAction.id, 'create', {
      manual: true,
      actionType,
      responsibleUserId,
      caseId
    });

    showToast(`تم إنشاء الإجراء: ${actionType}`, 'success');
    closeModal();
    renderCaseDetail(container, params);
  });
}

// ------ SESSION MODAL (with guardrails) ------
function openSessionModal(caseId, caseData, users, container, params, existingSession = null, forceClose = false) {
  const isEdit = !!existingSession;
  const isCriminalInvestigation = caseData.caseType === 'جنائي' && caseData.criminalStageType === 'تحقيقات نيابة';
  const sessionLabel = isCriminalInvestigation ? 'التحقيق' : 'الجلسة';
  const isClosing = forceClose;

  const content = `
    <form id="session-modal-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ ${sessionLabel} <span class="required">*</span></label>
          <input type="date" class="form-input" id="session-date" value="${existingSession?.date || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">نوع ${sessionLabel} <span class="required">*</span></label>
          <select class="form-select" id="session-type" required>
            <option value="">اختر النوع</option>
            ${SESSION_TYPES.map(t => `<option value="${t}" ${existingSession?.sessionType === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">نتيجة القرار <span class="required">*</span></label>
        <select class="form-select" id="session-decision" required>
          <option value="">اختر القرار</option>
          ${getDecisionTypes().map(d => `<option value="${d}" ${existingSession?.decisionResult === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group" id="next-date-group">
        <label class="form-label">تاريخ الجلسة التالية <span class="required" id="next-date-required">*</span></label>
        <input type="date" class="form-input" id="session-next-date" value="${existingSession?.nextSessionDate || ''}" />
        <div class="form-hint">مطلوب إذا كان القرار يتطلب تأجيل</div>
      </div>
      
      <div class="form-group" id="closure-reason-group" style="display: none;">
        <label class="form-label">سبب عدم وجود جلسة تالية <span class="required">*</span></label>
        <select class="form-select" id="session-closure-reason">
          <option value="">اختر السبب</option>
          ${NO_NEXT_DATE_REASONS.map(r => `<option value="${r}" ${existingSession?.closureReason === r ? 'selected' : ''}>${r}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="session-notes">${existingSession?.notes || ''}</textarea>
      </div>
      
      <div id="session-action-preview" class="mt-4" style="display:none;">
        <div class="risk-flag medium">
          <span class="risk-icon"><i class='bx bxs-zap'></i></span>
          <span id="action-preview-text"></span>
        </div>
      </div>
      
      <div id="session-form-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `;

  const saveLabel = isClosing ? '✓ حفظ وإغلاق الجلسة' : (isEdit ? '💾 حفظ' : '✓ حفظ الجلسة وإنشاء الإجراء');

  const footer = `
    <button class="btn btn-primary" id="save-session-btn">${saveLabel}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal(`${isClosing ? 'إغلاق' : isEdit ? 'تعديل' : 'إضافة'} ${sessionLabel}`, content, { footer, large: true });

  // Decision change → show/hide next date and closure reason
  function updateDecisionUI() {
    const decision = document.getElementById('session-decision').value;
    const mapping = getMappingForDecision(decision);
    const preview = document.getElementById('session-action-preview');
    const previewText = document.getElementById('action-preview-text');
    const nextDateReq = document.getElementById('next-date-required');
    const closureGroup = document.getElementById('closure-reason-group');
    const nextDateGroup = document.getElementById('next-date-group');

    const requiresNext = mapping ? mapping.requiresNextDate : false;

    if (mapping) {
      preview.style.display = 'block';
      previewText.textContent = `سيتم إنشاء إجراء تلقائي: ${mapping.actionType}`;
      if (mapping.subTasks?.length > 0) {
        previewText.textContent += ` (${mapping.subTasks.length} مهام فرعية)`;
      }
    } else {
      preview.style.display = 'none';
    }

    if (requiresNext) {
      nextDateGroup.style.display = 'block';
      nextDateReq.style.display = 'inline';
      closureGroup.style.display = 'none';
    } else if (decision) {
      // Decision exists but doesn't require next date—show closure reason (for closing)
      nextDateGroup.style.display = 'block';
      nextDateReq.style.display = 'none';
      if (isClosing) {
        closureGroup.style.display = 'block';
      } else {
        closureGroup.style.display = 'none';
      }
    } else {
      nextDateGroup.style.display = 'block';
      nextDateReq.style.display = 'inline';
      closureGroup.style.display = 'none';
    }
  }

  document.getElementById('session-decision').addEventListener('change', updateDecisionUI);
  // Initialize UI state
  updateDecisionUI();

  // Save session
  document.getElementById('save-session-btn').addEventListener('click', () => {
    const date = document.getElementById('session-date').value;
    const sessionType = document.getElementById('session-type').value;
    const decision = document.getElementById('session-decision').value;
    const nextDate = document.getElementById('session-next-date').value;
    const closureReason = document.getElementById('session-closure-reason')?.value || '';
    const notes = document.getElementById('session-notes').value;

    const errors = [];
    if (!date) errors.push('تاريخ الجلسة مطلوب');
    if (!sessionType) errors.push('نوع الجلسة مطلوب');

    // GUARDRAIL: Cannot close without decision
    if (isClosing && !decision) {
      errors.push('لا يمكن إغلاق الجلسة بدون تسجيل القرار/النتيجة');
    }
    if (!isClosing && !decision) errors.push('نتيجة القرار مطلوبة');

    const mapping = getMappingForDecision(decision);
    const requiresNextDate = mapping ? mapping.requiresNextDate : false;

    // GUARDRAIL: Adjournment requires NextSessionDate
    if (requiresNextDate && !nextDate) {
      errors.push('تاريخ الجلسة التالية مطلوب لهذا النوع من القرار');
    }

    // GUARDRAIL: No next date → closure reason required (when closing)
    if (isClosing && !requiresNextDate && decision && !nextDate && !closureReason) {
      errors.push('يجب اختيار سبب عدم وجود جلسة تالية لإغلاق الجلسة');
    }

    if (errors.length > 0) {
      const errDiv = document.getElementById('session-form-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = errors.join('<br>');
      return;
    }

    const sessionStatus = isClosing ? 'مغلق' : (existingSession?.status || 'مفتوح');

    const sessionData = createSession({
      caseId,
      date,
      sessionType,
      decisionResult: decision,
      nextSessionDate: nextDate,
      status: sessionStatus,
      closureReason: isClosing ? closureReason : (existingSession?.closureReason || ''),
      notes
    });

    let savedSession;
    if (isEdit) {
      Store.update(ENTITIES.SESSIONS, existingSession.id, sessionData);
      logAudit(ENTITIES.SESSIONS, existingSession.id, 'update', sessionData);
      savedSession = { ...existingSession, ...sessionData };
    } else {
      savedSession = Store.create(ENTITIES.SESSIONS, sessionData);
      logAudit(ENTITIES.SESSIONS, savedSession.id, 'create', sessionData);
    }

    // GUARDRAIL: Auto-create next session record when NextSessionDate is entered
    if (nextDate) {
      // Check if a session already exists for that date on this case
      const existingNext = Store.query(ENTITIES.SESSIONS, s => s.caseId === caseId && s.date === nextDate && s.id !== savedSession.id);
      if (existingNext.length === 0) {
        const nextSessionData = createSession({
          caseId,
          date: nextDate,
          sessionType: sessionType,
          decisionResult: '',
          nextSessionDate: '',
          status: 'مفتوح',
          closureReason: '',
          notes: 'جلسة تالية – تم إنشاؤها تلقائياً'
        });
        const newNext = Store.create(ENTITIES.SESSIONS, nextSessionData);
        logAudit(ENTITIES.SESSIONS, newNext.id, 'create', { auto: true, fromSession: savedSession.id });
      }
    }

    // Auto-create action based on decision mapping
    let actionCreated = false;
    if (mapping) {
      try {
        // Ensure we don't duplicate the EXACT same action type for this specific session
        const existingActions = Store.query(ENTITIES.ACTIONS, a => a.sessionId === savedSession.id && a.actionType === mapping.actionType);

        if (existingActions.length === 0) {
          const currentCase = Store.getById(ENTITIES.CASES, caseId);
          const actionData = createAction({
            caseId: caseId,
            sessionId: savedSession.id,
            actionType: mapping.actionType,
            responsibleUserId: currentCase?.ownerId || '',
            status: 'مفتوح',
            subTasks: mapping.subTasks ? mapping.subTasks.map(st => ({ ...st })) : [],
            dueDate: nextDate || '',
            notes: mapping.executionProof ? `إثبات التنفيذ المطلوب: ${mapping.executionProof}` : ''
          });

          const newAction = Store.create(ENTITIES.ACTIONS, actionData);
          logAudit(ENTITIES.ACTIONS, newAction.id, 'create', { auto: true, decision, sessionId: savedSession.id });
          actionCreated = true;
          console.log('Action automatically created:', newAction);
        } else {
          console.log('Action of this type already exists for this session, skipping creation.');
        }
      } catch (err) {
        console.error('Error creating action:', err);
        showToast('حدث خطأ أثناء إنشاء الإجراء التلقائي', 'error');
      }
    }

    if (actionCreated) {
      showToast(`تم ${isClosing ? 'إغلاق' : 'حفظ'} الجلسة وإنشاء إجراء: ${mapping.actionType}`, 'success');
    } else if (isClosing) {
      showToast('تم إغلاق الجلسة بنجاح', 'success');
    } else {
      showToast('تم حفظ الجلسة', 'success');
    }

    // Handle "referral to court" – create linked case
    if (!isEdit && doesDecisionCreateLinkedCase(decision)) {
      const currentCase = Store.getById(ENTITIES.CASES, caseId);
      if (currentCase) {
        showToast('يمكنك الآن إنشاء قضية محكمة مرتبطة من صفحة القضايا', 'info', 5000);
      }
    }

    closeModal();
    renderCaseDetail(container, params);
  });
}

// ------ COMPLETE ACTION MODAL ------
function openCompleteActionModal(actionId, container, params) {
  const action = Store.getById(ENTITIES.ACTIONS, actionId);
  if (!action) return;

  const content = `
    <form id="complete-action-form">
      <div class="mb-4">
        <strong>نوع الإجراء:</strong> ${action.actionType}
      </div>
      ${action.notes ? `<div class="text-sm text-secondary mb-4">${action.notes}</div>` : ''}
      
      <div class="form-group">
        <label class="form-label">تاريخ التنفيذ <span class="required">*</span></label>
        <input type="date" class="form-input" id="action-exec-date" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">تفاصيل التنفيذ / إثبات <span class="required">*</span></label>
        <textarea class="form-textarea" id="action-exec-details" required placeholder="أدخل تفاصيل التنفيذ والإثبات (مثل: رقم المحضر، مرجع التصريح، إيصال التقديم...)"></textarea>
      </div>
      
      <div id="complete-action-errors" class="form-error" style="display:none;"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="confirm-complete-action">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal('إكمال الإجراء', content, { footer });

  document.getElementById('confirm-complete-action').addEventListener('click', () => {
    const execDate = document.getElementById('action-exec-date').value;
    const execDetails = document.getElementById('action-exec-details').value.trim();

    if (!execDate || !execDetails) {
      const errDiv = document.getElementById('complete-action-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = 'تاريخ التنفيذ وتفاصيل التنفيذ مطلوبان';
      showToast('لا يمكن إكمال الإجراء بدون بيانات التنفيذ', 'error');
      return;
    }

    Store.update(ENTITIES.ACTIONS, actionId, {
      status: 'مكتمل',
      executionDate: execDate,
      executionDetails: execDetails
    });
    logAudit(ENTITIES.ACTIONS, actionId, 'complete', { executionDate: execDate });

    showToast('تم إكمال الإجراء بنجاح', 'success');
    closeModal();
    renderCaseDetail(container, params);
  });
}

// openPartnerEditActionModal is now in pages/actions/action-modals.js (shared module)









// ------ DEADLINE MODAL ------
function openDeadlineModal(caseId, users, container, params) {
  const content = `
    <form id="deadline-modal-form">
      <div class="form-group">
        <label class="form-label">نوع الموعد النهائي <span class="required">*</span></label>
        <select class="form-select" id="deadline-type" required>
          <option value="">اختر النوع</option>
          ${DEADLINE_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ البداية <span class="required">*</span></label>
          <input type="date" class="form-input" id="deadline-start" required />
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ النهاية <span class="required">*</span></label>
          <input type="date" class="form-input" id="deadline-end" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">المسؤول <span class="required">*</span></label>
        <select class="form-select" id="deadline-responsible" required>
          <option value="">اختر المسؤول</option>
          ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
      </div>
      <div id="deadline-form-errors" class="form-error" style="display:none;"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-deadline-btn">✓ إضافة الموعد</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal('إضافة موعد نهائي', content, { footer });

  document.getElementById('save-deadline-btn').addEventListener('click', () => {
    const type = document.getElementById('deadline-type').value;
    const start = document.getElementById('deadline-start').value;
    const end = document.getElementById('deadline-end').value;
    const responsible = document.getElementById('deadline-responsible').value;

    if (!type || !start || !end || !responsible) {
      document.getElementById('deadline-form-errors').style.display = 'block';
      document.getElementById('deadline-form-errors').innerHTML = 'جميع الحقول مطلوبة';
      return;
    }

    const data = createDeadline({ caseId, deadlineType: type, startDate: start, endDate: end, responsibleUserId: responsible });
    const newDeadline = Store.create(ENTITIES.DEADLINES, data);
    logAudit(ENTITIES.DEADLINES, newDeadline.id, 'create', data);

    showToast('تم إضافة الموعد النهائي', 'success');
    closeModal();
    renderCaseDetail(container, params);
  });
}

// ------ COMPLETE DEADLINE MODAL ------
function openCompleteDeadlineModal(deadlineId, container, params) {
  const content = `
    <form id="complete-deadline-form">
      <div class="form-group">
        <label class="form-label">ملاحظة الإكمال <span class="required">*</span></label>
        <textarea class="form-textarea" id="deadline-completion-note" required placeholder="أدخل ملاحظة الإكمال..."></textarea>
      </div>
      <div id="deadline-complete-errors" class="form-error" style="display:none;"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="confirm-complete-deadline">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal('إكمال الموعد النهائي', content, { footer });

  document.getElementById('confirm-complete-deadline').addEventListener('click', () => {
    const note = document.getElementById('deadline-completion-note').value.trim();
    if (!note) {
      document.getElementById('deadline-complete-errors').style.display = 'block';
      document.getElementById('deadline-complete-errors').innerHTML = 'ملاحظة الإكمال مطلوبة';
      return;
    }

    Store.update(ENTITIES.DEADLINES, deadlineId, { status: 'مكتمل', completionNote: note });
    logAudit(ENTITIES.DEADLINES, deadlineId, 'complete', { completionNote: note });
    showToast('تم إكمال الموعد النهائي', 'success');
    closeModal();
    renderCaseDetail(container, params);
  });
}

export default { renderCaseDetail };
