/* General Policies, Procedures & Forms — BRD 7.8 & 8.11
   Same components as Option 1: upload area · search + type + download · document table (select · name · description ·
   modified · download · edit) · 6 per page. Upload, download and edit are visual only. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', category: 'all', page: 1, selected: new Set() };
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

    function uploadArea() {
        return `<div id="plUpload" class="upload-zone">
            <span class="upload-icon"><i class="fa-solid fa-cloud-arrow-up"></i></span>
            <p class="upload-title">${t('plUploadDrag')}</p>
            <div class="upload-actions">
                <span class="upload-or">${t('or')}</span>
                <label class="${ui.BTN.secondary} btn-sm">
                    <input type="file" id="plFile" class="sr-only">${t('plBrowse')}
                </label>
            </div>
        </div>`;
    }

    function docRow(d) {
        const f = VQ.fileIcon(d.ext);
        return `<tr>
            <td class="col-check"><input type="checkbox" data-select="${d.id}" ${s.selected.has(d.id) ? 'checked' : ''} aria-label="${t('plSelect')}"></td>
            <td><button type="button" data-doc="${d.id}" class="file-title"><i class="fa-solid ${f.icon} ${f.color} file-ico"></i><span>${esc(tx(d.title))}</span></button></td>
            <td class="col-muted">${esc(tx(d.summary))}</td>
            <td class="col-muted col-nowrap">${VQ.fmtDate(d.updated, 'long')}</td>
            <td class="col-center"><button type="button" data-download="${d.id}" class="icon-btn" title="${t('plDownloadFile')}" aria-label="${t('plDownloadFile')}"><i class="fa-solid fa-download"></i></button></td>
            <td class="col-center"><button type="button" data-edit="${d.id}" class="icon-btn" title="${t('plEditFile')}" aria-label="${t('plEditFile')}"><i class="fa-regular fa-pen-to-square"></i></button></td>
        </tr>`;
    }

    function table(items) {
        return `<div class="table-scroll">
            <table class="data-table data-table--docs">
                <thead><tr>
                    <th class="col-check"></th>
                    <th>${t('plFileName')}</th><th>${t('plDescription')}</th><th>${t('plModified')}</th>
                    <th class="col-center">${t('plDownloadFile')}</th><th class="col-center">${t('plEditFile')}</th>
                </tr></thead>
                <tbody>${items.map(docRow).join('')}</tbody>
            </table>
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
                `<div class="doc-meta">
                    <span>${t('plOwner')}: <b>${VQ.deptName(d.department)}</b></span>
                    <span>${t('updated')}: <b>${VQ.fmtDate(d.updated)}</b></span>
                    <span>${t('pagesCount', { n: d.pages })}</span>
                </div>` + ui.docSkeleton(5)
        });
    }

    VQ.boot({
        title: () => t('plTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('plTitle'), desc: t('plDesc'), crumbs: [{ label: t('navPolicies') }] }) +
                uploadArea() +
                ui.toolbar([
                    ui.row(
                        ui.searchInput({ id: 'plQ', value: s.q, placeholder: t('plSearch') }) +
                        ui.select({ id: 'plType', value: s.category, label: t('type'), options: [{ value: 'all', label: t('plAllTypes') }]
                            .concat(D.policyCategories.map(c => ({ value: c.key, label: tx(c.label) }))) }) +
                        `<button type="button" id="plDownload" class="${ui.BTN.primary}"><i class="fa-solid fa-download"></i>${t('download')}</button>`
                    )
                ]) +
                `<div id="results" class="results"></div>`
            );
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.resultsBar(items.length) + (items.length
                ? table(slice) + ui.pagination(s.page, pages)
                : ui.emptyState('fa-folder-open'));
        },

        setup(root) {
            const zone = e => e.target.closest && e.target.closest('#plUpload');
            const chosen = file => { if (file) VQ.toast(t('plUploadDemo', { name: file.name }), 'fa-cloud-arrow-up'); };

            root.addEventListener('input', e => {
                if (e.target.id === 'plQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('change', e => {
                if (e.target.id === 'plType') { s.category = e.target.value; s.page = 1; this.update(); }
                if (e.target.id === 'plFile') { chosen(e.target.files[0]); e.target.value = ''; }
                if (e.target.matches('[data-select]')) {
                    if (e.target.checked) s.selected.add(e.target.dataset.select);
                    else s.selected.delete(e.target.dataset.select);
                }
            });
            root.addEventListener('dragover', e => {
                e.preventDefault();
                const z = VQ.$('#plUpload');
                if (z) z.classList.toggle('is-dragover', !!zone(e));
            });
            root.addEventListener('dragleave', e => { if (zone(e)) VQ.$('#plUpload').classList.remove('is-dragover'); });
            root.addEventListener('drop', e => {
                e.preventDefault();
                VQ.$('#plUpload').classList.remove('is-dragover');
                if (zone(e)) chosen(e.dataTransfer.files[0]);
            });
            root.addEventListener('click', e => {
                const doc = e.target.closest('[data-doc]');
                if (doc) { openDoc(doc.dataset.doc); return; }
                const dl = e.target.closest('[data-download]');
                if (dl) { VQ.toast(t('plDownloadDemo', { name: tx(docOf(dl.dataset.download).title) }), 'fa-download'); return; }
                const edit = e.target.closest('[data-edit]');
                if (edit) { VQ.toast(t('plEditDemo', { name: tx(docOf(edit.dataset.edit).title) }), 'fa-pen-to-square'); return; }
                if (e.target.closest('#plDownload')) {
                    VQ.toast(s.selected.size ? t('plDownloadSelected', { n: s.selected.size }) : t('plSelectFirst'), s.selected.size ? 'fa-download' : 'fa-circle-info');
                    return;
                }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); VQ.$('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
            });
        },

        afterBoot() {
            if (VQ.param('doc')) openDoc(VQ.param('doc'));
        }
    });
})();
