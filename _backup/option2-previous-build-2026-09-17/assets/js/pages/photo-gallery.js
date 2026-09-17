/* Photo Gallery — albums (BRD 8.2) (same scope as Option 1: search · album cards · 6 per page) */
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
        return `<a href="${VQ.href('album', { id: a.id })}" class="tile album-tile">
            <span class="tile-media tile-media--tall">
                ${VQ.img(a.cover, '', 800)}
                <span class="tile-media-end">${ui.tag(t('pgPhotos', { n: a.photos.length }), 'solidDark', 'fa-images')}</span>
            </span>
            <span class="tile-body">
                <b class="tile-title">${esc(tx(a.title))}</b>
                <span class="tile-meta"><i class="fa-regular fa-calendar"></i>${VQ.fmtDate(a.date)}</span>
            </span>
        </a>`;
    }

    VQ.boot({
        title: () => t('pgTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('pgTitle'), desc: t('pgDesc'), crumbs: [{ label: t('navPhotos') }] }) +
                ui.toolbar([ui.row(ui.searchInput({ id: 'pgQ', value: s.q, placeholder: t('pgSearch') }))]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="card-grid card-grid--3">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-images'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'pgQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        }
    });
})();
