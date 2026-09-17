/* Received Awards — BRD 5.2 menu item (illustrative entries) · SPFx AdsPage listing rows */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const accents = ['linear-gradient(145deg,#00626C,#00474F)', 'linear-gradient(145deg,#8A1538,#5e0e26)', 'linear-gradient(145deg,#D76B00,#a85200)', 'linear-gradient(145deg,#A18B29,#7a6a1f)'];

    function card(a, i) {
        return ui.listingCard({
            imageHTML: `<div class="award-visual" style="background:${accents[i % accents.length]}"><span><i class="fa-solid ${a.icon}"></i></span></div>`,
            chips: ui.tag(a.year, 'outline', 'fa-calendar'),
            title: esc(tx(a.title)),
            desc: esc(tx(a.summary)),
            meta: `<span><i class="fa-solid fa-building-columns"></i>${esc(tx(a.body))}</span>`,
            button: false
        });
    }

    VQ.boot({
        title: () => t('awTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navAwards') }],
                ui.pageHead({ title: t('awTitle'), desc: t('awDesc'), badge: ui.sampleBadge() }) +
                ui.subHead(t('navAwards'), ui.resultsCount(D.awards.length)) +
                `<div class="listing-section">${D.awards.map(card).join('')}</div>`
            ));
        }
    });
})();
