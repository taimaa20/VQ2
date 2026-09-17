/* Visit Qatar Structure & Guide — BRD 6.10 & 8.16 (same content as Option 1: open file · illustrative chart) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    function node(d) {
        return `<a href="${VQ.href('departments', { dept: d.key })}" class="org-node">
            <i class="fa-solid ${d.icon}"></i><span>${esc(tx(d.name))}</span>
        </a>`;
    }

    function chart() {
        return `<div class="org-chart">
            <div class="org-node org-node--root">
                <i class="fa-solid fa-user-tie"></i><span>${t('stCeo')}</span><small>Visit Qatar</small>
            </div>
            <span class="org-stem"></span>
            <div class="org-row">${D.departments.map(node).join('')}</div>
        </div>`;
    }

    function openFile() {
        ui.openDocument({
            title: t('stTitle'),
            fileName: 'VQ-Organizational-Structure.pdf',
            pages: 1,
            content: ui.docLetterhead(t('stChart'), 'Visit Qatar') + `<div class="doc-chart">${chart()}</div>`
        });
    }

    VQ.boot({
        title: () => t('stTitle'),

        render() {
            VQ.content(
                ui.pageHeader({
                    title: t('stTitle'), desc: t('stDesc'), crumbs: [{ label: t('navStructure') }],
                    actions: `<button type="button" data-open-file class="${ui.BTN.primary}"><i class="fa-solid fa-file-pdf"></i>${t('stOpenFile')}</button>`
                }) +
                ui.sectionCard({
                    title: t('stChart'), icon: 'fa-sitemap',
                    extra: ui.sampleBadge(),
                    body: chart() + `<p class="muted-note"><i class="fa-solid fa-circle-info"></i>${t('stNote')}</p>`
                })
            );
        },

        setup(root) {
            root.addEventListener('click', e => {
                if (e.target.closest('[data-open-file]')) openFile();
            });
        }
    });
})();
