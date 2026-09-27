/* Events & Calendars (BRD 7.3 & 8.5) */
window.VQData = window.VQData || {};

VQData.eventCategories = [
    { key: 'conference', icon: 'fa-microphone-lines', color: '#00626C', label: { ar: 'مؤتمرات وملتقيات', en: 'Conferences & forums' } },
    { key: 'training', icon: 'fa-chalkboard-user', color: '#D76B00', label: { ar: 'تدريب وورش عمل', en: 'Training & workshops' } },
    { key: 'entertainment', icon: 'fa-masks-theater', color: '#8A1538', label: { ar: 'ثقافة وترفيه', en: 'Culture & entertainment' } },
    { key: 'wellbeing', icon: 'fa-heart-pulse', color: '#01A786', label: { ar: 'صحة ورفاهية', en: 'Health & wellbeing' } },
    { key: 'tradeshow', icon: 'fa-store', color: '#00626C', label: { ar: 'معرض تجاري', en: 'Tradeshow' } },
    { key: 'roadshow', icon: 'fa-route', color: '#D76B00', label: { ar: 'جولة ترويجية', en: 'Roadshow' } }
];

VQData.events = [
    {
        id: 'global-perspectives',
        number: 'EV-2027-004',
        start: '2027-10-28',
        end: '2027-10-28',
        category: 'conference',
        owner: 'vq',
        department: 'pr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'الدوحة', en: 'Doha' },
        lat: 25.2854,
        lng: 51.5310,
        image: 'photo-1505373877841-8d25f7d46678',
        title: { ar: 'وجهات نظر عالمية CNN', en: 'CNN Global Perspectives' },
        summary: { ar: 'نخبة من كبار المسؤولين والقادة في السياسة والأعمال يناقشون أبرز القضايا في الدوحة.', en: 'Senior officials and leaders in politics and business discuss today’s most pressing issues in Doha.' },
        body: [
            { ar: 'تستضيف CNN نخبة من كبار المسؤولين والقادة في السياسة والأعمال، إلى جانب أصحاب الرؤى والفكر، ضمن فعالية «وجهات نظر عالمية» (Global Perspectives) في الدوحة، لمناقشة أبرز القضايا الملحّة في مجالات متنوعة تشمل الجيوسياسة والتكنولوجيا والإعلام والثقافة.', en: 'CNN brings together senior officials and leaders in politics and business, alongside visionaries and thinkers, at “Global Perspectives” in Doha to discuss the most pressing issues across geopolitics, technology, media and culture.' },
            { ar: 'كما سيتولى صحفيو CNN إدارة الجلسات الحوارية المباشرة، إلى جانب تقديم تغطية تحريرية واسعة تشمل أبرز المقابلات والمحتوى المصاحب للحدث عبر مختلف منصات الشبكة.', en: 'CNN journalists will moderate the live panel sessions and provide extensive editorial coverage, including key interviews and content around the event across the network’s platforms.' }
        ]
    },
    {
        id: 'standup-taha',
        number: 'EV-2026-031',
        start: '2026-09-12',
        end: '2026-09-12',
        category: 'entertainment',
        owner: 'qc',
        department: 'pr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'قاعة الفردان', en: 'Al Fardan Hall' },
        lat: 25.3278,
        lng: 51.5305,
        image: 'photo-1514525253161-7a46d19cd819',
        title: { ar: 'عرض ستاند أب كوميدي - طه دسوقي', en: 'Stand-up comedy — Taha Desouky' },
        summary: { ar: 'أمسية كوميدية مع الفنان طه دسوقي في قاعة الفردان.', en: 'A comedy evening with Taha Desouky at Al Fardan Hall.' },
        body: [
            { ar: 'تُقام أمسية ستاند أب كوميدي مع الفنان طه دسوقي في قاعة الفردان.', en: 'A stand-up comedy evening with Taha Desouky takes place at Al Fardan Hall.' },
            { ar: 'لمعرفة تفاصيل الحضور، يُرجى التواصل مع فريق العلاقات العامة والاتصال.', en: 'For attendance details, please contact the PR & Communications team.' }
        ]
    },
    {
        id: 'forbes-workshop',
        number: 'EV-2026-029',
        start: '2026-09-09',
        end: '2026-09-09',
        category: 'training',
        owner: 'qc',
        department: 'hr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'برج الدوحة', en: 'Doha Tower' },
        lat: 25.3176,
        lng: 51.5276,
        image: 'photo-1540575467063-178a50c2df87',
        title: { ar: 'ورشة قيادات الضيافة مع فوربس للسفر', en: 'Hospitality leadership workshop with Forbes Travel' },
        summary: { ar: 'ورشة عمل لقيادات قطاع الضيافة حول معايير الخدمة وتجربة الضيف.', en: 'A workshop for hospitality leaders on service standards and guest experience.' },
        body: [
            { ar: 'ورشة عمل تجمع قيادات قطاع الضيافة لمناقشة معايير الخدمة وتجربة الضيف، بمشاركة فوربس للسفر.', en: 'A workshop bringing together hospitality leaders to discuss service standards and guest experience, with Forbes Travel.' },
            { ar: 'التسجيل متاح عبر صفحة الدورات حسب المقاعد المتوفرة.', en: 'Registration is available through the Courses page, subject to seat availability.' }
        ]
    },
    {
        id: 'health-day',
        number: 'EV-2026-027',
        start: '2026-09-05',
        end: '2026-09-05',
        category: 'wellbeing',
        owner: 'qc',
        department: 'hr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'قاعة الاجتماعات الرئيسية', en: 'Main meeting hall' },
        lat: 25.2895,
        lng: 51.5338,
        image: 'photo-1576091160550-2173dba999ef',
        title: { ar: 'يوم التوعية الصحية للموظفين', en: 'Employee health awareness day' },
        summary: { ar: 'يوم مخصص للتوعية الصحية وأنماط الحياة الصحية للموظفين.', en: 'A day dedicated to health awareness and healthy lifestyles for employees.' },
        body: [
            { ar: 'يوم مخصص للتوعية الصحية للموظفين في قاعة الاجتماعات الرئيسية.', en: 'A health awareness day for employees in the main meeting hall.' },
            { ar: 'ندعو جميع الموظفين للمشاركة.', en: 'All employees are welcome to take part.' }
        ]
    },
    {
        id: 'partners-forum',
        number: 'EV-2026-024',
        start: '2026-09-01',
        end: '2026-09-02',
        category: 'conference',
        owner: 'vq',
        department: 'ceo',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'مركز قطر الوطني للمؤتمرات', en: 'Qatar National Convention Centre' },
        lat: 25.3236,
        lng: 51.4385,
        image: 'photo-1475721027785-f74eccf877e2',
        title: { ar: 'ملتقى الشركاء السياحيين', en: 'Tourism partners forum' },
        summary: { ar: 'ملتقى يجمع قطر للسياحة بشركائها في القطاع السياحي.', en: 'A forum bringing Visit Qatar together with its tourism sector partners.' },
        body: [
            { ar: 'ملتقى يجمع قطر للسياحة بشركائها في القطاع السياحي في مركز قطر الوطني للمؤتمرات.', en: 'A forum bringing Visit Qatar together with its tourism sector partners at the Qatar National Convention Centre.' },
            { ar: 'تتوفر صور الملتقى في معرض الصور.', en: 'Photos from the forum are available in the Photo Gallery.' }
        ],
        album: 'partners-forum'
    },
    {
        id: 'wellness-week',
        number: 'EV-2026-033',
        start: '2026-09-14',
        end: '2026-09-18',
        category: 'wellbeing',
        owner: 'qc',
        department: 'hr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'قاعة الاجتماعات الرئيسية', en: 'Main meeting hall' },
        lat: 25.2895,
        lng: 51.5338,
        image: 'photo-1571019614242-c5c5dee9f50b',
        title: { ar: 'أسبوع الرفاه الوظيفي', en: 'Staff wellness week' },
        summary: { ar: 'أسبوع من الجلسات الصحية وفعاليات الرفاه للموظفين.', en: 'A week of health sessions and wellbeing activities for staff.' },
        body: [
            { ar: 'يُقام أسبوع الرفاه الوظيفي في قاعة الاجتماعات الرئيسية، ويشمل فحوصات توعوية وورش عمل عن أنماط الحياة الصحية.', en: 'Staff wellness week is held in the main meeting hall, with awareness checks and workshops on healthy lifestyles.' },
            { ar: 'البرنامج ممتد على مدار أيام الأسبوع، ويُدعى جميع الموظفين للمشاركة في أي يوم يناسبهم.', en: 'The programme runs across the working week, and all employees are welcome to join on any day that suits them.' }
        ]
    },
    {
        id: 'autumn-roadshow',
        number: 'EV-2026-035',
        start: '2026-09-21',
        end: '2026-10-09',
        category: 'conference',
        owner: 'qc',
        department: 'pr',
        country: { ar: 'قطر', en: 'Qatar' },
        location: { ar: 'مركز قطر الوطني للمؤتمرات', en: 'Qatar National Convention Centre' },
        lat: 25.3236,
        lng: 51.4385,
        image: 'photo-1511578314322-379afb476865',
        title: { ar: 'جولة الوجهات الخريفية', en: 'Autumn destinations roadshow' },
        summary: { ar: 'برنامج ترويجي ممتد لعدة أسابيع مع الشركاء السياحيين.', en: 'A multi-week promotional programme with tourism partners.' },
        body: [
            { ar: 'جولة ترويجية تمتد لثلاثة أسابيع في مركز قطر الوطني للمؤتمرات، لعرض الوجهات والبرامج الخريفية مع شركاء القطاع.', en: 'A three-week promotional roadshow at the Qatar National Convention Centre, showcasing autumn destinations and programmes with sector partners.' },
            { ar: 'تُعقد الجلسات على مدى الفترة كاملة، ويمكن للموظفين الاطلاع على الجدول اليومي عبر التقويم.', en: 'Sessions run throughout the period, and staff can follow the daily schedule on the calendar.' }
        ]
    },
    /* Tradeshows & roadshows — mock cards from Qatar Tourism press releases
       https://www.qatartourism.com/en/news-and-media/press-releases
       Kuwait’s event day is not stated in the release; 10 Feb 2025 is the day before the 11 Feb 2025 announcement. */
    {
        id: 'ibtm-barcelona-2025',
        number: 'TS-2025-006',
        start: '2025-11-18',
        end: '2025-11-20',
        category: 'tradeshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'إسبانيا', en: 'Spain' },
        location: { ar: 'برشلونة', en: 'Barcelona' },
        lat: 41.3545,
        lng: 2.1280,
        image: 'photo-1540575467063-178a50c2df87',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/visit-qatar-strengthens-mice-partnerships-during-participation-a',
        title: { ar: 'آي بي تي إم وورلد 2025 — برشلونة', en: 'IBTM World 2025 — Barcelona' },
        summary: { ar: 'مشاركة Visit Qatar في معرض الاجتماعات والحوافز والمؤتمرات والمعارض ببرشلونة، 18–20 نوفمبر.', en: 'Visit Qatar at IBTM World, a leading MICE trade show in Barcelona, 18–20 November.' },
        body: [
            { ar: 'اختتمت Visit Qatar مشاركتها في آي بي تي إم وورلد 2025، أحد أبرز المعارض العالمية لقطاع الاجتماعات والحوافز والمؤتمرات والمعارض، في برشلونة من 18 إلى 20 نوفمبر.', en: 'Visit Qatar concluded its participation at IBTM World 2025, a leading trade show for meetings, incentives, conferences and exhibitions, held in Barcelona from 18 to 20 November.' },
            { ar: 'استضافت مساء 17 نوفمبر لقاءً شبكياً مع MeetIN جمع مهنيي قطاع الاجتماعات في إسبانيا، واختُتم بعشاء احتفالي للشراكات الجديدة والمجدَّدة.', en: 'On 17 November it hosted a networking evening with MeetIN for Spanish MICE professionals, closing with a gala dinner for new and renewed partnerships.' }
        ]
    },
    {
        id: 'imex-frankfurt-2025',
        number: 'TS-2025-005',
        start: '2025-05-20',
        end: '2025-05-22',
        category: 'tradeshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'ألمانيا', en: 'Germany' },
        location: { ar: 'ميسي فرانكفورت', en: 'Messe Frankfurt' },
        lat: 50.1115,
        lng: 8.6488,
        image: 'photo-1475721027785-f74eccf877e2',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/visit-qatar-showcases-mice-capabilities-at-imex-frankfurt-2025',
        title: { ar: 'آي مكس فرانكفورت 2025', en: 'IMEX Frankfurt 2025' },
        summary: { ar: 'وفد من 16 جهة في قطاع السياحة لعرض قدرات قطر في اجتماعات الأعمال، 20–22 مايو.', en: 'A delegation of 16 tourism entities showcasing Qatar’s business-events offer, 20–22 May.' },
        body: [
            { ar: 'قادت Visit Qatar وفداً من 16 جهة في قطاع السياحة للمشاركة في آي مكس فرانكفورت 2025، أحد أبرز معارض قطاع الاجتماعات والحوافز والمؤتمرات والمعارض.', en: 'Visit Qatar led a delegation of 16 tourism-sector entities at IMEX Frankfurt 2025, one of the world’s leading MICE trade exhibitions.' },
            { ar: 'أُقيم المعرض في ميسي فرانكفورت من 20 إلى 22 مايو، وشارك في جناح Visit Qatar الخطوط الجوية القطرية وعدد من الفنادق وشركات إدارة الوجهات.', en: 'Held at Messe Frankfurt from 20 to 22 May, the Visit Qatar pavilion included Qatar Airways plus hotels and destination-management companies.' }
        ]
    },
    {
        id: 'wtm-africa-2025',
        number: 'TS-2025-004',
        start: '2025-04-09',
        end: '2025-04-11',
        category: 'tradeshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'جنوب أفريقيا', en: 'South Africa' },
        location: { ar: 'مركز كيب تاون الدولي للمؤتمرات', en: 'Cape Town International Convention Centre' },
        lat: -33.9155,
        lng: 18.4258,
        image: 'photo-1505373877841-8d25f7d46678',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/visit-qatar-concludes-successful-participation-at-wtm-africa-2025-in-cape-town',
        title: { ar: 'سوق السفر العالمي أفريقيا 2025 — كيب تاون', en: 'WTM Africa 2025 — Cape Town' },
        summary: { ar: 'مشاركة في كيب تاون من 9 إلى 11 أبريل، مع جائزة الجناح الأكثر ابتكاراً.', en: 'Participation in Cape Town from 9 to 11 April, awarded Most Innovative Stand.' },
        body: [
            { ar: 'اختتمت Visit Qatar مشاركتها في سوق السفر العالمي أفريقيا 2025، الذي أُقيم من 9 إلى 11 أبريل في مركز كيب تاون الدولي للمؤتمرات، وفاز جناحها بجائزة الجناح الأكثر ابتكاراً.', en: 'Visit Qatar concluded WTM Africa 2025, held from 9 to 11 April at the Cape Town International Convention Centre, and received the Most Innovative Stand award.' },
            { ar: 'ضم الوفد تسعة شركاء من السفر والضيافة، منهم الخطوط الجوية القطرية وديسكفر قطر وإكسبيرينس قطر وعدد من الفنادق.', en: 'The delegation included nine travel and hospitality partners, among them Qatar Airways, Discover Qatar, Experience Qatar and several hotels.' }
        ]
    },
    {
        id: 'otm-mumbai-2025',
        number: 'TS-2025-003',
        start: '2025-01-30',
        end: '2025-02-01',
        category: 'tradeshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'الهند', en: 'India' },
        location: { ar: 'مركز جيو وورلد للمؤتمرات، مومباي', en: 'Jio World Convention Centre, Mumbai' },
        lat: 19.0630,
        lng: 72.8690,
        image: 'photo-1460925895917-afdab827c52f',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/vq-attends-otm-2025',
        title: { ar: 'معرض أو تي إم 2025 — مومباي', en: 'OTM 2025 — Mumbai' },
        summary: { ar: 'مشاركة في معرض السفر الخارجي بالهند من 30 يناير إلى 1 فبراير في مومباي.', en: 'Participation in India’s Outbound Travel Mart, 30 January to 1 February in Mumbai.' },
        body: [
            { ar: 'شاركت Visit Qatar في معرض أو تي إم 2025، المعرض التجاري الرائد للسفر في الهند وآسيا، من 30 يناير إلى 1 فبراير في مركز جيو وورلد للمؤتمرات في مومباي.', en: 'Visit Qatar took part in OTM 2025, the leading travel trade show in India and Asia, from 30 January to 1 February at the Jio World Convention Centre in Mumbai.' },
            { ar: 'أتاح المعرض بناء شراكات والالتقاء بمنظمي الرحلات ووكلاء السفر، والهند ثاني أكبر سوق مصدرة للزوار إلى قطر في 2024.', en: 'The show was used to build partnerships with tour operators and travel agents. India was Qatar’s second-largest source market in 2024.' }
        ]
    },
    {
        id: 'kuwait-roadshow-2025',
        number: 'RS-2025-002',
        start: '2025-02-10',
        end: '2025-02-10',
        category: 'roadshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'الكويت', en: 'Kuwait' },
        location: { ar: 'والدورف أستوريا الكويت', en: 'Waldorf Astoria Kuwait' },
        lat: 29.3772,
        lng: 47.9906,
        image: 'photo-1511578314322-379afb476865',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/visit-qatar-successfully-concludes-inaugural-roadshow-in-kuwait',
        title: { ar: 'الجولة الترويجية الأولى في الكويت', en: 'Inaugural roadshow in Kuwait' },
        summary: { ar: 'أول جولة رسمية لـ Visit Qatar في الكويت مع Go Beyond والخليج للسفر، لعطلات المسافات القصيرة والتوقف المؤقت.', en: 'Visit Qatar’s first official Kuwait roadshow, with Go Beyond and Al Khaleej Travel, for short breaks and stopovers.' },
        body: [
            { ar: 'اختتمت Visit Qatar أول جولة ترويجية رسمية لها في الكويت بالشراكة مع Go Beyond، الوكالة التابعة للخليج للسفر. عرضت الجولة قطر كوجهة للترفيه والأعمال، بما فيها العطلات القصيرة والوجهات الشتوية والتوقف المؤقت.', en: 'Visit Qatar concluded its first official roadshow in Kuwait with Go Beyond, powered by Al Khaleej Travel. It positioned Qatar for leisure and business travel, including short breaks, winter getaways and stopovers.' },
            { ar: 'جمعت الجولة شركاء من قطر، منهم الخطوط الجوية القطرية وعدد من الفنادق، مع 150 مهنياً من منظمي الرحلات ووكالات السفر في الكويت.', en: 'It brought together Qatar partners, including Qatar Airways and leading hotels, with 150 professionals from Kuwaiti tour operators and travel agencies.' }
        ]
    },
    {
        id: 'china-roadshow-2023',
        number: 'RS-2023-001',
        start: '2023-03-27',
        end: '2023-03-31',
        category: 'roadshow',
        group: 'shows',
        department: 'pr',
        country: { ar: 'الصين', en: 'China' },
        location: { ar: 'شنتشن، غوانغتشو، شنغهاي وبكين', en: 'Shenzhen, Guangzhou, Shanghai and Beijing' },
        lat: 31.2304,
        lng: 121.4737,
        image: 'photo-1552664730-d307ca884978',
        source: 'https://www.qatartourism.com/en/news-and-media/press-releases/qatar_tourism_concludesmulticityroadshowacrossfourmajorcitiesinc',
        title: { ar: 'الجولة الترويجية في أربع مدن صينية', en: 'Four-city roadshow in China' },
        summary: { ar: 'جولة قطر للسياحة مع الخطوط الجوية القطرية في شنتشن وغوانغتشو وشنغهاي وبكين، 27–31 مارس 2023.', en: 'Qatar Tourism and Qatar Airways across Shenzhen, Guangzhou, Shanghai and Beijing, 27–31 March 2023.' },
        body: [
            { ar: 'أُقيمت جولة قطر للسياحة في الصين 2023 في شنتشن وغوانغتشو وشنغهاي وبكين من 27 إلى 31 مارس 2023، بالشراكة مع الخطوط الجوية القطرية.', en: 'The Qatar Tourism China Roadshow 2023 ran in Shenzhen, Guangzhou, Shanghai and Beijing from 27 to 31 March 2023, in partnership with Qatar Airways.' },
            { ar: 'تعرّف أكثر من 200 مهنياً من وكالات السفر الإلكترونية ومنظمي الرحلات والإعلام التجاري على التراث والبنية الحديثة وعروض الضيافة في قطر.', en: 'More than 200 professionals from online travel agencies, tour operators and trade media were introduced to Qatar’s heritage, infrastructure and hospitality offer.' }
        ]
    }
];
