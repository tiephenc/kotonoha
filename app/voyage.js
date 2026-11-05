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

  function foxHead() { return `<circle r="15" fill="#FCF7EE" stroke="#1D1A2C" stroke-width="1.5"/><g transform="translate(-13 -15) scale(.26)"><path d="M10 56 L4 10 L36 34 Z M90 56 L96 10 L64 34 Z" fill="#E2773A"/><path d="M6 60 C6 34 26 26 50 26 C74 26 94 34 94 60 C94 84 72 96 50 98 C28 96 6 84 6 60 Z" fill="#E2773A"/><path d="M14 72 C28 88 40 94 50 95 C60 94 72 88 86 72 C72 80 62 82 50 79 C38 82 28 80 14 72 Z" fill="#FFF1DC"/><path d="M30 60 Q36 54 42 60 M58 60 Q64 54 70 60" stroke="#2A1C17" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="50" cy="76" rx="5" ry="4" fill="#2A1C17"/></g>`; }
  /* ---------- Rendu : un seul itinéraire, aéré, sans zoom ----------
     Les 14 destinations s'enchaînent dans l'ordre (points croissants) sur une route en lacets, posée sur une
     silhouette discrète du Japon. Une destination s'ouvre quand on a assez de points ET que la précédente est
     visitée : il n'y a qu'un chemin. Une fois dans une ville, on peut s'arrêter à ses points d'intérêt. */
  const STATE_T = { seen: 'Visitée', open: 'Accessible', locked: 'À débloquer' };
  const LMK = { tokyo: 'pagoda', kamakura: 'temple', nikko: 'torii', hakone: 'onsen', kyoto: 'torii', nara: 'pagoda', osaka: 'castle', kanazawa: 'castle', kumano: 'torii', hiroshima: 'temple', miyajima: 'torii', matsushima: 'pine', hakodate: 'castle', sapporo: 'temple' };
  const LMSVG = {
    torii: '<path class="lr" d="M-9 -12h18v2.4h-18zM-7 -9.6h2.2V0h-2.2zM4.8 -9.6H7V0H4.8zM-6.5 -7h13v1.6h-13z"/><path class="ld" d="M-10.5 -14h21v2h-21z"/>',
    pagoda: '<path class="ld" d="M-8 -3h16l-2 -3h-12zM-6.5 -9h13l-2 -3h-9zM-5 -15h10l-1.6 -3h-6.8z"/><path class="lw" d="M-5 -3h10v3h-10zM-4 -9h8v3h-8zM-3 -15h6v3h-6z"/><path class="ll" d="M-1.5 -2h3v2h-3zM-1 -8h2v2h-2z"/>',
    castle: '<path class="ls" d="M-10 -4h20v4h-20z"/><path class="lw" d="M-7 -10h14v6h-14zM-4.5 -16h9v6h-9z"/><path class="ld" d="M-9 -11h18l-2 -2h-14zM-6 -17h12l-2 -2h-8z"/><path class="ll" d="M-4 -8h2v2h-2zM2 -8h2v2h-2z"/>',
    temple: '<path class="lw" d="M-8 -6h16v6h-16z"/><path class="ld" d="M-11 -6h22l-4 -6h-14z"/><path class="ll" d="M-2 -5h4v5h-4z"/>',
    onsen: '<path class="lw" d="M-8 -3a8 3 0 0 0 16 0z"/><path class="lst" d="M-4 -6q-2 -3 0 -6M0 -6q-2 -3 0 -6M4 -6q-2 -3 0 -6"/>',
    pine: '<path class="lt" d="M0 -16l7 9h-4l5 6h-16l5 -6h-4z"/><path class="ld" d="M-1 -1h2v3h-2z"/>',
  };
  // Points d'intérêt réels de chaque ville (nom, une phrase factuelle) ; lien de recherche Wikipédia pour en savoir plus.
  const POI = {
    tokyo: [['Sensō-ji', 'Temple bouddhique d’Asakusa, le plus ancien de Tokyo, avec la porte Kaminarimon.'], ['Meiji-jingū', 'Sanctuaire shintō dédié à l’empereur Meiji, au cœur d’une forêt plantée.'], ['Carrefour de Shibuya', 'Le célèbre passage piéton, près de la statue du chien Hachikō.']],
    kamakura: [['Kōtoku-in', 'Le Grand Bouddha de bronze, assis en plein air depuis la fin du XVe siècle.'], ['Tsurugaoka Hachiman-gū', 'Grand sanctuaire de la ville des shoguns de Kamakura.'], ['Hase-dera', 'Temple dédié à Kannon, avec vue sur la baie de Sagami.']],
    nikko: [['Nikkō Tōshō-gū', 'Mausolée de Tokugawa Ieyasu, célèbre pour ses sculptures, dont les trois singes.'], ['Pont Shinkyō', 'Pont laqué de rouge à l’entrée des sanctuaires.'], ['Chutes de Kegon', 'Cascade d’une centaine de mètres à la sortie du lac Chūzenji.']],
    hakone: [['Lac Ashi', 'Lac de cratère d’où l’on voit le Fuji par temps clair.'], ['Ōwakudani', 'Vallée volcanique aux fumerolles, connue pour ses œufs noircis.'], ['Sanctuaire de Hakone', 'Sanctuaire au bord du lac, avec son torii posé dans l’eau.']],
    kyoto: [['Fushimi Inari-taisha', 'Sanctuaire aux milliers de torii vermillon sur la colline Inari.'], ['Kinkaku-ji', 'Le Pavillon d’or, recouvert de feuilles d’or, au bord d’un étang.'], ['Kiyomizu-dera', 'Temple à la grande terrasse de bois sur pilotis.']],
    nara: [['Tōdai-ji', 'Temple abritant un Grand Bouddha de bronze dans une immense salle de bois.'], ['Parc de Nara', 'Parc où des daims vivent en liberté.'], ['Kasuga-taisha', 'Sanctuaire aux centaines de lanternes de pierre et de bronze.']],
    osaka: [['Château d’Ōsaka', 'Château lié à Toyotomi Hideyoshi, reconstruit au XXe siècle.'], ['Dōtonbori', 'Quartier animé le long du canal, connu pour ses enseignes.'], ['Shitennō-ji', 'L’un des plus anciens temples du Japon, fondé selon la tradition par le prince Shōtoku.']],
    kanazawa: [['Kenroku-en', 'L’un des trois jardins les plus célèbres du Japon.'], ['Château de Kanazawa', 'Ancienne résidence du clan Maeda.'], ['Higashi Chaya', 'Quartier de maisons de thé en bois.']],
    kumano: [['Kumano Hongū Taisha', 'L’un des trois grands sanctuaires de Kumano.'], ['Chutes de Nachi', 'Haute cascade vénérée, près du Kumano Nachi Taisha.'], ['Kumano Kodō', 'Chemins de pèlerinage inscrits au patrimoine mondial.']],
    hiroshima: [['Dôme de Genbaku', 'Ruine conservée en mémoire du bombardement atomique de 1945.'], ['Parc du Mémorial de la paix', 'Parc et musée consacrés à la paix.'], ['Château de Hiroshima', 'Château reconstruit après la guerre.']],
    miyajima: [['Itsukushima-jinja', 'Sanctuaire bâti sur l’eau, avec son grand torii dans la mer.'], ['Mont Misen', 'Sommet sacré de l’île, d’où l’on voit la mer intérieure.'], ['Daishō-in', 'Temple bouddhique au pied du mont Misen.']],
    matsushima: [['Baie de Matsushima', 'Baie parsemée d’îlots couverts de pins, l’un des trois paysages du Japon.'], ['Zuigan-ji', 'Temple zen lié au clan Date.'], ['Godaidō', 'Petit pavillon sur un îlot relié par des ponts.']],
    hakodate: [['Mont Hakodate', 'Mont réputé pour sa vue nocturne sur la ville.'], ['Goryōkaku', 'Fort en étoile du XIXe siècle.'], ['Motomachi', 'Quartier en pente aux églises et bâtiments occidentaux.']],
    sapporo: [['Parc Ōdōri', 'Long parc au centre-ville, où se tient le festival de la neige.'], ['Tour de l’horloge', 'Bâtiment de bois de l’ancienne école d’agriculture.'], ['Hokkaidō-jingū', 'Sanctuaire principal de Hokkaidō, dans le parc Maruyama.']],
  };
  const wiki = (q) => 'https://fr.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(q);
  const ORDER = V.places.slice().sort((a, b) => a.pts - b.pts);
  const IDX = Object.fromEntries(ORDER.map((p, i) => [p.id, i]));
  function lineState(p, pts, v) { if (v.seen[p.id]) return 'seen'; const i = IDX[p.id]; return p.pts <= pts && (i === 0 || v.seen[ORDER[i - 1].id]) ? 'open' : 'locked'; }
  function legMode(a, b) { const r = V.routes.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a)); return r && r.seg && r.seg[0] ? r.seg[0][0] : 'train'; }
  // Positions : lacets horizontaux (large) ou colonne en zigzag (étroit)
  function layout(narrow) {
    const n = ORDER.length;
    if (narrow) { const W = 360, H = 120 + n * 150; return { W, H, pts: ORDER.map((p, i) => [i % 2 ? 250 : 110, 90 + i * 150]) }; }
    const rows = [5, 5, 4], W = 1000, H = 760, ys = [150, 390, 630], out = []; let k = 0;
    rows.forEach((c, r) => { for (let j = 0; j < c; j++) { const t = c > 1 ? j / (c - 1) : .5, x = 110 + t * 780, y = ys[r] + Math.sin((j + r) * 1.7) * 26; out[k++] = [r % 2 ? 1000 - x : x, y]; } });
    return { W, H, pts: out };
  }
  function seg(a, b, narrow) { // courbe douce entre deux étapes (en U aux bouts de rangée)
    const [x1, y1] = a, [x2, y2] = b;
    if (narrow) return `M${x1} ${y1} C${x1} ${y1 + 70} ${x2} ${y2 - 70} ${x2} ${y2}`;
    if (Math.abs(y2 - y1) > 120) { const dir = x1 > 500 ? 1 : -1; return `M${x1} ${y1} C${x1 + dir * 120} ${y1} ${x2 + dir * 120} ${y2} ${x2} ${y2}`; }
    const mx = (x1 + x2) / 2; return `M${x1} ${y1} C${mx} ${y1 - 30} ${mx} ${y2 + 30} ${x2} ${y2}`;
  }
  let unfolded = false;
  function render(el) {
    const v = state(), pt = points(), pts = pt.total, narrow = matchMedia('(max-width: 700px)').matches, L = layout(narrow);
    v.poi = v.poi && typeof v.poi === 'object' ? v.poi : {};
    const st = ORDER.map((p) => lineState(p, pts, v)), here = IDX[v.at] || 0;
    const isl = Object.values(V.islands).map((poly) => `<path d="M${poly.map(([a, b]) => P(a, b).map((n) => n.toFixed(1)).join(' ')).join(' L')} Z"/>`).join('');
    const nSeen = st.filter((s) => s === 'seen').length, next = ORDER.find((p, i) => st[i] !== 'seen');
    const segs = ORDER.slice(1).map((p, i) => { const s = st[i] === 'seen' && st[i + 1] === 'seen' ? 'done' : st[i] === 'seen' && st[i + 1] === 'open' ? 'next' : 'todo';
      const d = seg(L.pts[i], L.pts[i + 1], narrow), m = legMode(ORDER[i].id, p.id), mid = [(L.pts[i][0] + L.pts[i + 1][0]) / 2, (L.pts[i][1] + L.pts[i + 1][1]) / 2];
      return `<path id="xleg-${i}" class="xleg l-${s}" d="${d}"/><g class="xmode m-${m} l-${s}" transform="translate(${mid[0].toFixed(0)} ${mid[1].toFixed(0)})" aria-hidden="true"><circle r="11"/><title>${esc(MODE[m] ? MODE[m][0] : m)}</title>${MODEI[m] || ''}</g>`; }).join('');
    el.innerHTML = `<h1>Carnet de route au Japon</h1>
      <p class="muted">Un seul chemin, de Tokyo à Sapporo. Vos activités réelles rapportent des points de voyage ; chaque destination s’ouvre quand vous en avez assez et que la précédente est visitée. <b>Ces points ne mesurent pas votre niveau de japonais</b> (voir <a href="#maitrise">Maîtrise</a>) et les pauses ne coûtent rien.</p>
      <div class="xvoy">
        <div class="xmapwrap xroutemap${unfolded || K.reduced() ? '' : ' unfold'}">
          <div class="xm-hud"><div><b>${pts.toLocaleString('fr-FR')}</b> points de voyage · <b>${nSeen}</b> / ${ORDER.length} destinations</div>
            ${next ? `<div class="xm-next"><span>Prochaine : ${esc(next.name)}</span><span class="bar"><i style="width:${Math.min(100, pts / Math.max(1, next.pts) * 100)}%"></i></span><span>${Math.max(0, next.pts - pts).toLocaleString('fr-FR')} pts</span></div>` : '<div>Tout le chemin est parcouru.</div>'}</div>
          <div class="xroute-stage">
            <svg id="xjp" viewBox="0 0 ${L.W} ${L.H}" role="group" aria-label="Itinéraire de Tokyo à Sapporo">
              <g class="xsil" aria-hidden="true" transform="${narrow ? `translate(-80 ${L.H * .18}) scale(.58)` : 'translate(170 -40) scale(.86)'}"><g class="xland-side">${[4, 3, 2, 1].map((d) => `<g transform="translate(0 ${d * 2})">${isl}</g>`).join('')}</g><g class="xland">${isl}</g></g>
              <g class="xlegs">${segs}</g>
              <g class="xlmk" aria-hidden="true">${ORDER.map((p, i) => { const k = LMK[p.id]; return k ? `<g transform="translate(${L.pts[i][0]} ${(L.pts[i][1] - 30).toFixed(0)}) scale(1.5)">${LMSVG[k]}</g>` : ''; }).join('')}</g>
              <g class="xfox-tok" aria-hidden="true" transform="translate(${L.pts[here][0]} ${L.pts[here][1]})"><circle r="22" class="halo"/><g transform="scale(1.15)">${foxHead()}</g></g>
            </svg>
            <div class="xm-pins">${ORDER.map((p, i) => { const s = st[i], [x, y] = L.pts[i], hereP = v.at === p.id;
              return `<button type="button" class="xplace s-${s}${hereP ? ' here' : ''}" data-p="${p.id}" style="left:${(x / L.W * 100).toFixed(2)}%;top:${(y / L.H * 100).toFixed(2)}%" aria-label="${esc(p.name)} : ${STATE_T[s].toLowerCase()}${hereP ? ', vous êtes ici' : ''}">
                <span class="node">${s === 'seen' ? '<svg viewBox="0 0 24 24" class="ic"><path d="M6.5 12.5 L10.5 16.5 L17.5 8.5"/></svg>' : s === 'open' ? '<svg viewBox="0 0 24 24" class="ic"><circle cx="12" cy="12" r="4.5"/></svg>' : '<span class="qm" aria-hidden="true">?</span>'}</span>
                <span class="pin-lbl"><b>${esc(p.name)}</b><small>${s === 'locked' ? p.pts.toLocaleString('fr-FR') + ' pts' : STATE_T[s]}</small></span><span class="pin-base"></span></button>`; }).join('')}</div>
          </div>
          <div class="xlegend xvleg"><span class="xl"><i class="ls-seen"></i>Visitée</span><span class="xl"><i class="ls-open"></i>Accessible</span><span class="xl"><i class="ls-locked"></i>À débloquer</span><span class="xl">Train, bateau, à pied ou route entre deux étapes</span></div>
        </div>
        <aside class="xvside">
          <div id="xvinfo" class="card panel xvinfo" aria-live="polite"></div>
          <div class="card panel xvroute"><h2>D’où viennent ces points ?</h2><table class="xvtab">${pt.parts.map(([l, n, q]) => `<tr><td>${esc(l)}</td><td>${n.toLocaleString('fr-FR')}</td><td>${q.toLocaleString('fr-FR')} pts</td></tr>`).join('')}</table>
            <p class="small muted">Une unité maîtrisée rapporte bien plus qu’une étape cochée : la maîtrise compte davantage que le clic sur « terminé ».</p></div>
        </aside>
      </div>
      <h2 class="xh2">Souvenirs du voyage</h2>
      <div class="xsouvs">${ORDER.map((p) => v.seen[p.id] ? `<button type="button" class="xsouvc" data-p="${p.id}">${art(p.souvenir[0])}<b>${esc(p.name)}</b><span>${esc(p.souvenir[1])}</span><small>${new Date(v.seen[p.id]).toLocaleDateString('fr-FR')}</small></button>` : `<div class="xsouvc locked" aria-hidden="true"><span class="q">?</span><b>${esc(p.name)}</b></div>`).join('')}</div>`;
    unfolded = true;
    el.querySelectorAll('.xplace').forEach((b) => b.addEventListener('click', () => info(el, b.dataset.p)));
    el.querySelectorAll('.xsouvc[data-p]').forEach((b) => b.onclick = () => { info(el, b.dataset.p); el.querySelector('#xvinfo').scrollIntoView({ block: 'nearest', behavior: K.reduced() ? 'auto' : 'smooth' }); });
    info(el, v.at, true);
  }
  const MODEI = {
    train: '<path class="mi" d="M-6 -4h12v7h-12zM-4 3l-2 3M4 3l2 3M-4 -1h3M1 -1h3"/>',
    bateau: '<path class="mi" d="M-7 1h14l-3 4h-8zM0 1v-7l5 5"/>',
    pied: '<path class="mi" d="M0 -6a1.6 1.6 0 1 0 .01 0M0 -3v4l-3 5M0 1l3 5M-3 -1h6"/>',
    route: '<path class="mi" d="M-7 -2h14v5h-14zM-4 3v2M4 3v2M-7 0h14"/>',
  };
  function info(el, id, quiet) {
    const v = state(), pts = points().total, p = byId[id], s = lineState(p, pts, v), box = el.querySelector('#xvinfo'), i = IDX[id], at = IDX[v.at] || 0;
    el.querySelectorAll('.xplace').forEach((g) => g.classList.toggle('sel', g.dataset.p === id));
    const reachable = s !== 'locked' && v.at !== id;
    const way = reachable ? (i > at ? ORDER.slice(at, i + 1) : ORDER.slice(i, at + 1).reverse()).map((q) => q.id) : null;
    const reg = V.regions.find((r) => r.id === p.region), km = window.KX_KAMON && window.KX_KAMON.find((k) => k.id === p.kamon);
    const poi = POI[p.id] || [], hereP = v.at === id;
    box.innerHTML = `<div class="xmeta">Étape ${i + 1} sur ${ORDER.length}${reg ? ' · ' + esc(reg.t) : ''}</div><h2 class="jp">${ruby(p.j)} · ${esc(p.name)}</h2>
      ${s === 'seen' ? `<div class="xvart">${art(p.souvenir[0], 'pop')}<p class="small"><b>Souvenir :</b> ${esc(p.souvenir[1])}</p></div><p>${esc(p.story)}</p>
        ${hereP ? `<h3>Points d’intérêt</h3><ul class="xpoi">${poi.map(([n, d], k) => { const key = p.id + ':' + k, done = !!v.poi[key]; return `<li class="${done ? 'ok' : ''}"><button type="button" class="xpoi-b" data-poi="${k}" aria-pressed="${done}"><b>${esc(n)}</b><span>${done ? esc(d) : 'S’arrêter ici'}</span></button>${done ? `<a class="small" href="${esc(wiki(n))}" target="_blank" rel="noopener noreferrer">En savoir plus</a>` : ''}</li>`; }).join('')}</ul>`
        : `<p class="small muted">Retournez à ${esc(p.name)} pour vous arrêter à ses points d’intérêt.</p>`}
        <p>${esc(p.culture)}</p>${km ? `<p class="small">Kamon lié : <a href="#kamon-${km.id}">${esc(plain(km.j))}</a></p>` : ''}
        <p class="small">Sources : ${p.src.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a>`).join(' · ')}</p>`
      : s === 'open' ? `<p>${esc(p.story)}</p>`
      : `<p class="muted">Encore dans la brume : ${p.pts.toLocaleString('fr-FR')} points nécessaires (vous en avez ${pts.toLocaleString('fr-FR')})${i > 0 && !v.seen[ORDER[i - 1].id] ? `, et ${esc(ORDER[i - 1].name)} doit être visitée avant` : ''}.</p>`}
      ${hereP ? '<p class="small"><b>Vous êtes ici.</b></p>' : ''}
      ${way ? `<p class="small"><b>Trajet :</b> ${way.map((q) => esc(byId[q].name)).join(' → ')}</p><button type="button" class="btn${s === 'seen' ? ' sec' : ''}" id="xgo">${s === 'seen' ? 'Retourner à' : 'Voyager jusqu’à'} ${esc(p.name)}</button>` : ''}`;
    const go = box.querySelector('#xgo'); if (go) go.onclick = () => travel(el, way);
    box.querySelectorAll('[data-poi]').forEach((b) => b.onclick = () => { const key = p.id + ':' + b.dataset.poi; if (!v.poi[key]) { v.poi[key] = Date.now(); K.save(); } info(el, id); });
    if (!quiet) box.setAttribute('tabindex', '-1');
  }
  async function travel(el, way) {
    const v = state(), tok = el.querySelector('.xfox-tok');
    el.querySelectorAll('#xgo').forEach((b) => b.disabled = true);
    for (let k = 0; k < way.length - 1; k++) {
      const a = IDX[way[k]], b = IDX[way[k + 1]], legI = Math.min(a, b), pathEl = el.querySelector('#xleg-' + legI);
      if (pathEl && !K.reduced()) { pathEl.classList.add('active'); await move(tok, pathEl, b > a); pathEl.classList.remove('active'); }
      v.seen[way[k + 1]] = v.seen[way[k + 1]] || Date.now(); v.at = way[k + 1];
    }
    K.save();
    if (K.kamon) { const f = K.kamon.sync(); if (f.length) K.kamon.reveal(f); }
    render(el);
    const card = el.querySelector('#xvinfo .xvart'); if (card) card.classList.add('arrive');
  }
  function move(tok, p, forward) {
    return new Promise((res) => {
      const L = p.getTotalLength(), dur = Math.max(900, Math.min(2600, L * 4)), t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, q = p.getPointAtLength(forward ? e * L : (1 - e) * L);
        tok.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`); if (k < 1) requestAnimationFrame(step); else res(); };
      requestAnimationFrame(step);
    });
  }
  let mqW = null;
  function watchWidth() { if (mqW) return; mqW = matchMedia('(max-width: 700px)'); mqW.addEventListener('change', () => { const v = document.getElementById('v-x-voyage'); if (v && v.classList.contains('on')) render(v); }); }
  watchWidth();
  K.view({ name: 'voyage', title: 'Voyage', nav: 'progres', match: (h) => h === 'voyage', render });
  K.on('progres', (el) => {
    const v = (S.x && S.x.voyage) || { seen: { tokyo: 1 } };
    K.tile(el, { id: 'voyage', grid: '[data-xhub]', href: '#voyage', kj: '旅', title: 'Le voyage', text: `${points().total.toLocaleString('fr-FR')} points de voyage · ${Object.keys(v.seen || {}).length} destination(s) sur ${V.places.length}.` });
  });
  K.voyage.state = state; K.voyage.placeState = (p, pts, v) => lineState(p, pts, v); K.voyage.P = P;
})();
