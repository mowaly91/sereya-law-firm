// ========================================
// PAGE: Admin System Settings
// ========================================

import Store from '../../data/store.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { isPartner } from '../../data/permissions.js';

export function renderAdminSettings(container) {
    setPageTitle('إعدادات النظام');

    if (!isPartner()) {
        container.innerHTML = '<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';
        return;
    }

    const workdayEndTime = Store.getSetting('workdayEndTime') || '17:00';

    container.innerHTML = `
    <div class="animate-fade-in">
        <div class="page-header">
            <div>
                <h1><i class='bx bxs-cog'></i> إعدادات النظام</h1>
                <div class="page-header-sub">الإعدادات العامة للنظام</div>
            </div>
        </div>

        <div class="card" style="max-width: 600px;">
            <h3 class="mb-4" style="color: var(--accent-primary);">🔔 إعدادات الإشعارات</h3>

            <div class="form-group">
                <label class="form-label">وقت نهاية يوم العمل <span class="required">*</span></label>
                <input type="time" class="form-input" id="workday-end-time" value="${workdayEndTime}" />
                <div class="form-hint">سيتم عرض إشعار بالجلسات غير المكتملة عند هذا الوقت يومياً</div>
            </div>

            <div class="flex gap-3 mt-6">
                <button class="btn btn-primary" id="save-settings-btn">💾 حفظ الإعدادات</button>
            </div>
        </div>
    </div>
    `;

    container.querySelector('#save-settings-btn').addEventListener('click', () => {
        const time = document.getElementById('workday-end-time').value;
        if (!time) {
            showToast('وقت نهاية يوم العمل مطلوب', 'error');
            return;
        }
        Store.setSetting('workdayEndTime', time);
        showToast('تم حفظ الإعدادات بنجاح', 'success');
    });
}

export default { renderAdminSettings };
