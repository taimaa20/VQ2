# Visit Qatar Intranet — Design Option 2 (static prototype)

Option 2 is the second design proposal for the **same portal** as Option 1: same approved content, same
functional scope. Only the design differs.
 
| | Source of truth |
|---|---|
| **What** is on each screen (content, filters, actions, order) | Finalized Option 1 — `D:\Taimaa-NTX\VQ\VQ` (read only) |
| **How** it looks and is structured | Existing SPFx portal — `D:\Taimaa-NTX\source\VQ\VQ - Sharepoint` (read only) |

Option 2 is an improved version of the published SPFx portal. It is not a restyle of Option 1: none of
Option 1's layouts, cards, grids, CSS or Tailwind markup are reused. Only the sample data (`/data`) is shared,
so both options show the same information.

## Run

```bash
python .claude/serve.py 5530 .
```

Open `http://localhost:5530/index.html`. Add `?lang=en` for English, or switch language in the header.
Any static server works; `serve.py` only turns off caching.

Static HTML / CSS / vanilla JS. No backend, API, authentication, permissions, Power BI, SharePoint or framework.
Upload, download, sign-out, voting and form submission show on-screen feedback only.

## Structure

```
index.html                Home
pages/*.html              24 inner pages (same screens as Option 1)
data/*.js                 Sample content (Option 1's data)
assets/css/portal.css     All styles, SPFx tokens and class names
assets/js/i18n.js         Arabic / English interface text
assets/js/core.js         Portal shell (header, menu, side panel, footer), search, modal, toast, sliders
assets/js/components.js   Shared blocks written with SPFx markup (breadcrumb, titles, filters, listing card, pagination…)
assets/js/pages/*.js      One script per page (one "web part" per page)
assets/img/spfx/          Line icons copied from SPFx src/assets/img
assets/fonts              Visit Qatar and 29LT Bukra fonts (from SPFx)
```

## Portal shell (same on every page)

The layout follows the SPFx `IntranetPortalApplicationCustomizer` grid: header across the top; full-height
teal menu; page content; side panel; footer under content and panel.

| Area | SPFx component | Content (Option 1) |
|---|---|---|
| Header | `TopBar` | Logo, Photo Gallery, Video Gallery, search with type filters, text size (T−/T+), language, user photo/name/title/department, sign-out icon |
| Menu | `RightSidebar` | Teal gradient, amber top line, white active tab. **Expanded by default on desktop**; an arrow (left in English, right in Arabic) collapses it and a hamburger reopens it. Home, Departments (→ HR → Courses, VQ Structure), Announcements, Discounts, Certificates, Awards, Events, News, Survey, Policies, Hotlines, Photo Gallery, Video Gallery, User Guide, Employee Directory, Links (opens the side-panel link tiles in a popup) |
| Top strip | — | Under the header on every page: Theme of the Month ticker (home only, static message, right-to-left) with the current month under it (name from today's date, demo reminders in `data/month-focus.js`), and two compact widgets — next prayer + time, and the current temperature. Each opens the existing prayer / weather card in a small panel. |
| Side panel | `RightPanel` | Vision & mission (SPFx vision carousel), Qatar Visitor Statistics (demo card + dashboard-preview popup), Team Spotlight (demo card), links (compact icon tiles), hotlines |
| Footer | `FooterBar` | Social links, copyright, certificate logos |

Content rule: each page has one breadcrumb pill, then **one white surface**. Sections inside it are separated
by a ruby-underlined heading and a divider, not by separate cards.

## Page mapping

| Page | Option 1 content kept | Built from SPFx |
|---|---|---|
| Home | Internal Comms Circulars + Employee Relations Circulars (one featured card + up to 4 links each) → VQ Calendar (event day · today · official holiday, month arrows) → VQ & QT Events → Tradeshows & Roadshows → Latest News (6) → Discounts (slider) | `HomePage`: `offers-header-of` headings with ruby "Show All", two circular boxes split by publishing team, event listing-card carousel (2 per view), news-card carousel, offer-card carousel |
| Announcements · details | Search, type filter, 6 per page · type, number, dates, body, attachment preview, related link | `AdsPage` listing rows · `DetailsPage` (title, ruby date, image, facts, inline document, back pill) |
| Events · details | Search, category, date range, list / month calendar, next event, 4 per page · dates, location, facts, album link | `AdsPage` + `NewHomePage` arch banner for the next event · `DetailsPage` with (From)–(To) dates |
| Discounts · details | Search, category, percentage, partner, expiry, 6 per page · terms, time left, offer document | `AdsPage` discount category tabs and card grid · `DetailsPage` |
| News · details | Search, category, top story, 4 per page | `AdsPage` rows with `HomePage` news-card as the top story · `DetailsPage` |
| Certificates | Search, date, certificate preview | `AdsPage` card grid + document popup |
| Awards | Illustrative entries | `AdsPage` listing rows |
| Policies, Procedures & Forms | Search, type, name / description / modified date, view, download | `PolicyWebPart` search + category + file table |
| Hotlines | Search, two tabs, table, copy / call | `HotlinesPage` tabs + bordered table |
| Departments | Department selector, search, folders, files (view only) | `SharedFolder` / `DocumentLibrary` folder rows, breadcrumb bar, files table, with `EmployeesPhonebook` tabs as the selector |
| Employee Directory | Search, department, photo, name, ID, position, department, profile | `EmployeesPhonebook` search, department tabs, contact cards |
| Courses · details | Search, type, start date, duration, video, 6 per page · overview, objectives, format, provider | No SPFx page. Built from `AdsPage` rows and `DetailsPage`. Reached from Departments → HR |
| User Guide | Search, system filter, videos / illustrated steps / links | No SPFx page. Built from `AdsPage` tabs and card grid, popup |
| Survey | Quick polls with results, in-depth survey form | No SPFx page. Built from `HotlinesPage` tabs, category-tab options, popup form |
| Photo Gallery · album | Search, albums, full-size viewer | TopBar gallery page, `AdsPage` card grid · `DetailsPage` |
| Video Gallery | Now playing, search, category, grid | TopBar gallery page, `DetailsPage` media frame, `AdsPage` card grid |
| Structure & Guide | Chart, structure file | `DetailsPage` vocabulary (BRD 6.1.10; reached from Departments → HR → **VQ Structure**) |
| Discussion Board | Anonymous / alias posting, replies, likes, poll | Popup form rows, category tabs (not a menu item) |
| Search | Query, type filters, results | `SearchResultsPage` |

## Intentional differences from Option 1

- **Policies:** no upload box, row checkboxes, bulk download or edit icons. Per-row view and download remain.
- **Events:** no map or map placeholder anywhere. The Home calendar is a month view plus that month's events.
- **Details pages:** no share, add-to-calendar, registration, favourite or save actions.
- **Survey:** quick polls and in-depth surveys sit on two tabs instead of one stacked page.
- **Side panel:** message, vision and mission rotate in the SPFx carousel. Weather (6-day forecast) and prayer times moved out of the panel into the compact top widgets; a Qatar Visitor Statistics card sits under vision & mission.
- **Prototype data:** the Visitor Statistics figures are invented demo values behind a "sample data" badge — not Qatar tourism statistics. Tawasol is hidden (`hidden: true` in `data/user-guide.js`), not deleted.
- **Header:** adds the SPFx sign-out icon, which only shows a notice.
- **SPFx items left out because Option 1 does not have them:** the Home banner slider and the separate announcements / circulars blocks. Home keeps Option 1's four sections.
