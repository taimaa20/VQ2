/* News listing — BRD 8.4 (same scope as Option 1: top story · search · category · 4 per page) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1 };
    const PAGE_SIZE = 4;

    const catOf = key => D.newsCategories.find(c => c.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.news
            .filter(n => s.category === 'all' || n.category === s.category)
            .filter(n => !q || (n.title.ar + ' ' + n.title.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    /* Top story — SPFx hero treatment (teal shade + arch outline) */
    function feature(n) {
        return `<a href="${VQ.href('news-details', { id: n.id })}" class="feature">
            ${VQ.img(n.image, 'feature-img', 1400)}
            <span class="feature-shade"></span>
            <span class="feature-arch"></span>
            <span class="feature-caption">
                <span class="chip-row">${ui.tag(t('nwFeatured'), 'solidAmber', 'fa-star')}<span class="chip chip--glass">${tx(catOf(n.category).label)}</span><span class="feature-date">${VQ.fmtDate(n.date)}</span></span>
                <b class="feature-title">${esc(tx(n.title))}</b>
                <span class="feature-text">${esc(tx(n.summary))}</span>
            </span>
        </a>`;
    }

    function card(n) {
        return `<a href="${VQ.href('news-details', { id: n.id })}" class="listing-card">
            <span class="card-header">${VQ.img(n.image, '', 600)}<span class="card-date"><i class="fa-regular fa-calendar"></i>${VQ.fmtDate(n.date)}</span></span>
            <span class="card-details">
                <span class="card-info">
                    <span class="chip-row">${ui.tag(tx(catOf(n.category).label), 'teal')}</span>
                    <b class="card-title">${esc(tx(n.title))}</b>
                    <span class="card-description">${esc(tx(n.summary))}</span>
                </span>
                <span class="showAll"><span class="more-link more-link--pill">${t('nwReadMore')}${ui.arrow()}</span></span>
            </span>
        </a>`;
    }

    VQ.boot({
        title: () => t('nwTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('nwTitle'), desc: t('nwDesc'), crumbs: [{ label: t('navNews') }] }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'nwQ', value: s.q, placeholder: t('nwSearch') })),
                    ui.chips({ name: 'category', active: s.category, items: [{ value: 'all', label: t('all') }]
                        .concat(D.newsCategories.map(c => ({ value: c.key, label: tx(c.label) }))) })
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const box = VQ.$('#results');
            if (!items.length) { box.innerHTML = ui.resultsBar(0) + ui.emptyState('fa-newspaper'); return; }

            let html = '';
            if (!s.q && s.category === 'all' && s.page === 1) html += feature(items[0]);
            const rest = (!s.q && s.category === 'all') ? items.slice(1) : items;
            const pages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
            s.page = Math.min(s.page, pages);
            const slice = rest.slice((s.page - 1) * PAGE_SIZE, s.page * PAGE_SIZE);

            html += ui.groupTitle(t('nwLatest'), 'fa-newspaper', `<span class="group-meta">${t('resultsCount', { n: items.length })}</span>`) +
                `<div class="listing-section">${slice.map(card).join('')}</div>` +
                ui.pagination(s.page, pages);
            box.innerHTML = html;
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'nwQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) {
                    s.page = Number(pg.dataset.pageNum);
                    this.update();
                    VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    });
})();
