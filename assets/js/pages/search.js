/* Search results — BRD 5.1.6 · SPFx SearchResultsPage (title, "results for", count, result cards)
   Front-end search across the static data, with Option 1's type filters */
(function () {
    const { t, esc, ui } = VQ;
    const FILTERS = [
        { value: 'all', key: 'filterAll', icon: 'fa-border-all' },
        { value: 'pages', key: 'filterPages', icon: 'fa-file-lines' },
        { value: 'people', key: 'filterPeople', icon: 'fa-user' },
        { value: 'documents', key: 'filterDocuments', icon: 'fa-file-pdf' },
        { value: 'images', key: 'filterImages', icon: 'fa-image' },
        { value: 'videos', key: 'filterVideos', icon: 'fa-circle-play' }
    ];
    const s = {
        q: VQ.param('q') || '',
        type: FILTERS.some(f => f.value === VQ.param('type')) ? VQ.param('type') : 'all'
    };

    function syncUrl() {
        const params = new URLSearchParams(location.search);
        s.q ? params.set('q', s.q) : params.delete('q');
        s.type !== 'all' ? params.set('type', s.type) : params.delete('type');
        history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : ''));
    }

    function result(item) {
        const typeLabel = t(FILTERS.find(f => f.value === item.type).key);
        const path = new URL(item.url, location.href);
        return `<a href="${item.url}" class="search-result-card">
            <div class="search-result-top">
                <span class="result-icon"><i class="${item.icon}"></i></span>
                <div style="min-width:0;flex:1">
                    <span class="search-result-title">${esc(item.title)}</span>
                    <div class="search-result-meta"><span>${esc(item.meta)}</span><span>${ui.tag(typeLabel, 'grey')}</span></div>
                    <p class="search-result-path">${esc(path.pathname + path.search)}</p>
                </div>
            </div>
        </a>`;
    }

    VQ.boot({
        title: () => t('srTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navSearch') }],
                ui.pageHead({
                    title: t('srTitle'),
                    desc: `<span id="srDesc"></span>`,
                    actions: `<a href="${VQ.href('home')}" class="btn btn-outline btn-sm">${ui.chevronPrev()} ${t('srBack')}</a>`
                }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'srQ', value: s.q, placeholder: t('searchPlaceholder') })),
                    `<div id="srTabs"></div>`
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const all = VQ.searchItems(s.q, 'all');
            const items = s.type === 'all' ? all : all.filter(i => i.type === s.type);
            VQ.$('#srDesc').innerHTML = s.q ? t('srFor', { q: esc(s.q) }) : t('srHint');
            VQ.$('#srTabs').innerHTML = ui.tabs({ name: 'type', active: s.type, items: FILTERS.map(f => ({ value: f.value, label: t(f.key), icon: f.icon })) });
            VQ.$('#results').innerHTML = `<p class="search-summary"><span>${t('srCount', { n: items.length })}</span></p>` +
                (items.length ? items.map(result).join('') : ui.emptyState());
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'srQ') { s.q = e.target.value; syncUrl(); this.update(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) { s.type = chip.dataset.value; syncUrl(); this.update(); }
            });
        }
    });
})();
