/* KOTONOHA · carte mentale du parcours.
   Vue d'ensemble : niveaux → modules → unités, colorées par maîtrise réelle (KX.unitMastery).
   Vue centrée sur une unité : ses points de grammaire et ses kanji (état de leurs cartes), l'unité précédente
   et suivante (prérequis), les unités qui partagent des kanji, et les contrastes : unités dont les notes de
   nuance citent un point de cette unité (ou inversement). Toutes les relations sont calculées sur les données
   existantes ; une liste textuelle accompagne chaque dessin pour l'accessibilité. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const MS = ['Pas encore ouverte', 'Consultée', 'Terminée', 'Comprise', 'Maîtrisée'];
  const mast = (n) => (K.unitMastery ? K.unitMastery(n).s : 0);
  const order = () => ['N4', 'N3', 'N2'].flatMap((lv) => regularOf(lv));

  let KIDX = null;
  function kanjiIndex() {
    if (KIDX) return KIDX;
    KIDX = new Map();
    for (const n of order()) {
      const u = UNITS[n], chars = new Set();
      (u.vocab || []).forEach((v) => [...v[0]].forEach((c) => /[一-鿿々]/.test(c) && chars.add(c)));
      (u.kanji || []).forEach((k) => chars.add(k[0]));
      chars.forEach((c) => { if (!KIDX.has(c)) KIDX.set(c, new Set()); KIDX.get(c).add(n); });
    }
    return KIDX;
  }
  function cores(n) {
    const out = new Set();
    (UNITS[n].grammar || []).forEach((g) => plain(g.pat).replace(/[（(][^)）]*[)）]/g, '').split(/[\/／・、,\s]+/).forEach((p) => {
      const c = p.replace(/[〜～…]/g, '').trim(); if (c.length >= 2 && /[ぁ-んァ-ン]/.test(c) && !/^(forme|former)/i.test(c)) out.add(c);
    }));
    return [...out];
  }
  const nuanceText = (n) => plain([UNITS[n].nuance || '', ...(UNITS[n].grammar || []).map((g) => g.expl || '')].join(' '));
  function relations(n) {
    const all = order(), i = all.indexOf(n);
    const prev = i > 0 ? all[i - 1] : null, next = i < all.length - 1 ? all[i + 1] : null;
    const idx = kanjiIndex(), share = new Map();
    (UNITS[n].kanji || []).forEach((k) => (idx.get(k[0]) || []).forEach((m) => { if (m !== n) share.set(m, (share.get(m) || []).concat(k[0])); }));
    const shared = [...share.entries()].sort((a, b) => b[1].length - a[1].length || a[0] - b[0]).slice(0, 6).map(([m, ks]) => ({ n: m, ks }));
    const mine = cores(n), myText = nuanceText(n), contrast = [];
    for (const m of all) {
      if (m === n || Math.abs(m - n) < 1) continue;
      const theirs = cores(m);
      const a = mine.filter((c) => nuanceText(m).includes(c)), b = theirs.filter((c) => myText.includes(c));
      if (a.length || b.length) contrast.push({ n: m, via: [...new Set(a.concat(b))].slice(0, 3) });
    }
    contrast.sort((x, y) => y.via.length - x.via.length || Math.abs(x.n - n) - Math.abs(y.n - n));
    return { prev, next, shared, contrast: contrast.slice(0, 5) };
  }
  function cardState(id) {
    const s = S.srs[id];
    if (!s || !isSeen(s)) return { c: 0, t: 'pas encore révisée' };
    if ((s.l || 0) >= 3 || (s.hz || 0) >= 3) return { c: 1, t: 'difficile (oublis ou hésitations répétés)', hard: true };
    if (s.i >= 21) return { c: 4, t: 'ancrée (3 semaines ou plus)' };
    return { c: 2, t: 'en cours d’apprentissage' };
  }

  /* ---------- Vue d'ensemble ---------- */
  function renderOverview(el) {
    const W = Math.min(980, (el.closest('main') || document.body).clientWidth - 32);
    const cols = W < 560 ? 2 : W < 800 ? 3 : 4, gap = 14, bw = (W - gap * (cols - 1)) / cols;
    let y = 0, svg = '', path = [], list = '';
    const counts = [0, 0, 0, 0, 0];
    ['N4', 'N3', 'N2'].forEach((lv) => {
      const hasU = (m) => { for (let n = m[0]; n <= m[1]; n++) if (UNITS[n] && UNITS[n].vocab) return true; return false; };
      const mods = MODULES.map((m, i) => ({ m, i })).filter((x) => x.m[3] === lv && hasU(x.m));
      svg += `<text x="0" y="${y + 22}" class="lvl lv-${lv}">${lv}</text>`; y += 34;
      list += `<li><b>${lv}</b><ul>`;
      for (let r = 0; r < mods.length; r += cols) {
        let rowH = 0;
        mods.slice(r, r + cols).forEach((x, c) => {
          const units = []; for (let n = x.m[0]; n <= x.m[1]; n++) if (UNITS[n] && UNITS[n].vocab) units.push(n);
          const per = Math.max(1, Math.floor((bw - 20) / 30)), rows = Math.ceil(units.length / per), h = 46 + rows * 30;
          rowH = Math.max(rowH, h);
          const bx = c * (bw + gap), by = y;
          svg += `<g class="mod"><rect x="${bx}" y="${by}" width="${bw}" height="${h}" rx="10"/><text x="${bx + 10}" y="${by + 22}" class="mt">${esc(x.m[2])}</text>`;
          units.forEach((n, k) => {
            const s = mast(n); counts[s]++;
            const cx = bx + 22 + (k % per) * 30, cy = by + 44 + Math.floor(k / per) * 30;
            svg += `<a href="#carte-${n}" class="un m${s}" aria-label="Unité ${n}, ${esc(SYL[n] ? SYL[n].t : '')} : ${MS[s]}"><title>Unité ${n} · ${esc(SYL[n] ? SYL[n].t : '')} · ${MS[s]}</title><circle cx="${cx}" cy="${cy}" r="12"/><text x="${cx}" y="${cy + 4}">${n}</text></a>`;
          });
          svg += '</g>';
          path.push([bx + bw / 2, by + h / 2]);
          list += `<li>${esc(x.m[2])} : ${units.map((n) => `<a href="#carte-${n}">${n}</a> (${MS[mast(n)].toLowerCase()})`).join(', ')}</li>`;
        });
        y += rowH + gap;
      }
      list += '</ul></li>';
      y += 8;
    });
    const line = path.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(0) + ' ' + p[1].toFixed(0)).join(' ');
    el.innerHTML = `<h1>Carte du parcours</h1>
      <p class="muted">Trois niveaux, ${MODULES.length} modules, ${order().length} unités. La couleur indique la maîtrise réelle ; le fil relie les modules dans l’ordre des prérequis. Touchez une unité pour voir ses liens.</p>
      ${legend()}
      <div class="xmaptools rel" role="toolbar" aria-label="Zoom"><button type="button" class="btn-ghost" data-z="in" aria-label="Zoomer">＋</button><button type="button" class="btn-ghost" data-z="out" aria-label="Dézoomer">－</button><button type="button" class="btn-ghost" data-z="reset">Vue entière</button><span class="small muted">Glisser pour se déplacer · molette ou pincement pour zoomer</span></div><div class="xmap"><svg viewBox="-2 -2 ${W + 4} ${y + 4}" width="100%" role="group" aria-label="Carte des modules et des unités"><path d="${line}" class="thread"/>${svg}</svg></div>
      <details class="card panel"><summary>Version texte de la carte</summary><ul class="small xmaplist">${list}</ul></details>`;

    { const sv = el.querySelector('.xmap svg'); sv.setAttribute('tabindex', '0'); const pz = K.panzoom(sv, { max: 5 }); el.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => pz[{ in: 'zoomIn', out: 'zoomOut', reset: 'reset' }[b.dataset.z]]()); }
  }
  function legend() {
    return `<div class="xlegend">${MS.map((m, i) => `<span class="xl"><i class="m${i}"></i>${m}</span>`).join('')}<span class="xl"><i class="hard"></i>Difficile</span></div>`;
  }

  /* ---------- Vue centrée ---------- */
  function renderFocus(el, h) {
    const n = +h.slice(6); if (!UNITS[n] || !UNITS[n].vocab) { el.innerHTML = '<h1>Unité introuvable</h1><p><a href="#carte">Retour à la carte</a></p>'; return; }
    const u = UNITS[n], R = relations(n), s = mast(n);
    const G = (u.grammar || []).map((g) => ({ g, st: cardState(g.id) }));
    const KJ2 = (u.kanji || []).map((k, i) => ({ k, st: cardState(`k${n}-${i}`) }));
    const W = 760, H = 560, cx = W / 2, cy = H / 2;
    const node = (x, y, r, cls, label, href, sub, extra = '') => `<a ${href ? `href="${href}"` : 'tabindex="0" role="button"'} class="nd ${cls}" ${extra} aria-label="${esc(label + (sub ? ' : ' + sub : ''))}"><title>${esc(label)}${sub ? ' · ' + esc(sub) : ''}</title><circle cx="${x}" cy="${y}" r="${r}"/><text x="${x}" y="${y + 4}">${esc(label.length > 9 ? label.slice(0, 8) + '…' : label)}</text></a>`;
    let edges = '', nodes = '';
    G.forEach((x, i) => { const a = -Math.PI / 2 + (i / Math.max(1, G.length)) * Math.PI * 2, X = cx + Math.cos(a) * 130, Y = cy + Math.sin(a) * 130;
      edges += `<line x1="${cx}" y1="${cy}" x2="${X}" y2="${Y}" class="e-g"/>`;
      nodes += node(X, Y, 30, `g c${x.st.c}${x.st.hard ? ' hard' : ''}`, plain(x.g.pat).replace(/[〜～]/g, ''), `#unite-${n}/grammaire`, x.st.t); });
    KJ2.forEach((x, i) => { const a = -Math.PI / 2 + ((i + 0.5) / Math.max(1, KJ2.length)) * Math.PI * 2, X = cx + Math.cos(a) * 215, Y = cy + Math.sin(a) * 215;
      edges += `<line x1="${cx}" y1="${cy}" x2="${X}" y2="${Y}" class="e-k"/>`;
      nodes += node(X, Y, 20, `k w c${x.st.c}${x.st.hard ? ' hard' : ''}`, x.k[0], null, `${x.k[1]} · ${x.st.t}`, `data-w="${esc(x.k[0])}"`); });
    const side = [];
    if (R.prev) side.push({ n: R.prev, t: 'avant', cls: 'e-p' });
    if (R.next) side.push({ n: R.next, t: 'après', cls: 'e-p' });
    R.shared.slice(0, 3).forEach((x) => side.push({ n: x.n, t: 'kanji ' + x.ks.slice(0, 3).join(''), cls: 'e-s' }));
    R.contrast.slice(0, 3).forEach((x) => side.push({ n: x.n, t: 'contraste ' + x.via.join('・'), cls: 'e-c' }));
    side.forEach((x, i) => { const left = i % 2 === 0, row = Math.floor(i / 2), X = left ? 54 : W - 54, Y = 70 + row * 105;
      edges += `<path d="M${cx} ${cy} Q ${(cx + X) / 2} ${Y} ${X} ${Y}" class="${x.cls}"/>`;
      nodes += node(X, Y, 26, `u m${mast(x.n)}`, String(x.n), `#carte-${x.n}`, `${SYL[x.n] ? SYL[x.n].t : ''} · ${x.t}`); });
    nodes += `<a href="#unite-${n}" class="nd center m${s}" aria-label="Ouvrir l’unité ${n}"><circle cx="${cx}" cy="${cy}" r="48"/><text x="${cx}" y="${cy - 4}" class="big">${n}</text><text x="${cx}" y="${cy + 16}" class="sm">${["Non ouverte", "Consultée", "Terminée", "Comprise", "Maîtrisée"][s]}</text></a>`;
    el.innerHTML = `<a class="back-link" href="#carte">Retour à la carte</a>
      <div class="xmeta">Carte · ${lvOf(n)} · unité ${n}</div><h1>${esc(SYL[n] ? SYL[n].t : 'Unité ' + n)}</h1>
      ${legend()}
      <div class="xedges small"><span class="e-g">— grammaire</span><span class="e-k">— kanji</span><span class="e-p">— avant / après</span><span class="e-s">— kanji partagés</span><span class="e-c">— contrastes</span></div>
      <div class="xmaptools rel" role="toolbar" aria-label="Zoom"><button type="button" class="btn-ghost" data-z="in" aria-label="Zoomer">＋</button><button type="button" class="btn-ghost" data-z="out" aria-label="Dézoomer">－</button><button type="button" class="btn-ghost" data-z="reset">Vue entière</button><span class="small muted">Glisser pour se déplacer · molette ou pincement pour zoomer</span></div><div class="xmap xfocus"><svg viewBox="0 0 ${W} ${H}" width="100%" role="group" aria-label="Liens de l’unité ${n}">${edges}${nodes}</svg></div>
      <div class="grid2">
        <div class="card panel"><h2>Grammaire</h2><ul class="small">${G.map((x) => `<li><span class="jp">${ruby(x.g.pat)}</span> · ${esc(x.g.mean || '')} <span class="muted">(${x.st.t})</span></li>`).join('')}</ul>
          <h2>Kanji</h2><p class="small">${KJ2.map((x) => `<span class="w jp" data-w="${esc(x.k[0])}" tabindex="0" role="button">${esc(x.k[0])}</span> ${esc(x.k[1])}${x.st.hard ? ' (difficile)' : ''}`).join(' · ')}</p></div>
        <div class="card panel"><h2>Liens</h2><ul class="small">
          ${R.prev ? `<li>Avant : <a href="#carte-${R.prev}">unité ${R.prev}</a> · ${esc(SYL[R.prev].t)}</li>` : ''}
          ${R.next ? `<li>Après : <a href="#carte-${R.next}">unité ${R.next}</a> · ${esc(SYL[R.next].t)}</li>` : ''}
          ${R.shared.map((x) => `<li>Kanji partagés (${esc(x.ks.join(''))}) : <a href="#carte-${x.n}">unité ${x.n}</a> · ${esc(SYL[x.n].t)}</li>`).join('')}
          ${R.contrast.map((x) => `<li>Contraste (〜${esc(x.via.join('、〜'))}) : <a href="#carte-${x.n}">unité ${x.n}</a> · ${esc(SYL[x.n].t)}</li>`).join('') || '<li class="muted">Aucun contraste repéré dans les notes de nuance.</li>'}
        </ul></div></div>`;

    { const sv = el.querySelector('.xmap svg'); sv.setAttribute('tabindex', '0'); const pz = K.panzoom(sv, { max: 5 }); el.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => pz[{ in: 'zoomIn', out: 'zoomOut', reset: 'reset' }[b.dataset.z]]()); }
  }

  K.view({ name: 'carte', title: 'Carte du parcours', nav: 'progres', match: (h) => h === 'carte', render: renderOverview });
  K.view({ name: 'carte-unite', title: 'Carte d’une unité', nav: 'progres', match: (h) => /^carte-\d+$/.test(h), render: renderFocus });
  K.on('progres', (el) => {
    K.tile(el, { id: 'carte', grid: '[data-xhub]', href: '#carte', kj: '図', title: 'Carte du parcours', text: 'Modules, unités, prérequis, kanji partagés et contrastes, colorés par maîtrise.' });
  });
  K.carte = { relations };
})();
