// ========================================
// PAGE: Calendar (Sessions + Open Deadlines – View Only)
// Spec: A) CALENDAR
// ========================================

import Store from '../../data/store.js';
import { ENTITIES } from '../../data/models.js';
import { setPageTitle } from '../../main.js';

export function renderCalendar(container) {
    setPageTitle('التقويم');

    let currentDate = new Date();
    currentDate.setDate(1);

    function render() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const sessions = Store.getAll(ENTITIES.SESSIONS);
        // Calendar displays ONLY open deadlines (Status = Open)
        const deadlines = Store.getAll(ENTITIES.DEADLINES).filter(d => d.status === 'مفتوح');
        const cases = Store.getAll(ENTITIES.CASES);
        const clients = Store.getAll(ENTITIES.CLIENTS);

        /**
         * Build event map: key = 'YYYY-MM-DD'
         * Each event keeps: type ('session'|'deadline'), title (full client name), caseId, label
         * Same case + same date with Session AND Deadline → two separate entries (spec rule 6)
         */
        const eventMap = {};

        function getClientTitle(caseData) {
            if (!caseData) return '—';
            const clientIds = caseData.clientIds || (caseData.clientId ? [caseData.clientId] : []);
            const primaryId = caseData.primaryClientId || caseData.clientId;
            const primaryClient = clients.find(c => c.id === primaryId);
            // Rule 3: multiple clients → PrimaryClientFullName + " وآخرون"
            if (clientIds.length > 1 && primaryClient) {
                return primaryClient.name + ' وآخرون';
            }
            return primaryClient ? primaryClient.name : '—';
        }

        function normalizeDate(dateStr) {
            if (!dateStr) return null;
            // Accept YYYY-MM-DD or ISO strings, normalize to YYYY-MM-DD
            return dateStr.split('T')[0];
        }

        function addEvent(rawDateStr, type, caseId, label) {
            const dateStr = normalizeDate(rawDateStr);
            if (!dateStr) return;

            const [y, m] = dateStr.split('-').map(Number);
            if (y !== year || m - 1 !== month) return;

            if (!eventMap[dateStr]) eventMap[dateStr] = [];

            const caseData = cases.find(c => c.id === caseId);
            const title = getClientTitle(caseData);

            eventMap[dateStr].push({ type, title, caseId, label });
        }

        // Sessions: use SessionDate = s.date (all types of sessions)
        sessions.forEach(s => {
            if (s.date) addEvent(s.date, 'session', s.caseId, 'جلسة');
        });

        // Open Deadlines: use DeadlineDueDate = d.endDate
        deadlines.forEach(d => {
            if (d.endDate) addEvent(d.endDate, 'deadline', d.caseId, 'موعد نهائي');
        });

        // Calendar grid setup
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay(); // 0=Sun
        const daysInMonth = lastDay.getDate();

        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        const dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

        const todayStr = new Date().toISOString().split('T')[0];
        const MAX_VISIBLE = 3;

        // Build day cells
        let dayCells = '';
        // Empty padding cells for days before the 1st
        for (let i = 0; i < startDayOfWeek; i++) {
            dayCells += '<div class="cal-day cal-day-empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const mn = String(month + 1).padStart(2, '0');
            const dd = String(day).padStart(2, '0');
            const dateStr = `${year}-${mn}-${dd}`;
            const events = eventMap[dateStr] || [];
            const isToday = dateStr === todayStr;

            const visibleEvents = events.slice(0, MAX_VISIBLE);
            const remaining = events.length - MAX_VISIBLE;

            // Rule 1 & 2: Full client name, no truncation
            let eventsHtml = visibleEvents.map(ev => `
                <div class="cal-event cal-event-${ev.type}"
                     data-caseid="${ev.caseId}"
                     title="${ev.title} – ${ev.label}"
                     style="cursor:pointer; user-select:none;">
                    <span class="cal-dot cal-dot-${ev.type}"></span>
                    <span class="cal-event-title">${ev.title}</span>
                    <span class="cal-event-label">${ev.label}</span>
                </div>
            `).join('');

            // Rule 4: "+X more" if more than 3
            if (remaining > 0) {
                eventsHtml += `<button class="cal-more-btn" data-date="${dateStr}">+${remaining} المزيد</button>`;
            }

            dayCells += `
                <div class="cal-day ${isToday ? 'cal-day-today' : ''}" data-date="${dateStr}"
                     style="user-select:none;">
                    <div class="cal-day-number">${day}</div>
                    <div class="cal-day-events">${eventsHtml}</div>
                </div>
            `;
        }

        container.innerHTML = `
        <div class="animate-fade-in">
            <div class="cal-header">
                <button class="btn btn-ghost btn-sm" id="cal-prev">→</button>
                <h2 class="cal-month-title">${monthNames[month]} ${year}</h2>
                <button class="btn btn-ghost btn-sm" id="cal-next">←</button>
                <button class="btn btn-secondary btn-sm" id="cal-today" style="margin-right: auto;">اليوم</button>
            </div>
            <div class="cal-legend">
                <span class="cal-legend-item"><span class="cal-dot cal-dot-session"></span> جلسة</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-deadline"></span> موعد نهائي (مفتوح)</span>
                <span class="cal-legend-note text-xs text-secondary" style="margin-right:auto;">للعرض فقط – لا يمكن التعديل أو السحب</span>
            </div>
            <div class="cal-grid">
                <div class="cal-weekdays">
                    ${dayNames.map(d => `<div class="cal-weekday">${d}</div>`).join('')}
                </div>
                <div class="cal-days">
                    ${dayCells}
                </div>
            </div>
        </div>
        `;

        // ── Navigation ──
        container.querySelector('#cal-prev').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            render();
        });

        container.querySelector('#cal-next').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            render();
        });

        container.querySelector('#cal-today').addEventListener('click', () => {
            currentDate = new Date();
            currentDate.setDate(1);
            render();
        });

        // Rule 5: Clicking event → navigate to Case Details
        container.querySelectorAll('.cal-event').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const caseId = el.dataset.caseid;
                if (caseId) window.location.hash = `/cases/${caseId}`;
            });
        });

        // "+X more" button → shows popover with all events for that day
        container.querySelectorAll('.cal-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dateStr = btn.dataset.date;
                const allEvents = eventMap[dateStr] || [];
                showDayPopover(btn, allEvents, dateStr);
            });
        });

        // Prevent any drag-and-drop on calendar (view-only)
        container.querySelectorAll('.cal-day, .cal-event').forEach(el => {
            el.setAttribute('draggable', 'false');
            el.addEventListener('dragstart', e => e.preventDefault());
        });
    }

    function showDayPopover(anchor, events, dateStr) {
        // Remove existing popovers
        document.querySelectorAll('.cal-popover').forEach(p => p.remove());

        const d = new Date(dateStr + 'T00:00:00');
        const dateLabel = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

        const popover = document.createElement('div');
        popover.className = 'cal-popover';
        popover.innerHTML = `
            <div class="cal-popover-header">
                <span>${dateLabel}</span>
                <button class="cal-popover-close">&times;</button>
            </div>
            <div class="cal-popover-list">
                ${events.map(ev => `
                    <div class="cal-popover-item" data-caseid="${ev.caseId}" style="cursor:pointer;">
                        <span class="cal-dot cal-dot-${ev.type}"></span>
                        <span class="cal-popover-client">${ev.title}</span>
                        <span class="cal-popover-type">${ev.label}</span>
                    </div>
                `).join('')}
            </div>
        `;

        anchor.parentElement.appendChild(popover);

        popover.querySelector('.cal-popover-close').addEventListener('click', () => popover.remove());

        // Clicking item → navigate to Case Details (Rule 5)
        popover.querySelectorAll('.cal-popover-item').forEach(item => {
            item.addEventListener('click', () => {
                const caseId = item.dataset.caseid;
                if (caseId) window.location.hash = `/cases/${caseId}`;
                popover.remove();
            });
        });

        // Close on outside click
        const closeHandler = (e) => {
            if (!popover.contains(e.target)) {
                popover.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 10);
    }

    render();
}

export default { renderCalendar };
