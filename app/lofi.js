/* KOTONOHA · salle lofi (#detente), écran principal de la détente.
   - Scène : un izakaya perdu dans la campagne, en pixel art (canvas 384 × 216 agrandi sans lissage), jour et nuit ;
     les lanternes battent la mesure quand la musique joue.
   - Atelier : séquenceur de 16 pas (mélodie pentatonique, accords, basse, grosse caisse, caisse claire, charleston),
     4 mesures d'accords, tempo, swing, pluie et crépitement de vinyle facultatifs, 3 emplacements de sauvegarde.
   Tout le son est synthétisé (Web Audio) ; rien ne démarre sans un geste. Aucun japonais, aucun score. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const W = 384, H = 216, STEPS = 16;

  /* ---------- Morceau ---------- */
  const MEL = [['Do', 72], ['La', 69], ['Sol', 67], ['Mi', 64], ['Ré', 62], ['Do', 60], ['La', 57], ['Sol', 55]];
  const CH = { 'Cmaj7': [48, [60, 64, 67, 71]], 'Am7': [45, [57, 60, 64, 67]], 'Fmaj7': [41, [57, 60, 64, 65]], 'G7': [43, [55, 59, 62, 65]],
    'Dm7': [38, [57, 60, 62, 65]], 'Em7': [40, [55, 59, 62, 64]], 'E7': [40, [56, 59, 62, 64]], 'B♭maj7': [46, [58, 62, 65, 69]] };
  const DRUMS = [['kick', 'Grosse caisse'], ['snare', 'Caisse claire'], ['hat', 'Charleston']];
  const ROWS = MEL.map(([n], i) => ['m' + i, 'Mélodie ' + n]).concat([['chord', 'Accords'], ['bass', 'Basse']], DRUMS);
  const PRESET = () => {
    const g = {}; ROWS.forEach(([id]) => { g[id] = Array(STEPS).fill(0); });
    [0, 8].forEach((i) => { g.kick[i] = 1; }); g.kick[11] = 1; [4, 12].forEach((i) => { g.snare[i] = 1; });
    for (let i = 0; i < STEPS; i += 2) g.hat[i] = 1; [0, 6, 10].forEach((i) => { g.chord[i] = 1; }); [0, 3, 8, 11].forEach((i) => { g.bass[i] = 1; });
    g.m3[2] = 1; g.m2[5] = 1; g.m1[7] = 1; g.m2[10] = 1; g.m3[13] = 1; g.m4[14] = 1;
    return { grid: g, prog: ['Fmaj7', 'Em7', 'Dm7', 'Cmaj7'], bpm: 78, swing: .18 };
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function load() { const x = K.local.get('lofi', null); const p = PRESET(); if (!x || !x.cur) return { cur: p, slots: [null, null, null] };
    ROWS.forEach(([id]) => { if (!Array.isArray(x.cur.grid[id]) || x.cur.grid[id].length !== STEPS) x.cur.grid[id] = Array(STEPS).fill(0); });
    if (!Array.isArray(x.cur.prog) || x.cur.prog.length !== 4 || !x.cur.prog.every((k) => CH[k])) x.cur.prog = p.prog;
    x.cur.bpm = Math.min(96, Math.max(60, +x.cur.bpm || 78)); x.cur.swing = Math.min(.4, Math.max(0, +x.cur.swing || 0)); if (!Array.isArray(x.slots)) x.slots = [null, null, null]; return x; }
  let ST = load();
  const persist = () => K.local.set('lofi', ST);

  /* ---------- Son ---------- */
  let AC = null, OUT = null, VIN = null, RAIN = null, play = false, step = 0, bar = 0, next = 0, sched = 0, beat = 0;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function ctx() {
    if (AC) { if (AC.state === 'suspended') AC.resume(); return AC; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    AC = new C();
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = .4;
    OUT = AC.createGain(); OUT.gain.value = K.local.get('lofi-vol', .7);
    OUT.connect(lp); lp.connect(comp); comp.connect(AC.destination);
    return AC;
  }
  let NOISE = null;
  function noise() { if (NOISE) return NOISE; const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return (NOISE = b); }
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function keys(m, t, dur, vel) { // piano électrique doux, un peu désaccordé (bande magnétique)
    [[1, 'sine', vel], [2, 'sine', vel * .18], [1.003, 'triangle', vel * .25]].forEach(([r, type, v]) => {
      const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = hz(m) * r; o.detune.value = (Math.random() - .5) * 10;
      env(g, t, .01, v, dur); o.connect(g); g.connect(OUT); o.start(t); o.stop(t + dur + .1);
    });
  }
  function bass(m, t, dur) { const o = AC.createOscillator(), g = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = 380; env(g, t, .01, .5, dur); o.connect(f); f.connect(g); g.connect(OUT); o.start(t); o.stop(t + dur + .1); }
  function kick(t) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .18); env(g, t, .004, .9, .32); o.connect(g); g.connect(OUT); o.start(t); o.stop(t + .4); }
  function hit(t, type, freq, dur, v) { const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = noise(); f.type = type; f.frequency.value = freq; f.Q.value = .8; env(g, t, .002, v, dur); s.connect(f); f.connect(g); g.connect(OUT); s.start(t, Math.random() * .5); s.stop(t + dur + .05); }
  function vinyl(on) {
    if (!on) { if (VIN) { VIN.stop(); VIN = null; } return; }
    if (!ctx() || VIN) return;
    const len = AC.sampleRate * 2, b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * .012 + (Math.random() < .0007 ? (Math.random() - .5) * .9 : 0);
    VIN = AC.createBufferSource(); VIN.buffer = b; VIN.loop = true; const g = AC.createGain(); g.gain.value = .5; VIN.connect(g); g.connect(OUT); VIN.start();
  }
  function rain(on) {
    if (!on) { if (RAIN) { RAIN.pause(); } return; }
    if (!RAIN) { RAIN = new Audio('sons/rain.mp3'); RAIN.loop = true; }
    RAIN.volume = .35; RAIN.play().catch(() => {});
  }
  function playStep(i, t) {
    const c = ST.cur, ch = CH[c.prog[bar % 4]], g = c.grid, sixteenth = 60 / c.bpm / 4;
    MEL.forEach(([, m], r) => { if (g['m' + r][i]) keys(m, t, sixteenth * 3.5, .16); });
    if (g.chord[i]) ch[1].forEach((m) => keys(m, t, sixteenth * 7, .07));
    if (g.bass[i]) bass(ch[0], t, sixteenth * 3);
    if (g.kick[i]) kick(t);
    if (g.snare[i]) { hit(t, 'bandpass', 1900, .16, .5); hit(t, 'highpass', 5000, .06, .15); }
    if (g.hat[i]) hit(t, 'highpass', 8000, .04, .14);
  }
  function scheduler() {
    const c = ST.cur, sixteenth = 60 / c.bpm / 4;
    while (next < AC.currentTime + .12) {
      const t = next + (step % 2 ? c.swing * sixteenth : 0);
      playStep(step, t);
      const s = step, b = bar; setTimeout(() => { mark(s, b); }, Math.max(0, (t - AC.currentTime) * 1000));
      next += sixteenth; step++; if (step >= STEPS) { step = 0; bar = (bar + 1) % 4; }
    }
  }
  function start() { if (!ctx()) return; play = true; step = 0; bar = 0; next = AC.currentTime + .06; scheduler(); sched = setInterval(scheduler, 25); }
  function stop() { play = false; clearInterval(sched); sched = 0; mark(-1, -1); }
  let markFn = () => {};
  function mark(s, b) { if (s >= 0 && s % 4 === 0) beat = performance.now(); markFn(s, b); }

  /* ---------- Scène : l'izakaya dans la campagne ---------- */
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const STARS = [...Array(70)].map(() => [rnd(), rnd() * .55]), FLIES = [...Array(18)].map(() => [rnd(), rnd(), rnd() * 6]), DROPS = [...Array(80)].map(() => [rnd(), rnd()]);
  const P = {
    jour: { sky: ['#9FC3D6', '#E8E2C8'], m1: '#8FA6A8', m2: '#6E8C6A', m3: '#4F6B3B', paddy: '#7FA35A', water: '#B9D2D0', wood: '#6B4528', woodD: '#4A2E19', roof: '#3E4550', roofL: '#5A6270', paper: '#EFE6CF', path: '#B79B72', tree: '#2F4A22', trunk: '#4A2E19' },
    nuit: { sky: ['#0E1430', '#2A2340'], m1: '#1E2440', m2: '#182030', m3: '#121A14', paddy: '#1C2A16', water: '#26304A', wood: '#2E1E12', woodD: '#1E140C', roof: '#14171E', roofL: '#232833', paper: '#F2B860', path: '#3A2E22', tree: '#0D150B', trunk: '#1A120A' },
  };
  function scene(g, t, opt) {
    const night = document.documentElement.dataset.theme === 'nuit', C = P[night ? 'nuit' : 'jour'], R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
    const pulse = play ? Math.max(0, 1 - (performance.now() - beat) / 420) : 0;
    const sky = g.createLinearGradient(0, 0, 0, 120); sky.addColorStop(0, C.sky[0]); sky.addColorStop(1, C.sky[1]); g.fillStyle = sky; g.fillRect(0, 0, W, 130);
    if (night) { STARS.forEach(([a, b], i) => { if ((i + Math.floor(t / 700)) % 9) R(a * W, b * 110, 1, 1, i % 5 ? '#E8DCC0' : '#9FB3E0'); }); R(318, 22, 12, 12, '#F2E6C4'); R(322, 22, 8, 8, C.sky[0]); }
    else { R(52, 28, 14, 14, '#F7EFC8'); for (let k = 0; k < 3; k++) { const x = ((t / 90 + k * 140) % (W + 80)) - 60, y = 18 + k * 14; R(x, y, 40, 6, 'rgba(255,255,255,.75)'); R(x + 8, y - 4, 22, 6, 'rgba(255,255,255,.75)'); }
      for (let k = 0; k < 2; k++) { const x = ((t / 40 + k * 70) % (W + 40)) - 20, y = 40 + k * 8 + Math.sin(t / 300 + k) * 2; R(x, y, 3, 1, '#2A2A2A'); R(x + 3, y - 1, 3, 1, '#2A2A2A'); } }
    // Montagnes en trois plans
    for (let x = 0; x < W; x++) {
      const h1 = 58 + Math.sin(x / 40) * 14 + Math.sin(x / 13) * 4, h2 = 40 + Math.sin(x / 27 + 2) * 10 + Math.sin(x / 9) * 3, h3 = 24 + Math.sin(x / 19 + 4) * 6;
      R(x, 130 - h1, 1, h1, C.m1); R(x, 130 - h2, 1, h2, C.m2); R(x, 132 - h3, 1, h3, C.m3);
    }
    // Rizières en terrasses et reflets
    for (let y = 130; y < H; y += 12) { R(0, y, W, 12, C.paddy); R(0, y + 2, W, 7, C.water); R(0, y, W, 2, C.m3);
      for (let x = (y * 7) % 9; x < W; x += 9) R(x, y + 3, 1, 4, C.paddy); }
    if (night) { R(300, 133, 30, 2, 'rgba(242,180,96,.35)'); R(304, 145, 22, 2, 'rgba(242,180,96,.22)'); }
    // Chemin de pierres
    for (let k = 0; k < 7; k++) R(150 + k * 14, 206 - k * 9, 12, 4, C.path);
    // Grands cèdres
    [[24, 70], [44, 54], [342, 64], [366, 80]].forEach(([x, h]) => { R(x - 1, 130 - 8, 3, 10, C.trunk); for (let k = 0; k < h; k += 4) { const w = (h - k) * .35 + 2; R(x - w / 2, 126 - k, w, 4, C.tree); } });
    // L'izakaya : murs, porte coulissante, toit de tuiles
    const hx = 190, hy = 92, hw = 116, hh = 44;
    R(hx, hy, hw, hh, C.wood); for (let x = hx; x < hx + hw; x += 6) R(x, hy, 1, hh, C.woodD);
    R(hx + 8, hy + 10, 30, 22, C.paper); for (let x = hx + 8; x <= hx + 38; x += 10) R(x, hy + 10, 1, 22, C.woodD); R(hx + 8, hy + 21, 30, 1, C.woodD);
    const dx = hx + 52; R(dx, hy + 8, 36, hh - 8, C.paper); R(dx + 17, hy + 8, 2, hh - 8, C.woodD); for (let y = hy + 16; y < hy + hh; y += 8) R(dx, y, 36, 1, C.woodD);
    if (night) { g.fillStyle = 'rgba(246,180,90,.18)'; g.fillRect(dx - 10, hy + hh, 56, 10); }
    R(hx - 12, hy - 4, hw + 24, 6, C.roof); for (let k = 0; k < 4; k++) R(hx - 8 + k * 3, hy - 10 - k * 4, hw + 16 - k * 6, 6, k % 2 ? C.roofL : C.roof); R(hx + 10, hy - 26, hw - 20, 3, C.roofL);
    for (let x = hx - 12; x < hx + hw + 12; x += 5) R(x, hy + 1, 2, 2, C.roofL);
    // Noren de l'entrée
    R(dx - 2, hy + 8, 40, 14, '#24345A'); R(dx + 8, hy + 8, 1, 14, '#1A2440'); R(dx + 18, hy + 8, 1, 14, '#1A2440'); R(dx + 28, hy + 8, 1, 14, '#1A2440'); R(dx + 14, hy + 12, 8, 6, '#F4EAD6');
    // Lanternes rouges à l'entrée et guirlande sous l'avant-toit
    const lamp = (x, y, w, h, i) => { const fl = night ? .75 + .25 * Math.sin(t / 360 + i * 1.9) + pulse * .6 : pulse * .5;
      if (fl > .05) { g.fillStyle = `rgba(246,160,80,${(night ? .16 : .1) * fl})`; g.beginPath(); g.arc(x + w / 2, y + h / 2, w * 2.2, 0, 7); g.fill(); }
      R(x + 1, y - 1, w - 2, 1, '#241A13'); R(x, y, w, h, night ? '#E8553C' : '#C8402E'); R(x + 1, y + h, w - 2, 1, '#241A13'); R(x, y + h / 3, w, 1, 'rgba(0,0,0,.25)'); R(x, y + 2 * h / 3, w, 1, 'rgba(0,0,0,.25)');
      if (night || pulse > .2) R(x + 2, y + 2, 1, h - 4, `rgba(255,225,160,${Math.min(1, .5 * fl + pulse * .4)})`); };
    lamp(dx - 12, hy + 8, 7, 11, 0); lamp(dx + 41, hy + 8, 7, 11, 1);
    for (let k = 0; k < 9; k++) { const x = hx - 6 + k * 15, y = hy + 3 + Math.sin(k * 1.3) * 1.5; R(x, hy + 2, 15, 1, '#241A13'); lamp(x + 5, y + 2, 4, 5, k + 2); }
    // Enseigne, banc, tonneaux de saké, cheminée qui fume
    R(hx + 96, hy + 12, 12, 20, '#E9DCC0'); for (let k = 0; k < 3; k++) R(hx + 100, hy + 15 + k * 5, 4, 3, '#241A13');
    R(hx + 8, hy + hh - 4, 30, 3, C.woodD); R(hx + 10, hy + hh - 1, 2, 4, C.woodD); R(hx + 34, hy + hh - 1, 2, 4, C.woodD);
    [[hx - 22, 0], [hx - 13, 0], [hx - 18, 1]].forEach(([x, up]) => { const y = hy + hh - 10 - up * 9; R(x, y, 9, 10, '#C9A06A'); R(x, y + 2, 9, 1, '#5A3B22'); R(x, y + 7, 9, 1, '#5A3B22'); R(x + 2, y + 4, 5, 2, '#A3302A'); });
    R(hx + hw - 18, hy - 34, 6, 14, C.woodD);
    for (let k = 0; k < 4; k++) { const a = ((t / 60 + k * 22) % 88), x = hx + hw - 15 + Math.sin(t / 500 + k) * 3 + a * .25, y = hy - 36 - a * .5; g.fillStyle = `rgba(230,230,225,${.35 * (1 - a / 88)})`; g.fillRect(x, y, 3 + a / 30, 2); }
    // Notes de musique qui s'échappent quand on joue
    if (play) for (let k = 0; k < 3; k++) { const a = ((performance.now() / 22 + k * 40) % 120), x = dx + 18 + Math.sin(a / 14 + k) * 10 + a * .3, y = hy - a * .6; g.fillStyle = `rgba(${night ? '246,200,120' : '60,40,25'},${.8 * (1 - a / 120)})`; g.fillRect(x, y, 2, 2); g.fillRect(x + 1, y - 4, 1, 4); }
    // Lucioles (nuit) ou papillons (jour)
    FLIES.forEach(([a, b, ph], i) => { const x = a * W + Math.sin(t / 900 + ph) * 8, y = 150 + b * 60 + Math.cos(t / 700 + ph) * 4;
      if (night) { if (Math.sin(t / 400 + ph * 3) > -.2) { R(x, y, 1, 1, '#E8F59A'); g.fillStyle = 'rgba(232,245,154,.18)'; g.fillRect(x - 1, y - 1, 3, 3); } } else if (i < 4) R(x, y - 30, 2, 1, '#F2D27A'); });
    // Pluie
    if (opt.rain) { g.fillStyle = night ? 'rgba(170,190,230,.5)' : 'rgba(90,110,130,.45)'; DROPS.forEach(([a, b]) => { const y = (b * H + t * .18) % H, x = (a * W + y * .25) % W; g.fillRect(x, y, 1, 4); }); }
  }

  /* ---------- Écran ---------- */
  let loopT = 0;
  function render(el) {
    stopLoop();
    const c = ST.cur, opt = K.local.get('lofi-opt', { rain: false, vinyl: false });
    el.innerHTML = `<div class="xlofi">
      <section class="xlofi-scene" aria-label="Salle lofi">
        <canvas width="${W}" height="${H}" aria-hidden="true"></canvas>
        <div class="xlofi-over"><h1><span lang="ja" aria-hidden="true">田舎の居酒屋</span>Salle lofi</h1>
          <p>Un vieil izakaya perdu dans la campagne. Composez votre propre boucle, mettez la pluie si vous voulez, et laissez filer le temps.</p></div>
        <div class="xlofi-transport" role="group" aria-label="Lecture">
          <button type="button" class="xlofi-play" id="xlplay" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="pl" d="M8 5v14l11-7z"/><path class="pa" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg><span>Lecture</span></button>
          <label class="xlofi-tog"><input type="checkbox" id="xlrain" ${opt.rain ? 'checked' : ''}><span>Pluie</span></label>
          <label class="xlofi-tog"><input type="checkbox" id="xlvin" ${opt.vinyl ? 'checked' : ''}><span>Vinyle</span></label>
          <label class="xlofi-vol">Volume <input type="range" id="xlvol" min="0" max="1" step="0.05" value="${K.local.get('lofi-vol', .7)}"></label>
        </div>
      </section>
      <section class="xlofi-studio" aria-labelledby="xlst">
        <div class="xlofi-head"><h2 id="xlst">Atelier de composition</h2>
          <div class="xlofi-knobs">
            <label>Tempo <input type="range" id="xlbpm" min="60" max="96" step="1" value="${c.bpm}"> <b class="num" id="xlbpmv">${c.bpm}</b> bpm</label>
            <label>Swing <input type="range" id="xlsw" min="0" max="0.4" step="0.02" value="${c.swing}"></label>
          </div></div>
        <div class="xlofi-prog" role="group" aria-label="Accords des quatre mesures">${c.prog.map((p, i) => `<label><span>Mesure ${i + 1}</span><select data-bar="${i}">${Object.keys(CH).map((k) => `<option${k === p ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label>`).join('')}</div>
        <div class="xlofi-grid" tabindex="0" role="group" aria-label="Séquenceur : 16 pas par ligne. Activez les pas avec la souris, le doigt ou le clavier.">
          ${ROWS.map(([id, lab]) => `<div class="xlrow r-${id.replace(/\d/, '')}"><span class="xllab">${esc(lab)}</span>${c.grid[id].map((on, i) => `<button type="button" class="xlcell${i % 4 === 0 ? ' b' : ''}" data-r="${id}" data-s="${i}" aria-pressed="${!!on}" aria-label="${esc(lab)}, pas ${i + 1}"></button>`).join('')}</div>`).join('')}
        </div>
        <div class="xlofi-tools">
          <button type="button" class="btn-ghost" id="xlclear">Tout effacer</button><button type="button" class="btn-ghost" id="xlex">Exemple</button>
          <span class="xlslots" role="group" aria-label="Emplacements de sauvegarde">${[0, 1, 2].map((i) => `<span class="xlslot"><b>Boucle ${i + 1}</b><button type="button" class="btn-ghost small" data-save="${i}">Enregistrer</button><button type="button" class="btn-ghost small" data-load="${i}" ${ST.slots[i] ? '' : 'disabled'}>Charger</button></span>`).join('')}</span>
        </div>
        <p class="small muted">Tout se joue dans votre navigateur et s’enregistre sur cet appareil. Aucun son ne démarre sans votre geste. <a href="#detente-jeux">Envie d’un petit jeu ?</a></p>
      </section></div>`;
    const cv = el.querySelector('canvas'), g = cv.getContext('2d');
    const draw = () => scene(g, performance.now(), K.local.get('lofi-opt', { rain: false }));
    const loop = () => { loopT = 0; if (!el.isConnected || !el.classList.contains('on')) return; if (!document.hidden) draw(); if (!K.reduced() || play) loopT = setTimeout(loop, 80); };
    draw(); loop();
    const playB = el.querySelector('#xlplay');
    const setPlay = (on) => { playB.setAttribute('aria-pressed', String(on)); playB.querySelector('span').textContent = on ? 'Pause' : 'Lecture'; el.querySelector('.xlofi').classList.toggle('is-playing', on); };
    playB.onclick = () => { if (play) stop(); else { start(); if (!loopT) loop(); } setPlay(play); if (play) { const o = K.local.get('lofi-opt', {}); vinyl(o.vinyl); if (o.rain) rain(true); } };
    setPlay(play);
    markFn = (s) => { el.querySelectorAll('.xlcell.now').forEach((b) => b.classList.remove('now')); if (s >= 0) el.querySelectorAll(`.xlcell[data-s="${s}"]`).forEach((b) => b.classList.add('now')); };
    el.querySelectorAll('.xlcell').forEach((b) => b.onclick = () => { const r = b.dataset.r, i = +b.dataset.s, v = ST.cur.grid[r][i] ? 0 : 1; ST.cur.grid[r][i] = v; b.setAttribute('aria-pressed', String(!!v)); persist();
      if (v && ctx()) playStepSingle(r, i, AC.currentTime + .01); });
    const optSet = (k, v) => { const o = K.local.get('lofi-opt', { rain: false, vinyl: false }); o[k] = v; K.local.set('lofi-opt', o); };
    el.querySelector('#xlrain').onchange = (e) => { optSet('rain', e.target.checked); rain(e.target.checked); draw(); };
    el.querySelector('#xlvin').onchange = (e) => { optSet('vinyl', e.target.checked); vinyl(e.target.checked && play); };
    el.querySelector('#xlvol').oninput = (e) => { K.local.set('lofi-vol', +e.target.value); if (OUT) OUT.gain.value = +e.target.value; if (RAIN) RAIN.volume = .5 * e.target.value; };
    el.querySelector('#xlbpm').oninput = (e) => { ST.cur.bpm = +e.target.value; el.querySelector('#xlbpmv').textContent = e.target.value; persist(); };
    el.querySelector('#xlsw').oninput = (e) => { ST.cur.swing = +e.target.value; persist(); };
    el.querySelectorAll('[data-bar]').forEach((s) => s.onchange = () => { ST.cur.prog[+s.dataset.bar] = s.value; persist(); });
    el.querySelector('#xlclear').onclick = () => { ROWS.forEach(([id]) => { ST.cur.grid[id] = Array(STEPS).fill(0); }); persist(); render(el); };
    el.querySelector('#xlex').onclick = () => { ST.cur = PRESET(); persist(); render(el); };
    el.querySelectorAll('[data-save]').forEach((b) => b.onclick = () => { ST.slots[+b.dataset.save] = clone(ST.cur); persist(); render(el); K.toast && K.toast('Boucle ' + (+b.dataset.save + 1) + ' enregistrée.'); });
    el.querySelectorAll('[data-load]').forEach((b) => b.onclick = () => { const x = ST.slots[+b.dataset.load]; if (x) { ST.cur = clone(x); persist(); render(el); } });
  }
  function playStepSingle(r, i, t) { // aperçu d'une seule ligne quand on active un pas
    const c = ST.cur, ch = CH[c.prog[0]], sixteenth = 60 / c.bpm / 4;
    if (r[0] === 'm') keys(MEL[+r.slice(1)][1], t, sixteenth * 3.5, .16); else if (r === 'chord') ch[1].forEach((m) => keys(m, t, sixteenth * 6, .07)); else if (r === 'bass') bass(ch[0], t, sixteenth * 3);
    else if (r === 'kick') kick(t); else if (r === 'snare') hit(t, 'bandpass', 1900, .16, .5); else if (r === 'hat') hit(t, 'highpass', 8000, .04, .14);
  }
  function stopLoop() { if (loopT) { clearTimeout(loopT); loopT = 0; } }
  // En quittant la salle : la musique, la pluie et le vinyle s'arrêtent.
  addEventListener('hashchange', () => { if (location.hash.slice(1) !== 'detente') { if (play) stop(); vinyl(false); rain(false); stopLoop(); } });
  K.lofi = { render, state: () => ST, playing: () => play };
})();
