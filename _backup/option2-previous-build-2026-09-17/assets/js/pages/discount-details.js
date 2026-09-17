/* Discount details — BRD 7.5 & 8.7 (same content as Option 1; offer document as a static PDF preview) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const d = D.discounts.find(x => x.id === VQ.param('id')) || D.discounts[0];
    const catOf = key => D.discountCategories.find(c => c.key === key);

    /* The offer "PDF" page */
    function offerPage() {
        const groups = d.offers
            ? d.offers.map(g => `<div class="offer-doc-group">
                <h3>${esc(tx(g.group))}:</h3>
                <ul>${g.rows.map(r => `<li><span dir="ltr">${r.percent}%</span> ${esc(tx(r.label))}</li>`).join('')}</ul>
            </div>`).join('')
            : `<div class="offer-doc-group">
                <h3>${esc(tx(d.partner))}:</h3>
                <p>${t('dsUpTo')} <span dir="ltr">${d.percent}%</span> ${t('dsOff')}</p>
                <p class="offer-doc-muted">${esc(tx(d.summary))}</p>
            </div>`;

        return `<div class="offer-doc">
            <div class="offer-doc-hero">
                ${VQ.img(d.image, '', 1000)}
                <span class="offer-doc-shade"></span>
                <h2>${esc(tx(d.title))}</h2>
            </div>
            <div class="offer-doc-body">
                ${groups}
                <div class="offer-doc-group">
                    <h3>${t('dsTermsApply')}</h3>
                    <ul>${d.terms.map(term => `<li>${esc(tx(term))}</li>`).join('')}</ul>
                </div>
                <p class="offer-doc-validity">${t('dsValidity')}: ${VQ.fmtRange(d.start, d.end)}</p>
            </div>
        </div>`;
    }

    VQ.boot({
        title: () => tx(d.title),

        render() {
            const cat = catOf(d.category);
            const days = VQ.daysUntil(d.end);

            const header = ui.detailHeader({
                crumbs: [{ label: t('navDiscounts'), href: VQ.href('discounts') }, { label: tx(d.title) }],
                title: esc(tx(d.title)),
                chips: ui.tag(`${t('dsUpTo')} <span dir="ltr">${d.percent}%</span>`, 'solidRuby', 'fa-percent') + ui.tag(tx(cat.label), 'teal', cat.icon),
                meta: [
                    { icon: 'fa-regular fa-calendar', text: VQ.fmtRange(d.start, d.end, 'long') },
                    { icon: 'fa-solid fa-store', text: esc(tx(d.partner)) }
                ]
            });

            const article = `<article class="article">
                <div class="article-media-wrap">
                    ${VQ.img(d.image, 'article-media article-media--short', 1400)}
                    <span class="percent-badge percent-badge--ruby percent-badge--lg"><small>${t('dsUpTo')}</small><b dir="ltr">${d.percent}%</b></span>
                </div>
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-gift"></i>${t('dsOverview')}</h2>
                    <div class="article-text">${ui.paragraphs(d.body)}</div>
                </section>
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-list-check"></i>${t('dsTerms')}</h2>
                    <ul class="check-list">${d.terms.map(term => `<li><i class="fa-solid fa-circle-check"></i>${esc(tx(term))}</li>`).join('')}</ul>
                </section>
                ${ui.facts([
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(d.end) },
                    { icon: 'fa-hourglass-half', label: t('dsTimeLeft'), value: `<span class="${days <= 30 ? 'expiry--soon' : ''}">${days < 0 ? t('expired') : t('daysLeft', { n: days })}</span>` }
                ])}
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-file-pdf"></i>${t('dsDocument')}</h2>
                    ${ui.docViewer({ fileName: d.document, pages: 1, content: offerPage(), height: '30rem' })}
                </section>
                ${ui.articleFooter(t('backTo', { x: t('navDiscounts') }), VQ.href('discounts'))}
            </article>`;

            VQ.content(header + article);
        }
    });
})();
