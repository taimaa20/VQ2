/* ==========================================================================
   components.js — shared building blocks for the page canvas (Option 2).
   Same component set as Option 1, drawn with the SPFx visual language:
   one continuous content surface; sections are separated by headings,
   spacing and dividers. Only repeated items (event, discount, course… tiles)
   keep a light border.
   ========================================================================== */
(function () {
    'use strict';

    const { t, tx, esc } = VQ;

    const BTN = {
        primary: 'btn btn-primary',
        secondary: 'btn btn-outline',
        soft: 'btn btn-soft',
        ruby: 'btn btn-ruby',
        icon: 'icon-btn'
    };

    const arrow = cls => `<i class="fa-solid fa-arrow-left dir-icon ${cls || 'arrow-sm'}"></i>`;

    /* ---------- Page structure ---------- */

    function breadcrumb(crumbs) {
        const trail = [{ label: t('navHome'), href: VQ.href('home') }].concat(crumbs || []);
        return `<nav class="breadcrumb" aria-label="Breadcrumb">
            ${trail.map((c, i) => i < trail.length - 1
                ? `<a href="${c.href}" class="breadcrumb-link">${esc(c.label)}</a><span class="breadcrumb-sep"><i class="fa-solid fa-chevron-left dir-icon"></i></span>`
                : `<span class="breadcrumb-current">${esc(c.label)}</span>`).join('')}
        </nav>`;
    }

    /* Breadcrumb → title with ruby underline → description (SPFx page header) */
    function pageHeader({ title, desc, crumbs, actions, badge }) {
        return `<header class="page-header">
            ${breadcrumb(crumbs)}
            <div class="page-head">
                <div class="page-head-text">
                    <h1 class="page-title">${title}${badge ? `<span class="page-badge">${badge}</span>` : ''}</h1>
                    ${desc ? `<p class="page-desc">${desc}</p>` : ''}
                </div>
                ${actions ? `<div class="page-actions">${actions}</div>` : ''}
            </div>
        </header>`;
    }

    function detailHeader({ crumbs, title, chips, meta, actions }) {
        return `<header class="page-header">
            ${breadcrumb(crumbs)}
            ${chips ? `<div class="chip-row">${chips}</div>` : ''}
            <h1 class="details-title">${title}</h1>
            ${meta && meta.length ? `<ul class="details-meta">${meta.map(m => `<li><i class="${m.icon}"></i>${m.text}</li>`).join('')}</ul>` : ''}
            ${actions ? `<div class="page-actions">${actions}</div>` : ''}
        </header>`;
    }

    /* Key details — one divided list, two columns (no tile per fact) */
    function facts(rows) {
        return `<dl class="facts">
            ${rows.filter(r => r && r.value).map(r => `<div class="fact">
                <i class="fa-solid ${r.icon}"></i><dt>${r.label}</dt><dd>${r.value}</dd>
            </div>`).join('')}
        </dl>`;
    }

    function articleFooter(label, href) {
        return `<div class="back-to-listing">${backButton(label, href)}</div>`;
    }

    /* Titled section on the page surface (heading + content, no card) */
    function sectionCard({ title, icon, body, link, linkLabel, extra, id }) {
        return `<section class="section"${id ? ` id="${id}"` : ''}>
            <div class="section-head">
                <h2 class="section-title">${icon ? `<i class="fa-solid ${icon}"></i>` : ''}<span>${title}</span></h2>
                <div class="section-tools">${extra || ''}${link ? `<a href="${link}" class="show-more">${linkLabel || t('viewAll')}${arrow()}</a>` : ''}</div>
            </div>
            <div class="section-body">${body}</div>
        </section>`;
    }

    function groupTitle(title, icon, extra) {
        return `<div class="group-head">
            <h2 class="group-title">${icon ? `<i class="fa-solid ${icon}"></i>` : ''}<span>${title}</span></h2>
            ${extra || ''}
        </div>`;
    }

    /* ---------- Filters (SPFx AdsPage filter row, without a surrounding card) ---------- */

    function toolbar(rows) {
        return `<div class="toolbar">${rows.filter(Boolean).join('')}</div>`;
    }

    const row = (inner, cls) => `<div class="toolbar-row ${cls || ''}">${inner}</div>`;

    function searchInput({ id, value, placeholder }) {
        return `<label class="search-container">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span class="sr-only">${esc(placeholder)}</span>
            <input id="${id}" type="search" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off">
        </label>`;
    }

    function select({ id, value, options, label }) {
        return `<label class="filter-group">
            <span class="sr-only">${label || ''}</span>
            <select id="${id}">
                ${options.map(o => `<option value="${o.value}" ${String(o.value) === String(value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
            </select>
            <i class="fa-solid fa-chevron-down select-caret"></i>
        </label>`;
    }

    function dateField({ id, value, label }) {
        return `<label class="filter-group filter-date">
            <span class="filter-label">${label}</span>
            <input type="date" id="${id}" value="${value || ''}" class="filter-input">
        </label>`;
    }

    /* Category tabs (SPFx .discount-category-tab) */
    function chips({ name, items, active }) {
        return `<div class="category-tabs" role="group">
            ${items.map(i => `<button type="button" data-chip="${name}" data-value="${i.value}" class="category-tab${String(i.value) === String(active) ? ' active' : ''}">
                ${i.dot ? `<span class="tab-dot" style="background:${i.dot}"></span>` : ''}${i.icon ? `<i class="fa-solid ${i.icon}"></i>` : ''}<span>${esc(i.label)}</span>
            </button>`).join('')}
        </div>`;
    }

    /* View switch pill */
    function segmented({ name, items, active }) {
        return `<div class="view-switch" role="group">
            ${items.map(i => {
                const on = i.value === active;
                return `<button type="button" data-chip="${name}" data-value="${i.value}" class="${on ? 'active' : ''}" aria-pressed="${on}"><i class="fa-solid ${i.icon}"></i><span>${i.label}</span></button>`;
            }).join('')}
        </div>`;
    }

    /* Underline tabs (SPFx hotlines tabs) */
    function tabs({ name, items, active }) {
        return `<div class="line-tabs" role="tablist">
            ${items.map(i => {
                const on = String(i.value) === String(active);
                return `<button type="button" role="tab" aria-selected="${on}" data-chip="${name}" data-value="${i.value}" class="line-tab${on ? ' active' : ''}">${esc(i.label)}</button>`;
            }).join('')}
        </div>`;
    }

    function resultsBar(count, extra) {
        return `<div class="results-bar"><p>${t('resultsCount', { n: count })}</p>${extra || ''}</div>`;
    }

    function emptyState(icon) {
        return `<div class="empty-state">
            <span class="empty-icon"><i class="fa-solid ${icon || 'fa-magnifying-glass'}"></i></span>
            <p class="empty-title">${t('noResults')}</p>
            <p class="empty-text">${t('noResultsHint')}</p>
        </div>`;
    }

    /* Shared pagination: Previous · 1 2 3 · Next */
    function pagination(current, pages) {
        if (pages <= 1) return '';
        let nums = '';
        for (let i = 1; i <= pages; i++) {
            nums += `<button type="button" data-page-num="${i}" class="page-number${i === current ? ' active' : ''}"${i === current ? ' aria-current="page"' : ''}>${i}</button>`;
        }
        return `<nav class="pagination-controls" aria-label="Pagination">
            <button type="button" class="pager-step" data-page-num="${current - 1}"${current === 1 ? ' disabled' : ''}><i class="fa-solid fa-chevron-right dir-icon"></i><span>${t('prev')}</span></button>
            <div class="pagination-container">${nums}</div>
            <button type="button" class="pager-step" data-page-num="${current + 1}"${current === pages ? ' disabled' : ''}><span>${t('next')}</span><i class="fa-solid fa-chevron-left dir-icon"></i></button>
        </nav>`;
    }

    function paginate(items, state, size) {
        const pages = Math.max(1, Math.ceil(items.length / size));
        state.page = Math.min(Math.max(1, state.page || 1), pages);
        return { pages, slice: items.slice((state.page - 1) * size, state.page * size) };
    }

    /* ---------- Small elements ---------- */

    function tag(label, color, icon) {
        return `<span class="chip chip--${color || 'teal'}">${icon ? `<i class="fa-solid ${icon}"></i>` : ''}${label}</span>`;
    }

    function statusTag(st) {
        const map = { upcoming: ['amber', 'fa-hourglass-half'], ongoing: ['green', 'fa-circle-play'], past: ['slate', 'fa-circle-check'] };
        return tag(t(st), map[st][0], map[st][1]);
    }

    const sampleBadge = () => tag(t('sampleData'), 'amber', 'fa-flask');

    function infoList(rows) {
        return `<dl class="info-list">
            ${rows.filter(r => r && r.value).map(r => `<div class="info-row">
                <span class="info-icon"><i class="fa-solid ${r.icon}"></i></span>
                <div><dt>${r.label}</dt><dd>${r.value}</dd></div>
            </div>`).join('')}
        </dl>`;
    }

    const paragraphs = list => (list || []).map(p => `<p>${esc(tx(p))}</p>`).join('');

    function backButton(label, href) {
        return `<a href="${href}" class="btn btn-primary"><i class="fa-solid fa-arrow-right dir-icon"></i><span>${label}</span></a>`;
    }

    /* Date tag on images (SPFx .card-date) */
    function dateBadge(iso) {
        return `<span class="date-badge"><b>${VQ.fmtDay(iso)}</b><span>${VQ.fmtMonth(iso)}</span></span>`;
    }

    /* ---------- Document viewer (static PDF preview) ---------- */

    function docViewer({ fileName, pages, content, height }) {
        return `<div class="doc-viewer">
            <div class="doc-toolbar" dir="ltr">
                <i class="fa-solid fa-bars"></i>
                <span class="doc-name">${esc(fileName)}</span>
                <span class="doc-pages"><span class="doc-pill">1</span>/ ${pages || 1}</span>
                <span class="doc-zoom">
                    <button type="button" class="doc-btn" data-doc-zoom="-1" aria-label="Zoom out"><i class="fa-solid fa-minus"></i></button>
                    <span class="doc-pill" data-doc-zoom-label>100%</span>
                    <button type="button" class="doc-btn" data-doc-zoom="1" aria-label="Zoom in"><i class="fa-solid fa-plus"></i></button>
                </span>
            </div>
            <div class="doc-stage" style="max-height:${height || '34rem'}">
                <div class="doc-page" data-doc-page>${content}</div>
            </div>
        </div>`;
    }

    function docLetterhead(title, subtitle) {
        return `<div class="doc-letterhead">
            <img src="${VQ.ROOT}/assets/img/vq-logo.svg" alt="Visit Qatar">
            <div><p class="doc-letterhead-sub">${subtitle || ''}</p><p class="doc-letterhead-title">${title}</p></div>
        </div>`;
    }

    function docSkeleton(sections) {
        const widths = ['100%', '92%', '84%', '100%', '75%', '92%', '58%'];
        let html = '';
        for (let s = 0; s < (sections || 4); s++) {
            html += `<div class="doc-block"><span class="doc-block-title"></span>
                ${widths.slice(0, 4 + (s % 3)).map(w => `<span class="doc-line" style="width:${w}"></span>`).join('')}</div>`;
        }
        return `<div class="doc-skeleton">${html}</div>`;
    }

    function openDocument({ title, fileName, pages, content }) {
        const f = VQ.fileIcon(fileName);
        VQ.openModal({
            title: esc(title),
            icon: f.icon,
            size: 'xl',
            body: `<div class="modal-doc">${docViewer({ fileName, pages, content, height: '68vh' })}</div>`,
            footer: `<button type="button" class="${BTN.secondary}" data-modal-close>${t('close')}</button>`
        });
    }

    /* ---------- Video player mock ---------- */

    function videoPlayer({ poster, title, length }) {
        return `<div class="video-player" data-video data-length="${length || '05:00'}">
            ${VQ.img(poster, 'video-poster', 1200)}
            <span class="video-shade"></span>
            <button type="button" data-video-play class="video-play" aria-label="Play"><i class="fa-solid fa-play"></i></button>
            <div class="video-bar">
                <p class="video-title">${esc(title)}</p>
                <div class="video-controls" dir="ltr">
                    <button type="button" data-video-toggle aria-label="Play / pause"><i class="fa-solid fa-play" data-video-icon></i></button>
                    <span class="video-progress"><span data-video-bar></span></span>
                    <span data-video-time class="video-time">00:00 / ${length || '05:00'}</span>
                    <i class="fa-solid fa-closed-captioning"></i><i class="fa-solid fa-volume-high"></i><i class="fa-solid fa-expand"></i>
                </div>
            </div>
        </div>`;
    }

    /* ---------- Shared elements ---------- */

    function avatar(person, cls) {
        if (person.photo) return VQ.img(person.photo, `avatar ${cls || ''}`, 200);
        const palette = ['#00626C', '#8A1538', '#D76800', '#522D6E', '#01A786', '#A18B29'];
        const name = tx(person.name);
        const initials = VQ.isAr() ? name.trim().charAt(0) : name.split(/\s+/).map(w => w.charAt(0)).slice(0, 2).join('');
        const color = palette[(person.id || name).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length];
        return `<span class="avatar avatar--initials ${cls || ''}" style="background:${color}">${esc(initials)}</span>`;
    }

    window.VQ.ui = {
        BTN, arrow,
        breadcrumb, pageHeader, detailHeader, facts, articleFooter, sectionCard, groupTitle,
        toolbar, row, searchInput, select, dateField, chips, segmented, tabs, resultsBar, emptyState, pagination, paginate,
        tag, statusTag, sampleBadge, infoList, paragraphs, backButton, dateBadge,
        docViewer, docLetterhead, docSkeleton, openDocument, videoPlayer, avatar
    };
})();
