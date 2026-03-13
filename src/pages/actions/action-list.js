// ========================================
// PAGE: Actions List – Global View + Create Action (Client Required)
// Spec: E) GLOBAL ACTION CREATION
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, ACTION_STATUS_BADGE, PRIORITY_LEVELS, ASSIGNABLE_ROLES, createAction } from '../../data/models.js';
import { setPageTitle, formatDate, isOverdue } from '../../main.js';
import { getCurrentUser, getUserRoleKey, canEditActions } from '../../data/permissions.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal } from '../../components/modal.js';
import { logAudit } from '../../data/audit.js';
import { openPartnerEditActionModal, openProgressUpdateModal } from './action-modals.js';
import { getActionTypes } from '../../data/lookup-service.js';

export function renderActionList(container) {
  setPageTitle('الإجراءات');

  const currentUser = getCurrentUser();
  const roleKey = currentUser ? getUserRoleKey(currentUser) : null;
  // Lawyers and Trainees: restricted to their own actions
  const isRestrictedView = roleKey === 'lawyer' || roleKey === 'trainee';

  let allActions = Store.getAll(ENTITIES.ACTIONS);
  if (isRestrictedView && currentUser) {
    allActions = allActions.filter(a => a.responsibleUserId === currentUser.id);
  }

  const allCases = Store.getAll(ENTITIES.CASES);
  const allClients = Store.getAll(ENTITIES.CLIENTS);
  const allUsers = Store.getAll(ENTITIES.USERS);

  // ── Permission-aware accessible clients ──────────────────────────────────
  // Partners/CaseOwners see all clients.
  // Lawyers/Trainees see only clients whose cases they are owner/responsible on.
  function getAccessibleClients() {
    if (!isRestrictedView) return allClients;
    const clientIdSet = new Set();
    allCases.forEach(c => {
      const isOwner = c.ownerId === (currentUser && currentUser.id);
      const isResponsible = allActions.some(a => a.caseId === c.id && a.responsibleUserId === (currentUser && currentUser.id));
      if (isOwner || isResponsible) {
        if (c.primaryClientId) clientIdSet.add(c.primaryClientId);
        if (c.clientId) clientIdSet.add(c.clientId);
        (c.clientIds || []).forEach(id => clientIdSet.add(id));
      }
    });
    return allClients.filter(cl => clientIdSet.has(cl.id));
  }

  const accessibleClients = getAccessibleClients();

  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-zap'></i> الإجراءات</h1>
          <div class="page-header-sub">
            ${allActions.filter(a => a.status !== 'مكتمل').length} إجراء مفتوح من ${allActions.length} إجمالي${isRestrictedView ? ' (مهامي فقط)' : ''}
          </div>
        </div>
        <button class="btn btn-primary" id="global-create-action-btn"><i class='bx bx-plus'></i> إنشاء إجراء</button>
      </div>

      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="action-search" placeholder="بحث بالعميل، القضية، النوع..." />
        </div>
        <select class="filter-select" id="filter-action-type">
          <option value="">كل الأنواع</option>
          ${getActionTypes().map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-action-status">
          <option value="">كل الحالات</option>
          <option value="مفتوح">مفتوح</option>
          <option value="قيد التنفيذ">قيد التنفيذ</option>
          <option value="مكتمل">مكتمل</option>
          <option value="معلق">معلق</option>
        </select>
        <select class="filter-select" id="filter-action-scope">
          <option value="">كل الإجراءات</option>
          <option value="case">مرتبطة بقضية</option>
          <option value="client">على مستوى العميل</option>
        </select>
        ${!isRestrictedView ? `
        <select class="filter-select" id="filter-responsible">
          <option value="">كل المحامين</option>
          ${allUsers.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
        </select>` : ''}
      </div>

      <div id="actions-container"></div>
    </div>
  `;

  // ── Render table ─────────────────────────────────────────────────────────
  function renderActions() {
    const search = document.getElementById('action-search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-action-type').value;
    const statusFilter = document.getElementById('filter-action-status').value;
    const scopeFilter = document.getElementById('filter-action-scope').value;
    const responsibleFilter = !isRestrictedView
      ? (document.getElementById('filter-responsible')?.value || '') : '';

    let filtered = allActions;
    if (typeFilter) filtered = filtered.filter(a => a.actionType === typeFilter);
    if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
    if (scopeFilter === 'case') filtered = filtered.filter(a => !!a.caseId);
    if (scopeFilter === 'client') filtered = filtered.filter(a => !a.caseId);
    if (responsibleFilter) filtered = filtered.filter(a => a.responsibleUserId === responsibleFilter);
    if (search) {
      filtered = filtered.filter(a => {
        const caseData = a.caseId ? Store.getById(ENTITIES.CASES, a.caseId) : null;
        const clientData = a.clientId ? Store.getById(ENTITIES.CLIENTS, a.clientId) : null;
        return a.actionType.toLowerCase().includes(search)
          || (a.title && a.title.toLowerCase().includes(search))
          || (a.notes && a.notes.toLowerCase().includes(search))
          || (caseData && (caseData.caseNo.includes(search) || caseData.subject.toLowerCase().includes(search)))
          || (clientData && clientData.name.toLowerCase().includes(search));
      });
    }

    // Group by Action Type
    const grouped = {};
    filtered.forEach(a => {
      const typeKey = a.actionType || 'غير محدد';
      if (!grouped[typeKey]) grouped[typeKey] = [];
      grouped[typeKey].push(a);
    });

    const actionContainer = document.getElementById('actions-container');

    if (Object.keys(grouped).length === 0) {
      actionContainer.innerHTML = '<div class="empty-state"><p>لا توجد إجراءات</p></div>';
      return;
    }

    actionContainer.innerHTML = Object.entries(grouped).map(([type, acts]) => `
      <div class="action-group">
        <div class="action-group-header">
          <span class="action-group-icon"><i class='bx bxs-zap'></i></span>
          <span class="action-group-title">${type}</span>
          <span class="action-group-count">${acts.length}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>القضية</th>
                <th>الوصف</th>
                <th>المسؤول</th>
                <th>الحالة</th>
                <th>الأولوية</th>
                <th>تاريخ الاستحقاق</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${acts.map(a => {
      const caseData = a.caseId ? Store.getById(ENTITIES.CASES, a.caseId) : null;
      const clientData = a.clientId ? Store.getById(ENTITIES.CLIENTS, a.clientId) : null;
      // Backward compat: derive client from case if action didn't store clientId directly
      const resolvedClient = clientData || (caseData
        ? Store.getById(ENTITIES.CLIENTS, caseData.primaryClientId || caseData.clientId)
        : null);
      const responsible = Store.getById(ENTITIES.USERS, a.responsibleUserId);
      const badgeClass = ACTION_STATUS_BADGE[a.status] || 'open';
      const overdue = a.dueDate && isOverdue(a.dueDate) && a.status !== 'مكتمل';
      const isClientLevel = !a.caseId;
      const userIsPartner = canEditActions();
      const isResponsible = currentUser && a.responsibleUserId === currentUser.id;

      // Case access check: restricted users need to be owner/assignee
      const hasCaseAccess = !isRestrictedView
        || isClientLevel
        || (currentUser && caseData && (
          caseData.ownerId === currentUser.id
          || a.responsibleUserId === currentUser.id));

      // Action column buttons:
      //   Partner  → <i class='bx bx-edit'></i> تعديل  (full edit)
      //   Responsible lawyer (non-partner) → <i class='bx bxs-zap'></i> تحديث التقدم  (progress update)
      //   Both: also show case link when applicable
      const editBtn = userIsPartner
        ? `<button class="btn btn-ghost btn-sm action-edit-btn" data-id="${a.id}" title="تعديل شامل"><i class='bx bx-edit'></i> تعديل</button>`
        : '';
      const progressBtn = !userIsPartner && isResponsible && a.status !== 'مكتمل'
        ? `<button class="btn btn-primary btn-sm action-progress-btn" data-id="${a.id}"><i class='bx bxs-zap'></i> تحديث التقدم</button>`
        : '';
      const caseBtn = caseData && hasCaseAccess
        ? `<button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${a.caseId}'">عرض القضية ←</button>`
        : caseData && !hasCaseAccess
          ? `<span class="text-secondary text-xs">لا يوجد وصول</span>`
          : '';

      return `
                  <tr class="${overdue ? 'risk-flag high' : ''}">
                    <td>
                      <span class="text-sm font-semibold">${resolvedClient ? resolvedClient.name : '—'}</span>
                    </td>
                    <td>
                      ${caseData
          ? (hasCaseAccess
            ? `<a href="#/cases/${a.caseId}" style="color:var(--text-link);">${caseData.caseNo}/${caseData.year}</a>`
            : `<span class="text-secondary">${caseData.caseNo}/${caseData.year}</span>`)
          : `<span class="badge badge-open" style="font-size:10px;">مستوى العميل</span>`
        }
                    </td>
                    <td class="text-sm">${a.title || '—'}</td>
                    <td>${responsible ? responsible.name : '—'}</td>
                    <td>
                      <span class="badge badge-${badgeClass}">${a.status}</span>
                      ${overdue ? '<span class="badge badge-blocked">متأخر</span>' : ''}
                    </td>
                    <td>${a.priority ? `<span class="badge badge-progress">${a.priority}</span>` : '—'}</td>
                    <td>${formatDate(a.dueDate)}</td>
                    <td>
                      <div class="flex gap-2" style="align-items:center;">
                        ${editBtn}
                        ${progressBtn}
                        ${caseBtn}
                      </div>
                    </td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('');
  }

  renderActions();

  // Re-bind action buttons after every render (rows are replaced by innerHTML)
  function bindActionButtons() {
    document.querySelectorAll('.action-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openPartnerEditActionModal(btn.dataset.id, () => renderActionList(container));
      });
    });
    document.querySelectorAll('.action-progress-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openProgressUpdateModal(btn.dataset.id, () => renderActionList(container));
      });
    });
  }

  // Patch renderActions to also rebind after each render
  const _origRender = renderActions;
  function renderAndBind() {
    _origRender();
    bindActionButtons();
  }

  // Replace filter listeners with renderAndBind
  document.getElementById('action-search').removeEventListener('input', renderActions);
  document.getElementById('action-search').addEventListener('input', renderAndBind);
  document.getElementById('filter-action-type').removeEventListener('change', renderActions);
  document.getElementById('filter-action-type').addEventListener('change', renderAndBind);
  document.getElementById('filter-action-status').removeEventListener('change', renderActions);
  document.getElementById('filter-action-status').addEventListener('change', renderAndBind);
  document.getElementById('filter-action-scope').removeEventListener('change', renderActions);
  document.getElementById('filter-action-scope').addEventListener('change', renderAndBind);
  if (!isRestrictedView) {
    document.getElementById('filter-responsible')?.addEventListener('change', renderAndBind);
  }

  // Bind on initial render
  bindActionButtons();

  // ── Global Create Action button ───────────────────────────────────────────
  container.querySelector('#global-create-action-btn')?.addEventListener('click', () => {
    openGlobalCreateActionModal(
      accessibleClients, allCases, allUsers, isRestrictedView, currentUser, container
    );
  });

  // ── Re-render page after modal saves ─────────────────────────────────────
  function refreshPage() {
    renderActionList(container);
  }

  // Expose refresh for modal callbacks (store on container for easy retrieval)
  container._refreshActionList = refreshPage;
}

// ============================================================
// GLOBAL CREATE ACTION MODAL
// Client = REQUIRED | Case = OPTIONAL (filtered by client)
// ============================================================
function openGlobalCreateActionModal(accessibleClients, allCases, allUsers, isRestrictedView, currentUser, container) {
  const assignableUsers = allUsers.filter(u => u.active && ASSIGNABLE_ROLES.includes(u.role));

  // Build client options
  const clientOptions = accessibleClients.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');

  const content = `
    <form id="global-action-form" autocomplete="off">

      <!-- Client + Case row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل <span class="required">*</span></label>
          <!-- Searchable client: text filter above select -->
          <input type="text" class="form-input mb-2" id="gca-client-search"
                 placeholder="ابحث بالاسم..." autocomplete="off" />
          <select class="form-select" id="gca-client" required>
            <option value="">اختر العميل...</option>
            ${clientOptions}
          </select>
          <div class="form-hint">الإجراء لا يُحفظ بدون تحديد العميل</div>
        </div>

        <div class="form-group">
          <label class="form-label">القضية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-case" disabled>
            <option value="">اختر العميل أولاً...</option>
          </select>
          <div class="form-hint" id="gca-case-hint">اختر العميل لتحميل قضاياه</div>
        </div>
      </div>

      <!-- Type + Priority row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="gca-action-type" required>
            <option value="">اختر النوع</option>
            ${getActionTypes().map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-priority">
            <option value="">بدون أولوية</option>
            ${PRIORITY_LEVELS.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Title (required for global actions) -->
      <div class="form-group">
        <label class="form-label">عنوان / وصف الإجراء <span class="required">*</span></label>
        <input type="text" class="form-input" id="gca-title" required
               placeholder="وصف مختصر وواضح للإجراء المطلوب..." />
      </div>

      <!-- Responsible + Due Date row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
          <select class="form-select" id="gca-responsible" required>
            <option value="">اختر المحامي المسؤول</option>
            ${assignableUsers.map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join('')}
          </select>
          <div class="form-hint">يُعرض المستخدمون النشطون فقط</div>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق <span class="form-optional">(اختياري)</span></label>
          <input type="date" class="form-input" id="gca-due-date" />
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات <span class="form-optional">(اختياري)</span></label>
        <textarea class="form-textarea" id="gca-notes"
                  placeholder="أي معلومات إضافية متعلقة بالإجراء..."></textarea>
      </div>

      <div id="gca-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="gca-save-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

  openModal('إنشاء إجراء جديد', content, { footer, large: true });

  // ── Client search filter ─────────────────────────────────────────────────
  const clientSearchEl = document.getElementById('gca-client-search');
  const clientSelectEl = document.getElementById('gca-client');
  const caseSelectEl = document.getElementById('gca-case');
  const caseHintEl = document.getElementById('gca-case-hint');

  // All client option elements (stash original for restore)
  const allClientOptions = Array.from(clientSelectEl.options);

  clientSearchEl.addEventListener('input', () => {
    const q = clientSearchEl.value.trim().toLowerCase();
    // Remove all options from select, keep placeholder
    clientSelectEl.innerHTML = '<option value="">اختر العميل...</option>';
    const matching = accessibleClients.filter(c => c.name.toLowerCase().includes(q));
    matching.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      clientSelectEl.appendChild(opt);
    });
  });

  // ── Case cascade on client change ────────────────────────────────────────
  clientSelectEl.addEventListener('change', () => {
    const selectedClientId = clientSelectEl.value;
    caseSelectEl.innerHTML = '';
    caseSelectEl.disabled = true;

    if (!selectedClientId) {
      caseSelectEl.innerHTML = '<option value="">اختر العميل أولاً...</option>';
      caseHintEl.textContent = 'اختر العميل لتحميل قضاياه';
      // Reset responsible
      return;
    }

    // Cases where this client appears (primary or among clientIds)
    const clientCases = allCases.filter(c => {
      const ids = c.clientIds || (c.clientId ? [c.clientId] : []);
      return ids.includes(selectedClientId) || c.primaryClientId === selectedClientId || c.clientId === selectedClientId;
    });

    // Permission filter for restricted users
    const accessibleCases = isRestrictedView && currentUser
      ? clientCases.filter(c =>
        c.ownerId === currentUser.id
        || Store.getAll(ENTITIES.ACTIONS).some(a => a.caseId === c.id && a.responsibleUserId === currentUser.id)
      )
      : clientCases;

    caseSelectEl.innerHTML = '<option value="">بدون قضية (إجراء على مستوى العميل)</option>';
    accessibleCases.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.caseNo}/${c.year} – ${c.subject}`;
      opt.dataset.ownerId = c.ownerId || '';
      caseSelectEl.appendChild(opt);
    });

    caseSelectEl.disabled = false;
    caseHintEl.textContent = accessibleCases.length === 0
      ? 'لا توجد قضايا متاحة لهذا العميل'
      : `${accessibleCases.length} قضية – اختياري`;
  });

  // ── Auto-set responsible to case owner on case change ───────────────────
  caseSelectEl.addEventListener('change', () => {
    const selectedOpt = caseSelectEl.options[caseSelectEl.selectedIndex];
    const ownerId = selectedOpt?.dataset?.ownerId;
    if (ownerId) {
      const respEl = document.getElementById('gca-responsible');
      if (respEl) {
        // Select case owner if present in assignable users
        const ownerOption = Array.from(respEl.options).find(o => o.value === ownerId);
        if (ownerOption) respEl.value = ownerId;
      }
    }
  });

  // ── Save handler ─────────────────────────────────────────────────────────
  document.getElementById('gca-save-btn').addEventListener('click', () => {
    const clientId = document.getElementById('gca-client').value;
    const caseId = document.getElementById('gca-case').value;
    const actionType = document.getElementById('gca-action-type').value;
    const title = document.getElementById('gca-title').value.trim();
    const priority = document.getElementById('gca-priority').value;
    const responsibleUserId = document.getElementById('gca-responsible').value;
    const dueDate = document.getElementById('gca-due-date').value;
    const notes = document.getElementById('gca-notes').value.trim();

    const errors = [];
    if (!clientId) errors.push('العميل مطلوب – لا يمكن حفظ الإجراء بدون تحديد العميل');
    if (!actionType) errors.push('نوع الإجراء مطلوب');
    if (!title) errors.push('عنوان / وصف الإجراء مطلوب');
    if (!responsibleUserId) errors.push('المحامي المسؤول مطلوب');

    // If case selected, verify it belongs to the chosen client
    if (caseId) {
      const caseData = Store.getById(ENTITIES.CASES, caseId);
      if (caseData) {
        const caseClientIds = caseData.clientIds
          || (caseData.clientId ? [caseData.clientId] : []);
        const clientBelongsToCase = caseClientIds.includes(clientId)
          || caseData.primaryClientId === clientId
          || caseData.clientId === clientId;
        if (!clientBelongsToCase) {
          errors.push('القضية المختارة لا تنتمي للعميل المحدد');
        }
      }
    }

    if (errors.length > 0) {
      const errDiv = document.getElementById('gca-errors');
      errDiv.style.display = 'block';
      errDiv.innerHTML = errors.join('<br>');
      return;
    }

    const actionData = createAction({
      clientId,
      caseId: caseId || '',       // '' = client-level action, not case-linked
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
      source: 'global',
      clientId,
      caseId: caseId || null,
      actionType,
      responsibleUserId
    });

    const clientName = Store.getById(ENTITIES.CLIENTS, clientId)?.name || '';
    const scopeLabel = caseId ? 'ضمن القضية' : 'على مستوى العميل';
    showToast(`تم إنشاء الإجراء: ${actionType} – ${clientName} (${scopeLabel})`, 'success');
    closeModal();

    // Re-render the page to show new action
    renderActionList(container);
  });
}

export default { renderActionList };
