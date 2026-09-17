/* Discounts listing — BRD 7.5 (same scope as Option 1: search · category · 6 per page) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const catOf = key => D.discountCategories.find(c => c.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.discounts
            .filter(d => s.category === 'all' || d.category === s.category)
            .filter(d => !q || (d.title.ar + ' ' + d.title.en + ' ' + d.partner.ar + ' ' + d.partner.en).toLowerCase().includes(q))
            .sort((a, b) => b.start.localeCompare(a.start));
    }

    const badgeTone = p => (p >= 25 ? 'ruby' : p >= 20 ? 'amber' : 'teal');

    function expiryText(d) {
        const days = VQ.daysUntil(d.end);
        if (days < 0) return { text: t('expired'), cls: 'expiry--past' };
        if (days === 0) return { text: t('endsToday'), cls: 'expiry--today' };
        return { text: t('daysLeft', { n: days }), cls: days <= 30 ? 'expiry--soon' : '' };
    }

    function card(d) {
        const cat = catOf(d.category);
        const exp = expiryText(d);
        return `<a href="${VQ.href('discount-details', { id: d.id })}" class="tile">
            <span class="tile-media">
                ${VQ.img(d.image, '', 700)}
                <span class="tile-media-shade"></span>
                <span class="percent-badge percent-badge--${badgeTone(d.percent)}"><small>${t('dsUpTo')}</small><b dir="ltr">${d.percent}%</b></span>
                <span class="tile-media-caption"><i class="fa-solid fa-store"></i>${esc(tx(d.partner))}</span>
            </span>
            <span class="tile-body">
                <span class="chip-row">${ui.tag(tx(cat.label), 'teal', cat.icon)}</span>
                <b class="tile-title">${esc(tx(d.title))}</b>
                <span class="tile-text">${esc(tx(d.summary))}</span>
                <span class="tile-foot"><span class="expiry ${exp.cls}"><i class="fa-regular fa-clock"></i>${exp.text}</span><span class="more-link">${t('viewDetails')}${ui.arrow()}</span></span>
            </span>
        </a>`;
    }

    VQ.boot({
        title: () => t('dsTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('dsTitle'), desc: t('dsDesc'), crumbs: [{ label: t('navDiscounts') }] }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'dsQ', value: s.q, placeholder: t('dsSearch') })),
                    ui.chips({ name: 'category', active: s.category, items: [{ value: 'all', label: t('all') }]
                        .concat(D.discountCategories.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
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
                : ui.emptyState('fa-tags'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'dsQ') { s.q = e.target.value; s.page = 1; this.update(); }
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
