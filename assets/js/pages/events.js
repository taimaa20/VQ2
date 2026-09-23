/* Events & Calendars — BRD 7.3 · SPFx AdsPage (listName = Events)
   Option 1 coverage: search · category · date range · list or month calendar · next event highlight · 4 per page.
   Calendar view highlights every day in an event range with one colour, and maps those locations. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = {
        q: '', category: 'all', from: '', to: '', page: 1,
        view: VQ.param('view') === 'calendar' ? 'calendar' : 'list',
        month: VQ.isoDate(VQ.today()).slice(0, 7),
        day: null
    };
    const PAGE_SIZE = 4;
    const WEEKDAYS = { ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };

    const catOf = key => D.eventCategories.find(c => c.key === key);
    const hasFilters = () => s.q || s.category !== 'all' || s.from || s.to;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.events
            .filter(e => s.category === 'all' || e.category === s.category)
            .filter(e => !s.from || e.end >= s.from)
            .filter(e => !s.to || e.start <= s.to)
            .filter(e => !q || (e.title.ar + ' ' + e.title.en + ' ' + e.number + ' ' + e.location.ar + ' ' + e.location.en).toLowerCase().includes(q))
            .sort((a, b) => b.start.localeCompare(a.start));
    }

    function hero(e) {
        const cat = catOf(e.category);
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="event-hero">
            ${VQ.img(e.image, 'event-hero-bg', 1400)}
            <span class="event-hero-shade"></span>
            <span class="event-hero-arch"><strong>${VQ.fmtDay(e.start)}</strong><span>${VQ.fmtMonth(e.start)}</span></span>
            <div class="event-hero-copy">
                <span class="event-hero-badge"><i class="fa-solid fa-star"></i>${t('evNext')}</span>
                <h2>${esc(tx(e.title))}</h2>
                <p>${esc(tx(e.summary))}</p>
                <div class="event-hero-meta">
                    <span><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</span>
                    <span><i class="${cat.icon.indexOf('fa-') === 0 ? 'fa-solid ' + cat.icon : cat.icon}"></i>${tx(cat.label)}</span>
                    <span><i class="fa-solid fa-hourglass-half"></i>${t('daysLeft', { n: VQ.daysUntil(e.start) })}</span>
                </div>
                <span class="event-hero-cta">${t('viewDetails')} ${ui.arrow()}</span>
            </div>
        </a>`;
    }

    function card(e) {
        const cat = catOf(e.category);
        return ui.listingCard({
            url: VQ.href('event-details', { id: e.id }),
            image: e.image,
            date: e.start,
            chips: ui.tag(tx(cat.label), '', cat.icon) + ui.statusTag(VQ.status(e.start, e.end)),
            title: esc(tx(e.title)),
            desc: esc(tx(e.summary)),
            meta: `<span><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</span><span class="ltr"><i class="fa-solid fa-hashtag"></i>${e.number}</span>`
        });
    }

    function calendarView(items) {
        const [y, m] = s.month.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const monthStart = VQ.isoDate(first);
        const monthEnd = VQ.isoDate(new Date(y, m - 1, days));
        const inMonth = items.filter(e => e.start <= monthEnd && e.end >= monthStart).sort((a, b) => a.start.localeCompare(b.start));
        const on = iso => inMonth.filter(e => e.start <= iso && e.end >= iso);
        const monthLabel = new Intl.DateTimeFormat(VQ.locale(), { month: 'long', year: 'numeric' }).format(first);
        const cells = ui.calendarCells({ year: y, month: m, events: inMonth, selected: s.day });
        const shown = s.day ? on(s.day) : inMonth;

        return `<div class="calendar-layout">
            <div class="calendar-box">
                <div class="calendar-head">
                    <h4>${monthLabel}</h4>
                    <div class="calendar-nav">
                        <button type="button" class="slider-arrow" data-cal-step="-1" aria-label="${t('prevMonth')}" title="${t('prevMonth')}">${ui.chevronPrev()}</button>
                        <button type="button" class="slider-arrow" data-cal-step="1" aria-label="${t('nextMonth')}" title="${t('nextMonth')}">${ui.chevronNext()}</button>
                    </div>
                </div>
                <div class="calendar-weekdays">${WEEKDAYS[VQ.state.lang].map(d => `<span>${d}</span>`).join('')}</div>
                <div class="calendar-grid">${cells}</div>
                <div class="calendar-legend">
                    <span><i style="background:var(--vq-teal)"></i>${t('evCalEventDay')}</span>
                    <span><i style="background:rgba(215,107,0,.35)"></i>${t('evCalToday')}</span>
                </div>
            </div>
            ${ui.calendarMap(shown)}
            <div class="calendar-events">
                <div class="day-list-head">
                    <h4>${s.day ? VQ.fmtDate(s.day, 'long') : `${t('evCalMonth')} (${inMonth.length})`}</h4>
                    ${s.day ? `<button type="button" class="show-more" data-cal-day="">${t('evCalShowMonth')}</button>` : ''}
                </div>
                ${shown.length ? shown.map(e => `<a href="${VQ.href('event-details', { id: e.id })}" class="day-row">
                    <span class="day-row-date"><strong>${VQ.fmtDay(e.start)}</strong><span>${VQ.fmtMonth(e.start)}</span></span>
                    <span class="day-row-text"><p>${esc(tx(e.title))}</p><span>${tx(catOf(e.category).label)} · ${esc(tx(e.location))} · ${VQ.fmtRange(e.start, e.end, 'short')}</span></span>
                </a>`).join('') : `<p class="results-count">${t('evCalEmpty')}</p>`}
            </div>
        </div>`;
    }

    VQ.boot({
        title: () => t('evTitle'),

        render() {
            ui.unmountCalendarMaps(VQ.$('#pageContent'));
            VQ.content(ui.page([{ label: t('navEvents') }],
                ui.pageHead({ title: t('evTitle'), desc: t('evDesc') }) +
                ui.filterBar([
                    ui.filters(
                        ui.searchField({ id: 'evQ', value: s.q, placeholder: t('evSearch') }) +
                        ui.selectField({ id: 'evCat', value: s.category, label: t('category'), options: [{ value: 'all', label: t('evAllCategories') }]
                            .concat(D.eventCategories.map(c => ({ value: c.key, label: tx(c.label) }))) }) +
                        ui.dateField({ id: 'evFrom', value: s.from, label: t('from') }) +
                        ui.dateField({ id: 'evTo', value: s.to, label: t('to') }) +
                        ui.clearButton()
                    )
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            let items = filtered();
            const box = VQ.$('#results');
            const paint = html => {
                ui.unmountCalendarMaps(box);
                box.innerHTML = html;
                ui.mountCalendarMaps(box);
            };
            const head = ui.subHead(s.view === 'calendar' ? t('hpCalendar') : t('evAll'),
                `<div class="head-tools" style="display:flex;align-items:center;gap:.75rem">${ui.resultsCount(items.length)}${ui.viewSwitch({ name: 'view', active: s.view, items: [
                    { value: 'list', icon: 'fa-solid fa-list', label: t('hpViewList') },
                    { value: 'calendar', icon: 'fa-regular fa-calendar-days', label: t('calendarView') }
                ] })}</div>`);

            if (s.view === 'calendar') { paint(head + calendarView(items)); return; }
            if (!items.length) { paint(head + ui.emptyState('fa-calendar-xmark')); return; }

            let html = '';
            const next = !hasFilters() && D.events.filter(e => VQ.daysUntil(e.start) > 0).sort((a, b) => a.start.localeCompare(b.start))[0];
            if (next) {
                if (s.page === 1) html += hero(next);
                items = items.filter(e => e.id !== next.id);
            }
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            paint(html + head + `<div class="listing-section">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'evQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('change', e => {
                const map = { evCat: 'category', evFrom: 'from', evTo: 'to' };
                if (map[e.target.id]) { s[map[e.target.id]] = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', category: 'all', from: '', to: '', page: 1, day: null }); this.render(); return; }
                const chip = e.target.closest('[data-chip="view"]');
                if (chip) { s.view = chip.dataset.value; s.day = null; this.update(); return; }
                const day = e.target.closest('[data-cal-day]');
                if (day) { s.day = day.dataset.calDay && day.dataset.calDay !== s.day ? day.dataset.calDay : null; this.update(); return; }
                const step = e.target.closest('[data-cal-step]');
                if (step) {
                    const [y, m] = s.month.split('-').map(Number);
                    s.month = VQ.isoDate(new Date(y, m - 1 + Number(step.dataset.calStep), 1)).slice(0, 7);
                    s.day = null;
                    this.update();
                    return;
                }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        }
    });
})();
