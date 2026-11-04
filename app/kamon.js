/* KOTONOHA · collection de kamon (remplace l'affichage des badges).
   Migration additive : S.g.badges (anciens badges) n'est jamais modifié ni supprimé ; il continue d'être tenu à jour
   pour la compatibilité, et sert à dater les kamon déjà mérités. Les kamon obtenus sont notés dans S.g.kamon {id: date}.
   Les jalons « jours d'étude » ne demandent pas de jours consécutifs : aucune perte en cas de pause. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc, D = window.KX_KAMON || [];
  const MOD_STEPS = { mod1: 1, mod3: 3, mod6: 6, mod9: 9, mod12: 12, mod15: 15, mod18: 18, mod21: 21, mod24: 24 };
  const DAYS = { days3: 3, days7: 7, days30: 30, days100: 100 };
  const OLD = { first: 'first', days3: 's3', days7: 's7', days30: 's30', days100: 's100', r100: 'r100', r1000: 'r1000', r5000: 'r5000', exam: 'exam', lvN4: 'lvN4', lvN3: 'lvN3', lvN2: 'lvN2', cm100: 'cm100' };

  function studyDays() {
    const d = new Set();
    for (const [k, v] of Object.entries((S.g && S.g.days) || {})) if (v && v.x > 0) d.add(k);
    for (const [k, v] of Object.entries(S.rh || {})) if (v > 0) d.add(k);
    for (const [k, v] of Object.entries((S.x && S.x.t) || {})) if (v && v[0] >= 600) d.add(k);
    return d.size;
  }
  const modulesDone = () => MODULES.filter((m) => m[4] && S.units[m[1]] && S.units[m[1]].done && S.units[m[1]].done.test).length;
  const lvDone = (i) => { const n = [55, 129, 210][i]; return !!(S.units[n] && S.units[n].done && S.units[n].done.test); };
  function ok(key) {
    const B = S.g.badges || {};
    if (key === 'first') return validated().length >= 1 || !!B.first;
    if (DAYS[key]) return studyDays() >= DAYS[key] || !!B[OLD[key]];
    if (key === 'r100') return (S.g.rv || 0) >= 100; if (key === 'r1000') return (S.g.rv || 0) >= 1000; if (key === 'r5000') return (S.g.rv || 0) >= 5000;
    if (MOD_STEPS[key]) return modulesDone() >= MOD_STEPS[key];
    if (key === 'exam') return (S.exh || []).length > 0 || !!B.exam;
    if (key === 'lvN4') return lvDone(0); if (key === 'lvN3') return lvDone(1); if (key === 'lvN2') return lvDone(2);
    if (key === 'deck') return Object.keys(B).some((k) => /^dk/.test(k));
    if (key === 'cm100') return !!B.cm100 || (typeof HASCORE !== 'undefined' && HASCORE && typeof coreMastered === 'function' && coreMastered() >= 100);
    if (key === 'voyage') return !!(K.voyage && K.voyage.complete());
    return false;
  }
  function oldDate(key) {
    const B = S.g.badges || {};
    if (OLD[key] && B[OLD[key]]) return B[OLD[key]];
    if (MOD_STEPS[key]) { const ds = Object.entries(B).filter(([k]) => /^m\d+$/.test(k)).map(([, v]) => v).sort((a, b) => a - b); return ds[MOD_STEPS[key] - 1] || null; }
    if (key === 'deck') { const ds = Object.entries(B).filter(([k]) => /^dk/.test(k)).map(([, v]) => v).sort((a, b) => a - b); return ds[0] || null; }
    return null;
  }
  function sync() {
    if (typeof S !== 'object' || !S.g) return [];
    S.g.kamon = S.g.kamon && typeof S.g.kamon === 'object' ? S.g.kamon : {};
    const fresh = [];
    for (const k of D) if (!S.g.kamon[k.id] && ok(k.unlock)) { const d = oldDate(k.unlock); S.g.kamon[k.id] = +d || Date.now(); if (!d) fresh.push(k); }
    if (!S.g.kamonInit) { S.g.kamonInit = Date.now(); const n = Object.keys(S.g.kamon).length; if (typeof save === 'function') save(); if (n) setTimeout(() => K.toast(`Vos badges deviennent des kamon : ${n} déjà dans votre collection.`), 900); return []; }
    if (fresh.length && typeof save === 'function') save();
    return fresh;
  }
  K.kamon = { sync, list: () => D, owned: () => (S.g.kamon || {}), studyDays, modulesDone };

  /* ---------- Dessin ---------- */
  const mon = (k, owned, size) => `<svg viewBox="0 0 100 100" class="kmn${owned ? ' own' : ''}" ${size ? `width="${size}" height="${size}"` : ''} aria-hidden="true"><g fill="currentColor">${k.svg}</g></svg>`;
  K.kamon.svg = mon;
  const LAB = { fait: 'Fait', tradition: 'Tradition', 'légende': 'Légende', 'interprétation': 'Interprétation', fiction: 'Fiction' };
  const items = (L) => L.map(([t, x]) => `<p class="kmi"><span class="kml t-${t === 'légende' ? 'legende' : t === 'interprétation' ? 'interp' : t}">${LAB[t] || t}</span>${esc(x)}</p>`).join('');

  /* ---------- Révélation (sceau) ---------- */
  let queue = [];
  function reveal(list) {
    queue = queue.concat(list); if (document.getElementById('xkmreveal') || !queue.length) return;
    const k = queue.shift();
    const box = document.createElement('div'); box.id = 'xkmreveal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'xkmrt');
    box.innerHTML = `<div class="xkmr"><div class="xkmr-fox">${K.fox ? K.fox('celebration') : ''}</div><div class="xkmr-seal">${mon(k, true)}</div>
      <p class="eyebrow">Nouveau kamon</p><h2 id="xkmrt" class="jp">${ruby(k.j)}</h2><p class="muted">${esc(k.motif)}</p>
      <div class="toolbar"><a class="btn" href="#kamon-${k.id}" data-x>Découvrir son histoire</a><button class="btn sec" type="button" data-x>Plus tard</button></div></div>`;
    document.body.appendChild(box);
    const close = () => { box.remove(); document.removeEventListener('keydown', esck); if (queue.length) setTimeout(() => reveal([]), 300); };
    const esck = (e) => { if (e.key === 'Escape') close(); };
    box.querySelectorAll('[data-x]').forEach((b) => b.addEventListener('click', close));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', esck);
    setTimeout(() => box.querySelector('.btn').focus(), 50);
  }
  K.kamon.reveal = reveal;

  // checkBadges : les anciens badges restent enregistrés (compatibilité), sans toast ; les kamon prennent le relais.
  window.checkBadges = function () {
    const B = S.g.badges = S.g.badges || {};
    try { badgeList().forEach((b) => { if (b.ok && !B[b.id]) B[b.id] = Date.now(); }); } catch (e) {}
    const fresh = sync();
    if (fresh.length) setTimeout(() => reveal(fresh), 500);
  };
  // Affichage compact (Progrès) : derniers kamon obtenus et prochains à découvrir.
  window.badgeGrid = function () {
    const O = K.kamon.owned(), got = D.filter((k) => O[k.id]).sort((a, b) => O[b.id] - O[a.id]), next = D.filter((k) => !O[k.id]).slice(0, 3);
    return `<div class="xkmgrid sm">${got.slice(0, 7).concat(next).map((k) => `<a href="#kamon-${k.id}" class="xkmc${O[k.id] ? ' own' : ''}" title="${esc(plain(k.j))}">${mon(k, !!O[k.id])}<span class="jp">${esc(plain(k.j))}</span></a>`).join('')}</div>`;
  };

  /* ---------- Vues ---------- */
  function renderCollection(el) {
    sync();
    const O = K.kamon.owned(), n = D.filter((k) => O[k.id]).length;
    el.innerHTML = `<div class="eyebrow">Progrès</div><h1>Collection de kamon</h1>
      <p class="muted">Chaque grande étape du parcours vous fait découvrir un emblème de famille réel, avec son histoire. Les fiches distinguent les faits, les traditions, les légendes et les fictions ; les dessins sont des schémas réalisés pour KOTONOHA.</p>
      <div class="xkmhead"><div class="xkmcount"><b>${n}</b><span>sur ${D.length}</span></div><div class="bar" aria-hidden="true"><i style="width:${n / D.length * 100}%"></i></div></div>
      <div class="xkmgrid">${D.map((k) => `<a href="#kamon-${k.id}" class="xkmc${O[k.id] ? ' own' : ''}">${mon(k, !!O[k.id])}<span class="jp">${O[k.id] ? esc(plain(k.j)) : '？'}</span><small>${O[k.id] ? new Date(O[k.id]).toLocaleDateString('fr-FR') : esc(k.need)}</small></a>`).join('')}</div>
      <p class="small muted">Les anciens badges ont été convertis : leurs dates d’obtention sont conservées. Les jalons de jours d’étude ne demandent jamais de jours consécutifs.</p>`;
  }
  function renderFiche(el, h) {
    const k = D.find((x) => 'kamon-' + x.id === h); if (!k) { el.innerHTML = '<p>Kamon introuvable.</p>'; return; }
    const O = K.kamon.owned(), own = !!O[k.id], i = D.indexOf(k);
    el.innerHTML = `<a class="back-link" href="#kamon">Retour à la collection</a>
      <article class="xkmfiche${own ? ' own' : ''}">
        <div class="xkmart">${mon(k, own)}<p class="small muted">${own ? `Obtenu le ${new Date(O[k.id]).toLocaleDateString('fr-FR')}` : `À découvrir : ${esc(k.need)}`}</p></div>
        <div class="xkmtxt"><div class="eyebrow">Kamon ${i + 1} sur ${D.length}</div><h1 class="jp">${ruby(k.j)}</h1><p class="xkmr2">${esc(k.r)}</p>
          ${own ? `<h2>Le motif</h2><p>${esc(k.motif)}</p><h2>Signification</h2>${items(k.sens)}<h2>Contexte historique</h2>${items(k.hist)}<h2>Récit</h2>${items(k.recit)}`
          : `<p>${esc(k.motif)}</p><p class="muted">Son histoire se dévoilera quand vous l’obtiendrez. Rien ne se perd : prenez votre temps.</p>`}
          <h2>Sources</h2><ul class="small">${k.src.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)}</a></li>`).join('')}</ul>
          <p class="small muted">Dessin simplifié réalisé pour KOTONOHA d’après le motif historique.</p>
          <div class="toolbar">${i > 0 ? `<a class="btn sec" href="#kamon-${D[i - 1].id}">← Précédent</a>` : ''}${i < D.length - 1 ? `<a class="btn sec" href="#kamon-${D[i + 1].id}">Suivant →</a>` : ''}</div></div>
      </article>`;
  }
  K.view({ name: 'kamon', title: 'Kamon', nav: 'progres', match: (h) => h === 'kamon', render: renderCollection });
  K.view({ name: 'kamon-fiche', title: 'Kamon', nav: 'progres', match: (h) => /^kamon-[a-z]+$/.test(h), render: renderFiche });

  // Progrès : la carte « Kamon » d'origine compte désormais la collection.
  K.on('progres', (el) => {
    const kg = el.querySelector('.xkmgrid.sm'); if (!kg) return;
    const card = kg.closest('.card'), h2 = card && card.querySelector('h2');
    const O = K.kamon.owned();
    if (h2) h2.textContent = `Kamon · ${D.filter((k) => O[k.id]).length} / ${D.length}`;
    card.querySelectorAll('p').forEach((p) => { if (/XP :|sanctuaire|clan avait|créations originales/.test(p.textContent)) p.remove(); });
    if (!card.querySelector('[data-xkml]')) card.insertAdjacentHTML('beforeend', '<p class="small" data-xkml><a href="#kamon">Voir toute la collection et leurs histoires</a></p>');
    K.tile(el, { id: 'kamon', grid: '[data-xhub]', href: '#kamon', kj: '紋', title: 'Kamon', text: `${D.filter((k) => O[k.id]).length} emblèmes sur ${D.length}, chacun avec son histoire.` });
  });
  // Synchronisation au démarrage (première fois : conversion silencieuse des badges).
  setTimeout(() => { try { const f = sync(); if (f.length) reveal(f); } catch (e) { console.error(e); } }, 1200);
})();
