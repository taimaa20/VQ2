/* Event details — BRD 7.3 & 8.5 (same content as Option 1; no registration, sharing or calendar export) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const e = D.events.find(x => x.id === VQ.param('id')) || D.events[0];
    const catOf = key => D.eventCategories.find(c => c.key === key);

    VQ.boot({
        title: () => tx(e.title),

        render() {
            const cat = catOf(e.category);

            const header = ui.detailHeader({
                crumbs: [{ label: t('navEvents'), href: VQ.href('events') }, { label: tx(e.title) }],
                title: esc(tx(e.title)),
                chips: ui.tag(tx(cat.label), 'teal', cat.icon) + ui.statusTag(VQ.status(e.start, e.end)),
                meta: [
                    { icon: 'fa-regular fa-calendar', text: VQ.fmtRange(e.start, e.end, 'long') },
                    { icon: 'fa-solid fa-location-dot', text: esc(tx(e.location)) }
                ]
            });

            const article = `<article class="article">
                <div class="article-media-wrap">
                    ${VQ.img(e.image, 'article-media', 1400)}
                    <span class="article-media-badge">${ui.dateBadge(e.start)}</span>
                </div>
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-file-lines"></i>${t('evAbout')}</h2>
                    <div class="article-text">${ui.paragraphs(e.body)}</div>
                </section>
                ${ui.facts([
                    { icon: 'fa-hashtag', label: t('evNumber'), value: `<span dir="ltr">${e.number}</span>` },
                    { icon: 'fa-building', label: t('department'), value: VQ.deptName(e.department) },
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(e.start) },
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(e.end) }
                ])}
                ${e.album ? `<div><a href="${VQ.href('album', { id: e.album })}" class="${ui.BTN.secondary}"><i class="fa-solid fa-images"></i>${t('evViewPhotos')}</a></div>` : ''}
                ${ui.articleFooter(t('backTo', { x: t('navEvents') }), VQ.href('events'))}
            </article>`;

            VQ.content(header + article);
        }
    });
})();
