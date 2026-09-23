/* Home — SPFx HomePage web part composition:
   Announcements → Latest Discounts → VQ Calendar → QC Events → Latest News
   (systems, weather, prayer times, message/vision/mission, structure and hotlines live in the shared side panel) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    /* Same items as Option 1's homepage */
    const EVENT_IDS = ['standup-taha', 'forbes-workshop', 'health-day', 'partners-forum'];
    const DISCOUNT_IDS = ['pearl-gewan', 'restaurants', 'culture-tickets', 'fitness'];
    const ROTATE_MS = 7000;

    const s = { update: 0, day: null, paused: false };
    let timer = null;

    const byDateDesc = key => (a, b) => b[key].localeCompare(a[key]);
    const updates = () => D.announcements.slice().sort(byDateDesc('start')).slice(0, 4);
    const homeEvents = () => EVENT_IDS.map(id => D.events.find(e => e.id === id)).filter(Boolean);
    const homeDiscounts = () => DISCOUNT_IDS.map(id => D.discounts.find(d => d.id === id)).filter(Boolean);
    const homeNews = () => D.news.slice().sort(byDateDesc('date')).slice(0, 6);
    const catOf = (list, key) => list.find(c => c.key === key);

    /* ---------- 1 · Announcements: featured circular + index of the latest four ---------- */

    function featureHTML(a) {
        const ty = ui.typeOfAnnouncement(a.type);
        return `<a href="${VQ.href('announcement-details', { id: a.id })}" class="news-card updates-feature" style="--type-color:${ty.color};--type-on:${ty.on || '#fff'}">
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
            </div>`,
            'section-announcements'
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

    /* ---------- VQ Calendar, then QC Events (separate sections, no view switch) ---------- */

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

    /* ---------- Latest discounts: 2 × 2 SPFx listing cards (rendered above the calendar) ---------- */

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
            ui.unmountCalendarMaps(VQ.$('#pageContent'));
            VQ.content(`<h1 class="sr-only">${t('navHome')}</h1><div class="page-surface home-surface">${updatesHTML()}${discountsHTML()}${calendarSection()}${eventsSection()}${newsHTML()}</div>`);
            ui.mountCalendarMaps(VQ.$('#pageContent'));
            startRotation();
        },

        setup(root) {
            let featureSwipe = null;
            root.addEventListener('touchstart', e => {
                if (!e.target.closest('#updateFeature')) return;
                const touch = e.changedTouches[0];
                featureSwipe = { x: touch.clientX, y: touch.clientY };
            }, { passive: true });
            root.addEventListener('touchend', e => {
                if (!featureSwipe) return;
                const touch = e.changedTouches[0];
                const dx = touch.clientX - featureSwipe.x;
                const dy = touch.clientY - featureSwipe.y;
                featureSwipe = null;
                if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return;
                const rtl = document.documentElement.dir === 'rtl';
                const next = rtl ? dx > 0 : dx < 0;
                showUpdate(s.update + (next ? 1 : -1));
                startRotation();
            }, { passive: true });

            root.addEventListener('click', e => {
                const tab = e.target.closest('[data-update]');
                if (tab) { showUpdate(Number(tab.dataset.update)); startRotation(); return; }

                const day = e.target.closest('[data-cal-day]');
                if (day) {
                    s.day = day.dataset.calDay && day.dataset.calDay !== s.day ? day.dataset.calDay : null;
                    const body = VQ.$('#eventsBody');
                    ui.unmountCalendarMaps(body);
                    body.innerHTML = calendarHTML();
                    ui.mountCalendarMaps(body);
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
