// ========================================
// SEED DATA – Demo data for initial load
// ========================================

import Store from './store.js';
import { ENTITIES } from './models.js';
import { setCurrentUser } from './permissions.js';

export function seedIfEmpty() {
    const users = Store.getAll(ENTITIES.USERS);
    if (users.length > 0) return;

    // Create users
    const ahmed = Store.create(ENTITIES.USERS, {
        name: 'أحمد أحمد سريا',
        role: 'شريك',
        email: 'ahmed@serya.law',
        phone: '01000000001',
        active: true
    });

    const fathy = Store.create(ENTITIES.USERS, {
        name: 'فتحي أحمد سريا',
        role: 'شريك',
        email: 'fathy@serya.law',
        phone: '01000000002',
        active: true
    });

    const lawyerSenior = Store.create(ENTITIES.USERS, {
        name: 'محمد عبد الرحمن',
        role: 'محامي مسؤول',
        email: 'mohamed@serya.law',
        phone: '01000000003',
        active: true
    });

    const lawyerJunior = Store.create(ENTITIES.USERS, {
        name: 'سارة أحمد',
        role: 'محامي',
        email: 'sara@serya.law',
        phone: '01000000004',
        active: true
    });

    const trainee = Store.create(ENTITIES.USERS, {
        name: 'يوسف محمود',
        role: 'متدرب',
        email: 'youssef@serya.law',
        phone: '01000000005',
        active: true
    });

    // Set default user as partner
    setCurrentUser(ahmed);

    // Create clients
    const client1 = Store.create(ENTITIES.CLIENTS, {
        name: 'شركة النور للتجارة',
        nationalId: '12345678901234',
        phone: '01100000001',
        address: 'القاهرة - المعادي - شارع 9',
        poaNumber: 'POA-2025-001',
        notaryOffice: 'مكتب توثيق المعادي',
        poaDate: '2025-01-15',
        notes: 'عميل مهم - قضايا تجارية'
    });

    const client2 = Store.create(ENTITIES.CLIENTS, {
        name: 'أحمد محمد إبراهيم',
        nationalId: '28501012345678',
        phone: '01200000002',
        address: 'الجيزة - الدقي',
        poaNumber: 'POA-2025-002',
        notaryOffice: 'مكتب توثيق الدقي',
        poaDate: '2025-02-10',
        notes: ''
    });

    const client3 = Store.create(ENTITIES.CLIENTS, {
        name: 'فاطمة حسن علي',
        nationalId: '29001234567890',
        phone: '01500000003',
        address: 'الإسكندرية - سموحة',
        poaNumber: 'POA-2025-003',
        notaryOffice: 'مكتب توثيق سموحة',
        poaDate: '2025-03-05',
        notes: 'قضية أسرة'
    });

    // Create cases
    const case1 = Store.create(ENTITIES.CASES, {
        caseNo: '1234',
        year: '2025',
        stageType: 'أول درجة',
        clientId: client1.id,
        clientIds: [client1.id],
        primaryClientId: client1.id,
        clientRole: 'مدعي',
        opponentName: 'شركة الفجر للاستيراد',
        opponentRole: 'مدعى عليه',
        court: 'محكمة القاهرة الاقتصادية',
        circuit: 'الدائرة الثالثة',
        caseType: 'مدني',
        subject: 'مطالبة بمستحقات تجارية',
        firstSessionDate: '2026-03-01',
        ownerId: lawyerSenior.id,
        status: 'نشطة'
    });

    const case2 = Store.create(ENTITIES.CASES, {
        caseNo: '5678',
        year: '2025',
        stageType: 'أول درجة',
        clientId: client2.id,
        clientIds: [client2.id],
        primaryClientId: client2.id,
        clientRole: 'متهم',
        opponentName: 'النيابة العامة',
        opponentRole: 'سلطة اتهام',
        court: 'نيابة شمال القاهرة',
        circuit: '',
        caseType: 'جنائي',
        criminalStageType: 'تحقيقات نيابة',
        subject: 'تحقيق جنائي - نصب',
        firstSessionDate: '2026-02-28',
        ownerId: ahmed.id,
        status: 'نشطة'
    });

    const case3 = Store.create(ENTITIES.CASES, {
        caseNo: '9101',
        year: '2026',
        stageType: 'استئناف',
        clientId: client3.id,
        clientIds: [client3.id, client1.id],
        primaryClientId: client3.id,
        clientRole: 'مستأنف',
        opponentName: 'خالد حسن محمود',
        opponentRole: 'مستأنف ضده',
        court: 'محكمة استئناف الإسكندرية',
        circuit: 'الدائرة الأولى أسرة',
        caseType: 'أسرة',
        subject: 'استئناف حكم نفقة',
        firstSessionDate: '2026-03-05',
        ownerId: lawyerSenior.id,
        status: 'نشطة'
    });

    // Create sessions for case1
    const session1 = Store.create(ENTITIES.SESSIONS, {
        caseId: case1.id,
        date: '2026-03-01',
        sessionType: 'جلسة استماع',
        decisionResult: 'تأجيل لإعادة الإعلان',
        nextSessionDate: '2026-03-15',
        notes: 'لم يحضر المدعى عليه - تأجيل لإعادة الإعلان'
    });

    // Create actions for case1
    Store.create(ENTITIES.ACTIONS, {
        caseId: case1.id,
        sessionId: session1.id,
        actionType: 'إعلان/خدمة',
        responsibleUserId: lawyerJunior.id,
        status: 'مفتوح',
        dueDate: '2026-03-10',
        notes: 'إعادة إعلان المدعى عليه - شركة الفجر للاستيراد'
    });

    // Create session for case2 (criminal)
    const session2 = Store.create(ENTITIES.SESSIONS, {
        caseId: case2.id,
        date: '2026-02-28',
        sessionType: 'تحقيق',
        decisionResult: 'حبس احتياطي',
        nextSessionDate: '2026-03-14',
        notes: 'تم حبس المتهم احتياطياً 15 يوماً'
    });

    // Create urgent action for detention
    Store.create(ENTITIES.ACTIONS, {
        caseId: case2.id,
        sessionId: session2.id,
        actionType: 'حضور تجديد حبس',
        responsibleUserId: ahmed.id,
        status: 'مفتوح',
        dueDate: '2026-03-13',
        notes: 'حضور جلسة تجديد الحبس الاحتياطي'
    });

    // Create deadline for case2
    Store.create(ENTITIES.DEADLINES, {
        caseId: case2.id,
        deadlineType: 'استئناف حبس',
        startDate: '2026-02-28',
        endDate: '2026-03-07',
        responsibleUserId: ahmed.id,
        status: 'مفتوح',
        completionNote: ''
    });

    // Create action for case3
    Store.create(ENTITIES.ACTIONS, {
        caseId: case3.id,
        sessionId: '',
        actionType: 'حزمة تحضير',
        responsibleUserId: lawyerSenior.id,
        status: 'قيد التنفيذ',
        dueDate: '2026-03-03',
        subTasks: [
            { title: 'صياغة المذكرة', completed: true },
            { title: 'مراجعة المذكرة', completed: false },
            { title: 'تحضير المستندات', completed: false },
            { title: 'تقديم الحزمة', completed: false }
        ],
        notes: 'تحضير مذكرة الاستئناف ومستنداتها'
    });

    // Seed default settings
    Store.setSetting('workdayEndTime', '17:00');

    console.log('✅ Seed data loaded successfully');
}

export default { seedIfEmpty };
