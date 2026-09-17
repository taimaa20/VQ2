/* Training courses listing — BRD 7.7 & 8.12 (same scope as Option 1: search · type · 6 per page) */
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
        return `<a href="${VQ.href('course-details', { id: c.id })}" class="listing-card">
            <span class="card-header">
                ${VQ.img(c.image, '', 600)}
                ${c.video ? `<span class="play-badge"><i class="fa-solid fa-play"></i></span><span class="length-badge" dir="ltr">${c.videoLength}</span>` : ''}
            </span>
            <span class="card-details">
                <span class="card-info">
                    <span class="chip-row">${ui.tag(tx(type.label), 'teal', type.icon)}</span>
                    <b class="card-title">${esc(tx(c.title))}</b>
                    <span class="card-description">${esc(tx(c.summary))}</span>
                    <span class="card-meta">
                        <span><i class="fa-regular fa-calendar"></i>${VQ.fmtDate(c.start, 'short')}</span>
                        <span><i class="fa-regular fa-clock"></i>${esc(tx(c.duration))}</span>
                    </span>
                </span>
                <span class="showAll"><span class="more-link more-link--pill">${t('viewDetails')}${ui.arrow()}</span></span>
            </span>
        </a>`;
    }

    VQ.boot({
        title: () => t('crTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('crTitle'), desc: t('crDesc'), crumbs: [{ label: t('navCourses') }] }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'crQ', value: s.q, placeholder: t('crSearch') })),
                    ui.chips({ name: 'type', active: s.type, items: [{ value: 'all', label: t('all') }]
                        .concat(D.courseTypes.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="listing-section">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-graduation-cap'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'crQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        }
    });
})();
