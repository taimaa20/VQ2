/* Surveys & polls — BRD 7.4 & 8.13 (same scope as Option 1; front-end only: votes are not saved) */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const selected = {};
    const voted = {};

    function pollBlock(p) {
        const hasVoted = voted[p.id] != null;
        const choice = hasVoted ? voted[p.id] : selected[p.id];
        const votes = p.votes.map((v, i) => v + (voted[p.id] === i ? 1 : 0));
        const total = votes.reduce((a, b) => a + b, 0);

        const options = D.satisfactionOptions.map((o, i) => {
            if (hasVoted) {
                const pct = total ? votes[i] / total * 100 : 0;
                const mine = voted[p.id] === i;
                return `<div class="bar-row${mine ? ' is-choice' : ''}">
                    <div class="bar-row-head"><span>${mine ? '<i class="fa-solid fa-circle-check"></i>' : ''}${esc(tx(o))}</span><span class="bar-value" dir="ltr">${pct.toFixed(1)}%</span></div>
                    <div class="bar-track"><div class="bar-fill poll-bar" style="width:0" data-width="${pct}"></div></div>
                </div>`;
            }
            const on = choice === i;
            return `<button type="button" data-option="${p.id}:${i}" class="poll-option${on ? ' active' : ''}"><span class="poll-radio"></span>${esc(tx(o))}</button>`;
        }).join('');

        return `<div class="poll">
            <div class="poll-head">
                <h3 class="poll-question">${esc(tx(p.question))}</h3>
                ${hasVoted ? ui.tag(t('svThanks'), 'green', 'fa-check') : ui.tag(t('svEnds', { d: VQ.fmtDate(p.end, 'short') }), 'slate', 'fa-clock')}
            </div>
            <div class="${hasVoted ? 'bar-chart' : 'poll-options'}">${options}</div>
            <div class="poll-actions">
                ${hasVoted
                    ? `<span class="poll-note"><i class="fa-solid fa-chart-simple"></i>${t('svVotes', { n: total })} · ${t('svIllustrative')}</span>
                       <button type="button" data-change="${p.id}" class="show-more"><i class="fa-solid fa-rotate-left"></i>${t('svChange')}</button>`
                    : `<button type="button" data-clear="${p.id}" class="${ui.BTN.ruby}"><i class="fa-solid fa-eraser"></i>${t('svClear')}</button>
                       <button type="button" data-vote="${p.id}" class="${ui.BTN.primary}" ${choice == null ? 'disabled' : ''}><i class="fa-solid fa-check-to-slot"></i>${t('svVote')}</button>`}
            </div>
        </div>`;
    }

    function openIndepth(sv) {
        VQ.openModal({
            title: esc(tx(sv.title)), icon: 'fa-clipboard-list', size: 'md',
            body: `<form id="indepthForm" class="modal-pad form-stack">
                <p class="muted-note muted-note--box"><i class="fa-solid fa-circle-info"></i>${t('svFormIntro')}</p>
                <div>
                    <p class="form-label">1. ${t('svFormQ1')}</p>
                    <div class="rating" dir="ltr">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="r" class="sr-only"><span>${n}</span></label>`).join('')}</div>
                </div>
                <div>
                    <p class="form-label">2. ${t('svFormQ2')}</p>
                    <label class="filter-group filter-group--block">
                        <select><option>${t('svSelectService')}</option>${D.departments.map(x => `<option>${esc(tx(x.name))}</option>`).join('')}</select>
                        <i class="fa-solid fa-chevron-down select-caret"></i>
                    </label>
                </div>
                <div>
                    <p class="form-label">3. ${t('svFormQ3')}</p>
                    <textarea rows="3" class="text-area"></textarea>
                </div>
            </form>`,
            footer: `<button type="button" class="${ui.BTN.secondary}" data-modal-close>${t('cancel')}</button>
                <button type="submit" form="indepthForm" class="${ui.BTN.primary}"><i class="fa-solid fa-paper-plane"></i>${t('submit')}</button>`
        });
        VQ.$('#indepthForm').addEventListener('submit', e => {
            e.preventDefault();
            VQ.closeModal();
            VQ.toast(t('svSubmitted'));
        });
    }

    VQ.boot({
        title: () => t('svTitle'),

        render() {
            VQ.content(
                ui.pageHeader({ title: t('svTitle'), desc: t('svDesc'), crumbs: [{ label: t('navSurveys') }] }) +
                ui.sectionCard({ title: t('svQuick'), icon: 'fa-chart-simple', body: `<div class="poll-list">${D.polls.map(pollBlock).join('')}</div>` }) +
                ui.sectionCard({
                    title: t('svIndepth'), icon: 'fa-clipboard-list',
                    body: `<div class="poll-list">${D.indepthSurveys.map(sv => `<div class="indepth">
                        <span class="indepth-icon"><i class="fa-solid fa-clipboard-list"></i></span>
                        <div class="indepth-text">
                            <h3 class="poll-question">${esc(tx(sv.title))}</h3>
                            <p>${esc(tx(sv.description))}</p>
                            <div class="chip-row">${ui.tag(t('svMinutes', { n: sv.minutes }), 'slate', 'fa-clock')}${ui.tag(t('svEnds', { d: VQ.fmtDate(sv.end, 'short') }), 'amber', 'fa-calendar')}</div>
                        </div>
                        <button type="button" data-indepth="${sv.id}" class="${ui.BTN.primary}">${t('svOpenForm')} <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
                    </div>`).join('')}</div>`
                })
            );
            requestAnimationFrame(() => requestAnimationFrame(() =>
                VQ.$$('.poll-bar').forEach(b => { b.style.width = b.dataset.width + '%'; })));
        },

        setup(root) {
            root.addEventListener('click', e => {
                const opt = e.target.closest('[data-option]');
                if (opt) {
                    const [id, i] = opt.dataset.option.split(':');
                    selected[id] = Number(i);
                    this.render();
                    return;
                }
                const vote = e.target.closest('[data-vote]');
                if (vote) {
                    voted[vote.dataset.vote] = selected[vote.dataset.vote];
                    VQ.toast(t('svThanks'), 'fa-check-to-slot');
                    this.render();
                    return;
                }
                const clear = e.target.closest('[data-clear]');
                if (clear) { delete selected[clear.dataset.clear]; this.render(); return; }
                const change = e.target.closest('[data-change]');
                if (change) {
                    selected[change.dataset.change] = voted[change.dataset.change];
                    delete voted[change.dataset.change];
                    this.render();
                    return;
                }
                const indepth = e.target.closest('[data-indepth]');
                if (indepth) openIndepth(D.indepthSurveys.find(x => x.id === indepth.dataset.indepth));
            });
        }
    });
})();
