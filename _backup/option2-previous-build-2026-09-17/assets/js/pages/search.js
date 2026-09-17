/* Search results — BRD 5.1.6 (same scope as Option 1: keyword · type filter across the static data) */
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
        const params = new URLSearchParams();
        if (s.q) params.set('q', s.q);
        if (s.type !== 'all') params.set('type', s.type);
        history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : ''));
    }

    function row(item) {
        const typeLabel = t(FILTERS.find(f => f.value === item.type).key);
        return `<a href="${item.url}" class="result-item">
            <span class="result-icon ${item.color}"><i class="fa-solid ${item.icon}"></i></span>
            <span class="result-text"><b>${esc(item.title)}</b><small>${esc(item.meta)}</small></span>
            <span class="result-type">${ui.tag(typeLabel, 'slate')}</span>
            ${ui.arrow('result-arrow')}
        </a>`;
    }

    VQ.boot({
        title: () => t('srTitle'),

        render() {
            VQ.content(
                ui.pageHeader({
                    title: t('srTitle'), crumbs: [{ label: t('navSearch') }],
                    desc: `<span id="srDesc">${s.q ? t('srFor', { q: esc(s.q) }) : t('srHint')}</span>`
                }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'srQ', value: s.q, placeholder: t('searchPlaceholder') })),
                    `<div id="srChips"></div>`
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const all = VQ.searchItems(s.q, 'all');
            const items = s.type === 'all' ? all : all.filter(i => i.type === s.type);
            VQ.$('#srChips').innerHTML = ui.chips({
                name: 'type', active: s.type,
                items: FILTERS.map(f => ({ value: f.value, label: t(f.key), icon: f.icon }))
            });
            VQ.$('#srDesc').innerHTML = s.q ? t('srFor', { q: esc(s.q) }) : t('srHint');
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="result-list">${items.map(row).join('')}</div>`
                : ui.emptyState());
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
