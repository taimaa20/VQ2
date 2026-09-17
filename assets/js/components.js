/* ==========================================================================
   components.js — shared building blocks for the page canvas, written with
   the markup and class names of the SPFx web parts:
     breadcrumb · details-title · offers-header-of   (AdsPage / DetailsPage / HomePage)
     filter-search-section · search-container · filter-group · discount-category-tab
     listing-card · card-date · more-link · pagination-controls  (AdsPage)
     hotlines-tabs (HotlinesPage) · file-table (Policy) · back-to-listing (DetailsPage)
   Every page renders ONE .page-surface; sections inside it are divided, not boxed.
   ========================================================================== */
(function () {
    'use strict';

    const { t, tx, esc } = VQ;

    const arrow = () => `<i class="fa-solid fa-arrow-left dir-flip"></i>`;
    const chevronNext = () => `<i class="fa-solid fa-chevron-left dir-flip"></i>`;
    const chevronPrev = () => `<i class="fa-solid fa-chevron-right dir-flip"></i>`;

    /* ---------- Page frame ---------- */

    /* SPFx breadcrumb pill: Home › Section › Current */
    function breadcrumb(crumbs, extra) {
        const trail = [{ label: t('navHome'), href: VQ.href('home') }].concat(crumbs || []);
        const sep = `<span class="breadcrumb-sep">${VQ.icon('arrow-next')}</span>`;
        return `<div class="breadcrumb-row">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                ${trail.map((c, i) => i < trail.length - 1
                    ? `<a class="breadcrumb-link" href="${c.href}">${esc(c.label)}</a>${sep}`
                    : `<span class="breadcrumb-current" aria-current="page" title="${esc(c.label)}">${esc(c.label)}</span>`).join('')}
            </nav>
            ${extra || ''}
        </div>`;
    }

    /* Breadcrumb + the single white surface */
    const page = (crumbs, body) => breadcrumb(crumbs) + `<div class="page-surface">${body}</div>`;

    /* Page title with the ruby underline (DetailsPage .details-title) */
    function pageHead({ title, desc, actions, badge }) {
        return `<div class="page-head">
            <div>
                <h1 class="details-title">${title}</h1>
                ${desc ? `<p class="page-desc">${desc}</p>` : ''}
            </div>
            ${actions || badge ? `<div class="page-head-actions">${badge || ''}${actions || ''}</div>` : ''}
        </div>`;
    }

    /* Section heading (HomePage .offers-header-of) */
    function sectionHead({ title, link, linkLabel, tools, id }) {
        return `<div class="offers-header-of">
            <h2 ${id ? `id="${id}"` : ''}>${title}</h2>
            <div class="head-tools">${tools || ''}${link ? `<a href="${link}" class="show-more">${linkLabel || t('showMore')} ${arrow()}</a>` : ''}</div>
        </div>`;
    }

    const section = (html, cls) => `<section class="section ${cls || ''}">${html}</section>`;

    function subHead(title, extra) {
        return `<div class="sub-head"><h3>${title}</h3>${extra || ''}</div>`;
    }

    /* ---------- Filters (AdsPage filter-search-section) ---------- */

    const filterBar = (rows) => `<div class="filter-search-section">${rows.filter(Boolean).join('')}</div>`;
    const filters = (inner) => `<div class="filters">${inner}</div>`;

    function searchField({ id, value, placeholder }) {
        return `<label class="search-container">
            <span class="sr-only">${esc(placeholder)}</span>
            <input id="${id}" type="search" value="${esc(value)}" placeholder="${esc(placeholder || t('searchHere'))}" autocomplete="off">
            ${VQ.icon('search-lg')}
        </label>`;
    }

    function selectField({ id, value, options, label }) {
        return `<label class="filter-group">
            <span class="sr-only">${esc(label || '')}</span>
            <select id="${id}" class="filter-select">
                ${options.map(o => `<option value="${o.value}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
            </select>
            <i class="fa-solid fa-chevron-down select-caret" aria-hidden="true"></i>
        </label>`;
    }

    function dateField({ id, value, label }) {
        return `<label class="filter-group">
            <span class="filter-label">${label}</span>
            <input type="date" id="${id}" value="${value || ''}" class="filter-input">
        </label>`;
    }

    const clearButton = (id) => `<button type="button" id="${id || 'clearFilters'}" class="btn btn-clear">${t('clear')} <i class="fa-regular fa-trash-can"></i></button>`;

    /* Category tabs (discount-category-tab) */
    function tabs({ name, items, active, label }) {
        return `<div class="discount-category-tabs" role="group" ${label ? `aria-label="${esc(label)}"` : ''}>
            ${items.map(i => `<button type="button" class="discount-category-tab ${String(i.value) === String(active) ? 'active' : ''}" data-chip="${name}" data-value="${i.value}" aria-pressed="${String(i.value) === String(active)}">
                ${i.dot ? `<span class="tab-dot" style="background:${i.dot}"></span>` : ''}${i.icon ? `<i class="fa-solid ${i.icon}"></i>` : ''}<span>${esc(i.label)}</span>
            </button>`).join('')}
        </div>`;
    }

    /* Underline tabs (HotlinesPage .hotlines-tabs) */
    function underlineTabs({ name, items, active }) {
        return `<div class="hotlines-tabs" role="tablist">
            ${items.map(i => `<button type="button" role="tab" class="hotlines-tab ${String(i.value) === String(active) ? 'active' : ''}" aria-selected="${String(i.value) === String(active)}" data-chip="${name}" data-value="${i.value}">${esc(i.label)}</button>`).join('')}
        </div>`;
    }

    /* Pill view switch (list / calendar) */
    function viewSwitch({ name, items, active }) {
        return `<div class="view-switch" role="group">
            ${items.map(i => `<button type="button" class="${i.value === active ? 'active' : ''}" data-chip="${name}" data-value="${i.value}" aria-pressed="${i.value === active}"><i class="${i.icon}"></i>${i.label}</button>`).join('')}
        </div>`;
    }

    const resultsCount = n => `<span class="results-count">${t('resultsCount', { n })}</span>`;

    function emptyState(ic) {
        return `<div class="empty-state">
            <span class="empty-icon"><i class="fa-solid ${ic || 'fa-magnifying-glass'}"></i></span>
            <p>${t('noResults')}</p><span>${t('noResultsHint')}</span>
        </div>`;
    }

    /* ---------- Pagination (AdsPage: Previous · 1 2 3 · Next) ---------- */

    function pagination(current, pages) {
        if (pages <= 1) return '';
        let nums = '';
        for (let i = 1; i <= pages; i++) nums += `<button type="button" class="page-number ${i === current ? 'active' : ''}" data-page-num="${i}" ${i === current ? 'aria-current="page"' : ''}>${i}</button>`;
        return `<nav class="pagination-controls" aria-label="Pagination">
            <button type="button" class="pagination-step" data-page-num="${current - 1}" ${current === 1 ? 'disabled' : ''}>${chevronPrev()}<span>${t('prev')}</span></button>
            <div class="pagination-container">${nums}</div>
            <button type="button" class="pagination-step" data-page-num="${current + 1}" ${current === pages ? 'disabled' : ''}><span>${t('next')}</span>${chevronNext()}</button>
        </nav>`;
    }

    function paginate(items, state, size) {
        const pages = Math.max(1, Math.ceil(items.length / size));
        state.page = Math.min(Math.max(1, state.page || 1), pages);
        return { pages, slice: items.slice((state.page - 1) * size, state.page * size) };
    }

    /* ---------- Small elements ---------- */

    function tag(label, variant, ic, style) {
        return `<span class="tag ${variant ? 'tag-' + variant : ''}" ${style ? `style="${style}"` : ''}>${ic ? `<i class="fa-solid ${ic}"></i>` : ''}${label}</span>`;
    }

    function statusTag(st) {
        const map = { upcoming: ['amber', 'fa-hourglass-half'], ongoing: ['green', 'fa-circle-play'], past: ['grey', 'fa-circle-check'] };
        return tag(t(st), map[st][0], map[st][1]);
    }

    const sampleBadge = () => tag(t('sampleData'), 'amber', 'fa-flask');

    /* White date tab with the ruby calendar (AdsPage .card-date) */
    const cardDate = (iso, cls) => `<span class="card-date ${cls || ''}">${VQ.icon('calendar')}<span>${VQ.fmtCardDate(iso)}</span></span>`;

    const typeOfAnnouncement = key => VQ.D.announcementTypes.find(x => x.key === key);
    const typeTag = ty => tag(tx(ty.label), 'solid', '', `background:${ty.color}`);

    /* ---------- Listing card (AdsPage .listing-card) ---------- */

    function listingCard({ url, image, imageHTML, date, dateBottom, badge, overlay, chips, title, desc, meta, foot, button, cls, attrs, tagName }) {
        const el = tagName || (url ? 'a' : 'div');
        return `<${el} ${url ? `href="${url}"` : ''} class="listing-card ${cls || ''}" ${attrs || ''}>
            <div class="card-header ${overlay ? 'card-shade' : ''}">
                ${imageHTML || VQ.img(image, '', 700)}
                ${date ? cardDate(date, dateBottom ? 'is-bottom' : '') : ''}
                ${badge || ''}${overlay || ''}
            </div>
            <div class="card-details">
                <div class="card-info">
                    ${chips ? `<div class="card-chips">${chips}</div>` : ''}
                    <h3 class="card-title">${title}</h3>
                    ${desc ? `<p class="card-description">${desc}</p>` : ''}
                </div>
                ${meta || foot || button !== false ? `<div class="card-foot">
                    ${meta ? `<div class="card-meta">${meta}</div>` : '<span></span>'}
                    ${foot || (button === false ? '' : `<span class="more-link">${button || t('viewDetails')} ${arrow()}</span>`)}
                </div>` : ''}
            </div>
        </${el}>`;
    }

    const percentBadge = p => `<span class="card-badge"><small>${t('dsUpTo')}</small><strong class="ltr">${p}%</strong></span>`;

    /* ---------- Detail page blocks (DetailsPage) ---------- */

    function detailsHead({ title, chips, dates, meta }) {
        return `<div class="details-head">
            ${chips ? `<div class="card-chips">${chips}</div>` : ''}
            <h1 class="details-title">${title}</h1>
            <div class="details-date">
                ${dates ? `<span>${VQ.icon('calendar')}${dates}</span>` : ''}
                ${(meta || []).map(m => `<span class="date-muted"><i class="${m.icon}"></i>${m.text}</span>`).join('')}
            </div>
        </div>`;
    }

    /* "(From) 12 Sep 2026 - (To) 14 Sep 2026" as in DetailsPage */
    function dateRange(start, end) {
        if (!end || end === start) return `<span>${VQ.fmtDate(start, 'long')}</span>`;
        return `<span>${t('dateFrom')} ${VQ.fmtDate(start)}</span>&nbsp;-&nbsp;<span>${t('dateTo')} ${VQ.fmtDate(end)}</span>`;
    }

    function facts(rows) {
        return `<dl class="facts">
            ${rows.filter(r => r && r.value).map(r => `<div class="fact"><i class="fa-solid ${r.icon}"></i><dt>${r.label}</dt><dd>${r.value}</dd></div>`).join('')}
        </dl>`;
    }

    function block(title, body, id) {
        return `<div class="details-block" ${id ? `id="${id}"` : ''}><h3>${title}</h3>${body}</div>`;
    }

    const paragraphs = list => `<div class="details-desc">${(list || []).map(p => `<p>${esc(tx(p))}</p>`).join('')}</div>`;

    const checkList = list => `<ul class="check-list">${list.map(x => `<li><i class="fa-solid fa-circle-check"></i><span>${esc(tx(x))}</span></li>`).join('')}</ul>`;

    function backToListing(label, url) {
        return `<div class="back-to-listing"><a href="${url}"><span>${label}</span>${VQ.icon('arrow-next-white')}</a></div>`;
    }

    /* ---------- Document preview (static PDF) ---------- */

    function docViewer({ fileName, pages, content, height }) {
        return `<div class="doc-viewer">
            <div class="doc-toolbar">
                <i class="fa-solid fa-bars"></i>
                <span class="doc-name">${esc(fileName)}</span>
                <span><span class="doc-pill">1</span> / ${pages || 1}</span>
                <span>
                    <button type="button" class="doc-btn" data-doc-zoom="-1" aria-label="Zoom out"><i class="fa-solid fa-minus"></i></button>
                    <span class="doc-pill" data-doc-zoom-label>100%</span>
                    <button type="button" class="doc-btn" data-doc-zoom="1" aria-label="Zoom in"><i class="fa-solid fa-plus"></i></button>
                </span>
            </div>
            <div class="doc-stage" style="max-height:${height || '36rem'}"><div class="doc-page" data-doc-page>${content}</div></div>
        </div>`;
    }

    function docLetterhead(title, subtitle) {
        return `<div class="doc-letterhead">
            <img src="${VQ.ROOT}/assets/img/vq-logo.svg" alt="Visit Qatar">
            <p><small>${subtitle || ''}</small>${title}</p>
        </div>`;
    }

    function docSkeleton(sections) {
        const widths = ['100%', '92%', '84%', '100%', '76%', '90%', '60%'];
        let html = '';
        for (let s = 0; s < (sections || 4); s++) {
            html += `<div><div class="sk-head"></div>${widths.slice(0, 4 + (s % 3)).map(w => `<div class="sk-line" style="width:${w}"></div>`).join('')}</div>`;
        }
        return `<div class="doc-skeleton">${html}</div>`;
    }

    function openDocument({ title, fileName, pages, content }) {
        VQ.openModal({
            title: esc(title),
            size: 'lg',
            body: docViewer({ fileName, pages, content, height: '66vh' }),
            footer: `<button type="button" class="btn btn-outline btn-sm" data-modal-close>${t('close')}</button>`
        });
    }

    /* ---------- Video player mock ---------- */

    function videoPlayer({ poster, title, length }) {
        return `<div class="video-mock" data-video data-length="${length || '05:00'}">
            ${VQ.img(poster, '', 1400)}
            <button type="button" class="video-play-btn" data-video-play aria-label="Play"><i class="fa-solid fa-play" style="margin-left:4px"></i></button>
            <div class="video-bar">
                <p>${esc(title)}</p>
                <div class="video-controls">
                    <button type="button" data-video-toggle aria-label="Play / pause"><i class="fa-solid fa-play" data-video-icon></i></button>
                    <div class="video-progress"><span data-video-bar></span></div>
                    <span data-video-time class="num">00:00 / ${length || '05:00'}</span>
                    <i class="fa-solid fa-closed-captioning"></i><i class="fa-solid fa-volume-high"></i><i class="fa-solid fa-expand"></i>
                </div>
            </div>
        </div>`;
    }

    /* ---------- People ---------- */

    function avatar(person) {
        if (person.photo) return `<span class="contact-photo">${VQ.img(person.photo, '', 240, tx(person.name))}</span>`;
        const palette = ['#00626C', '#8A1538', '#D76B00', '#522D6E', '#01A786', '#A18B29'];
        const name = tx(person.name);
        const initials = VQ.isAr() ? name.trim().charAt(0) : name.split(/\s+/).map(w => w.charAt(0)).slice(0, 2).join('');
        const color = palette[(person.id || name).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
        return `<span class="contact-photo" style="background:${color}">${esc(initials)}</span>`;
    }

    /* ---------- Slider (HomePage owl carousels) ---------- */

    function slider({ items, perView, gap, autoplay, arrows }) {
        return `<div class="slider" data-slider ${autoplay ? `data-autoplay="${autoplay}"` : ''}>
            <div class="slider-track" style="--per-view:${perView || 1};--gap:${gap || '1rem'}">${items.join('')}</div>
            <div class="slider-foot">
                ${arrows ? `<button type="button" class="slider-arrow" data-slide-step="-1" aria-label="${t('prev')}">${chevronPrev()}</button>` : ''}
                <div class="slider-dots"></div>
                ${arrows ? `<button type="button" class="slider-arrow" data-slide-step="1" aria-label="${t('next')}">${chevronNext()}</button>` : ''}
            </div>
        </div>`;
    }

    window.VQ.ui = {
        arrow, chevronNext, chevronPrev,
        breadcrumb, page, pageHead, sectionHead, section, subHead,
        filterBar, filters, searchField, selectField, dateField, clearButton, tabs, underlineTabs, viewSwitch,
        resultsCount, emptyState, pagination, paginate,
        tag, statusTag, sampleBadge, cardDate, typeOfAnnouncement, typeTag, listingCard, percentBadge,
        detailsHead, dateRange, facts, block, paragraphs, checkList, backToListing,
        docViewer, docLetterhead, docSkeleton, openDocument, videoPlayer, avatar, slider
    };
})();
