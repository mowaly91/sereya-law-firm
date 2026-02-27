// ========================================
// ENTITY MODELS – Factory functions
// ========================================

// --- Enums / Constants ---
export const CASE_TYPES = ['مدني', 'جنائي', 'إداري', 'أسرة', 'عمالي', 'تجاري'];
export const CASE_TYPES_EN = { 'مدني': 'civil', 'جنائي': 'criminal', 'إداري': 'admin', 'أسرة': 'family', 'عمالي': 'labor', 'تجاري': 'commercial' };

export const STAGE_TYPES = ['أول درجة', 'استئناف', 'نقض'];
export const STAGE_TYPES_EN = { 'أول درجة': 'First Instance', 'استئناف': 'Appeal', 'نقض': 'Cassation' };

export const CRIMINAL_STAGE_TYPES = ['تحقيقات نيابة', 'جنحة', 'جناية', 'استئناف', 'نقض'];

export const CLIENT_ROLES = ['مدعي', 'مدعى عليه', 'مستأنف', 'مستأنف ضده', 'متهم', 'مجني عليه', 'طاعن', 'مطعون ضده'];

export const CASE_STATUSES = ['نشطة', 'حكم', 'مغلقة'];
export const CASE_STATUS_BADGE = { 'نشطة': 'active', 'حكم': 'judgment', 'مغلقة': 'closed' };

export const ACTION_STATUSES = ['مفتوح', 'قيد التنفيذ', 'مكتمل', 'معلق'];
export const ACTION_STATUS_BADGE = { 'مفتوح': 'open', 'قيد التنفيذ': 'progress', 'مكتمل': 'completed', 'معلق': 'blocked' };

export const DEADLINE_STATUSES = ['مفتوح', 'مكتمل', 'منتهي'];
export const DEADLINE_STATUS_BADGE = { 'مفتوح': 'open', 'مكتمل': 'completed', 'منتهي': 'expired' };

export const SESSION_TYPES = ['جلسة استماع', 'حكم', 'خبير', 'تحقيق', 'تجديد', 'نطق بالحكم', 'مرافعة', 'تأجيل'];

export const SESSION_STATUSES = ['مفتوح', 'مغلق'];
export const SESSION_STATUS_BADGE = { 'مفتوح': 'open', 'مغلق': 'completed' };

export const NO_NEXT_DATE_REASONS = ['حجز للحكم', 'صدور حكم نهائي', 'شطب نهائي', 'حفظ', 'أخرى'];

export const ACTION_TYPES = [
    'إعلان/خدمة',
    'تصريح محكمة',
    'حزمة تحضير',
    'متابعة خبير',
    'تجديد من الشطب',
    'مراجعة حكم',
    'حضور تجديد حبس',
    'متابعة تحقيق',
    'استئناف',
    'طعن',
    'معارضة',
    'أخرى'
];

export const PRIORITY_LEVELS = ['عالية', 'متوسطة', 'منخفضة'];

// Roles that can be assigned as ResponsibleLawyer on an Action
export const ASSIGNABLE_ROLES = ['شريك', 'محامي مسؤول', 'محامي', 'متدرب'];

export const DEADLINE_TYPES = [
    'استئناف',
    'نقض',
    'معارضة',
    'استئناف حبس',
    'تجديد بعد الشطب',
    'أخرى'
];

export const DECISION_TYPES = [
    'تأجيل لإعادة الإعلان',
    'تأجيل لتصريح',
    'تأجيل لمذكرة ومستندات',
    'إحالة لخبير',
    'شطب',
    'صدور حكم',
    'حبس احتياطي',
    'إخلاء سبيل',
    'طلب تحقيقات',
    'إحالة للمحكمة',
    'حفظ',
    'تأجيل للمرافعة',
    'تأجيل للاطلاع',
    'تأجيل عام',
    'نطق بالحكم'
];

export const USER_ROLES = ['شريك', 'محامي مسؤول', 'محامي', 'متدرب'];
export const USER_ROLES_EN = { 'شريك': 'partner', 'محامي مسؤول': 'caseOwner', 'محامي': 'lawyer', 'متدرب': 'trainee' };

// --- Entity Names ---
export const ENTITIES = {
    CLIENTS: 'clients',
    CASES: 'cases',
    SESSIONS: 'sessions',
    ACTIONS: 'actions',
    DEADLINES: 'deadlines',
    USERS: 'users',
    AUDIT: 'audit',
    DECISION_MAP: 'decision_map',
    SETTINGS: 'settings'
};

// --- Factory Functions ---
export function createClient(data) {
    return {
        name: data.name || '',
        nationalId: data.nationalId || '',
        phone: data.phone || '',
        address: data.address || '',
        poaNumber: data.poaNumber || '',
        notaryOffice: data.notaryOffice || '',
        poaDate: data.poaDate || '',
        attachments: data.attachments || [],
        notes: data.notes || ''
    };
}

export function createCase(data) {
    return {
        caseNo: data.caseNo || '',
        year: data.year || new Date().getFullYear().toString(),
        stageType: data.stageType || '',
        clientId: data.clientId || '',
        clientIds: data.clientIds || (data.clientId ? [data.clientId] : []),
        primaryClientId: data.primaryClientId || data.clientId || '',
        clientRole: data.clientRole || '',
        opponentName: data.opponentName || '',
        opponentRole: data.opponentRole || '',
        court: data.court || '',
        circuit: data.circuit || '',
        caseType: data.caseType || '',
        subject: data.subject || '',
        firstSessionDate: data.firstSessionDate || '',
        ownerId: data.ownerId || '',
        status: data.status || 'نشطة',
        criminalStageType: data.criminalStageType || '',
        linkedProsecutionId: data.linkedProsecutionId || '',
        notes: data.notes || ''
    };
}

export function createSession(data) {
    return {
        caseId: data.caseId || '',
        date: data.date || '',
        sessionType: data.sessionType || '',
        decisionResult: data.decisionResult || '',
        nextSessionDate: data.nextSessionDate || '',
        status: data.status || 'مفتوح',
        closureReason: data.closureReason || '',
        notes: data.notes || '',
        attachments: data.attachments || []
    };
}

export function createAction(data) {
    return {
        clientId: data.clientId || '',
        caseId: data.caseId || '',
        sessionId: data.sessionId || '',
        actionType: data.actionType || '',
        title: data.title || '',
        priority: data.priority || '',
        responsibleUserId: data.responsibleUserId || '',
        status: data.status || 'مفتوح',
        executionDate: data.executionDate || '',
        executionDetails: data.executionDetails || '',
        subTasks: data.subTasks || [],
        dueDate: data.dueDate || '',
        notes: data.notes || '',
        attachments: data.attachments || []
    };
}

export function createDeadline(data) {
    return {
        caseId: data.caseId || '',
        deadlineType: data.deadlineType || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        responsibleUserId: data.responsibleUserId || '',
        status: data.status || 'مفتوح',
        completionNote: data.completionNote || ''
    };
}

export function createUser(data) {
    return {
        name: data.name || '',
        role: data.role || 'محامي',
        email: data.email || '',
        phone: data.phone || '',
        active: data.active !== undefined ? data.active : true
    };
}
