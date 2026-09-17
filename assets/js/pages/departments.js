/* Departments — BRD 7.1 & 8.1 · SPFx SharedFolder / DocumentLibrary
   Department tabs · search within the department · folder rows · files table (view only) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = {
        dept: D.departments.some(d => d.key === VQ.param('dept')) ? VQ.param('dept') : D.departments[0].key,
        folder: null,
        q: ''
    };

    const current = () => VQ.dept(s.dept);

    function filesTable(files) {
        return `<div class="hotlines-tabs-container" style="overflow-x:auto"><table class="data-table">
            <thead><tr><th>${t('dpName')}</th><th>${t('dpSize')}</th><th>${t('dpModified')}</th><th class="col-actions"><span class="sr-only">${t('plActions')}</span></th></tr></thead>
            <tbody>${files.map(f => {
                const ic = VQ.fileIcon(f.name);
                return `<tr>
                    <td><button type="button" class="file-title" data-file="${esc(f.name)}"><i class="fa-solid ${ic.icon}" style="color:${ic.color}"></i><span class="ltr">${esc(f.name)}</span></button></td>
                    <td class="ltr" style="white-space:nowrap">${f.size}</td>
                    <td style="white-space:nowrap">${VQ.fmtDate(f.date, 'short')}</td>
                    <td><span class="row-actions"><button type="button" class="icon-btn" data-file="${esc(f.name)}" title="${t('view')}" aria-label="${t('view')}"><i class="fa-regular fa-eye"></i></button></span></td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
    }

    function library() {
        const d = current();
        const folder = s.folder && d.folders.find(f => f.key === s.folder);
        const q = s.q.trim().toLowerCase();

        let folders = folder ? [] : d.folders;
        let files = folder ? folder.files : d.files;
        if (q) {
            /* Search the whole department, including files inside folders */
            folders = d.folders.filter(f => (f.name.ar + ' ' + f.name.en).toLowerCase().includes(q));
            files = d.files.concat(...d.folders.map(f => f.files)).filter(f => f.name.toLowerCase().includes(q));
        }

        const crumbs = q
            ? `<span class="crumb-current">${t('dpAllFiles')}</span>`
            : folder
                ? `<button type="button" data-folder="">${t('dpRoot')}</button><span class="crumb-sep">/</span><span class="crumb-current">${esc(tx(folder.name))}</span>`
                : `<span class="crumb-current"><i class="fa-regular fa-folder-open" style="color:var(--vq-teal);margin-inline-end:.35rem"></i>${t('dpRoot')}</span>`;

        const body = !folders.length && !files.length
            ? ui.emptyState('fa-folder-open')
            : (folders.length ? `<p class="library-label">${t('dpFolders')}</p><div class="folder-list">${folders.map(f => `<button type="button" class="folder-row" data-folder="${f.key}">
                    <i class="fa-solid fa-folder"></i><span class="folder-name">${esc(tx(f.name))}</span><span class="folder-count">${t('plFiles', { n: f.files.length })}</span><i class="fa-solid fa-chevron-left dir-flip"></i>
                </button>`).join('')}</div>` : '') +
              (files.length ? `<p class="library-label">${t('dpFiles')}</p>${filesTable(files)}` : '');

        return `<div class="library-intro">
                <span class="lib-icon"><i class="fa-solid ${d.icon}"></i></span>
                <div><h3>${esc(tx(d.name))}</h3><p>${esc(tx(d.description))}</p></div>
            </div>
            <nav class="breadcrumb-bar" aria-label="${t('dpFolders')}">${crumbs}</nav>
            ${body}`;
    }

    VQ.boot({
        title: () => t('dpTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navDepts') }],
                ui.pageHead({ title: t('dpTitle'), desc: t('dpDesc') }) +
                ui.filterBar([
                    ui.tabs({ name: 'dept', active: s.dept, label: t('dpSections'), items: D.departments.map(d => ({ value: d.key, label: tx(d.name), icon: d.icon })) }),
                    ui.filters(ui.searchField({ id: 'dpQ', value: s.q, placeholder: t('dpSearch') }))
                ]) +
                `<div id="library">${library()}</div>`
            ));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'dpQ') { s.q = e.target.value; VQ.$('#library').innerHTML = library(); }
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip="dept"]');
                if (chip) { s.dept = chip.dataset.value; s.folder = null; s.q = ''; this.render(); return; }
                const folder = e.target.closest('[data-folder]');
                if (folder) {
                    s.folder = folder.dataset.folder || null;
                    s.q = '';
                    VQ.$('#dpQ').value = '';
                    VQ.$('#library').innerHTML = library();
                    return;
                }
                const file = e.target.closest('[data-file]');
                if (file) {
                    const name = file.dataset.file;
                    ui.openDocument({
                        title: name, fileName: name, pages: 3,
                        content: ui.docLetterhead(`<span class="ltr">${esc(name)}</span>`, esc(tx(current().name))) + ui.docSkeleton(4)
                    });
                }
            });
        }
    });
})();
