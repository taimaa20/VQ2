# Visit Qatar Intranet — Design Option 2 (static prototype)

Option 2 presents the **same portal as Option 1** — same screens, content, components, component order
and functional simplifications — in a **different visual direction based on the existing SPFx solution**.

- Functional / content baseline: Option 1 (`D:\Taimaa-NTX\VQ\VQ`)
- Visual / implementation reference: SPFx project (`D:\Taimaa-NTX\source\VQ\VQ - Sharepoint`)

Static HTML / CSS / vanilla JS only: no backend, API, authentication, real upload, submission or persistence.
Arabic (RTL, default) and English (LTR).

## Run

```bash
python -m http.server 5520
```

Open `http://localhost:5520/index.html` (add `?lang=en` for English; the header switch changes language on any page).

## Structure

```
index.html                Home (Option 1: option1.html)
pages/*.html              Inner pages — same 24 pages as Option 1
data/*.js                 Sample content — identical to Option 1's data files
assets/js/i18n.js         Interface text — Option 1 wording
assets/js/core.js         Shared shell (header · menu · side panel · footer), search, modal, toast, video mock
assets/js/components.js   Shared page building blocks (header, filters, tabs, pagination, facts, document viewer…)
assets/js/pages/*.js      One script per page (mirrors Option 1's page scripts)
assets/css/portal.css     All styles — SPFx tokens and class names
assets/fonts, assets/img  Visit Qatar / 29LT Bukra fonts, logo, circular artwork, certificate logos (from SPFx)
```

## Visual mapping to the SPFx solution

| Prototype | SPFx |
|---|---|
| Header (logo, galleries, search, font size, language, user) | `TopBar` |
| Teal menu with white active tab | `RightSidebar` |
| Side panel (weather, prayer times, system links, message/vision/mission, structure, hotlines) | `RightPanel` |
| Footer (social links, copyright, certificate logos) | `FooterBar` |
| Page canvas: breadcrumb pill, ruby-underlined title, pill filters, category tabs, pagination | `AdsPage` / `DetailsPage` |
| Circular tiles with colour bar | `HomePage` circulars |
| Horizontal listing cards | `AdsPage .listing-card` |
| Document table with upload area | `PolicyWebPart` |
| Hotlines tabs + table | `HotlinesPage` |
| Contact cards | `EmployeesPhonebook` |

The page canvas is one continuous surface: sections are separated by headings and dividers, not by cards.

## Illustrative only

Upload, download, edit, form submission, posting and voting show on-screen feedback but nothing is stored or sent.
Weather and prayer times are static values; documents and certificates open as static previews.
