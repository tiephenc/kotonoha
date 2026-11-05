/* KOTONOHA · le chemin (#chemin) : carte de progression du N4 au N2, façon carte d'aventure.
   Une étape par module (MODULES). XP de parcours : registre à clés uniques (KX.local 'chemin-xp'), alimenté
   uniquement par les données réelles ; une clé ne rapporte jamais deux fois et le total ne baisse jamais.
   Architecture et barème : KOTONOHA_CHEMIN.md. Rien de pédagogique n'est bloqué : les étapes « verrouillées »
   le sont sur la carte seulement, toutes les leçons restent ouvertes dans Apprendre. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const W = 320, H = 960;
  // Cascades : [x, y de départ, longueur], partagées par le canvas et la couche animée.
  const WF = [[92, 655, 46], [228, 386, 40], [66, 384, 34]];

  /* ---------- XP de parcours ---------- */
  const STREAKS = [[3, 30], [7, 60], [14, 120], [30, 250], [60, 500], [100, 1000]];
  function longestStreak() {
    const days = Object.keys((S.g && S.g.days) || {}).concat((S.g && S.g.frz) || []).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k) && metDay(k)).sort();
    let best = 0, run = 0, prev = null;
    [...new Set(days)].forEach((k) => { const t = Date.parse(k + 'T12:00:00Z'); run = prev != null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; prev = t; best = Math.max(best, run); });
    return best;
  }
  function syncXP() {
    const L = K.local.get('chemin-xp', {}); let added = 0;
    const put = (k, v) => { v = Math.max(0, Math.round(+v || 0)); const o = +L[k] || 0; if (v > o) { L[k] = v; added += v - o; } };
    for (const n of Object.keys(S.units || {})) {
      const u = S.units[n]; if (!u || !u.done || !UNITS[n]) continue;
      for (const k of Object.keys(u.done)) if (u.done[k] && k !== 'test') put(`s:${n}:${k}`, 10);
      if (u.done.test) { const U = UNITS[n]; put(`t:${n}`, U.kind === 'examen' || U.kind === 'diag' ? 150 : U.bilan ? 100 : 40); put(`tb:${n}`, Math.min(10, Math.max(0, Math.round(((+u.best || 0) - 70) / 3)))); }
    }
    const ex = {}; (S.log || []).forEach((r) => { if (r && r[3] && r[1] && r[2]) { const k = `e:${r[1]}:${r[2]}`; ex[k] = (ex[k] || 0) + 1; } });
    for (const k in ex) put(k, Math.min(20, ex[k]));
    for (const d in (S.rh || {})) if ((+S.rh[d] || 0) >= 10) put(`r:${d}`, 15);
    const ls = longestStreak(); STREAKS.forEach(([n, x]) => { if (ls >= n) put(`st:${n}`, x); });
    if (added) K.local.set('chemin-xp', L);
    let total = 0; for (const k in L) total += +L[k] || 0;
    return { L, total, added, streak: ls };
  }
  const T = (l) => 50 * l * (l - 1); // XP nécessaire pour atteindre le niveau l (100 × N pour passer de N à N+1)
  function level(xp) { let l = 1; while (T(l + 1) <= xp) l++; return { l, lo: T(l), hi: T(l + 1), p: (xp - T(l)) / (T(l + 1) - T(l)) }; }

  /* ---------- Étapes ---------- */
  const valid = (n) => !!(S.units[n] && S.units[n].done && S.units[n].done.test);
  function stages() {
    return MODULES.map(([a, b, t, lv], i) => { const units = []; for (let n = a; n <= b; n++) if (UNITS[n]) units.push(n); const done = units.filter(valid).length;
      return { i, a, b, t, lv, units, done, ok: units.length > 0 && done === units.length }; });
  }
  function current(st) { const c = st.findIndex((s) => !s.ok); return c < 0 ? st.length - 1 : c; }

  /* ---------- Géométrie : trois îles étagées, chemin sinueux de bas en haut ---------- */
  const BANDS = { N4: [900, 690], N3: [620, 400], N2: [350, 168] };
  let GEO = null;
  function geometry(st) {
    if (GEO) return GEO;
    const by = { N4: [], N3: [], N2: [] }; st.forEach((s) => by[s.lv].push(s));
    const pts = [];
    ['N4', 'N3', 'N2'].forEach((lv, r) => { const [y0, y1] = BANDS[lv], L = by[lv];
      L.forEach((s, j) => { const y = y0 - (y0 - y1) * (L.length > 1 ? j / (L.length - 1) : 0); const x = 160 + Math.sin(s.i * .82 + r * 1.3) * 92 + Math.sin(s.i * 2.1) * 12; pts[s.i] = [Math.max(46, Math.min(274, x)), y]; }); });
    // Chemin lissé (Catmull-Rom), échantillonné ; seg[i] = indice du point d'échantillon de l'étape i
    const path = [], seg = [];
    for (let i = 0; i < pts.length; i++) {
      seg[i] = path.length; if (i === pts.length - 1) { path.push(pts[i]); break; }
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 14; k++) { const t = k / 14, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        path.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); }
    }
    return (GEO = { pts, path, seg });
  }

  /* ---------- Paysage en pixel art (dessiné une fois) ---------- */
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function paint(cv, st, cur) {
    const g = cv.getContext('2d'), { path, seg } = geometry(st); seed = 11;
    const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
    const blob = (x, y, r, c, c2) => { for (let dy = -r; dy <= r; dy++) { const w = Math.round(Math.sqrt(r * r - dy * dy)); R(x - w, y + dy, w * 2, 1, dy < -r / 3 && c2 ? c2 : c); } };
    // Ciel et mer de nuages
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#120E2A'); sky.addColorStop(.45, '#1C1640'); sky.addColorStop(1, '#241B4E'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) R(rnd() * W, rnd() * 260, 1, 1, i % 6 ? '#C9C1E8' : '#F2D6F0');
    blob(62, 46, 17, '#F6D9E4', '#FBE9EF'); blob(56, 42, 5, '#EAC4D4'); g.fillStyle = 'rgba(246,217,228,.08)'; g.beginPath(); g.arc(62, 46, 34, 0, 7); g.fill();
    // Mont Fuji, au loin derrière la dernière île
    for (let y = 36; y < 170; y++) { const w = (y - 36) * 1.35 + 5; R(196 - w, y, w * 2, 1, y < 64 ? '#EDE7F7' : y < 72 && (y + Math.floor(w)) % 3 ? '#EDE7F7' : y % 9 ? '#3A3070' : '#40367A'); }
    for (let k = 0; k < 7; k++) { const x = 70 + k * 36, y = 150 + (k % 3) * 6; g.fillStyle = 'rgba(200,180,240,.22)'; g.beginPath(); g.ellipse(x, y, 34, 7, 0, 0, 7); g.fill(); }
    for (let i = 0; i < 26; i++) { const y = 130 + rnd() * 760, x = rnd() * W, w = 30 + rnd() * 60; g.fillStyle = 'rgba(120,100,190,.12)'; g.fillRect(x, y, w, 3); g.fillRect(x + 8, y - 2, w * .6, 2); }
    // Îles : relief (falaise) puis dessus
    const isle = (lv) => { const [y0, y1] = BANDS[lv], top = y1 - 42, bot = y0 + 34, rows = [];
      for (let y = top; y <= bot; y++) { const k = Math.min(1, (y - top) / 26, (bot - y) / 22), near = path.reduce((a, p) => (Math.abs(p[1] - y) < Math.abs(a[1] - y) ? p : a), path[0]);
        const cx = near[0] * .55 + 160 * .45, hw = (92 + Math.sin(y / 23) * 22 + Math.sin(y / 7.3) * 8) * Math.max(0, Math.sqrt(Math.max(0, k))); if (hw > 2) rows.push([y, cx - hw, cx + hw]); }
      rows.forEach(([y, a, b]) => { for (let d = 1; d <= 16; d++) R(a, y + d, b - a, 1, d < 4 ? '#3B2E5C' : (Math.floor(a + d) % 5 ? '#2A2148' : '#33285A')); });
      rows.forEach(([y, a, b]) => { R(a, y, b - a, 1, y % 3 ? '#2E4A3A' : '#335240'); R(a, y, 2, 1, '#41654E'); R(b - 2, y, 2, 1, '#41654E'); for (let x = a + (y % 7); x < b; x += 9) R(x, y, 1, 1, '#3E6049'); });
      return rows; };
    const isl = { N4: isle('N4'), N3: isle('N3'), N2: isle('N2') };
    // Cascades et rivières entre les îles
    WF.forEach(([x, y, h]) => { for (let k = 0; k < h; k++) R(x, y + k, 6, 1, k % 4 ? '#8FB2E8' : '#CFE1FF'); R(x - 3, y + h, 12, 3, 'rgba(220,235,255,.5)'); });
    for (let y = 700; y < 860; y++) R(250 + Math.sin(y / 12) * 6, y, 5, 1, '#3E5C8E');
    // Mer de nuages entre les îles (brume volumétrique)
    [[372, 1], [660, 0], [930, 1]].forEach(([y, o]) => { for (let k = 0; k < 9; k++) { const x = (k * 43 + o * 20) % (W + 40) - 20, r = 18 + (k % 3) * 7; g.fillStyle = 'rgba(176,156,226,.20)'; g.beginPath(); g.ellipse(x, y + (k % 2) * 6, r * 1.8, r * .55, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(236,226,255,.10)'; g.beginPath(); g.ellipse(x - 4, y - 3 + (k % 2) * 6, r * 1.2, r * .32, 0, 0, 7); g.fill(); } });
    // Le chemin
    const done = seg[cur];
    path.forEach(([x, y], k) => { R(x - 3, y - 2, 7, 5, '#251C3E'); });
    path.forEach(([x, y], k) => { R(x - 2, y - 1, 5, 3, k <= done ? '#D9C4A6' : '#776A91'); if (k % 3 === 0) R(x - 1, y, 2, 1, k <= done ? '#F4E3C2' : '#9387B0'); });
    // Lanternes le long du chemin (allumées jusqu'à l'étape en cours)
    for (let k = 7; k < path.length; k += 11) { const [x, y] = path[k], lit = k <= done, ox = (k % 2 ? 9 : -10);
      R(x + ox, y - 8, 1, 8, '#1B1430'); R(x + ox - 1, y - 11, 3, 4, lit ? '#F6B451' : '#5B4E7A'); if (lit) { g.fillStyle = 'rgba(246,180,81,.18)'; g.fillRect(x + ox - 5, y - 15, 11, 11); } }
    // Décors des régions
    const tree = (x, y, pink) => { R(x - 1, y, 3, 6, '#1D1430'); blob(x, y - 3, 5 + (rnd() * 3 | 0), pink ? '#C66BB0' : '#1E3A2E', pink ? '#E9A0D2' : '#2A4D3B'); };
    const torii = (x, y, s = 1) => { R(x - 9 * s, y - 14 * s, 18 * s, 2 * s, '#C23A3A'); R(x - 10 * s, y - 16 * s, 20 * s, 2 * s, '#2A1830'); R(x - 7 * s, y - 12 * s, 2 * s, 12 * s, '#C23A3A'); R(x + 5 * s, y - 12 * s, 2 * s, 12 * s, '#C23A3A'); R(x - 7 * s, y - 9 * s, 14 * s, 1 * s, '#C23A3A'); };
    const house = (x, y) => { R(x - 8, y - 6, 16, 7, '#D9C9A8'); R(x - 6, y - 4, 3, 3, '#F6B451'); R(x + 2, y - 4, 3, 3, '#F6B451'); R(x - 11, y - 10, 22, 4, '#2B2552'); R(x - 9, y - 12, 18, 2, '#3A3470'); };
    const pagoda = (x, y) => { for (let k = 0; k < 4; k++) { const w = 22 - k * 4, yy = y - k * 9; R(x - w / 2, yy - 6, w, 6, '#3A2A48'); R(x - w / 2 + 2, yy - 5, w - 4, 4, k ? '#F6B451' : '#E8B05A'); R(x - w / 2 - 3, yy - 9, w + 6, 3, '#1E1838'); } R(x, y - 42, 1, 6, '#F6B451'); };
    const castle = (x, y) => { R(x - 16, y - 8, 32, 8, '#8C82A8'); for (let k = 0; k < 3; k++) { const w = 28 - k * 8, yy = y - 8 - k * 10; R(x - w / 2, yy - 7, w, 7, '#E9E2F2'); R(x - w / 2 + 3, yy - 5, 3, 3, '#F6B451'); R(x + w / 2 - 6, yy - 5, 3, 3, '#F6B451'); R(x - w / 2 - 3, yy - 10, w + 6, 3, '#2B2552'); } };
    const free = (x, y) => !path.some((p) => Math.abs(p[0] - x) < 16 && Math.abs(p[1] - y) < 12);
    const onIsle = (rows, x, y) => rows.some(([yy, a, b]) => yy === Math.round(y) && x > a + 6 && x < b - 6);
    const scatter = (rows, n, fn) => { let c = 0, guard = 0; while (c < n && guard++ < 600) { const r = rows[(rnd() * rows.length) | 0]; if (!r) break; const x = r[1] + rnd() * (r[2] - r[1]), y = r[0]; if (onIsle(rows, x, y) && free(x, y)) { fn(x, y); c++; } } };
    scatter(isl.N4, 16, (x, y) => tree(x, y, rnd() < .35)); scatter(isl.N4, 5, house);
    scatter(isl.N3, 14, (x, y) => { if (rnd() < .55) { for (let k = 0; k < 4; k++) R(x + k * 2, y - 12 - (k % 2) * 3, 1, 14, k % 2 ? '#3F6E3A' : '#2F5A2E'); } else tree(x, y, rnd() < .5); });
    scatter(isl.N2, 14, (x, y) => tree(x, y, rnd() < .6));
    const P = geometry(st).pts, last = P.length - 1;
    const side = (p, d) => p[0] + (p[0] < 160 ? d : -d);
    torii(P[0][0] - 18, P[0][1] + 6, 1.2); if (P[9]) torii(side(P[9], 18), P[9][1] + 4); if (P[20]) torii(side(P[20], 18), P[20][1] + 4);
    if (P[14]) pagoda(side(P[14], 38), P[14][1] + 8); if (P[26]) pagoda(side(P[26], 38), P[26][1] + 8);
    castle(P[last][0], P[last][1] - 16);
    for (let k = 0; k < 3; k++) { const x = P[4 + k] ? P[4 + k][0] + (k % 2 ? 26 : -26) : 100; house(x, P[4 + k] ? P[4 + k][1] + 10 : 700); }
    // Pont rouge sur la rivière du N3
    const bp = P[12] || [160, 470]; for (let k = 0; k < 18; k++) R(bp[0] - 30 + k, bp[1] + 14 - Math.round(Math.sin(k / 17 * Math.PI) * 4), 1, 2, '#C23A3A'); R(bp[0] - 32, bp[1] + 16, 40, 3, '#3E5C8E');
  }

  /* ---------- Personnage : un petit voyageur noir en pixel art ---------- */
  const SPR = ['....kkkk....', '...kkkkkk...', '..kkkkkkkk..', '..kkwkkwkk..', '..kkkkkkkk..', '...kkkkkk...', '..kkkkkkkkk.', '.kkkkkkkk.kk', '.kkkkkkkk...', '.kkkkkkkk...', '..kkkkkk....', '..kk..kk....', '..kk..kk....'];
  function sprite() { const c = document.createElement('canvas'); c.width = 12; c.height = 13; const g = c.getContext('2d');
    SPR.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '.') return; g.fillStyle = ch === 'w' ? '#F4EEFF' : '#07050C'; g.fillRect(x, y, 1, 1); })); return c; }

  /* ---------- Écran ---------- */
  let zoom = 1;
  const pct = ([x, y]) => [(x / W * 100).toFixed(3), (y / H * 100).toFixed(3)];
  function nextReward(st, xp) {
    const md = st.filter((s) => s.ok).length;
    const km = (window.KX_KAMON || []).map((k) => [k, /^mod(\d+)$/.exec(k.unlock || '')]).filter(([, m]) => m && +m[1] > md).sort((a, b) => a[1][1] - b[1][1])[0];
    const sk = STREAKS.find(([n]) => n > xp.streak);
    return [km ? `Kamon « ${plain(km[0].j)} » : ${km[1][1]} modules terminés (encore ${km[1][1] - md})` : '', sk ? `Bonus de série : ${sk[0]} jours d’affilée (+${sk[1]} XP) · record actuel ${xp.streak} jour${xp.streak > 1 ? 's' : ''}` : ''].filter(Boolean);
  }
  const plain = (s) => String(s || '').replace(/\{[^}]*\}/g, '');
  function render(el) {
    const st = stages(), cur = current(st), xp = syncXP(), lv = level(xp.total), G = geometry(st);
    const ord = typeof unitOrder === 'function' ? unitOrder() : [], vu = ord.filter(valid).length, route = ord.length ? vu / ord.length : 0;
    const x = K.st(); x.chemin = x.chemin && typeof x.chemin === 'object' ? x.chemin : {}; const from = Number.isInteger(x.chemin.at) ? Math.min(x.chemin.at, cur) : cur;
    const rw = nextReward(st, xp);
    el.innerHTML = `<h1>Le chemin</h1>
      <p class="muted">Du N4 au N2, une étape par module. L’XP vient de vos activités réelles et rien ne compte deux fois ; toutes les leçons restent ouvertes dans <a href="#parcours">Parcours</a>.</p>
      <div class="xch">
        <div class="xch-hud">
          <div class="xch-stat"><span>XP de parcours</span><b class="num">${xp.total.toLocaleString('fr-FR')}</b></div>
          <div class="xch-stat lvl"><span>Niveau ${lv.l}</span><div class="xch-bar" role="progressbar" aria-label="Progression vers le niveau ${lv.l + 1}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(lv.p * 100)}"><i style="width:${(lv.p * 100).toFixed(1)}%"></i></div><small class="num">${(xp.total - lv.lo).toLocaleString('fr-FR')} / ${(lv.hi - lv.lo).toLocaleString('fr-FR')} XP avant le niveau ${lv.l + 1}</small></div>
          <div class="xch-stat"><span>Parcours</span><b class="num">${Math.round(route * 100)} %</b><small>${vu} / ${ord.length} unités validées · ${st.filter((s) => s.ok).length} / ${st.length} étapes</small></div>
          <div class="xch-stat rw"><span>Prochaine récompense</span>${rw.map((r) => `<small>${esc(r)}</small>`).join('') || '<small>Toutes les récompenses du chemin sont obtenues.</small>'}</div>
        </div>
        <div class="xch-main">
          <div class="xch-tools" role="toolbar" aria-label="Carte"><button type="button" class="btn-ghost" data-cz="in" aria-label="Rapprocher"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><button type="button" class="btn-ghost" data-cz="out" aria-label="Éloigner"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button><button type="button" class="btn-ghost" data-cz="me">Où suis-je</button></div>
          <div class="xch-view" tabindex="0" aria-label="Carte du chemin. Glisser ou utiliser les flèches pour se déplacer.">
            <div class="xch-world" style="--z:${zoom}">
              <canvas width="${W}" height="${H}" aria-hidden="true"></canvas>
              <div class="xch-fog" style="height:${(Math.max(0, G.pts[cur][1] - 24) / H * 100).toFixed(2)}%" aria-hidden="true"><i></i><i></i><i></i></div>
              <div class="xch-life" aria-hidden="true">${[...Array(22)].map((_, i) => `<i class="ff" style="left:${(7 + (i * 37) % 86)}%;top:${(30 + (i * 53) % 68)}%;animation-delay:${(i * .37).toFixed(2)}s"></i>`).join('')}${[...Array(12)].map((_, i) => `<i class="pt" style="left:${(4 + (i * 29) % 92)}%;animation-delay:${(i * 1.3).toFixed(1)}s;animation-duration:${(9 + i % 5 * 2)}s"></i>`).join('')}${WF.map(([x, y, h]) => `<i class="wf" style="left:${(x / W * 100).toFixed(2)}%;top:${(y / H * 100).toFixed(2)}%;height:${(h / H * 100).toFixed(2)}%"></i>`).join('')}</div>
              <div class="xch-reg" aria-hidden="true">${[['N4', '村', 820], ['N3', '竹林', 540], ['N2', '富士', 270]].map(([l, k, y]) => `<span style="top:${(y / H * 100).toFixed(1)}%"><b lang="ja">${k}</b>${l}</span>`).join('')}</div>
              ${st.map((s) => { const [px, py] = pct(G.pts[s.i]), state = s.ok ? 'done' : s.i === cur ? 'cur' : 'lock';
                const tip = state === 'lock' ? `Étape ${s.i + 1} · encore dans la brume` : `Étape ${s.i + 1} · ${s.t}`;
                return `<button type="button" class="xch-st s-${state}" data-i="${s.i}" style="left:${px}%;top:${py}%" aria-label="${esc(tip)}${state === 'done' ? ', terminée' : state === 'cur' ? ', en cours' : ', verrouillée'}"${state === 'lock' ? ' aria-disabled="true"' : ''}>
                  <span class="ring"><svg viewBox="0 0 24 24" aria-hidden="true">${state === 'done' ? '<path d="M6 12.5l4 4L18 8"/>' : state === 'cur' ? '<circle cx="12" cy="12" r="4"/>' : '<rect x="7" y="11" width="10" height="8" rx="1"/><path d="M9 11V8a3 3 0 0 1 6 0v3"/>'}</svg></span><span class="tip">${esc(tip)}</span></button>`; }).join('')}
              <div class="xch-hero" aria-hidden="true" style="left:${pct(G.pts[from])[0]}%;top:${pct(G.pts[from])[1]}%"></div>
            </div>
          </div>
        </div>
        <aside id="xchinfo" class="card panel xch-info" aria-live="polite"></aside>
      </div>`;
    const cv = el.querySelector('canvas'); paint(cv, st, cur);
    const hero = el.querySelector('.xch-hero'); hero.appendChild(sprite());
    const view = el.querySelector('.xch-view');
    const centerOn = (i, smooth) => { const b = el.querySelector(`.xch-st[data-i="${i}"]`); if (!b) return; const r = b.getBoundingClientRect(), v = view.getBoundingClientRect();
      view.scrollTo({ left: view.scrollLeft + r.left - v.left - v.width / 2, top: view.scrollTop + r.top - v.top - v.height * .55, behavior: smooth && !K.reduced() ? 'smooth' : 'auto' }); };
    requestAnimationFrame(() => centerOn(from, false));
    el.querySelectorAll('.xch-st').forEach((b) => b.onclick = () => { if (b.getAttribute('aria-disabled') === 'true') { info(el, st, cur, +b.dataset.i, xp); return; } info(el, st, cur, +b.dataset.i, xp); });
    info(el, st, cur, cur, xp);
    // Zoom et déplacement
    el.querySelectorAll('[data-cz]').forEach((b) => b.onclick = () => { const k = b.dataset.cz; if (k === 'me') return centerOn(cur, true);
      zoom = Math.max(1, Math.min(2.4, zoom * (k === 'in' ? 1.3 : 1 / 1.3))); el.querySelector('.xch-world').style.setProperty('--z', zoom); centerOn(cur, false); });
    let drag = null;
    view.addEventListener('pointerdown', (e) => { if (e.button) return; drag = { x: e.clientX, y: e.clientY, l: view.scrollLeft, t: view.scrollTop, moved: false }; });
    view.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) { drag.moved = true; view.setPointerCapture(e.pointerId); view.classList.add('panning'); } view.scrollLeft = drag.l - dx; view.scrollTop = drag.t - dy; });
    const end = () => { drag = null; view.classList.remove('panning'); };
    view.addEventListener('pointerup', end); view.addEventListener('pointercancel', end);
    view.addEventListener('keydown', (e) => { const d = { ArrowUp: [0, -60], ArrowDown: [0, 60], ArrowLeft: [-60, 0], ArrowRight: [60, 0] }[e.key]; if (d && e.target === view) { e.preventDefault(); view.scrollBy(d[0], d[1]); } });
    // Le voyageur marche jusqu'à l'étape en cours si une leçon a fait avancer le parcours
    if (from < cur) walk(el, G, from, cur, () => { x.chemin.at = cur; save(); centerOn(cur, true); });
    else if (x.chemin.at !== cur) { x.chemin.at = cur; save(); }
    if (xp.added && K.toast) setTimeout(() => K.toast(`+${xp.added.toLocaleString('fr-FR')} XP de parcours depuis votre dernière visite.`), 500);
  }
  function walk(el, G, from, to, done) {
    const hero = el.querySelector('.xch-hero'), a = G.seg[from], b = G.seg[to];
    if (K.reduced()) { const p = pct(G.path[b]); hero.style.left = p[0] + '%'; hero.style.top = p[1] + '%'; return done(); }
    hero.classList.add('walking'); const dur = Math.min(6000, 900 + (b - a) * 60), t0 = performance.now();
    const step = (t) => { if (!hero.isConnected) return; const k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, f = a + (b - a) * e, i = Math.floor(f), q = f - i, p0 = G.path[i], p1 = G.path[Math.min(G.path.length - 1, i + 1)];
      const p = pct([p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q]); hero.style.left = p[0] + '%'; hero.style.top = p[1] + '%'; hero.classList.toggle('flip', p1[0] < p0[0]);
      if (k < 1) requestAnimationFrame(step); else { hero.classList.remove('walking'); done(); } };
    requestAnimationFrame(step);
  }
  function info(el, st, cur, i, xp) {
    const s = st[i], box = el.querySelector('#xchinfo'), state = s.ok ? 'done' : i === cur ? 'cur' : 'lock';
    el.querySelectorAll('.xch-st').forEach((b) => b.classList.toggle('sel', +b.dataset.i === i));
    const head = `<p class="xmeta">Étape ${i + 1} sur ${st.length} · ${esc(s.lv)}</p>`;
    if (state === 'lock') { box.innerHTML = `${head}<h2>Encore dans la brume</h2><p class="muted">Cette étape se dévoilera quand l’étape ${cur + 1} sera terminée. Ses leçons restent ouvertes dans <a href="#parcours">Parcours</a> si vous voulez prendre de l’avance.</p>`; return; }
    const xpOf = s.units.reduce((a, n) => { for (const k in xp.L) if (k.split(':')[1] === String(n)) a += +xp.L[k] || 0; return a; }, 0);
    const rows = s.units.map((n) => { const u = S.units[n] || {}, ok = valid(n); return `<li class="${ok ? 'ok' : ''}"><a href="#unite-${n}">Unité ${n} · ${esc((SYL[n] || {}).t || '')}</a><span>${ok ? `validée le ${new Date(u.at || Date.now()).toLocaleDateString('fr-FR')}${u.best ? ` · ${Math.round(u.best)} %` : ''}` : unitPct(n) ? `${unitPct(n)} % fait` : 'à faire'}</span></li>`; }).join('');
    if (state === 'done') {
      const last = Math.max(...s.units.map((n) => (S.units[n] || {}).at || 0));
      box.innerHTML = `${head}<h2>${esc(s.t)}</h2><p><b>Terminée</b>${last ? ` le ${new Date(last).toLocaleDateString('fr-FR')}` : ''} · ${xpOf.toLocaleString('fr-FR')} XP gagnés ici.</p><ul class="xch-units">${rows}</ul>`;
    } else {
      const n = s.units.find((u) => !valid(u)) || s.a, ns = nextStep(), href = ns.n >= s.a && ns.n <= s.b ? `#unite-${ns.n}/${ns.sec}` : `#unite-${n}`;
      box.innerHTML = `${head}<h2>${esc(s.t)}</h2><p>${s.done} / ${s.units.length} unités validées · ${xpOf.toLocaleString('fr-FR')} XP gagnés ici.</p><a class="btn" href="${href}">Continuer : unité ${ns.n >= s.a && ns.n <= s.b ? ns.n : n}</a><ul class="xch-units">${rows}</ul>`;
    }
  }
  K.view({ name: 'chemin', title: 'Le chemin', nav: 'parcours', match: (h) => h === 'chemin', render });
  K.chemin = { syncXP, level, stages, current };
})();
