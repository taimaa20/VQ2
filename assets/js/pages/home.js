/* Home — SPFx HomePage web part composition:
   Internal Comms / Employee Relations circulars (one featured card + links each) → VQ Calendar → VQ & QT Events →
   Tradeshows & Roadshows → Latest News → Discounts repository
   (Theme of the Month ticker and the compact prayer / weather widgets sit in the shell strip
   above; vision & mission, visitor statistics, links and hotlines live in the side panel) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    /* VQ public events first, then QC staff events. Shows live in their own section. */
    const EVENT_IDS = ['global-perspectives', 'partners-forum', 'standup-taha', 'forbes-workshop'];
    /* These four lead the discounts slider; the remaining discounts follow them */
    const DISCOUNT_IDS = ['pearl-gewan', 'restaurants', 'culture-tickets', 'fitness'];

    const s = { day: null, month: null };

    const byDateDesc = key => (a, b) => b[key].localeCompare(a[key]);
    const homeEvents = () => EVENT_IDS.map(id => D.events.find(e => e.id === id)).filter(Boolean);
    const homeShows = () => D.events.filter(e => e.group === 'shows').slice().sort((a, b) => b.start.localeCompare(a.start)).slice(0, 4);
    const homeDiscounts = () => DISCOUNT_IDS.map(id => D.discounts.find(d => d.id === id)).filter(Boolean)
        .concat(D.discounts.filter(d => DISCOUNT_IDS.indexOf(d.id) === -1));
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

    /* Newest circular = the featured card; the next ones are listed as plain links beside it */
    const MORE_LINKS = 4;
    const circularsOf = owner => D.announcements.filter(a => a.owner === owner).sort(byDateDesc('start')).slice(0, 1 + MORE_LINKS);

    /* Same card composition as the Announcements listing page: the circular artwork that the
       type already carries (general.png / ceo.png / death.png / HR.png), the coloured type
       strip and the circular number, then the title, summary and date (no type label). */
    function circularCard(a) {
        const ty = ui.typeOfAnnouncement(a.type);
        return ui.listingCard({
            url: VQ.href('announcement-details', { id: a.id }),
            image: ty.image,
            overlay: `<span class="type-strip" style="background:${ty.color}"></span>`,
            chips: ui.tag(`<span class="ltr">${esc(a.number)}</span>`, 'outline'),
            title: esc(tx(a.title)),
            desc: esc(tx(a.summary)),
            meta: `<span>${VQ.icon('calendar')}${VQ.fmtCardDate(a.start)}</span>`,
            button: false
        });
    }

    const circularLink = a => `<li><a class="circular-link" href="${VQ.href('announcement-details', { id: a.id })}">
        <span class="circular-link-title">${esc(tx(a.title))}</span>
        <span class="circular-link-date">${VQ.fmtDate(a.start, 'short')}</span>
    </a></li>`;

    function circularBody(list) {
        const more = list.slice(1);
        return `<div class="circular-body${more.length ? '' : ' is-single'}">
            <div class="circular-feature">${circularCard(list[0])}</div>
            ${more.length ? `<nav class="circular-links" aria-label="${esc(t('hpCircMore'))}">
                <p class="circular-links-title">${t('hpCircMore')}</p>
                <ul>${more.map(circularLink).join('')}</ul>
            </nav>` : ''}
        </div>`;
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
            ${list.length ? circularBody(list) : `<p class="circular-empty">${t('hpCircEmpty')}</p>`}
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

    function startMonth(events) {
        const month = VQ.isoDate(VQ.today()).slice(0, 7);
        return events.some(e => e.start.slice(0, 7) <= month && e.end.slice(0, 7) >= month) ? month : homeEvents()[0].start.slice(0, 7);
    }

    function shiftMonth(month, step) {
        const [y, m] = month.split('-').map(Number);
        return VQ.isoDate(new Date(y, m - 1 + step, 1)).slice(0, 7);
    }

    function calendarHTML() {
        const events = D.events.slice().sort((a, b) => a.start.localeCompare(b.start));
        if (!s.month) s.month = startMonth(events);
        const month = s.month;

        const [y, m] = month.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const monthStart = VQ.isoDate(first);
        const monthEnd = VQ.isoDate(new Date(y, m - 1, days));
        const inMonth = events.filter(e => e.start <= monthEnd && e.end >= monthStart);
        const on = iso => inMonth.filter(e => e.start <= iso && e.end >= iso);
        const monthLabel = new Intl.DateTimeFormat(VQ.locale(), { month: 'long', year: 'numeric' }).format(first);
        const holidays = (D.holidays || []).filter(h => h.start <= monthEnd && h.end >= monthStart);
        const cells = ui.calendarCells({ year: y, month: m, events: inMonth, selected: s.day, holidays });
        const holidayDates = h => VQ.fmtRange(h.start < monthStart ? monthStart : h.start, h.end > monthEnd ? monthEnd : h.end, 'short');

        const shown = s.day ? on(s.day) : inMonth;
        return `<div class="calendar-layout">
            <div class="calendar-box">
                <div class="calendar-head">
                    <h4>${monthLabel}</h4>
                    <div class="calendar-nav">
                        <button type="button" class="slider-arrow" data-cal-month="-1" aria-label="${t('prevMonth')}">${ui.chevronPrev()}</button>
                        <button type="button" class="slider-arrow" data-cal-month="1" aria-label="${t('nextMonth')}">${ui.chevronNext()}</button>
                    </div>
                </div>
                <div class="calendar-weekdays">${WEEKDAYS[VQ.state.lang].map(d => `<span>${d}</span>`).join('')}</div>
                <div class="calendar-grid">${cells}</div>
                <div class="calendar-legend">
                    <span><i style="background:var(--vq-teal)"></i>${t('evCalEventDay')}</span>
                    <span><i style="background:rgba(215,107,0,.35)"></i>${t('evCalToday')}</span>
                    <span><i class="legend-holiday"></i>${t('evCalHoliday')}</span>
                </div>
                ${holidays.length ? `<div class="calendar-holidays">
                    <p>${t('evCalHolidays')}</p>
                    <ul>${holidays.map(h => `<li><i class="legend-holiday" aria-hidden="true"></i><span>${esc(tx(h.title))}</span><small>${holidayDates(h)}</small></li>`).join('')}</ul>
                </div>` : ''}
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

    /* ---------- Discounts repository: listing cards in a slider (same pattern as Latest News) ---------- */

    function discountsHTML() {
        return ui.section(
            ui.sectionHead({ title: t('hpDiscounts'), link: VQ.href('discounts') }) +
            `<p class="section-desc">${t('hpDiscountsDesc')}</p>` +
            `<div class="offers-slider">${ui.slider({ perView: 2, gap: '1rem', autoplay: 6500, arrows: true, items:
                homeDiscounts().map(d => {
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
                }) })}</div>`,
            'home-discounts'
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
                const step = e.target.closest('[data-cal-month]');
                if (day || step) {
                    if (step) {
                        s.month = shiftMonth(s.month, Number(step.dataset.calMonth));
                        s.day = null;
                    } else {
                        s.day = day.dataset.calDay && day.dataset.calDay !== s.day ? day.dataset.calDay : null;
                    }
                    const body = VQ.$('#eventsBody');
                    ui.unmountCalendarMaps(body);
                    body.innerHTML = calendarHTML();
                    ui.mountCalendarMaps(body);
                }
            });
        }
    });
})();
