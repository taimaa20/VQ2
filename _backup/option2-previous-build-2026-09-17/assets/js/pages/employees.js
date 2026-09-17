/* Employee Information — BRD 7.9 (same scope as Option 1: search · department · cards · profile · 6 per page) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { q: '', department: 'all', page: 1 };
    const PAGE_SIZE = 6;

    function filtered() {
        const q = s.q.trim().toLowerCase();
        return D.employees
            .filter(p => s.department === 'all' || p.department === s.department)
            .filter(p => !q || (p.name.ar + ' ' + p.name.en + ' ' + p.id + ' ' + p.position.ar + ' ' + p.position.en).toLowerCase().includes(q));
    }

    /* SPFx EmployeesPhonebook contact card */
    function card(p) {
        return `<div class="contact-card">
            <button type="button" data-person="${p.id}" class="contact-main">
                ${ui.avatar(p, 'contact-photo')}
                <span class="contact-info">
                    <span class="contact-name">${esc(tx(p.name))}</span>
                    <span class="contact-position">${esc(tx(p.position))}</span>
                </span>
            </button>
            <div class="chip-row">
                ${ui.tag(VQ.deptName(p.department), 'teal', 'fa-building')}
                ${ui.tag(`<span dir="ltr">${p.id}</span>`, 'slate', 'fa-id-badge')}
            </div>
            <div class="contact-foot">
                <button type="button" data-person="${p.id}" class="more-link">${t('emProfile')}${ui.arrow()}</button>
            </div>
        </div>`;
    }

    function openProfile(id) {
        const p = D.employees.find(x => x.id === id);
        if (!p) return;
        VQ.openModal({
            title: t('emProfile'), icon: 'fa-id-card', size: 'sm',
            body: `<div class="profile-sheet">
                <div class="profile-sheet-head">
                    ${ui.avatar(p, 'avatar--xl')}
                    <p class="profile-sheet-name">${esc(tx(p.name))}</p>
                    <p class="profile-sheet-position">${esc(tx(p.position))}</p>
                </div>
                ${ui.infoList([
                    { icon: 'fa-id-badge', label: t('emId'), value: `<span dir="ltr">${p.id}</span>` },
                    { icon: 'fa-briefcase', label: t('emPosition'), value: esc(tx(p.position)) },
                    { icon: 'fa-building', label: t('department'), value: VQ.deptName(p.department) }
                ])}
                <p class="profile-sheet-note"><i class="fa-solid fa-arrows-rotate"></i>${t('emSource')}</p>
            </div>`
        });
    }

    VQ.boot({
        title: () => t('emTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('emTitle'), desc: t('emDesc'), crumbs: [{ label: t('navEmployees') }], badge: ui.sampleBadge() }) +
                ui.toolbar([
                    ui.row(
                        ui.searchInput({ id: 'emQ', value: s.q, placeholder: t('emSearch') }) +
                        ui.select({ id: 'emDept', value: s.department, label: t('department'), options: [{ value: 'all', label: t('evAllDepartments') }]
                            .concat(D.departments.map(d => ({ value: d.key, label: tx(d.name) }))) })
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
                ? `<div class="card-grid card-grid--2">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-user'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'emQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('change', e => {
                if (e.target.id === 'emDept') { s.department = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                const person = e.target.closest('[data-person]');
                if (person) { openProfile(person.dataset.person); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg && !pg.disabled) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        },

        afterBoot() {
            if (VQ.param('id')) openProfile(VQ.param('id'));
        }
    });
})();
