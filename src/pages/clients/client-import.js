// ========================================
// PAGE: Client Import from Drive PDFs
// ========================================

import Store from '../../data/store.js';
import { ENTITIES, createClient } from '../../data/models.js';
import { setPageTitle } from '../../main.js';
import { showToast } from '../../components/toast.js';
import { logAudit } from '../../data/audit.js';

export function renderClientImport(container, params = {}) {
    setPageTitle('استيراد عملاء من ملفات PDF');

    // Default Folder ID can be fetched from settings if saved previously,
    // or just an empty field for the user to provide.
    const savedFolderId = Store.getSetting('drive_pdf_folder_id') || '';

    container.innerHTML = `
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxl-google-drive'></i> استيراد من Google Drive</h1>
          <div class="page-header-sub">قم بمسح مجلد Drive لاكتشاف وإضافة مجلدات العملاء تلقائياً</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة إلى العملاء</button>
      </div>
      
      <div class="card mb-6">
        <h3 class="font-bold mb-4">إعدادات المسح</h3>
        <div class="flex gap-4 items-end">
            <div class="form-group flex-1">
                <label class="form-label">رابط مجلد جوجل درايف (Folder Link) <span class="required">*</span></label>
                <input type="text" id="drive-folder-id" class="form-input" value="${savedFolderId}" placeholder="https://drive.google.com/drive/folders/1BxiMVs..."/>
                <div class="text-sm mt-1 text-gray-500">
                    ضع رابط المجلد الذي يحتوي على مجلدات بأسماء العملاء. تأكد من مشاركة المجلد مع حساب الخدمة.
                </div>
            </div>
            <button id="btn-scan" class="btn btn-primary" style="margin-bottom: 27px;">
                <i class='bx bx-scan'></i> مسح أسماء المجلدات
            </button>
        </div>
      </div>

      <div class="card" id="scan-results-card" style="display: none;">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold">العملاء المكتشفون</h3>
            <button id="btn-import-selected" class="btn btn-success" disabled>
                <i class='bx bx-import'></i> استيراد المحددين
            </button>
        </div>

        <div class="table-container">
            <table class="data-table" id="import-table">
                <thead>
                    <tr>
                        <th width="40"><input type="checkbox" id="selectAllDetected" /></th>
                        <th>اسم العميل المستخرج</th>
                        <th>الرقم القومي</th>
                        <th>الملف المصدري</th>
                    </tr>
                </thead>
                <tbody id="import-table-body">
                    <!-- Results will be placed here -->
                </tbody>
            </table>
        </div>
      </div>

      <div id="loading-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; flex-direction: column; color: white;">
          <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h2 class="text-xl">جاري جلب قائمة العملاء من Google Drive...</h2>
          <p class="mt-2 text-gray-300">يرجى الانتظار، جاري اكتشاف المجلدات.</p>
      </div>
    </div>
    `;

    const scanBtn = container.querySelector('#btn-scan');
    const folderInput = container.querySelector('#drive-folder-id');
    const loadingOverlay = container.querySelector('#loading-overlay');
    const resultsCard = container.querySelector('#scan-results-card');
    const tbody = container.querySelector('#import-table-body');
    const btnImport = container.querySelector('#btn-import-selected');
    const selectAll = container.querySelector('#selectAllDetected');

    let scannedClients = [];

    // Scan drive API call
    scanBtn.addEventListener('click', async () => {
        const folderId = folderInput.value.trim();
        if (!folderId) {
            showToast('الرجاء إدخال رقم تعريف المجلد (Folder ID)', 'error');
            return;
        }

        // Save for later
        Store.setSetting('drive_pdf_folder_id', folderId);

        loadingOverlay.style.display = 'flex';
        try {
            const API_BASE = 'http://localhost:3000/api';
            const res = await fetch(`${API_BASE}/scan-drive-pdfs?folderId=${encodeURIComponent(folderId)}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'حدث خطأ أثناء المسح');
            }

            scannedClients = data.clients || [];
            if (scannedClients.length === 0) {
                showToast('لم يتم العثور على أي بيانات عملاء في المجلد.', 'warning');
                resultsCard.style.display = 'none';
            } else {
                showToast(`تم اكتشاف ${scannedClients.length} عميل`, 'success');
                renderTable(scannedClients);
                resultsCard.style.display = 'block';
            }

        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    // Render table
    function renderTable(clients) {
        tbody.innerHTML = '';
        clients.forEach((client, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox" class="client-checkbox" data-index="${index}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="name-${index}" value="${client.name}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="nid-${index}" value="${client.nationalId}" /></td>
                <td>
                    <span class="badge" title="File ID: ${client.sourceFileId}">
                        ${client.sourceFile}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        updateImportButtonState();

        // Listen for checkbox changes
        const checkBoxes = container.querySelectorAll('.client-checkbox');
        checkBoxes.forEach(cb => {
            cb.addEventListener('change', updateImportButtonState);
        });
    }

    // Toggle all
    selectAll.addEventListener('change', (e) => {
        const checkBoxes = container.querySelectorAll('.client-checkbox');
        checkBoxes.forEach(cb => {
            cb.checked = e.target.checked;
        });
        updateImportButtonState();
    });

    function updateImportButtonState() {
        const anyChecked = Array.from(container.querySelectorAll('.client-checkbox')).some(cb => cb.checked);
        btnImport.disabled = !anyChecked;
    }

    // Attempt import
    btnImport.addEventListener('click', () => {
        const checkBoxes = container.querySelectorAll('.client-checkbox');
        let importedCount = 0;

        checkBoxes.forEach(cb => {
            if (cb.checked) {
                const idx = cb.getAttribute('data-index');
                const editedName = container.querySelector(`#name-${idx}`).value.trim();
                const editedNid = container.querySelector(`#nid-${idx}`).value.trim();
                const sourceData = scannedClients[idx];

                // Create client using our factory
                const newClientData = createClient({
                    name: editedName || sourceData.name,
                    nationalId: editedNid || sourceData.nationalId,
                    notes: `تم إضافته من المسح الآلي للملف: ${sourceData.sourceFile}`,
                    driveFolderUrl: sourceData.driveFolderUrl || '',
                    driveFolderId: sourceData.sourceFileId || ''
                });

                const created = Store.create(ENTITIES.CLIENTS, newClientData);
                logAudit(ENTITIES.CLIENTS, created.id, 'create', newClientData);
                importedCount++;
            }
        });

        showToast(`تم استيراد ${importedCount} عميل بنجاح`, 'success');

        // Redirect to clients list after short delay
        setTimeout(() => {
            window.location.hash = '/clients';
        }, 1500);
    });
}

export default { renderClientImport };
