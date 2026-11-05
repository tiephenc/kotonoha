/* KOTONOHA · décor de fond : l'intérieur d'un vieil izakaya de campagne, en pixel art, très atténué.
   Un petit canvas (320 × 200) agrandi sans lissage, fixe derrière tout le site, purement décoratif.
   Jour : bois clair, fenêtre sur le satoyama. Nuit : lanternes allumées, village et pluie derrière la fenêtre.
   Animation lente (6 images/s), arrêtée si l'onglet est caché ou si prefers-reduced-motion. */
(function () {
  'use strict';
  const W = 320, H = 200;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H; cv.className = 'xdecor'; cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  // Graine fixe : le décor est toujours le même, seuls les détails animés bougent.
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const STARS = [...Array(40)].map(() => [rnd(), rnd() * .6]);
  const VILL = [...Array(14)].map(() => [rnd(), rnd()]);
  const BOT = [...Array(9)].map(() => [rnd(), rnd()]);
  const DROPS = [...Array(46)].map(() => [rnd(), rnd()]);
  const PAL = {
    jour: { wall: '#C9A77A', wall2: '#B89366', beam: '#6E4A2A', beamD: '#4E321C', floor: '#8C6440', counter: '#7A5232', counterTop: '#A57A4E',
      sky: '#D9E4DC', sky2: '#EEF0E2', hill: '#7D9A5C', hill2: '#5E7D3F', tree: '#3F5726', frame: '#5A3B22', shoji: '#F1E8D4', tag: '#EFE4CB', ink: '#3A2A1D',
      lampOff: '#B9462F', lampOn: '#E2604A', glow: 0, noren: '#2A3A5E', bottle: ['#4E6B3A', '#7A3A2A', '#2E4A5E', '#8C6A2E'] },
    nuit: { wall: '#3A2819', wall2: '#2E1F13', beam: '#1E140C', beamD: '#140D08', floor: '#24170E', counter: '#2E1E12', counterTop: '#46301D',
      sky: '#141C33', sky2: '#1E2846', hill: '#1A2418', hill2: '#141C12', tree: '#0F150D', frame: '#1A110A', shoji: '#F0C27A', tag: '#5A4630', ink: '#2A1C12',
      lampOff: '#C8442E', lampOn: '#F07A4A', glow: 1, noren: '#1B2640', bottle: ['#3A5A2E', '#6A2A20', '#24405A', '#7A5A22'] },
  };
  let g = cv.getContext('2d');
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const base = {};
  // t === null : scène fixe (dans un canvas hors écran) ; sinon : seulement les détails animés, par-dessus.
  function draw(t) {
    const night = document.documentElement.dataset.theme === 'nuit', P = PAL[night ? 'nuit' : 'jour'], st = t === null;
    if (!st) { const key = night ? 'nuit' : 'jour'; if (!base[key]) { const c = document.createElement('canvas'); c.width = W; c.height = H; const keep = g; g = c.getContext('2d'); draw(null); g = keep; base[key] = c; } g.drawImage(base[key], 0, 0); }
    seed = 7;
    if (!st) return anim(t, night, P);
    // Mur de planches
    R(0, 0, W, H, P.wall);
    for (let x = 0; x < W; x += 14) { R(x, 0, 1, H, P.wall2); if ((x / 14) % 3 === 1) R(x + 6, 30, 1, 3, P.wall2); }
    // Fenêtre (shitajimado) sur la campagne
    const wx = 36, wy = 34, ww = 116, wh = 70;
    R(wx - 4, wy - 4, ww + 8, wh + 8, P.frame);
    const grd = g.createLinearGradient(0, wy, 0, wy + wh); grd.addColorStop(0, P.sky); grd.addColorStop(1, P.sky2); g.fillStyle = grd; g.fillRect(wx, wy, ww, wh);
    if (night) {
      R(wx + ww - 22, wy + 8, 8, 8, '#F2E6C4'); R(wx + ww - 20, wy + 8, 6, 6, P.sky); // lune
    } else { R(wx + 18, wy + 10, 10, 10, '#F4EBC8'); }
    // Collines et forêt du satoyama
    for (let x = 0; x < ww; x++) { const h1 = 22 + Math.sin(x / 13) * 6 + Math.sin(x / 5) * 2, h2 = 12 + Math.sin(x / 9 + 1) * 4;
      R(wx + x, wy + wh - h1, 1, h1, P.hill); R(wx + x, wy + wh - h2, 1, h2, P.hill2); }
    for (let i = 0; i < 9; i++) { const x = wx + 6 + i * 13, h = 10 + ((i * 7) % 6); R(x, wy + wh - 18 - h, 3, h, P.tree); R(x - 2, wy + wh - 14 - h, 7, 6, P.tree); }
    // Croisillons de bambou
    for (let x = wx; x <= wx + ww; x += 29) R(x, wy, 2, wh, P.frame);
    R(wx, wy + wh / 2, ww, 2, P.frame);
    // Poutre et lanternes
    R(0, 14, W, 8, P.beam); R(0, 22, W, 2, P.beamD);
    [[60, 1], [176, 0], [258, 1]].forEach(([x, big], i) => {
      const h = big ? 22 : 18, w = big ? 14 : 12, y = 26;
      R(x + w / 2, 22, 1, 4, P.ink);
      R(x + 2, y, w - 4, 2, P.ink); R(x, y + 2, w, h - 4, night ? P.lampOn : P.lampOff); R(x + 2, y + h - 2, w - 4, 2, P.ink);
      R(x, y + 7, w, 1, 'rgba(0,0,0,.25)'); R(x, y + 12, w, 1, 'rgba(0,0,0,.25)');
    });
    // Tablettes du menu (o-shinagaki), traits illisibles
    for (let i = 0; i < 8; i++) { const x = 178 + i * 16, y = 38; R(x, y, 11, 46, P.tag); R(x, y, 11, 2, P.wall2);
      for (let k = 0; k < 4; k++) R(x + 4, y + 6 + k * 9, 3, 5, P.ink); R(x + 3, y + 40, 5, 2, '#A3302A'); }
    // Noren de l'entrée, à gauche
    R(0, 24, 26, 64, P.noren); R(12, 24, 1, 64, P.wall2); R(4, 44, 6, 6, '#F4EAD6'); R(16, 44, 6, 6, '#F4EAD6');
    // Étagère et bouteilles
    R(170, 98, 150, 3, P.beam);
    BOT.forEach(([a, b], i) => { const x = 176 + i * 15, h = 14 + b * 8; R(x, 98 - h, 7, h, P.bottle[i % 4]); R(x + 2, 98 - h - 4, 3, 4, P.bottle[i % 4]); R(x + 1, 98 - h + 4, 5, 4, P.tag); });
    // Comptoir
    R(0, 128, W, 6, P.counterTop); R(0, 134, W, H - 134, P.counter);
    for (let x = 10; x < W; x += 40) R(x, 140, 1, H - 140, P.beamD);
    // Tokkuri, choko et marmite fumante sur le comptoir
    [[44, 0], [70, 1], [230, 0]].forEach(([x, c]) => { R(x, 112, 8, 16, c ? '#E9DCC2' : '#3A4E6A'); R(x + 2, 108, 4, 4, c ? '#E9DCC2' : '#3A4E6A'); R(x + 12, 122, 5, 6, '#E9DCC2'); });
    R(118, 116, 30, 12, '#2A1C12'); R(114, 114, 38, 3, '#3A2A1D');
    // Chaises hautes
    [60, 140, 220, 290].forEach((x) => { R(x, 150, 18, 4, P.beam); R(x + 2, 154, 2, 40, P.beamD); R(x + 14, 154, 2, 40, P.beamD); });
  }
  const LAMPS = [[60, 1], [176, 0], [258, 1]];
  function anim(t, night, P) {
    const wx = 36, wy = 34, ww = 116, wh = 70;
    if (night) {
      STARS.forEach(([a, b], i) => { if ((i + Math.floor(t / 900)) % 7) R(wx + a * ww, wy + b * wh * .7, 1, 1, '#E8DCC0'); });
      VILL.forEach(([a, b], i) => { if ((i + Math.floor(t / 1300)) % 5) R(wx + 4 + a * (ww - 8), wy + wh - 10 - b * 8, 1, 1, '#F2B451'); });
      g.fillStyle = 'rgba(200,215,240,.45)'; DROPS.forEach(([a, b]) => { const y = (b * wh + t * .05) % wh; g.fillRect(wx + a * ww, wy + y, 1, 3); });
      g.globalCompositeOperation = 'lighter';
      LAMPS.forEach(([x, big], i) => { const h = big ? 22 : 18, w = big ? 14 : 12, y = 26, fl = .78 + .22 * Math.sin(t / 380 + i * 1.7);
        g.fillStyle = `rgba(246,170,80,${.12 * fl})`; g.beginPath(); g.arc(x + w / 2, y + h / 2, 26, 0, 7); g.fill();
        g.fillStyle = `rgba(255,220,150,${.35 * fl})`; g.fillRect(x + 3, y + 4, 2, h - 8); });
      g.globalCompositeOperation = 'source-over';
    }
    for (let k = 0; k < 3; k++) { const y = 106 - ((t / 70 + k * 9) % 26); g.fillStyle = `rgba(240,235,225,${(night ? .25 : .35) * (1 - (106 - y) / 26)})`; g.fillRect(124 + k * 7 + Math.sin(t / 400 + k) * 2, y, 2, 3); }
  }
  let timer = 0;
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tick() { timer = 0; if (document.hidden) return; draw(performance.now()); if (!calm()) timer = setTimeout(tick, 166); }
  const kick = () => { if (!timer) timer = setTimeout(tick, 0); };
  draw(0); kick();
  document.addEventListener('visibilitychange', kick);
  new MutationObserver(() => { draw(performance.now()); kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
