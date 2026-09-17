/* User Guide for each system — BRD 6.11 & 8.9 (same scope as Option 1: search · system · cards · guide opens in a dialog) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', system: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const sysOf = key => D.guideSystems.find(x => x.key === key);
    const KIND = {
        video: { icon: 'fa-circle-play', label: () => t('ugVideo'), color: 'solidRuby' },
        image: { icon: 'fa-images', label: () => t('ugImage'), color: 'solidTeal' },
        link: { icon: 'fa-arrow-up-right-from-square', label: () => t('ugLink'), color: 'solidAmber' }
    };

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.guides
            .filter(g => s.system === 'all' || g.system === s.system)
            .filter(g => !q || (g.title.ar + ' ' + g.title.en + ' ' + g.description.ar + ' ' + g.description.en).toLowerCase().includes(q));
    }

    function card(g) {
        const kind = KIND[g.kind];
        const sys = sysOf(g.system);
        return `<button type="button" data-guide="${g.id}" class="tile">
            <span class="tile-media">
                ${VQ.img(g.image, '', 700)}
                <span class="tile-media-start">${ui.tag(kind.label(), kind.color, kind.icon)}</span>
                ${g.kind === 'video' ? `<span class="play-badge"><i class="fa-solid fa-play"></i></span><span class="length-badge" dir="ltr">${g.length}</span>` : ''}
                ${g.kind === 'image' ? `<span class="length-badge"><i class="fa-solid fa-list-ol"></i> ${g.steps.length}</span>` : ''}
            </span>
            <span class="tile-body">
                <span class="chip-row">${ui.tag(esc(tx(sys.name)), 'teal', sys.icon)}</span>
                <b class="tile-title">${esc(tx(g.title))}</b>
                <span class="tile-text">${esc(tx(g.description))}</span>
                <span class="tile-foot tile-foot--end"><span class="more-link">${t('open')}${ui.arrow()}</span></span>
            </span>
        </button>`;
    }

    function openGuide(id) {
        const g = D.guides.find(x => x.id === id);
        if (!g) return;
        const sys = sysOf(g.system);
        let body = '';

        if (g.kind === 'video') {
            body = `<div class="modal-pad">${ui.videoPlayer({ poster: g.image, title: tx(g.title), length: g.length })}
                <p class="modal-text">${esc(tx(g.description))}</p></div>`;
        } else if (g.kind === 'image') {
            /* One continuous procedure: description, then numbered steps separated by dividers */
            body = `<div class="modal-pad">
                <p class="modal-text modal-text--intro">${esc(tx(g.description))}</p>
                <ol class="steps">${g.steps.map((step, i) => `<li class="step">
                    <span class="step-shot">${VQ.img(g.image, '', 500)}<span class="step-highlight" style="top:${22 + i * 14}%;inset-inline-start:${18 + i * 16}%"></span></span>
                    <span class="step-num">${i + 1}</span>
                    <span class="step-copy"><small>${t('ugStep', { n: i + 1 })}</small><b>${esc(tx(step))}</b></span>
                </li>`).join('')}</ol>
            </div>`;
        } else {
            body = `<div class="modal-pad link-sheet">
                <span class="link-sheet-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                <p class="link-sheet-title">${esc(tx(g.title))}</p>
                <p class="modal-text">${esc(tx(g.description))}</p>
                <p class="muted-note"><i class="fa-solid fa-circle-info"></i>${t('ugExternalNote')}</p>
            </div>`;
        }

        VQ.openModal({
            title: esc(tx(g.title)), icon: KIND[g.kind].icon, size: g.kind === 'link' ? 'sm' : 'lg',
            body,
            footer: `<span class="modal-foot-start">${ui.tag(esc(tx(sys.name)), 'teal', sys.icon)}</span>
                <a href="${sys.url}" target="_blank" rel="noopener noreferrer" class="${g.kind === 'link' ? ui.BTN.primary : ui.BTN.secondary}">
                    ${g.kind === 'link' ? t('ugOpenLink') : t('ugOpenSystem')} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
        });
    }

    VQ.boot({
        title: () => t('ugTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('ugTitle'), desc: t('ugDesc'), crumbs: [{ label: t('navUserGuide') }] }) +
                ui.toolbar([
                    ui.row(ui.searchInput({ id: 'ugQ', value: s.q, placeholder: t('ugSearch') })),
                    ui.chips({ name: 'system', active: s.system, items: [{ value: 'all', label: t('ugAllSystems') }]
                        .concat(D.guideSystems.map(x => ({ value: x.key, label: tx(x.name), icon: x.icon }))) })
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
                : ui.emptyState('fa-book-open'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'ugQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const guide = e.target.closest('[data-guide]');
                if (guide) { openGuide(guide.dataset.guide); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        },

        afterBoot() {
            if (VQ.param('id')) openGuide(VQ.param('id'));
        }
    });
})();
