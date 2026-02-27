// ========================================
// DECISION → ACTION MAPPING (Configurable)
// ========================================

import Store from '../data/store.js';
import { ENTITIES } from '../data/models.js';

// Default mapping per spec
const DEFAULT_MAPPINGS = [
    {
        decisionType: 'تأجيل لإعادة الإعلان',
        actionType: 'إعلان/خدمة',
        executionProof: 'تاريخ التقديم للمحضر + رقم المرجع + النتيجة',
        subTasks: [],
        requiresNextDate: true
    },
    {
        decisionType: 'تأجيل لتصريح',
        actionType: 'تصريح محكمة',
        executionProof: 'رقم التصريح + التاريخ + المرفق',
        subTasks: [],
        requiresNextDate: true
    },
    {
        decisionType: 'تأجيل لمذكرة ومستندات',
        actionType: 'حزمة تحضير',
        executionProof: 'تفاصيل التقديم',
        subTasks: [
            { title: 'صياغة المذكرة', completed: false },
            { title: 'مراجعة المذكرة', completed: false },
            { title: 'تحضير المستندات', completed: false },
            { title: 'تصوير ونسخ', completed: false },
            { title: 'تقديم الحزمة', completed: false }
        ],
        requiresNextDate: true
    },
    {
        decisionType: 'إحالة لخبير',
        actionType: 'متابعة خبير',
        executionProof: 'متابعة الموعد + تقديم الملاحظات + استلام التقرير',
        subTasks: [
            { title: 'متابعة موعد الخبير', completed: false },
            { title: 'تقديم ملاحظات', completed: false },
            { title: 'استلام التقرير', completed: false }
        ],
        requiresNextDate: true
    },
    {
        decisionType: 'شطب',
        actionType: 'تجديد من الشطب',
        executionProof: 'تقديم طلب التجديد',
        subTasks: [],
        requiresNextDate: false
    },
    {
        decisionType: 'صدور حكم',
        actionType: 'مراجعة حكم',
        executionProof: 'مراجعة الحكم وتحديد الإجراء التالي',
        subTasks: [],
        requiresNextDate: false
    },
    {
        decisionType: 'حبس احتياطي',
        actionType: 'حضور تجديد حبس',
        executionProof: 'حضور جلسة التجديد',
        subTasks: [],
        requiresNextDate: false,
        urgent: true
    },
    {
        decisionType: 'طلب تحقيقات',
        actionType: 'متابعة تحقيق',
        executionProof: 'استلام التحقيق + الخطوة التالية',
        subTasks: [],
        requiresNextDate: true
    },
    {
        decisionType: 'تأجيل للمرافعة',
        actionType: 'حزمة تحضير',
        executionProof: 'تحضير المرافعة',
        subTasks: [
            { title: 'تحضير نقاط المرافعة', completed: false },
            { title: 'مراجعة القضية', completed: false }
        ],
        requiresNextDate: true
    },
    {
        decisionType: 'تأجيل للاطلاع',
        actionType: 'حزمة تحضير',
        executionProof: 'الاطلاع والتحضير',
        subTasks: [
            { title: 'الاطلاع على المستندات', completed: false },
            { title: 'تحضير الرد', completed: false }
        ],
        requiresNextDate: true
    },
    {
        decisionType: 'تأجيل عام',
        actionType: 'أخرى',
        executionProof: '',
        subTasks: [],
        requiresNextDate: true
    },
    {
        decisionType: 'إحالة للمحكمة',
        actionType: 'أخرى',
        executionProof: 'إنشاء قضية جديدة مرتبطة',
        subTasks: [],
        requiresNextDate: false,
        createsLinkedCase: true
    },
    {
        decisionType: 'نطق بالحكم',
        actionType: 'مراجعة حكم',
        executionProof: 'مراجعة الحكم وتحديد الإجراء التالي',
        subTasks: [],
        requiresNextDate: false
    }
];

export function getDecisionActionMappings() {
    const stored = Store.getAll(ENTITIES.DECISION_MAP);
    if (stored.length === 0) {
        // Initialize with defaults
        DEFAULT_MAPPINGS.forEach(mapping => {
            Store.create(ENTITIES.DECISION_MAP, mapping);
        });
        return Store.getAll(ENTITIES.DECISION_MAP);
    }
    return stored;
}

export function getMappingForDecision(decisionType) {
    const mappings = getDecisionActionMappings();
    return mappings.find(m => m.decisionType === decisionType) || null;
}

export function updateMapping(id, data) {
    return Store.update(ENTITIES.DECISION_MAP, id, data);
}

export function addMapping(data) {
    return Store.create(ENTITIES.DECISION_MAP, data);
}

export function deleteMapping(id) {
    return Store.softDelete(ENTITIES.DECISION_MAP, id);
}

export function doesDecisionRequireNextDate(decisionType) {
    const mapping = getMappingForDecision(decisionType);
    return mapping ? mapping.requiresNextDate : true;
}

export function doesDecisionCreateLinkedCase(decisionType) {
    const mapping = getMappingForDecision(decisionType);
    return mapping ? mapping.createsLinkedCase === true : false;
}

export default {
    getDecisionActionMappings, getMappingForDecision, updateMapping,
    addMapping, deleteMapping, doesDecisionRequireNextDate, doesDecisionCreateLinkedCase
};
