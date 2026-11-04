/* KOTONOHA · mode Focus immersif.
   La logique d'origine (minuteur, pause/reprise, durées, ambiances jouées seulement sur action, Spotify/YouTube)
   reste dans index.html. Ce module ajoute : transitions d'entrée/sortie, lanternes de progression du jour,
   accès à la détente et retour à la séance. */
(function () {
  'use strict';
  const K = window.KX;
  const origClose = window.focClose, origRender = window.focRender, origOpen = window.focOpen;
  if (typeof origRender !== 'function') return;

  window.focOpen = function () { const p = document.getElementById('focpanel'); if (p) p.classList.remove('closing'); origOpen(); };
  window.focClose = function () {
    const p = document.getElementById('focpanel');
    if (!p || !p.classList.contains('on') || K.reduced()) { origClose(); return; }
    p.classList.add('closing');
    setTimeout(() => { p.classList.remove('closing'); origClose(); }, 320);
  };
  function decorate() {
    const box = document.querySelector('#focpanel .fbox'); if (!box || box.querySelector('.flant')) return;
    const f = focState(), td = f.log[dayKey()] || { m: 0, n: 0 }, c = f.cur;
    const ph = { idle: 'Prêt quand vous l’êtes', work: 'Concentration', brk: 'Pause', wdone: 'Bloc terminé', bdone: 'Pause terminée' }[c.ph] || '';
    const lanterns = Math.max(4, Math.min(12, td.n + 2));
    const html = `<div class="flant" aria-label="${td.n} bloc${td.n > 1 ? 's' : ''} terminé${td.n > 1 ? 's' : ''} aujourd’hui">
        ${[...Array(lanterns)].map((_, i) => `<span class="lt${i < td.n ? ' on' : ''}${i === td.n && c.ph === 'work' ? ' cur' : ''}" aria-hidden="true"></span>`).join('')}</div>
      <p class="fphase">${ph}</p>
      <div class="toolbar fnav"><button type="button" class="btn sec" id="fback">Retour à la séance</button><a class="btn-ghost" href="#detente" id="fdet2">Salle de détente</a></div>`;
    const ctl = box.querySelector('.fctl'); if (ctl) ctl.insertAdjacentHTML('afterend', html);
    const back = box.querySelector('#fback');
    if (back) back.onclick = () => { const to = K.lastLearning && !/^detente/.test(K.lastLearning) ? K.lastLearning : 'aujourdhui'; window.focClose(); setTimeout(() => { location.hash = '#' + to; }, 330); };
    const det = box.querySelector('#fdet2'); if (det) det.addEventListener('click', () => window.focClose());
    box.dataset.ph = c.ph;
    // Deux colonnes réelles : la scène (renard, minuteur, lanternes) et les réglages (durées, ambiances, musique).
    const main = document.createElement('div'), side = document.createElement('div'); main.className = 'fmain'; side.className = 'fside';
    [...box.children].forEach((n) => { if (n.classList.contains('x')) return; (n.matches('.fset, .famb, .fspot') ? side : main).appendChild(n); });
    box.appendChild(main); box.appendChild(side);
  }
  window.focRender = function () { origRender(); decorate(); };
  K.focus = { decorate };
})();
