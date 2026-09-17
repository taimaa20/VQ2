/* User Guide for each system — BRD 6.11 & 8.9 · built with the SPFx AdsPage vocabulary (tabs + card grid)
   Option 1 coverage: search · filter by system · illustrated steps, videos and external links · 6 per page */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', system: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const sysOf = key => D.guideSystems.find(x => x.key === key);
    const KIND = {
        video: { icon: 'fa-circle-play', label: () => t('ugVideo'), variant: 'ruby' },
        image: { icon: 'fa-images', label: () => t('ugImage'), variant: '' },
        link: { icon: 'fa-arrow-up-right-from-square', label: () => t('ugLink'), variant: 'amber' }
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
        const overlay = g.kind === 'video'
            ? `<span class="card-play"><i class="fa-solid fa-play"></i></span><span class="card-length ltr">${g.length}</span>`
            : g.kind === 'image' ? `<span class="card-length"><i class="fa-solid fa-list-ol"></i> ${g.steps.length}</span>` : '';
        return ui.listingCard({
            tagName: 'button',
            cls: 'is-link',
            attrs: `type="button" data-guide="${g.id}" style="text-align:start;width:100%"`,
            image: g.image,
            overlay,
            chips: ui.tag(kind.label(), kind.variant, kind.icon) + ui.tag(esc(tx(sys.name)), 'outline', sys.icon),
            title: esc(tx(g.title)),
            desc: esc(tx(g.description)),
            button: t('open')
        });
    }

    function openGuide(id) {
        const g = D.guides.find(x => x.id === id);
        if (!g) return;
        const sys = sysOf(g.system);
        let body;

        if (g.kind === 'video') {
            body = ui.videoPlayer({ poster: g.image, title: tx(g.title), length: g.length }) +
                `<p class="details-desc" style="margin-top:1rem">${esc(tx(g.description))}</p>`;
        } else if (g.kind === 'image') {
            body = `<p class="details-desc" style="margin-bottom:.9rem">${esc(tx(g.description))}</p>
                <ol class="guide-steps">${g.steps.map((step, i) => `<li>
                    <div class="guide-shot">${VQ.img(g.image, '', 500)}<b style="top:${22 + i * 14}%;left:${18 + i * 16}%"></b></div>
                    <div class="guide-step"><span class="guide-step-num">${i + 1}</span><div><small>${t('ugStep', { n: i + 1 })}</small><p>${esc(tx(step))}</p></div></div>
                </li>`).join('')}</ol>`;
        } else {
            body = `<div class="external-note">
                <span class="ext-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>
                <h4>${esc(tx(g.title))}</h4><p>${esc(tx(g.description))}</p>
                <p class="form-note" style="margin-top:1rem;justify-content:center"><i class="fa-solid fa-circle-info"></i>${t('ugExternalNote')}</p>
            </div>`;
        }

        VQ.openModal({
            title: esc(tx(g.title)),
            size: g.kind === 'link' ? 'md' : null,
            body,
            footer: `<span class="foot-start">${ui.tag(esc(tx(sys.name)), '', sys.icon)}</span>
                <a href="${sys.url}" target="_blank" rel="noopener noreferrer" class="btn ${g.kind === 'link' ? 'btn-primary' : 'btn-outline'} btn-sm">${g.kind === 'link' ? t('ugOpenLink') : t('ugOpenSystem')} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`
        });
    }

    VQ.boot({
        title: () => t('ugTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navUserGuide') }],
                ui.pageHead({ title: t('ugTitle'), desc: t('ugDesc') }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'ugQ', value: s.q, placeholder: t('ugSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'system', active: s.system, label: t('ugAllSystems'), items: [{ value: 'all', label: t('ugAllSystems') }]
                        .concat(D.guideSystems.map(x => ({ value: x.key, label: tx(x.name), icon: x.icon }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navUserGuide'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-book-open'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'ugQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', system: 'all', page: 1 }); this.render(); return; }
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const guide = e.target.closest('[data-guide]');
                if (guide) { openGuide(guide.dataset.guide); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        },

        afterBoot() {
            if (VQ.param('id')) openGuide(VQ.param('id'));
        }
    });
})();
