/* Events & Calendars listing — BRD 7.3 (same scope as Option 1: grid · calendar, no map) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const VIEWS = ['grid', 'calendar'];
    const s = {
        q: '', category: 'all', from: '', to: '', page: 1,
        view: VIEWS.indexOf(VQ.param('view')) !== -1 ? VQ.param('view') : 'grid',
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

    function card(e) {
        const cat = catOf(e.category);
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="tile">
            <span class="tile-media">
                ${VQ.img(e.image, '', 700)}
                <span class="tile-media-start">${ui.dateBadge(e.start)}</span>
                <span class="tile-media-end">${ui.statusTag(VQ.status(e.start, e.end))}</span>
            </span>
            <span class="tile-body">
                <span class="chip-row">${ui.tag(tx(cat.label), 'teal', cat.icon)}</span>
                <b class="tile-title">${esc(tx(e.title))}</b>
                <span class="tile-meta"><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</span>
                <span class="tile-text">${esc(tx(e.summary))}</span>
                <span class="tile-foot"><span dir="ltr">${e.number}</span><span class="more-link">${t('viewDetails')}${ui.arrow()}</span></span>
            </span>
        </a>`;
    }

    function featured(e) {
        const cat = catOf(e.category);
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="feature">
            ${VQ.img(e.image, 'feature-img', 1200)}
            <span class="feature-shade"></span>
            <span class="feature-arch"></span>
            <span class="feature-badge">${ui.dateBadge(e.start)}</span>
            <span class="feature-caption">
                <span class="chip-row">${ui.tag(t('evNext'), 'solidAmber', 'fa-star')}<span class="chip chip--glass">${tx(cat.label)}</span>
                    <span class="feature-date"><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</span>
                    <span class="feature-date feature-date--amber"><i class="fa-solid fa-hourglass-half"></i>${t('daysLeft', { n: VQ.daysUntil(e.start) })}</span></span>
                <b class="feature-title">${esc(tx(e.title))}</b>
                <span class="feature-text">${esc(tx(e.summary))}</span>
            </span>
        </a>`;
    }

    function calendarRow(e) {
        return `<a href="${VQ.href('event-details', { id: e.id })}" class="event-row">
            <span class="event-thumb">${VQ.img(e.image, '', 240)}<span class="event-thumb-date">${VQ.fmtDay(e.start)} ${VQ.fmtMonth(e.start)}</span></span>
            <span class="event-row-body">
                <b>${esc(tx(e.title))}</b>
                <small><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</small>
                <small class="event-row-sub">${tx(catOf(e.category).label)} · ${VQ.fmtRange(e.start, e.end, 'short')}</small>
            </span>
        </a>`;
    }

    /* Month calendar: event days highlighted, click a day to list its events */
    function calendarView(items) {
        const [y, m] = s.month.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const monthStart = VQ.isoDate(first);
        const monthEnd = VQ.isoDate(new Date(y, m - 1, days));
        const todayIso = VQ.isoDate(VQ.today());
        const inMonth = items.filter(e => e.start <= monthEnd && e.end >= monthStart).sort((a, b) => a.start.localeCompare(b.start));
        const on = iso => inMonth.filter(e => e.start <= iso && e.end >= iso);

        let cells = '<span></span>'.repeat(first.getDay());
        for (let d = 1; d <= days; d++) {
            const iso = VQ.isoDate(new Date(y, m - 1, d));
            const dayEvents = on(iso);
            cells += dayEvents.length
                ? `<button type="button" data-cal-day="${iso}" title="${esc(dayEvents.map(e => tx(e.title)).join(' · '))}" class="cal-day has-event${s.day === iso ? ' is-selected' : ''}">${d}</button>`
                : `<span class="cal-day${iso === todayIso ? ' is-today' : ''}">${d}</span>`;
        }

        const list = s.day ? on(s.day) : inMonth;
        const monthLabel = new Intl.DateTimeFormat(VQ.isAr() ? 'ar-u-nu-latn' : 'en-GB', { month: 'long', year: 'numeric' }).format(first);
        const stepBtn = (step, icon, label) => `<button type="button" data-cal-step="${step}" class="icon-btn" title="${label}" aria-label="${label}"><i class="fa-solid ${icon} dir-icon"></i></button>`;

        return `<div class="calendar">
            <div class="cal-head">
                ${stepBtn(-1, 'fa-chevron-right', t('prevMonth'))}
                <h2 class="cal-title">${monthLabel}</h2>
                ${stepBtn(1, 'fa-chevron-left', t('nextMonth'))}
            </div>
            <div class="cal-grid">${WEEKDAYS[VQ.state.lang].map(d => `<span class="cal-weekday">${d}</span>`).join('')}${cells}</div>
            <div class="cal-legend">
                <span><span class="legend-swatch legend-swatch--event"></span>${t('evCalEventDay')}</span>
                <span><span class="legend-swatch legend-swatch--today"></span>${t('evCalToday')}</span>
            </div>
        </div>
        <div class="cal-agenda">
            <div class="group-head">
                <h3 class="group-title"><span>${s.day ? VQ.fmtDate(s.day, 'long') : `${t('evCalMonth')} (${inMonth.length})`}</span></h3>
                ${s.day ? `<button type="button" data-cal-day="" class="show-more">${t('evCalShowMonth')}</button>` : ''}
            </div>
            ${list.length ? `<div class="event-rows">${list.map(calendarRow).join('')}</div>` : `<p class="muted-note">${t('evCalEmpty')}</p>`}
        </div>`;
    }

    VQ.boot({
        title: () => t('evTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('evTitle'), desc: t('evDesc'), crumbs: [{ label: t('navEvents') }] }) +
                ui.toolbar([
                    ui.row(
                        ui.searchInput({ id: 'evQ', value: s.q, placeholder: t('evSearch') }) +
                        ui.select({ id: 'evCat', value: s.category, label: t('category'), options: [{ value: 'all', label: t('evAllCategories') }]
                            .concat(D.eventCategories.map(c => ({ value: c.key, label: tx(c.label) }))) })
                    ),
                    ui.row(
                        ui.dateField({ id: 'evFrom', value: s.from, label: t('from') }) +
                        ui.dateField({ id: 'evTo', value: s.to, label: t('to') }) +
                        `<span class="toolbar-spacer"></span>` +
                        ui.segmented({ name: 'view', active: s.view, items: [
                            { value: 'grid', icon: 'fa-grip', label: t('gridView') },
                            { value: 'calendar', icon: 'fa-calendar-days', label: t('calendarView') }
                        ] })
                    )
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            let items = filtered();
            const box = VQ.$('#results');
            if (s.view === 'calendar') { box.innerHTML = calendarView(items); return; }
            if (!items.length) { box.innerHTML = ui.resultsBar(0) + ui.emptyState('fa-calendar-xmark'); return; }

            let html = '';
            const next = !hasFilters() && D.events.filter(e => VQ.daysUntil(e.start) > 0).sort((a, b) => a.start.localeCompare(b.start))[0];
            if (next) {
                if (s.page === 1) html += featured(next);
                items = items.filter(e => e.id !== next.id);
            }

            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            html += ui.groupTitle(t('evAll'), 'fa-calendar-days', `<span class="group-meta">${t('resultsCount', { n: filtered().length })}</span>`) +
                `<div class="card-grid card-grid--2">${slice.map(card).join('')}</div>` +
                ui.pagination(s.page, pages);
            box.innerHTML = html;
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
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; this.render(); return; }
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
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        }
    });
})();
