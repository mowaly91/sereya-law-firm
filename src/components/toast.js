// ========================================
// COMPONENT: Toast notifications
// ========================================

export function showToast(message, type = 'success', duration = 3000) {
    const root = document.getElementById('toast-root');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    root.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 300ms ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

export default { showToast };
