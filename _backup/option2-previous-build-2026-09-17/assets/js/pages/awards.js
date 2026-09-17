/* Received Awards — BRD 5.2 menu item (same illustrative entries as Option 1) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const tones = ['teal', 'ruby', 'amber', 'gold'];

    function card(a, i) {
        return `<div class="tile award-tile award-tile--${tones[i % tones.length]}">
            <span class="award-head">
                <span class="award-icon"><i class="fa-solid ${a.icon}"></i></span>
                ${ui.tag(a.year, 'white', 'fa-calendar')}
            </span>
            <span class="tile-body">
                <b class="tile-title">${esc(tx(a.title))}</b>
                <span class="tile-meta"><i class="fa-solid fa-building-columns"></i>${esc(tx(a.body))}</span>
                <span class="tile-text tile-text--full">${esc(tx(a.summary))}</span>
            </span>
        </div>`;
    }

    VQ.boot({
        title: () => t('awTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('awTitle'), desc: t('awDesc'), crumbs: [{ label: t('navAwards') }], badge: ui.sampleBadge() }) +
                `<div class="card-grid card-grid--2">${D.awards.map(card).join('')}</div>`
            );
        }
    });
})();
