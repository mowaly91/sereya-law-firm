// ========================================
// PAGE: Client Form (Create / Edit)
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, createClient } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { logAudit } from '../../data/audit.js';

export function renderClientForm(container, params = {}) {
    const isEdit = params.id && params.id !== 'new';
    const client = isEdit ? Store.getById(ENTITIES.CLIENTS, params.id) : null;

    setPageTitle(isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد');

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${isEdit ? "<i class='bx bx-edit'></i> تعديل بيانات العميل" : "<i class='bx bx-plus'></i> إضافة عميل جديد"}</h1>
          <div class="page-header-sub">${isEdit ? client?.name || '' : 'أدخل بيانات العميل الجديد'}</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة</button>
      </div>
      
      <div class="card" style="max-width: 800px;">
        <form id="client-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم العميل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-name" value="${client?.name || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الرقم القومي / السجل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-national-id" value="${client?.nationalId || ''}" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الهاتف <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-phone" value="${client?.phone || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">العنوان</label>
              <input type="text" class="form-input" id="client-address" value="${client?.address || ''}" />
            </div>
          </div>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم التوكيل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-poa" value="${client?.poaNumber || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">مكتب التوثيق <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-notary" value="${client?.notaryOffice || ''}" required />
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ التوكيل <span class="required">*</span></label>
              <input type="date" class="form-input" id="client-poa-date" value="${client?.poaDate || ''}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="client-notes">${client?.notes || ''}</textarea>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary">
              ${isEdit ? '💾 حفظ التعديلات' : '✓ إنشاء العميل'}
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.location.hash='/clients'">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;

    container.querySelector('#client-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const data = createClient({
            name: document.getElementById('client-name').value.trim(),
            nationalId: document.getElementById('client-national-id').value.trim(),
            phone: document.getElementById('client-phone').value.trim(),
            address: document.getElementById('client-address').value.trim(),
            poaNumber: document.getElementById('client-poa').value.trim(),
            notaryOffice: document.getElementById('client-notary').value.trim(),
            poaDate: document.getElementById('client-poa-date').value,
            notes: document.getElementById('client-notes').value.trim()
        });

        // Validate required fields
        if (!data.name || !data.nationalId || !data.phone || !data.poaNumber || !data.notaryOffice || !data.poaDate) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }

        if (isEdit) {
            Store.update(ENTITIES.CLIENTS, params.id, data);
            logAudit(ENTITIES.CLIENTS, params.id, 'update', data);
            showToast('تم تحديث بيانات العميل', 'success');
        } else {
            const newClient = Store.create(ENTITIES.CLIENTS, data);
            logAudit(ENTITIES.CLIENTS, newClient.id, 'create', data);
            showToast('تم إنشاء العميل بنجاح', 'success');
        }

        window.location.hash = '/clients';
    });
}

export default { renderClientForm };
