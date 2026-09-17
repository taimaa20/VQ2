/* Hotlines — BRD 6.12, 7.10 & 8.10 (same scope as Option 1: search · two tabs · one table with copy / call) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const H = D.hotlines;
    const s = { q: '', tab: 'general' };

    const matches = (...parts) => {
        const q = s.q.trim().toLowerCase().replace(/\s/g, '');
        return !q || parts.join(' ').toLowerCase().replace(/\s/g, '').includes(q);
    };

    const actions = number => `<span class="row-actions">
        <button type="button" data-copy="${number}" class="icon-btn" title="${t('hlCopy')}" aria-label="${t('hlCopy')}"><i class="fa-regular fa-copy"></i></button>
        <a href="tel:${number.replace(/\s/g, '')}" class="icon-btn" title="${t('hlCall')}" aria-label="${t('hlCall')}"><i class="fa-solid fa-phone"></i></a>
    </span>`;

    function table(heads, rows) {
        return `<div class="table-scroll">
            <table class="data-table">
                <thead><tr>${heads.map(h => `<th>${h}</th>`).join('')}<th class="col-actions"></th></tr></thead>
                <tbody>${rows.join('')}</tbody>
            </table>
        </div>`;
    }

    VQ.boot({
        title: () => t('hlTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('hlTitle'), desc: t('hlDesc'), crumbs: [{ label: t('navHotlines') }] }) +
                ui.toolbar([ui.row(ui.searchInput({ id: 'hlQ', value: s.q, placeholder: t('hlSearch') }))]) +
                ui.tabs({ name: 'tab', active: s.tab, items: [
                    { value: 'general', label: t('hlTabGeneral') },
                    { value: 'responsible', label: t('hlTabResponsible') }
                ] }) +
                `<div id="results" class="results results--flush"></div>`
            );
            this.update();
        },

        update() {
            let html = '';
            if (s.tab === 'general') {
                const rows = H.general.filter(r => matches(r.service.ar, r.service.en, r.number));
                if (rows.length) html = table([t('hlService'), t('hlServiceNumber')], rows.map(r => `<tr>
                    <td>${esc(tx(r.service))}</td>
                    <td class="col-strong col-nowrap"><span dir="ltr">${r.number}</span></td>
                    <td class="col-actions">${actions(r.number)}</td>
                </tr>`));
            } else {
                const rows = H.responsible.filter(r => matches(r.department.ar, r.department.en, r.role.ar, r.role.en, r.number));
                if (rows.length) html = table([t('department'), t('hlResponsible'), t('hlNumber')], rows.map(r => `<tr>
                    <td>${esc(tx(r.department))}</td>
                    <td class="col-muted col-nowrap">${esc(tx(r.role))}</td>
                    <td class="col-strong col-nowrap"><span dir="ltr">${r.number}</span></td>
                    <td class="col-actions">${actions(r.number)}</td>
                </tr>`));
            }
            VQ.$('#results').innerHTML = html || ui.emptyState('fa-headset');
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'hlQ') { s.q = e.target.value; this.update(); }
            });
            root.addEventListener('click', e => {
                const tab = e.target.closest('[data-chip="tab"]');
                if (tab) { s.tab = tab.dataset.value; this.render(); }
            });
        }
    });
})();
