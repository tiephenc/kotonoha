/* KOTONOHA · nouvelles expériences de la salle de détente.
   Étang aux koi, Atelier musical, Pinceau, Ricochets. Aucune n'utilise de japonais, aucune ne garde de score,
   aucune ne joue de son sans action. Toutes se quittent à tout moment (Échap ou « Quitter »). */
(function () {
  'use strict';
  const K = window.KX, G = (K.detenteGames = K.detenteGames || {}), A = () => K.detAudio;
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- Étang aux koi ---------- */
  G.etang = function (api) {
    const { stage, run } = api;
    stage.insertAdjacentHTML('beforeend', '<div class="xtools"><button type="button" id="xfeed">Jeter quelques granulés</button></div><p class="xhint">Touchez l’eau pour faire des ronds et nourrir les carpes. Clavier : flèches pour viser, Espace pour nourrir.</p>');
    const COL = [['#F7F2EA', '#D9411F'], ['#F08A24', '#F08A24'], ['#E9C46A', '#E9C46A'], ['#F7F2EA', '#1D1A2C'], ['#D9411F', '#F7F2EA'], ['#F7F2EA', '#F08A24'], ['#3E4A63', '#E9C46A']];
    let koi = [], food = [], rings = [], pads = [], aim = null, raf = 0, last = performance.now();
    const cv = A().canvas(stage, () => { const { W, H } = cv.size(); if (!koi.length) {
      for (let i = 0; i < 7; i++) { const x = rnd(60, W - 60), y = rnd(60, H - 60); koi.push({ x, y, a: rnd(0, 6.28), v: rnd(.6, 1), c: COL[i % COL.length], s: rnd(.85, 1.2), sp: Array.from({ length: 12 }, () => ({ x, y })), t: rnd(0, 6) }); }
      for (let i = 0; i < 5; i++) pads.push({ x: rnd(40, W - 40), y: rnd(40, H - 40), r: rnd(22, 38), a: rnd(0, 6.28), f: Math.random() < .4 }); } });
    const { ctx } = cv;
    function drop(x, y) {
      rings.push({ x, y, r: 4, o: .7 });
      for (let i = 0; i < 4; i++) food.push({ x: x + rnd(-14, 14), y: y + rnd(-14, 14), t: 0 });
      if (api.sound()) A().softTone(520 + rnd(-40, 60), .35, .05);
    }
    function frame(t) {
      if (!run.alive) return; const dt = Math.min(40, t - last) / 16.7; last = t;
      const { W, H } = cv.size();
      const g = ctx.createRadialGradient(W * .5, H * .45, 40, W * .5, H * .5, Math.max(W, H) * .7); g.addColorStop(0, '#2E6E78'); g.addColorStop(1, '#173B47'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (!api.reduced) { ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, (i + .5) * H / 6 + Math.sin(x / 70 + t / 1400 + i) * 8); ctx.stroke(); } }
      for (const f of food) { f.t += dt; ctx.fillStyle = '#C79A55'; ctx.beginPath(); ctx.arc(f.x, f.y, 2.6, 0, 6.28); ctx.fill(); }
      for (const k of koi) {
        let target = null, best = 1e9; for (const f of food) { const d = Math.hypot(f.x - k.x, f.y - k.y); if (d < best && d < 260) { best = d; target = f; } }
        let want = k.a; if (target) want = Math.atan2(target.y - k.y, target.x - k.x); else { k.t += .01 * dt; want = k.a + Math.sin(k.t) * .03; }
        if (k.x < 40) want = 0; if (k.x > W - 40) want = Math.PI; if (k.y < 40) want = Math.PI / 2; if (k.y > H - 40) want = -Math.PI / 2;
        let da = ((want - k.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; k.a += Math.max(-.05, Math.min(.05, da)) * dt;
        const v = (target ? 1.7 : k.v) * k.s * dt; k.x += Math.cos(k.a) * v; k.y += Math.sin(k.a) * v;
        if (target && best < 10) { food.splice(food.indexOf(target), 1); rings.push({ x: target.x, y: target.y, r: 3, o: .5 }); }
        k.sp.unshift({ x: k.x, y: k.y }); k.sp.length = 12;
        drawKoi(k);
      }
      for (const p of pads) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = '#3F7A3A'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, p.r, .3, Math.PI * 2 - .05); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(p.r * .8, 0); ctx.stroke();
        if (p.f) { ctx.fillStyle = '#F4B6C2'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(Math.cos(i) * 5 - 6, Math.sin(i) * 5 - 6, 7, 3.5, i, 0, 6.28); ctx.fill(); } ctx.fillStyle = '#F2C46A'; ctx.beginPath(); ctx.arc(-6, -6, 3, 0, 6.28); ctx.fill(); } ctx.restore(); }
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.r += 1.4 * dt; r.o -= .012 * dt; if (r.o <= 0) { rings.splice(i, 1); continue; } ctx.strokeStyle = `rgba(255,255,255,${r.o})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.28); ctx.stroke(); }
      if (aim) { ctx.strokeStyle = 'rgba(242,196,106,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(aim.x, aim.y, 14, 0, 6.28); ctx.stroke(); }
      if (food.length > 40) food.splice(0, food.length - 40);
      raf = requestAnimationFrame(frame);
    }
    function drawKoi(k) {
      const sp = k.sp, s = k.s;
      for (let i = sp.length - 1; i >= 1; i--) { const p = sp[i], w = (1 - i / sp.length) * 9 * s + 1.5; ctx.fillStyle = i % 4 === 1 ? k.c[1] : k.c[0]; ctx.beginPath(); ctx.arc(p.x, p.y, w, 0, 6.28); ctx.fill(); }
      const tl = sp[sp.length - 1], tl2 = sp[sp.length - 3], ta = Math.atan2(tl.y - tl2.y, tl.x - tl2.x);
      ctx.fillStyle = k.c[0]; ctx.globalAlpha = .8; ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(tl.x + Math.cos(ta + .5) * 12 * s, tl.y + Math.sin(ta + .5) * 12 * s); ctx.lineTo(tl.x + Math.cos(ta - .5) * 12 * s, tl.y + Math.sin(ta - .5) * 12 * s); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = k.c[0]; ctx.beginPath(); ctx.ellipse(k.x, k.y, 10 * s, 8 * s, k.a, 0, 6.28); ctx.fill();
      ctx.fillStyle = k.c[1]; ctx.beginPath(); ctx.ellipse(k.x - Math.cos(k.a) * 4, k.y - Math.sin(k.a) * 4, 6 * s, 5 * s, k.a, 0, 6.28); ctx.fill();
    }
    const pos = (e) => { const r = cv.c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.c.addEventListener('pointerdown', (e) => drop(...pos(e)));
    stage.querySelector('#xfeed').onclick = () => { const { W, H } = cv.size(); drop(rnd(W * .2, W * .8), rnd(H * .2, H * .8)); };
    stage.addEventListener('keydown', (e) => { const { W, H } = cv.size(); if (!aim) aim = { x: W / 2, y: H / 2 };
      const m = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key];
      if (m) { e.preventDefault(); aim.x = Math.min(W - 10, Math.max(10, aim.x + m[0])); aim.y = Math.min(H - 10, Math.max(10, aim.y + m[1])); }
      if (e.key === ' ') { e.preventDefault(); drop(aim.x, aim.y); } });
    raf = requestAnimationFrame(frame);
    run.cleanup = () => { cancelAnimationFrame(raf); cv.stop(); };
  };

  /* ---------- Atelier musical : séquenceur pentatonique ---------- */
  G.musique = function (api) {
    const { stage, run } = api;
    const NOTES = [['La', 880], ['Sol', 784], ['Mi', 659.25], ['Ré', 587.33], ['Do', 523.25], ['La ↓', 440]], STEPS = 16;
    const ROWS = NOTES.length + 1; // + taiko
    let grid = Array.from({ length: ROWS }, () => Array(STEPS).fill(false)), step = -1, timer = null, bpm = 96;
    grid[6][0] = grid[6][8] = true; grid[2][2] = grid[3][6] = grid[1][10] = grid[2][12] = true;
    stage.insertAdjacentHTML('beforeend', `<div class="xtools" role="toolbar" aria-label="Lecture">
      <button type="button" id="xplay" aria-pressed="false">▶ Jouer</button><label class="small">Tempo <input type="range" id="xbpm" min="70" max="150" value="${bpm}" aria-label="Tempo"></label>
      <button type="button" id="xrand">Inspiration</button><button type="button" id="xclear">Effacer</button></div>
      <div class="xseq" role="group" aria-label="Partition : lignes de notes, colonnes de temps (flèches pour se déplacer)">${grid.map((row, r) => `<div class="xrow${r === 6 ? ' taiko' : ''}"><span class="xnl" aria-hidden="true">${r === 6 ? 'Taiko' : NOTES[r][0]}</span>${row.map((on, c) => `<button type="button" class="xcellm${on ? ' on' : ''}${c % 4 === 0 ? ' beat' : ''}" data-r="${r}" data-c="${c}" aria-pressed="${on}" aria-label="${r === 6 ? 'Taiko' : 'Note ' + (r + 1)}, temps ${c + 1}"></button>`).join('')}</div>`).join('')}</div>
      <p class="xhint">Touchez les cases pour placer des notes, puis « Jouer ». Toutes les notes appartiennent à une gamme pentatonique : impossible de sonner faux.</p>`);
    const seq = stage.querySelector('.xseq');
    const cell = (r, c) => seq.querySelector(`[data-r="${r}"][data-c="${c}"]`);
    function taiko() { const ac = A().audio(); if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + .25); g.gain.setValueAtTime(.7, t); g.gain.exponentialRampToValueAtTime(.001, t + .5); o.connect(g); g.connect(A().master()); o.start(t); o.stop(t + .55); }
    function tick() {
      seq.querySelectorAll('.now').forEach((x) => x.classList.remove('now'));
      step = (step + 1) % STEPS;
      for (let r = 0; r < ROWS; r++) { const b = cell(r, step); b.classList.add('now'); if (grid[r][step]) { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); if (api.sound()) r === 6 ? taiko() : A().bell(NOTES[r][1], .28); } }
    }
    const play = stage.querySelector('#xplay');
    function stop() { clearInterval(timer); timer = null; play.textContent = '▶ Jouer'; play.setAttribute('aria-pressed', 'false'); seq.querySelectorAll('.now').forEach((x) => x.classList.remove('now')); }
    play.onclick = () => { if (timer) { stop(); return; } A().audio(); step = -1; tick(); timer = setInterval(tick, 60000 / bpm / 4); play.textContent = '■ Arrêter'; play.setAttribute('aria-pressed', 'true'); };
    stage.querySelector('#xbpm').oninput = (e) => { bpm = +e.target.value; if (timer) { clearInterval(timer); timer = setInterval(tick, 60000 / bpm / 4); } };
    seq.addEventListener('click', (e) => { const b = e.target.closest('.xcellm'); if (!b) return; const r = +b.dataset.r, c = +b.dataset.c; grid[r][c] = !grid[r][c]; b.classList.toggle('on', grid[r][c]); b.setAttribute('aria-pressed', grid[r][c]); if (grid[r][c] && api.sound() && !timer) r === 6 ? taiko() : A().bell(NOTES[r][1], .25); });
    seq.addEventListener('keydown', (e) => { const b = e.target.closest('.xcellm'); if (!b) return; const r = +b.dataset.r, c = +b.dataset.c, m = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]; if (!m) return; e.preventDefault(); const n = cell(Math.min(ROWS - 1, Math.max(0, r + m[0])), Math.min(STEPS - 1, Math.max(0, c + m[1]))); if (n) n.focus(); });
    const redraw = () => grid.forEach((row, r) => row.forEach((on, c) => { const b = cell(r, c); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }));
    stage.querySelector('#xclear').onclick = () => { grid = grid.map((row) => row.map(() => false)); redraw(); };
    stage.querySelector('#xrand').onclick = () => { grid = grid.map((row, r) => row.map((_, c) => r === 6 ? c % 8 === 0 || (c % 8 === 6 && Math.random() < .5) : Math.random() < (c % 2 ? .06 : .14))); redraw(); };
    run.cleanup = stop;
  };

  /* ---------- Pinceau : encre et lavis ---------- */
  G.pinceau = function (api) {
    const { stage, run } = api;
    const INKS = [['Encre', '#1D1A2C'], ['Indigo', '#2C4A7E'], ['Vermillon', '#C8372D'], ['Matcha', '#5E7D3A']];
    let ink = INKS[0][1], wash = false, mode = 'brush', drawing = null, layer = null, lctx = null;
    stage.insertAdjacentHTML('beforeend', `<div class="xtools" role="toolbar" aria-label="Outils de peinture">
      ${INKS.map(([n, c], i) => `<button type="button" data-ink="${c}" aria-pressed="${i === 0}"><span class="xink" style="background:${c}"></span>${n}</button>`).join('')}
      <button type="button" id="xwash" aria-pressed="false">Lavis</button><button type="button" id="xseal" aria-pressed="false">Sceau</button>
      <button type="button" id="xenso">Tracer un ensō</button><button type="button" id="xclearp">Nouvelle feuille</button><button type="button" id="xsave">Enregistrer l’image</button></div>
      <p class="xhint">Peignez à la souris ou au doigt : plus le geste est lent, plus le trait est épais.</p>`);
    const cv = A().canvas(stage, () => paint());
    const { ctx } = cv;
    function ensureLayer() { const { W, H } = cv.size(); if (!layer || layer.width !== Math.round(W) || layer.height !== Math.round(H)) { const old = layer; layer = document.createElement('canvas'); layer.width = Math.round(W); layer.height = Math.round(H); lctx = layer.getContext('2d'); if (old) lctx.drawImage(old, 0, 0); } }
    function paint() { const { W, H } = cv.size(); ensureLayer(); ctx.fillStyle = '#F7F0E1'; ctx.fillRect(0, 0, W, H); ctx.drawImage(layer, 0, 0, W, H); }
    function dab(x, y, w) { lctx.globalAlpha = wash ? .08 : .55; lctx.fillStyle = ink; for (let i = 0; i < 3; i++) { lctx.beginPath(); lctx.arc(x + rnd(-w * .15, w * .15), y + rnd(-w * .15, w * .15), Math.max(.6, w * rnd(.8, 1.05)), 0, 6.28); lctx.fill(); } lctx.globalAlpha = 1; }
    function line(a, b, wa, wb) { const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / 1.5)); for (let i = 0; i <= n; i++) { const t = i / n; dab(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, wa + (wb - wa) * t); } }
    function seal(x, y) { lctx.save(); lctx.translate(x, y); lctx.rotate(rnd(-.12, .12)); lctx.fillStyle = '#C8372D'; lctx.globalAlpha = .9; lctx.fillRect(-22, -22, 44, 44); lctx.globalAlpha = 1; lctx.fillStyle = '#F7F0E1'; lctx.font = '800 26px "Shippori Mincho B1", serif'; lctx.textAlign = 'center'; lctx.textBaseline = 'middle'; lctx.fillStyle = '#F7F0E1'; lctx.beginPath(); lctx.ellipse(0, 0, 14, 7, -0.7, 0, 6.28); lctx.fill(); lctx.strokeStyle = '#C8372D'; lctx.lineWidth = 2; lctx.beginPath(); lctx.moveTo(-11, 9); lctx.lineTo(11, -9); lctx.stroke(); lctx.restore(); paint(); if (api.sound()) A().softTone(160, .3, .07); }
    const pos = (e) => { const r = cv.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() }; };
    cv.c.addEventListener('pointerdown', (e) => { ensureLayer(); const p = pos(e); if (mode === 'seal') { seal(p.x, p.y); return; } cv.c.setPointerCapture(e.pointerId); drawing = { p, w: 6 }; dab(p.x, p.y, 6); paint(); });
    cv.c.addEventListener('pointermove', (e) => { if (!drawing) return; const p = pos(e), d = Math.hypot(p.x - drawing.p.x, p.y - drawing.p.y), v = d / Math.max(1, p.t - drawing.p.t); const w = Math.max(1.4, Math.min(16, drawing.w * .7 + (14 - v * 9) * .3)); line(drawing.p, p, drawing.w, w); drawing = { p, w }; paint(); });
    const up = () => { drawing = null; }; cv.c.addEventListener('pointerup', up); cv.c.addEventListener('pointercancel', up);
    stage.querySelectorAll('[data-ink]').forEach((b) => b.onclick = () => { ink = b.dataset.ink; stage.querySelectorAll('[data-ink]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    stage.querySelector('#xwash').onclick = (e) => { wash = !wash; e.currentTarget.setAttribute('aria-pressed', wash); };
    stage.querySelector('#xseal').onclick = (e) => { mode = mode === 'seal' ? 'brush' : 'seal'; e.currentTarget.setAttribute('aria-pressed', mode === 'seal'); };
    stage.querySelector('#xclearp').onclick = () => { ensureLayer(); lctx.clearRect(0, 0, layer.width, layer.height); paint(); };
    stage.querySelector('#xenso').onclick = () => { ensureLayer(); const { W, H } = cv.size(), R = Math.min(W, H) * .3, cx = W / 2, cy = H / 2 + 10, a0 = rnd(0, 6.28); let prev = null;
      for (let i = 0; i <= 140; i++) { const a = a0 + i / 140 * Math.PI * 1.9, r = R * (1 + Math.sin(i / 9) * .015), p = { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }, w = 14 * Math.sin(Math.PI * Math.min(1, i / 120)) + 2; if (prev) line(prev, p, w, w); prev = p; } paint(); };
    stage.querySelector('#xsave').onclick = () => { paint(); try { const a = document.createElement('a'); a.download = `kotonoha-pinceau-${K.dayKey()}.png`; a.href = cv.c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); } catch (e) { K.toast('Enregistrement impossible ici.'); } };
    run.cleanup = () => cv.stop();
  };

  /* ---------- Ricochets ---------- */
  G.ricochets = function (api) {
    const { stage, run } = api;
    stage.insertAdjacentHTML('beforeend', '<p class="xhint">Tirez le galet vers l’arrière puis relâchez : un angle rasant fait plus de rebonds. Clavier : flèches pour l’angle et la force, Espace pour lancer.</p><p class="xstatus small" role="status" aria-live="polite"></p>');
    const status = stage.querySelector('.xstatus');
    let stone = null, drag = null, ang = .14, pow = .6, rip = [], raf = 0, last = performance.now(), msgT = 0, birds = Array.from({ length: 3 }, (_, i) => ({ x: i * 200, y: 60 + i * 18 }));
    const cv = A().canvas(stage, () => {});
    const { ctx } = cv;
    const start = () => { const { W, H } = cv.size(); return { x: 70, y: H * .62 - 10 }; };
    function throwStone(a, p) { const s = start(); stone = { x: s.x, y: s.y, vx: Math.cos(a) * (6 + p * 10), vy: Math.sin(a) * (6 + p * 10) * -1 + 0, bounces: 0, alive: true }; }
    function frame(t) {
      if (!run.alive) return; const dt = Math.min(40, t - last) / 16.7; last = t; const { W, H } = cv.size(), wl = H * .62;
      const sky = ctx.createLinearGradient(0, 0, 0, wl); sky.addColorStop(0, '#F6C9A0'); sky.addColorStop(1, '#F3E3C8'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, wl);
      ctx.fillStyle = '#F2C46A'; ctx.beginPath(); ctx.arc(W * .8, wl - 30, 36, 0, 6.28); ctx.fill();
      ctx.fillStyle = '#7C8DA6'; ctx.beginPath(); ctx.moveTo(0, wl); ctx.lineTo(W * .25, wl - 70); ctx.lineTo(W * .45, wl - 20); ctx.lineTo(W * .62, wl - 90); ctx.lineTo(W, wl - 30); ctx.lineTo(W, wl); ctx.fill();
      const wat = ctx.createLinearGradient(0, wl, 0, H); wat.addColorStop(0, '#5C8FA3'); wat.addColorStop(1, '#2E5568'); ctx.fillStyle = wat; ctx.fillRect(0, wl, W, H - wl);
      ctx.fillStyle = '#B9A27A'; ctx.beginPath(); ctx.moveTo(0, wl - 4); ctx.quadraticCurveTo(80, wl - 12, 120, H); ctx.lineTo(0, H); ctx.fill();
      if (!api.reduced) for (const b of birds) { b.x = (b.x + .4 * dt) % (W + 40); ctx.strokeStyle = '#4A4A5A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(b.x - 6, b.y); ctx.quadraticCurveTo(b.x - 3, b.y - 4, b.x, b.y); ctx.quadraticCurveTo(b.x + 3, b.y - 4, b.x + 6, b.y); ctx.stroke(); }
      for (let i = rip.length - 1; i >= 0; i--) { const r = rip[i]; r.r += .9 * dt; r.o -= .015 * dt; if (r.o <= 0) { rip.splice(i, 1); continue; } ctx.strokeStyle = `rgba(255,255,255,${r.o})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(r.x, wl + 4, r.r, r.r * .25, 0, 0, 6.28); ctx.stroke(); }
      const s0 = start();
      if (stone && stone.alive) {
        stone.vy += .22 * dt; stone.x += stone.vx * dt; stone.y += stone.vy * dt;
        if (stone.y >= wl && stone.vy > 0) {
          const shallow = stone.vy < stone.vx * .75 && stone.vx > 2.2;
          rip.push({ x: stone.x, r: 4, o: .8 });
          if (shallow) { stone.bounces++; stone.vy = -stone.vy * .55; stone.vx *= .82; stone.y = wl; if (api.sound()) A().softTone(700 + stone.bounces * 40, .12, .05); }
          else { stone.alive = false; rip.push({ x: stone.x, r: 2, o: 1 }); if (api.sound()) A().softTone(180, .3, .06); status.textContent = stone.bounces ? `${stone.bounces} ricochet${stone.bounces > 1 ? 's' : ''}. Encore un ?` : 'Plouf ! Essayez un angle plus rasant.'; msgT = t; }
        }
        if (stone.x > W + 20) { stone.alive = false; status.textContent = `${stone.bounces} ricochets jusqu’à l’autre rive !`; }
        ctx.fillStyle = '#5A5348'; ctx.beginPath(); ctx.ellipse(stone.x, Math.min(stone.y, wl), 7, 4, 0, 0, 6.28); ctx.fill();
      } else {
        ctx.fillStyle = '#5A5348'; ctx.beginPath(); ctx.ellipse(s0.x, s0.y, 7, 4, 0, 0, 6.28); ctx.fill();
        const a = drag ? drag.a : ang, p = drag ? drag.p : pow;
        ctx.strokeStyle = 'rgba(29,26,44,.45)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s0.x + Math.cos(a) * (40 + p * 80), s0.y - Math.sin(a) * (40 + p * 80)); ctx.stroke(); ctx.setLineDash([]);
      }
      raf = requestAnimationFrame(frame);
    }
    const pos = (e) => { const r = cv.c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    cv.c.addEventListener('pointerdown', (e) => { if (stone && stone.alive) return; cv.c.setPointerCapture(e.pointerId); drag = { o: pos(e), a: ang, p: pow }; });
    cv.c.addEventListener('pointermove', (e) => { if (!drag) return; const p = pos(e), dx = drag.o.x - p.x, dy = p.y - drag.o.y; drag.a = Math.max(.02, Math.min(.9, Math.atan2(dy, Math.max(1, dx)))); drag.p = Math.max(.1, Math.min(1, Math.hypot(dx, dy) / 160)); });
    cv.c.addEventListener('pointerup', () => { if (!drag) return; ang = drag.a; pow = drag.p; drag = null; throwStone(ang, pow); });
    stage.addEventListener('keydown', (e) => { const m = { ArrowUp: () => ang = Math.min(.9, ang + .04), ArrowDown: () => ang = Math.max(.02, ang - .04), ArrowRight: () => pow = Math.min(1, pow + .08), ArrowLeft: () => pow = Math.max(.1, pow - .08), ' ': () => { if (!stone || !stone.alive) throwStone(ang, pow); } }[e.key]; if (m) { e.preventDefault(); m(); } });
    raf = requestAnimationFrame(frame);
    run.cleanup = () => { cancelAnimationFrame(raf); cv.stop(); };
  };
})();
