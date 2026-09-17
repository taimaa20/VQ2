/* Course details — BRD 7.7 · SPFx DetailsPage vocabulary (informational only: no registration, share or calendar) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const c = D.courses.find(x => x.id === VQ.param('id')) || D.courses[0];
    const typeOf = key => D.courseTypes.find(x => x.key === key);

    VQ.boot({
        title: () => tx(c.title),

        render() {
            const type = typeOf(c.type);
            const media = c.video
                ? `<div style="margin-bottom:1.4rem">${ui.videoPlayer({ poster: c.image, title: tx(c.title), length: c.videoLength })}</div>`
                : `<div class="details-img">${VQ.img(c.image, '', 1400, tx(c.title))}</div>`;

            VQ.content(ui.page([{ label: t('navCourses'), href: VQ.href('courses') }, { label: tx(c.title) }],
                ui.detailsHead({
                    chips: ui.tag(tx(type.label), '', type.icon) + (c.video ? ui.tag(t('crVideo'), 'ruby', 'fa-circle-play') : ''),
                    title: esc(tx(c.title)),
                    dates: `<span>${VQ.fmtDate(c.start, 'long')}</span>`,
                    meta: [{ icon: 'fa-regular fa-clock', text: esc(tx(c.duration)) }]
                }) +
                media +
                ui.block(t('crOverview'), `<p class="details-desc">${esc(tx(c.summary))}</p>`) +
                ui.block(t('crObjectives'), ui.checkList(c.objectives)) +
                `<div style="margin-top:1.25rem">${ui.facts([
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(c.start) },
                    { icon: 'fa-clock', label: t('crDuration'), value: esc(tx(c.duration)) },
                    { icon: 'fa-location-dot', label: t('crMode'), value: esc(tx(c.mode)) },
                    { icon: 'fa-building', label: t('crProvider'), value: esc(tx(c.provider)) }
                ])}</div>` +
                ui.backToListing(t('backTo', { x: t('navCourses') }), VQ.href('courses'))
            ));
        }
    });
})();
