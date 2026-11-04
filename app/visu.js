/* KOTONOHA · visualisations de progression (Progrès), toutes calculées sur les données réelles :
   S.rh (révisions par jour), S.x.t (temps actif), S.srs (échéances), maîtrise des unités, S.log (réponses par compétence).
   Chaque graphique a un résumé lisible ; s'il n'y a pas encore de données, il le dit. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const days = (n) => [...Array(n)].map((_, i) => K.dayKey(Date.now() - (n - 1 - i) * 864e5));
  function bars(vals, labels, cls, unit) {
    const mx = Math.max(1, ...vals);
    return `<div class="xbars ${cls}" role="img" aria-label="${esc(unit)}">${vals.map((v, i) => `<span class="b" style="--h:${(v / mx * 100).toFixed(1)}%" title="${esc(labels[i])} : ${v} ${esc(unit)}"><i></i></span>`).join('')}</div>`;
  }
  function card() {
    const D30 = days(30), rev = D30.map((k) => +(S.rh || {})[k] || 0), act = D30.map((k) => Math.round(((((S.x || {}).t || {})[k] || [0])[0]) / 60));
    const lab = D30.map((k) => new Date(k + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }));
    const tRev = rev.reduce((a, b) => a + b, 0), tAct = act.reduce((a, b) => a + b, 0), dAct = act.filter((m) => m > 0).length;
    // Échéances des 14 prochains jours (cartes du site déjà vues)
    const t0 = today(), due = [...Array(14)].map(() => 0);
    for (const s of Object.values(S.srs || {})) { if (!s || !isSeen(s)) continue; const d = Math.max(0, Math.floor((s.d - t0) / DAY)); if (d < 14) due[d]++; }
    const dLab = [...Array(14)].map((_, i) => i === 0 ? 'aujourd’hui (et en retard)' : new Date(t0 + i * DAY).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
    // Maîtrise par niveau
    const MS = ['non ouverte', 'consultée', 'terminée', 'comprise', 'maîtrisée'];
    const lv = ['N4', 'N3', 'N2'].map((L) => { const R = regularOf(L), c = [0, 0, 0, 0, 0]; R.forEach((n) => c[K.unitMastery ? K.unitMastery(n).s : 0]++); return [L, c, R.length]; });
    // Réussite par compétence (300 dernières réponses)
    const log = (S.log || []).slice(-300), sk = {};
    log.forEach((r) => { if (!r || !r[2]) return; const x = sk[r[2]] || (sk[r[2]] = [0, 0]); x[0]++; x[1] += +r[3] || 0; });
    const SK = Object.entries(sk).filter(([, x]) => x[0] >= 5).map(([k, x]) => [typeof SKL === 'object' && SKL[k] ? SKL[k] : k, Math.round(x[1] / x[0] * 100), x[0]]).sort((a, b) => a[1] - b[1]);
    return `<div class="card panel xvisu" data-xvisu><h2>Vos données, en images</h2>
      <div class="xvgrid">
        <figure><figcaption><b>Révisions</b> · 30 derniers jours</figcaption>${tRev ? bars(rev, lab, 'c-rev', 'cartes révisées') : '<p class="small muted">Pas encore de révision enregistrée.</p>'}
          <p class="small">${tRev} cartes révisées, ${(tRev / 30).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} par jour en moyenne.</p></figure>
        <figure><figcaption><b>Temps actif</b> · 30 derniers jours</figcaption>${tAct ? bars(act, lab, 'c-act', 'minutes actives') : '<p class="small muted">Le temps actif est mesuré depuis le 4 novembre 2026 ; rien d’enregistré pour l’instant.</p>'}
          <p class="small">${K.fmtMin(tAct * 60)} au total, sur ${dAct} jour${dAct > 1 ? 's' : ''}.</p></figure>
        <figure><figcaption><b>Révisions à venir</b> · 14 prochains jours</figcaption>${due.some((x) => x) ? bars(due, dLab, 'c-due', 'cartes prévues') : '<p class="small muted">Aucune carte en cours de révision pour l’instant.</p>'}
          <p class="small">${due[0]} aujourd’hui (retards compris), ${due.slice(1, 8).reduce((a, b) => a + b, 0)} dans les 7 jours suivants.</p></figure>
        <figure><figcaption><b>Maîtrise</b> · par niveau</figcaption>
          ${lv.map(([L, c, n]) => `<div class="xstack" role="img" aria-label="${L} : ${c.map((v, i) => v + ' ' + MS[i]).join(', ')}"><span class="tag">${L}</span><div class="st">${c.map((v, i) => v ? `<i class="m${i}" style="flex:${v}" title="${v} ${MS[i]}${v > 1 ? 's' : ''}"></i>` : '').join('')}</div><small>${c[4]} / ${n}</small></div>`).join('')}
          <div class="xlegend">${[1, 2, 3, 4].map((i) => `<span class="xl"><i class="m${i}"></i>${MS[i]}</span>`).join('')}</div></figure>
        <figure class="wide"><figcaption><b>Réussite par compétence</b> · 300 dernières réponses</figcaption>
          ${SK.length ? `<div class="xskill">${SK.map(([l, p, n]) => `<div><span>${esc(l)}</span><div class="bar"><i style="width:${p}%"></i></div><b>${p} %</b><small>${n} réponses</small></div>`).join('')}</div><p class="small muted">Compétence la plus fragile en premier. Mesuré sur vos exercices réels, pas sur une estimation.</p>`
          : '<p class="small muted">Il faut au moins cinq réponses dans une compétence pour l’afficher.</p>'}</figure>
      </div></div>`;
  }
  K.on('progres', (el) => {
    if (el.querySelector('[data-xvisu]')) return;
    const hub = el.querySelector('[data-xhub]'); const html = card();
    if (hub) hub.insertAdjacentHTML('afterend', html); else el.insertAdjacentHTML('beforeend', html);
  });
  K.visu = { card };
})();
