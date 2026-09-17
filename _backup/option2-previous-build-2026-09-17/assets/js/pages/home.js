/* Homepage — same components and order as Option 1:
   6.1 Latest Updates (circulars) · 6.2/6.3 Events with List / Calendar · 6.4 Latest Discounts · Latest News slider.
   The side panel (weather, prayer, systems, message/vision/mission, structure, hotlines) is the shared shell. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { eventsView: 'list', newsIndex: 0 };
    let newsTimer = null;

    /* Same items as the Option 1 homepage */
    const UPDATE_IDS = ['ceo-fiscal-year', 'ac-temperature', 'condolence-almarri', 'annual-leave-update'];
    const EVENT_IDS = ['standup-taha', 'forbes-workshop', 'health-day', 'partners-forum'];
    const DISCOUNT_IDS = ['pearl-gewan', 'restaurants', 'culture-tickets', 'fitness'];
    const CAL_MONTH = '2026-09';
    const WEEKDAYS = { ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] };

    const pick = (list, ids) => ids.map(id => list.find(x => x.id === id)).filter(Boolean);
    const typeOf = key => D.announcementTypes.find(x => x.key === key);

    function updates() {
        const items = pick(D.announcements, UPDATE_IDS).sort((a, b) => b.start.localeCompare(a.start));
        return ui.sectionCard({
            title: t('hpUpdates'), icon: 'fa-bullhorn', link: VQ.href('announcements'), linkLabel: t('showAll'),
            body: `<div class="circulars-grid">${items.map(a => {
                const ty = typeOf(a.type);
                return `<a href="${VQ.href('announcement-details', { id: a.id })}" class="circular-tile" style="--c:${ty.color}">
                    ${VQ.img(ty.image, 'circular-img', 700)}
                    <span class="circular-bar"><b>${esc(tx(a.title))}</b><small>${tx(ty.label)} · <span dir="ltr">${a.start.split('-').reverse().join('-')}</span></small></span>
                </a>`;
            }).join('')}</div>`
        });
    }

    function eventRows() {
        return `<div class="event-rows">${pick(D.events, EVENT_IDS).map(e => `<a href="${VQ.href('event-details', { id: e.id })}" class="event-row">
            <span class="event-thumb">${VQ.img(e.image, '', 240)}<span class="event-thumb-date">${VQ.fmtDay(e.start)} ${VQ.fmtMonth(e.start)}</span></span>
            <span class="event-row-body"><b>${esc(tx(e.title))}</b><small><i class="fa-solid fa-location-dot"></i>${esc(tx(e.location))}</small></span>
        </a>`).join('')}</div>`;
    }

    function calendar() {
        const [y, m] = CAL_MONTH.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const days = new Date(y, m, 0).getDate();
        const prevDays = new Date(y, m - 1, 0).getDate();
        const eventDays = {};
        D.events.forEach(e => {
            if (e.start.slice(0, 7) === CAL_MONTH) eventDays[Number(e.start.slice(8, 10))] = e;
        });

        let cells = '';
        for (let i = first.getDay(); i > 0; i--) cells += `<span class="mini-day is-muted">${prevDays - i + 1}</span>`;
        for (let d = 1; d <= days; d++) {
            const e = eventDays[d];
            cells += e
                ? `<a href="${VQ.href('event-details', { id: e.id })}" class="mini-day has-event" title="${esc(tx(e.title))}">${d}</a>`
                : `<span class="mini-day">${d}</span>`;
        }
        const monthLabel = new Intl.DateTimeFormat(VQ.isAr() ? 'ar-u-nu-latn' : 'en-GB', { month: 'long', year: 'numeric' }).format(first);

        return `<div class="home-calendar">
            <p class="cal-note"><i class="fa-solid fa-rotate"></i>${t('hpCalendarSync')}</p>
            <div class="mini-cal">
                <div class="mini-cal-head"><b>${monthLabel}</b><i class="fa-solid fa-calendar-days"></i></div>
                <div class="mini-cal-grid">${WEEKDAYS[VQ.state.lang].map(w => `<span class="mini-weekday">${w}</span>`).join('')}${cells}</div>
            </div>
        </div>`;
    }

    function events() {
        const cal = s.eventsView === 'calendar';
        return ui.sectionCard({
            title: t(cal ? 'hpCalendar' : 'hpEvents'), icon: cal ? 'fa-calendar-days' : 'fa-calendar-check',
            link: VQ.href('events'), linkLabel: t('showMore'),
            extra: ui.segmented({ name: 'eventsView', active: s.eventsView, items: [
                { value: 'list', icon: 'fa-list', label: t('hpViewList') },
                { value: 'calendar', icon: 'fa-calendar-days', label: t('hpViewCalendar') }
            ] }),
            body: cal ? calendar() : eventRows()
        });
    }

    function discounts() {
        const tone = p => (p >= 30 ? 'teal' : p >= 25 ? 'ruby' : p >= 20 ? 'amber' : 'teal');
        return ui.sectionCard({
            title: t('hpDiscounts'), icon: 'fa-tags', link: VQ.href('discounts'), linkLabel: t('showMore'),
            body: `<div class="offer-tiles">${pick(D.discounts, DISCOUNT_IDS).map(d => `<a href="${VQ.href('discount-details', { id: d.id })}" class="offer-tile">
                ${VQ.img(d.image, '', 700)}
                <span class="offer-shade"></span>
                <span class="offer-percent offer-percent--${tone(d.percent)}" dir="ltr">${d.percent}%</span>
                <span class="offer-text"><b>${esc(tx(d.title))}</b><small>${VQ.fmtDate(d.start)}</small></span>
            </a>`).join('')}</div>`
        });
    }

    function news() {
        const catOf = key => D.newsCategories.find(c => c.key === key);
        return ui.sectionCard({
            title: t('hpNews'), icon: 'fa-newspaper', link: VQ.href('news'), linkLabel: t('showMore'),
            body: `<div class="news-slider" id="newsSlider">
                ${D.news.map((n, i) => `<a href="${VQ.href('news-details', { id: n.id })}" class="news-slide${i === s.newsIndex ? ' is-active' : ''}" data-news-slide="${i}">
                    ${VQ.img(n.image, '', 1200)}
                    <span class="news-shade"></span>
                    <span class="news-caption">
                        <span class="news-meta"><span class="chip chip--solidTeal">${tx(catOf(n.category).label)}</span><span>${VQ.fmtDay(n.date)} ${VQ.fmtMonth(n.date)}</span></span>
                        <b>${esc(tx(n.title))}</b>
                    </span>
                </a>`).join('')}
                <button type="button" class="news-nav news-nav--prev" data-news-step="-1" aria-label="${t('prev')}"><i class="fa-solid fa-chevron-right dir-icon"></i></button>
                <button type="button" class="news-nav news-nav--next" data-news-step="1" aria-label="${t('next')}"><i class="fa-solid fa-chevron-left dir-icon"></i></button>
                <div class="news-dots">${D.news.map((n, i) => `<button type="button" class="news-dot${i === s.newsIndex ? ' active' : ''}" data-news-dot="${i}" aria-label="${i + 1}"></button>`).join('')}</div>
            </div>`
        });
    }

    function showNews(i) {
        s.newsIndex = (i + D.news.length) % D.news.length;
        VQ.$$('[data-news-slide]').forEach(el => el.classList.toggle('is-active', Number(el.dataset.newsSlide) === s.newsIndex));
        VQ.$$('[data-news-dot]').forEach(el => el.classList.toggle('active', Number(el.dataset.newsDot) === s.newsIndex));
    }

    function startNews() {
        clearInterval(newsTimer);
        newsTimer = setInterval(() => showNews(s.newsIndex + 1), 5000);
    }

    VQ.boot({
        title: () => t('navHome'),

        render() {
            VQ.content(`<h1 class="sr-only">${t('navHome')}</h1>` + updates() + events() + discounts() + news());
            startNews();
        },

        setup(root) {
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip="eventsView"]');
                if (chip) { s.eventsView = chip.dataset.value; this.render(); return; }
                const step = e.target.closest('[data-news-step]');
                if (step) { e.preventDefault(); showNews(s.newsIndex + Number(step.dataset.newsStep)); startNews(); return; }
                const dot = e.target.closest('[data-news-dot]');
                if (dot) { e.preventDefault(); showNews(Number(dot.dataset.newsDot)); startNews(); }
            });
            root.addEventListener('mouseover', e => { if (e.target.closest('#newsSlider')) clearInterval(newsTimer); });
            root.addEventListener('mouseout', e => {
                const slider = e.target.closest('#newsSlider');
                if (slider && !slider.contains(e.relatedTarget)) startNews();
            });
        }
    });
})();
