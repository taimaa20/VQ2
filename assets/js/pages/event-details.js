/* Event details — BRD 7.3 & 8.5 · SPFx DetailsPage (?Event)
   Title · (From)–(To) dates · location pin · map · image · about · key details · photos link · back. */
(function () {
    const { t, tx, esc, ui, D } = VQ;
    const e = D.events.find(x => x.id === VQ.param('id')) || D.events[0];
    const catOf = key => D.eventCategories.find(c => c.key === key);

    const fallback = { lat: 25.2854, lng: 51.5310 };
    const lat = e.lat != null ? Number(e.lat) : fallback.lat;
    const lng = e.lng != null ? Number(e.lng) : fallback.lng;
    const query = (e.lat != null && e.lng != null)
        ? `${lat},${lng}`
        : [tx(e.location), tx(e.country)].filter(Boolean).join(', ');
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
    const dx = 0.02;
    const dy = 0.014;
    const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - dx},${lat - dy},${lng + dx},${lat + dy}&layer=mapnik&marker=${lat},${lng}`;
    const place = esc(tx(e.location));

    VQ.boot({
        title: () => tx(e.title),

        render() {
            const cat = catOf(e.category);
            VQ.content(ui.page([{ label: t('navEvents'), href: VQ.href('events') }, { label: tx(e.title) }],
                ui.detailsHead({
                    chips: ui.tag(tx(cat.label), '', cat.icon) + ui.statusTag(VQ.status(e.start, e.end)),
                    title: esc(tx(e.title)),
                    dates: ui.dateRange(e.start, e.end),
                    meta: [{
                        icon: 'fa-solid fa-location-dot',
                        text: `<a class="event-map-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${place}</a>`
                    }]
                }) +
                `<div class="details-img">${VQ.img(e.image, '', 1400, tx(e.title))}${ui.cardDate(e.start, 'is-bottom')}</div>` +
                `<section class="event-map-card" aria-label="${t('location')}">
                    <div class="event-map-pin">
                        <span class="event-map-pin-icon" aria-hidden="true"><i class="fa-solid fa-location-dot"></i></span>
                        <div>
                            <p class="event-map-place">${place}${e.country ? `<span> · ${esc(tx(e.country))}</span>` : ''}</p>
                            <a class="event-map-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${t('evOpenMap')} ${ui.arrow()}</a>
                        </div>
                    </div>
                    <iframe class="event-map-frame" src="${osmEmbed}" title="${t('location')} — ${place}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </section>` +
                ui.block(t('evAbout'), ui.paragraphs(e.body)) +
                `<div style="margin-top:1.25rem">` + ui.facts([
                    { icon: 'fa-hashtag', label: t('evNumber'), value: `<span class="ltr">${e.number}</span>` },
                    { icon: 'fa-building', label: t('department'), value: VQ.deptName(e.department) },
                    { icon: 'fa-calendar-plus', label: t('startDate'), value: VQ.fmtDate(e.start) },
                    { icon: 'fa-calendar-xmark', label: t('endDate'), value: VQ.fmtDate(e.end) },
                    { icon: 'fa-location-dot', label: t('location'), value: `<a class="event-map-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">${place}</a>` }
                ]) + (e.album ? `<p style="margin-top:1.1rem"><a href="${VQ.href('album', { id: e.album })}" class="btn btn-outline"><i class="fa-regular fa-images"></i>${t('evViewPhotos')}</a></p>` : '') + `</div>` +
                ui.backToListing(t('backTo', { x: t('navEvents') }), VQ.href('events'))
            ));
        }
    });
})();
