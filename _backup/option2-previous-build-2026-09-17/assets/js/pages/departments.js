/* Departments — BRD 7.1 & 8.1 (same scope as Option 1: search · department select · folders & files · view only) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = {
        dept: D.departments.some(d => d.key === VQ.param('dept')) ? VQ.param('dept') : D.departments[0].key,
        folder: null,
        q: ''
    };

    const current = () => VQ.dept(s.dept);

    function folderTile(f) {
        return `<button type="button" data-folder="${f.key}" class="folder-item">
            <i class="fa-solid fa-folder"></i>
            <span><span class="folder-name">${esc(tx(f.name))}</span><span class="folder-count">${t('plFiles', { n: f.files.length })}</span></span>
        </button>`;
    }

    function filesTable(files) {
        return `<div class="table-scroll">
            <table class="data-table">
                <thead><tr><th>${t('plFileName')}</th><th>${t('date')}</th><th class="col-center">${t('view')}</th></tr></thead>
                <tbody>${files.map(f => {
                    const icon = VQ.fileIcon(f.name);
                    return `<tr>
                        <td><button type="button" data-file="${esc(f.name)}" class="file-title">
                            <i class="fa-solid ${icon.icon} ${icon.color} file-ico"></i>
                            <span><span dir="ltr">${esc(f.name)}</span><small class="file-sub">${icon.ext} · <span dir="ltr">${f.size}</span></small></span>
                        </button></td>
                        <td class="col-muted col-nowrap">${VQ.fmtDate(f.date, 'short')}</td>
                        <td class="col-center"><button type="button" data-file="${esc(f.name)}" class="icon-btn" title="${t('view')}" aria-label="${t('view')}"><i class="fa-regular fa-eye"></i></button></td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div>`;
    }

    function browser() {
        const d = current();
        const folder = s.folder && d.folders.find(f => f.key === s.folder);
        const q = s.q.trim().toLowerCase();

        let folders = folder ? [] : d.folders;
        let files = folder ? folder.files : d.files;
        if (q) {
            folders = d.folders.filter(f => (f.name.ar + ' ' + f.name.en).toLowerCase().includes(q));
            files = d.files.concat(...d.folders.map(f => f.files)).filter(f => f.name.toLowerCase().includes(q));
        }

        const crumbs = `<nav class="folder-path">
            <button type="button" data-folder="" class="${folder ? '' : 'is-current'}"><i class="fa-solid fa-house-chimney"></i>${esc(tx(d.name))}</button>
            ${folder ? `<i class="fa-solid fa-chevron-left dir-icon"></i><span class="is-current">${esc(tx(folder.name))}</span>` : ''}
        </nav>`;

        const body = !folders.length && !files.length
            ? `<div class="empty-inline"><i class="fa-regular fa-folder-open"></i>${t('dpEmpty')}</div>`
            : (folders.length ? `<p class="group-label">${t('dpFolders')}</p><div class="folder-grid">${folders.map(folderTile).join('')}</div>` : '') +
              (files.length ? `<p class="group-label">${t('dpFiles')}</p>${filesTable(files)}` : '');

        return `<div class="dept-browser">
            <div class="dept-head">
                <span class="dept-icon"><i class="fa-solid ${d.icon}"></i></span>
                <div><h2 class="dept-name">${esc(tx(d.name))}</h2><p class="dept-desc">${esc(tx(d.description))}</p></div>
            </div>
            ${crumbs}
            <div class="dept-body">${body}</div>
        </div>`;
    }

    VQ.boot({
        title: () => t('dpTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('dpTitle'), desc: t('dpDesc'), crumbs: [{ label: t('navDepts') }] }) +
                ui.toolbar([
                    ui.row(
                        ui.searchInput({ id: 'dpQ', value: s.q, placeholder: t('dpSearch') }) +
                        ui.select({ id: 'dpDept', value: s.dept, label: t('dpSections'), options: D.departments.map(d => ({ value: d.key, label: tx(d.name) })) })
                    )
                ]) +
                `<div id="dpBrowser">${browser()}</div>`
            );
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'dpQ') { s.q = e.target.value; VQ.$('#dpBrowser').innerHTML = browser(); }
            });
            root.addEventListener('change', e => {
                if (e.target.id === 'dpDept') { s.dept = e.target.value; s.folder = null; VQ.$('#dpBrowser').innerHTML = browser(); }
            });
            root.addEventListener('click', e => {
                const folder = e.target.closest('[data-folder]');
                if (folder) {
                    s.folder = folder.dataset.folder || null;
                    s.q = '';
                    VQ.$('#dpQ').value = '';
                    VQ.$('#dpBrowser').innerHTML = browser();
                    return;
                }
                const file = e.target.closest('[data-file]');
                if (file) {
                    const name = file.dataset.file;
                    ui.openDocument({
                        title: name, fileName: name, pages: 3,
                        content: ui.docLetterhead(`<span dir="ltr">${esc(name)}</span>`, esc(tx(current().name))) + ui.docSkeleton(4)
                    });
                }
            });
        }
    });
})();
