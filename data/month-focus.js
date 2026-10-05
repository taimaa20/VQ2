/* Month-specific activities and reminders — DEMO CONTENT for the prototype.
   Shown on the homepage under Theme of the Month. The month name itself is never stored here:
   it is taken from today's date (core.js monthFocusHTML), and the entry with the same index
   (0 = January … 11 = December) supplies that month's reminders. */
window.VQData = window.VQData || {};

VQData.monthFocus = [
    /* January */ [
        { ar: 'فريق الموازنة: اعتماد الموازنات التشغيلية للإدارات للسنة الجديدة', en: 'Budgeting team: operating budgets for the new year are confirmed with each department' },
        { ar: 'تحديث خطط العمل الفصلية للإدارات', en: 'Departments update their quarterly work plans' }
    ],
    /* February */ [
        { ar: 'اليوم الرياضي للدولة: أنشطة رياضية للموظفين', en: 'National Sport Day: staff sports activities' },
        { ar: 'تحديد الأهداف الفردية في نظام الأداء', en: 'Individual objectives are set in the performance system' }
    ],
    /* March */ [
        { ar: 'إغلاق الربع الأول ومراجعة المؤشرات', en: 'Quarter 1 close and KPI review' },
        { ar: 'تحديث خطط الإجازات قبل العيد', en: 'Update leave plans ahead of Eid' }
    ],
    /* April */ [
        { ar: 'تقارير الأداء الفصلية للإدارات', en: 'Departmental quarterly performance reports' },
        { ar: 'تسجيل الدورات التدريبية للربع الثاني', en: 'Registration for Quarter 2 training courses' }
    ],
    /* May */ [
        { ar: 'مراجعة منتصف العام للأهداف مع المدراء', en: 'Mid-year objective check-ins with managers' },
        { ar: 'استعداد الفرق لموسم الصيف', en: 'Teams prepare for the summer season' }
    ],
    /* June */ [
        { ar: 'إغلاق الربع الثاني ومراجعة الإنفاق', en: 'Quarter 2 close and spend review' },
        { ar: 'جدولة الإجازات الصيفية', en: 'Summer leave scheduling' }
    ],
    /* July */ [
        { ar: 'تقييمات منتصف العام للموظفين', en: 'Mid-year employee reviews' },
        { ar: 'تحديث بيانات الموظفين في نظام الموارد البشرية', en: 'Employees update their details in the HR system' }
    ],
    /* August */ [
        { ar: 'الاستعداد لموسم الفعاليات والمعارض', en: 'Preparation for the events and trade-show season' },
        { ar: 'مراجعة خطط التدريب للنصف الثاني', en: 'Second-half training plan review' }
    ],
    /* September */ [
        { ar: 'إغلاق الربع الثالث ومراجعة المؤشرات', en: 'Quarter 3 close and KPI review' },
        { ar: 'إطلاق دورة التخطيط التجاري للعام القادم', en: 'Business planning cycle for next year begins' }
    ],
    /* October */ [
        { ar: 'الإدارات: تسليم مسودات الخطط التجارية والموازنات', en: 'Departments submit draft business plans and budgets' },
        { ar: 'المدراء: مراجعة احتياجات التوظيف للعام القادم', en: 'Managers review next year’s hiring needs' }
    ],
    /* November */ [
        { ar: 'المدراء: استكمال تقييمات الأداء السنوية للموظفين', en: 'Managers complete annual employee performance evaluations' },
        { ar: 'الموظفون: إكمال التقييم الذاتي', en: 'Employees complete their self-assessment' }
    ],
    /* December */ [
        { ar: 'اليوم الوطني لدولة قطر — 18 ديسمبر', en: 'Qatar National Day — 18 December' },
        { ar: 'فريق الموازنة: إقفال موازنة العام القادم', en: 'Budgeting team: next year’s budget is finalised' }
    ]
];
