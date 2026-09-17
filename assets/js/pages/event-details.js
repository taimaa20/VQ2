/* Event details — BRD 7.3 & 8.5 · SPFx DetailsPage (?Event)
   Title · (From)–(To) dates · location · image · about · key details · photos link · back. No map, share or calendar actions. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const e = D.events.find(x => x.id === VQ.param('id')) || D.events[0];
    const catOf = key => D.eventCategories.find(c => c.key === key);

    VQ.boot({
        title: () => tx(e.title),

        render() {
            const cat = catOf(e.category);
            VQ.content(ui.page([{ label: t('navEvents'), href: VQ.href('events') }, { label: tx(e.title) }],
                ui.detailsHead({
                    chips: ui.tag(tx(cat.label), '', cat.icon) + ui.statusTag(VQ.status(e.start, e.end)),
                    title: esc(tx(e.title)),
                    dates: ui.dateRange(e.start, e.end),
                    meta: [{ icon: 'fa-solid fa-location-dot', text: esc(tx(e.location)) }]
                }) +
                `<div class="details-img">${VQ.img(e.image, '', 1400, tx(e.title))}${ui.cardDate(e.start, 'is-bottom')}</div>` +
                ui.block(t('evAbout'), ui.paragraphs(e.body)) +
                `<div style="margin-top:1.25rem">` + ui.facts([
                    { icon: 'fa-hashtag', label: t('evNumber'), value: `<span class="ltr">${e.number}</span>` },
                    { icon: 'fa-building', label: t('department'), value: VQ.deptName(e.department) },
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(e.start) },
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(e.end) }
                ]) + (e.album ? `<p style="margin-top:1.1rem"><a href="${VQ.href('album', { id: e.album })}" class="btn btn-outline"><i class="fa-regular fa-images"></i>${t('evViewPhotos')}</a></p>` : '') + `</div>` +
                ui.backToListing(t('backTo', { x: t('navEvents') }), VQ.href('events'))
            ));
        }
    });
})();
