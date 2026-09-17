/* ==========================================================================
   Visit Qatar Intranet — Design Option 2 (SPFx visual language, static prototype)
   core.js — language, formatting, shared portal shell (header · menu · side
             panel · footer), header search, modal, toast and shared components.

   Functional scope, content and component order mirror Option 1 exactly.
   Visual structure mirrors the SPFx solution:
     shell  ≈ IntranetPortalApplicationCustomizer (TopBar · RightSidebar · RightPanel · FooterBar)
     pages  ≈ one web part rendering into the page canvas (#pageContent)
   No backend: everything reads from the /data files.
   ========================================================================== */
(function () {
    'use strict';

    const ROOT = document.body.getAttribute('data-root') || '..';
    const PAGE = document.body.getAttribute('data-page') || '';

    /* Set a date such as '2026-09-16' to freeze "today" (countdowns, statuses) for a rehearsed demo */
    const PROTOTYPE_TODAY = null;

    const D = window.VQData || {};
    const I18N = window.VQ_I18N;

    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
    };

    const state = {
        lang: store.get('vq2-lang') === 'en' ? 'en' : 'ar',
        fontScale: parseFloat(store.get('vq2-font-scale')) || 1,
        searchFilter: 'all',
        searchQuery: ''
    };
    const urlLang = new URLSearchParams(location.search).get('lang');
    if (urlLang === 'ar' || urlLang === 'en') { state.lang = urlLang; store.set('vq2-lang', urlLang); }

    let page = null;

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    /* ---------- Text ---------- */

    function t(key, vars) {
        let s = I18N[state.lang][key];
        if (s == null) s = I18N.ar[key];
        if (s == null) {
            console.warn('[VQ] missing text key:', key);
            return key;
        }
        if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
        return s;
    }

    function tx(v) {
        if (v == null) return '';
        if (typeof v !== 'object') return String(v);
        return v[state.lang] != null ? v[state.lang] : (v.ar || '');
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    const isAr = () => state.lang === 'ar';

    /* ---------- Dates ---------- */

    function toDate(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function today() {
        const d = PROTOTYPE_TODAY ? toDate(PROTOTYPE_TODAY) : new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const fmtDay = iso => String(toDate(iso).getDate()).padStart(2, '0');
    const fmtMonth = iso => new Intl.DateTimeFormat(isAr() ? 'ar-u-nu-latn' : 'en-US', { month: 'short' }).format(toDate(iso));

    function fmtDate(iso, style) {
        if (!iso) return '';
        if (style === 'short' && !isAr()) return `${fmtDay(iso)} ${fmtMonth(iso)} ${toDate(iso).getFullYear()}`;
        const opts = style === 'long'
            ? { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
            : style === 'short'
                ? { day: '2-digit', month: 'short', year: 'numeric' }
                : { day: '2-digit', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat(isAr() ? 'ar-u-nu-latn' : 'en-GB', opts).format(toDate(iso));
    }

    function fmtRange(start, end, style) {
        if (!end || end === start) return fmtDate(start, style);
        return `${fmtDate(start, style)} — ${fmtDate(end, style)}`;
    }

    const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const daysUntil = iso => Math.round((toDate(iso) - today()) / 86400000);

    function status(start, end) {
        if (daysUntil(start) > 0) return 'upcoming';
        if (daysUntil(end || start) >= 0) return 'ongoing';
        return 'past';
    }

    /* ---------- Links & media ---------- */

    function href(target, params) {
        let url = target === 'home' ? ROOT + '/index.html' : ROOT + '/pages/' + target + '.html';
        if (params) {
            const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== '')).toString();
            if (qs) url += '?' + qs;
        }
        return url;
    }

    const param = name => new URLSearchParams(location.search).get(name);

    const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect width="400" height="250" fill="#E7F2F4"/>' +
        '<g fill="none" stroke="#00626C" stroke-opacity=".25" stroke-width="2"><rect x="170" y="95" width="60" height="60"/>' +
        '<rect x="170" y="95" width="60" height="60" transform="rotate(45 200 125)"/></g></svg>');

    /* Unsplash ids ("photo-…"), full URLs, or files in /assets/img */
    function photo(src, w) {
        if (!src) return FALLBACK_IMG;
        if (/^(https?:|data:)/.test(src)) return src;
        if (src.indexOf('photo-') === 0) return `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${w || 900}&q=80`;
        return ROOT + '/assets/img/' + src;
    }

    function img(src, cls, w, alt) {
        return `<img src="${photo(src, w)}" alt="${esc(alt || '')}" class="${cls || ''}" loading="lazy" onerror="this.onerror=null;this.src=VQ.FALLBACK_IMG;">`;
    }

    function fileIcon(nameOrExt) {
        const ext = String(nameOrExt).split('.').pop().toLowerCase();
        const map = {
            pdf: ['fa-file-pdf', 'ico-pdf'], doc: ['fa-file-word', 'ico-word'], docx: ['fa-file-word', 'ico-word'],
            xls: ['fa-file-excel', 'ico-excel'], xlsx: ['fa-file-excel', 'ico-excel'],
            ppt: ['fa-file-powerpoint', 'ico-ppt'], pptx: ['fa-file-powerpoint', 'ico-ppt'],
            zip: ['fa-file-zipper', 'ico-zip'], png: ['fa-file-image', 'ico-img'], jpg: ['fa-file-image', 'ico-img']
        };
        const [icon, color] = map[ext] || ['fa-file-lines', 'ico-doc'];
        return { icon, color, ext: ext.toUpperCase() };
    }

    const dept = key => (D.departments || []).find(d => d.key === key);
    const deptName = key => (dept(key) ? tx(dept(key).name) : '');

    /* ---------- Menu (same items and order as Option 1) ---------- */

    const NAV_MAIN = [
        { key: 'navHome', icon: 'fa-house', page: 'home' },
        { key: 'navDepts', icon: 'fa-sitemap', page: 'departments' },
        { key: 'navAnnouncements', icon: 'fa-bullhorn', page: 'announcements', also: ['announcement-details'] },
        { key: 'navDiscounts', icon: 'fa-tags', page: 'discounts', also: ['discount-details'] },
        { key: 'navCerts', icon: 'fa-certificate', page: 'certificates' },
        { key: 'navAwards', icon: 'fa-award', page: 'awards' },
        { key: 'navEvents', icon: 'fa-calendar-days', page: 'events', also: ['event-details'] },
        { key: 'navNews', icon: 'fa-newspaper', page: 'news', also: ['news-details'] },
        { key: 'navSurveys', icon: 'fa-square-poll-vertical', page: 'surveys' },
        { key: 'navPolicies', icon: 'fa-folder-open', page: 'policies' },
        { key: 'navHotlines', icon: 'fa-headset', page: 'hotlines' },
        { key: 'navCourses', icon: 'fa-graduation-cap', page: 'courses', also: ['course-details'] },
        { key: 'navUserGuide', icon: 'fa-book-open', page: 'user-guide' },
        { key: 'navEmployees', icon: 'fa-address-book', page: 'employees' }
    ];
    /* Discussion Board and VQ Structure pages exist but are not in the menu (as in Option 1) */

    const NAV_HEADER = [
        { key: 'navPhotos', icon: 'fa-images', page: 'photo-gallery', also: ['album'] },
        { key: 'navVideos', icon: 'fa-circle-play', page: 'video-library' }
    ];

    const isCurrent = n => n.page === PAGE || (n.also || []).indexOf(PAGE) !== -1 || (n.page === 'home' && PAGE === 'home');

    /* ---------- Header (SPFx TopBar) ---------- */

    function headerHTML() {
        const filter = (key, label) => `<button type="button" data-filter="${key}" class="search-filter${state.searchFilter === key ? ' is-active' : ''}">${label}</button>`;
        return `<div class="topBar">
            <button type="button" class="menu-toggle" data-toggle-menu aria-controls="vqNav" aria-expanded="false" aria-label="${t('openMenu')}"><i class="fa-solid fa-bars"></i></button>
            <div class="logoArea">
                <a href="${href('home')}" class="logoLink" title="${t('logoHome')}"><img class="logoImage" src="${ROOT}/assets/img/vq-logo.svg" alt="Visit Qatar"></a>
            </div>
            <nav class="leftActions" aria-label="${t('navGalleries')}">
                ${NAV_HEADER.map(n => `<a href="${href(n.page)}" class="linkItem${isCurrent(n) ? ' is-active' : ''}" title="${t(n.key)}"${isCurrent(n) ? ' aria-current="page"' : ''}>
                    <i class="fa-solid ${n.icon}"></i><span>${t(n.key)}</span></a>`).join('')}
            </nav>
            <div class="rightActions">
                <div class="searchWrap" id="searchWrap">
                    <div class="searchBox">
                        <label for="globalSearch" class="sr-only">${t('searchLabel')}</label>
                        <input id="globalSearch" class="searchInput" type="search" autocomplete="off" value="${esc(state.searchQuery)}" placeholder="${t('searchPlaceholder')}">
                        <button type="button" id="searchSubmit" class="searchSubmit" aria-label="${t('searchLabel')}"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                    <div id="searchPanel" class="search-panel" hidden>
                        <div class="search-panel-head">
                            <p class="search-panel-title">${t('searchFiltersTitle')}</p>
                            <div class="search-filters" id="searchFilters">
                                ${filter('all', t('filterAll'))}${filter('pages', t('filterPages'))}${filter('people', t('filterPeople'))}${filter('documents', t('filterDocuments'))}${filter('images', t('filterImages'))}${filter('videos', t('filterVideos'))}
                            </div>
                        </div>
                        <div class="search-panel-results" id="searchResults"></div>
                        <a id="searchAll" href="${href('search')}" class="search-panel-all">${t('searchViewAll')}</a>
                    </div>
                </div>
                <div class="textSizeIcons" role="group">
                    <button type="button" id="decreaseFont" class="textSizeIcon" title="${t('decreaseFont')}" aria-label="${t('decreaseFont')}">A<sup>−</sup></button>
                    <button type="button" id="increaseFont" class="textSizeIcon" title="${t('increaseFont')}" aria-label="${t('increaseFont')}">A<sup>+</sup></button>
                </div>
                <label class="navbarLanguage">
                    <span class="sr-only">${t('languageLabel')}</span>
                    <select id="langSelect" class="languageSelect">
                        <option value="ar"${isAr() ? ' selected' : ''}>AR</option>
                        <option value="en"${!isAr() ? ' selected' : ''}>EN</option>
                    </select>
                    <i class="fa-solid fa-chevron-down"></i>
                </label>
                <div class="profile">
                    <span class="profileButton"><img class="profileIconImage" src="${photo('photo-1534528741775-53994a69daeb', 150)}" alt="" onerror="this.onerror=null;this.src=VQ.FALLBACK_IMG;"></span>
                    <span class="userInfo">
                        <span class="userName">${t('userName')}</span>
                        <span class="userRole">${t('userTitle')}</span>
                        <span class="userDept">${t('userDept')}</span>
                    </span>
                </div>
            </div>
        </div>`;
    }

    /* ---------- Menu (SPFx RightSidebar) ---------- */

    function navHTML() {
        return `<nav class="sidebar" aria-label="${t('navMenu')}">
            <ul class="navList">
                ${NAV_MAIN.map(n => {
                    const on = isCurrent(n);
                    return `<li><a href="${href(n.page)}" class="navItem${on ? ' navItemActive' : ''}"${on ? ' aria-current="page"' : ''}>
                        <span class="navIcon"><i class="fa-solid ${n.icon}"></i></span><span class="navLabel">${t(n.key)}</span></a></li>`;
                }).join('')}
            </ul>
        </nav>`;
    }

    /* ---------- Side panel (SPFx RightPanel) — same widgets and order as Option 1 ---------- */

    function widgetsHTML() {
        const days = [['wxTomorrow', 'fa-sun wx-amber', 37], ['wxTue', 'fa-cloud-sun wx-teal', 35], ['wxWed', 'fa-cloud wx-grey', 34], ['wxThu', 'fa-sun wx-amber', 36]];
        const prayers = [['prFajr', '04:15', 'fa-moon', 'fajr'], ['prSunrise', '05:19', 'fa-sun', 'sunrise'], ['prDhuhr', '11:30', 'fa-sun', 'dhuhr', true],
            ['prAsr', '14:59', 'fa-cloud-sun', 'asr'], ['prMaghrib', '17:40', 'fa-cloud-moon', 'maghrib'], ['prIsha', '19:10', 'fa-star-and-crescent', 'isha']];
        const systems = [
            ['https://visitqatar.com', 'fa-solid fa-desktop', 'sysExplorer'],
            ['https://www.office.com', 'fa-solid fa-users', 'sysHr'],
            ['https://teams.microsoft.com', 'fa-solid fa-headset', 'sysTawasol'],
            ['https://login.microsoftonline.com', 'fa-solid fa-file-contract', 'sysLicensing'],
            ['https://www.microsoft365.com', 'fa-brands fa-microsoft', 'sysMicrosoft'],
            ['https://windows365.microsoft.com', 'fa-solid fa-display', 'sysDesktop'],
            ['https://teams.microsoft.com', 'fa-solid fa-screwdriver-wrench', 'sysItSupport'],
            ['https://www.microsoft.com/dynamics-365', 'fa-solid fa-chart-pie', 'sysD365'],
            ['https://seatable.io', 'fa-solid fa-table', 'sysSeaTable'],
            ['https://visitqatar.com', 'fa-solid fa-globe', 'sysVqWebsite']
        ];
        const statements = [
            ['photo-1500530855697-b586d89ba3ee', 'hpVisionTitle', 'hpVisionText'],
            ['photo-1486406146926-c627a92ad1ab', 'hpMissionTitle', 'hpMissionText'],
            ['photo-1529156069898-49953e39b3ac', 'hpMessageTitle', 'hpMessageText']
        ];
        const title = (icon, key, extra) => `<h2 class="side-title"><i class="fa-solid ${icon}"></i><span>${t(key)}</span>${extra || ''}</h2>`;

        return `<div class="side-panel">
            <section class="side-section">
                ${title('fa-cloud-sun', 'hpWeather', `<span class="side-title-meta">${t('wxCity')}</span>`)}
                <div class="weather-today">
                    <div><span class="weather-temp">36°</span><span class="weather-desc">${t('hpWeatherToday')}</span></div>
                    <i class="fa-solid fa-sun wx-amber"></i>
                </div>
                <div class="weather-days">
                    ${days.map(([key, icon, temp]) => `<div class="weather-day"><span>${t(key)}</span><i class="fa-solid ${icon}"></i><b>${temp}°</b></div>`).join('')}
                </div>
            </section>

            <section class="side-section">
                ${title('fa-mosque', 'hpPrayer', `<span class="next-chip">${t('hpNextPrayer')}</span>`)}
                <div class="times">
                    ${prayers.map(([key, time, icon, cls, next]) => `<div class="timeItem timeItem--${cls}${next ? ' is-next' : ''}">
                        <span class="timeItemIcon"><i class="fa-solid ${icon}"></i></span>
                        <span class="timeItemName">${t(key)}</span>
                        <span class="timeItemValue">${time}</span>
                    </div>`).join('')}
                </div>
                <p class="side-note">${t('hpPrayerSource')}</p>
            </section>

            <section class="side-section">
                ${title('fa-laptop-code', 'hpSystems')}
                <ul class="linksList">
                    ${systems.map(([url, icon, key]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">
                        <span class="link-icon"><i class="${icon}"></i></span><span class="link-text">${t(key)}</span>
                        <i class="fa-solid fa-arrow-up-right-from-square link-ext"></i></a></li>`).join('')}
                </ul>
            </section>

            <section class="side-section">
                ${title('fa-bullseye', 'hpVision')}
                <div class="statements">
                    ${statements.map(([id, head, text]) => `<article class="statement">
                        ${img(id, 'statement-img', 400)}
                        <div><h3>${t(head)}</h3><p>${t(text)}</p></div>
                    </article>`).join('')}
                </div>
            </section>

            <section class="side-section">
                ${title('fa-sitemap', 'hpStructure')}
                <a href="${href('structure')}" class="side-image-link">${img('photo-1552664730-d307ca884978', '', 700, 'VQ Structure')}</a>
                <p class="side-text">${t('hpStructureText')}</p>
            </section>

            <section class="side-section">
                ${title('fa-headset', 'navHotlines')}
                <p class="side-text">${t('hpHotlinesText')}</p>
                <a href="${href('hotlines')}" class="btn btn-primary btn-block">${t('hpHotlinesBtn')}</a>
            </section>
        </div>`;
    }

    /* ---------- Footer (SPFx FooterBar) ---------- */

    function footerHTML() {
        const social = [
            ['https://www.instagram.com/visitqatar/', 'Instagram', 'fa-instagram'],
            ['https://www.facebook.com/VisitQatar', 'Facebook', 'fa-facebook-f'],
            ['https://x.com/VisitQatar', 'X', 'fa-x-twitter'],
            ['https://www.youtube.com/@VisitQatar', 'YouTube', 'fa-youtube'],
            ['https://www.tiktok.com/@visitqatar', 'TikTok', 'fa-tiktok'],
            ['https://www.linkedin.com/company/visit-qatar', 'LinkedIn', 'fa-linkedin-in']
        ];
        return `<footer class="footer">
            <div class="startLinks" aria-label="Visit Qatar social media">
                ${social.map(([url, name, icon]) => `<a class="social-link" href="${url}" target="_blank" rel="noopener noreferrer" title="${name}" aria-label="${name}"><i class="fa-brands ${icon}"></i></a>`).join('')}
            </div>
            <p class="copyright">${t('copyrightPrefix')} © Visit Qatar ${new Date().getFullYear()}</p>
            <a href="${href('certificates')}" class="footer-certs" title="${t('footerCerts')}">
                <img src="${ROOT}/assets/img/logos-color.jpg" alt="${t('footerCerts')}">
            </a>
        </footer>`;
    }

    /* ---------- Search index (all static data — same as Option 1) ---------- */

    function searchIndex() {
        const list = [];
        const both = v => (typeof v === 'object' ? Object.values(v).join(' ') : String(v));
        const add = (type, icon, color, title, meta, url, extra) =>
            list.push({ type, icon, color, title: tx(title), meta, url, haystack: (both(title) + ' ' + meta + ' ' + (extra || '')).toLowerCase() });

        NAV_MAIN.concat(NAV_HEADER).forEach(n =>
            add('pages', n.icon, 'ico-doc', { ar: I18N.ar[n.key], en: I18N.en[n.key] }, t('filterPages'), href(n.page)));
        (D.announcements || []).forEach(a =>
            add('pages', 'fa-bullhorn', 'ico-doc', a.title, `${t('navAnnouncements')} · ${a.number}`, href('announcement-details', { id: a.id }), both(a.summary)));
        (D.events || []).forEach(e =>
            add('pages', 'fa-calendar-days', 'ico-doc', e.title, `${t('navEvents')} · ${fmtDate(e.start)}`, href('event-details', { id: e.id }), both(e.location)));
        (D.news || []).forEach(n =>
            add('pages', 'fa-newspaper', 'ico-doc', n.title, `${t('navNews')} · ${fmtDate(n.date)}`, href('news-details', { id: n.id })));
        (D.discounts || []).forEach(d =>
            add('pages', 'fa-tags', 'ico-ruby', d.title, `${t('navDiscounts')} · ${d.percent}%`, href('discount-details', { id: d.id }), both(d.partner)));
        (D.courses || []).forEach(c =>
            add('pages', 'fa-graduation-cap', 'ico-doc', c.title, `${t('navCourses')} · ${tx(c.duration)}`, href('course-details', { id: c.id })));
        (D.employees || []).forEach(p =>
            add('people', 'fa-user', 'ico-people', p.name, `${tx(p.position)} · ${deptName(p.department)}`, href('employees', { id: p.id }), p.id + ' ' + both(p.position)));
        (D.policies || []).forEach(doc => {
            const f = fileIcon(doc.ext);
            add('documents', f.icon, f.color, doc.title, `${f.ext} · ${t('navPolicies')}`, href('policies', { doc: doc.id }));
        });
        (D.certificates || []).forEach(c =>
            add('documents', 'fa-certificate', 'ico-gold', { ar: `${c.standard} — ${c.title.ar}`, en: `${c.standard} — ${c.title.en}` }, t('navCerts'), href('certificates', { cert: c.id })));
        (D.albums || []).forEach(a =>
            add('images', 'fa-image', 'ico-zip', a.title, `${t('navPhotos')} · ${t('pgPhotos', { n: a.photos.length })}`, href('album', { id: a.id })));
        (D.videos || []).forEach(v =>
            add('videos', 'fa-circle-play', 'ico-ruby', v.title, `${t('navVideos')} · ${v.length}`, href('video-library', { id: v.id })));
        (D.guides || []).forEach(g => {
            const type = g.kind === 'video' ? 'videos' : g.kind === 'image' ? 'images' : 'pages';
            const icon = g.kind === 'video' ? 'fa-circle-play' : g.kind === 'image' ? 'fa-image' : 'fa-arrow-up-right-from-square';
            add(type, icon, 'ico-zip', g.title, t('navUserGuide'), href('user-guide', { id: g.id }));
        });
        return list;
    }

    function searchItems(query, filter) {
        const q = String(query || '').trim().toLowerCase();
        return searchIndex().filter(item =>
            (filter === 'all' || !filter || item.type === filter) && (!q || item.haystack.indexOf(q) !== -1));
    }

    function resultRow(item) {
        return `<a href="${item.url}" class="search-result">
            <span class="search-result-icon ${item.color}"><i class="fa-solid ${item.icon}"></i></span>
            <span class="search-result-text"><span>${esc(item.title)}</span><small>${esc(item.meta)}</small></span>
        </a>`;
    }

    function renderHeaderResults() {
        const box = $('#searchResults');
        if (!box) return;
        const items = searchItems(state.searchQuery, state.searchFilter).slice(0, 6);
        box.innerHTML = items.length ? items.map(resultRow).join('') : `<p class="search-empty">${t('noResults')}</p>`;
        $('#searchAll').href = href('search', { q: state.searchQuery, type: state.searchFilter !== 'all' ? state.searchFilter : '' });
    }

    const openSearchPanel = () => { const p = $('#searchPanel'); if (p) { p.hidden = false; renderHeaderResults(); } };
    const closeSearchPanel = () => { const p = $('#searchPanel'); if (p) p.hidden = true; };

    /* ---------- Chrome rendering & bindings ---------- */

    function applyFontScale() {
        state.fontScale = Math.min(1.25, Math.max(0.85, state.fontScale));
        document.documentElement.style.fontSize = (16 * state.fontScale) + 'px';
        store.set('vq2-font-scale', String(state.fontScale));
    }

    function bindHeader() {
        $('#langSelect').addEventListener('change', e => setLanguage(e.target.value));
        $('#increaseFont').addEventListener('click', () => { state.fontScale += 0.05; applyFontScale(); });
        $('#decreaseFont').addEventListener('click', () => { state.fontScale -= 0.05; applyFontScale(); });

        const input = $('#globalSearch');
        input.addEventListener('focus', openSearchPanel);
        input.addEventListener('input', () => { state.searchQuery = input.value; openSearchPanel(); });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') location.href = href('search', { q: input.value, type: state.searchFilter !== 'all' ? state.searchFilter : '' });
        });
        $('#searchSubmit').addEventListener('click', () => {
            if (input.value.trim()) location.href = href('search', { q: input.value });
            else { input.focus(); openSearchPanel(); }
        });
        $('#searchFilters').addEventListener('click', e => {
            const btn = e.target.closest('.search-filter');
            if (!btn) return;
            state.searchFilter = btn.getAttribute('data-filter');
            $$('.search-filter').forEach(el => el.classList.toggle('is-active', el === btn));
            renderHeaderResults();
        });
    }

    function renderChrome() {
        $('#siteHeader').innerHTML = headerHTML();
        bindHeader();
        $('#vqNav').innerHTML = navHTML();
        $('#vqWidgets').innerHTML = widgetsHTML();
        $('#siteFooter').innerHTML = footerHTML();
    }

    function mountShell() {
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="qtPage">
                <header id="siteHeader" class="header"></header>
                <aside id="vqNav" class="sidebar-left"></aside>
                <main class="content"><div id="pageContent" class="page"></div></main>
                <aside id="vqWidgets" class="sidebar-right"></aside>
                <div id="siteFooter" class="footer-wrapper"></div>
            </div>
            <div class="sidebar-backdrop" data-close-menu></div>
            <div id="vqModalRoot"></div>
            <div id="vqToast" class="toast" role="status" aria-live="polite"></div>`);
    }

    /* ---------- Language ---------- */

    function applyDirection() {
        document.documentElement.lang = state.lang;
        document.documentElement.dir = isAr() ? 'rtl' : 'ltr';
        document.body.classList.toggle('arabic', isAr());
        document.body.classList.toggle('english', !isAr());
    }

    function setLanguage(lang) {
        state.lang = lang === 'en' ? 'en' : 'ar';
        store.set('vq2-lang', state.lang);
        const url = new URL(location.href);
        if (url.searchParams.has('lang')) { url.searchParams.delete('lang'); history.replaceState(null, '', url.toString()); }
        applyDirection();
        closeModal();
        renderChrome();
        renderPage();
    }

    /* ---------- Modal ---------- */

    const MODAL_SIZES = { sm: 'modal--sm', md: 'modal--md', lg: 'modal--lg', xl: 'modal--xl' };

    function openModal({ title, icon, body, footer, size }) {
        stopVideos();
        $('#vqModalRoot').innerHTML = `
        <div class="modal-backdrop" data-modal-overlay>
            <div class="modal ${MODAL_SIZES[size] || 'modal--lg'}" role="dialog" aria-modal="true">
                <div class="modal-head">
                    <h3 class="modal-title"><i class="fa-solid ${icon || 'fa-circle-info'}"></i><span>${title}</span></h3>
                    <button type="button" data-modal-close class="modal-close" aria-label="${t('close')}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="modal-body">${body}</div>
                ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
            </div>
        </div>`;
        document.documentElement.classList.add('modal-open');
    }

    function closeModal() {
        const root = $('#vqModalRoot');
        if (!root || !root.innerHTML) return;
        stopVideos(root);
        root.innerHTML = '';
        document.documentElement.classList.remove('modal-open');
    }

    /* ---------- Toast ---------- */

    let toastTimer = null;

    function toast(message, icon) {
        const el = $('#vqToast');
        el.innerHTML = `<i class="fa-solid ${icon || 'fa-circle-check'}"></i><span>${esc(message)}</span>`;
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
    }

    function copyText(text) {
        try { navigator.clipboard.writeText(text); } catch (e) { /* clipboard not available */ }
    }

    /* ---------- Video player mock ---------- */

    const playing = new Set();
    const clock = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

    function toggleVideo(el) {
        const bar = $('[data-video-bar]', el);
        const time = $('[data-video-time]', el);
        const icon = $('[data-video-icon]', el);
        const length = el.getAttribute('data-length') || '05:00';
        const [m, s] = length.split(':').map(Number);
        const total = m * 60 + s;

        if (el._timer) {
            clearInterval(el._timer);
            el._timer = null;
            playing.delete(el);
            el.classList.remove('is-playing');
            icon.className = 'fa-solid fa-play';
            return;
        }
        el.classList.add('is-playing');
        icon.className = 'fa-solid fa-pause';
        playing.add(el);
        el._timer = setInterval(() => {
            el._pos = Math.min(total, (el._pos || 0) + Math.max(1, total / 160));
            bar.style.width = (el._pos / total * 100) + '%';
            time.textContent = `${clock(el._pos)} / ${length}`;
            if (el._pos >= total) toggleVideo(el);
        }, 200);
    }

    function stopVideos(scope) {
        playing.forEach(el => { if (!scope || scope.contains(el)) toggleVideo(el); });
    }

    /* ---------- Global delegated behaviours ---------- */

    function closeMenu() {
        document.body.classList.remove('menu-open');
        const btn = $('[data-toggle-menu]');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    function bindGlobal() {
        document.addEventListener('click', e => {
            const menuBtn = e.target.closest('[data-toggle-menu]');
            if (menuBtn) {
                const open = document.body.classList.toggle('menu-open');
                menuBtn.setAttribute('aria-expanded', String(open));
                return;
            }
            if (e.target.closest('[data-close-menu]')) { closeMenu(); return; }

            if (e.target.closest('[data-modal-close]') || e.target.matches('[data-modal-overlay]')) {
                closeModal();
                return;
            }

            const toastBtn = e.target.closest('[data-toast]');
            if (toastBtn) {
                e.preventDefault();
                toast(t(toastBtn.getAttribute('data-toast')), toastBtn.getAttribute('data-toast-icon'));
            }

            const copyBtn = e.target.closest('[data-copy]');
            if (copyBtn) {
                e.preventDefault();
                copyText(copyBtn.getAttribute('data-copy'));
                toast(t('copied'), 'fa-copy');
            }

            const zoom = e.target.closest('[data-doc-zoom]');
            if (zoom) {
                const viewer = zoom.closest('.doc-viewer');
                const pageEl = $('[data-doc-page]', viewer);
                const label = $('[data-doc-zoom-label]', viewer);
                const next = Math.min(1.5, Math.max(0.6, (parseFloat(pageEl.dataset.zoom) || 1) + Number(zoom.getAttribute('data-doc-zoom')) * 0.1));
                pageEl.dataset.zoom = next;
                pageEl.style.transform = `scale(${next})`;
                label.textContent = Math.round(next * 100) + '%';
            }

            const video = e.target.closest('[data-video]');
            if (video && (e.target.closest('[data-video-play]') || e.target.closest('[data-video-toggle]') || video.classList.contains('is-playing'))) {
                toggleVideo(video);
            }

            const wrap = $('#searchWrap');
            if (wrap && !wrap.contains(e.target)) closeSearchPanel();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeModal();
                closeSearchPanel();
                closeMenu();
            }
        });

        window.addEventListener('resize', () => { if (window.innerWidth > 1024) closeMenu(); });
    }

    /* ---------- Page lifecycle ---------- */

    function content(html) {
        $('#pageContent').innerHTML = html;
    }

    function renderPage() {
        stopVideos();
        page.render();
        if (page.title) document.title = `${page.title()} — Visit Qatar Intranet`;
    }

    /* Each page calls VQ.boot({ title, render, update, setup, afterBoot }) */
    function boot(def) {
        page = def;
        applyDirection();
        applyFontScale();
        mountShell();
        renderChrome();
        bindGlobal();
        if (def.setup) def.setup($('#pageContent'));
        renderPage();
        if (def.afterBoot) def.afterBoot();
    }

    window.VQ = {
        ROOT, PAGE, D, state, FALLBACK_IMG,
        $, $$, t, tx, esc, isAr,
        toDate, today, fmtDate, fmtRange, fmtDay, fmtMonth, daysUntil, status,
        href, param, photo, img, fileIcon, dept, deptName, isoDate,
        searchItems, openModal, closeModal, toast, copyText, stopVideos,
        content, boot, renderPage
    };
})();
