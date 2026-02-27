// ========================================
// LOOKUP SERVICE — Dynamic Action & Decision Types
// Reads/writes from localStorage via Store.
// Seeds from DEFAULT_* arrays in models.js on first run.
// ========================================

import Store from './store.js';
import { ENTITIES, DEFAULT_ACTION_TYPES, DEFAULT_DECISION_TYPES } from './models.js';
import { getDecisionActionMappings } from '../config/decision-action-map.js';

// ─── Seed helper ─────────────────────────────────────────────────────────────
function seed(entity, defaults) {
    const existing = Store.getAll(entity);
    if (existing.length === 0) {
        defaults.forEach((label, index) => {
            Store.create(entity, { label, order: index });
        });
    }
}

// ─── Getters ─────────────────────────────────────────────────────────────────
export function getActionTypes() {
    seed(ENTITIES.LOOKUP_ACTION_TYPES, DEFAULT_ACTION_TYPES);
    return Store.getAll(ENTITIES.LOOKUP_ACTION_TYPES)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(x => x.label);
}

export function getDecisionTypes() {
    seed(ENTITIES.LOOKUP_DECISION_TYPES, DEFAULT_DECISION_TYPES);
    return Store.getAll(ENTITIES.LOOKUP_DECISION_TYPES)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(x => x.label);
}

/** Returns full store records (with id) for the CRUD admin table */
export function getActionTypeRecords() {
    seed(ENTITIES.LOOKUP_ACTION_TYPES, DEFAULT_ACTION_TYPES);
    return Store.getAll(ENTITIES.LOOKUP_ACTION_TYPES)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getDecisionTypeRecords() {
    seed(ENTITIES.LOOKUP_DECISION_TYPES, DEFAULT_DECISION_TYPES);
    return Store.getAll(ENTITIES.LOOKUP_DECISION_TYPES)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ─── Mutations ───────────────────────────────────────────────────────────────
export function addType(entity, label) {
    const existing = Store.getAll(entity);
    const maxOrder = existing.reduce((m, x) => Math.max(m, x.order ?? 0), 0);
    return Store.create(entity, { label: label.trim(), order: maxOrder + 1 });
}

export function updateType(entity, id, label) {
    return Store.update(entity, id, { label: label.trim() });
}

/**
 * Soft-deletes a type.
 * @returns {{ ok: boolean, warning?: string }}
 */
export function deleteType(entity, id) {
    const record = Store.getById(entity, id);
    if (!record) return { ok: false };

    // Check if this label is used in any active mapping
    const mappings = getDecisionActionMappings();
    let usedIn = null;
    if (entity === ENTITIES.LOOKUP_ACTION_TYPES) {
        usedIn = mappings.some(m => m.actionType === record.label);
    } else {
        usedIn = mappings.some(m => m.decisionType === record.label);
    }

    Store.softDelete(entity, id);

    if (usedIn) {
        return {
            ok: true,
            warning: `"${record.label}" محذوف من القائمة لكنه لا يزال مرتبطاً بربط قرارات. يُنصح بمراجعة صفحة ربط القرارات.`
        };
    }
    return { ok: true };
}

export default { getActionTypes, getDecisionTypes, getActionTypeRecords, getDecisionTypeRecords, addType, updateType, deleteType };
