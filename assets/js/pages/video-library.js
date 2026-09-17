/* Video Gallery — BRD 8.3 · SPFx TopBar "Video Gallery" page
   Now playing (embedded player mock) · search · category tabs · card grid · 6 per page */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1, current: D.videos.some(v => v.id === VQ.param('id')) ? VQ.param('id') : D.videos[0].id };
    const PAGE_SIZE = 6;

    const catOf = key => D.videoCategories.find(c => c.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.videos
            .filter(v => s.category === 'all' || v.category === s.category)
            .filter(v => !q || (v.title.ar + ' ' + v.title.en + ' ' + v.description.ar + ' ' + v.description.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function nowPlaying() {
        const v = D.videos.find(x => x.id === s.current) || D.videos[0];
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

    function card(v) {
        const cat = catOf(v.category);
        const on = v.id === s.current;
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

    VQ.boot({
        title: () => t('vlTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navVideos') }],
                ui.pageHead({ title: t('vlTitle'), desc: t('vlDesc') }) +
                `<div id="nowPlaying" style="padding-bottom:1.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--line-soft)">${nowPlaying()}</div>` +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'vlQ', value: s.q, placeholder: t('vlSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'category', active: s.category, label: t('category'), items: [{ value: 'all', label: t('all') }]
                        .concat(D.videoCategories.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navVideos'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-video'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'vlQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', category: 'all', page: 1 }); this.render(); return; }
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); return; }
                const vid = e.target.closest('[data-video-id]');
                if (vid) {
                    VQ.stopVideos();
                    s.current = vid.dataset.videoId;
                    VQ.$('#nowPlaying').innerHTML = nowPlaying();
                    this.update();
                    VQ.$('#nowPlaying').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    });
})();
