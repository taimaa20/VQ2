/* Photo Gallery — BRD 8.2 (albums, newest first) · SPFx TopBar "Image Gallery" page with the AdsPage card grid */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', page: 1 };
    const PAGE_SIZE = 6;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.albums
            .filter(a => !q || (a.title.ar + ' ' + a.title.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function card(a) {
        return ui.listingCard({
            url: VQ.href('album', { id: a.id }),
            cls: 'album-card',
            image: a.cover,
            date: a.date,
            overlay: `<span class="card-length"><i class="fa-regular fa-images"></i> ${t('pgPhotos', { n: a.photos.length })}</span>`,
            title: esc(tx(a.title)),
            button: t('pgOpenAlbum')
        });
    }

    VQ.boot({
        title: () => t('pgTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navPhotos') }],
                ui.pageHead({ title: t('pgTitle'), desc: t('pgDesc') }) +
                ui.filterBar([ui.filters(ui.searchField({ id: 'pgQ', value: s.q, placeholder: t('pgSearch') }) + ui.clearButton())]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navPhotos'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-images'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'pgQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', page: 1 }); this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        }
    });
})();
