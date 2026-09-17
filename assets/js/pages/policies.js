/* General Policies, Procedures & Forms — BRD 7.8 & 8.11 · SPFx PolicyWebPart (QT document library)
   Search · category · file table (name, description, modified date, view, download) · 6 per page.
   Kept simple on purpose: no upload box, bulk selection, bulk download or edit controls. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1 };
    const PAGE_SIZE = 6;

    const catOf = key => D.policyCategories.find(c => c.key === key);
    const docOf = id => D.policies.find(x => x.id === id);
    const fileName = d => `${d.title.en.replace(/[^A-Za-z0-9]+/g, '-')}.${d.ext}`;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.policies
            .filter(d => s.category === 'all' || d.category === s.category)
            .filter(d => !q || (d.title.ar + ' ' + d.title.en + ' ' + d.summary.ar + ' ' + d.summary.en).toLowerCase().includes(q))
            .sort((a, b) => b.updated.localeCompare(a.updated));
    }

    function row(d) {
        const f = VQ.fileIcon(d.ext);
        return `<div class="file-table-row">
            <button type="button" class="file-title" data-doc="${d.id}"><i class="fa-solid ${f.icon}" style="color:${f.color}"></i><span>${esc(tx(d.title))}<br><span class="tag tag-grey" style="margin-top:.35rem">${tx(catOf(d.category).label)} · ${f.ext}</span></span></button>
            <span class="file-desc">${esc(tx(d.summary))}</span>
            <span class="modified-date">${VQ.fmtDate(d.updated)}</span>
            <span class="file-actions">
                <button type="button" class="icon-btn" data-doc="${d.id}" title="${t('plView')}" aria-label="${t('plView')}"><i class="fa-regular fa-eye"></i></button>
                <button type="button" class="icon-btn" data-download="${d.id}" title="${t('plDownloadFile')}" aria-label="${t('plDownloadFile')}"><i class="fa-solid fa-download"></i></button>
            </span>
        </div>`;
    }

    function openDoc(id) {
        const d = docOf(id);
        if (!d) return;
        ui.openDocument({
            title: tx(d.title),
            fileName: fileName(d),
            pages: d.pages,
            content: ui.docLetterhead(esc(tx(d.title)), `${tx(catOf(d.category).label)} · ${t('version')} ${d.version}`) +
                `<div class="doc-meta"><span>${t('plOwner')}: <b>${VQ.deptName(d.department)}</b></span><span>${t('updated')}: <b>${VQ.fmtDate(d.updated)}</b></span><span>${t('pagesCount', { n: d.pages })}</span></div>` +
                ui.docSkeleton(5)
        });
    }

    VQ.boot({
        title: () => t('plTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navPolicies') }],
                ui.pageHead({ title: t('plTitle'), desc: t('plDesc') }) +
                ui.filterBar([
                    ui.filters(
                        ui.searchField({ id: 'plQ', value: s.q, placeholder: t('plSearch') }) +
                        ui.selectField({ id: 'plType', value: s.category, label: t('type'), options: [{ value: 'all', label: t('plAllTypes') }]
                            .concat(D.policyCategories.map(c => ({ value: c.key, label: tx(c.label) }))) }) +
                        ui.clearButton()
                    )
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navPolicies'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="file-table">
                    <div class="file-table-header"><span>${t('plFileName')}</span><span>${t('plDescription')}</span><span>${t('plModified')}</span><span>${t('plActions')}</span></div>
                    ${slice.map(row).join('')}
                </div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-folder-open'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'plQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('change', e => {
                if (e.target.id === 'plType') { s.category = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', category: 'all', page: 1 }); this.render(); return; }
                const doc = e.target.closest('[data-doc]');
                if (doc) { openDoc(doc.dataset.doc); return; }
                const dl = e.target.closest('[data-download]');
                if (dl) { VQ.toast(t('plDownloadDemo', { name: tx(docOf(dl.dataset.download).title) }), 'fa-download'); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        },

        afterBoot() {
            if (VQ.param('doc')) openDoc(VQ.param('doc'));
        }
    });
})();
