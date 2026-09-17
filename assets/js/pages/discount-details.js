/* Discount details — BRD 7.5 & 8.7 · SPFx DetailsPage (?Discount: image shown at natural height)
   Title · (From)–(To) validity · partner · percentage · offer details · terms · time left · offer document · back */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const d = D.discounts.find(x => x.id === VQ.param('id')) || D.discounts[0];
    const catOf = key => D.discountCategories.find(c => c.key === key);

    /* The offer "PDF" page, laid out like the reference offer document */
    function offerPage() {
        const groups = d.offers
            ? d.offers.map(g => `<div><h5>${esc(tx(g.group))}:</h5><ul>${g.rows.map(r => `<li><span class="ltr">${r.percent}%</span> ${esc(tx(r.label))}</li>`).join('')}</ul></div>`).join('')
            : `<div><h5>${esc(tx(d.partner))}:</h5><ul><li>${t('dsUpTo')} <span class="ltr">${d.percent}%</span> ${t('dsOff')}</li><li>${esc(tx(d.summary))}</li></ul></div>`;
        return `<div class="offer-doc">
            <div class="offer-doc-hero">${VQ.img(d.image, '', 1000)}<h4>${esc(tx(d.title))}</h4></div>
            <div class="offer-doc-body">
                ${groups}
                <div><h5>${t('dsTermsApply')}</h5><ul>${d.terms.map(term => `<li>${esc(tx(term))}</li>`).join('')}</ul></div>
                <p class="offer-valid">${t('dsValidity')}: ${VQ.fmtRange(d.start, d.end)}</p>
            </div>
        </div>`;
    }

    VQ.boot({
        title: () => tx(d.title),

        render() {
            const cat = catOf(d.category);
            const days = VQ.daysUntil(d.end);
            VQ.content(ui.page([{ label: t('navDiscounts'), href: VQ.href('discounts') }, { label: tx(d.title) }],
                ui.detailsHead({
                    chips: ui.tag(`${t('dsUpTo')} <span class="ltr">${d.percent}%</span>`, 'solid', 'fa-percent', 'background:var(--vq-ruby)') + ui.tag(tx(cat.label), '', cat.icon),
                    title: esc(tx(d.title)),
                    dates: ui.dateRange(d.start, d.end),
                    meta: [{ icon: 'fa-solid fa-store', text: esc(tx(d.partner)) }]
                }) +
                `<div class="details-img">${VQ.img(d.image, '', 1400, tx(d.title))}${ui.percentBadge(d.percent)}</div>` +
                ui.block(t('dsOverview'), ui.paragraphs(d.body)) +
                ui.block(t('dsTerms'), ui.checkList(d.terms) + `<div style="margin-top:1rem">${ui.facts([
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(d.end) },
                    { icon: 'fa-hourglass-half', label: t('dsTimeLeft'), value: `<span style="${days <= 30 ? 'color:var(--vq-ruby)' : ''}">${days < 0 ? t('expired') : t('daysLeft', { n: days })}</span>` }
                ])}</div>`) +
                ui.block(t('dsDocument'), ui.docViewer({ fileName: d.document, pages: 1, content: offerPage(), height: '32rem' })) +
                ui.backToListing(t('backTo', { x: t('navDiscounts') }), VQ.href('discounts'))
            ));
        }
    });
})();
