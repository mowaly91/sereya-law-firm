// ========================================
// PAGE: Decision→Action Mapping (Admin)
// ========================================

import { setPageTitle } from '../../main.js';
import { getDecisionActionMappings, updateMapping, addMapping, deleteMapping } from '../../config/decision-action-map.js';
import { DECISION_TYPES, ACTION_TYPES } from '../../data/models.js';
import { showToast } from '../../components/toast.js';
import { openModal, closeModal } from '../../components/modal.js';
import { isPartner } from '../../data/permissions.js';

export function renderDecisionMapping(container) {
    setPageTitle('ربط القرارات بالإجراءات');

    if (!isPartner()) {
        container.innerHTML = '<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';
        return;
    }

    const mappings = getDecisionActionMappings();

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-cog'></i> ربط القرارات بالإجراءات</h1>
          <div class="page-header-sub">إعدادات الربط التلقائي بين قرارات الجلسات والإجراءات المطلوبة</div>
        </div>
        <button class="btn btn-primary" id="add-mapping-btn"><i class='bx bx-plus'></i> إضافة ربط</button>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>نوع القرار</th>
              <th>الإجراء المنشأ تلقائياً</th>
              <th>إثبات التنفيذ</th>
              <th>يتطلب تاريخ تالي</th>
              <th>مهام فرعية</th>
              <th>عاجل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${mappings.map(m => `
              <tr>
                <td><strong>${m.decisionType}</strong></td>
                <td><span class="badge badge-open">${m.actionType}</span></td>
                <td class="text-sm">${m.executionProof || '—'}</td>
                <td>${m.requiresNextDate ? '✅' : '❌'}</td>
                <td>${m.subTasks?.length > 0 ? `${m.subTasks.length} مهام` : '—'}</td>
                <td>${m.urgent ? "<i class='bx bxs-circle'></i>" : '—'}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-mapping" data-id="${m.id}"><i class='bx bx-edit'></i></button>
                    <button class="btn btn-ghost btn-sm delete-mapping" data-id="${m.id}"><i class='bx bx-trash'></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

    // Add mapping
    container.querySelector('#add-mapping-btn').addEventListener('click', () => {
        openMappingModal(null, container);
    });

    // Edit mapping
    container.querySelectorAll('.edit-mapping').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = mappings.find(x => x.id === btn.dataset.id);
            if (m) openMappingModal(m, container);
        });
    });

    // Delete mapping
    container.querySelectorAll('.delete-mapping').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteMapping(btn.dataset.id);
            showToast('تم حذف الربط', 'success');
            renderDecisionMapping(container);
        });
    });
}

function openMappingModal(existing, container) {
    const isEdit = !!existing;

    const content = `
    <form id="mapping-form">
      <div class="form-group">
        <label class="form-label">نوع القرار <span class="required">*</span></label>
        <select class="form-select" id="map-decision" required>
          <option value="">اختر</option>
          ${DECISION_TYPES.map(d => `<option value="${d}" ${existing?.decisionType === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">الإجراء المنشأ <span class="required">*</span></label>
        <select class="form-select" id="map-action" required>
          <option value="">اختر</option>
          ${ACTION_TYPES.map(a => `<option value="${a}" ${existing?.actionType === a ? 'selected' : ''}>${a}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">إثبات التنفيذ المطلوب</label>
        <input type="text" class="form-input" id="map-proof" value="${existing?.executionProof || ''}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="map-requires-date" ${existing?.requiresNextDate !== false ? 'checked' : ''} />
            <span>يتطلب تاريخ جلسة تالية</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="map-urgent" ${existing?.urgent ? 'checked' : ''} />
            <span>إجراء عاجل</span>
          </label>
        </div>
      </div>
    </form>
  `;

    const footer = `
    <button class="btn btn-primary" id="save-mapping">${isEdit ? '💾 حفظ' : '✓ إضافة'}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;

    openModal(isEdit ? 'تعديل الربط' : 'إضافة ربط جديد', content, { footer });

    document.getElementById('save-mapping').addEventListener('click', () => {
        const data = {
            decisionType: document.getElementById('map-decision').value,
            actionType: document.getElementById('map-action').value,
            executionProof: document.getElementById('map-proof').value,
            requiresNextDate: document.getElementById('map-requires-date').checked,
            urgent: document.getElementById('map-urgent').checked
        };

        if (!data.decisionType || !data.actionType) {
            showToast('نوع القرار والإجراء مطلوبان', 'error');
            return;
        }

        if (isEdit) {
            updateMapping(existing.id, data);
        } else {
            addMapping(data);
        }

        showToast(isEdit ? 'تم تحديث الربط' : 'تم إضافة الربط', 'success');
        closeModal();
        renderDecisionMapping(container);
    });
}

export default { renderDecisionMapping };
