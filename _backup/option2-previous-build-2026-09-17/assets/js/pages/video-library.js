/* Video Library — BRD 8.3 (same scope as Option 1: now playing · search · category · video cards · 6 per page) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1, current: VQ.param('id') || D.videos[0].id };
    const PAGE_SIZE = 6;

    const catOf = key => D.videoCategories.find(c => c.key === key);

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.videos
            .filter(v => s.category === 'all' || v.category === s.category)
            .filter(v => !q || (v.title.ar + ' ' + v.title.en + ' ' + v.description.ar + ' ' + v.description.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function featured() {
        const v = D.videos.find(x => x.id === s.current) || D.videos[0];
        const cat = catOf(v.category);
        return `<section class="now-playing" id="featuredVideo">
            ${ui.videoPlayer({ poster: v.thumb, title: tx(v.title), length: v.length })}
            <div class="now-playing-info">
                <div class="chip-row">${ui.tag(t('vlNowPlaying'), 'solidRuby', 'fa-tower-broadcast')}${ui.tag(tx(cat.label), 'teal', cat.icon)}</div>
                <h2 class="now-playing-title">${esc(tx(v.title))}</h2>
                <p class="now-playing-text">${esc(tx(v.description))}</p>
                <p class="now-playing-meta"><i class="fa-solid fa-building"></i>${VQ.deptName(v.department)} · ${VQ.fmtDate(v.date)}</p>
            </div>
        </section>`;
    }

    function card(v) {
        const cat = catOf(v.category);
        const on = v.id === s.current;
        return `<button type="button" data-video-id="${v.id}" class="tile${on ? ' is-current' : ''}">
            <span class="tile-media tile-media--video">
                ${VQ.img(v.thumb, '', 600)}
                <span class="play-badge${on ? ' play-badge--on' : ''}"><i class="fa-solid ${on ? 'fa-volume-high' : 'fa-play'}"></i></span>
                <span class="length-badge" dir="ltr">${v.length}</span>
            </span>
            <span class="tile-body">
                <span class="chip-row">${ui.tag(tx(cat.label), 'teal', cat.icon)}</span>
                <b class="tile-title">${esc(tx(v.title))}</b>
                <span class="tile-meta">${VQ.deptName(v.department)} · ${VQ.fmtDate(v.date, 'short')}</span>
            </span>
        </button>`;
    }

    VQ.boot({
        title: () => t('vlTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('vlTitle'), desc: t('vlDesc'), crumbs: [{ label: t('navVideos') }] }) +
                `<div id="featuredWrap">${featured()}</div>` +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'vlQ', value: s.q, placeholder: t('vlSearch') })),
                    ui.chips({ name: 'category', active: s.category, items: [{ value: 'all', label: t('all') }]
                        .concat(D.videoCategories.map(c => ({ value: c.key, label: tx(c.label), icon: c.icon }))) })
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="card-grid card-grid--3">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-video'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'vlQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); return; }
                const vid = e.target.closest('[data-video-id]');
                if (vid) {
                    VQ.stopVideos();
                    s.current = vid.dataset.videoId;
                    VQ.$('#featuredWrap').innerHTML = featured();
                    this.update();
                    VQ.$('#featuredWrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    });
})();
