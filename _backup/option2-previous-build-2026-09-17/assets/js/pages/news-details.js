/* News details — BRD 8.4 (same content as Option 1) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const n = D.news.find(x => x.id === VQ.param('id')) || D.news[0];
    const catOf = key => D.newsCategories.find(c => c.key === key);

    VQ.boot({
        title: () => tx(n.title),

        render() {
            const header = ui.detailHeader({
                crumbs: [{ label: t('navNews'), href: VQ.href('news') }, { label: tx(n.title) }],
                title: esc(tx(n.title)),
                chips: ui.tag(tx(catOf(n.category).label), 'teal', 'fa-tag'),
                meta: [{ icon: 'fa-regular fa-calendar', text: VQ.fmtDate(n.date, 'long') }]
            });

            const article = `<article class="article">
                ${VQ.img(n.image, 'article-media', 1400)}
                <div class="article-text">
                    <p class="article-lead">${esc(tx(n.summary))}</p>
                    ${ui.paragraphs(n.body)}
                </div>
                ${ui.articleFooter(t('backTo', { x: t('navNews') }), VQ.href('news'))}
            </article>`;

            VQ.content(header + article);
        }
    });
})();
