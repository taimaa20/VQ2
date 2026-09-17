/* Discussion Board — BRD 7.11 (anonymous / alias posting, with a poll). Posts live only in memory.
   Not a menu item (as in Option 1). SPFx vocabulary: popup form rows, category tabs, FAQ-style topic items. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const topics = D.discussions.map(x => Object.assign({ liked: false, open: false }, x, { replies: x.replies.slice() }));
    const s = { sort: 'latest', identity: 'anonymous', pollVote: null };

    const catOf = key => D.discussionCategories.find(c => c.key === key);
    const todayIso = () => VQ.isoDate(VQ.today());

    function avatar(item) {
        const anon = item.identity === 'anonymous';
        return `<span class="topic-avatar ${anon ? 'is-anon' : ''}">${anon ? '<i class="fa-solid fa-user-secret"></i>' : esc(item.alias.charAt(0).toUpperCase())}</span>`;
    }

    const authorName = item => (item.identity === 'anonymous' ? t('dbAnonymousEmployee') : `<span class="ltr">@${esc(item.alias)}</span>`);

    function composer() {
        return `<form id="dbForm" class="composer">
            ${ui.subHead(t('dbShare'))}
            <div class="form-row">
                <div class="form-group"><label for="dbTitle">${t('dbTitlePh')}</label><input id="dbTitle" class="form-control" maxlength="90"></div>
                <div class="form-group"><label for="dbCat">${t('category')}</label>
                    <select id="dbCat" class="form-control">${D.discussionCategories.map(c => `<option value="${c.key}">${esc(tx(c.label))}</option>`).join('')}</select>
                </div>
            </div>
            <div class="form-group"><label for="dbBody">${t('dbBodyPh')}</label><textarea id="dbBody" rows="3" class="form-control"></textarea></div>
            <div class="identity-row">
                <span class="form-label">${t('dbPostAs')}</span>
                ${ui.viewSwitch({ name: 'identity', active: s.identity, items: [
                    { value: 'anonymous', icon: 'fa-solid fa-user-secret', label: t('dbAnonymous') },
                    { value: 'alias', icon: 'fa-solid fa-masks-theater', label: t('dbAlias') }
                ] })}
                <input id="dbAlias" class="form-control ltr" placeholder="${t('dbAliasPh')}" maxlength="20" ${s.identity === 'alias' ? '' : 'hidden'}>
                <button type="submit" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i>${t('dbPost')}</button>
            </div>
            <p class="form-note" style="margin-top:.85rem"><i class="fa-solid fa-shield-halved"></i>${t('dbIdentityNote')}</p>
        </form>`;
    }

    function topic(x) {
        const cat = catOf(x.category);
        return `<article class="topic">
            <div class="topic-head">
                ${avatar(x)}
                <div class="topic-main">
                    <div class="topic-author"><b>${authorName(x)}</b><span>${VQ.fmtDate(x.date, 'short')}</span>${ui.tag(tx(cat.label), '', cat.icon)}</div>
                    <h4>${esc(tx(x.title))}</h4>
                    <p>${esc(tx(x.body))}</p>
                </div>
            </div>
            <div class="topic-foot">
                <button type="button" class="topic-btn ${x.liked ? 'on' : ''}" data-like="${x.id}" aria-pressed="${x.liked}"><i class="fa-${x.liked ? 'solid' : 'regular'} fa-heart"></i><span class="num">${x.likes + (x.liked ? 1 : 0)}</span></button>
                <button type="button" class="topic-btn ${x.open ? 'open' : ''}" data-thread="${x.id}" aria-expanded="${x.open}"><i class="fa-regular fa-comment"></i>${t('dbReplies', { n: x.replies.length })}</button>
            </div>
            ${x.open ? `<div class="topic-replies">
                ${x.replies.map(r => `<div class="reply">${avatar(r)}<div><div class="topic-author"><b>${authorName(r)}</b><span>${VQ.fmtDate(r.date, 'short')}</span></div><p>${esc(tx(r.body))}</p></div></div>`).join('')}
                <form class="reply-form" data-reply-form="${x.id}">
                    <input class="form-control" placeholder="${t('dbReplyPh')}" aria-label="${t('dbReplyPh')}">
                    <button type="submit" class="btn btn-outline btn-sm"><i class="fa-solid fa-reply"></i>${t('dbReply')}</button>
                </form>
            </div>` : ''}
        </article>`;
    }

    function boardPoll() {
        const P = D.boardPoll;
        const votes = P.options.map((o, i) => o.votes + (s.pollVote === i ? 1 : 0));
        const total = votes.reduce((a, b) => a + b, 0);
        return ui.section(
            ui.sectionHead({ title: t('dbPoll') }) +
            `<p class="details-lead" style="font-size:.95rem">${esc(tx(P.question))}</p>
            ${P.options.map((o, i) => {
                const pct = votes[i] / total * 100;
                const mine = s.pollVote === i;
                return `<button type="button" class="board-poll-option ${mine ? 'mine' : ''}" data-board-vote="${i}">
                    <span class="board-poll-fill" style="width:${s.pollVote == null ? 0 : pct}%"></span>
                    <span class="board-poll-label"><span>${mine ? '<i class="fa-solid fa-circle-check" style="color:var(--vq-teal)"></i> ' : ''}${esc(tx(o.label))}</span>${s.pollVote == null ? '' : `<span class="ltr num">${Math.round(pct)}%</span>`}</span>
                </button>`;
            }).join('')}
            ${s.pollVote == null ? '' : `<p class="results-count" style="margin-top:.6rem">${t('svVotes', { n: total })} · ${t('svIllustrative')}</p>`}`
        );
    }

    VQ.boot({
        title: () => t('dbTitle'),

        render() {
            const sorted = topics.slice().sort((a, b) => s.sort === 'latest'
                ? b.date.localeCompare(a.date)
                : (b.likes + (b.liked ? 1 : 0)) - (a.likes + (a.liked ? 1 : 0)));

            VQ.content(ui.page([{ label: t('navDiscussion') }],
                ui.pageHead({ title: t('dbTitle'), desc: t('dbDesc'), badge: ui.sampleBadge() }) +
                composer() +
                `<section class="section">` +
                ui.sectionHead({ title: t('dbTopics'), tools: ui.resultsCount(topics.length) + ui.tabs({ name: 'sort', active: s.sort, items: [
                    { value: 'latest', label: t('dbLatest'), icon: 'fa-clock' },
                    { value: 'popular', label: t('dbPopular'), icon: 'fa-fire' }
                ] }) }) +
                `<div class="topic-list">${sorted.map(topic).join('')}</div></section>` +
                boardPoll()
            ));
        },

        setup(root) {
            root.addEventListener('click', e => {
                const chip = e.target.closest('[data-chip]');
                if (chip) {
                    const keep = { title: VQ.$('#dbTitle').value, body: VQ.$('#dbBody').value, cat: VQ.$('#dbCat').value };
                    s[chip.dataset.chip] = chip.dataset.value;
                    this.render();
                    VQ.$('#dbTitle').value = keep.title;
                    VQ.$('#dbBody').value = keep.body;
                    VQ.$('#dbCat').value = keep.cat;
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
                        id: 'topic-' + Date.now(), category: VQ.$('#dbCat').value, identity: alias ? 'alias' : 'anonymous', alias,
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
