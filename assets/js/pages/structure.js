/* Visit Qatar Structure & Guide — BRD 6.10 & 8.16 (illustrative chart) · SPFx DetailsPage vocabulary
   Opened from the side panel; not a menu item (as in Option 1) */
(function () {
    const { t, tx, esc, ui, D } = VQ;

    function chart() {
        return `<div class="org-chart">
            <div class="org-root"><i class="fa-solid fa-user-tie"></i><strong>${t('stCeo')}</strong><span>Visit Qatar</span></div>
            <div class="org-level">
                ${D.departments.map(d => `<a href="${VQ.href('departments', { dept: d.key })}" class="org-node"><i class="fa-solid ${d.icon}"></i><span>${esc(tx(d.name))}</span></a>`).join('')}
            </div>
        </div>`;
    }

    function openFile() {
        ui.openDocument({
            title: t('stTitle'),
            fileName: 'VQ-Organizational-Structure.pdf',
            pages: 1,
            content: ui.docLetterhead(t('stChart'), 'Visit Qatar') + `<div style="padding:1.5rem">${chart()}</div>`
        });
    }

    VQ.boot({
        title: () => t('stTitle'),

        render() {
            VQ.content(ui.page([{ label: t('navStructure') }],
                ui.pageHead({
                    title: t('stTitle'), desc: t('stDesc'),
                    actions: `<button type="button" class="btn btn-primary" data-open-file><i class="fa-solid fa-file-pdf"></i>${t('stOpenFile')}</button>`
                }) +
                ui.section(
                    ui.sectionHead({ title: t('stChart'), tools: ui.sampleBadge() }) +
                    chart() +
                    `<p class="chart-note"><i class="fa-solid fa-circle-info"></i>${t('stNote')}</p>`
                )
            ));
        },

        setup(root) {
            root.addEventListener('click', e => {
                if (e.target.closest('[data-open-file]')) openFile();
            });
        }
    });
})();
