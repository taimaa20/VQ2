/* Visit Qatar Certificates — BRD 7.6 & 8.8 (same scope as Option 1: search · cards · certificate opens as a document preview) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', page: 1 };
    const PAGE_SIZE = 6;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.certificates
            .filter(c => !q || (c.standard + ' ' + c.title.ar + ' ' + c.title.en).toLowerCase().includes(q))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function visual(c) {
        return `<span class="cert-paper" dir="ltr">
            <span class="cert-paper-label">CERTIFICATE</span>
            <span class="cert-seal"><i class="fa-solid ${c.icon}"></i></span>
            <span class="cert-paper-std">${c.standard}</span>
            <span class="cert-paper-title">${c.title.en}</span>
            <span class="cert-paper-body"><i class="fa-solid fa-stamp"></i>${c.body}</span>
        </span>`;
    }

    function card(c) {
        return `<div class="tile">
            <button type="button" data-cert="${c.id}" class="cert-visual" aria-label="${t('ctView')}">${visual(c)}</button>
            <div class="tile-body">
                <span class="chip-row">${ui.tag(VQ.fmtDate(c.date), 'slate', 'fa-calendar')}</span>
                <b class="tile-title"><span dir="ltr">${t('ctCardTitle', { s: c.standard })}</span></b>
                <span class="tile-text tile-text--full">${esc(tx(c.title))}</span>
                <button type="button" data-cert="${c.id}" class="${ui.BTN.soft} btn-block tile-action"><i class="fa-regular fa-eye"></i>${t('ctView')}</button>
            </div>
        </div>`;
    }

    function openCertificate(id) {
        const c = D.certificates.find(x => x.id === id);
        if (!c) return;
        const scope = c.scope || D.certificateScopeGeneral;
        const dateEn = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(VQ.toDate(c.date));
        ui.openDocument({
            title: t('ctCardTitle', { s: c.standard }),
            fileName: `${c.standard.replace(/[: ]/g, '-')}-Certificate.pdf`,
            pages: 1,
            content: `<div class="cert-doc" dir="ltr">
                <div class="cert-doc-frame">
                    <p class="cert-doc-body">${c.body.toUpperCase()}</p>
                    <h2 class="cert-doc-heading">CERTIFICATE</h2>
                    <p class="cert-doc-small">This is to certify that the management system of</p>
                    <p class="cert-doc-org">Visit Qatar</p>
                    <p class="cert-doc-small">has been audited and found to be in accordance with the requirements of the management system standard</p>
                    <p class="cert-doc-std">${c.standard}</p>
                    <p class="cert-doc-small">${c.title.en}</p>
                    <div class="cert-doc-scope">
                        <p class="cert-doc-scope-label">Scope of certification</p>
                        <p>${scope.en}</p>
                    </div>
                    <div class="cert-doc-foot">
                        <div><p>Certificate date</p><b>${dateEn}</b></div>
                        <span class="cert-seal cert-seal--lg"><i class="fa-solid fa-award"></i></span>
                    </div>
                </div>
            </div>`
        });
    }

    VQ.boot({
        title: () => t('ctTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('ctTitle'), desc: t('ctDesc'), crumbs: [{ label: t('navCerts') }] }) +
                ui.toolbar([ui.row(ui.searchInput({ id: 'ctQ', value: s.q, placeholder: t('ctSearch') }))]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? `<div class="card-grid card-grid--4">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-certificate'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'ctQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const btn = e.target.closest('[data-cert]');
                if (btn) { openCertificate(btn.dataset.cert); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        },

        afterBoot() {
            if (VQ.param('cert')) openCertificate(VQ.param('cert'));
        }
    });
})();
