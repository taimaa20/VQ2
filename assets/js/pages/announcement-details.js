/* Announcement details — BRD 7.2 · SPFx DetailsPage (?Announcement / ?Circulars)
   Title · ruby date · image · details · key dates · attachment preview · back to listing */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const a = D.announcements.find(x => x.id === VQ.param('id')) || D.announcements[0];
    let showDoc = false;

    function attachmentBlock() {
        if (!a.attachment) return '';
        return ui.block(t('attachment'), `<div class="attachment-row">
                <span class="attachment-icon"><i class="fa-solid fa-file-pdf"></i></span>
                <div class="attachment-text"><p class="ltr">${esc(a.attachment)}</p><span>PDF · 1.2 MB</span></div>
                <button type="button" class="btn btn-outline btn-sm" data-toggle-doc aria-expanded="${showDoc}">
                    <i class="fa-regular ${showDoc ? 'fa-eye-slash' : 'fa-eye'}"></i>${showDoc ? t('hideAttachment') : t('viewAttachment')}
                </button>
            </div>
            ${showDoc ? `<div style="margin-top:1rem">${ui.docViewer({ fileName: a.attachment, pages: 2, content: ui.docLetterhead(esc(tx(a.title)), a.number) + ui.docSkeleton(4) })}</div>` : ''}`,
            'attachmentBlock');
    }

    VQ.boot({
        title: () => tx(a.title),

        render() {
            const ty = ui.typeOfAnnouncement(a.type);
            VQ.content(ui.page([{ label: t('navAnnouncements'), href: VQ.href('announcements') }, { label: tx(a.title) }],
                ui.detailsHead({
                    chips: ui.typeTag(ty) + ui.tag(`<span class="ltr">${a.number}</span>`, 'outline'),
                    title: esc(tx(a.title)),
                    dates: `<span>${VQ.fmtDate(a.start, 'long')}</span>`,
                    meta: [{ icon: 'fa-regular fa-building', text: esc(tx(a.issuer)) }]
                }) +
                `<div class="details-img">${VQ.img(ty.image, '', 1400, tx(ty.label))}</div>` +
                ui.paragraphs(a.body) +
                (a.link ? `<p style="margin-top:1.1rem"><a href="${VQ.href(a.link.page)}" class="btn btn-primary">${esc(tx(a.link.label))} ${ui.arrow()}</a></p>` : '') +
                ui.block(t('annNumber'), ui.facts([
                    { icon: 'fa-hashtag', label: t('annNumber'), value: `<span class="ltr">${a.number}</span>` },
                    { icon: 'fa-building', label: t('issuedBy'), value: esc(tx(a.issuer)) },
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(a.start) },
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(a.end) }
                ])) +
                `<div id="attachmentWrap">${attachmentBlock()}</div>` +
                ui.backToListing(t('backTo', { x: t('navAnnouncements') }), VQ.href('announcements'))
            ));
        },

        setup(root) {
            root.addEventListener('click', e => {
                if (e.target.closest('[data-toggle-doc]')) {
                    showDoc = !showDoc;
                    VQ.$('#attachmentWrap').innerHTML = attachmentBlock();
                }
            });
        }
    });
})();
