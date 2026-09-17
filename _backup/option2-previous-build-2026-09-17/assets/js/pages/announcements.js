/* Announcements listing — BRD 7.2 (same scope as Option 1: search · type filter · 6 per page) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', type: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const typeOf = key => D.announcementTypes.find(x => x.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.announcements
            .filter(a => s.type === 'all' || a.type === s.type)
            .filter(a => !q || (a.title.ar + ' ' + a.title.en + ' ' + a.number).toLowerCase().includes(q))
            .sort((a, b) => b.start.localeCompare(a.start));
    }

    function card(a) {
        const ty = typeOf(a.type);
        return `<a href="${VQ.href('announcement-details', { id: a.id })}" class="tile" style="--c:${ty.color}">
            <span class="circular-tile circular-tile--flat">
                ${VQ.img(ty.image, 'circular-img', 700)}
                <span class="circular-bar"><b>${esc(tx(a.title))}</b><small>${tx(ty.label)} · ${VQ.fmtDate(a.start)}</small></span>
            </span>
            <span class="tile-body">
                <span class="tile-text">${esc(tx(a.summary))}</span>
                <span class="tile-foot"><span dir="ltr">${a.number}</span><span class="more-link">${t('viewDetails')}${ui.arrow()}</span></span>
            </span>
        </a>`;
    }

    VQ.boot({
        title: () => t('annTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('annTitle'), desc: t('annDesc'), crumbs: [{ label: t('navAnnouncements') }] }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'annQ', value: s.q, placeholder: t('annSearch') })),
                    ui.chips({ name: 'type', active: s.type, items: [{ value: 'all', label: t('all') }]
                        .concat(D.announcementTypes.map(ty => ({ value: ty.key, label: tx(ty.label), dot: ty.color }))) })
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="card-grid card-grid--3">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-bullhorn'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'annQ') { s.q = e.target.value; s.page = 1; this.update(); }
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
