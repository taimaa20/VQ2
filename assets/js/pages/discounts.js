/* Discounts listing — BRD 7.5 · SPFx AdsPage (listName = Discounts: category tabs + card grid)
   Option 1 coverage: search · category · percentage · expiry · newest first · 6 per page */
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

    function expiry(d) {
        const days = VQ.daysUntil(d.end);
        if (days < 0) return `<span class="meta-ruby" style="color:var(--faint)"><i class="fa-regular fa-clock" style="color:var(--faint)"></i>${t('expired')}</span>`;
        if (days === 0) return `<span class="meta-ruby"><i class="fa-regular fa-clock"></i>${t('endsToday')}</span>`;
        return `<span class="${days <= 30 ? 'meta-ruby' : ''}"><i class="fa-regular fa-clock"></i>${t('daysLeft', { n: days })}</span>`;
    }

    function card(d) {
        const cat = catOf(d.category);
        return ui.listingCard({
            url: VQ.href('discount-details', { id: d.id }),
            image: d.image,
            date: d.start,
            badge: ui.percentBadge(d.percent),
            chips: ui.tag(tx(cat.label), '', cat.icon),
            title: esc(tx(d.title)),
            desc: esc(tx(d.summary)),
            meta: `<span><i class="fa-solid fa-store"></i>${esc(tx(d.partner))}</span>` + expiry(d)
        });
    }

    VQ.boot({
        title: () => t('dsTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navDiscounts') }],
                ui.pageHead({ title: t('dsTitle'), desc: t('dsDesc') }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'dsQ', value: s.q, placeholder: t('dsSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'category', active: s.category, label: t('category'), items: [{ value: 'all', label: t('all') }]
                        .concat(D.discountCategories.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navDiscounts'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-tags'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'dsQ') { s.q = e.target.value; s.page = 1; this.update(); }
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
