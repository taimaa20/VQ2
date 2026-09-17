/* Surveys & polls — BRD 7.4 & 8.13 (front-end only: votes are not saved)
   SPFx vocabulary: HotlinesPage tabs (quick polls / in-depth surveys) · category-tab options · pill buttons · popup form */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const s = { tab: 'quick' };
    const selected = {};  // poll id -> option index (before voting)
    const voted = {};     // poll id -> option index (after voting)

    function poll(p) {
        const hasVoted = voted[p.id] != null;
        const choice = hasVoted ? voted[p.id] : selected[p.id];
        const votes = p.votes.map((v, i) => v + (voted[p.id] === i ? 1 : 0));
        const total = votes.reduce((a, b) => a + b, 0);

        const body = hasVoted
            ? `<div class="poll-results">${D.satisfactionOptions.map((o, i) => {
                const pct = total ? votes[i] / total * 100 : 0;
                const mine = voted[p.id] === i;
                return `<div><div class="poll-result-top ${mine ? 'mine' : ''}"><span>${mine ? '<i class="fa-solid fa-circle-check"></i> ' : ''}${esc(tx(o))}</span><span class="ltr num">${pct.toFixed(1)}%</span></div>
                    <div class="poll-bar"><span data-width="${pct}"></span></div></div>`;
            }).join('')}</div>`
            : `<div class="poll-options" role="radiogroup" aria-label="${esc(tx(p.question))}">${D.satisfactionOptions.map((o, i) => `<button type="button" role="radio" aria-checked="${choice === i}" class="poll-option ${choice === i ? 'active' : ''}" data-option="${p.id}:${i}"><span class="radio"></span>${esc(tx(o))}</button>`).join('')}</div>`;

        return `<article class="poll-item">
            <div class="poll-head">
                <h4>${esc(tx(p.question))}</h4>
                ${hasVoted ? ui.tag(t('svThanks'), 'green', 'fa-check') : ui.tag(t('svEnds', { d: VQ.fmtDate(p.end, 'short') }), 'grey', 'fa-clock')}
            </div>
            ${body}
            <div class="poll-actions">
                ${hasVoted
                    ? `<span class="poll-note"><i class="fa-solid fa-chart-simple"></i> ${t('svVotes', { n: total })} · ${t('svIllustrative')}</span>
                       <button type="button" class="btn btn-outline btn-sm" data-change="${p.id}"><i class="fa-solid fa-rotate-left"></i>${t('svChange')}</button>`
                    : `<button type="button" class="btn btn-clear btn-sm" data-clear="${p.id}" ${choice == null ? 'disabled' : ''}><i class="fa-solid fa-eraser"></i>${t('svClear')}</button>
                       <button type="button" class="btn btn-primary btn-sm" data-vote="${p.id}" ${choice == null ? 'disabled' : ''}><i class="fa-solid fa-check-to-slot"></i>${t('svVote')}</button>`}
            </div>
        </article>`;
    }

    function openIndepth(sv) {
        VQ.openModal({
            title: esc(tx(sv.title)),
            size: 'md',
            body: `<form id="indepthForm">
                <p class="form-note"><i class="fa-solid fa-circle-info"></i>${t('svFormIntro')}</p>
                <div class="form-group"><span class="form-label">1. ${t('svFormQ1')}</span>
                    <div class="rating">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="r" class="sr-only"><span>${n}</span></label>`).join('')}</div>
                </div>
                <div class="form-group"><label for="svService">2. ${t('svFormQ2')}</label>
                    <select id="svService" class="form-control"><option>${t('svSelectService')}</option>${D.departments.map(x => `<option>${esc(tx(x.name))}</option>`).join('')}</select>
                </div>
                <div class="form-group"><label for="svNotes">3. ${t('svFormQ3')}</label><textarea id="svNotes" rows="3" class="form-control"></textarea></div>
            </form>`,
            footer: `<button type="button" class="btn btn-outline btn-sm" data-modal-close>${t('cancel')}</button>
                <button type="submit" form="indepthForm" class="btn btn-primary btn-sm"><i class="fa-solid fa-paper-plane"></i>${t('submit')}</button>`
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
            const tabBody = s.tab === 'quick'
                ? `<div class="poll-list">${D.polls.map(poll).join('')}</div>`
                : `<div style="display:flex;flex-direction:column;gap:.75rem">${D.indepthSurveys.map(sv => `<div class="survey-row">
                    <span class="survey-icon"><i class="fa-solid fa-clipboard-list"></i></span>
                    <div class="survey-text">
                        <h4>${esc(tx(sv.title))}</h4><p>${esc(tx(sv.description))}</p>
                        <div class="card-chips">${ui.tag(t('svMinutes', { n: sv.minutes }), 'grey', 'fa-clock')}${ui.tag(t('svEnds', { d: VQ.fmtDate(sv.end, 'short') }), 'amber', 'fa-calendar')}</div>
                    </div>
                    <button type="button" class="btn btn-primary" data-indepth="${sv.id}">${t('svOpenForm')} <i class="fa-solid fa-arrow-up-right-from-square"></i></button>
                </div>`).join('')}</div>`;

            VQ.content(ui.page([{ label: t('navSurveys') }],
                ui.pageHead({ title: t('svTitle'), desc: t('svDesc') }) +
                ui.underlineTabs({ name: 'tab', active: s.tab, items: [
                    { value: 'quick', label: `${t('svQuick')} (${D.polls.length})` },
                    { value: 'indepth', label: `${t('svIndepth')} (${D.indepthSurveys.length})` }
                ] }) +
                `<div style="padding-top:1.25rem">${tabBody}</div>`
            ));
            requestAnimationFrame(() => requestAnimationFrame(() =>
                VQ.$$('.poll-bar span').forEach(b => { b.style.width = b.dataset.width + '%'; })));
        },

        setup(root) {
            root.addEventListener('click', e => {
                const tab = e.target.closest('[data-chip="tab"]');
                if (tab) { s.tab = tab.dataset.value; this.render(); return; }
                const opt = e.target.closest('[data-option]');
                if (opt) { const [id, i] = opt.dataset.option.split(':'); selected[id] = Number(i); this.render(); return; }
                const vote = e.target.closest('[data-vote]');
                if (vote) { voted[vote.dataset.vote] = selected[vote.dataset.vote]; VQ.toast(t('svThanks'), 'fa-check-to-slot'); this.render(); return; }
                const clear = e.target.closest('[data-clear]');
                if (clear) { delete selected[clear.dataset.clear]; this.render(); return; }
                const change = e.target.closest('[data-change]');
                if (change) { selected[change.dataset.change] = voted[change.dataset.change]; delete voted[change.dataset.change]; this.render(); return; }
                const indepth = e.target.closest('[data-indepth]');
                if (indepth) openIndepth(D.indepthSurveys.find(x => x.id === indepth.dataset.indepth));
            });
        }
    });
})();
