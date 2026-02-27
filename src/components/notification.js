// ========================================
// COMPONENT: End-of-Day Notification Engine
// ========================================

import Store from '../data/store.js';
import { ENTITIES } from '../data/models.js';

let notificationInterval = null;
let notificationShown = false;

export function initNotificationEngine() {
    // Check every 60 seconds
    notificationInterval = setInterval(checkEndOfDay, 60 * 1000);
    // Also check immediately on load
    checkEndOfDay();
}

function checkEndOfDay() {
    const workdayEndTime = Store.getSetting('workdayEndTime');
    if (!workdayEndTime) return;

    const now = new Date();
    const [endHour, endMin] = workdayEndTime.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const endMinutes = endHour * 60 + endMin;

    // Only show notification if current time >= workdayEndTime
    if (currentMinutes < endMinutes) {
        // Not yet time — hide notification if it was showing from a previous day
        if (notificationShown) {
            hideNotification();
        }
        return;
    }

    // Find today's sessions missing results or not closed
    const todayStr = now.toISOString().split('T')[0];
    const sessions = Store.getAll(ENTITIES.SESSIONS);
    const unclosedSessions = sessions.filter(s => {
        return s.date === todayStr && (!s.decisionResult || s.status !== 'مغلق');
    });

    if (unclosedSessions.length > 0) {
        showNotification(unclosedSessions);
    } else {
        hideNotification();
    }
}

function showNotification(sessions) {
    notificationShown = true;
    const bar = document.getElementById('notification-bar');
    if (!bar) return;

    const cases = Store.getAll(ENTITIES.CASES);
    const clients = Store.getAll(ENTITIES.CLIENTS);

    bar.innerHTML = `
        <div class="notif-bar">
            <div class="notif-bar-content">
                <span class="notif-bar-icon">🔔</span>
                <span class="notif-bar-text">لديك <strong>${sessions.length}</strong> جلسات اليوم بدون نتائج مسجلة</span>
                <button class="notif-bar-toggle" id="notif-toggle">عرض التفاصيل ▼</button>
            </div>
            <div class="notif-bar-list" id="notif-list" style="display: none;">
                ${sessions.map(s => {
        const caseData = cases.find(c => c.id === s.caseId);
        const clientId = caseData ? (caseData.primaryClientId || caseData.clientId) : '';
        const client = clients.find(c => c.id === clientId);
        return `
                        <div class="notif-item">
                            <div class="notif-item-info">
                                <div class="notif-item-client">${client ? client.name : '—'}</div>
                                <div class="notif-item-details">
                                    القضية ${caseData ? caseData.caseNo + '/' + caseData.year : '—'}
                                    ${caseData ? ' – ' + caseData.court : ''}
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm notif-record-btn" data-caseid="${s.caseId}">تسجيل النتيجة الآن</button>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;

    bar.style.display = 'block';

    // Toggle list
    bar.querySelector('#notif-toggle')?.addEventListener('click', () => {
        const list = bar.querySelector('#notif-list');
        const btn = bar.querySelector('#notif-toggle');
        if (list.style.display === 'none') {
            list.style.display = 'block';
            btn.textContent = 'إخفاء التفاصيل ▲';
        } else {
            list.style.display = 'none';
            btn.textContent = 'عرض التفاصيل ▼';
        }
    });

    // Record result buttons
    bar.querySelectorAll('.notif-record-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.hash = `/cases/${btn.dataset.caseid}`;
        });
    });
}

function hideNotification() {
    notificationShown = false;
    const bar = document.getElementById('notification-bar');
    if (bar) {
        bar.innerHTML = '';
        bar.style.display = 'none';
    }
}

export function destroyNotificationEngine() {
    if (notificationInterval) {
        clearInterval(notificationInterval);
        notificationInterval = null;
    }
    hideNotification();
}

export default { initNotificationEngine, destroyNotificationEngine };
