/* Announcement details — BRD 7.2 (same content as Option 1) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const a = D.announcements.find(x => x.id === VQ.param('id')) || D.announcements[0];
    const typeOf = key => D.announcementTypes.find(x => x.key === key);

    function openAttachment() {
        ui.openDocument({
            title: tx(a.title),
            fileName: a.attachment,
            pages: 2,
            content: ui.docLetterhead(esc(tx(a.title)), a.number) + ui.docSkeleton(4)
        });
    }

    VQ.boot({
        title: () => tx(a.title),

        render() {
            const ty = typeOf(a.type);

            const header = ui.detailHeader({
                crumbs: [{ label: t('navAnnouncements'), href: VQ.href('announcements') }, { label: tx(a.title) }],
                title: esc(tx(a.title)),
                chips: `<span class="chip chip--type" style="--c:${ty.color}">${tx(ty.label)}</span>`,
                meta: [{ icon: 'fa-regular fa-calendar', text: VQ.fmtDate(a.start, 'long') }]
            });

            const article = `<article class="article">
                ${VQ.img(ty.image, 'article-media', 1400)}
                <div class="article-text">${ui.paragraphs(a.body)}</div>
                ${ui.facts([
                    { icon: 'fa-hashtag', label: t('annNumber'), value: `<span dir="ltr">${a.number}</span>` },
                    { icon: 'fa-building', label: t('issuedBy'), value: esc(tx(a.issuer)) },
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(a.start) },
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(a.end) }
                ])}
                ${a.attachment ? `<div class="file-row">
                    <i class="fa-solid fa-file-pdf ico-pdf file-row-icon"></i>
                    <span class="file-row-name"><span dir="ltr">${a.attachment}</span><small>PDF · 1.2 MB</small></span>
                    <button type="button" data-open-attachment class="${ui.BTN.secondary} btn-sm"><i class="fa-regular fa-eye"></i>${t('viewAttachment')}</button>
                </div>` : ''}
                ${a.link ? `<div><a href="${VQ.href(a.link.page)}" class="${ui.BTN.primary}"><span>${esc(tx(a.link.label))}</span>${ui.arrow()}</a></div>` : ''}
                ${ui.articleFooter(t('backTo', { x: t('navAnnouncements') }), VQ.href('announcements'))}
            </article>`;

            VQ.content(header + article);
        },

        setup(root) {
            root.addEventListener('click', e => {
                if (e.target.closest('[data-open-attachment]')) openAttachment();
            });
        }
    });
})();
