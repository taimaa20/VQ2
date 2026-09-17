/* News listing — BRD 8.4 · SPFx AdsPage (listName = News) with the HomePage news-card as the top story
   Option 1 coverage: search · category · top story · newest first · 4 per page */
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

    function feature(n) {
        return `<a href="${VQ.href('news-details', { id: n.id })}" class="news-card" style="margin-bottom:1.6rem">
            <div class="news-image-wrapper"><div class="news-image" style="min-height:15rem">${VQ.img(n.image, '', 1200)}</div></div>
            <div class="news-content">
                <div class="card-chips">${ui.tag(t('nwFeatured'), 'amber', 'fa-star')}${ui.tag(tx(catOf(n.category).label))}</div>
                <p class="news-date">${VQ.icon('calendar')}${VQ.fmtCardDate(n.date)}</p>
                <h2 class="news-title" style="font-size:1.35rem">${esc(tx(n.title))}</h2>
                <p class="news-description">${esc(tx(n.summary))}</p>
                <div class="more-row"><span class="more-link">${t('nwReadMore')} ${ui.arrow()}</span></div>
            </div>
        </a>`;
    }

    function card(n) {
        return ui.listingCard({
            url: VQ.href('news-details', { id: n.id }),
            image: n.image,
            date: n.date,
            chips: ui.tag(tx(catOf(n.category).label)),
            title: esc(tx(n.title)),
            desc: esc(tx(n.summary)),
            button: t('nwReadMore')
        });
    }

    VQ.boot({
        title: () => t('nwTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navNews') }],
                ui.pageHead({ title: t('nwTitle'), desc: t('nwDesc') }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'nwQ', value: s.q, placeholder: t('nwSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'category', active: s.category, label: t('category'), items: [{ value: 'all', label: t('all') }]
                        .concat(D.newsCategories.map(c => ({ value: c.key, label: tx(c.label) }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const box = VQ.$('#results');
            if (!items.length) { box.innerHTML = ui.subHead(t('nwLatest'), ui.resultsCount(0)) + ui.emptyState('fa-newspaper'); return; }

            const plain = !s.q && s.category === 'all';
            const rest = plain ? items.slice(1) : items;
            const { slice, pages } = ui.paginate(rest, s, PAGE_SIZE);
            box.innerHTML = (plain && s.page === 1 ? feature(items[0]) : '') +
                ui.subHead(t('nwLatest'), ui.resultsCount(items.length)) +
                `<div class="listing-section">${slice.map(card).join('')}</div>` +
                ui.pagination(s.page, pages);
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'nwQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', category: 'all', page: 1 }); this.render(); return; }
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        }
    });
})();
