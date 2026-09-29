/* Home — SPFx HomePage web part composition:
   Internal Comms / Employee Relations circulars → VQ Calendar → VQ & QT Events →
   Tradeshows & Roadshows → Latest News → Discounts repository
   (Theme of the Month ticker and the compact prayer / weather widgets sit in the shell strip
   above; vision & mission, visitor statistics, links and hotlines live in the side panel) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    /* VQ public events first, then QC staff events. Shows live in their own section. */
    const EVENT_IDS = ['global-perspectives', 'partners-forum', 'standup-taha', 'forbes-workshop'];
    const DISCOUNT_IDS = ['pearl-gewan', 'restaurants', 'culture-tickets', 'fitness'];

    const s = { day: null };

    const byDateDesc = key => (a, b) => b[key].localeCompare(a[key]);
    const homeEvents = () => EVENT_IDS.map(id => D.events.find(e => e.id === id)).filter(Boolean);
    const homeShows = () => D.events.filter(e => e.group === 'shows').slice().sort((a, b) => b.start.localeCompare(a.start)).slice(0, 4);
    const homeDiscounts = () => DISCOUNT_IDS.map(id => D.discounts.find(d => d.id === id)).filter(Boolean);
    const homeNews = () => D.news.slice().sort(byDateDesc('date')).slice(0, 6);
    const catOf = (list, key) => list.find(c => c.key === key);

    /* ---------- 1 · Circulars: two separate boxes, one per publishing team ----------
       Left  = Internal Comms (PR / Communications)   right = Employee Relations (HR).
       Both read the existing /data/announcements.js entries through their `owner` field.
       Which circular belongs to which box is PROTOTYPE MOCK DATA, not a confirmed business
       rule — see the note at the top of /data/announcements.js. Both "Show All" links go to
       the existing Announcements page; no owner filtering was added there. */

    const CIRCULAR_BOXES = [
        { owner: 'comms', title: 'hpCircComms', sub: 'hpCircCommsOwner', icon: 'fa-bullhorn', cls: 'is-comms' },
        { owner: 'er', title: 'hpCircEr', sub: 'hpCircErOwner', icon: 'fa-user-group', cls: 'is-er' }
    ];

    const circularsOf = owner => D.announcements.filter(a => a.owner === owner).sort(byDateDesc('start')).slice(0, 4);

    /* Same card composition as the Announcements listing page: the circular artwork that the
       type already carries (general.png / ceo.png / death.png / HR.png), the coloured type
       strip, the type tag and circular number, then the title and the date. */
    function circularCard(a) {
        const ty = ui.typeOfAnnouncement(a.type);
        return ui.listingCard({
            url: VQ.href('announcement-details', { id: a.id }),
            image: ty.image,
            overlay: `<span class="type-strip" style="background:${ty.color}"></span>`,
            chips: ui.typeTag(ty) + ui.tag(`<span class="ltr">${esc(a.number)}</span>`, 'outline'),
            title: esc(tx(a.title)),
            meta: `<span>${VQ.icon('calendar')}${VQ.fmtCardDate(a.start)}</span>`,
            button: false
        });
    }

    function circularBox(box) {
        const list = circularsOf(box.owner);
        return `<section class="circular-box ${box.cls}" aria-label="${esc(t(box.title))}">
            <header class="circular-box-head">
                <span class="circular-box-icon"><i class="fa-solid ${box.icon}"></i></span>
                <span class="circular-box-titles">
                    <h3>${t(box.title)}</h3>
                    <p>${t(box.sub)}</p>
                </span>
                <a class="show-more" href="${VQ.href('announcements')}">${t('showAll')} ${ui.arrow()}</a>
            </header>
            ${list.length
                ? `<div class="circular-cards">${list.map(circularCard).join('')}</div>`
                : `<p class="circular-empty">${t('hpCircEmpty')}</p>`}
        </section>`;
    }

    const circularsHTML = () => ui.section(
        `<div class="circulars-grid">${CIRCULAR_BOXES.map(circularBox).join('')}</div>`,
        'section-circulars'
    );

    /* ---------- VQ Calendar, then QC Events (separate sections, no view switch) ---------- */

    function eventCard(e) {
        const cat = catOf(D.eventCategories, e.category);
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="event-card">
            <div class="card-Event">${VQ.img(e.image, '', 800)}${ui.cardDate(e.start, 'is-bottom')}</div>
            <div class="card-details">
                <div class="card-info">
                    <div class="card-chips">${ui.tag(tx(cat.label), '', cat.icon)}${e.owner ? ui.tag(t(e.owner === 'vq' ? 'evOwnerVq' : 'evOwnerQc')) : ''}</div>
                    <h3 class="card-title">${esc(tx(e.title))}</h3>
                    <p class="card-description">${esc(tx(e.summary))}</p>
                </div>
                <div class="card-foot">
                    <span class="card-meta"><span><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</span></span>
                    <span class="see-more">${t('seeMore')} ${ui.arrow()}</span>
                </div>
            </div>
        </a>`;
    }

    const WEEKDAYS = { ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };

    function calendarHTML() {
        const events = D.events.slice().sort((a, b) => a.start.localeCompare(b.start));
        let month = VQ.isoDate(VQ.today()).slice(0, 7);
        if (!events.some(e => e.start.slice(0, 7) <= month && e.end.slice(0, 7) >= month)) month = homeEvents()[0].start.slice(0, 7);

        const [y, m] = month.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const monthStart = VQ.isoDate(first);
        const monthEnd = VQ.isoDate(new Date(y, m - 1, days));
        const inMonth = events.filter(e => e.start <= monthEnd && e.end >= monthStart);
        const on = iso => inMonth.filter(e => e.start <= iso && e.end >= iso);
        const monthLabel = new Intl.DateTimeFormat(VQ.locale(), { month: 'long', year: 'numeric' }).format(first);
        const cells = ui.calendarCells({ year: y, month: m, events: inMonth, selected: s.day });

        const shown = s.day ? on(s.day) : inMonth;
        return `<div class="calendar-layout">
            <div class="calendar-box">
                <div class="calendar-head"><h4>${monthLabel}</h4><i class="fa-regular fa-calendar" style="color:var(--vq-teal)"></i></div>
                <div class="calendar-weekdays">${WEEKDAYS[VQ.state.lang].map(d => `<span>${d}</span>`).join('')}</div>
                <div class="calendar-grid">${cells}</div>
                <div class="calendar-legend">
                    <span><i style="background:var(--vq-teal)"></i>${t('evCalEventDay')}</span>
                    <span><i style="background:rgba(215,107,0,.35)"></i>${t('evCalToday')}</span>
                </div>
                <p class="calendar-note"><i class="fa-solid fa-arrows-rotate"></i>${t('hpCalendarSync')}</p>
            </div>
            ${ui.calendarMap(shown)}
        </div>`;
    }

    function calendarSection() {
        return ui.section(
            ui.sectionHead({
                title: t('hpCalendar'),
                link: VQ.href('events', { view: 'calendar' })
            }) +
            `<div id="eventsBody">${calendarHTML()}</div>`,
            'home-calendar'
        );
    }

    function eventsSection() {
        return ui.section(
            ui.sectionHead({
                title: t('hpEvents'),
                link: VQ.href('events')
            }) +
            ui.slider({ items: homeEvents().map(eventCard), perView: 2, gap: '1rem', arrows: true }),
            'home-events'
        );
    }

    function showsSection() {
        return ui.section(
            ui.sectionHead({
                title: t('hpShows'),
                link: VQ.href('events', { group: 'shows' })
            }) +
            ui.slider({ items: homeShows().map(eventCard), perView: 2, gap: '1rem', arrows: true }),
            'home-events home-shows'
        );
    }

    /* ---------- Discounts repository: 2 × 2 listing cards (not a “latest” feed) ---------- */

    function discountsHTML() {
        return ui.section(
            ui.sectionHead({ title: t('hpDiscounts'), link: VQ.href('discounts') }) +
            `<p class="section-desc">${t('hpDiscountsDesc')}</p>` +
            `<div class="offers-grid">
                ${homeDiscounts().map(d => {
                    const cat = catOf(D.discountCategories, d.category);
                    return ui.listingCard({
                        url: VQ.href('discount-details', { id: d.id }),
                        image: d.image,
                        date: d.start,
                        badge: ui.percentBadge(d.percent),
                        chips: ui.tag(tx(cat.label), '', cat.icon),
                        title: esc(tx(d.title)),
                        meta: `<span class="meta-ruby"><i class="fa-regular fa-clock"></i>${t('dsValidUntil', { d: VQ.fmtDate(d.end, 'short') })}</span>`,
                        foot: `<span class="see-more">${t('seeMore')} ${ui.arrow()}</span>`
                    });
                }).join('')}
            </div>`
        );
    }

    /* ---------- 4 · Latest news: SPFx news-card carousel ---------- */

    function newsHTML() {
        const cards = homeNews().map(n => `<a href="${VQ.href('news-details', { id: n.id })}" class="news-card">
            <div class="news-image-wrapper"><div class="news-image">${VQ.img(n.image, '', 900)}</div></div>
            <div class="news-content">
                <div class="card-chips">${ui.tag(tx(catOf(D.newsCategories, n.category).label))}</div>
                <p class="news-date">${VQ.icon('calendar')}${VQ.fmtCardDate(n.date)}</p>
                <h3 class="news-title">${esc(tx(n.title))}</h3>
                <p class="news-description">${esc(tx(n.summary))}</p>
                <div class="more-row"><span class="see-more">${t('nwReadMore')} ${ui.arrow()}</span></div>
            </div>
        </a>`);
        return ui.section(
            ui.sectionHead({ title: t('hpNews'), link: VQ.href('news') }) +
            ui.slider({ items: cards, perView: 1, autoplay: 6500, arrows: true })
        );
    }

    VQ.boot({
        title: () => t('navHome'),

        render() {
            ui.unmountCalendarMaps(VQ.$('#pageContent'));
            VQ.content(`<h1 class="sr-only">${t('navHome')}</h1><div class="page-surface home-surface">${circularsHTML()}${calendarSection()}${eventsSection()}${showsSection()}${newsHTML()}${discountsHTML()}</div>`);
            ui.mountCalendarMaps(VQ.$('#pageContent'));
        },

        setup(root) {
            root.addEventListener('click', e => {
                const day = e.target.closest('[data-cal-day]');
                if (day) {
                    s.day = day.dataset.calDay && day.dataset.calDay !== s.day ? day.dataset.calDay : null;
                    const body = VQ.$('#eventsBody');
                    ui.unmountCalendarMaps(body);
                    body.innerHTML = calendarHTML();
                    ui.mountCalendarMaps(body);
                }
            });
        }
    });
})();
