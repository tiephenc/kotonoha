/* KOTONOHA · accueil « carnet du jour » et journal de voyage hebdomadaire.
   L'accueil reprend exactement la logique de l'ancien (mission du jour, jokers, XP de mission, recommandations),
   seule la présentation change. Le journal remplace la grille grise des « soirées d'étude » : états illustrés,
   activités et durées réellement travaillées ; un jour de repos n'est jamais présenté comme un échec. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const DAYN = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
  const ST = {
    faite: ['Séance terminée', '済', 'st-done'], bonus: ['Séance en plus', '済', 'st-done'], encours: ['En cours', '灯', 'st-live'],
    prevue: ['Prévue', '予', 'st-plan'], repos: ['Repos', '休', 'st-rest'], reportee: ['Reportée', '→', 'st-moved'],
    pause: ['Pause', '〜', 'st-pause'], libre: ['Libre', '・', 'st-free'], nonfaite: ['Pas cette fois', '・', 'st-skip'],
  };
  const keyOf = (d) => K.dayKey(d.getTime());
  function weekStart(off) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + off * 7); return d; }
  function dayData(k) {
    const T = K.temps ? K.temps.status(k) : { s: 'libre', a: { active: 0, rev: 0, xp: 0 } };
    let s = T.s; if (k === K.dayKey() && !T.a.done && (T.a.active > 0 || T.a.rev > 0)) s = 'encours';
    const fz = (() => { try { const L = focState().log || {}; return L[k] || null; } catch (e) { return null; } })();
    const act = [];
    if (T.a.rev) act.push(`${T.a.rev} carte${T.a.rev > 1 ? 's' : ''} révisée${T.a.rev > 1 ? 's' : ''}`);
    const val = Object.keys(S.units || {}).filter((n) => S.units[n].at && K.dayKey(S.units[n].at) === k);
    if (val.length) act.push(`${val.length} unité${val.length > 1 ? 's' : ''} validée${val.length > 1 ? 's' : ''}`);
    if (fz && fz.n) act.push(`${fz.n} bloc${fz.n > 1 ? 's' : ''} Focus`);
    const loc = (n, f) => K.local.get(n, []).filter((x) => x && (x[f] || x.at) && K.dayKey(x[f] || x.at) === k).length;
    const red = loc('redactions', 'at'), lec = loc('lectures', 'added');
    if (red) act.push(`${red} texte${red > 1 ? 's' : ''} écrit${red > 1 ? 's' : ''}`); if (lec) act.push(`${lec} lecture${lec > 1 ? 's' : ''}`);
    return { k, s, active: T.a.active, xp: T.a.xp, rev: T.a.rev, act, val: val.length };
  }
  let off = 0;
  function week(o = 0) {
    const d0 = weekStart(o), days = [...Array(7)].map((_, i) => { const d = new Date(d0); d.setDate(d0.getDate() + i); return d; });
    const D = days.map((d) => Object.assign(dayData(keyOf(d)), { d }));
    const tot = D.reduce((a, x) => a + x.active, 0), studied = D.filter((x) => ['faite', 'bonus', 'encours'].includes(x.s)).length, rev = D.reduce((a, x) => a + x.rev, 0), val = D.reduce((a, x) => a + x.val, 0);
    const today = K.dayKey(), end = new Date(d0); end.setDate(d0.getDate() + 6);
    return `<div class="xjournal" data-off="${o}">
      <div class="xjhead"><button type="button" class="btn-ghost" data-w="-1" aria-label="Semaine précédente">‹</button>
        <h3>Semaine du ${d0.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</h3>
        <button type="button" class="btn-ghost" data-w="1" aria-label="Semaine suivante" ${o >= 0 ? 'disabled' : ''}>›</button></div>
      <ol class="xjdays" tabindex="0" aria-label="Les sept jours de la semaine (faire défiler si besoin)">${D.map((x, i) => { const [lab, mk, cls] = ST[x.s] || ST.libre; return `<li class="xjday ${cls}${x.k === today ? ' today' : ''}">
        <div class="xjtop"><span class="dn">${DAYN[i]}</span><span class="dd">${x.d.getDate()}</span></div>
        <div class="xjmark" aria-hidden="true">${mk}</div><div class="xjlab">${lab}</div>
        ${x.active >= 60 ? `<div class="xjmin">${K.fmtMin(x.active)}</div>` : ''}
        ${x.act.length ? `<ul class="xjact">${x.act.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}</li>`; }).join('')}</ol>
      <p class="xjsum"><b>${K.fmtMin(tot)}</b> d’étude active · <b>${studied}</b> jour${studied > 1 ? 's' : ''} d’étude · <b>${rev}</b> cartes révisées${val ? ` · <b>${val}</b> unité${val > 1 ? 's' : ''} validée${val > 1 ? 's' : ''}` : ''}</p>
      <p class="small muted">Les jours de repos et les jours libres font partie du voyage : ils ne sont jamais comptés comme des échecs. <a href="#calendrier">Planifier ma semaine</a></p></div>`;
  }
  function wire(root) {
    root.querySelectorAll('.xjournal [data-w]').forEach((b) => b.onclick = () => {
      const box = b.closest('.xjournal'), o = +box.dataset.off + +b.dataset.w; if (o > 0) return;
      box.outerHTML = week(o); wire(root);
    });
  }
  K.journal = { week, wire };
  // L'ancienne grille grise (heat) laisse la place au journal.
  window.heat = function () { return week(0); };
  K.on('progres', (el) => {
    const j = el.querySelector('.xjournal'); if (!j) return; wire(el);
    const card = j.closest('.card'); if (!card) return;
    const h2 = card.querySelector('h2'); if (h2) h2.textContent = 'Journal de la semaine';
    card.querySelectorAll('p.small.muted').forEach((p) => { if (/17 dernières semaines/.test(p.textContent)) p.remove(); });
    card.classList.add('xjcard');
  });

  /* ---------- Séance du jour (environ 4 h, réglable) ----------
     Le plan est figé pour la journée au premier affichage (ou quand la durée change), pour que les durées ne bougent pas
     pendant qu'on travaille. Les étapes et leurs états viennent des données réelles : cartes dues, sections du parcours,
     défi du jour, temps actif mesuré par app/temps.js. Rien n'est inventé ; un oubli de pause n'est jamais pénalisé. */
  const WORK = 50, BRK = 10, DUR = [120, 180, 240, 300, 360];
  const hm = (m) => { m = Math.max(0, Math.round(m)); const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h ${String(r).padStart(2, '0')}` : `${r} min`; };
  function sess() { const x = K.st(); x.sess = x.sess && typeof x.sess === 'object' ? x.sess : {}; if (!DUR.includes(+x.sess.min)) x.sess.min = 240; return x.sess; }
  function chainFrom(budget) {
    const o = unitOrder(), ns = nextStep(), out = []; let i = o.indexOf(ns.n), t = 0, first = true;
    while (i >= 0 && i < o.length && t < budget && out.length < 14) {
      const n = o[i], ss = secsOf(n), pl = planOf(n), st = (S.units[n] || {}).done || {};
      ss.forEach(([sec, secT], j) => { if (t >= budget || out.length >= 14) return; if (first && j < ns.idx) return; if (st[sec] && !(first && j === ns.idx)) return;
        const m = (pl[j] || [0, 25])[1]; out.push([n, sec, secT, m]); t += m; });
      first = false; i++;
    }
    return out;
  }
  function plan() {
    const s = sess(), day = K.dayKey();
    if (s.plan && s.plan.day === day && s.plan.T === s.min) {
      // Toutes les sections prévues sont faites : on prolonge avec les suivantes, sans changer les durées.
      const P0 = s.plan, done = (c) => !!(((S.units[c[0]] || {}).done || {})[c[1]]);
      if (P0.chain.length && P0.chain.every(done)) { const more = chainFrom(P0.les).filter((c) => !P0.chain.some((d) => d[0] === c[0] && d[1] === c[1])); if (more.length) { P0.chain = P0.chain.concat(more.slice(0, 6)); save(); } }
      return P0;
    }
    const T = s.min, P = Math.ceil(T / 60) - 1, W = T - P * BRK, due = dueCards().length;
    const rev = Math.min(Math.round(W * 0.35), Math.max(15, Math.round(due * 0.15 / 5) * 5));
    const def = Math.max(20, Math.round(W * 0.2 / 5) * 5);
    const les = W - rev - def;
    s.plan = { day, T, W, P, rev, les, def, chain: chainFrom(les), due0: due };
    save(); return s.plan;
  }
  /* Frise : les étapes posées bout à bout, une pause toutes les 50 minutes de travail. */
  function timeline(p) {
    const segs = []; let w = 0;
    [['rev', 'Réviser', p.rev], ['les', 'Avancer', p.les], ['def', 'Défi et pratique', p.def]].forEach(([id, t, m]) => {
      let left = m;
      while (left > 0) { const room = WORK - (w % WORK), take = Math.min(left, room); segs.push({ id, t, m: take }); w += take; left -= take;
        if (w % WORK === 0 && w < p.W && segs.filter((x) => x.id === 'brk').length < p.P) segs.push({ id: 'brk', t: 'Pause', m: BRK }); }
    });
    return segs;
  }
  // Même source et même arrondi que le journal de la semaine (K.temps), pour que les deux chiffres concordent.
  function activeToday() { const k = K.dayKey(); const sec = K.temps ? K.temps.status(k).a.active : ((((S.x || {}).t || {})[k] || [0])[0]); return Math.round(sec / 60); }
  function stepsState(p) {
    const d = dayRec(), due = dueCards(), M = missionSteps();
    const revPct = due.length === 0 ? 1 : d.r / (d.r + due.length);
    const ch = p.chain.map(([n, sec, secT, m]) => ({ n, sec, secT, m, ok: !!(((S.units[n] || {}).done || {})[sec]) }));
    const lesDone = ch.filter((c) => c.ok).length, lesPct = ch.length ? lesDone / ch.length : 1;
    const nxt = ch.find((c) => !c.ok);
    const ns = nextStep(), sk = weakSkill(lvOf(ns.n));
    return [
      { id: 'rev', t: 'Réviser', jp: '復習', min: p.rev, pct: revPct, ok: due.length === 0, href: '#revision',
        cta: due.length ? `Réviser ${due.length} carte${due.length > 1 ? 's' : ''}` : 'Révisions à jour',
        items: [due.length ? `${due.rev.length} carte${due.rev.length > 1 ? 's' : ''} à revoir, ${due.fresh.length} nouvelle${due.fresh.length > 1 ? 's' : ''}` : 'Aucune carte due pour l’instant', `${d.r} révisée${d.r > 1 ? 's' : ''} aujourd’hui`, 'Unités du parcours et paquets Anki'] },
      { id: 'les', t: 'Avancer', jp: '前進', min: p.les, pct: lesPct, ok: !nxt, href: nxt ? `#unite-${nxt.n}/${nxt.sec}` : `#unite-${ns.n}/${ns.sec}`,
        cta: nxt ? `Unité ${nxt.n} · ${nxt.secT}` : 'Continuer le parcours', chain: ch, done: lesDone },
      { id: 'def', t: 'Défi et pratique', jp: '挑戦', min: p.def, pct: (d.f > 0 ? .5 : 0) + Math.min(.5, (dayRec().c || 0) / 40), ok: d.f > 0 && (dayRec().c || 0) >= 20, href: d.f > 0 ? '#entrainer' : '#defi',
        cta: d.f > 0 ? `S’entraîner : ${SKL[sk]}` : `Défi chrono : ${SKL[sk]}`,
        items: [`Défi chrono de 5 min · ${SKL[sk]}, niveau ${lvOf(ns.n)}${d.f > 0 ? ' · fait' : ''}`, `Pratique ciblée sur votre point le plus fragile : ${SKL[sk].toLowerCase()}`, 'Carnet d’erreurs et atelier d’écriture si le temps le permet'] },
    ].map((x, i) => Object.assign(x, { i, mission: M[i] }));
  }
  const EMB = { rev: 'rev', les: 'les', def: 'def' };
  function emblem(id) { // anciens emblèmes d'étape (hanaArt), recoloriés en réserve de pochoir
    const s = typeof hanaArt === 'function' ? hanaArt(EMB[id]) : '';
    return s.replace(/(fill|stroke)="#FBF4E8"/g, '$1="currentColor"').replace(/fill="#241A13"/g, 'class="e2"').replace('<svg ', '<svg aria-hidden="true" focusable="false" ');
  }
  function resumeLink() {
    const L = (K.st().last || {}); if (!L.h || Date.now() - (L.t || 0) > 20 * 3600e3) return '';
    return `<a class="xresume" href="#${esc(L.h)}"><span lang="ja" aria-hidden="true">続</span><span><b>Reprendre</b> ${esc(L.title || L.h)}<small>${K.ago ? K.ago(L.t) : ''}</small></span></a>`;
  }
  function focusNow() {
    try { const c = focState().cur; if (c.ph === 'work' || c.ph === 'brk') return { ph: c.ph, ms: focRemain(), paused: c.rest != null }; } catch (e) {}
    return null;
  }

  /* Lisière du jardin : trois couches teintes (collines du satoyama, cèdres, fougères et lanterne de pierre).
     Purement décoratif ; chaque couche a sa vitesse de parallaxe (data-depth). */
  function garden() {
    const fern = (x, h, s) => { let d = `M${x} 160 Q${x + s * 6} ${160 - h * .5} ${x + s * 2} ${160 - h}`; for (let i = 1; i < 7; i++) { const y = 160 - h * i / 7, l = 18 * (1 - i / 8); d += ` M${x + s * (i * .6)} ${y} q${-l} ${-4} ${-l * 1.2} ${-12} M${x + s * (i * .6)} ${y} q${l} ${-4} ${l * 1.2} ${-12}`; } return `<path d="${d}"/>`; };
    const cedar = (x, h) => `<path d="M${x} ${160 - h} L${x + h * .22} 160 L${x - h * .22} 160 Z"/>`;
    return `<div class="xgarden" aria-hidden="true">
      <svg class="g1" data-depth=".05" viewBox="0 0 1200 160" preserveAspectRatio="none"><path d="M0 160 V96 Q120 52 260 84 T560 70 T860 90 T1200 64 V160 Z"/></svg>
      <svg class="g2" data-depth=".1" viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice">${[[60, 96], [110, 120], [170, 84], [880, 110], [940, 140], [1010, 96], [1090, 124], [1150, 88]].map(([x, h]) => cedar(x, h)).join('')}</svg>
      <svg class="g3" data-depth=".18" viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax slice">
        <g class="moss"><ellipse cx="300" cy="160" rx="180" ry="26"/><ellipse cx="760" cy="162" rx="240" ry="30"/><ellipse cx="80" cy="162" rx="120" ry="20"/></g>
        <g class="ferns">${fern(240, 92, 1)}${fern(272, 70, -1)}${fern(820, 104, 1)}${fern(860, 80, -1)}${fern(1130, 90, -1)}</g>
        <g class="toro"><rect x="560" y="142" width="40" height="18"/><rect x="572" y="104" width="16" height="40"/><rect x="552" y="96" width="56" height="10"/><rect class="fire" x="562" y="72" width="36" height="24"/><path d="M546 74 L580 52 L614 74 Z"/></g>
      </svg></div>`;
  }

  /* Page d'ouverture : affiche monumentale (champ teint semé de kamon, KOTO/NOHA, grand renard), puis la séance.
     Les chiffres du bandeau sont réels ; le bouton descend vers la séance du jour. */
  function hero(p, A, cur) {
    const ed = examDate(), days = ed ? Math.max(0, Math.ceil((ed.getTime() - today()) / DAY)) : null, hr = new Date().getHours();
    const kana = hr >= 5 && hr < 11 ? 'おはよう' : hr >= 11 && hr < 18 ? 'こんにちは' : 'こんばんは';
    const due = dueCards().length, vs = K.voyage ? K.voyage.state() : { at: 'tokyo' }, here = ((window.KX_VOYAGE || { places: [] }).places.find((q) => q.id === vs.at) || { name: 'Tokyo' }).name;
    const facts = [['Séance du jour', hm(p.T), `${hm(A)} déjà faites`], ['À réviser', String(due), due > 1 ? 'cartes dues' : 'carte due'], ['Parcours', `${validated().length}/210`, 'unités validées'],
      ['JLPT', days == null ? '—' : 'J-' + days, days == null ? 'à mon rythme' : 'session de ' + sessLabel()], ['En voyage', here, 'carte du Japon']];
    return `<section class="xopen" aria-labelledby="xopen-t">
      <div class="xopen-field" aria-hidden="true"></div>
      <p class="xopen-kana" lang="ja">${kana}</p>
      <h1 id="xopen-t" class="xopen-type" aria-label="Kotonoha"><span aria-hidden="true">KOTO</span><span aria-hidden="true">NOHA</span></h1>
      <div class="xopen-v" lang="ja" aria-hidden="true">言の葉</div>
      <div class="xopen-fox">${K.fox(cur ? (hr >= 23 || hr < 5 ? 'sommeil' : 'accueil') : 'celebration', { label: 'Kitsune, le renard guide de KOTONOHA' })}</div>
      <div class="xopen-cta"><p>${cur ? `${esc(cur.t)} d’abord · ${hm(p.T).replace(/ /g, ' ')} au programme` : 'Séance du jour terminée. Otsukaresama.'}</p>
        <a class="xopen-go" href="#xsess">Voir la séance du jour <span aria-hidden="true">↓</span></a></div>
      <dl class="xopen-facts">${facts.map(([a, b, c]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}<small>${esc(c)}</small></dd></div>`).join('')}</dl>
    </section>`;
  }

  window.viewTodayAffiche = function () {
    useJokers();
    const el = $('#v-aujourdhui'), d = dayRec(), M = missionSteps(), allM = M.every((x) => x.ok);
    if (allM && !d.m) { d.m = 1; gainXP(30, null); toast('Mission du jour accomplie : +30 XP'); burst(); }
    const s = sess(), p = plan(), A = activeToday(), ST = stepsState(p), cur = ST.find((x) => !x.ok), segs = timeline(p);
    const hr = new Date().getHours(), night = document.documentElement.dataset.theme === 'nuit';
    const nextBrk = WORK - (A % WORK), fz = focusNow();
    const pose = !cur ? 'celebration' : (hr >= 23 || hr < 5) ? 'sommeil' : fz && fz.ph === 'brk' ? 'repos' : fz ? 'focus' : A > 0 ? 'etude' : 'accueil';
    const say = !cur ? 'Toute la séance est faite. Otsukaresama : la lanterne reste allumée pour demain.'
      : A === 0 ? `Votre séance commence par ${cur.t.toLowerCase()}. Je garde le temps, vous gardez le fil.`
      : nextBrk <= 5 ? 'Pause dans quelques minutes : levez-vous, buvez un thé, revenez.' : `On en est à ${cur.t.toLowerCase()}. Prochaine pause dans ${nextBrk} min.`;
    const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const pos = Math.min(p.T, A + BRK * Math.min(p.P, Math.floor(A / WORK)));
    let acc = 0;
    el.innerHTML = `${hero(p, A, cur)}<div class="xsess${night ? ' is-night' : ''}" id="xsess" tabindex="-1">
      <div class="xbeamwrap"><div class="xbeam" aria-hidden="true"></div></div>
      <header class="xhead"><div class="xfox-perch">${K.fox(pose, { size: 140 })}</div>
        <h2 class="xhead-t"><span class="k" lang="ja" aria-hidden="true">本日の稽古</span><span class="l">Séance du jour</span></h2>
        <div class="xhead-side">
          <p class="xsess-meta"><span class="xdate">${esc(date)}</span><label>Durée <select id="xdur" aria-label="Durée de la séance">${DUR.map((m) => `<option value="${m}"${m === s.min ? ' selected' : ''}>${hm(m)}</option>`).join('')}</select></label>
            <span><b class="num">${hm(A)}</b> d’étude active</span><span><b class="num">${hm(Math.max(0, p.W - A))}</b> de travail restant</span><span>${p.P} pause${p.P > 1 ? 's' : ''} de ${BRK} min</span></p>
          <p class="xspeech">${esc(say)}</p>
          <div class="xsess-actions">
            <button type="button" class="xtimer" id="xtimer">${fz ? `${fz.ph === 'brk' ? 'Pause' : 'Bloc'} en cours · ${mmss(fz.ms)}${fz.paused ? ' (en pause)' : ''}` : `Lancer un bloc de ${WORK} min`}</button>
            ${resumeLink()}
          </div>
        </div>
      </header>
      <ol class="xnoren" aria-label="Les trois étapes de la séance">
        ${ST.map((x) => `<li class="xpan p-${x.id}${x.ok ? ' ok' : ''}${x === cur ? ' cur' : ''}" style="--pct:${Math.round(Math.min(1, x.pct) * 100)}%">
          <span class="xplamp${x.ok ? ' lit' : ''}" aria-hidden="true"><svg viewBox="0 0 24 40"><path class="cord" d="M12 0V6"/><rect class="cap" x="6" y="5" width="12" height="3"/><rect class="body" x="3" y="8" width="18" height="24" rx="8"/><path class="rib" d="M4 16H20M4 24H20"/><rect class="cap" x="6" y="32" width="12" height="3"/></svg></span>
          <div class="xpan-top"><span class="xpcard" aria-hidden="true"><b class="cn">${x.i + 1}</b><span class="art">${emblem(x.id)}</span><b class="cn r">${x.i + 1}</b></span><span class="jp" lang="ja" aria-hidden="true">${x.jp}</span>
            <span class="xstate">${x.ok ? '<span lang="ja" aria-hidden="true">済</span> Fait' : x === cur ? 'En cours' : 'Ensuite'}</span></div>
          <h2><span class="xsr">Étape ${x.i + 1} : </span>${esc(x.t)}<span class="min num">${hm(x.min)}</span></h2>
          ${x.chain ? `<ul class="xchain">${x.chain.slice(0, 6).map((c) => `<li class="${c.ok ? 'ok' : ''}"><a href="#unite-${c.n}/${c.sec}">Unité ${c.n} · ${esc(c.secT)}</a><span class="num">${c.m} min</span></li>`).join('')}${x.chain.length > 6 ? `<li class="more">et ${x.chain.length - 6} section${x.chain.length - 6 > 1 ? 's' : ''} de plus</li>` : ''}</ul>
            <p class="xpan-sum">${x.done} / ${x.chain.length} section${x.chain.length > 1 ? 's' : ''} faite${x.chain.length > 1 ? 's' : ''}</p>`
          : `<ul class="xitems">${x.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`}
          <div class="xprog" role="progressbar" aria-label="Avancement : ${esc(x.t)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(Math.min(1, x.pct) * 100)}"><i></i></div>
          <a class="xpan-go" href="${x.href}">${esc(x.cta)} <span aria-hidden="true">→</span></a>
        </li>`).join('')}
      </ol>
      <section class="xtl" aria-label="Déroulé de la séance">
        <div class="xtl-bar" aria-hidden="true">${segs.map((g) => `<span class="sg s-${g.id}" style="flex:${g.m}"></span>`).join('')}<i class="here" style="left:${(pos / p.T * 100).toFixed(2)}%"></i></div>
        <ol class="xtl-list">${segs.map((g) => { const a = acc; acc += g.m; return `<li class="s-${g.id}"><time class="num">${hm(a).replace(' min', '′')}</time><span>${esc(g.t)}${g.id === 'brk' ? ' · <a href="#detente">salle de détente</a>' : ''}</span><b class="num">${g.m} min</b></li>`; }).join('')}
          <li class="tot"><time class="num"></time><span>Séance</span><b class="num">${hm(p.T)}</b></li></ol>
      </section>
      ${garden()}
    </div>
    <div class="xafter">
      ${(() => { const R = recos().slice(0, 3); return R.length ? `<section class="xafter-reco"><h2>Pour vous, d’après vos erreurs</h2>${recoCards(R)}</section>` : ''; })()}
      <div class="grid2">
        ${(() => { const vp = K.voyage ? K.voyage.points().total : 0, vs = K.voyage ? K.voyage.state() : { at: 'tokyo' }, VPl = (window.KX_VOYAGE || { places: [] }).places, here = VPl.find((q) => q.id === vs.at), nextP = VPl.filter((q) => q.pts > vp).sort((a, b) => a.pts - b.pts)[0];
          return `<a class="card panel station xvoyprev" href="#voyage"><span class="kjb" aria-hidden="true">旅</span><div><h2>En voyage à ${esc(here ? here.name : 'Tokyo')}</h2><p class="small muted">${vp.toLocaleString('fr-FR')} points de voyage${nextP ? ` · prochaine étape : ${esc(nextP.name)} à ${nextP.pts.toLocaleString('fr-FR')}` : ''}. Ils récompensent l’effort, pas le niveau de japonais.</p></div></a>`; })()}
        <div class="card panel xjcard"><h2>Journal de la semaine</h2>${week(0)}</div>
      </div>
    </div>`;
    wire(el);
    const sel = el.querySelector('#xdur'); if (sel) sel.onchange = () => { sess().min = +sel.value; save(); viewTodayAffiche(); };
    const go = el.querySelector('.xopen-go'); if (go) go.onclick = (e) => { e.preventDefault(); const t = el.querySelector('#xsess'); t.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); t.focus({ preventScroll: true }); };
    const tb = el.querySelector('#xtimer'); if (tb) tb.onclick = () => { try { focOpen(); const c = focState().cur; if (c.ph === 'idle' || c.ph === 'bdone') focStart('work'); } catch (e) { console.error(e); } };
  };
  K.seance = { plan, timeline, stepsState, sess };
})();
