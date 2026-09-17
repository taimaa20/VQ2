/* Employee Information — BRD 7.9 · SPFx EmployeesPhonebook (search · department tabs · contact cards)
   Sample records; in production the data comes from the HR / identity integration. */
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

    function card(p) {
        return `<button type="button" class="contact-card" data-person="${p.id}">
            ${ui.avatar(p)}
            <span class="contact-info">
                <span class="contact-name" style="display:block">${esc(tx(p.name))}</span>
                <span class="position-text" style="display:block">${esc(tx(p.position))}</span>
                <span class="employee-number" style="display:block">${t('emNumber')}: <span class="ltr">${p.id}</span></span>
                <span class="department-chip">${VQ.deptName(p.department)}</span>
            </span>
            <i class="fa-solid fa-chevron-left dir-flip contact-open"></i>
        </button>`;
    }

    function openProfile(id) {
        const p = D.employees.find(x => x.id === id);
        if (!p) return;
        VQ.openModal({
            title: t('emProfile'),
            size: 'sm',
            body: `<div class="profile-sheet">
                ${ui.avatar(p)}
                <h3>${esc(tx(p.name))}</h3>
                <p class="position-text">${esc(tx(p.position))}</p>
                ${ui.facts([
                    { icon: 'fa-id-badge', label: t('emId'), value: `<span class="ltr">${p.id}</span>` },
                    { icon: 'fa-briefcase', label: t('emPosition'), value: esc(tx(p.position)) },
                    { icon: 'fa-building', label: t('department'), value: VQ.deptName(p.department) }
                ])}
                <p class="source-note"><i class="fa-solid fa-arrows-rotate"></i>${t('emSource')}</p>
            </div>`
        });
    }

    VQ.boot({
        title: () => t('emTitle'),

        render() {
            const used = D.departments.filter(d => D.employees.some(p => p.department === d.key));
            VQ.content(ui.page([{ label: t('navEmployees') }],
                ui.pageHead({ title: t('emTitle'), desc: t('emDesc'), badge: ui.sampleBadge() }) +
                ui.filterBar([
                    ui.filters(ui.searchField({ id: 'emQ', value: s.q, placeholder: t('emSearch') }) + ui.clearButton()),
                    ui.tabs({ name: 'department', active: s.department, label: t('department'), items: [{ value: 'all', label: t('evAllDepartments') }]
                        .concat(used.map(d => ({ value: d.key, label: tx(d.name) }))) })
                ]) +
                `<div id="results"></div>`
            ));
            this.update();
        },

        update() {
            const items = filtered();
            const { slice, pages } = ui.paginate(items, s, PAGE_SIZE);
            VQ.$('#results').innerHTML = ui.subHead(t('navEmployees'), ui.resultsCount(items.length)) + (items.length
                ? `<div class="contacts-grid">${slice.map(card).join('')}</div>` + ui.pagination(s.page, pages)
                : ui.emptyState('fa-user'));
        },

        setup(root) {
            root.addEventListener('input', e => {
                if (e.target.id === 'emQ') { s.q = e.target.value; s.page = 1; this.update(); }
            });
            root.addEventListener('click', e => {
                if (e.target.closest('#clearFilters')) { Object.assign(s, { q: '', department: 'all', page: 1 }); this.render(); return; }
                const chip = e.target.closest('[data-chip]');
                if (chip) { s[chip.dataset.chip] = chip.dataset.value; s.page = 1; this.render(); return; }
                const person = e.target.closest('[data-person]');
                if (person) { openProfile(person.dataset.person); return; }
                const pg = e.target.closest('[data-page-num]');
                if (pg) { s.page = Number(pg.dataset.pageNum); this.update(); }
            });
        },

        afterBoot() {
            if (VQ.param('id')) openProfile(VQ.param('id'));
        }
    });
})();
