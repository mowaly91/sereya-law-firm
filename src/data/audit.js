// ========================================
// AUDIT LOG SERVICE
// ========================================

import Store from './store.js';
import { getCurrentUser } from './permissions.js';
import { ENTITIES } from './models.js';

export function logAudit(entityType, entityId, action, changes = {}) {
    const user = getCurrentUser();
    const entry = {
        entityType,
        entityId,
        action,     // 'create' | 'update' | 'complete' | 'delete' | 'status_change' | 'field_change'
        userId: user ? user.id : 'system',
        userName: user ? user.name : 'النظام',
        timestamp: new Date().toISOString(),
        changes
    };
    Store.create(ENTITIES.AUDIT, entry);
    return entry;
}

/**
 * Log per-field changes for an action edit (Spec F).
 * Compares oldData vs newData and logs each changed field individually.
 * @param {string} actionId
 * @param {object} oldData  – snapshot before edit
 * @param {object} newData  – values after edit
 * @param {string} editReason – mandatory reason for sensitive-field changes
 */
export function logActionFieldChanges(actionId, oldData, newData, editReason = '') {
    const user = getCurrentUser();
    const timestamp = new Date().toISOString();

    // Arabic labels for display in Action History
    const FIELD_LABELS = {
        actionType: 'نوع الإجراء',
        title: 'العنوان / الوصف',
        dueDate: 'تاريخ الاستحقاق',
        responsibleUserId: 'المحامي المسؤول',
        priority: 'الأولوية',
        notes: 'الملاحظات',
        clientId: 'العميل',
        caseId: 'القضية',
        executionDate: 'تاريخ التنفيذ',
        executionDetails: 'تفاصيل التنفيذ / الإثبات',
        status: 'الحالة'
    };

    // Fields that require an Edit Reason
    const SENSITIVE_FIELDS = ['actionType', 'responsibleUserId', 'clientId', 'caseId', 'executionDate', 'executionDetails'];

    const fieldEntries = [];

    Object.keys(FIELD_LABELS).forEach(field => {
        const oldVal = String(oldData[field] || '');
        const newVal = String(newData[field] || '');
        if (oldVal === newVal) return;   // no change

        const isSensitive = SENSITIVE_FIELDS.includes(field);
        const entry = {
            entityType: ENTITIES.ACTIONS,
            entityId: actionId,
            action: 'field_change',
            userId: user ? user.id : 'system',
            userName: user ? user.name : 'النظام',
            timestamp,
            changes: {
                field,
                fieldLabel: FIELD_LABELS[field] || field,
                oldValue: oldVal,
                newValue: newVal,
                sensitive: isSensitive,
                editReason: isSensitive ? editReason : ''
            }
        };
        Store.create(ENTITIES.AUDIT, entry);
        fieldEntries.push(entry);
    });

    return fieldEntries;
}

/**
 * Get full edit history for a specific Action (newest first).
 */
export function getActionHistory(actionId) {
    return Store.query(ENTITIES.AUDIT, entry =>
        entry.entityId === actionId
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getAuditLog(entityType, entityId) {
    return Store.query(ENTITIES.AUDIT, entry => {
        if (entityType && entry.entityType !== entityType) return false;
        if (entityId && entry.entityId !== entityId) return false;
        return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getRecentAudit(limit = 50) {
    return Store.getAll(ENTITIES.AUDIT)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

export function formatAuditAction(action) {
    const map = {
        'create': 'إنشاء',
        'update': 'تعديل',
        'complete': 'إكمال',
        'delete': 'حذف',
        'status_change': 'تغيير حالة',
        'field_change': 'تعديل حقل'
    };
    return map[action] || action;
}

export default { logAudit, logActionFieldChanges, getActionHistory, getAuditLog, getRecentAudit, formatAuditAction };
