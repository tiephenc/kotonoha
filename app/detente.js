/* KOTONOHA · salle de détente.
   Principes (voir KOTONOHA_PAUSES_ET_MINIJEUX.md) : aucune activité de japonais, aucun score, aucune série,
   aucune pénalité ; durée choisie librement (chronomètre indicatif) ; sortie à tout moment ; aucun son automatique. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const DUR = [
    { id: 'micro', label: '30 s à 1 min', sec: 60 },
    { id: 'court', label: '2 à 3 min', sec: 180 },
    { id: 'moyen', label: '4 à 6 min', sec: 300 },
    { id: 'long', label: '7 à 9 min', sec: 540 },
  ];
  const GAMES = [
    { id: 'etang', kj: '鯉', name: 'Étang aux koi', kind: 'Contemplation · aquarium', text: 'Nourrissez les carpes, faites des ronds dans l’eau, regardez-les venir.' },
    { id: 'sable', kj: '砂', name: 'Jardin de sable', kind: 'Contemplation · création', text: 'Tracez des sillons au râteau, posez des pierres, lissez, recommencez.' },
    { id: 'musique', kj: '音', name: 'Atelier musical', kind: 'Création musicale · rythme', text: 'Composez une boucle de cloches et de taiko : toutes les notes s’accordent.' },
    { id: 'pinceau', kj: '墨', name: 'Pinceau', kind: 'Dessin', text: 'Encre, lavis et sceau : peignez librement, gardez votre image si vous voulez.' },
    { id: 'ricochets', kj: '石', name: 'Ricochets', kind: 'Adresse douce', text: 'Lancez des galets sur le lac et comptez les rebonds, pour le plaisir.' },
    { id: 'rizieres', kj: '田', name: 'Rizières', kind: 'Logique légère', text: 'Tournez les canaux pour amener l’eau à chaque parcelle, sans chrono ni compteur.' },
    { id: 'lucioles', kj: '蛍', name: 'Lucioles', kind: 'Exploration · adresse douce', text: 'Promenez une lanterne dans un champ la nuit ; les lucioles la suivent.' },
    { id: 'souffle', kj: '息', name: 'Souffle', kind: 'Détente', text: 'Un cercle qui grandit et diminue, au rythme que vous choisissez.' },
  ];
  const pref = { get(k, d) { try { const v = localStorage.getItem('kotonoha.detente.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kotonoha.detente.' + k, JSON.stringify(v)); } catch (e) {} } };

  /* ---------- Son (jamais automatique : créé au premier geste, coupé par défaut sauf pour le carillon) ---------- */
  let AC = null, MASTER = null;
  function audio() {
    if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); MASTER = AC.createGain(); MASTER.gain.value = pref.get('vol', 0.6); MASTER.connect(AC.destination); }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function bell(freq, gain = 0.5, when = 0) {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime + when;
    [[1, 1, 4.5], [2.76, 0.35, 2.2], [5.4, 0.12, 1.1], [0.5, 0.15, 3]].forEach(([r, g, d]) => {
      const o = ac.createOscillator(), v = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq * r;
      v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(gain * g, t + 0.008); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(MASTER); o.start(t); o.stop(t + d + 0.05);
    });
  }
  function softTone(freq, dur, gain = 0.12) {
    const ac = audio(); if (!ac) return;
    const t = ac.currentTime, o = ac.createOscillator(), v = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(gain, t + dur * 0.4); v.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(v); v.connect(MASTER); o.start(t); o.stop(t + dur + 0.05);
  }
  function stopAudio() { if (AC && AC.state === 'running') AC.suspend(); }

  /* ---------- Salon ---------- */
  function renderHub(el) {
    const cur = pref.get('dur', 'court');
    el.innerHTML = `<div class="xdet">
      <div class="xdet-head">
        <div><h1>Faire une vraie pause</h1>
        <p>Ici, pas de japonais, rien à réussir et rien à perdre. Choisissez une durée, puis une expérience ; vous pouvez partir à tout moment.</p></div>
        <div class="xdet-fox" aria-hidden="true">${K.fox ? K.fox('sommeil') : ''}</div>
      </div>
      <fieldset class="xdur"><legend>Durée indicative</legend>
        ${DUR.map((d) => `<label><input type="radio" name="xdur" value="${d.id}" ${d.id === cur ? 'checked' : ''}><span>${d.label}</span></label>`).join('')}
      </fieldset>
      <div class="xgames">${GAMES.map((g) => `<a class="xgame" href="#detente-${g.id}" data-g="${g.id}"><span class="xgk" aria-hidden="true">${g.kj}</span><span class="nm">${g.name}</span><span class="kd">${g.kind}</span><span class="tx">${g.text}</span></a>`).join('')}</div>
      <details class="xwhy"><summary>Pourquoi ces pauses, et ce qu’elles ne promettent pas</summary>
        <p>Une méta-analyse de 22 études (Albulescu et al., 2022) associe les micro-pauses de moins de 10 minutes à un peu plus de vitalité et un peu moins de fatigue ressenties ; l’effet sur la performance n’y est pas significatif, sauf pour certaines tâches et avec des pauses plus longues. Ces expériences sont conçues pour être agréables et sans pression, pas pour améliorer la mémoire ou l’attention : aucun effet n’est promis.</p>
        <p class="small muted">Détails et références : document KOTONOHA_PAUSES_ET_MINIJEUX.md du dépôt.</p></details>
    </div>`;
    el.querySelectorAll('input[name=xdur]').forEach((r) => r.onchange = () => pref.set('dur', r.value));
    try { sessionStorage.setItem('kotonoha.detente.from', K.lastLearning || 'aujourdhui'); } catch (e) {}
  }

  /* ---------- Cadre commun d'une expérience ---------- */
  let RUN = null;
  function stopRun() { if (RUN) { RUN.alive = false; clearInterval(RUN.timer); RUN.cleanup && RUN.cleanup(); RUN = null; } stopAudio(); }
  function backTo() { let f = 'aujourdhui'; try { f = sessionStorage.getItem('kotonoha.detente.from') || f; } catch (e) {} return '#' + f; }

  function renderGame(el, h) {
    stopRun();
    const g = GAMES.find((x) => 'detente-' + x.id === h);
    const d = DUR.find((x) => x.id === pref.get('dur', 'court')) || DUR[1];
    const soundDefault = g.id === 'carillon' || g.id === 'musique';
    const run = RUN = { alive: true, total: d.sec, left: d.sec, sound: pref.get('snd-' + g.id, soundDefault), cleanup: null, timer: null };
    el.innerHTML = `<div class="xplay xplay-${g.id}">
      <div class="xbar">
        <a class="xquit" href="#detente">← Quitter</a>
        <h1>${g.name}</h1>
        <div class="xbar-r">
          <button type="button" class="xsnd" aria-pressed="${run.sound}">${run.sound ? 'Son activé' : 'Son coupé'}</button>
          <span class="xclock" title="Durée indicative" aria-label="Temps indicatif restant"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15"/><circle cx="18" cy="18" r="15" class="p"/></svg><span class="t"></span></span>
        </div>
      </div>
      <div class="xstage" id="xstage"></div>
      <div class="xend" hidden role="dialog" aria-modal="false" aria-labelledby="xendt">
        <h2 id="xendt">La pause choisie est écoulée.</h2>
        <p class="muted">Rien ne presse : restez autant que vous voulez.</p>
        <div class="toolbar"><a class="btn" id="xback" href="#aujourdhui">Retour à la séance</a><button class="btn sec" type="button" id="xmore">Prolonger la pause</button><a class="btn-ghost" href="#detente">Quitter</a></div>
        <div class="xfeel"><span class="small muted">Comment vous sentez-vous ? Facultatif, pour vous seulement ; ce n’est pas une mesure.</span>
          <div class="toolbar"><button type="button" class="btn-ghost small" data-feel="mieux">Plus détendu·e</button><button type="button" class="btn-ghost small" data-feel="pareil">Pareil</button><button type="button" class="btn-ghost small" data-feel="moins">Moins détendu·e</button></div></div>
      </div></div>`;
    const stage = el.querySelector('#xstage');
    const sndBtn = el.querySelector('.xsnd');
    sndBtn.onclick = () => { run.sound = !run.sound; pref.set('snd-' + g.id, run.sound); sndBtn.setAttribute('aria-pressed', run.sound); sndBtn.textContent = run.sound ? 'Son activé' : 'Son coupé'; if (run.sound) audio(); else stopAudio(); };
    const clock = el.querySelector('.xclock'), ring = clock.querySelector('.p'), tt = clock.querySelector('.t');
    const paint = () => { const p = 1 - run.left / run.total; ring.style.strokeDasharray = `${(94.25 * p).toFixed(1)} 94.25`; tt.textContent = `${Math.floor(run.left / 60)}:${String(run.left % 60).padStart(2, '0')}`; };
    paint();
    run.timer = setInterval(() => {
      if (!run.alive || document.visibilityState !== 'visible') return;
      if (run.left > 0) { run.left--; paint(); if (run.left === 0) showEnd(); }
    }, 1000);
    const end = el.querySelector('.xend');
    function showEnd() { end.hidden = false; el.querySelector('#xback').setAttribute('href', backTo()); }
    el.querySelector('#xmore').onclick = () => { run.left = d.sec; run.total = d.sec; end.hidden = true; paint(); stage.focus(); };
    el.querySelectorAll('[data-feel]').forEach((b) => b.onclick = () => {
      const L = K.local.get('ressenti', []); L.push({ id: K.uid(), at: Date.now(), jeu: g.id, v: b.dataset.feel }); K.local.set('ressenti', L.slice(-300));
      el.querySelector('.xfeel').innerHTML = '<span class="small muted">Noté, merci.</span>';
    });
    el.querySelector('#xback').onclick = (e) => { e.preventDefault(); location.hash = backTo(); };
    stage.tabIndex = 0;
    const api = { run, stage, sound: () => run.sound, reduced: K.reduced(), theme: document.documentElement.dataset.theme };
    (({ sable: gameSable, carillon: gameCarillon, rizieres: gameRizieres, lucioles: gameLucioles, souffle: gameSouffle })[g.id] || K.detenteGames[g.id])(api);
    setTimeout(() => stage.focus({ preventScroll: true }), 30);
  }

  /* Canevas net sur écran haute densité, redimensionné avec la scène. */
  function canvas(stage, draw) {
    const c = document.createElement('canvas'); stage.appendChild(c);
    const ctx = c.getContext('2d'); let W = 0, H = 0, dpr = 1;
    // Le premier dessin passe par le ResizeObserver (asynchrone) : l'appelant a fini de s'initialiser.
    const fit = () => { const r = stage.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = Math.max(200, r.width); H = Math.max(200, r.height); c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw && draw(true); };
    const ro = new ResizeObserver(fit); ro.observe(stage);
    return { c, ctx, size: () => ({ W, H }), stop: () => ro.disconnect() };
  }

  /* ---------- 1. Jardin de sable ---------- */
  function gameSable(api) {
    const { stage, run } = api;
    stage.insertAdjacentHTML('beforeend', `<div class="xtools" role="toolbar" aria-label="Outils du jardin">
      <button type="button" data-t="rake" aria-pressed="true">Râteau</button><button type="button" data-t="stone" aria-pressed="false">Pierre</button><button type="button" data-t="smooth">Lisser</button></div>
      <p class="xhint">Glissez pour ratisser. Clavier : flèches pour tracer, Entrée pour poser une pierre.</p>`);
    const night = api.theme === 'nuit';
    const SAND = night ? '#3b342c' : '#e8dcc6', DARK = night ? 'rgba(0,0,0,.35)' : 'rgba(120,95,60,.28)', LIGHT = night ? 'rgba(255,240,220,.08)' : 'rgba(255,255,255,.55)';
    let tool = 'rake', strokes = [], stones = [], cur = null, cursor = null;
    const cv = canvas(stage, () => redraw());
    const { ctx } = cv;
    // texture de grain fixe
    const grain = document.createElement('canvas'); grain.width = grain.height = 128;
    const gx = grain.getContext('2d'); const img = gx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 40; img.data[i] = img.data[i + 1] = img.data[i + 2] = night ? 255 : 0; img.data[i + 3] = v; }
    gx.putImageData(img, 0, 0);
    function grooves(pts, ctx) {
      if (pts.length < 2) return;
      for (const off of [-12, -6, 0, 6, 12]) {
        for (const [col, dy, w] of [[DARK, 0, 2.2], [LIGHT, 1.6, 1.2]]) {
          ctx.beginPath();
          for (let i = 0; i < pts.length; i++) {
            const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
            const dx = b.x - a.x, dyy = b.y - a.y, L = Math.hypot(dx, dyy) || 1, nx = -dyy / L, ny = dx / L;
            const x = pts[i].x + nx * off, y = pts[i].y + ny * off + dy;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        }
      }
    }
    function rings(s) {
      for (let r = s.r + 14; r < s.r + 70; r += 9) {
        ctx.beginPath(); ctx.ellipse(s.x, s.y, r * 1.15, r * 0.9, s.a, 0, Math.PI * 2); ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(s.x, s.y + 1.5, r * 1.15, r * 0.9, s.a, 0, Math.PI * 2); ctx.strokeStyle = LIGHT; ctx.lineWidth = 1.2; ctx.stroke();
      }
    }
    function stone(s) {
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a);
      ctx.beginPath(); ctx.ellipse(4, 6, s.r * 1.15, s.r * 0.8, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fill();
      const gr = ctx.createRadialGradient(-s.r * 0.4, -s.r * 0.4, 2, 0, 0, s.r * 1.3);
      gr.addColorStop(0, night ? '#8a8279' : '#9b928a'); gr.addColorStop(1, night ? '#3d3833' : '#4f4943');
      ctx.beginPath(); for (let i = 0; i <= 12; i++) { const t = i / 12 * Math.PI * 2, rr = s.r * (1 + s.j[i % 12]); const x = Math.cos(t) * rr * 1.15, y = Math.sin(t) * rr * 0.8; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath(); ctx.fillStyle = gr; ctx.fill(); ctx.restore();
    }
    function redraw() {
      const { W, H } = cv.size();
      ctx.fillStyle = SAND; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
      strokes.forEach((s) => grooves(s, ctx)); if (cur) grooves(cur, ctx);
      stones.forEach(rings); stones.forEach(stone);
      if (cursor) { ctx.beginPath(); ctx.arc(cursor.x, cursor.y, 16, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(210,35,63,.7)'; ctx.lineWidth = 2; ctx.stroke(); }
    }
    const pos = (e) => { const r = cv.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function addStone(p) {
      if (stones.length >= 7) stones.shift();
      stones.push({ x: p.x, y: p.y, r: 16 + Math.random() * 14, a: Math.random() * Math.PI, j: Array.from({ length: 12 }, () => (Math.random() - 0.5) * 0.18) });
      if (api.sound()) softTone(110 + Math.random() * 30, 0.6, 0.08);
      redraw();
    }
    let lastSnd = 0;
    function sandSound() { if (!api.sound()) return; const now = performance.now(); if (now - lastSnd < 120) return; lastSnd = now; const ac = audio(); if (!ac) return; const b = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); const s = ac.createBufferSource(), f = ac.createBiquadFilter(), v = ac.createGain(); f.type = 'bandpass'; f.frequency.value = 900; v.gain.value = 0.05; s.buffer = b; s.connect(f); f.connect(v); v.connect(MASTER); s.start(); }
    cv.c.addEventListener('pointerdown', (e) => {
      const p = pos(e);
      if (tool === 'stone') { addStone(p); return; }
      cv.c.setPointerCapture(e.pointerId); cur = [p]; cursor = null;
    });
    cv.c.addEventListener('pointermove', (e) => { if (!cur) return; const p = pos(e), l = cur[cur.length - 1]; if (Math.hypot(p.x - l.x, p.y - l.y) > 4) { cur.push(p); sandSound(); redraw(); } });
    const up = () => { if (cur) { if (cur.length > 1) strokes.push(cur); if (strokes.length > 80) strokes.shift(); cur = null; redraw(); } };
    cv.c.addEventListener('pointerup', up); cv.c.addEventListener('pointercancel', up);
    stage.querySelectorAll('.xtools button').forEach((b) => b.onclick = () => {
      if (b.dataset.t === 'smooth') { strokes = []; stones = []; redraw(); return; }
      tool = b.dataset.t; stage.querySelectorAll('.xtools [data-t]').forEach((x) => x.dataset.t !== 'smooth' && x.setAttribute('aria-pressed', x === b));
    });
    stage.addEventListener('keydown', (e) => {
      const { W, H } = cv.size(); if (!cursor) cursor = { x: W / 2, y: H / 2 };
      const step = 14, mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (mv) { e.preventDefault(); if (!cur) cur = [{ ...cursor }]; cursor = { x: Math.min(W, Math.max(0, cursor.x + mv[0])), y: Math.min(H, Math.max(0, cursor.y + mv[1])) }; cur.push({ ...cursor }); sandSound(); redraw(); }
      else if (e.key === 'Enter') { e.preventDefault(); up(); addStone(cursor); }
      else if (e.key === ' ') { e.preventDefault(); up(); }
    });
    stage.addEventListener('keyup', (e) => { if (!e.key.startsWith('Arrow')) return; clearTimeout(run.kt); run.kt = setTimeout(up, 600); });
    run.cleanup = () => cv.stop();
  }

  /* ---------- 2. Carillon ---------- */
  function gameCarillon(api) {
    const { stage, run } = api;
    const NOTES = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25]; // ré majeur pentatonique
    const KEYS = ['1', '2', '3', '4', '5', '6', '7'];
    stage.insertAdjacentHTML('beforeend', `<div class="xchimes" role="group" aria-label="Tiges du carillon">${NOTES.map((f, i) => `<button type="button" class="xrod" data-i="${i}" style="--h:${150 + (6 - i) * 22}px" aria-label="Tige ${i + 1}"><span></span></button>`).join('')}</div>
      <div class="xtools"><label class="chk"><input type="checkbox" id="xbreeze"> Brise (le carillon tinte seul, doucement)</label></div>
      <p class="xhint">Touchez les tiges, ou les touches 1 à 7. Toutes les notes s’accordent entre elles.</p>`);
    const ripples = document.createElement('div'); ripples.className = 'xripples'; stage.prepend(ripples);
    function ring(i, soft) {
      const rod = stage.querySelector(`.xrod[data-i="${i}"]`); if (!rod) return;
      rod.classList.remove('swing'); void rod.offsetWidth; rod.classList.add('swing');
      if (!api.reduced) { const r = document.createElement('i'); const b = rod.getBoundingClientRect(), sb = stage.getBoundingClientRect(); r.style.left = (b.left - sb.left + b.width / 2) + 'px'; r.style.top = (b.bottom - sb.top - 10) + 'px'; ripples.appendChild(r); setTimeout(() => r.remove(), 2600); }
      if (api.sound()) bell(NOTES[i], soft ? 0.25 : 0.45);
    }
    stage.querySelectorAll('.xrod').forEach((b) => b.onpointerdown = (e) => { e.preventDefault(); ring(+b.dataset.i); });
    stage.querySelectorAll('.xrod').forEach((b) => b.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ring(+b.dataset.i); } });
    stage.addEventListener('keydown', (e) => { const i = KEYS.indexOf(e.key); if (i >= 0) ring(i); });
    let breeze = null;
    stage.querySelector('#xbreeze').onchange = (e) => {
      clearTimeout(breeze);
      if (!e.target.checked) return;
      const go = () => { if (!run.alive) return; ring(Math.floor(Math.random() * 7), true); breeze = setTimeout(go, 1800 + Math.random() * 4200); };
      go();
    };
    run.cleanup = () => clearTimeout(breeze);
  }

  /* ---------- 3. Rizières (canaux à orienter) ---------- */
  function gameRizieres(api) {
    const { stage, run } = api;
    const N = 1, E = 2, S2 = 4, W = 8, DIRS = [[N, 0, -1, S2], [E, 1, 0, W], [S2, 0, 1, N], [W, -1, 0, E]];
    const rot = (m) => ((m << 1) | (m >> 3)) & 15;
    let size = pref.get('riz', 5), grid, solved;
    stage.insertAdjacentHTML('beforeend', `<div class="xtools" role="toolbar" aria-label="Rizières"><span class="small">Taille :</span>${[4, 5, 6].map((n) => `<button type="button" data-n="${n}" aria-pressed="${n === size}">${n} × ${n}</button>`).join('')}<button type="button" id="xhintb">Un coup de pouce</button><button type="button" id="xnew">Nouvelle rizière</button></div>
      <div class="xriz" role="group" aria-label="Parcelles (touchez une parcelle pour tourner son canal)"></div><p class="xstatus small" role="status" aria-live="polite"></p>
      <p class="xhint">La source est en haut à gauche. Touchez une parcelle pour tourner son canal. Clavier : flèches puis Entrée.</p>`);
    const box = stage.querySelector('.xriz'), status = stage.querySelector('.xstatus');
    function make() {
      // arbre couvrant aléatoire (parcours en profondeur) : toujours soluble
      const want = Array.from({ length: size * size }, () => 0), seen = new Set([0]), stack = [0];
      while (stack.length) {
        const c = stack[stack.length - 1], x = c % size, y = (c / size) | 0;
        const nb = DIRS.filter(([, dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < size && ny < size && !seen.has(ny * size + nx); });
        if (!nb.length) { stack.pop(); continue; }
        const [b, dx, dy, ob] = nb[Math.floor(Math.random() * nb.length)], n = (y + dy) * size + (x + dx);
        want[c] |= b; want[n] |= ob; seen.add(n); stack.push(n);
      }
      grid = want.map((m) => { let r = Math.floor(Math.random() * 4), v = m; while (r--) v = rot(v); return { m: v, want: m, turns: 0 }; });
      if (grid.every((c) => c.m === c.want)) grid[1].m = rot(grid[1].m);
      solved = false; draw();
    }
    function wet() {
      const w = new Set([0]), q = [0];
      while (q.length) { const c = q.shift(), x = c % size, y = (c / size) | 0;
        for (const [b, dx, dy, ob] of DIRS) { const nx = x + dx, ny = y + dy; if (!(grid[c].m & b) || nx < 0 || ny < 0 || nx >= size || ny >= size) continue; const n = ny * size + nx; if (grid[n].m & ob && !w.has(n)) { w.add(n); q.push(n); } } }
      return w;
    }
    const PATH = { [N]: 'M50 50V0', [E]: 'M50 50H100', [S2]: 'M50 50V100', [W]: 'M50 50H0' };
    function cellSvg(c, isWet) {
      const segs = [N, E, S2, W].filter((b) => c.m & b).map((b) => PATH[b]).join(' ');
      return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${segs}" class="bank"/><path d="${segs}" class="water${isWet ? ' on' : ''}"/>${isWet ? '<g class="sprout"><path d="M22 80c0-8 3-12 6-14M28 80c0-6-2-10-5-12M74 26c0-8 3-12 6-14M80 26c0-6-2-10-5-12"/></g>' : ''}<circle cx="50" cy="50" r="7" class="${isWet ? 'hub on' : 'hub'}"/></svg>`;
    }
    let focusI = 0;
    function draw() {
      const w = wet();
      box.style.setProperty('--n', size);
      box.innerHTML = grid.map((c, i) => `<button type="button" class="xcell${w.has(i) ? ' wet' : ''}${i === 0 ? ' src' : ''}" data-i="${i}" tabindex="${i === focusI ? 0 : -1}" aria-label="Parcelle ${(i % size) + 1}, ${((i / size) | 0) + 1}${w.has(i) ? ', irriguée' : ''}">${cellSvg(c, w.has(i))}</button>`).join('');
      const done = w.size === grid.length;
      status.textContent = done ? 'Toutes les parcelles sont irriguées.' : `${w.size} parcelle${w.size > 1 ? 's' : ''} irriguée${w.size > 1 ? 's' : ''} sur ${grid.length}.`;
      if (done && !solved) { solved = true; box.classList.add('done'); if (api.sound()) [0, 0.18, 0.36].forEach((t, k) => setTimeout(() => softTone([392, 494, 587][k], 1.2, 0.08), t * 1000)); }
      else if (!done) box.classList.remove('done');
    }
    function turn(i) { if (!grid[i]) return; grid[i].m = rot(grid[i].m); focusI = i; if (api.sound()) softTone(220 + (i % 5) * 20, 0.25, 0.05); draw(); box.querySelector(`[data-i="${i}"]`).focus(); }
    box.addEventListener('click', (e) => { const b = e.target.closest('.xcell'); if (b) turn(+b.dataset.i); });
    box.addEventListener('keydown', (e) => {
      const b = e.target.closest('.xcell'); if (!b) return; let i = +b.dataset.i;
      const mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -size, ArrowDown: size }[e.key];
      if (mv !== undefined) { e.preventDefault(); const j = i + mv; if (j >= 0 && j < grid.length && !(mv === 1 && j % size === 0) && !(mv === -1 && i % size === 0)) { focusI = j; box.querySelectorAll('.xcell').forEach((x) => x.tabIndex = -1); const t = box.querySelector(`[data-i="${j}"]`); t.tabIndex = 0; t.focus(); } }
    });
    stage.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => { size = +b.dataset.n; pref.set('riz', size); stage.querySelectorAll('[data-n]').forEach((x) => x.setAttribute('aria-pressed', x === b)); focusI = 0; make(); });
    stage.querySelector('#xnew').onclick = () => { box.classList.remove('done'); make(); };
    stage.querySelector('#xhintb').onclick = () => { const i = grid.findIndex((c) => c.m !== c.want); if (i >= 0) { grid[i].m = grid[i].want; focusI = i; draw(); } };
    make();
    run.cleanup = () => {};
  }

  /* ---------- 4. Lucioles ---------- */
  function gameLucioles(api) {
    const { stage, run } = api;
    stage.insertAdjacentHTML('beforeend', '<p class="xhint">Déplacez la lanterne (souris, doigt ou flèches). Restez immobile : elles approchent.</p>');
    let flies = [], lamp = null, raf = 0, keys = {};
    const cv = canvas(stage, () => { const { W, H } = cv.size(); if (!lamp) lamp = { x: W / 2, y: H * 0.6 }; if (!flies.length) for (let i = 0; i < 60; i++) flies.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 0.8 }); });
    const { ctx } = cv;
    let still = 0, last = performance.now();
    function frame(t) {
      if (!run.alive) return;
      if (!lamp) { raf = requestAnimationFrame(frame); return; }
      const dt = Math.min(50, t - last); last = t;
      const { W, H } = cv.size();
      const kx = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0), ky = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0);
      if (kx || ky) { lamp.x = Math.min(W, Math.max(0, lamp.x + kx * 0.25 * dt)); lamp.y = Math.min(H, Math.max(0, lamp.y + ky * 0.25 * dt)); still = 0; }
      still += dt;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1424'); g.addColorStop(1, '#1b2a2a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // herbes
      ctx.strokeStyle = 'rgba(80,120,90,.35)'; ctx.lineWidth = 1.2;
      for (let x = 0; x < W; x += 9) { const h = 18 + ((x * 37) % 23); const sway = api.reduced ? 0 : Math.sin(t / 1400 + x * 0.05) * 3; ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + sway, H - h / 2, x + sway * 1.6, H - h); ctx.stroke(); }
      // lanterne
      const lg = ctx.createRadialGradient(lamp.x, lamp.y, 2, lamp.x, lamp.y, 120); lg.addColorStop(0, 'rgba(255,190,120,.35)'); lg.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = lg; ctx.fillRect(lamp.x - 120, lamp.y - 120, 240, 240);
      ctx.fillStyle = '#f2b866'; ctx.beginPath(); ctx.ellipse(lamp.x, lamp.y, 10, 13, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = '#241A13'; ctx.fillRect(lamp.x - 6, lamp.y - 16, 12, 3); ctx.fillRect(lamp.x - 6, lamp.y + 13, 12, 3);
      const pull = Math.min(1, still / 2500);
      for (const f of flies) {
        const dx = lamp.x - f.x, dy = lamp.y - f.y, d = Math.hypot(dx, dy) || 1;
        const want = 40 + 30 * Math.sin(f.ph);
        const a = d < 260 ? (d - want) / d * 0.0009 * (0.3 + pull) : 0;
        f.vx += dx * a + (Math.random() - 0.5) * 0.02; f.vy += dy * a + (Math.random() - 0.5) * 0.02;
        f.vx *= 0.97; f.vy *= 0.97;
        f.x += f.vx * dt * f.sp; f.y += f.vy * dt * f.sp;
        if (f.x < 0 || f.x > W) f.vx *= -1; if (f.y < 0 || f.y > H) f.vy *= -1;
        f.ph += dt * 0.002;
        const glow = api.reduced ? 0.7 : 0.45 + 0.55 * Math.max(0, Math.sin(f.ph * 2.3));
        ctx.fillStyle = `rgba(214,255,140,${glow * 0.25})`; ctx.beginPath(); ctx.arc(f.x, f.y, 6, 0, 6.28); ctx.fill();
        ctx.fillStyle = `rgba(234,255,180,${glow})`; ctx.beginPath(); ctx.arc(f.x, f.y, 1.8, 0, 6.28); ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    const move = (e) => { const r = cv.c.getBoundingClientRect(); lamp = { x: e.clientX - r.left, y: e.clientY - r.top }; still = 0; };
    cv.c.addEventListener('pointermove', move); cv.c.addEventListener('pointerdown', move);
    stage.addEventListener('keydown', (e) => { if (e.key.startsWith('Arrow')) { e.preventDefault(); keys[e.key] = true; } });
    stage.addEventListener('keyup', (e) => { keys[e.key] = false; });
    raf = requestAnimationFrame(frame);
    run.cleanup = () => { cancelAnimationFrame(raf); cv.stop(); };
  }

  /* ---------- 5. Souffle ---------- */
  function gameSouffle(api) {
    const { stage, run } = api;
    const PACES = [[4, 0, 4, 0, '4 · 4'], [4, 0, 6, 0, '4 · 6'], [5, 0, 5, 0, '5 · 5'], [4, 4, 4, 4, 'carré 4']];
    let pace = pref.get('pace', 1);
    stage.insertAdjacentHTML('beforeend', `<div class="xtools" role="toolbar" aria-label="Rythme"><span class="small">Rythme (secondes) :</span>${PACES.map((p, i) => `<button type="button" data-p="${i}" aria-pressed="${i === pace}">${p[4]}</button>`).join('')}</div>
      <div class="xbreath"><div class="xcircle"></div><p class="xphase" aria-live="polite"></p></div>
      <p class="xhint">Suivez le cercle si cela vous convient ; sinon, respirez normalement. Ce n’est pas un exercice médical.</p>`);
    const circle = stage.querySelector('.xcircle'), phase = stage.querySelector('.xphase');
    let t0 = performance.now(), raf = 0, lastPh = '';
    function frame(t) {
      if (!run.alive) return;
      const [a, b, c, d] = PACES[pace], cyc = (a + b + c + d) * 1000, x = (t - t0) % cyc;
      let ph, s;
      if (x < a * 1000) { ph = 'Inspirez'; s = x / (a * 1000); }
      else if (x < (a + b) * 1000) { ph = 'Gardez'; s = 1; }
      else if (x < (a + b + c) * 1000) { ph = 'Expirez'; s = 1 - (x - (a + b) * 1000) / (c * 1000); }
      else { ph = 'Gardez'; s = 0; }
      const e = 0.5 - Math.cos(s * Math.PI) / 2;
      if (api.reduced) { circle.style.transform = 'scale(.8)'; circle.style.opacity = String(0.35 + 0.65 * e); }
      else { circle.style.transform = `scale(${0.45 + 0.55 * e})`; circle.style.opacity = '1'; }
      if (ph !== lastPh) { phase.textContent = ph; lastPh = ph; if (api.sound() && ph !== 'Gardez') softTone(ph === 'Inspirez' ? 196 : 147, 1.2, 0.06); }
      raf = requestAnimationFrame(frame);
    }
    stage.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => { pace = +b.dataset.p; pref.set('pace', pace); t0 = performance.now(); stage.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    raf = requestAnimationFrame(frame);
    run.cleanup = () => cancelAnimationFrame(raf);
  }

  /* ---------- Registre ouvert aux jeux de app/jeux.js ---------- */
  K.detenteGames = K.detenteGames || {};
  K.detAudio = { audio, bell, softTone, master: () => MASTER, canvas };

  /* ---------- Branchements ---------- */
  K.view({ name: 'detente', title: 'Salle de détente', nav: 'detente', match: (h) => h === 'detente', render: (el) => { stopRun(); renderHub(el); } });
  K.view({ name: 'detente-jeu', title: 'Pause', nav: 'detente', match: (h) => GAMES.some((g) => h === 'detente-' + g.id), render: renderGame });
  addEventListener('hashchange', () => { const h = location.hash.slice(1); if (!h.startsWith('detente-')) stopRun(); if (!h.startsWith('detente')) K.lastLearning = h || 'aujourdhui'; });
  K.lastLearning = location.hash.slice(1) || 'aujourdhui';
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stopAudio(); else if (RUN && RUN.sound && AC) AC.resume(); });

  // Accès : bouton dans l'en-tête, à côté de Focus.
  function headerBtn() {
    if (document.getElementById('xdetbtn')) return;
    const foc = document.getElementById('focbtn'); if (!foc) return;
    const a = document.createElement('a');
    a.id = 'xdetbtn'; a.className = 'xdetbtn'; a.href = '#detente'; a.title = 'Salle de détente'; a.setAttribute('aria-label', 'Salle de détente');
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h13v3a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6z"/><path d="M17 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1.5 1.5 1.5 3S8 7.5 8 7.5M12 3c0 1.5 1.5 1.5 1.5 3S12 7.5 12 7.5"/></svg>';
    foc.after(a);
  }
  headerBtn();
  // Échap quitte l'expérience, où que soit le focus.
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && RUN && location.hash.startsWith('#detente-') && !document.querySelector('#focpanel.on, #wpop.on')) location.hash = '#detente'; });
  // Depuis le minuteur Focus (pendant la pause), le lien ferme le panneau.
  document.addEventListener('click', (e) => { if (e.target.closest('#fdet') && typeof focClose === 'function') focClose(); });
})();
