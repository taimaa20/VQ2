/* Gallery — photo albums and the video library on one page, with one filter. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const PAGE_SIZE = 6;
    const s = {
        q: '',
        filter: 'all',
        photos: { page: 1 },
        videos: {
            page: 1,
            current: D.videos.some(v => v.id === VQ.param('id')) ? VQ.param('id') : D.videos[0].id
        }
    };

    const catOf = key => D.videoCategories.find(c => c.key === key);
    const showPhotos = () => s.filter === 'all' || s.filter === 'photos';
    const showVideos = () => s.filter !== 'photos';

    function albums() {
        const q = s.q.trim().toLowerCase();
        return D.albums
            .filter(a => !q || (a.title.ar + ' ' + a.title.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function videos() {
        const q = s.q.trim().toLowerCase();
        const cat = s.filter !== 'all' && s.filter !== 'photos' ? s.filter : 'all';
        return D.videos
            .filter(v => cat === 'all' || v.category === cat)
            .filter(v => !q || (v.title.ar + ' ' + v.title.en + ' ' + v.description.ar + ' ' + v.description.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function albumCard(a) {
        return ui.listingCard({
            url: VQ.href('album', { id: a.id }),
            cls: 'album-card',
            image: a.cover,
            date: a.date,
            overlay: `<span class="card-length"><i class="fa-regular fa-images"></i> ${t('pgPhotos', { n: a.photos.length })}</span>`,
            title: esc(tx(a.title)),
            button: t('pgOpenAlbum')
        });
    }

    function nowPlaying() {
        const v = D.videos.find(x => x.id === s.videos.current) || D.videos[0];
        const cat = catOf(v.category);
        return `<div class="now-playing">
            ${ui.videoPlayer({ poster: v.thumb, title: tx(v.title), length: v.length })}
            <div class="now-playing-text">
                <div class="card-chips">${ui.tag(t('vlNowPlaying'), 'ruby', 'fa-tower-broadcast')}${ui.tag(tx(cat.label), '', cat.icon)}</div>
                <h3>${esc(tx(v.title))}</h3>
                <p>${esc(tx(v.description))}</p>
                <div class="card-meta"><span><i class="fa-regular fa-building"></i>${VQ.deptName(v.department)}</span><span class="meta-ruby"><i class="fa-regular fa-calendar"></i>${VQ.fmtDate(v.date)}</span><span class="ltr"><i class="fa-regular fa-clock"></i>${v.length}</span></div>
            </div>
        </div>`;
    }

    function videoCard(v) {
        const cat = catOf(v.category);
        const on = v.id === s.videos.current;
        return ui.listingCard({
            tagName: 'button',
            cls: 'is-link' + (on ? ' is-current' : ''),
            attrs: `type="button" data-video-id="${v.id}" style="text-align:start;width:100%" ${on ? 'aria-current="true"' : ''}`,
            image: v.thumb,
            date: v.date,
            overlay: `<span class="card-play"><i class="fa-solid ${on ? 'fa-volume-high' : 'fa-play'}"></i></span><span class="card-length ltr">${v.length}</span>`,
            chips: ui.tag(tx(cat.label), '', cat.icon),
            title: esc(tx(v.title)),
            meta: `<span><i class="fa-regular fa-building"></i>${VQ.deptName(v.department)}</span>`,
            button: on ? t('vlNowPlaying') : t('vlWatch')
        });
    }

    function photoResults() {
        const items = albums();
        const { slice, pages } = ui.paginate(items, s.photos, PAGE_SIZE);
        return ui.subHead(t('pgTitle'), ui.resultsCount(items.length)) + (items.length
            ? `<div class="listing-grid">${slice.map(albumCard).join('')}</div>` + ui.pagination(s.photos.page, pages)
            : ui.emptyState('fa-images'));
    }

    function videoResults() {
        const items = videos();
        const { slice, pages } = ui.paginate(items, s.videos, PAGE_SIZE);
        return ui.subHead(t('vlTitle'), ui.resultsCount(items.length)) + (items.length
            ? `<div class="listing-grid">${slice.map(videoCard).join('')}</div>` + ui.pagination(s.videos.page, pages)
            : ui.emptyState('fa-video'));
    }

    function filterBar() {
        const tabs = [{ value: 'all', label: t('all') }, { value: 'photos', label: t('pgTitle'), icon: 'fa-images' }]
            .concat(D.videoCategories.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon })));
        return `<div class="filter-search-section gallery-filter">
            ${ui.filters(ui.searchField({ id: 'galQ', value: s.q, placeholder: t('galSearch') }) + ui.clearButton())}
            ${ui.tabs({ name: 'filter', active: s.filter, label: t('category'), items: tabs })}
        </div>`;
    }

    VQ.boot({
        title: () => t('navGallery'),

        render() {
            VQ.content(ui.page([{ label: t('navGallery') }],
                ui.pageHead({ title: t('navGallery'), desc: t('galDesc') }) +
                filterBar() +
                (showPhotos() ? ui.section(`<div id="photoResults" data-pager="photos">${photoResults()}</div>`, 'gallery-photos') : '') +
                (showVideos() ? ui.section(
                    `<div id="nowPlaying" style="margin-bottom:1.5rem">${nowPlaying()}</div>` +
                    `<div id="videoResults" data-pager="videos">${videoResults()}</div>`,
                    'gallery-videos'
                ) : '')
            ));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id !== 'galQ') return;
                s.q = e.target.value;
                s.photos.page = 1;
                s.videos.page = 1;
                const photos = VQ.$('#photoResults');
                const videos = VQ.$('#videoResults');
                if (photos) photos.innerHTML = photoResults();
                if (videos) videos.innerHTML = videoResults();
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) {
                    s.q = '';
                    s.filter = 'all';
                    s.photos.page = 1;
                    s.videos.page = 1;
                    this.render();
                    return;
                }
                const chip = e.target.closest('[data-chip]');
                if (chip) {
                    s.filter = chip.dataset.value;
                    s.photos.page = 1;
                    s.videos.page = 1;
                    this.render();
                    return;
                }
                const pg = e.target.closest('[data-page-num]');
                if (pg) {
                    const which = pg.closest('[data-pager]');
                    if (!which) return;
                    s[which.dataset.pager].page = Number(pg.dataset.pageNum);
                    VQ.$('#' + (which.dataset.pager === 'photos' ? 'photoResults' : 'videoResults')).innerHTML = which.dataset.pager === 'photos' ? photoResults() : videoResults();
                    return;
                }
                const vid = e.target.closest('[data-video-id]');
                if (vid) {
                    VQ.stopVideos();
                    s.videos.current = vid.dataset.videoId;
                    VQ.$('#nowPlaying').innerHTML = nowPlaying();
                    VQ.$('#videoResults').innerHTML = videoResults();
                    VQ.$('#nowPlaying').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        },

        afterBoot() {
            if (VQ.param('id')) VQ.$('#nowPlaying')?.scrollIntoView({ block: 'center' });
        }
    });
})();
