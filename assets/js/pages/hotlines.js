/* Hotlines — BRD 6.12, 7.10 & 8.10 · SPFx HotlinesPage
   Search · two tabs (general emergency numbers / persons in charge) · one bordered table · copy & call */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const H = D.hotlines;
    const s = { q: '', tab: 'general' };

    const matches = (...parts) => {
        const q = s.q.trim().toLowerCase().replace(/\s/g, '');
        return !q || parts.join(' ').toLowerCase().replace(/\s/g, '').includes(q);
    };

    const actions = number => `<span class="row-actions">
        <button type="button" class="icon-btn" data-copy="${number}" title="${t('hlCopy')}" aria-label="${t('hlCopy')}"><i class="fa-regular fa-copy"></i></button>
        <a href="tel:${number.replace(/\s/g, '')}" class="icon-btn" title="${t('hlCall')}" aria-label="${t('hlCall')}"><i class="fa-solid fa-phone"></i></a>
    </span>`;

    function table(heads, rows) {
        return `<div style="overflow-x:auto"><table class="data-table">
            <thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}<th class="col-actions"><span class="sr-only">${t('plActions')}</span></th></tr></thead>
            <tbody>${rows.join('')}</tbody>
        </table></div>`;
    }

    VQ.boot({
        title: () => t('hlTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navHotlines') }],
                ui.pageHead({ title: t('hlTitle'), desc: t('hlDesc') }) +
                ui.filterBar([ui.filters(ui.searchField({ id: 'hlQ', value: s.q, placeholder: t('hlSearch') }))]) +
                `<div class="hotlines-tabs-container">
                    ${ui.underlineTabs({ name: 'tab', active: s.tab, items: [
                        { value: 'general', label: t('hlTabGeneral') },
                        { value: 'responsible', label: t('hlTabResponsible') }
                    ] })}
                    <div id="results"></div>
                </div>`
            ));
            this.update();
        },

        update() {
            let html = '';
            if (s.tab === 'general') {
                const rows = H.general.filter(r => matches(r.service.ar, r.service.en, r.number));
                if (rows.length) html = table([t('hlService'), t('hlServiceNumber')], rows.map(r => `<tr>
                    <td>${esc(tx(r.service))}</td><td class="number"><span class="ltr">${r.number}</span></td><td>${actions(r.number)}</td>
                </tr>`));
            } else {
                const rows = H.responsible.filter(r => matches(r.department.ar, r.department.en, r.role.ar, r.role.en, r.number));
                if (rows.length) html = table([t('department'), t('hlResponsible'), t('hlNumber')], rows.map(r => `<tr>
                    <td>${esc(tx(r.department))}</td><td>${esc(tx(r.role))}</td><td class="number"><span class="ltr">${r.number}</span></td><td>${actions(r.number)}</td>
                </tr>`));
            }
            VQ.$('#results').innerHTML = html || `<div style="padding:1rem">${ui.emptyState('fa-headset')}</div>`;
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'hlQ') { s.q = e.target.value; this.update(); }
            });
            root.addEventListener('click', e => {
                const tab = e.target.closest('[data-chip="tab"]');
                if (tab) {
                    s.tab = tab.dataset.value;
                    VQ.$$('.hotlines-tab').forEach(el => { const on = el === tab; el.classList.toggle('active', on); el.setAttribute('aria-selected', String(on)); });
                    this.update();
                }
            });
        }
    });
})();
