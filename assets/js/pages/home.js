/* Home — SPFx HomePage web part composition, Option 1 content and order:
   Latest Updates → QC Events / VQ Calendar → Latest Discounts → Latest News
   (weather, prayer times, systems, message/vision/mission, structure and hotlines live in the shared side panel) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    /* Same items as Option 1's homepage */
    const EVENT_IDS = ['standup-taha', 'forbes-workshop', 'health-day', 'partners-forum'];
    const DISCOUNT_IDS = ['pearl-gewan', 'restaurants', 'culture-tickets', 'fitness'];
    const ROTATE_MS = 7000;

    const s = { update: 0, view: 'list', day: null, paused: false };
    let timer = null;

    const byDateDesc = key => (a, b) => b[key].localeCompare(a[key]);
    const updates = () => D.announcements.slice().sort(byDateDesc('start')).slice(0, 4);
    const homeEvents = () => EVENT_IDS.map(id => D.events.find(e => e.id === id)).filter(Boolean);
    const homeDiscounts = () => DISCOUNT_IDS.map(id => D.discounts.find(d => d.id === id)).filter(Boolean);
    const homeNews = () => D.news.slice().sort(byDateDesc('date')).slice(0, 6);
    const catOf = (list, key) => list.find(c => c.key === key);

    /* ---------- 1 · Latest updates: featured circular + index of the latest four ---------- */

    function featureHTML(a) {
        const ty = ui.typeOfAnnouncement(a.type);
        return `<a href="${VQ.href('announcement-details', { id: a.id })}" class="news-card updates-feature">
            <div class="news-image-wrapper"><div class="news-image">${VQ.img(ty.image, '', 900, tx(ty.label))}</div></div>
            <div class="news-content">
                <div class="card-chips">${ui.typeTag(ty)}${ui.tag(`<span class="ltr">${a.number}</span>`, 'outline')}</div>
                <p class="news-date">${VQ.icon('calendar')}${VQ.fmtCardDate(a.start)}</p>
                <h3 class="news-title">${esc(tx(a.title))}</h3>
                <p class="news-description">${esc(tx(a.summary))}</p>
                <div class="more-row"><span class="more-link">${t('viewDetails')} ${ui.arrow()}</span></div>
            </div>
        </a>`;
    }

    function updatesHTML() {
        const list = updates();
        return ui.section(
            ui.sectionHead({ title: t('hpUpdates'), link: VQ.href('announcements'), linkLabel: t('showAll') }) +
            `<div class="updates ${s.paused ? 'is-paused' : ''}" id="updates">
                <div id="updateFeature">${featureHTML(list[s.update])}</div>
                <div class="updates-index" role="tablist" aria-label="${t('hpUpdates')}">
                    ${list.map((a, i) => {
                        const ty = ui.typeOfAnnouncement(a.type);
                        return `<button type="button" role="tab" class="update-tab ${i === s.update ? 'active' : ''}" style="--type-color:${ty.color}" data-update="${i}" aria-selected="${i === s.update}">
                            <span class="update-tab-type"><span>${tx(ty.label)}</span><span>${VQ.fmtDate(a.start, 'short')}</span></span>
                            <span class="update-tab-title">${esc(tx(a.title))}</span>
                            <span class="update-progress"></span>
                        </button>`;
                    }).join('')}
                </div>
            </div>`
        );
    }

    function showUpdate(i) {
        const list = updates();
        s.update = (i + list.length) % list.length;
        const feature = VQ.$('#updateFeature');
        if (!feature) return;
        feature.firstElementChild.classList.add('is-fading');
        setTimeout(() => { feature.innerHTML = featureHTML(list[s.update]); }, 180);
        VQ.$$('.update-tab').forEach((tab, n) => {
            const on = n === s.update;
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', String(on));
            if (on) { void tab.offsetWidth; tab.classList.add('active'); }
        });
    }

    function startRotation() {
        clearInterval(timer);
        timer = setInterval(() => { if (!s.paused) showUpdate(s.update + 1); }, ROTATE_MS);
    }

    /* ---------- 2 · Events: SPFx event cards (2 per view) or month calendar — no map ---------- */

    function eventCard(e) {
        const cat = catOf(D.eventCategories, e.category);
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="event-card">
            <div class="card-Event">${VQ.img(e.image, '', 800)}${ui.cardDate(e.start, 'is-bottom')}</div>
            <div class="card-details">
                <div class="card-info">
                    <div class="card-chips">${ui.tag(tx(cat.label), '', cat.icon)}</div>
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
        const todayIso = VQ.isoDate(VQ.today());
        const inMonth = events.filter(e => e.start <= monthEnd && e.end >= monthStart);
        const on = iso => inMonth.filter(e => e.start <= iso && e.end >= iso);
        const monthLabel = new Intl.DateTimeFormat(VQ.locale(), { month: 'long', year: 'numeric' }).format(first);

        let cells = '<span></span>'.repeat(first.getDay());
        for (let d = 1; d <= days; d++) {
            const iso = VQ.isoDate(new Date(y, m - 1, d));
            const list = on(iso);
            cells += list.length
                ? `<button type="button" class="cal-day has-event ${s.day === iso ? 'is-selected' : ''}" data-cal-day="${iso}" title="${esc(list.map(e => tx(e.title)).join(' · '))}">${d}</button>`
                : `<span class="cal-day ${iso === todayIso ? 'is-today' : ''}">${d}</span>`;
        }

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
            <div>
                <div class="day-list-head">
                    <h4>${s.day ? VQ.fmtDate(s.day, 'long') : t('evCalTitle', { m: monthLabel })}</h4>
                    ${s.day ? `<button type="button" class="show-more" data-cal-day="">${t('evCalShowMonth')}</button>` : ''}
                </div>
                ${shown.length ? shown.map(e => `<a href="${VQ.href('event-details', { id: e.id })}" class="day-row">
                    <span class="day-row-date"><strong>${VQ.fmtDay(e.start)}</strong><span>${VQ.fmtMonth(e.start)}</span></span>
                    <span class="day-row-text"><p>${esc(tx(e.title))}</p><span><i class="fa-solid fa-location-dot" style="color:var(--vq-ruby)"></i> ${esc(tx(e.location))} · ${VQ.fmtRange(e.start, e.end, 'short')}</span></span>
                </a>`).join('') : `<p class="results-count">${t('evCalEmpty')}</p>`}
            </div>
        </div>`;
    }

    function eventsHTML() {
        const calendar = s.view === 'calendar';
        return ui.section(
            ui.sectionHead({
                title: calendar ? t('hpCalendar') : t('hpEvents'),
                link: VQ.href('events', calendar ? { view: 'calendar' } : null),
                tools: ui.viewSwitch({ name: 'view', active: s.view, items: [
                    { value: 'list', icon: 'fa-solid fa-list', label: t('hpViewList') },
                    { value: 'calendar', icon: 'fa-regular fa-calendar-days', label: t('hpViewCalendar') }
                ] })
            }) +
            `<div id="eventsBody">${calendar ? calendarHTML() : ui.slider({ items: homeEvents().map(eventCard), perView: 2, gap: '1rem', arrows: true })}</div>`,
            'home-events'
        );
    }

    /* ---------- 3 · Latest discounts: 2 × 2 SPFx listing cards ---------- */

    function discountsHTML() {
        return ui.section(
            ui.sectionHead({ title: t('hpDiscounts'), link: VQ.href('discounts') }) +
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
            VQ.content(`<h1 class="sr-only">${t('navHome')}</h1><div class="page-surface home-surface">${updatesHTML()}${eventsHTML()}${discountsHTML()}${newsHTML()}</div>`);
            startRotation();
        },

        setup(root) {
            root.addEventListener('click', e => {
                const tab = e.target.closest('[data-update]');
                if (tab) { showUpdate(Number(tab.dataset.update)); startRotation(); return; }

                const chip = e.target.closest('[data-chip="view"]');
                if (chip) {
                    s.view = chip.dataset.value;
                    s.day = null;
                    const section = VQ.$('.home-events');
                    section.outerHTML = eventsHTML();
                    VQ.initSliders(VQ.$('.home-events'));
                    return;
                }

                const day = e.target.closest('[data-cal-day]');
                if (day) {
                    s.day = day.dataset.calDay && day.dataset.calDay !== s.day ? day.dataset.calDay : null;
                    VQ.$('#eventsBody').innerHTML = calendarHTML();
                }
            });
            root.addEventListener('mouseleave', () => {
                s.paused = false;
                const box = VQ.$('#updates');
                if (box) box.classList.remove('is-paused');
            });
            root.addEventListener('mouseover', e => {
                const inside = !!e.target.closest('#updates');
                if (inside !== s.paused) {
                    s.paused = inside;
                    const box = VQ.$('#updates');
                    if (box) box.classList.toggle('is-paused', inside);
                }
            });
        }
    });
})();
