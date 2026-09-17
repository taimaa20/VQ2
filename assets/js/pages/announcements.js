/* Announcements listing — BRD 7.2 · SPFx AdsPage (listName = Announcements / Circulars)
   Option 1 coverage: search by title or number · filter by type · newest first · 6 per page */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', type: 'all', page: 1 };
    const PAGE_SIZE = 6;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.announcements
            .filter(a => s.type === 'all' || a.type === s.type)
            .filter(a => !q || (a.title.ar + ' ' + a.title.en + ' ' + a.number).toLowerCase().includes(q))
            .sort((a, b) => b.start.localeCompare(a.start));
    }

    function card(a) {
        const ty = ui.typeOfAnnouncement(a.type);
        return ui.listingCard({
            url: VQ.href('announcement-details', { id: a.id }),
            image: ty.image,
            date: a.start,
            overlay: `<span class="type-strip" style="background:${ty.color}"></span>`,
            chips: ui.typeTag(ty) + ui.tag(`<span class="ltr">${a.number}</span>`, 'outline'),
            title: esc(tx(a.title)),
            desc: esc(tx(a.summary)),
            meta: `<span><i class="fa-regular fa-building"></i>${esc(tx(a.issuer))}</span>`
        });
    }

    VQ.boot({
        title: () => t('annTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navAnnouncements') }],
                ui.pageHead({ title: t('annTitle'), desc: t('annDesc') }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'annQ', value: s.q, placeholder: t('annSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'type', active: s.type, label: t('type'), items: [{ value: 'all', label: t('all') }]
                        .concat(D.announcementTypes.map(ty => ({ value: ty.key, label: tx(ty.label), dot: ty.color }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navAnnouncements'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-section">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-bullhorn'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'annQ') { s.q = e.target.value; s.page = 1; this.update(); }
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
