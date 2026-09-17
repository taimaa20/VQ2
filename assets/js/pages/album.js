/* Album — BRD 8.2: album photos with a full-size viewer · SPFx DetailsPage vocabulary */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const album = D.albums.find(a => a.id === VQ.param('id')) || D.albums[0];
    let current = -1;

    function lightbox(i) {
        const total = album.photos.length;
        return `<div class="lightbox" role="dialog" aria-modal="true" aria-label="${esc(tx(album.title))}">
            <div class="lightbox-head">
                <div><p>${esc(tx(album.title))}</p><span class="ltr">${i + 1} / ${total}</span></div>
                <button type="button" class="lightbox-close" data-lb-close aria-label="${t('close')}"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="lightbox-stage">
                <button type="button" class="lightbox-nav prev" data-lb-step="-1" aria-label="${t('prev')}"><i class="fa-solid fa-chevron-left"></i></button>
                <img src="${VQ.photo(album.photos[i], 1800)}" alt="" onerror="this.onerror=null;this.src=VQ.FALLBACK_IMG;">
                <button type="button" class="lightbox-nav next" data-lb-step="1" aria-label="${t('next')}"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="lightbox-thumbs">${album.photos.map((p, n) => `<button type="button" class="${n === i ? 'active' : ''}" data-lb-go="${n}" aria-label="${n + 1}">${VQ.img(p, '', 200)}</button>`).join('')}</div>
        </div>`;
    }

    function open(i) {
        current = (i + album.photos.length) % album.photos.length;
        VQ.$('#vqModalRoot').innerHTML = lightbox(current);
        document.documentElement.classList.add('no-scroll');
    }

    function close() {
        current = -1;
        VQ.$('#vqModalRoot').innerHTML = '';
        document.documentElement.classList.remove('no-scroll');
    }

    VQ.boot({
        title: () => tx(album.title),

        render() {
            VQ.content(ui.page([{ label: t('navPhotos'), href: VQ.href('photo-gallery') }, { label: tx(album.title) }],
                ui.detailsHead({
                    title: esc(tx(album.title)),
                    dates: `<span>${VQ.fmtDate(album.date, 'long')}</span>`,
                    meta: [{ icon: 'fa-regular fa-images', text: t('pgPhotos', { n: album.photos.length }) }]
                }) +
                `<div class="photo-grid">${album.photos.map((p, i) => `<button type="button" class="photo-tile" data-photo="${i}" aria-label="${i + 1}">${VQ.img(p, '', i === 0 ? 1200 : 600)}</button>`).join('')}</div>` +
                ui.backToListing(t('backTo', { x: t('navPhotos') }), VQ.href('photo-gallery'))
            ));
        },

        setup(root) {
            root.addEventListener('click', e => {
                const tile = e.target.closest('[data-photo]');
                if (tile) open(Number(tile.dataset.photo));
            });
            document.addEventListener('click', e => {
                if (current < 0) return;
                if (e.target.closest('[data-lb-close]')) { close(); return; }
                const step = e.target.closest('[data-lb-step]');
                if (step) { open(current + Number(step.dataset.lbStep)); return; }
                const go = e.target.closest('[data-lb-go]');
                if (go) open(Number(go.dataset.lbGo));
            });
            document.addEventListener('keydown', e => {
                if (current < 0) return;
                if (e.key === 'Escape') close();
                if (e.key === 'ArrowRight') open(current + 1);
                if (e.key === 'ArrowLeft') open(current - 1);
            });
        }
    });
})();
