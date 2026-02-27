// ========================================
// PAGE: Case Form (Create / Edit)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, CASE_TYPES, STAGE_TYPES, CRIMINAL_STAGE_TYPES, CLIENT_ROLES, CASE_STATUSES, createCase } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { logAudit } from '../../data/audit.js';

export function renderCaseForm(container, params = {}) {
    const isEdit = params.id && !window.location.hash.includes('/new');
    const caseData = isEdit ? Store.getById(ENTITIES.CASES, params.id) : null;

    const clients = Store.getAll(ENTITIES.CLIENTS);
    const users = Store.getAll(ENTITIES.USERS);

    setPageTitle(isEdit ? 'تعديل القضية' : 'إضافة قضية جديدة');

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${isEdit ? "<i class='bx bx-edit'></i> تعديل القضية" : "<i class='bx bx-plus'></i> إضافة قضية جديدة"}</h1>
          <div class="page-header-sub">${isEdit ? `القضية ${caseData?.caseNo}/${caseData?.year}` : 'يتم إنشاء القضية فقط بعد الحصول على رقم القضية وتاريخ أول جلسة'}</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/cases'">↩ العودة</button>
      </div>
      
      <div class="card" style="max-width: 900px;">
        <form id="case-form">
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bx-list-check'></i> بيانات القضية الأساسية</h3>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم القضية <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-no" value="${caseData?.caseNo || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">السنة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-year" value="${caseData?.year || new Date().getFullYear()}" required />
            </div>
            <div class="form-group">
              <label class="form-label">نوع المرحلة <span class="required">*</span></label>
              <select class="form-select" id="case-stage" required>
                <option value="">اختر المرحلة</option>
                ${STAGE_TYPES.map(s => `<option value="${s}" ${caseData?.stageType === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع القضية <span class="required">*</span></label>
              <select class="form-select" id="case-type" required>
                <option value="">اختر النوع</option>
                ${CASE_TYPES.map(t => `<option value="${t}" ${caseData?.caseType === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" id="criminal-stage-group" style="display: ${caseData?.caseType === 'جنائي' ? 'block' : 'none'};">
              <label class="form-label">مرحلة القضية الجنائية <span class="required">*</span></label>
              <select class="form-select" id="case-criminal-stage">
                <option value="">اختر المرحلة الجنائية</option>
                ${CRIMINAL_STAGE_TYPES.map(s => `<option value="${s}" ${caseData?.criminalStageType === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-user-detail'></i> أطراف القضية</h3>
          
          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">العملاء <span class="required">*</span></label>
              <div class="client-tags" id="client-tags-container">
                ${(caseData?.clientIds || (caseData?.clientId ? [caseData.clientId] : [])).map(cid => {
        const cl = clients.find(c => c.id === cid);
        const isPrimary = caseData?.primaryClientId === cid;
        return cl ? `<span class="client-tag ${isPrimary ? 'primary' : ''}" data-client-id="${cid}">${cl.name}${isPrimary ? ' (رئيسي)' : ''}<button class="client-tag-remove" data-remove-id="${cid}">&times;</button></span>` : '';
    }).join('')}
              </div>
              <div class="flex gap-2">
                <select class="form-select" id="add-client-select" style="flex:1;">
                  <option value="">اختر عميل للإضافة...</option>
                  ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
                <button type="button" class="btn btn-secondary btn-sm" id="add-client-btn"><i class='bx bx-plus'></i> إضافة</button>
              </div>
            </div>
          </div>
          
          <div class="form-group" id="primary-client-group" style="display: ${(caseData?.clientIds?.length || 0) > 1 ? 'block' : 'none'};">
            <label class="form-label">العميل الرئيسي <span class="required">*</span></label>
            <div id="primary-client-radios">
              ${(caseData?.clientIds || []).map(cid => {
        const cl = clients.find(c => c.id === cid);
        return cl ? `<label class="primary-select-radio"><input type="radio" name="primary-client" value="${cid}" ${caseData?.primaryClientId === cid ? 'checked' : ''} />${cl.name}</label>` : '';
    }).join('')}
            </div>
            <div class="form-hint">سيتم عرض اسم العميل الرئيسي في التقويم ولوحة التحكم</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">صفة العميل <span class="required">*</span></label>
              <select class="form-select" id="case-client-role" required>
                <option value="">اختر الصفة</option>
                ${CLIENT_ROLES.map(r => `<option value="${r}" ${caseData?.clientRole === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم الخصم <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-opponent" value="${caseData?.opponentName || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">صفة الخصم <span class="required">*</span></label>
              <select class="form-select" id="case-opponent-role" required>
                <option value="">اختر الصفة</option>
                ${CLIENT_ROLES.map(r => `<option value="${r}" ${caseData?.opponentRole === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-bank'></i> بيانات المحكمة</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المحكمة / الجهة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-court" value="${caseData?.court || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الدائرة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-circuit" value="${caseData?.circuit || ''}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">موضوع القضية (سطر واحد) <span class="required">*</span></label>
            <input type="text" class="form-input" id="case-subject" value="${caseData?.subject || ''}" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ أول جلسة <span class="required">*</span></label>
              <input type="date" class="form-input" id="case-first-session" value="${caseData?.firstSessionDate || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
              <select class="form-select" id="case-owner" required>
                <option value="">اختر المحامي</option>
                ${users.filter(u => u.role !== 'متدرب').map(u => `<option value="${u.id}" ${caseData?.ownerId === u.id ? 'selected' : ''}>${u.name} (${u.role})</option>`).join('')}
              </select>
            </div>
          </div>
          
          ${isEdit ? `
          <div class="form-group">
            <label class="form-label">حالة القضية</label>
            <select class="form-select" id="case-status">
              ${CASE_STATUSES.map(s => `<option value="${s}" ${caseData?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          ` : ''}
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="case-notes">${caseData?.notes || ''}</textarea>
          </div>
          
          <div id="case-form-errors" class="form-error mb-4" style="display: none;"></div>
          
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary">
              ${isEdit ? '💾 حفظ التعديلات' : '✓ إنشاء القضية'}
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.location.hash='/cases'">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;

    // Toggle criminal stage field
    document.getElementById('case-type').addEventListener('change', (e) => {
        const criminalGroup = document.getElementById('criminal-stage-group');
        criminalGroup.style.display = e.target.value === 'جنائي' ? 'block' : 'none';
    });

    // --- Multi-Client Management ---
    let selectedClientIds = caseData?.clientIds ? [...caseData.clientIds] : (caseData?.clientId ? [caseData.clientId] : []);
    let selectedPrimaryId = caseData?.primaryClientId || caseData?.clientId || '';

    function refreshClientUI() {
        const tagsContainer = document.getElementById('client-tags-container');
        const primaryGroup = document.getElementById('primary-client-group');
        const primaryRadios = document.getElementById('primary-client-radios');

        tagsContainer.innerHTML = selectedClientIds.map(cid => {
            const cl = clients.find(c => c.id === cid);
            const isPrimary = selectedPrimaryId === cid;
            return cl ? `<span class="client-tag ${isPrimary ? 'primary' : ''}" data-client-id="${cid}">${cl.name}${isPrimary ? ' (رئيسي)' : ''}<button class="client-tag-remove" data-remove-id="${cid}">&times;</button></span>` : '';
        }).join('');

        // Bind remove buttons
        tagsContainer.querySelectorAll('.client-tag-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const removeId = btn.dataset.removeId;
                selectedClientIds = selectedClientIds.filter(id => id !== removeId);
                if (selectedPrimaryId === removeId) {
                    selectedPrimaryId = selectedClientIds[0] || '';
                }
                refreshClientUI();
            });
        });

        // Show/hide primary selector
        if (selectedClientIds.length > 1) {
            primaryGroup.style.display = 'block';
            primaryRadios.innerHTML = selectedClientIds.map(cid => {
                const cl = clients.find(c => c.id === cid);
                return cl ? `<label class="primary-select-radio"><input type="radio" name="primary-client" value="${cid}" ${selectedPrimaryId === cid ? 'checked' : ''} />${cl.name}</label>` : '';
            }).join('');
            // Bind radio changes
            primaryRadios.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', () => {
                    selectedPrimaryId = radio.value;
                    refreshClientUI();
                });
            });
        } else {
            primaryGroup.style.display = 'none';
            if (selectedClientIds.length === 1) {
                selectedPrimaryId = selectedClientIds[0];
            }
        }
    }

    document.getElementById('add-client-btn').addEventListener('click', () => {
        const select = document.getElementById('add-client-select');
        const clientId = select.value;
        if (!clientId) return;
        if (selectedClientIds.includes(clientId)) {
            return; // already added
        }
        selectedClientIds.push(clientId);
        if (selectedClientIds.length === 1) {
            selectedPrimaryId = clientId;
        }
        select.value = '';
        refreshClientUI();
    });

    refreshClientUI();

    // Form submit
    document.getElementById('case-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const data = createCase({
            caseNo: document.getElementById('case-no').value.trim(),
            year: document.getElementById('case-year').value.trim(),
            stageType: document.getElementById('case-stage').value,
            clientId: selectedPrimaryId,
            clientIds: [...selectedClientIds],
            primaryClientId: selectedPrimaryId,
            clientRole: document.getElementById('case-client-role').value,
            opponentName: document.getElementById('case-opponent').value.trim(),
            opponentRole: document.getElementById('case-opponent-role').value,
            court: document.getElementById('case-court').value.trim(),
            circuit: document.getElementById('case-circuit').value.trim(),
            caseType: document.getElementById('case-type').value,
            subject: document.getElementById('case-subject').value.trim(),
            firstSessionDate: document.getElementById('case-first-session').value,
            ownerId: document.getElementById('case-owner').value,
            status: isEdit ? (document.getElementById('case-status')?.value || caseData.status) : 'نشطة',
            criminalStageType: document.getElementById('case-criminal-stage')?.value || '',
            notes: document.getElementById('case-notes').value.trim()
        });

        // Validate
        const errors = [];
        if (!data.caseNo) errors.push('رقم القضية مطلوب');
        if (!data.year) errors.push('السنة مطلوبة');
        if (!data.stageType) errors.push('نوع المرحلة مطلوب');
        if (selectedClientIds.length === 0) errors.push('يجب إضافة عميل واحد على الأقل');
        if (selectedClientIds.length > 1 && !selectedPrimaryId) errors.push('يجب اختيار العميل الرئيسي عند وجود عدة عملاء');
        if (!data.clientRole) errors.push('صفة العميل مطلوبة');
        if (!data.opponentName) errors.push('اسم الخصم مطلوب');
        if (!data.opponentRole) errors.push('صفة الخصم مطلوبة');
        if (!data.court) errors.push('المحكمة مطلوبة');
        if (!data.circuit) errors.push('الدائرة مطلوبة');
        if (!data.caseType) errors.push('نوع القضية مطلوب');
        if (!data.subject) errors.push('موضوع القضية مطلوب');
        if (!data.firstSessionDate) errors.push('تاريخ أول جلسة مطلوب');
        if (!data.ownerId) errors.push('المحامي المسؤول مطلوب');
        if (data.caseType === 'جنائي' && !data.criminalStageType) errors.push('مرحلة القضية الجنائية مطلوبة');

        // Check case closure guardrails
        // NOTE: Only case-linked actions (a.caseId === params.id) block closure.
        // Client-level actions (caseId='') are excluded automatically by this query.
        if (isEdit && data.status === 'مغلقة') {
            const openActions = Store.query(ENTITIES.ACTIONS, a => a.caseId === params.id && a.caseId !== '' && a.status !== 'مكتمل');
            const openDeadlines = Store.query(ENTITIES.DEADLINES, d => d.caseId === params.id && d.status === 'مفتوح');
            if (openActions.length > 0) errors.push(`لا يمكن إغلاق القضية: يوجد ${openActions.length} إجراء مفتوح مرتبط بها`);
            if (openDeadlines.length > 0) errors.push(`لا يمكن إغلاق القضية: يوجد ${openDeadlines.length} موعد نهائي مفتوح`);
        }

        if (errors.length > 0) {
            const errDiv = document.getElementById('case-form-errors');
            errDiv.style.display = 'block';
            errDiv.innerHTML = errors.join('<br>');
            showToast('يرجى تصحيح الأخطاء', 'error');
            return;
        }

        if (isEdit) {
            Store.update(ENTITIES.CASES, params.id, data);
            logAudit(ENTITIES.CASES, params.id, 'update', data);
            showToast('تم تحديث القضية', 'success');
            window.location.hash = `/cases/${params.id}`;
        } else {
            const newCase = Store.create(ENTITIES.CASES, data);
            logAudit(ENTITIES.CASES, newCase.id, 'create', data);

            // Auto-create first session record
            const firstSession = Store.create(ENTITIES.SESSIONS, {
                caseId: newCase.id,
                date: data.firstSessionDate,
                sessionType: data.caseType === 'جنائي' && data.criminalStageType === 'تحقيقات نيابة' ? 'تحقيق' : 'جلسة استماع',
                decisionResult: '',
                nextSessionDate: '',
                notes: 'جلسة أولى – تم إنشاؤها تلقائياً'
            });
            logAudit(ENTITIES.SESSIONS, firstSession.id, 'create', { auto: true, caseId: newCase.id });

            showToast('تم إنشاء القضية وجلستها الأولى بنجاح', 'success');
            window.location.hash = `/cases/${newCase.id}`;
        }
    });
}

export default { renderCaseForm };
