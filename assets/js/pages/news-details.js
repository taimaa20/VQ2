/* News details — BRD 8.4 · SPFx DetailsPage (?New) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const n = D.news.find(x => x.id === VQ.param('id')) || D.news[0];
    const catOf = key => D.newsCategories.find(c => c.key === key);

    VQ.boot({
        title: () => tx(n.title),

        render() {
            VQ.content(ui.page([{ label: t('navNews'), href: VQ.href('news') }, { label: tx(n.title) }],
                ui.detailsHead({
                    chips: ui.tag(tx(catOf(n.category).label), '', 'fa-tag'),
                    title: esc(tx(n.title)),
                    dates: `<span>${VQ.fmtDate(n.date, 'long')}</span>`
                }) +
                `<div class="details-img">${VQ.img(n.image, '', 1400, tx(n.title))}</div>` +
                `<p class="details-lead">${esc(tx(n.summary))}</p>` +
                ui.paragraphs(n.body) +
                ui.backToListing(t('backTo', { x: t('navNews') }), VQ.href('news'))
            ));
        }
    });
})();
