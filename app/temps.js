/* KOTONOHA · temps actif, calendrier adaptatif et maîtrise réelle.
   - Temps actif : page visible + interaction (clavier, pointeur, défilement) depuis moins de 60 s + écran d'apprentissage.
     Le temps de présence (page visible) est compté à part : les deux ne sont jamais confondus.
   - Calendrier : séances prévues (jours de la semaine choisis), réalisées, non faites, reportées, repos, pauses.
     Aucun message culpabilisant : une séance non faite est simplement « non faite ».
   - Maîtrise : consulté → terminé → compris → maîtrisé, calculé à partir des données existantes (aucune migration). */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const fr1 = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const TICK = 5, IDLE = 60;
  const NOT_LEARNING = /^(apropos|soutenir|mentions|profil|export|paquets|detente|jeu-|calendrier|carte|culture|carnet)/;
  let lastInput = Date.now(), dirty = 0;

  ['keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll', 'input'].forEach((ev) =>
    addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));

  function timeLog() { const x = K.st(); x.t = x.t && typeof x.t === 'object' ? x.t : {}; return x.t; }
  function day(k) { const T = timeLog(); return T[k] || (T[k] = [0, 0]); } // [actif, présence] en secondes

  function tick() {
    if (typeof S !== 'object' || document.visibilityState !== 'visible') return;
    if (!S.prof) return; // pas avant le premier choix d'objectif
    const h = location.hash.replace('#', '') || 'aujourdhui';
    const d = day(K.dayKey());
    d[1] += TICK;
    const speaking = 'speechSynthesis' in window && window.speechSynthesis && speechSynthesis.speaking;
    if (!NOT_LEARNING.test(h) && (Date.now() - lastInput < IDLE * 1000 || speaking)) d[0] += TICK;
    if (++dirty >= 24) flush(); // ~2 min
  }
  function flush() {
    if (!dirty) return; dirty = 0;
    const T = timeLog(), lim = K.dayKey(Date.now() - 400 * 864e5);
    for (const k of Object.keys(T)) if (k < lim) delete T[k];
    K.save();
  }
  setInterval(tick, TICK * 1000);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  addEventListener('pagehide', flush);

  /* ---------- Calendrier ---------- */
  const WD = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
  const WDL = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function plan() {
    const x = K.st();
    x.plan = Object.assign({ days: [1, 2, 3, 4, 5], min: 45 }, x.plan || {});
    x.cal = x.cal && typeof x.cal === 'object' ? x.cal : {};
    x.pauses = Array.isArray(x.pauses) ? x.pauses : [];
    return x;
  }
  const keyOf = (dt) => K.dayKey(dt.getTime());
  const parseKey = (k) => new Date(k + 'T00:00:00');
  function activity(k) {
    const t = (K.st().t || {})[k] || [0, 0];
    const g = (S.g && S.g.days && S.g.days[k]) || null;
    const xp = g ? g.x || 0 : 0, rev = (S.rh && S.rh[k]) || 0;
    return { active: t[0], presence: t[1], xp, rev, done: t[0] >= 600 || xp >= 10 || rev >= 10 };
  }
  function inPause(k) { return plan().pauses.find((p) => p.from <= k && k <= p.to); }
  function movedInto(k) { const C = plan().cal; return Object.keys(C).filter((src) => C[src] === 'reporte:' + k); }
  function status(k) {
    const P = plan(), o = P.cal[k], todayK = K.dayKey(), a = activity(k);
    const planned = (P.plan.days.includes(parseKey(k).getDay()) && o !== 'repos' && !(o || '').startsWith('reporte:')) || o === 'prevu' || movedInto(k).length > 0;
    let s;
    if (inPause(k)) s = a.done ? 'faite' : 'pause';
    else if (o === 'repos') s = a.done ? 'faite' : 'repos';
    else if ((o || '').startsWith('reporte:')) s = 'reportee';
    else if (a.done) s = planned ? 'faite' : 'bonus';
    else if (planned) s = k < todayK ? 'nonfaite' : 'prevue';
    else s = 'libre';
    return { s, planned, a, o };
  }
  const LABEL = { faite: 'Séance faite', bonus: 'Séance en plus', nonfaite: 'Non faite', prevue: 'Prévue', reportee: 'Reportée', repos: 'Repos', pause: 'Pause', libre: 'Libre' };

  function examDate() {
    const sess = (S.prof && S.prof.sess) || '2027-07';
    const [y, m] = sess.split('-').map(Number);
    const d = new Date(y, m - 1, 1); while (d.getDay() !== 0) d.setDate(d.getDate() + 1); // 1er dimanche (habituel, à confirmer)
    return d;
  }
  function paceCard() {
    const lvs = ['N4', 'N3', 'N2'], start = (S.prof && S.prof.start) || 'N4';
    const todo = lvs.slice(lvs.indexOf(start)).flatMap((lv) => regularOf(lv));
    const val = new Set(validated());
    const left = todo.filter((n) => !val.has(String(n))).length;
    const ex = examDate(), weeks = Math.max(1, Math.round((ex - Date.now()) / (7 * 864e5)));
    const need = left / weeks;
    const recent = validated().filter((n) => S.units[n].at && S.units[n].at > Date.now() - 28 * 864e5).length / 4;
    const msg = left === 0 ? 'Toutes les unités de votre parcours sont validées.'
      : recent >= need ? `Au rythme des quatre dernières semaines (${fr1(recent)} unité/sem.), vous êtes en avance sur le rythme nécessaire.`
      : `Rythme nécessaire : environ <b>${fr1(need)} unité${need >= 2 ? 's' : ''} par semaine</b>. Ces quatre dernières semaines : ${fr1(recent)}. Le rythme peut varier : une semaine chargée se rattrape sans tout bouleverser.`;
    return `<div class="card panel xpace"><h2>Rythme jusqu’à l’examen</h2>
      <p class="small muted">Session visée : ${ex.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} (habituellement le premier dimanche de juillet ; <a href="https://www.jlpt.jp/" target="_blank" rel="noopener">date à confirmer sur jlpt.jp</a>). ${weeks} semaines restantes, ${left} unité${left > 1 ? 's' : ''} à valider.</p>
      <p>${msg}</p></div>`;
  }
  function comebackCard() {
    let last = null;
    for (let i = 1; i <= 60; i++) { const k = K.dayKey(Date.now() - i * 864e5); if (activity(k).done) { last = i; break; } }
    if (last === null || last < 7 || activity(K.dayKey()).done) return '';
    return `<div class="card panel xback"><h2>Bon retour</h2><p>Votre dernière séance date d’il y a ${last} jours. Pour reprendre en douceur : quelques révisions, puis la relecture de la dernière unité ouverte. Rien n’est perdu : les intervalles de révision s’adaptent.</p>
      <div class="toolbar"><a class="btn" href="#revision">Réviser un peu</a><a class="btn sec" href="#parcours">Revoir le parcours</a></div></div>`;
  }
  function statsCard() {
    const sum = (n) => { let a = 0, p = 0, d = 0, pl = 0, dn = 0; for (let i = 0; i < n; i++) { const k = K.dayKey(Date.now() - i * 864e5), s = status(k); a += s.a.active; p += s.a.presence; if (s.a.done) d++; if (s.planned && !inPause(k)) { pl++; if (s.a.done) dn++; } } return { a, p, d, pl, dn }; };
    const w = sum(7), m = sum(30);
    return `<div class="card panel"><h2>Temps et régularité</h2>
      <div class="xstats">
        <div><b>${K.fmtMin(w.a)}</b><span>temps actif sur 7 jours</span></div>
        <div><b>${K.fmtMin(m.a)}</b><span>temps actif sur 30 jours</span></div>
        <div><b>${m.d}</b><span>jours d’étude sur 30</span></div>
        <div><b>${m.pl ? m.dn + " / " + m.pl : "—"}</b><span>séances prévues faites (30 j)</span></div>
      </div>
      <p class="small muted">Temps actif : page ouverte sur un écran d’apprentissage avec une action depuis moins d’une minute (ou une écoute en cours). Temps de présence sur 30 jours : ${K.fmtMin(m.p)}. Le temps antérieur à cette mesure n’est pas connu ; les jours d’étude plus anciens viennent de l’XP et des révisions.</p></div>`;
  }

  let calMonth = null;
  function renderCal(el) {
    const P = plan();
    const now = new Date(); if (!calMonth) calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const y = calMonth.getFullYear(), mo = calMonth.getMonth();
    const first = new Date(y, mo, 1), off = (first.getDay() + 6) % 7, nd = new Date(y, mo + 1, 0).getDate();
    const todayK = K.dayKey();
    let cells = '';
    for (let i = 0; i < off; i++) cells += '<div class="xc empty" aria-hidden="true"></div>';
    const counts = {};
    for (let d = 1; d <= nd; d++) {
      const k = keyOf(new Date(y, mo, d)), s = status(k); counts[s.s] = (counts[s.s] || 0) + 1;
      const extra = s.a.active >= 60 ? `<small>${Math.round(s.a.active / 60)} min</small>` : '';
      cells += `<button type="button" class="xc st-${s.s}${k === todayK ? ' today' : ''}" data-k="${k}" aria-label="${new Date(y, mo, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} : ${LABEL[s.s]}${s.a.active >= 60 ? ', ' + Math.round(s.a.active / 60) + ' minutes actives' : ''}"><span>${d}</span>${extra}</button>`;
    }
    const legend = ['faite', 'bonus', 'prevue', 'nonfaite', 'reportee', 'repos', 'pause'].map((s) => `<span class="xl st-${s}"><i></i>${LABEL[s]}${counts[s] ? ' · ' + counts[s] : ''}</span>`).join('');
    el.innerHTML = `<h1>Calendrier</h1>
      <p class="muted">Un repère, pas une contrainte : prévoyez vos jours d’étude, reportez une séance, posez une pause. Les séances non faites ne sont ni comptées comme des fautes ni rattrapées de force.</p>
      ${comebackCard()}
      <div class="grid2">${paceCard()}${statsCard()}</div>
      <div class="card panel">
        <div class="xcalhead"><button class="btn-ghost" id="xprev" aria-label="Mois précédent">‹</button><h2>${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2><button class="btn-ghost" id="xnext" aria-label="Mois suivant">›</button></div>
        <div class="xcal" role="group" aria-label="Jours du mois">${['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map((d) => `<div class="xc hd" aria-hidden="true">${d}</div>`).join('')}${cells}</div>
        <div class="xlegend">${legend}</div>
        <div id="xday" class="xday" role="region" aria-live="polite"></div>
      </div>
      <div class="card panel"><h2>Mes jours d’étude habituels</h2>
        <div class="xwd">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label class="chk"><input type="checkbox" data-wd="${d}" ${P.plan.days.includes(d) ? 'checked' : ''}> ${WDL[d]}</label>`).join('')}</div>
        <label class="small">Durée visée par séance (indicative) : <input type="number" id="xmin" min="5" max="240" step="5" value="${+P.plan.min || 45}" style="width:80px"> min</label>
        <p class="small muted">Jusqu’à 4 h par séance si vous le souhaitez, sans minimum imposé.</p></div>
      <div class="card panel"><h2>Pauses</h2>
        <p class="small muted">Vacances, examens, période chargée : les jours de pause ne sont pas prévus.</p>
        <ul class="xpauses">${P.pauses.map((p, i) => `<li>${esc(p.label || 'Pause')} · du ${parseKey(p.from).toLocaleDateString('fr-FR')} au ${parseKey(p.to).toLocaleDateString('fr-FR')} <button class="btn-ghost small" data-delp="${i}">Retirer</button></li>`).join('') || '<li class="small muted">Aucune pause.</li>'}</ul>
        <form id="xpf" class="toolbar"><label class="small">Du <input type="date" name="from" required></label><label class="small">au <input type="date" name="to" required></label><input type="text" name="label" maxlength="40" placeholder="Nom (facultatif)" aria-label="Nom de la pause"><button class="btn sec" type="submit">Ajouter la pause</button></form></div>`;

    el.querySelector('#xprev').onclick = () => { calMonth = new Date(y, mo - 1, 1); renderCal(el); };
    el.querySelector('#xnext').onclick = () => { calMonth = new Date(y, mo + 1, 1); renderCal(el); };
    el.querySelectorAll('[data-wd]').forEach((c) => c.onchange = () => {
      const d = +c.dataset.wd, s = new Set(P.plan.days); c.checked ? s.add(d) : s.delete(d); P.plan.days = [...s].sort(); K.save(); renderCal(el);
    });
    el.querySelector('#xmin').onchange = (e) => { const v = Math.min(240, Math.max(5, +e.target.value || 45)); P.plan.min = v; K.save(); };
    el.querySelector('#xpf').onsubmit = (e) => {
      e.preventDefault(); const f = new FormData(e.target), from = f.get('from'), to = f.get('to');
      if (!from || !to || to < from) { K.toast('La fin de la pause doit suivre son début.'); return; }
      P.pauses.push({ from, to, label: String(f.get('label') || '').slice(0, 40) }); K.save(); renderCal(el);
    };
    el.querySelectorAll('[data-delp]').forEach((b) => b.onclick = () => { P.pauses.splice(+b.dataset.delp, 1); K.save(); renderCal(el); });
    el.querySelectorAll('.xc[data-k]').forEach((b) => b.onclick = () => dayPanel(el, b.dataset.k));
  }
  function dayPanel(el, k) {
    const P = plan(), s = status(k), box = el.querySelector('#xday'), todayK = K.dayKey();
    const dt = parseKey(k).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const moved = movedInto(k);
    box.innerHTML = `<h3>${dt}</h3>
      <p class="small">${LABEL[s.s]}${s.a.active ? ` · ${K.fmtMin(s.a.active)} actives` : ''}${s.a.rev ? ` · ${+s.a.rev || 0} cartes révisées` : ''}${moved.length ? ` · séance reportée du ${moved.map((m) => parseKey(m).toLocaleDateString('fr-FR')).join(', ')}` : ''}</p>
      <div class="toolbar">
        ${!s.planned ? '<button class="btn sec" data-a="prevu">Prévoir une séance</button>' : ''}
        ${s.s !== 'repos' ? '<button class="btn sec" data-a="repos">Jour de repos</button>' : ''}
        ${s.planned && k >= todayK ? `<label class="small">Reporter au <input type="date" id="xmv" min="${K.dayKey(parseKey(k).getTime() + 864e5)}"></label><button class="btn sec" data-a="mv">Reporter</button>` : ''}
        ${P.cal[k] ? '<button class="btn-ghost" data-a="clr">Revenir au plan habituel</button>' : ''}
      </div>`;
    box.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'mv') { const t = box.querySelector('#xmv').value; if (!t) { K.toast('Choisissez une date.'); return; } P.cal[k] = 'reporte:' + t; }
      else if (a === 'clr') delete P.cal[k];
      else P.cal[k] = a;
      K.save(); renderCal(el); dayPanel(el, k);
    });
    box.querySelector('button')?.focus();
  }

  /* ---------- Maîtrise ---------- */
  function unitMastery(n) {
    const u = S.units[n];
    if (!u) return { s: 0 };
    const done = u.done || {};
    const finished = STD_SECS.every(([k]) => done[k]) || u.via === 'module';
    const best = u.best != null ? u.best : (u.sc && u.sc.test) || null;
    const understood = !!done.test && (best == null || best >= 70);
    const cards = cardsOf(n).map((c) => st(c.id)).filter(Boolean);
    const seen = cards.filter(isSeen), ripe = seen.filter((c) => c.i >= 21 && (c.l || 0) < 3);
    const mastered = understood && cards.length > 0 && ripe.length >= Math.ceil(cards.length * 0.8);
    return { s: mastered ? 4 : understood ? 3 : finished ? 2 : 1, best, cards: cards.length, seen: seen.length, ripe: ripe.length, hz: seen.reduce((a, c) => a + (c.hz || 0), 0) };
  }
  K.unitMastery = unitMastery;
  const MS = ['Pas encore ouverte', 'Consultée', 'Terminée', 'Comprise', 'Maîtrisée'];
  function renderMastery(el) {
    const rows = ['N4', 'N3', 'N2'].map((lv) => {
      const U = regularOf(lv).map((n) => ({ n, m: unitMastery(n) }));
      const c = [0, 0, 0, 0, 0]; U.forEach((x) => c[x.m.s]++);
      return { lv, U, c };
    });
    const tot = [0, 0, 0, 0, 0]; rows.forEach((r) => r.c.forEach((v, i) => tot[i] += v));
    const consolidate = rows.flatMap((r) => r.U).filter((x) => x.m.s === 2 || x.m.s === 3).slice(0, 12);
    el.innerHTML = `<h1>Maîtrise</h1>
      <p class="muted">Terminer une unité ne veut pas dire la maîtriser. Quatre états, calculés sur vos résultats réels :</p>
      <ul class="xms small"><li><i class="m1"></i><b>Consultée</b> : unité ouverte.</li><li><i class="m2"></i><b>Terminée</b> : toutes les étapes faites.</li><li><i class="m3"></i><b>Comprise</b> : test d’unité réussi (70 % ou plus).</li><li><i class="m4"></i><b>Maîtrisée</b> : comprise, et au moins 80 % de ses cartes retenues trois semaines ou plus sans oublis répétés.</li></ul>
      <div class="xstats">${[1, 2, 3, 4].map((i) => `<div><b>${tot[i]}</b><span>${MS[i].toLowerCase()}${tot[i] > 1 ? 's' : ''}</span></div>`).join('')}</div>
      ${rows.map((r) => `<div class="card panel"><h2><span class="tag">${r.lv}</span> ${r.c[4]} maîtrisée${r.c[4] > 1 ? 's' : ''} sur ${r.U.length}</h2>
        <div class="xmgrid">${r.U.map((x) => `<a href="#unite-${x.n}" class="xm m${x.m.s}" title="Unité ${x.n} · ${MS[x.m.s]}${x.m.best != null ? ' · test ' + (+x.m.best || 0) + ' %' : ''}${x.m.cards ? ' · ' + x.m.ripe + '/' + x.m.cards + ' cartes ancrées' : ''}" aria-label="Unité ${x.n} : ${MS[x.m.s]}">${x.n}</a>`).join('')}</div></div>`).join('')}
      ${consolidate.length ? `<div class="card panel"><h2>À consolider</h2><ul class="small">${consolidate.map((x) => `<li><a href="#unite-${x.n}">${esc(unitLabel(x.n))}</a> · ${MS[x.m.s].toLowerCase()}${x.m.cards ? ` · ${x.m.ripe}/${x.m.cards} cartes ancrées` : ''}${x.m.hz ? ` · ${+x.m.hz || 0} hésitation${x.m.hz > 1 ? 's' : ''}` : ''}</li>`).join('')}</ul></div>` : ''}
      <div class="card panel"><h2>Hésitations en révision</h2>
        <label class="chk"><input type="checkbox" id="xhes" ${S.hes !== false ? 'checked' : ''}> Tenir compte des hésitations</label>
        <p class="small muted">Si vous retournez une carte après plus de 12 secondes (20 pour la grammaire) puis répondez « Bien » ou « Facile », l’intervalle suivant est calculé comme pour « Difficile » ou « Bien ». Votre choix reste enregistré, seule la date de la prochaine révision est plus prudente.</p></div>`;
    el.querySelector('#xhes').onchange = (e) => { S.hes = e.target.checked; K.save(); };
  }

  K.view({ name: 'calendrier', title: 'Calendrier', nav: 'progres', match: (h) => h === 'calendrier', render: renderCal });
  K.view({ name: 'maitrise', title: 'Maîtrise', nav: 'progres', match: (h) => h === 'maitrise', render: renderMastery });
  K.on('progres', (el) => {
    const w = (() => { let a = 0; for (let i = 0; i < 7; i++) a += ((K.st().t || {})[K.dayKey(Date.now() - i * 864e5)] || [0])[0]; return a; })();
    const lead = el.querySelector('p.muted');
    const g = document.createElement('div'); g.className = 'grid2 xhub'; g.dataset.xhub = '1';
    if (!el.querySelector('[data-xhub]')) lead.after(g);
    const grid = '[data-xhub]';
    K.tile(el, { id: 'cal', grid, href: '#calendrier', kj: '暦', title: 'Calendrier', text: `Séances prévues, faites, reportées, pauses. ${K.fmtMin(w)} actives ces 7 derniers jours.` });
    K.tile(el, { id: 'mai', grid, href: '#maitrise', kj: '極', title: 'Maîtrise', text: 'Consulté, terminé, compris, maîtrisé : unité par unité.' });
  });
  K.temps = { activity, status, unitMastery };
})();
