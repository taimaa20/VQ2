/* Course details — BRD 7.7 (same content as Option 1; display only: no registration) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const c = D.courses.find(x => x.id === VQ.param('id')) || D.courses[0];
    const typeOf = key => D.courseTypes.find(x => x.key === key);

    VQ.boot({
        title: () => tx(c.title),

        render() {
            const type = typeOf(c.type);

            const header = ui.detailHeader({
                crumbs: [{ label: t('navCourses'), href: VQ.href('courses') }, { label: tx(c.title) }],
                title: esc(tx(c.title)),
                chips: ui.tag(tx(type.label), 'teal', type.icon),
                meta: [
                    { icon: 'fa-regular fa-calendar', text: VQ.fmtDate(c.start, 'long') },
                    { icon: 'fa-regular fa-clock', text: esc(tx(c.duration)) }
                ]
            });

            const media = c.video
                ? ui.videoPlayer({ poster: c.image, title: tx(c.title), length: c.videoLength })
                : VQ.img(c.image, 'article-media', 1400);

            const article = `<article class="article">
                ${media}
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-file-lines"></i>${t('crOverview')}</h2>
                    <div class="article-text"><p>${esc(tx(c.summary))}</p></div>
                </section>
                <section class="article-section">
                    <h2 class="article-subtitle"><i class="fa-solid fa-bullseye"></i>${t('crObjectives')}</h2>
                    <ul class="check-list">${c.objectives.map(o => `<li><i class="fa-solid fa-circle-check"></i>${esc(tx(o))}</li>`).join('')}</ul>
                </section>
                ${ui.facts([
                    { icon: 'fa-location-dot', label: t('crMode'), value: esc(tx(c.mode)) },
                    { icon: 'fa-building', label: t('crProvider'), value: esc(tx(c.provider)) }
                ])}
                ${ui.articleFooter(t('backTo', { x: t('navCourses') }), VQ.href('courses'))}
            </article>`;

            VQ.content(header + article);
        }
    });
})();
