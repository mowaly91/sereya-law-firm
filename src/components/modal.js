// ========================================
// COMPONENT: Modal
// ========================================

export function openModal(title, contentHtml, options = {}) {
    const root = document.getElementById('modal-root');
    const sizeClass = options.large ? 'modal-lg' : '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'active-modal';

    overlay.innerHTML = `
    <div class="modal ${sizeClass}">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
      ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
    </div>
  `;

    root.appendChild(overlay);

    // Close handlers
    overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    return overlay;
}

export function closeModal() {
    const modal = document.getElementById('active-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 150);
    }
}

export function confirmModal(title, message, onConfirm) {
    const content = `
    <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">${message}</p>
  `;
    const footer = `
    <button class="btn btn-primary" id="confirm-yes">تأكيد</button>
    <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
  `;

    const overlay = openModal(title, content, { footer });

    overlay.querySelector('#confirm-yes').addEventListener('click', () => {
        onConfirm();
        closeModal();
    });
    overlay.querySelector('#confirm-no').addEventListener('click', closeModal);
}

export default { openModal, closeModal, confirmModal };
