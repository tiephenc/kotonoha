/* KOTONOHA · le voyage au Japon (#voyage).
   Points de voyage (旅) : calculés à partir de l'activité réelle (révisions, étapes, tests réussis, maîtrise, examens,
   temps actif, productions). Ils ne mesurent PAS le niveau de japonais et ne bloquent aucune fonctionnalité pédagogique.
   Aucun malus : les points ne baissent jamais, les pauses ne coûtent rien. État : S.x.voyage { at, seen{id:date} }. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc, V = window.KX_VOYAGE;
  const LON0 = 128.6, LAT0 = 45.9, SX = 52, SY = 64;
  const P = (lat, lon) => [((lon - LON0) * SX), ((LAT0 - lat) * SY)];
  const byId = Object.fromEntries(V.places.map((p) => [p.id, p]));
  // Décalage des étiquettes pour les destinations voisines (Tokyo, Kamakura, Hakone ; Kansai ; Hiroshima).
  const LBL = { kamakura: [4, 22, 'start'], hakone: [-13, 5, 'end'], osaka: [-13, 5, 'end'], kyoto: [0, -15, 'middle'], nara: [12, 14, 'start'], miyajima: [-13, 12, 'end'], hiroshima: [0, -15, 'middle'], kumano: [12, 8, 'start'] };
  const MODE = { train: ['Train', '#2C4A7E'], bateau: ['Bateau', '#3B7A8C'], pied: ['À pied', '#5E7D3A'], route: ['Route', '#8A5A2B'] };

  /* ---------- Points de voyage ---------- */
  function points() {
    const parts = [];
    const rev = Object.values(S.rh || {}).reduce((a, n) => a + (+n || 0), 0); parts.push(['Cartes révisées', rev, rev]);
    let steps = 0, und = 0, mas = 0;
    for (const n of Object.keys(S.units || {})) { const u = S.units[n]; if (!u || !u.done) continue; steps += Object.keys(u.done).length; const m = K.unitMastery ? K.unitMastery(+n).s : 0; if (m >= 3) und++; if (m >= 4) mas++; }
    parts.push(['Étapes d’unité faites', steps, steps * 5]); parts.push(['Unités comprises (test ≥ 70 %)', und, und * 25]); parts.push(['Unités maîtrisées', mas, mas * 60]);
    const ex = (S.exh || []).length; parts.push(['Examens blancs', ex, ex * 40]);
    const min = Math.floor(Object.values((S.x && S.x.t) || {}).reduce((a, v) => a + (+v[0] || 0), 0) / 60); parts.push(['Minutes d’étude actives', min, min]);
    const red = K.local.get('redactions', []).length, conv = K.local.get('conversations', []).length, lec = K.local.get('lectures', []).length;
    parts.push(['Textes écrits', red, red * 10]); parts.push(['Conversations', conv, conv * 8]); parts.push(['Lectures personnelles', lec, lec * 5]);
    const core = S.core && S.core.c ? Object.values(S.core.c).filter((x) => x && x.s).length : 0; if (core) parts.push(['Mots du vocabulaire étudiés', core, Math.round(core / 2)]);
    return { total: parts.reduce((a, p) => a + p[2], 0), parts };
  }
  function state() { const x = K.st(); x.voyage = x.voyage && typeof x.voyage === 'object' ? x.voyage : {}; const v = x.voyage; if (!byId[v.at]) v.at = 'tokyo'; v.seen = v.seen && typeof v.seen === 'object' ? v.seen : {}; if (!v.seen.tokyo) v.seen.tokyo = Date.now(); return v; }
  const routesOf = (id) => V.routes.filter((r) => r.a === id || r.b === id);
  const other = (r, id) => (r.a === id ? r.b : r.a);
  function path(from, to, pts) { // plus court chemin par des destinations ouvertes
    const q = [[from]], seen = new Set([from]);
    while (q.length) { const p = q.shift(), last = p[p.length - 1]; if (last === to) return p;
      for (const r of routesOf(last)) { const n = other(r, last); if (!seen.has(n) && byId[n].pts <= pts) { seen.add(n); q.push(p.concat(n)); } } }
    return null;
  }
  function placeState(p, pts, v) { if (v.seen[p.id]) return 'seen'; if (p.pts <= pts && path(v.at, p.id, pts)) return 'open'; return 'locked'; }
  K.voyage = { points, complete: () => { const v = (S.x && S.x.voyage) || {}; return V.places.every((p) => v.seen && v.seen[p.id]); } };

  /* ---------- Souvenirs illustrés ---------- */
  const ART = {
    lanterne: '<rect x="35" y="14" width="50" height="62" rx="20" fill="#C8372D"/><rect x="38" y="10" width="44" height="8" rx="2" fill="#2A1C17"/><rect x="38" y="72" width="44" height="8" rx="2" fill="#2A1C17"/><path d="M38 30 h44 M38 60 h44" stroke="#8E1E17" stroke-width="2"/><text x="60" y="52" font-size="16" text-anchor="middle" fill="#1D1A2C" font-family="serif" font-weight="800">雷門</text>',
    daibutsu: '<path d="M0 70 Q30 52 60 62 T120 58 V90 H0 Z" fill="#7A9A4A"/><path d="M36 82 C34 62 44 50 60 48 C76 50 86 62 84 82 Z" fill="#5F7C6E"/><circle cx="60" cy="38" r="12" fill="#5F7C6E"/><circle cx="60" cy="27" r="6" fill="#4C6A5D"/><path d="M52 66 Q60 60 68 66" stroke="#3E574C" stroke-width="2.5" fill="none"/>',
    pont: '<rect width="120" height="90" fill="#CFE3D9"/><path d="M0 70 H120 V90 H0 Z" fill="#3B7A8C"/><path d="M8 66 Q60 30 112 66" stroke="#C8372D" stroke-width="7" fill="none"/><path d="M20 58 v16 M40 48 v24 M60 45 v26 M80 48 v24 M100 58 v16" stroke="#C8372D" stroke-width="3"/><circle cx="16" cy="30" r="14" fill="#5E7D3A"/><circle cx="104" cy="28" r="16" fill="#46602A"/>',
    fuji: '<rect width="120" height="90" fill="#E3EEF3"/><path d="M10 66 L52 22 Q60 16 68 22 L110 66 Z" fill="#2C4A7E"/><path d="M45 30 L52 22 Q60 16 68 22 L75 30 L68 34 L62 29 L56 35 L50 31 Z" fill="#FFF"/><path d="M0 66 H120 V90 H0 Z" fill="#3B7A8C" opacity=".8"/><path d="M8 76 h20 M40 82 h26 M80 74 h24" stroke="#FFF" stroke-width="2" opacity=".6"/>',
    torii: '<rect width="120" height="90" fill="#F6E3C9"/>' + [0, 1, 2].map((i) => { const s = 1 - i * .25, x = 60 - 44 * s, w = 88 * s, y = 14 + i * 9, h = 70 * s; return `<g fill="${['#D9481F', '#E05A2A', '#E87036'][i]}"><rect x="${x}" y="${y}" width="${w}" height="${7 * s}" rx="2"/><rect x="${x + 6 * s}" y="${y + 12 * s}" width="${w - 12 * s}" height="${5 * s}"/><rect x="${x + 12 * s}" y="${y + 7 * s}" width="${7 * s}" height="${h}"/><rect x="${x + w - 19 * s}" y="${y + 7 * s}" width="${7 * s}" height="${h}"/></g>`; }).join(''),
    daim: '<rect width="120" height="90" fill="#E8EFD9"/><path d="M0 74 H120 V90 H0 Z" fill="#7A9A4A"/><path d="M36 56 C36 44 50 40 70 42 C80 42 84 46 86 52 L86 74 L80 74 L78 58 L46 60 L44 74 L38 74 Z" fill="#A86B3C"/><path d="M80 44 C84 34 90 30 96 30 C100 30 102 34 98 36 L92 40 L86 50 Z" fill="#A86B3C"/><path d="M93 30 l-4 -12 M95 30 l6 -11" stroke="#6E4524" stroke-width="2.5"/>' + [[50, 50], [58, 48], [66, 50], [54, 55]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#F6E7D0"/>`).join(''),
    chateau: '<rect width="120" height="90" fill="#DCE7F1"/><path d="M24 90 L32 64 H88 L96 90 Z" fill="#8C8577"/><rect x="38" y="44" width="44" height="20" fill="#FBF7EE"/><path d="M30 46 L60 30 L90 46 Z" fill="#2B4D46"/><rect x="44" y="24" width="32" height="12" fill="#FBF7EE"/><path d="M38 26 L60 12 L82 26 Z" fill="#2B4D46"/><rect x="56" y="50" width="8" height="10" fill="#2A1C17"/>',
    kotoji: '<rect width="120" height="90" fill="#DCEBD6"/><ellipse cx="60" cy="78" rx="56" ry="10" fill="#3B7A8C" opacity=".8"/><path d="M38 34 H82 L76 26 H44 Z" fill="#6F6A60"/><rect x="48" y="34" width="24" height="12" fill="#8B857A"/><path d="M50 46 L42 78 M70 46 L84 76" stroke="#6F6A60" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="22" r="4" fill="#6F6A60"/><circle cx="22" cy="24" r="14" fill="#46602A"/>',
    chemin: '<rect width="120" height="90" fill="#D8E4CF"/>' + [14, 34, 86, 104].map((x, i) => `<path d="M${x} 90 L${x} 30 M${x - 10} 60 L${x} 22 L${x + 10} 60 Z" stroke="#2F4A22" stroke-width="3" fill="#3D5A2C"/>`).join('') + '<path d="M44 90 L56 40 L66 40 L78 90 Z" fill="#B8AF9C"/>' + [48, 58, 68, 78].map((y) => `<path d="M${50 + (90 - y) * .1} ${y} H${72 - (90 - y) * .1}" stroke="#8C836F" stroke-width="2"/>`).join(''),
    dome: '<rect width="120" height="90" fill="#E9E4DA"/><path d="M0 76 H120 V90 H0 Z" fill="#3B7A8C" opacity=".7"/><rect x="34" y="44" width="52" height="32" fill="#B8AF9C"/><path d="M44 44 Q60 14 76 44" fill="none" stroke="#5A5348" stroke-width="3"/><path d="M50 44 Q60 22 70 44 M60 20 V44 M46 34 H74" stroke="#5A5348" stroke-width="2" fill="none"/><path d="M38 52 h8 v8 h-8 Z M56 52 h8 v8 h-8 Z M74 52 h8 v8 h-8 Z" fill="#5A5348"/>',
    'torii-mer': '<rect width="120" height="90" fill="#F3D9C4"/><rect y="56" width="120" height="34" fill="#3B7A8C"/><g fill="#C8372D"><path d="M22 20 Q60 12 98 20 L96 26 Q60 19 24 26 Z"/><rect x="30" y="32" width="60" height="5"/><rect x="36" y="24" width="7" height="44"/><rect x="77" y="24" width="7" height="44"/></g><path d="M8 72 q8 -4 16 0 t16 0 M60 80 q8 -4 16 0 t16 0" stroke="#FFF" stroke-width="2" fill="none" opacity=".7"/>',
    pins: '<rect width="120" height="90" fill="#DCEAF2"/><rect y="52" width="120" height="38" fill="#3B7A8C"/>' + [[24, 54, 16], [64, 58, 22], [100, 56, 12]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="6" fill="#8C836F"/><path d="M${x} ${y} V${y - 18}" stroke="#4A3A28" stroke-width="2"/><ellipse cx="${x - 4}" cy="${y - 18}" rx="${w * .6}" ry="5" fill="#2F4A22"/><ellipse cx="${x + 5}" cy="${y - 24}" rx="${w * .45}" ry="4" fill="#3D5A2C"/>`).join(''),
    etoile: '<rect width="120" height="90" fill="#DCE9D2"/><path d="M60 8 L72 34 L100 34 L78 52 L86 80 L60 64 L34 80 L42 52 L20 34 L48 34 Z" fill="#3B7A8C"/><path d="M60 18 L69 37 L89 37 L73 50 L79 70 L60 58 L41 70 L47 50 L31 37 L51 37 Z" fill="#7A9A4A"/><rect x="54" y="40" width="12" height="10" fill="#FBF7EE"/>',
    neige: '<rect width="120" height="90" fill="#E7EEF5"/><path d="M0 74 H120 V90 H0 Z" fill="#FFF"/><rect x="40" y="38" width="40" height="36" fill="#F6F1E6" stroke="#8C836F"/><path d="M36 40 L60 26 L84 40 Z" fill="#C8372D"/><rect x="52" y="14" width="16" height="16" fill="#F6F1E6" stroke="#8C836F"/><path d="M50 16 L60 6 L70 16 Z" fill="#C8372D"/><circle cx="60" cy="22" r="5" fill="#FFF" stroke="#2A1C17"/><path d="M60 22 v-3 M60 22 h3" stroke="#2A1C17" stroke-width="1.2"/>' + [[14, 20], [30, 50], [96, 30], [108, 56], [20, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#FFF" stroke="#C9D6E2"/>`).join(''),
  };
  const art = (k, cls = '') => `<svg viewBox="0 0 120 90" class="xsouv ${cls}" aria-hidden="true">${ART[k] || ''}</svg>`;
  K.voyage.art = art;

  /* ---------- Véhicules ---------- */
  const VEH = {
    train: '<g><rect x="-16" y="-7" width="32" height="14" rx="6" fill="#FBF7EE" stroke="#1D1A2C" stroke-width="1.6"/><path d="M8 -7 Q18 -7 18 0 Q18 7 8 7 Z" fill="#2C4A7E"/><rect x="-12" y="-4" width="5" height="4" fill="#2C4A7E"/><rect x="-4" y="-4" width="5" height="4" fill="#2C4A7E"/><rect x="-16" y="2" width="32" height="2" fill="#C8372D"/></g>',
    bateau: '<g><path d="M-16 2 H16 L10 9 H-10 Z" fill="#FBF7EE" stroke="#1D1A2C" stroke-width="1.6"/><rect x="-7" y="-6" width="12" height="8" fill="#C8372D"/><path d="M-1 -6 V-12" stroke="#1D1A2C" stroke-width="1.6"/></g>',
    pied: '<g fill="#1D1A2C"><circle cx="0" cy="-10" r="4"/><path d="M-3 -5 H3 L4 5 H-4 Z"/><path d="M-2 5 L-5 13 M2 5 L5 13" stroke="#1D1A2C" stroke-width="2.4"/><path d="M5 -6 L9 12" stroke="#8A5A2B" stroke-width="1.6"/></g>',
    route: '<g><rect x="-15" y="-8" width="30" height="14" rx="3" fill="#D6A13A" stroke="#1D1A2C" stroke-width="1.6"/><rect x="-11" y="-5" width="22" height="5" fill="#FBF7EE"/><circle cx="-8" cy="7" r="3" fill="#1D1A2C"/><circle cx="8" cy="7" r="3" fill="#1D1A2C"/></g>',
  };

  /* ---------- Rendu ---------- */
  let PZ = null, unfolded = false;
  function render(el) {
    const v = state(), pt = points(), pts = pt.total;
    const isl = Object.values(V.islands).map((poly) => `<path d="M${poly.map(([a, b]) => P(a, b).map((n) => n.toFixed(1)).join(' ')).join(' L')} Z"/>`).join('');
    const routeSvg = V.routes.map((r, i) => {
      const open = byId[r.a].pts <= pts && byId[r.b].pts <= pts;
      return r.seg.map(([m, ps], j) => `<path id="xr-${i}-${j}" class="xroute m-${m}${open ? ' open' : ''}" d="M${ps.map(([a, b]) => P(a, b).map((n) => n.toFixed(1)).join(' ')).join(' L')}"/>`).join('');
    }).join('');
    const fuji = P(35.36, 138.73), alps = [[36.3, 137.65], [36.1, 137.9], [35.8, 137.7], [36.5, 137.5]];
    const pl = V.places.map((p) => { const [x, y] = P(p.lat, p.lon), s = placeState(p, pts, v);
      return `<g class="xplace s-${s}${v.at === p.id ? ' here' : ''}" data-p="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)} : ${s === 'seen' ? 'visitée' : s === 'open' ? 'accessible' : 'à débloquer'}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle class="halo" r="16"/><circle class="dot" r="8"/>${s === 'seen' ? '<path class="chk" d="M-3.5 0 L-1 2.5 L4 -3"/>' : ''}<text class="lbl" x="${(LBL[p.id] || [12])[0]}" y="${(LBL[p.id] || [0, 4])[1]}" text-anchor="${(LBL[p.id] || [0, 0, 'start'])[2]}">${esc(p.name)}</text></g>`; }).join('');
    const reg = V.regions.map((r) => { const [x, y] = P(r.lat, r.lon); return `<text class="xregion" data-r="${r.id}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" tabindex="0" role="button" aria-label="Région ${esc(r.t)}">${esc(plain(r.j))}</text>`; }).join('');
    const [fx, fy] = P(byId[v.at].lat, byId[v.at].lon);
    const nSeen = V.places.filter((p) => v.seen[p.id]).length, next = V.places.filter((p) => p.pts > pts).sort((a, b) => a.pts - b.pts)[0];
    el.innerHTML = `<div class="eyebrow">旅 · le voyage</div><h1>Carnet de route au Japon</h1>
      <p class="muted">Vos activités d’apprentissage réelles vous font avancer d’une étape à l’autre. Ces points de voyage récompensent l’effort : <b>ils ne mesurent pas votre niveau de japonais</b> (voir <a href="#maitrise">Maîtrise</a>) et ne bloquent rien. Les pauses ne coûtent jamais rien.</p>
      <div class="xvoy">
        <div class="xmapwrap${unfolded || K.reduced() ? '' : ' unfold'}">
          <div class="xmaptools" role="toolbar" aria-label="Carte"><button type="button" class="btn-ghost" data-z="in" aria-label="Zoomer">＋</button><button type="button" class="btn-ghost" data-z="out" aria-label="Dézoomer">－</button><button type="button" class="btn-ghost" data-z="reset">Vue entière</button></div>
          <svg id="xjp" viewBox="0 0 900 960" tabindex="0" aria-label="Carte du Japon : destinations et itinéraires. Glisser pour se déplacer, molette pour zoomer.">
            <defs><pattern id="xsea" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 20a20 20 0 0 1 40 0M6 20a14 14 0 0 1 28 0M12 20a8 8 0 0 1 16 0" fill="none" stroke="currentColor" stroke-opacity=".14" stroke-width="1.2"/></pattern>
              <radialGradient id="xglow"><stop offset="0" stop-color="#F2C46A" stop-opacity=".9"/><stop offset="1" stop-color="#F2C46A" stop-opacity="0"/></radialGradient></defs>
            <rect class="xseabg" x="-200" y="-200" width="1300" height="1360"/><rect x="-200" y="-200" width="1300" height="1360" fill="url(#xsea)" class="xseapat"/>
            <g class="xland">${isl}</g>
            <g class="xmount"><path d="M${fuji[0] - 16} ${fuji[1] + 10} L${fuji[0]} ${fuji[1] - 14} L${fuji[0] + 16} ${fuji[1] + 10} Z" class="fuji"/><path d="M${fuji[0] - 6} ${fuji[1] - 4} L${fuji[0]} ${fuji[1] - 14} L${fuji[0] + 6} ${fuji[1] - 4} Z" fill="#FFF"/>
              ${alps.map(([a, b]) => { const [x, y] = P(a, b); return `<path d="M${x - 10} ${y + 6} L${x} ${y - 8} L${x + 10} ${y + 6}"/>`; }).join('')}<text x="${fuji[0] + 18}" y="${fuji[1] + 4}" class="xsmall">富士山</text></g>
            <g class="xregions">${reg}</g>
            <g class="xroutes">${routeSvg}</g>
            <g class="xplaces">${pl}</g>
            <g class="xfox" transform="translate(${fx.toFixed(1)} ${(fy - 26).toFixed(1)})">${foxHead()}</g>
            <g class="xveh" style="display:none"></g>
            <g class="xcompass" transform="translate(800 860)"><circle r="34" class="cr"/><path d="M0 -30 L7 0 L0 30 L-7 0 Z" class="nd"/><path d="M0 -30 L7 0 L-7 0 Z" fill="#C8372D"/><text y="-38" text-anchor="middle">北</text></g>
          </svg>
          <div class="xlegend xvleg">${Object.entries(MODE).map(([m, [t]]) => `<span class="xl"><i class="lm-${m}"></i>${t}</span>`).join('')}<span class="xl"><i class="ls-open"></i>Accessible</span><span class="xl"><i class="ls-seen"></i>Visitée</span></div>
        </div>
        <aside class="xvside">
          <div class="card panel xvpts"><div class="xvbig"><b>${pts.toLocaleString('fr-FR')}</b><span>points de voyage</span></div>
            <p class="small">${nSeen} destination${nSeen > 1 ? 's' : ''} sur ${V.places.length} · vous êtes à <b>${esc(byId[v.at].name)}</b>.</p>
            ${next ? `<p class="small muted">Prochaine étape à débloquer : ${esc(next.name)} (${next.pts.toLocaleString('fr-FR')} points).</p><div class="bar"><i style="width:${Math.min(100, pts / next.pts * 100)}%"></i></div>` : '<p class="small">Toutes les destinations sont ouvertes.</p>'}
            <details class="small"><summary>D’où viennent ces points ?</summary><table class="xvtab">${pt.parts.map(([l, n, p]) => `<tr><td>${esc(l)}</td><td>${n.toLocaleString('fr-FR')}</td><td>${p.toLocaleString('fr-FR')} pts</td></tr>`).join('')}</table>
              <p class="muted">Une unité maîtrisée rapporte bien plus qu’une étape cochée : la maîtrise compte davantage que le clic sur « terminé ».</p></details></div>
          <div id="xvinfo" class="card panel xvinfo" aria-live="polite"><p class="small muted">Touchez une destination ou un nom de région sur la carte.</p></div>
        </aside>
      </div>
      <h2 class="xh2">Souvenirs du voyage</h2>
      <div class="xsouvs">${V.places.map((p) => v.seen[p.id] ? `<button type="button" class="xsouvc" data-p="${p.id}">${art(p.souvenir[0])}<b>${esc(p.name)}</b><span>${esc(p.souvenir[1])}</span><small>${new Date(v.seen[p.id]).toLocaleDateString('fr-FR')}</small></button>` : `<div class="xsouvc locked"><div class="xsouv ph">？</div><b>${esc(p.name)}</b><span>${p.pts.toLocaleString('fr-FR')} points</span></div>`).join('')}</div>`;
    unfolded = true;
    const svg = el.querySelector('#xjp');
    PZ = K.panzoom(svg, { max: 5 });
    el.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => PZ[{ in: 'zoomIn', out: 'zoomOut', reset: 'reset' }[b.dataset.z]]());
    el.querySelectorAll('.xplace').forEach((g) => { const go = () => info(el, g.dataset.p); g.addEventListener('click', go); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    el.querySelectorAll('.xregion').forEach((t) => { const go = () => regionInfo(el, t.dataset.r); t.addEventListener('click', go); t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    el.querySelectorAll('.xsouvc[data-p]').forEach((b) => b.onclick = () => { info(el, b.dataset.p); el.querySelector('#xvinfo').scrollIntoView({ block: 'nearest', behavior: K.reduced() ? 'auto' : 'smooth' }); });
    info(el, v.at, true);
  }
  function foxHead() { return `<circle r="15" fill="#FCF7EE" stroke="#1D1A2C" stroke-width="1.5"/><g transform="translate(-13 -15) scale(.26)"><path d="M10 56 L4 10 L36 34 Z M90 56 L96 10 L64 34 Z" fill="#E2773A"/><path d="M6 60 C6 34 26 26 50 26 C74 26 94 34 94 60 C94 84 72 96 50 98 C28 96 6 84 6 60 Z" fill="#E2773A"/><path d="M14 72 C28 88 40 94 50 95 C60 94 72 88 86 72 C72 80 62 82 50 79 C38 82 28 80 14 72 Z" fill="#FFF1DC"/><path d="M30 60 Q36 54 42 60 M58 60 Q64 54 70 60" stroke="#2A1C17" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="76" rx="5" ry="4" fill="#2A1C17"/></g>`; }

  function regionInfo(el, id) {
    const r = V.regions.find((x) => x.id === id), list = V.places.filter((p) => p.region === id);
    el.querySelector('#xvinfo').innerHTML = `<div class="eyebrow">Région</div><h2 class="jp">${ruby(r.j)} · ${esc(r.t)}</h2><p>${esc(r.d)}</p>
      ${list.length ? `<p class="small">Destinations : ${list.map((p) => `<button type="button" class="btn-ghost small" data-go="${p.id}">${esc(p.name)}</button>`).join(' ')}</p>` : '<p class="small muted">Aucune étape du voyage dans cette région pour l’instant.</p>'}`;
    el.querySelectorAll('#xvinfo [data-go]').forEach((b) => b.onclick = () => info(el, b.dataset.go));
  }
  function info(el, id, quiet) {
    const v = state(), pts = points().total, p = byId[id], s = placeState(p, pts, v), box = el.querySelector('#xvinfo');
    el.querySelectorAll('.xplace').forEach((g) => g.classList.toggle('sel', g.dataset.p === id));
    const way = s !== 'locked' && v.at !== id ? path(v.at, id, pts) : null;
    const legs = way ? way.slice(1).map((n, i) => V.routes.find((r) => (r.a === way[i] && r.b === n) || (r.b === way[i] && r.a === n))) : [];
    const reg = V.regions.find((r) => r.id === p.region), km = window.KX_KAMON && window.KX_KAMON.find((k) => k.id === p.kamon);
    box.innerHTML = `<div class="eyebrow">${esc(reg ? reg.t : '')}</div><h2 class="jp">${ruby(p.j)} · ${esc(p.name)}</h2>
      ${s === 'seen' ? `<div class="xvart">${art(p.souvenir[0], 'pop')}<p class="small"><b>Souvenir :</b> ${esc(p.souvenir[1])}</p></div><p>${esc(p.story)}</p><p>${esc(p.culture)}</p>
        ${km ? `<p class="small">Kamon lié : <a href="#kamon-${km.id}">${esc(plain(km.j))}</a></p>` : ''}
        <p class="small">Sources : ${p.src.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`).join(' · ')}</p>`
      : s === 'open' ? `<p>${esc(p.story)}</p><p class="small"><b>Itinéraire :</b> ${legs.map((r) => esc(r.t)).join(' → ')}</p><button type="button" class="btn" id="xgo">Voyager jusqu’à ${esc(p.name)}</button>`
      : `<p class="muted">Destination encore fermée : ${p.pts.toLocaleString('fr-FR')} points nécessaires (vous en avez ${pts.toLocaleString('fr-FR')}). Chaque révision, étape ou unité maîtrisée vous en rapproche.</p>`}
      ${v.at === id ? '<p class="small"><b>Vous êtes ici.</b></p>' : ''}
      ${s === 'seen' && v.at !== id && !way ? '' : ''}${s === 'seen' && v.at !== id && way ? `<button type="button" class="btn sec" id="xgo">Retourner à ${esc(p.name)}</button>` : ''}`;
    const go = box.querySelector('#xgo'); if (go) go.onclick = () => travel(el, way, legs);
    if (!quiet) box.focus && box.setAttribute('tabindex', '-1');
  }
  async function travel(el, way, legs) {
    const v = state(), svg = el.querySelector('#xjp'), veh = svg.querySelector('.xveh'), fox = svg.querySelector('.xfox');
    el.querySelectorAll('#xgo').forEach((b) => b.disabled = true);
    fox.style.display = 'none';
    for (let i = 0; i < legs.length; i++) {
      const r = legs[i], ri = V.routes.indexOf(r), forward = r.a === way[i];
      const segs = r.seg.map((s, j) => [s[0], svg.querySelector(`#xr-${ri}-${j}`)]); if (!forward) segs.reverse();
      for (const [mode, pathEl] of segs) {
        pathEl.classList.add('active');
        if (!K.reduced()) await move(veh, pathEl, mode, forward);
        pathEl.classList.remove('active');
      }
      v.seen[way[i + 1]] = v.seen[way[i + 1]] || Date.now(); v.at = way[i + 1];
    }
    K.save(); veh.style.display = 'none';
    if (K.kamon) { const f = K.kamon.sync(); if (f.length) K.kamon.reveal(f); }
    render(el);
    const card = el.querySelector('#xvinfo .xvart'); if (card) card.classList.add('arrive');
  }
  function move(veh, p, mode, forward) {
    return new Promise((res) => {
      const L = p.getTotalLength(), dur = Math.max(1100, Math.min(3200, L * 9)), t0 = performance.now();
      veh.innerHTML = VEH[mode]; veh.style.display = '';
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, d = forward ? e * L : (1 - e) * L;
        const a = p.getPointAtLength(d), b = p.getPointAtLength(Math.min(L, Math.max(0, d + (forward ? 1 : -1))));
        let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; const flip = Math.abs(ang) > 90;
        veh.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${(flip ? ang + 180 : ang).toFixed(1)}) scale(${flip ? -1 : 1} 1)`);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  K.view({ name: 'voyage', title: 'Voyage', nav: 'progres', match: (h) => h === 'voyage', render });
  K.on('progres', (el) => {
    const v = (S.x && S.x.voyage) || { seen: { tokyo: 1 } };
    K.tile(el, { id: 'voyage', grid: '[data-xhub]', href: '#voyage', kj: '旅', title: 'Le voyage', text: `${points().total.toLocaleString('fr-FR')} points de voyage · ${Object.keys(v.seen || {}).length} destination(s) sur ${V.places.length}.` });
  });
  K.voyage.state = state; K.voyage.placeState = placeState; K.voyage.P = P;
})();
