// ============================================================
// PAGE: Import Clients from Google Sheet
// ============================================================

import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { getAuthToken } from '../../data/permissions.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function renderClientSheetImport(container) {
    setPageTitle('استيراد عملاء من Google Sheets');

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-spreadsheet'></i> استيراد عملاء من Google Sheets</h1>
          <div class="page-header-sub">اقرأ بيانات العملاء مباشرةً من جدول Google Sheets وأضفهم إلى النظام</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة إلى العملاء</button>
      </div>

      <!-- Step 1: Sheet URL input -->
      <div class="card mb-4" id="step-input-card">
        <h3 class="font-bold mb-4"><span class="badge badge-primary" style="margin-left:8px;">1</span> رابط الجدول</h3>
        <div class="flex gap-3 items-end" style="flex-wrap:wrap;">
          <div class="form-group flex-1" style="min-width:240px;">
            <label class="form-label">رابط Google Sheet <span class="required">*</span></label>
            <input type="text" id="sheet-url" class="form-input" 
              placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <div class="form-group" style="min-width:140px;">
            <label class="form-label">اسم الصفحة (اختياري)</label>
            <input type="text" id="tab-name" class="form-input" placeholder="Sheet1" />
          </div>
          <button id="btn-preview" class="btn btn-primary" style="margin-bottom:27px;">
            <i class='bx bx-search'></i> معاينة البيانات
          </button>
        </div>

        <!-- Header reference -->
        <div class="mt-3 p-3 rounded" style="background:rgba(99,102,241,0.08); font-size:var(--text-sm); color:var(--text-secondary);">
          <i class='bx bx-info-circle'></i>
          الأعمدة المطلوبة في الجدول:
          <code style="margin-right:6px; direction:rtl;">الفهرس | اسم الموكل | الهاتف | الرقم القومى | رقم التوكيل | مكتب التوثيق | drive link</code>
        </div>
      </div>

      <!-- Loading -->
      <div id="loading-bar" style="display:none; text-align:center; padding:2rem;">
        <i class='bx bx-loader-alt bx-spin' style="font-size:2.5rem; color:var(--accent-primary);"></i>
        <p class="mt-3" style="color:var(--text-secondary);">جاري قراءة البيانات من Google Sheets...</p>
      </div>

      <!-- Step 2: Preview results -->
      <div id="preview-section" style="display:none;">
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap; gap:12px;">
            <h3 class="font-bold"><span class="badge badge-primary" style="margin-left:8px;">2</span> نتائج المعاينة</h3>
            <div class="flex gap-2" style="flex-wrap:wrap;">
              <span class="badge badge-open" id="stat-valid">0 صف صحيح</span>
              <span class="badge badge-closed" id="stat-invalid">0 صف خاطئ</span>
              <span class="badge" style="background:rgba(245,158,11,0.15);color:#d97706;" id="stat-conflict">0 تعارض</span>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mb-4" id="preview-tabs">
            <button class="btn btn-primary btn-sm tab-btn active" data-tab="valid">الصفوف الصحيحة</button>
            <button class="btn btn-ghost btn-sm tab-btn" data-tab="invalid">الصفوف الخاطئة</button>
            <button class="btn btn-ghost btn-sm tab-btn" data-tab="conflicts">التعارضات</button>
          </div>

          <!-- Valid rows -->
          <div id="tab-valid">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th width="40"><input type="checkbox" id="select-all-valid" /></th>
                    <th>#</th>
                    <th>اسم الموكل</th>
                    <th>الرقم القومى</th>
                    <th>الهاتف</th>
                    <th>رقم التوكيل</th>
                    <th>مكتب التوثيق</th>
                    <th>الفهرس</th>
                  </tr>
                </thead>
                <tbody id="valid-tbody"></tbody>
              </table>
            </div>
          </div>

          <!-- Invalid rows -->
          <div id="tab-invalid" style="display:none;">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>رقم الصف</th>
                    <th>البيانات الخام</th>
                    <th>الأخطاء</th>
                  </tr>
                </thead>
                <tbody id="invalid-tbody"></tbody>
              </table>
            </div>
          </div>

          <!-- Conflicts -->
          <div id="tab-conflicts" style="display:none;">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>رقم الصف</th>
                    <th>الرقم القومى</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody id="conflicts-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Step 3: Commit -->
        <div class="card" id="commit-card" style="display:none;">
          <h3 class="font-bold mb-4"><span class="badge badge-primary" style="margin-left:8px;">3</span> تأكيد الاستيراد</h3>
          <div class="flex gap-3 items-center" style="flex-wrap:wrap;">
            <div class="form-group" style="min-width:180px; margin-bottom:0;">
              <label class="form-label">وضع الاستيراد</label>
              <select id="import-mode" class="form-input">
                <option value="upsert">Upsert (إضافة + تحديث)</option>
                <option value="create">إضافة جديدة فقط</option>
                <option value="skip">تخطي المكرر</option>
              </select>
            </div>
            <button id="btn-commit" class="btn btn-success" style="align-self:flex-end;">
              <i class='bx bx-import'></i> استيراد الصفوف المختارة
            </button>
          </div>
          <div class="mt-3 text-sm" style="color:var(--text-secondary);">
            <i class='bx bx-info-circle'></i>
            Upsert: إذا كان الرقم القومي موجوداً سيتم تحديث البيانات، وإلا سيتم إنشاء عميل جديد.
          </div>
        </div>
      </div>

      <!-- Commit Results -->
      <div id="commit-results" style="display:none;" class="card mt-4">
        <h3 class="font-bold mb-3">نتائج الاستيراد</h3>
        <div id="commit-summary"></div>
      </div>
    </div>
    `;

    // ── State ─────────────────────────────────────────────────────────────────
    let previewData = { validRows: [], invalidRows: [], conflicts: [] };

    // ── DOM refs ──────────────────────────────────────────────────────────────
    const sheetUrlInput  = container.querySelector('#sheet-url');
    const tabNameInput   = container.querySelector('#tab-name');
    const btnPreview     = container.querySelector('#btn-preview');
    const loadingBar     = container.querySelector('#loading-bar');
    const previewSection = container.querySelector('#preview-section');
    const statValid      = container.querySelector('#stat-valid');
    const statInvalid    = container.querySelector('#stat-invalid');
    const statConflict   = container.querySelector('#stat-conflict');
    const validTbody     = container.querySelector('#valid-tbody');
    const invalidTbody   = container.querySelector('#invalid-tbody');
    const conflictsTbody = container.querySelector('#conflicts-tbody');
    const selectAll      = container.querySelector('#select-all-valid');
    const commitCard     = container.querySelector('#commit-card');
    const btnCommit      = container.querySelector('#btn-commit');
    const importMode     = container.querySelector('#import-mode');
    const commitResults  = container.querySelector('#commit-results');
    const commitSummary  = container.querySelector('#commit-summary');

    // ── Tabs ──────────────────────────────────────────────────────────────────
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('btn-primary', 'active');
                b.classList.add('btn-ghost');
            });
            btn.classList.add('btn-primary', 'active');
            btn.classList.remove('btn-ghost');
            ['valid','invalid','conflicts'].forEach(tab => {
                container.querySelector(`#tab-${tab}`).style.display = btn.dataset.tab === tab ? '' : 'none';
            });
        });
    });

    // ── Preview ───────────────────────────────────────────────────────────────
    btnPreview.addEventListener('click', async () => {
        const sheetUrl = sheetUrlInput.value.trim();
        if (!sheetUrl) { showToast('أدخل رابط الجدول', 'error'); return; }

        loadingBar.style.display = 'block';
        previewSection.style.display = 'none';
        commitResults.style.display = 'none';

        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE}/clients/import/google-sheet/preview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sheetUrl,
                    tabName: tabNameInput.value.trim() || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'حدث خطأ أثناء المعاينة');

            previewData = data;
            renderPreview(data);
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            loadingBar.style.display = 'none';
        }
    });

    // ── Render preview tables ─────────────────────────────────────────────────
    function renderPreview({ validRows, invalidRows, conflicts }) {
        statValid.textContent    = `${validRows.length} صف صحيح`;
        statInvalid.textContent  = `${invalidRows.length} صف خاطئ`;
        statConflict.textContent = `${conflicts.length} تعارض`;

        // Valid rows table
        validTbody.innerHTML = validRows.length === 0
            ? `<tr><td colspan="8" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد صفوف صحيحة</td></tr>`
            : validRows.map(r => `
                <tr>
                  <td><input type="checkbox" class="row-check" data-row='${JSON.stringify(r)}' checked /></td>
                  <td>${r.rowNumber}</td>
                  <td>${esc(r.data.name || r.data.fullNameAr)}</td>
                  <td style="font-family:monospace;">${esc(r.data.nationalId)}</td>
                  <td>${esc(r.data.phone)}</td>
                  <td>${esc(r.data.powerOfAttorneyNo || r.data.poaNumber)}</td>
                  <td>${esc(r.data.notaryOffice)}</td>
                  <td>${esc(r.data.sourceIndex)}</td>
                </tr>`).join('');

        // Invalid rows table
        invalidTbody.innerHTML = invalidRows.length === 0
            ? `<tr><td colspan="3" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد صفوف خاطئة ✅</td></tr>`
            : invalidRows.map(r => `
                <tr>
                  <td>${r.rowNumber}</td>
                  <td style="font-size:var(--text-xs); max-width:240px; overflow:hidden; text-overflow:ellipsis;">${esc((r.rawRow || []).join(' | '))}</td>
                  <td>${r.errors.map(e => `<div class="badge badge-closed" style="margin-bottom:3px;">${esc(e)}</div>`).join('')}</td>
                </tr>`).join('');

        // Conflicts table
        conflictsTbody.innerHTML = conflicts.length === 0
            ? `<tr><td colspan="3" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد تعارضات ✅</td></tr>`
            : conflicts.map(c => `
                <tr>
                  <td>${c.rowNumber}</td>
                  <td style="font-family:monospace;">${maskNid(c.nationalId)}</td>
                  <td>
                    <span class="badge" style="background:rgba(245,158,11,0.15);color:#d97706;">موجود بالفعل</span>
                    <a href="#/clients/${c.existingClientId}/edit" class="btn btn-ghost btn-sm" style="margin-right:6px;">عرض</a>
                  </td>
                </tr>`).join('');

        previewSection.style.display = '';
        commitCard.style.display = validRows.length > 0 ? '' : 'none';

        // Select-all
        selectAll.checked = true;
        updateCommitButtonLabel();
    }

    // ── Select all ────────────────────────────────────────────────────────────
    selectAll.addEventListener('change', () => {
        container.querySelectorAll('.row-check').forEach(cb => cb.checked = selectAll.checked);
        updateCommitButtonLabel();
    });
    container.addEventListener('change', e => {
        if (e.target.classList.contains('row-check')) updateCommitButtonLabel();
    });

    function updateCommitButtonLabel() {
        const checked = container.querySelectorAll('.row-check:checked').length;
        btnCommit.innerHTML = `<i class='bx bx-import'></i> استيراد ${checked} صف`;
        btnCommit.disabled = checked === 0;
    }

    // ── Commit ────────────────────────────────────────────────────────────────
    btnCommit.addEventListener('click', async () => {
        const checked = [...container.querySelectorAll('.row-check:checked')];
        if (checked.length === 0) { showToast('اختر صفاً واحداً على الأقل', 'error'); return; }

        const rows = checked.map(cb => JSON.parse(cb.dataset.row));
        const mode = importMode.value;

        btnCommit.disabled = true;
        btnCommit.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> جاري الاستيراد...`;

        try {
            const token = getAuthToken();
            const res = await fetch(`${API_BASE}/clients/import/google-sheet/commit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rows, mode })
            });
            const data = await res.json();

            if (!res.ok && res.status !== 409) throw new Error(data.error || 'خطأ أثناء الاستيراد');

            renderCommitResults(data);
            showToast(`تم: ${data.created} إضافة، ${data.updated} تحديث`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btnCommit.disabled = false;
            updateCommitButtonLabel();
        }
    });

    function renderCommitResults(data) {
        commitResults.style.display = '';
        commitSummary.innerHTML = `
          <div class="flex gap-4" style="flex-wrap:wrap; margin-bottom:1rem;">
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(16,185,129,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:#10b981;">${data.created}</div>
              <div style="color:var(--text-secondary);">تمت إضافتهم</div>
            </div>
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(99,102,241,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:var(--accent-primary);">${data.updated}</div>
              <div style="color:var(--text-secondary);">تم تحديثهم</div>
            </div>
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(107,114,128,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:var(--text-secondary);">${data.skipped}</div>
              <div style="color:var(--text-secondary);">تم تخطيهم</div>
            </div>
            ${data.errors && data.errors.length > 0 ? `
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(239,68,68,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:#ef4444;">${data.errors.length}</div>
              <div style="color:var(--text-secondary);">أخطاء</div>
            </div>` : ''}
          </div>
          ${data.errors && data.errors.length > 0 ? `
            <div class="mt-2">
              ${data.errors.map(e => `<div class="badge badge-closed" style="margin:2px;">${esc(e.error)} (صف ${e.rowNumber})</div>`).join('')}
            </div>` : ''}
          <button class="btn btn-primary mt-3" onclick="window.location.hash='/clients'">
            <i class='bx bxs-group'></i> عرض قائمة العملاء
          </button>
        `;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function esc(str) {
        if (!str) return '—';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function maskNid(nid) {
        if (!nid || nid.length < 8) return '***';
        return nid.substring(0, 3) + '********' + nid.substring(11);
    }
}

export default { renderClientSheetImport };
