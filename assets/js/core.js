/* ==========================================================================
   Visit Qatar Intranet — Design Option 2 (static prototype)
   core.js — language, formatting, the shared portal shell and shared behaviour.

   Shell = the SPFx IntranetPortalApplicationCustomizer layout:
     .header        TopBar       (logo · galleries · search · text size · language · user · sign-out)
     .sidebar-left  RightSidebar (teal menu with the white active tab)
     .content       page canvas  (one web part per page, rendered by assets/js/pages/*.js)
     .sidebar-right RightPanel   (system links · weather · prayer times · message/vision/mission ·
                                  structure & guide · hotlines)
     .footer        FooterBar    (social links · copyright · certificate logos)
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

    /* Pick the current language from a {ar, en} object */
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

    const locale = () => (isAr() ? 'ar-u-nu-latn' : 'en-GB');
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
        return new Intl.DateTimeFormat(locale(), opts).format(toDate(iso));
    }

    /* SPFx card date: "Sat, 12 Sep 2026" */
    function fmtCardDate(iso) {
        if (!iso) return '';
        if (!isAr()) {
            const wd = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(toDate(iso));
            return `${wd}, ${fmtDay(iso)} ${fmtMonth(iso)} ${toDate(iso).getFullYear()}`;
        }
        return new Intl.DateTimeFormat(locale(), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
            .format(toDate(iso)).replace(/،/g, '');
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
        return `<img src="${photo(src, w)}" alt="${esc(alt || '')}"${cls ? ` class="${cls}"` : ''} loading="lazy" onerror="this.onerror=null;this.src=VQ.FALLBACK_IMG;">`;
    }

    /* SPFx line icons (src/assets/img) tinted through CSS mask.
       Absolute URL: a relative url() inside a custom property resolves against the stylesheet, not the page */
    const ICON_BASE = new URL(ROOT + '/assets/img/spfx/', location.href).href;
    const icon = (name, cls) => `<span class="mask-icon ${cls || ''}" style="--icon:url('${ICON_BASE}${name}.svg')" aria-hidden="true"></span>`;

    function fileIcon(nameOrExt) {
        const ext = String(nameOrExt).split('.').pop().toLowerCase();
        const map = {
            pdf: ['fa-file-pdf', '#c2262e'], doc: ['fa-file-word', '#2b6cb0'], docx: ['fa-file-word', '#2b6cb0'],
            xls: ['fa-file-excel', '#157347'], xlsx: ['fa-file-excel', '#157347'], ppt: ['fa-file-powerpoint', '#c2410c'],
            pptx: ['fa-file-powerpoint', '#c2410c'], zip: ['fa-file-zipper', '#b7791f'], png: ['fa-file-image', '#6d28d9'], jpg: ['fa-file-image', '#6d28d9']
        };
        const [iconName, color] = map[ext] || ['fa-file-lines', '#64748b'];
        return { icon: iconName, color, ext: ext.toUpperCase() };
    }

    const dept = key => (D.departments || []).find(d => d.key === key);
    const deptName = key => (dept(key) ? tx(dept(key).name) : '');

    /* ---------- Menu (Option 1 menu items and order) ---------- */

    const NAV_MAIN = [
        { key: 'navHome', icon: 'fa-solid fa-table-cells-large', page: 'home' },
        { key: 'navDepts', icon: 'fa-solid fa-sitemap', page: 'departments' },
        { key: 'navAnnouncements', icon: 'fa-solid fa-bullhorn', page: 'announcements', also: ['announcement-details'] },
        { key: 'navDiscounts', icon: 'fa-solid fa-tags', page: 'discounts', also: ['discount-details'] },
        { key: 'navCerts', icon: 'fa-solid fa-certificate', page: 'certificates' },
        { key: 'navAwards', icon: 'fa-solid fa-award', page: 'awards' },
        { key: 'navEvents', icon: 'fa-regular fa-calendar-check', page: 'events', also: ['event-details'] },
        { key: 'navNews', icon: 'fa-regular fa-newspaper', page: 'news', also: ['news-details'] },
        { key: 'navSurveys', icon: 'fa-solid fa-square-poll-vertical', page: 'surveys' },
        { key: 'navPolicies', icon: 'fa-regular fa-folder-open', page: 'policies' },
        { key: 'navHotlines', icon: 'fa-solid fa-headset', page: 'hotlines' },
        { key: 'navPhotos', icon: 'fa-solid fa-images', page: 'photo-gallery', also: ['album'] },
        { key: 'navVideos', icon: 'fa-solid fa-circle-play', page: 'video-library' },
        { key: 'navCourses', icon: 'fa-solid fa-graduation-cap', page: 'courses', also: ['course-details'] },
        { key: 'navUserGuide', icon: 'fa-solid fa-book-open', page: 'user-guide' },
        { key: 'navEmployees', icon: 'fa-regular fa-address-book', page: 'employees' }
    ];
    /* Discussion Board and VQ Structure pages exist but are not menu items (as in Option 1) */

    const isCurrent = n => n.page === PAGE || (n.also || []).indexOf(PAGE) !== -1;

    /* ---------- Header (TopBar) ---------- */

    const USER_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    /* SPFx TopBar line icons, inlined so they always render in currentColor
       (a CSS mask image is blocked when the prototype is opened from disk) */
    const T_GLYPH = '<path d="M12.333 21H6.33301M9.33301 3.5V21M9.33301 3.5C7.94563 3.5 6.16348 3.6431 4.74462 3.78404C4.14451 3.84365 3.84445 3.87346 3.57886 3.97858C3.02645 4.19724 2.58116 4.67664 2.41358 5.23315C2.33301 5.50071 2.33301 5.80603 2.33301 6.41667M9.33301 3.5C10.7204 3.5 12.5025 3.6431 13.9214 3.78404C14.5215 3.84365 14.8216 3.87346 15.0872 3.97858C15.6396 4.19724 16.0849 4.67664 16.2524 5.23315C16.333 5.50071 16.333 5.80603 16.333 6.41667" stroke-width="1.98333" stroke-linecap="round"/>';
    const HEADER_ICONS = {
        'gallery': ['0 0 24 24', '<path d="M4.27209 20.7279L10.8686 14.1314C11.2646 13.7354 11.4627 13.5373 11.691 13.4632C11.8918 13.3979 12.1082 13.3979 12.309 13.4632C12.5373 13.5373 12.7354 13.7354 13.1314 14.1314L19.6839 20.6839M14 15L16.8686 12.1314C17.2646 11.7354 17.4627 11.5373 17.691 11.4632C17.8918 11.3979 18.1082 11.3979 18.309 11.4632C18.5373 11.5373 18.7354 11.7354 19.1314 12.1314L22 15M10 9C10 10.1046 9.10457 11 8 11C6.89543 11 6 10.1046 6 9C6 7.89543 6.89543 7 8 7C9.10457 7 10 7.89543 10 9ZM6.8 21H17.2C18.8802 21 19.7202 21 20.362 20.673C20.9265 20.3854 21.3854 19.9265 21.673 19.362C22 18.7202 22 17.8802 22 16.2V7.8C22 6.11984 22 5.27976 21.673 4.63803C21.3854 4.07354 20.9265 3.6146 20.362 3.32698C19.7202 3 18.8802 3 17.2 3H6.8C5.11984 3 4.27976 3 3.63803 3.32698C3.07354 3.6146 2.6146 4.07354 2.32698 4.63803C2 5.27976 2 6.11984 2 7.8V16.2C2 17.8802 2 18.7202 2.32698 19.362C2.6146 19.9265 3.07354 20.3854 3.63803 20.673C4.27976 21 5.11984 21 6.8 21Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'],
        'video-play': ['0 0 24 24', '<path d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.51953 7.11035H21.4795M8.51953 2.11035V6.97035M15.4805 2.11035V6.52035" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.75 14.4501V13.2501C9.75 11.7101 10.84 11.0801 12.17 11.8501L13.21 12.4501L14.25 13.0501C15.58 13.8201 15.58 15.0801 14.25 15.8501L13.21 16.4501L12.17 17.0501C10.84 17.8201 9.75 17.1901 9.75 15.6501V14.4501Z" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>'],
        'T-moins': ['0 0 28 28', T_GLYPH + '<path d="M21.4044 18.9458V20.9212H15.2926V18.9458H21.4044Z" fill="currentColor" stroke="none"/>'],
        'T-plus': ['0 0 28 28', T_GLYPH + '<path d="M19.2367 24.7858V15.6116H21.3182V24.7858H19.2367ZM15.6903 21.2394V19.158H24.8646V21.2394H15.6903Z" fill="currentColor" stroke="none"/>'],
        'logout': ['0 0 18 17', '<path d="M5.66667 12.6667L1.5 8.5M1.5 8.5L5.66667 4.33333M1.5 8.5H11.5M11.5 1H12.5C13.9001 1 14.6002 1 15.135 1.27248C15.6054 1.51217 15.9878 1.89462 16.2275 2.36502C16.5 2.8998 16.5 3.59987 16.5 5V12C16.5 13.4001 16.5 14.1002 16.2275 14.635C15.9878 15.1054 15.6054 15.4878 15.135 15.7275C14.6002 16 13.9001 16 12.5 16H11.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>']
    };
    const headerIcon = name => `<svg class="hdr-icon" viewBox="${HEADER_ICONS[name][0]}" fill="none" stroke="currentColor" aria-hidden="true" focusable="false">${HEADER_ICONS[name][1]}</svg>`;

    function headerHTML() {
        return `<div class="top-bar">
            <div class="header-start">
                <a href="${href('home')}" class="header-logo" title="${t('logoHome')}" aria-label="${t('logoHome')}">
                    <img src="${ROOT}/assets/img/vq-logo.svg" alt="Visit Qatar">
                </a>
                <button type="button" class="menu-toggle" id="menuToggle" aria-controls="siteMenu" aria-expanded="false" aria-label="${t('openMenu')}">
                    <i class="fa-solid fa-bars" aria-hidden="true"></i>
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>

            <div class="navbar-right">
                <div class="search-box" id="searchWrap">
                    <button type="button" class="search-toggle" id="searchToggle" aria-expanded="false" aria-controls="globalSearch" aria-label="${t('searchLabel')}">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                    <label class="search-field">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        <span class="sr-only">${t('searchLabel')}</span>
                        <input id="globalSearch" type="search" autocomplete="off" enterkeyhint="search" inputmode="search" value="${esc(state.searchQuery)}" placeholder="${t('searchPlaceholder')}">
                    </label>
                    <div class="search-panel" id="searchPanel" hidden>
                        <div class="search-panel-filters" id="searchFilters" role="group" aria-label="${t('searchFiltersTitle')}">
                            ${['all', 'pages', 'people', 'documents', 'images', 'videos'].map(f => `<button type="button" class="discount-category-tab ${state.searchFilter === f ? 'active' : ''}" data-filter="${f}">${t('filter' + f.charAt(0).toUpperCase() + f.slice(1))}</button>`).join('')}
                        </div>
                        <div class="search-panel-results" id="searchResults"></div>
                        <a class="search-panel-all" id="searchAll" href="${href('search')}">${t('searchViewAll')}</a>
                    </div>
                </div>

                <div class="header-tools">
                <div class="text-size" role="group" aria-label="Font size">
                    <button type="button" id="decreaseFont" title="${t('decreaseFont')}" aria-label="${t('decreaseFont')}">${headerIcon('T-moins')}</button>
                    <button type="button" id="increaseFont" title="${t('increaseFont')}" aria-label="${t('increaseFont')}">${headerIcon('T-plus')}</button>
                </div>

                <label class="navbar-language">
                    <span class="sr-only">${t('languageLabel')}</span>
                    <select id="languageSelect">
                        <option value="ar" ${isAr() ? 'selected' : ''}>AR</option>
                        <option value="en" ${!isAr() ? 'selected' : ''}>EN</option>
                    </select>
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </label>

                <div class="profile" data-profile-menu>
                    <button type="button" class="profile-trigger" data-profile-trigger aria-expanded="false" aria-label="${t('userName')}">
                        <img src="${USER_PHOTO}" alt="${t('userName')}" onerror="this.onerror=null;this.src='${ROOT}/assets/img/spfx/user.svg';">
                    </button>
                    <div class="profile-dropdown" role="menu" aria-label="${t('userName')}">
                        <div class="profile-user-card">
                            <img src="${USER_PHOTO}" alt="${t('userName')}" onerror="this.onerror=null;this.src='${ROOT}/assets/img/spfx/user.svg';">
                            <div>
                                <strong>${t('userName')}</strong>
                                <span>${t('userTitle')}</span>
                                <small>${t('userDept')}</small>
                            </div>
                        </div>
                        <div class="profile-divider"></div>
                        <a href="${href('employees')}" class="profile-menu-link"><i class="fa-solid fa-id-card"></i><span>${t('emProfile')}</span></a>
                        <a href="#" class="profile-menu-link logout-link" data-toast="logoutDemo" data-toast-icon="fa-right-from-bracket"><i class="fa-solid fa-right-from-bracket"></i><span>${t('logout')}</span></a>
                    </div>
                </div>
                </div>
            </div>
        </div>`;
    }

    /* ---------- Menu (RightSidebar) ---------- */

    function menuHTML() {
        return `<div class="sidebar-shell">
            <div class="sidebar-header">
                <p class="sidebar-title">${t('navMenu')}</p>
                <button type="button" class="sidebar-collapse-toggle" id="sidebarCollapseToggle" aria-label="${t('openMenu')}" aria-expanded="true">
                    <i class="fa-solid fa-bars" aria-hidden="true"></i>
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <a href="${href('home')}" class="sidebar-brand" title="${t('logoHome')}" aria-label="${t('logoHome')}">
                    <img src="${ROOT}/assets/img/spfx/vq-logo-white.svg" alt="Visit Qatar" class="sidebar-brand-image">
                </a>
            </div>
            <nav class="sidebar" aria-label="${t('navMenu')}">
                <ul class="nav-list">
                    ${NAV_MAIN.map(n => `<li><a href="${href(n.page)}" class="nav-item ${isCurrent(n) ? 'is-active' : ''}" ${isCurrent(n) ? 'aria-current="page"' : ''} data-label="${esc(t(n.key))}" title="${esc(t(n.key))}">
                        <span class="nav-icon"><i class="${n.icon}"></i></span><span class="nav-label">${t(n.key)}</span></a></li>`).join('')}
                </ul>
            </nav>
        </div>`;
    }

    /* ---------- Side panel (RightPanel) — Option 1's shared content, same order ---------- */

    const WEATHER = [
        { icon: 'fa-sun wx-sun', label: 'wxSunny', hi: 36, lo: 29 },
        { icon: 'fa-sun wx-sun', label: 'wxSunny', hi: 37, lo: 30 },
        { icon: 'fa-cloud-sun wx-cloud-sun', label: 'wxPartly', hi: 35, lo: 29 },
        { icon: 'fa-cloud wx-cloud', label: 'wxCloudy', hi: 34, lo: 28 },
        { icon: 'fa-sun wx-sun', label: 'wxSunny', hi: 36, lo: 29 },
        { icon: 'fa-sun wx-sun', label: 'wxSunny', hi: 37, lo: 30 },
        { icon: 'fa-cloud-sun wx-cloud-sun', label: 'wxPartly', hi: 38, lo: 31 }
    ];

    const PRAYERS = [
        ['prFajr', '04:15', 'time-fajr', 'fa-moon'],
        ['prSunrise', '05:19', 'time-sunrise', 'fa-sun'],
        ['prDhuhr', '11:30', 'time-dhuhr', 'fa-sun', true],
        ['prAsr', '14:59', 'time-asr', 'fa-cloud-sun'],
        ['prMaghrib', '17:40', 'time-maghrib', 'fa-cloud-moon'],
        ['prIsha', '19:10', 'time-isha', 'fa-star-and-crescent']
    ];

    /* Scrollable list — add as many system links as needed */
    const SYSTEMS = [
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

    const STATEMENTS = [
        ['photo-1500530855697-b586d89ba3ee', 'hpVisionTitle', 'hpVisionText'],
        ['photo-1486406146926-c627a92ad1ab', 'hpMissionTitle', 'hpMissionText'],
        ['photo-1529156069898-49953e39b3ac', 'hpMessageTitle', 'hpMessageText']
    ];

    const panelHead = (title, aside) => `<div class="panel-head">
        <div class="link-text"><span class="vertical-line"></span><h3>${title}</h3></div>
        ${aside ? `<span class="panel-aside">${aside}</span>` : ''}
    </div>`;

    function hijriToday() {
        try {
            return new Intl.DateTimeFormat(isAr() ? 'ar-u-ca-islamic-umalqura-nu-latn' : 'en-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(today());
        } catch (e) {
            return fmtDate(isoDate(today()));
        }
    }

    function panelHTML() {
        const base = today();
        const dayName = (offset, style) => {
            const d = new Date(base);
            d.setDate(d.getDate() + offset);
            return new Intl.DateTimeFormat(locale(), { weekday: style }).format(d);
        };
        const w0 = WEATHER[0];

        return `<div class="prayer-times-section">
            <section class="links-section" aria-label="${t('hpSystems')}">
                ${panelHead(t('hpSystems'))}
                <ul class="links-list">
                    ${SYSTEMS.map(([url, ic, key]) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer">
                        <span class="link-icon"><i class="${ic}"></i></span><span class="link-label">${t(key)}</span></a></li>`).join('')}
                </ul>
            </section>

            <section class="panel-box weather-box" aria-label="${t('hpWeather')}">
                ${panelHead(t('hpWeather'), `<i class="fa-solid fa-location-dot"></i> ${t('wxCity')}`)}
                <div class="weather-today">
                    <div>
                        <p class="weather-today-heading">${t('panelToday')} <span class="weather-day-name">· ${dayName(0, 'long')}</span></p>
                        <p class="weather-temp">${w0.hi}° <small>/ ${w0.lo}°</small></p>
                        <p class="weather-label">${t(w0.label)}</p>
                    </div>
                    <i class="fa-solid ${w0.icon} weather-today-icon" aria-hidden="true"></i>
                </div>
                <div class="weather-forecast-grid">
                    ${WEATHER.slice(1).map((w, i) => `<div class="weather-forecast-item">
                        <span class="weather-day-name">${dayName(i + 1, 'short')}</span>
                        <i class="fa-solid ${w.icon}" aria-hidden="true"></i>
                        <span class="weather-temp-range">${w.hi}° <span class="low">/ ${w.lo}°</span></span>
                    </div>`).join('')}
                </div>
            </section>

            <section class="prayer-card" aria-label="${t('hpPrayer')}">
                <div class="prayer-card-header">
                    <span class="prayer-card-header-icon"><i class="fa-solid fa-mosque"></i></span>
                    <h3 class="prayer-card-title">${t('hpPrayer')}</h3>
                    <p class="prayer-card-subtitle">${hijriToday()}</p>
                </div>
                <div class="times">
                    ${PRAYERS.map(([key, time, cls, ic, next]) => `<div class="time-item ${cls} ${next ? 'is-next' : ''}">
                        ${next ? `<span class="next-flag">${t('prNext')}</span>` : ''}
                        <span class="time-item-icon"><i class="fa-solid ${ic}"></i></span>
                        <span class="time-item-name">${t(key)}</span>
                        <span class="time-item-value">${time}</span>
                    </div>`).join('')}
                </div>
                <p class="prayer-source">${t('hpPrayerSource')}</p>
            </section>

            <section class="panel-box" aria-label="${t('hpVision')}">
                ${panelHead(t('hpVision'))}
                <div class="panel-body">
                    <div class="qatar-tourism-category" data-vision>
                        ${STATEMENTS.map(([imgId, title, text], i) => `<article class="vision-slide ${i === 0 ? 'active' : ''}">
                            ${img(imgId, '', 500)}
                            <h4 class="qatar-card-title">${t(title)}</h4>
                            <p class="qatar-card-text">${t(text)}</p>
                        </article>`).join('')}
                        <div class="vision-dots">${STATEMENTS.map((s, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-vision-dot="${i}" aria-label="${t(s[1])}"></button>`).join('')}</div>
                    </div>
                </div>
            </section>

            <section class="panel-box" aria-label="${t('hpStructure')}">
                ${panelHead(t('hpStructure'))}
                <div class="panel-body">
                    <a href="${href('structure')}" class="structure-link">
                        ${img('photo-1552664730-d307ca884978', '', 600, t('hpStructure'))}
                        <span><i class="fa-solid fa-sitemap"></i>${t('stOpen')}</span>
                    </a>
                    <p class="panel-text">${t('hpStructureText')}</p>
                </div>
            </section>

            <section class="panel-box" aria-label="${t('navHotlines')}">
                ${panelHead(t('navHotlines'))}
                <div class="panel-body">
                    <p class="panel-text" style="margin-top:0">${t('hpHotlinesText')}</p>
                    <a href="${href('hotlines')}" class="btn btn-primary btn-sm"><i class="fa-solid fa-phone-volume"></i>${t('hpHotlinesBtn')}</a>
                </div>
            </section>
        </div>`;
    }

    /* ---------- Footer (FooterBar) ---------- */

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
            <div class="start-links" aria-label="Visit Qatar social media">
                ${social.map(([url, name, ic]) => `<a class="link-chip" href="${url}" target="_blank" rel="noopener noreferrer" title="${name}" aria-label="${name}"><i class="fa-brands ${ic}"></i></a>`).join('')}
            </div>
            <p class="copyright">${t('copyrightPrefix')} © Visit Qatar ${new Date().getFullYear()}</p>
            <div class="end-links">
                <a class="cert-logos" href="${href('certificates')}" title="${t('footerCerts')}"><img src="${ROOT}/assets/img/logos-color.jpg" alt="${t('footerCerts')}"></a>
                <a class="cert-logos iso-cert" href="${href('certificates', { cert: 'iso-21902' })}" title="${t('footerIso')}"><img src="${ROOT}/assets/img/spfx/ISO.png" alt="${t('footerIso')}"></a>
            </div>
        </footer>`;
    }

    /* ---------- Search index (all static data) ---------- */

    function searchIndex() {
        const list = [];
        const both = v => (typeof v === 'object' ? Object.values(v).join(' ') : String(v));
        const add = (type, ic, title, meta, url, extra) =>
            list.push({ type, icon: ic, title: tx(title), meta, url, haystack: (both(title) + ' ' + meta + ' ' + (extra || '')).toLowerCase() });

        NAV_MAIN.forEach(n => add('pages', n.icon, { ar: I18N.ar[n.key], en: I18N.en[n.key] }, t('filterPages'), href(n.page)));
        (D.announcements || []).forEach(a => add('pages', 'fa-solid fa-bullhorn', a.title, `${t('navAnnouncements')} · ${a.number}`, href('announcement-details', { id: a.id }), both(a.summary)));
        (D.events || []).forEach(e => add('pages', 'fa-regular fa-calendar-check', e.title, `${t('navEvents')} · ${fmtDate(e.start)}`, href('event-details', { id: e.id }), both(e.location)));
        (D.news || []).forEach(n => add('pages', 'fa-regular fa-newspaper', n.title, `${t('navNews')} · ${fmtDate(n.date)}`, href('news-details', { id: n.id })));
        (D.discounts || []).forEach(d => add('pages', 'fa-solid fa-tags', d.title, `${t('navDiscounts')} · ${d.percent}%`, href('discount-details', { id: d.id }), both(d.partner)));
        (D.courses || []).forEach(c => add('pages', 'fa-solid fa-graduation-cap', c.title, `${t('navCourses')} · ${tx(c.duration)}`, href('course-details', { id: c.id })));
        (D.employees || []).forEach(p => add('people', 'fa-solid fa-user', p.name, `${tx(p.position)} · ${deptName(p.department)}`, href('employees', { id: p.id }), p.id + ' ' + both(p.position)));
        (D.policies || []).forEach(doc => add('documents', 'fa-solid ' + fileIcon(doc.ext).icon, doc.title, `${fileIcon(doc.ext).ext} · ${t('navPolicies')}`, href('policies', { doc: doc.id })));
        (D.certificates || []).forEach(c => add('documents', 'fa-solid fa-certificate', { ar: `${c.standard} — ${c.title.ar}`, en: `${c.standard} — ${c.title.en}` }, t('navCerts'), href('certificates', { cert: c.id })));
        (D.albums || []).forEach(a => add('images', 'fa-regular fa-image', a.title, `${t('navPhotos')} · ${t('pgPhotos', { n: a.photos.length })}`, href('album', { id: a.id })));
        (D.videos || []).forEach(v => add('videos', 'fa-regular fa-circle-play', v.title, `${t('navVideos')} · ${v.length}`, href('video-library', { id: v.id })));
        (D.guides || []).forEach(g => {
            const type = g.kind === 'video' ? 'videos' : g.kind === 'image' ? 'images' : 'pages';
            const ic = g.kind === 'video' ? 'fa-regular fa-circle-play' : g.kind === 'image' ? 'fa-regular fa-image' : 'fa-solid fa-arrow-up-right-from-square';
            add(type, ic, g.title, t('navUserGuide'), href('user-guide', { id: g.id }));
        });
        return list;
    }

    function searchItems(query, filter) {
        const q = String(query || '').trim().toLowerCase();
        return searchIndex().filter(item => (filter === 'all' || !filter || item.type === filter) && (!q || item.haystack.indexOf(q) !== -1));
    }

    const resultRow = item => `<a href="${item.url}" class="result-row">
        <span class="result-icon"><i class="${item.icon}"></i></span>
        <span class="result-text"><span class="result-title">${esc(item.title)}</span><span class="result-meta">${esc(item.meta)}</span></span>
    </a>`;

    function renderHeaderResults() {
        const box = $('#searchResults');
        if (!box) return;
        const items = searchItems(state.searchQuery, state.searchFilter).slice(0, 6);
        box.innerHTML = items.length ? items.map(resultRow).join('') : `<p class="search-panel-empty">${t('noResults')}</p>`;
        $('#searchAll').href = href('search', { q: state.searchQuery, type: state.searchFilter !== 'all' ? state.searchFilter : '' });
    }

    const searchOverlayQuery = window.matchMedia('(max-width: 1024px)');
    const syncSearchBackdrop = open => document.body.classList.toggle('search-open', open && searchOverlayQuery.matches);
    const openSearchPanel = () => {
        const p = $('#searchPanel');
        if (p) { p.hidden = false; renderHeaderResults(); }
        syncSearchBackdrop(true);
    };
    const closeSearchPanel = () => {
        const p = $('#searchPanel');
        if (p) p.hidden = true;
        const input = $('#globalSearch');
        if (input && document.activeElement === input) input.blur();
        syncSearchBackdrop(false);
    };
    function focusSearchInput() {
        const input = $('#globalSearch');
        if (!input) return;
        void input.offsetWidth;
        input.focus();
    }
    const compactSearchQuery = window.matchMedia('(max-width: 480px)');
    function setCompactSearch(open) {
        const wrap = $('#searchWrap');
        const toggle = $('#searchToggle');
        if (wrap) wrap.classList.toggle('is-open', open);
        if (toggle) toggle.setAttribute('aria-expanded', String(open));
        if (!open) closeSearchPanel();
    }

    /* ---------- Shell mount & bindings ---------- */

    function applyFontScale() {
        state.fontScale = Math.min(1.2, Math.max(0.85, Math.round(state.fontScale * 100) / 100));
        document.documentElement.style.fontSize = (16 * state.fontScale) + 'px';
        store.set('vq2-font-scale', String(state.fontScale));
    }

    function setMenu(open) {
        const wasOpen = document.body.classList.contains('menu-open');
        document.body.classList.toggle('menu-open', open);
        document.documentElement.classList.toggle('menu-open', open);
        const toggle = $('#menuToggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu'));
        }
        const sideToggle = $('#sidebarCollapseToggle');
        const mobile = window.innerWidth <= 1024;
        if (sideToggle && mobile) {
            sideToggle.setAttribute('aria-expanded', String(open));
            sideToggle.setAttribute('aria-label', t('closeMenu'));
        }
        if (mobile && wasOpen && !open && toggle && document.activeElement && $('#siteMenu')?.contains(document.activeElement)) {
            toggle.focus({ preventScroll: true });
        }
    }

    function setSidebarCollapsed(collapsed) {
        document.body.classList.toggle('nav-collapsed', collapsed);
        const sidebar = $('#siteMenu');
        if (sidebar) sidebar.classList.toggle('is-collapsed', collapsed);
        const toggle = $('#sidebarCollapseToggle');
        if (!toggle) return;
        if (window.innerWidth <= 1024) {
            const open = document.body.classList.contains('menu-open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', t('closeMenu'));
            return;
        }
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.setAttribute('aria-label', t(collapsed ? 'openMenu' : 'closeMenu'));
    }

    function closeProfileMenu() {
        const profile = $('[data-profile-menu]');
        if (!profile) return;
        profile.classList.remove('is-open');
        const trigger = $('[data-profile-trigger]', profile);
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }

    function bindHeader() {
        $('#languageSelect').addEventListener('change', e => setLanguage(e.target.value));
        $('#increaseFont').addEventListener('click', () => { state.fontScale += 0.05; applyFontScale(); });
        $('#decreaseFont').addEventListener('click', () => { state.fontScale -= 0.05; applyFontScale(); });
        $('#menuToggle').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

        const collapseToggle = $('#sidebarCollapseToggle');
        if (collapseToggle) {
            collapseToggle.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    setMenu(!document.body.classList.contains('menu-open'));
                    return;
                }
                const collapsed = document.body.classList.contains('nav-collapsed');
                setSidebarCollapsed(!collapsed);
            });
        }

        const profile = $('[data-profile-menu]');
        if (profile) {
            const trigger = $('[data-profile-trigger]', profile);
            trigger.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const open = !profile.classList.contains('is-open');
                closeProfileMenu();
                if (open) {
                    profile.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        }

        const input = $('#globalSearch');
        const searchToggle = $('#searchToggle');
        let searchOpenedByPointer = false;
        if (searchToggle) {
            searchToggle.addEventListener('pointerdown', () => {
                if (!compactSearchQuery.matches) return;
                const wrap = $('#searchWrap');
                if (!wrap || wrap.classList.contains('is-open')) return;
                searchOpenedByPointer = true;
                setCompactSearch(true);
                focusSearchInput();
            });
            searchToggle.addEventListener('click', () => {
                if (searchOpenedByPointer) {
                    searchOpenedByPointer = false;
                    focusSearchInput();
                    return;
                }
                const wrap = $('#searchWrap');
                const open = !(wrap && wrap.classList.contains('is-open'));
                setCompactSearch(open);
                if (open) focusSearchInput();
            });
        }
        input.addEventListener('focus', openSearchPanel);
        input.addEventListener('input', () => { state.searchQuery = input.value; openSearchPanel(); });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') location.href = href('search', { q: input.value, type: state.searchFilter !== 'all' ? state.searchFilter : '' });
        });
        $('#searchFilters').addEventListener('click', e => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            state.searchFilter = btn.getAttribute('data-filter');
            $$('#searchFilters [data-filter]').forEach(el => el.classList.toggle('active', el === btn));
            renderHeaderResults();
        });
    }

    let visionTimer = null;

    function showVision(i) {
        const box = $('[data-vision]');
        if (!box) return;
        const slides = $$('.vision-slide', box);
        const idx = (i + slides.length) % slides.length;
        box.dataset.index = idx;
        slides.forEach((s, n) => s.classList.toggle('active', n === idx));
        $$('[data-vision-dot]', box).forEach((d, n) => d.classList.toggle('active', n === idx));
    }

    function startVision() {
        clearInterval(visionTimer);
        visionTimer = setInterval(() => {
            const box = $('[data-vision]');
            if (box && !box.matches(':hover')) showVision(Number(box.dataset.index || 0) + 1);
        }, 5000);
    }

    function renderChrome() {
        document.body.classList.remove('search-open');
        $('#siteHeader').innerHTML = headerHTML();
        $('#siteMenu').innerHTML = menuHTML();
        bindHeader();
        $('#sidePanel').innerHTML = panelHTML();
        $('#siteFooter').innerHTML = footerHTML();
        startVision();
        if (window.innerWidth <= 1024) {
            setSidebarCollapsed(false);
        } else {
            setSidebarCollapsed(true);
        }
    }

    function mountShell() {
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="qt-page">
                <header class="header" id="siteHeader"></header>
                <aside class="sidebar-left" id="siteMenu"></aside>
                <main class="content" id="pageContent"></main>
                <aside class="sidebar-right" id="sidePanel"></aside>
                <div class="footer-wrapper" id="siteFooter"></div>
            </div>
            <div class="menu-backdrop" id="menuBackdrop"></div>
            <div class="search-backdrop" id="searchBackdrop" aria-hidden="true"></div>
            <div id="vqModalRoot"></div>
            <div id="vqToast" class="vq-toast" role="status" aria-live="polite"></div>`);
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
        url.searchParams.set('lang', state.lang);
        history.replaceState(null, '', url);
        applyDirection();
        closeModal();
        renderChrome();
        renderPage();
    }

    /* ---------- Modal (Policy .upload-popup pattern) ---------- */

    function openModal({ title, body, footer, size, flush }) {
        stopVideos();
        $('#vqModalRoot').innerHTML = `<div class="modal-overlay" data-modal-overlay>
            <div class="modal ${size ? 'is-' + size : ''}" role="dialog" aria-modal="true" aria-label="${esc(String(title).replace(/<[^>]+>/g, ''))}">
                <div class="modal-head"><h3>${title}</h3><button type="button" class="modal-close" data-modal-close aria-label="${t('close')}">&times;</button></div>
                <div class="modal-body ${flush ? 'flush' : ''}">${body}</div>
                ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
            </div>
        </div>`;
        document.documentElement.classList.add('no-scroll');
        const close = $('#vqModalRoot .modal-close');
        if (close) close.focus();
    }

    function closeModal() {
        const root = $('#vqModalRoot');
        if (!root || !root.innerHTML) return;
        stopVideos(root);
        root.innerHTML = '';
        document.documentElement.classList.remove('no-scroll');
    }

    /* ---------- Toast ---------- */

    let toastTimer = null;

    function toast(message, ic) {
        const el = $('#vqToast');
        el.innerHTML = `<div><i class="fa-solid ${ic || 'fa-circle-check'}"></i><span>${esc(message)}</span></div>`;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
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
        const ic = $('[data-video-icon]', el);
        const length = el.getAttribute('data-length') || '05:00';
        const [m, s] = length.split(':').map(Number);
        const total = m * 60 + s;

        if (el._timer) {
            clearInterval(el._timer);
            el._timer = null;
            playing.delete(el);
            el.classList.remove('is-playing');
            ic.className = 'fa-solid fa-play';
            return;
        }
        el.classList.add('is-playing');
        ic.className = 'fa-solid fa-pause';
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

    /* ---------- Sliders (owl-carousel equivalent) ---------- */

    function sliderPages(track) {
        const perView = parseInt(getComputedStyle(track).getPropertyValue('--per-view'), 10) || 1;
        return Math.max(1, Math.ceil(track.children.length / perView));
    }

    function sliderIndex(track) {
        const pages = sliderPages(track);
        const max = track.scrollWidth - track.clientWidth;
        if (max <= 0) return 0;
        return Math.round(Math.abs(track.scrollLeft) / max * (pages - 1));
    }

    function goSlide(slider, i, instant) {
        const track = $('.slider-track', slider);
        const pages = sliderPages(track);
        const idx = Math.max(0, Math.min(pages - 1, i));
        const max = track.scrollWidth - track.clientWidth;
        const pos = pages > 1 ? max * idx / (pages - 1) : 0;
        track.scrollTo({ left: getComputedStyle(track).direction === 'rtl' ? -pos : pos, behavior: instant ? 'auto' : 'smooth' });
        updateSlider(slider, idx);
    }

    function updateSlider(slider, forced) {
        const track = $('.slider-track', slider);
        const pages = sliderPages(track);
        const idx = forced != null ? forced : sliderIndex(track);
        const dots = $('.slider-dots', slider);
        if (dots && dots.children.length !== pages) {
            dots.innerHTML = Array.from({ length: pages }, (_, n) => `<button type="button" class="slider-dot" data-slide="${n}" aria-label="${n + 1}"></button>`).join('');
        }
        $$('.slider-dot', slider).forEach((d, n) => d.classList.toggle('active', n === idx));
        const prev = $('[data-slide-step="-1"]', slider);
        const next = $('[data-slide-step="1"]', slider);
        if (prev) prev.disabled = idx === 0;
        if (next) next.disabled = idx >= pages - 1;
        const foot = $('.slider-foot', slider);
        if (foot) foot.hidden = pages <= 1;
        slider.dataset.index = idx;
    }

    function initSliders(scope) {
        $$('[data-slider]', scope || document).forEach(slider => {
            if (slider._bound) { updateSlider(slider); return; }
            slider._bound = true;
            const track = $('.slider-track', slider);
            let raf = null;
            track.addEventListener('scroll', () => {
                cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => updateSlider(slider));
            }, { passive: true });
            slider.addEventListener('click', e => {
                const dot = e.target.closest('[data-slide]');
                if (dot) { goSlide(slider, Number(dot.dataset.slide)); return; }
                const step = e.target.closest('[data-slide-step]');
                if (step) goSlide(slider, Number(slider.dataset.index || 0) + Number(step.dataset.slideStep));
            });
            const auto = Number(slider.getAttribute('data-autoplay'));
            if (auto) {
                slider._timer = setInterval(() => {
                    if (!document.body.contains(slider)) { clearInterval(slider._timer); return; }
                    if (slider.matches(':hover')) return;
                    const pages = sliderPages(track);
                    goSlide(slider, (Number(slider.dataset.index || 0) + 1) % pages);
                }, auto);
            }
            updateSlider(slider, 0);
        });
    }

    /* Keep each slider on its current page when the column width changes */
    let resizeRaf = null;
    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => $$('[data-slider]').forEach(sl => goSlide(sl, Number(sl.dataset.index || 0), true)));
    });

    /* ---------- Global delegated behaviours ---------- */

    function bindGlobal() {
        document.addEventListener('click', e => {
            if (e.target.closest('[data-modal-close]') || e.target.matches('[data-modal-overlay]')) {
                closeModal();
                return;
            }
            if (e.target.closest('#menuBackdrop')) { setMenu(false); return; }

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

            const dot = e.target.closest('[data-vision-dot]');
            if (dot) { showVision(Number(dot.dataset.visionDot)); startVision(); }

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
            if (wrap && !wrap.contains(e.target)) {
                closeSearchPanel();
                if (compactSearchQuery.matches) setCompactSearch(false);
            }

            const profile = $('[data-profile-menu]');
            if (profile && !profile.contains(e.target)) closeProfileMenu();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                closeModal();
                closeSearchPanel();
                if (compactSearchQuery.matches) setCompactSearch(false);
                closeProfileMenu();
                setMenu(false);
            }
        });

        let drawerSwipe = null;
        document.addEventListener('touchstart', e => {
            if (!document.body.classList.contains('menu-open')) return;
            const drawer = $('#siteMenu');
            if (!drawer || !drawer.contains(e.target)) return;
            const touch = e.changedTouches[0];
            drawerSwipe = { x: touch.clientX, y: touch.clientY };
        }, { passive: true });
        document.addEventListener('touchend', e => {
            if (!drawerSwipe) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - drawerSwipe.x;
            const dy = touch.clientY - drawerSwipe.y;
            drawerSwipe = null;
            if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
            const rtl = document.documentElement.dir === 'rtl';
            if (rtl ? dx > 0 : dx < 0) setMenu(false);
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                setMenu(false);
                if (!document.body.classList.contains('nav-collapsed')) setSidebarCollapsed(true);
            } else {
                setSidebarCollapsed(false);
            }
        });
    }

    /* ---------- Page lifecycle ---------- */

    function content(html) {
        $('#pageContent').innerHTML = html;
        initSliders($('#pageContent'));
    }

    function renderPage() {
        stopVideos();
        page.render();
        if (page.title) document.title = `${page.title()} — Visit Qatar Intranet`;
    }

    /* Each page calls VQ.boot({ title, render, setup, afterBoot }) */
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
        $, $$, t, tx, esc, isAr, icon,
        toDate, today, fmtDate, fmtCardDate, fmtRange, fmtDay, fmtMonth, daysUntil, status, isoDate, locale,
        href, param, photo, img, fileIcon, dept, deptName,
        searchItems, openModal, closeModal, toast, copyText, stopVideos, initSliders,
        content, boot, renderPage
    };
})();
