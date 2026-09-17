/* Visit Qatar Certificates — BRD 7.6 & 8.8 · SPFx AdsPage (MinistryCertificates → Certificates list) as a card grid
   Option 1 coverage: search by title · newest first · certificate date · view the certificate (static preview) · 6 per page */
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

    /* Certificate artwork drawn in HTML */
    const visual = c => `<div class="cert-visual"><div class="cert-paper">
        <small>CERTIFICATE</small><i class="fa-solid ${c.icon}"></i><strong>${c.standard}</strong><span>${c.title.en}</span>
    </div></div>`;

    function card(c) {
        return ui.listingCard({
            tagName: 'button',
            attrs: `type="button" data-cert="${c.id}" style="text-align:start;width:100%"`,
            cls: 'is-link',
            imageHTML: visual(c),
            date: c.date,
            chips: ui.tag(c.body, 'outline', 'fa-stamp'),
            title: t('ctCardTitle', { s: `<span class="ltr">${c.standard}</span>` }),
            desc: esc(tx(c.title)),
            button: `<i class="fa-regular fa-eye"></i> ${t('ctView')}`
        });
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
            content: `<div class="cert-doc"><div class="cert-frame">
                <p class="c-body">${c.body.toUpperCase()}</p>
                <h4>CERTIFICATE</h4>
                <p class="c-text">This is to certify that the management system of</p>
                <p class="c-org">Visit Qatar</p>
                <p class="c-text">has been audited and found to be in accordance with the requirements of the management system standard</p>
                <p class="c-std">${c.standard}</p>
                <p class="c-text" style="margin-top:.25rem">${c.title.en}</p>
                <div class="c-scope"><b style="font-size:.65rem;letter-spacing:.08em;color:var(--faint)">SCOPE OF CERTIFICATION</b><br>${scope.en}</div>
                <div class="c-foot"><div>Certificate date<br><b style="color:var(--ink);font-size:.8rem">${dateEn}</b></div><span class="c-seal"><i class="fa-solid fa-award"></i></span></div>
            </div></div>`
        });
    }

    VQ.boot({
        title: () => t('ctTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navCerts') }],
                ui.pageHead({ title: t('ctTitle'), desc: t('ctDesc') }) +
                ui.filterBar([ui.filters(ui.searchField({ id: 'ctQ', value: s.q, placeholder: t('ctSearch') }) + ui.clearButton())]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navCerts'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="listing-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-certificate'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'ctQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', page: 1 }); this.render(); return; }
                const btn = e.target.closest('[data-cert]');
                if (btn) { openCertificate(btn.dataset.cert); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        },

        afterBoot() {
            if (VQ.param('cert')) openCertificate(VQ.param('cert'));
        }
    });
})();
