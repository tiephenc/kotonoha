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

  /* ---------- Accueil ---------- */
  window.viewTodayAffiche = function () {
    useJokers();
    const el = $('#v-aujourdhui'), d = dayRec(), M = missionSteps(), nx = M.find((x) => !x.ok), allOk = !nx;
    if (allOk && !d.m) { d.m = 1; gainXP(30, null); toast('Mission du jour accomplie : +30 XP'); burst(); }
    const ed = examDate(), days = ed ? Math.max(0, Math.ceil((ed.getTime() - today()) / DAY)) : null, hr = new Date().getHours(), ns = nextStep();
    const kana = hr >= 5 && hr < 11 ? 'おはよう' : hr >= 11 && hr < 17 ? 'こんにちは' : 'こんばんは';
    const due = dueCards().length, left = M.filter((x) => !x.ok).reduce((a, x) => a + x.min, 0);
    const msg = allOk ? 'Mission accomplie. Otsukaresama ! La lanterne reste allumée pour demain.' : nx.id === 'rev' ? `${due} carte${due > 1 ? 's' : ''} vous attend${due > 1 ? 'ent' : ''}. On commence par là ?` : nx.id === 'les' ? `Prochaine étape : unité ${ns.n}, ${ns.secT.toLowerCase()}.` : 'Il reste le défi du jour : cinq minutes, chrono en main.';
    const pose = allOk ? 'celebration' : (hr >= 23 || hr < 5) ? 'sommeil' : nx.id === 'les' ? 'etude' : 'accueil';
    const NUM = { rev: '一', les: '二', def: '三' };
    const vp = K.voyage ? K.voyage.points().total : 0, vs = K.voyage ? K.voyage.state() : { at: 'tokyo', seen: {} };
    const VPl = (window.KX_VOYAGE || { places: [] }).places, here = VPl.find((p) => p.id === vs.at), nextP = VPl.filter((p) => p.pts > vp).sort((a, b) => a.pts - b.pts)[0];
    const wk = (() => { let a = 0; for (let i = 0; i < 7; i++) a += (((S.x && S.x.t) || {})[K.dayKey(Date.now() - i * 864e5)] || [0])[0]; return a; })();
    const lvRows = ['N4', 'N3', 'N2'].map((lv) => { const R = regularOf(lv), v = R.filter((k) => S.units[k] && S.units[k].done && S.units[k].done.test).length; return `<div class="lvrow lv-${lv}"><span class="tag">${lv}</span><div class="bar"><i style="width:${R.length ? v / R.length * 100 : 0}%"></i></div><span class="small">${v} / ${R.length}</span></div>`; }).join('');
    const R = recos().slice(0, 3);
    el.innerHTML = `<div class="xhome">
      <section class="xhero" aria-label="Accueil">
        <div><div class="kana" lang="ja">${kana}</div><h1>Carnet du jour</h1>
          <p class="bubble">${esc(msg)}</p>
          <div class="cta">${nx ? `<a class="btn big" href="${nx.href}">${esc(x0(nx))}</a>` : `<a class="btn big" href="#unite-${ns.n}/${ns.sec}">Continuer le parcours</a>`}<a class="btn sec" href="#voyage">Ouvrir la carte du voyage</a></div></div>
        <div class="fox-wrap">${K.fox(pose)}</div>
      </section>
      <div class="xsec"><span class="k" lang="ja">今日の任務</span><h2>La mission du jour</h2></div>
      <p class="muted" style="margin:0">${allOk ? 'Tout est fait pour aujourd’hui. Le reste est en bonus.' : `Trois étapes, environ ${left} minutes. Dans l’ordre, c’est plus facile ; rien n’est obligatoire.`}</p>
      <div class="xsteps">${M.map((x, i) => `<a class="xstep${x.ok ? ' ok' : ''}${x === nx ? ' cur' : ''}" href="${x.href}"><span class="ic" aria-hidden="true">${NUM[x.id] || '・'}</span>${x.ok ? '<span class="xstamp" lang="ja" aria-label="fait">済</span>' : ''}
        <span class="n">Étape ${i + 1}${x.ok ? ' · faite' : ' · ≈ ' + x.min + ' min'}</span><b>${esc(x.t)}</b><span>${esc(x.d)}</span></a>`).join('')}</div>
      <div class="xfacts">
        <div class="xfact"><b>${days == null ? '—' : 'J-' + days}</b><span>JLPT</span><small>${days == null ? 'à mon rythme' : 'session de ' + esc(sessLabel())}</small></div>
        <div class="xfact"><b>${due}</b><span>cartes à revoir</span><small>unités et paquets</small></div>
        <div class="xfact"><b>${validated().length} / 210</b><span>unités validées</span><small><a href="#maitrise">voir la maîtrise</a></small></div>
        <div class="xfact"><b>${K.fmtMin(wk)}</b><span>d’étude active</span><small>ces 7 derniers jours</small></div>
      </div>
      <a class="xvoyprev card" href="#voyage">${here && K.voyage ? K.voyage.art(here.souvenir[0]) : ''}<div><div class="eyebrow">Le voyage</div><h2>Vous êtes à ${esc(here ? here.name : 'Tokyo')}</h2>
        <p class="small">${vp.toLocaleString('fr-FR')} points de voyage${nextP ? ` · prochaine étape : <b>${esc(nextP.name)}</b> à ${nextP.pts.toLocaleString('fr-FR')} points` : ' · toutes les étapes sont ouvertes'}.</p>
        ${nextP ? `<div class="bar"><i style="width:${Math.min(100, vp / nextP.pts * 100)}%"></i></div>` : ''}<p class="small muted">Les points de voyage récompensent l’effort réel ; ils ne mesurent pas le niveau de japonais.</p></div></a>
      <div class="card panel xjcard"><h2>Journal de la semaine</h2>${week(0)}</div>
      ${R.length ? `<div class="xsec"><span class="k" lang="ja">おすすめ</span><h2>Pour vous</h2></div>${recoCards(R)}` : ''}
      <div class="grid2"><div class="card panel"><h2>Où j’en suis</h2>${lvRows}<p class="small" style="margin-top:10px"><a href="#progres">Niveau estimé et statistiques</a></p></div>
        <div class="card panel"><h2>Kamon récents</h2>${badgeGrid()}<p class="small"><a href="#kamon">Toute la collection</a></p></div></div>
    </div>`;
    wire(el);
  };
})();
