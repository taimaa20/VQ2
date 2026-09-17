/* Training courses — BRD 7.7 & 8.12 (view only: no registration) · built with the SPFx AdsPage vocabulary
   Option 1 coverage: search by title · filter by type · start date · duration · video marker · newest first · 6 per page */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', type: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const typeOf = key => D.courseTypes.find(c => c.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.courses
            .filter(c => s.type === 'all' || c.type === s.type)
            .filter(c => !q || (c.title.ar + ' ' + c.title.en).toLowerCase().includes(q))
            .sort((a, b) => b.start.localeCompare(a.start));
    }

    function card(c) {
        const type = typeOf(c.type);
        return ui.listingCard({
            url: VQ.href('course-details', { id: c.id }),
            image: c.image,
            date: c.start,
            overlay: c.video ? `<span class="card-play"><i class="fa-solid fa-play"></i></span><span class="card-length ltr">${c.videoLength}</span>` : '',
            chips: ui.tag(tx(type.label), '', type.icon) + (c.video ? ui.tag(t('crVideo'), 'ruby', 'fa-circle-play') : ''),
            title: esc(tx(c.title)),
            desc: esc(tx(c.summary)),
            meta: `<span><i class="fa-regular fa-clock"></i>${esc(tx(c.duration))}</span><span><i class="fa-solid fa-location-dot"></i>${esc(tx(c.mode))}</span>`
        });
    }

    VQ.boot({
        title: () => t('crTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navCourses') }],
                ui.pageHead({ title: t('crTitle'), desc: t('crDesc') }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'crQ', value: s.q, placeholder: t('crSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'type', active: s.type, label: t('type'), items: [{ value: 'all', label: t('all') }]
                        .concat(D.courseTypes.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navCourses'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-section">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-graduation-cap'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'crQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', type: 'all', page: 1 }); this.render(); return; }
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        }
    });
})();
