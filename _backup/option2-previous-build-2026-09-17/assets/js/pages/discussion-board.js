/* Discussion Board — BRD 7.11 (same scope as Option 1: share an idea · topics · likes · replies · board poll).
   Posts live only in memory; nothing is saved. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const topics = D.discussions.map(x => Object.assign({ liked: false, open: false }, x, { replies: x.replies.slice() }));
    const s = { sort: 'latest', identity: 'anonymous', category: 'idea', pollVote: null };

    const catOf = key => D.discussionCategories.find(c => c.key === key);
    const todayIso = () => VQ.isoDate(VQ.today());

    function author(item, small) {
        const anon = item.identity === 'anonymous';
        return `<span class="author">
            <span class="author-avatar${anon ? ' is-anon' : ''}${small ? ' author-avatar--sm' : ''}">${anon ? '<i class="fa-solid fa-user-secret"></i>' : esc(item.alias.charAt(0).toUpperCase())}</span>
            <span class="author-text"><b>${anon ? t('dbAnonymousEmployee') : `<span dir="ltr">@${esc(item.alias)}</span>`}</b><small>${VQ.fmtDate(item.date, 'short')}</small></span>
        </span>`;
    }

    function composer() {
        return `<form id="dbForm" class="composer">
            <h2 class="group-title"><i class="fa-solid fa-lightbulb"></i><span>${t('dbShare')}</span></h2>
            <div class="toolbar-row">
                <label class="search-container search-container--plain"><span class="sr-only">${t('dbTitlePh')}</span><input id="dbTitle" placeholder="${t('dbTitlePh')}" maxlength="90"></label>
                ${ui.select({ id: 'dbCat', value: s.category, label: t('category'), options: D.discussionCategories.map(c => ({ value: c.key, label: tx(c.label) })) })}
            </div>
            <textarea id="dbBody" rows="3" class="text-area" placeholder="${t('dbBodyPh')}"></textarea>
            <div class="toolbar-row composer-foot">
                <span class="filter-label">${t('dbPostAs')}</span>
                ${ui.segmented({ name: 'identity', active: s.identity, items: [
                    { value: 'anonymous', icon: 'fa-user-secret', label: t('dbAnonymous') },
                    { value: 'alias', icon: 'fa-masks-theater', label: t('dbAlias') }
                ] })}
                ${s.identity === 'alias' ? `<label class="search-container search-container--plain search-container--alias"><span class="sr-only">${t('dbAliasPh')}</span><input id="dbAlias" placeholder="${t('dbAliasPh')}" maxlength="20" dir="ltr"></label>` : ''}
                <span class="toolbar-spacer"></span>
                <button type="submit" class="${ui.BTN.primary}"><i class="fa-solid fa-paper-plane"></i>${t('dbPost')}</button>
            </div>
            <p class="muted-note"><i class="fa-solid fa-shield-halved"></i>${t('dbIdentityNote')}</p>
        </form>`;
    }

    function topicBlock(x) {
        const cat = catOf(x.category);
        return `<article class="topic">
            <div class="topic-head">${author(x)}${ui.tag(tx(cat.label), 'teal', cat.icon)}</div>
            <h3 class="topic-title">${esc(tx(x.title))}</h3>
            <p class="topic-text">${esc(tx(x.body))}</p>
            <div class="topic-actions">
                <button type="button" data-like="${x.id}" class="topic-btn${x.liked ? ' is-liked' : ''}"><i class="fa-${x.liked ? 'solid' : 'regular'} fa-heart"></i><span>${x.likes + (x.liked ? 1 : 0)}</span></button>
                <button type="button" data-thread="${x.id}" class="topic-btn${x.open ? ' is-open' : ''}"><i class="fa-regular fa-comment"></i><span>${t('dbReplies', { n: x.replies.length })}</span></button>
            </div>
            ${x.open ? `<div class="replies">
                ${x.replies.map(r => `<div class="reply">${author(r, true)}<p>${esc(tx(r.body))}</p></div>`).join('')}
                <form data-reply-form="${x.id}" class="reply-form">
                    <label class="search-container search-container--plain"><span class="sr-only">${t('dbReplyPh')}</span><input placeholder="${t('dbReplyPh')}"></label>
                    <button type="submit" class="${ui.BTN.soft}"><i class="fa-solid fa-reply"></i>${t('dbReply')}</button>
                </form>
            </div>` : ''}
        </article>`;
    }

    function pollBlock() {
        const P = D.boardPoll;
        const votes = P.options.map((o, i) => o.votes + (s.pollVote === i ? 1 : 0));
        const total = votes.reduce((a, b) => a + b, 0);
        return ui.sectionCard({
            title: t('dbPoll'), icon: 'fa-chart-simple',
            body: `<p class="poll-question">${esc(tx(P.question))}</p>
            <div class="board-poll">${P.options.map((o, i) => {
                const pct = votes[i] / total * 100;
                const mine = s.pollVote === i;
                return `<button type="button" data-board-vote="${i}" class="board-option${mine ? ' is-choice' : ''}">
                    <span class="board-option-fill" style="width:${s.pollVote == null ? 0 : pct}%"></span>
                    <span class="board-option-text"><span>${mine ? '<i class="fa-solid fa-circle-check"></i>' : ''}${esc(tx(o.label))}</span>${s.pollVote == null ? '' : `<span dir="ltr">${Math.round(pct)}%</span>`}</span>
                </button>`;
            }).join('')}</div>
            ${s.pollVote == null ? '' : `<p class="poll-note">${t('svVotes', { n: total })} · ${t('svIllustrative')}</p>`}`
        });
    }

    VQ.boot({
        title: () => t('dbTitle'),

        render() {
            const sorted = topics.slice().sort((a, b) => s.sort === 'latest'
                ? b.date.localeCompare(a.date)
                : (b.likes + (b.liked ? 1 : 0)) - (a.likes + (a.liked ? 1 : 0)));

            VQ.content(
                ui.pageHeader({ title: t('dbTitle'), desc: t('dbDesc'), crumbs: [{ label: t('navDiscussion') }], badge: ui.sampleBadge() }) +
                composer() +
                `<div class="results-bar"><p>${t('resultsCount', { n: topics.length })}</p>
                    ${ui.chips({ name: 'sort', active: s.sort, items: [
                        { value: 'latest', label: t('dbLatest'), icon: 'fa-clock' },
                        { value: 'popular', label: t('dbPopular'), icon: 'fa-fire' }
                    ] })}
                </div>` +
                `<div class="topic-list">${sorted.map(topicBlock).join('')}</div>` +
                pollBlock()
            );
        },

        setup(root) {
            root.addEventListener('change', e => {
                if (e.target.id === 'dbCat') s.category = e.target.value;
            });
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) {
                    const title = VQ.$('#dbTitle') && VQ.$('#dbTitle').value;
                    const body = VQ.$('#dbBody') && VQ.$('#dbBody').value;
                    s[chip.dataset.chip] = chip.dataset.value;
                    this.render();
                    if (title) VQ.$('#dbTitle').value = title;
                    if (body) VQ.$('#dbBody').value = body;
                    return;
                }
                const like = e.target.closest('[data-like]');
                if (like) { const x = topics.find(y => y.id === like.dataset.like); x.liked = !x.liked; this.render(); return; }
                const thread = e.target.closest('[data-thread]');
                if (thread) { const x = topics.find(y => y.id === thread.dataset.thread); x.open = !x.open; this.render(); return; }
                const vote = e.target.closest('[data-board-vote]');
                if (vote) { s.pollVote = Number(vote.dataset.boardVote); this.render(); }
            });
            root.addEventListener('submit', e => {
                e.preventDefault();
                if (e.target.id === 'dbForm') {
                    const title = VQ.$('#dbTitle').value.trim();
                    const body = VQ.$('#dbBody').value.trim();
                    if (!title || !body) { VQ.toast(t('dbFillIn'), 'fa-circle-exclamation'); return; }
                    const alias = s.identity === 'alias' ? (VQ.$('#dbAlias').value.trim() || 'Guest') : null;
                    topics.push({
                        id: 'topic-' + Date.now(), category: s.category, identity: alias ? 'alias' : 'anonymous', alias,
                        date: todayIso(), likes: 0, liked: false, open: false, replies: [],
                        title: { ar: title, en: title }, body: { ar: body, en: body }
                    });
                    s.sort = 'latest';
                    this.render();
                    VQ.toast(t('dbPosted'));
                    return;
                }
                const replyId = e.target.getAttribute('data-reply-form');
                if (replyId) {
                    const input = e.target.querySelector('input');
                    if (!input.value.trim()) return;
                    const x = topics.find(y => y.id === replyId);
                    x.replies.push({ identity: 'anonymous', date: todayIso(), body: { ar: input.value.trim(), en: input.value.trim() } });
                    this.render();
                }
            });
        }
    });
})();
