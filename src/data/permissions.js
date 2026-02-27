// ========================================
// PERMISSIONS – Role-based access control
// ========================================

import { USER_ROLES_EN } from './models.js';

// Current user state (simulated login)
let currentUser = null;

export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('slf_current_user', JSON.stringify(user));
}

export function getCurrentUser() {
    if (!currentUser) {
        const stored = localStorage.getItem('slf_current_user');
        if (stored) {
            currentUser = JSON.parse(stored);
        }
    }
    return currentUser;
}

export function getUserRoleKey(user) {
    if (!user) return null;
    return USER_ROLES_EN[user.role] || null;
}

// Permission definitions
const PERMISSIONS = {
    partner: {
        createCase: true,
        editCase: 'all',
        createSession: true,
        editSession: 'all',
        completeAction: true,
        createDeadline: true,
        closeCase: true,
        deleteRecords: 'soft',
        adminConfig: true,
        viewAll: true,
        lockUnlock: true
    },
    caseOwner: {
        createCase: true,
        editCase: 'own',
        createSession: true,
        editSession: 'own',
        completeAction: true,
        createDeadline: true,
        closeCase: false,
        deleteRecords: false,
        adminConfig: false,
        viewAll: false,
        lockUnlock: false
    },
    lawyer: {
        createCase: false,
        editCase: 'assigned',
        createSession: 'assigned',
        editSession: 'assigned',
        completeAction: 'assigned',
        createDeadline: false,
        closeCase: false,
        deleteRecords: false,
        adminConfig: false,
        viewAll: false,
        lockUnlock: false
    },
    trainee: {
        createCase: false,
        editCase: false,
        createSession: false,
        editSession: false,
        completeAction: 'addDetails',
        createDeadline: false,
        closeCase: false,
        deleteRecords: false,
        adminConfig: false,
        viewAll: false,
        lockUnlock: false
    }
};

export function can(action, context = {}) {
    const user = getCurrentUser();
    if (!user) return false;

    const roleKey = getUserRoleKey(user);
    if (!roleKey) return false;

    const perms = PERMISSIONS[roleKey];
    if (!perms) return false;

    const perm = perms[action];

    if (perm === true) return true;
    if (perm === false || perm === undefined) return false;

    // Context-dependent permissions
    if (perm === 'all') return true;

    if (perm === 'own') {
        return context.ownerId === user.id;
    }

    if (perm === 'assigned') {
        return context.ownerId === user.id ||
            context.responsibleUserId === user.id ||
            context.assignedTo === user.id;
    }

    if (perm === 'addDetails') {
        return context.responsibleUserId === user.id ||
            context.assignedTo === user.id;
    }

    if (perm === 'soft') return true;

    return false;
}

export function isPartner() {
    const user = getCurrentUser();
    if (!user) return false;
    return getUserRoleKey(user) === 'partner';
}

export function isOwnerOrPartner(caseData) {
    const user = getCurrentUser();
    if (!user) return false;
    const roleKey = getUserRoleKey(user);
    return roleKey === 'partner' || caseData.ownerId === user.id;
}

/**
 * canEditActions – Spec F: Only Partner/Admin may edit manually-created Actions.
 * Lawyers, Trainees, and Case Owners may only view or complete.
 */
export function canEditActions() {
    const user = getCurrentUser();
    if (!user) return false;
    return getUserRoleKey(user) === 'partner';
}

export default { setCurrentUser, getCurrentUser, can, isPartner, isOwnerOrPartner, canEditActions };
