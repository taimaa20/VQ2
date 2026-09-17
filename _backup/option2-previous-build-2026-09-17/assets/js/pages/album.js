/* Album detail + full-size image viewer (BRD 8.2) (same scope as Option 1) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const album = D.albums.find(a => a.id === VQ.param('id')) || D.albums[0];
    let current = -1;

    function lightboxHTML(i) {
        const total = album.photos.length;
        return `<div class="lightbox" data-lightbox role="dialog" aria-modal="true">
            <div class="lightbox-head">
                <div><p class="lightbox-title">${esc(tx(album.title))}</p><p class="lightbox-count"><span dir="ltr">${i + 1} / ${total}</span></p></div>
                <button type="button" data-lb-close class="lightbox-close" aria-label="${t('close')}"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="lightbox-stage" dir="ltr">
                <button type="button" data-lb-step="-1" class="lightbox-nav lightbox-nav--prev" aria-label="${t('prev')}"><i class="fa-solid fa-chevron-left"></i></button>
                <img src="${VQ.photo(album.photos[i], 1800)}" alt="" onerror="this.onerror=null;this.src=VQ.FALLBACK_IMG;">
                <button type="button" data-lb-step="1" class="lightbox-nav lightbox-nav--next" aria-label="${t('next')}"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="lightbox-thumbs" dir="ltr">
                ${album.photos.map((p, n) => `<button type="button" data-lb-go="${n}" class="lightbox-thumb${n === i ? ' active' : ''}">${VQ.img(p, '', 200)}</button>`).join('')}
            </div>
        </div>`;
    }

    function openLightbox(i) {
        current = (i + album.photos.length) % album.photos.length;
        VQ.$('#vqModalRoot').innerHTML = lightboxHTML(current);
        document.documentElement.classList.add('modal-open');
    }

    function closeLightbox() {
        current = -1;
        VQ.$('#vqModalRoot').innerHTML = '';
        document.documentElement.classList.remove('modal-open');
    }

    VQ.boot({
        title: () => tx(album.title),

        render() {
            VQ.content(
                ui.detailHeader({
                    crumbs: [{ label: t('navPhotos'), href: VQ.href('photo-gallery') }, { label: tx(album.title) }],
                    title: esc(tx(album.title)),
                    meta: [
                        { icon: 'fa-regular fa-calendar', text: VQ.fmtDate(album.date, 'long') },
                        { icon: 'fa-regular fa-images', text: t('pgPhotos', { n: album.photos.length }) }
                    ]
                }) +
                `<div class="photo-grid">
                    ${album.photos.map((p, i) => `<button type="button" data-photo="${i}" class="photo-tile photo-tile--${i % 5}">
                        ${VQ.img(p, '', 700)}<span class="photo-zoom"><i class="fa-solid fa-expand"></i></span>
                    </button>`).join('')}
                </div>` +
                ui.articleFooter(t('backTo', { x: t('navPhotos') }), VQ.href('photo-gallery'))
            );
        },

        setup(root) {
            root.addEventListener('click', e => {
                const ph = e.target.closest('[data-photo]');
                if (ph) openLightbox(Number(ph.dataset.photo));
            });
            document.addEventListener('click', e => {
                if (current < 0) return;
                if (e.target.closest('[data-lb-close]')) { closeLightbox(); return; }
                const step = e.target.closest('[data-lb-step]');
                if (step) { openLightbox(current + Number(step.dataset.lbStep)); return; }
                const go = e.target.closest('[data-lb-go]');
                if (go) openLightbox(Number(go.dataset.lbGo));
            });
            document.addEventListener('keydown', e => {
                if (current < 0) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') openLightbox(current + 1);
                if (e.key === 'ArrowLeft') openLightbox(current - 1);
            });
        }
    });
})();
