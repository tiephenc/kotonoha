/* KOTONOHA · « Prolonger la leçon » : les espaces d'entraînement intégrés à chaque unité.
   Sous chaque unité régulière : laboratoire d'écoute de l'unité, écriture ciblée sur sa grammaire,
   conversation du niveau, texte de lecture, carte de l'unité et tracé des kanji. Tous ces liens mènent à des
   fonctionnalités existantes ; rien n'est bloqué. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  K.onMatch(/^unite-\d+/, (el, h) => {
    const n = +(/^unite-(\d+)/.exec(h) || [])[1], u = UNITS[n];
    if (!u || !u.vocab || el.id !== 'v-unite') return;
    const old = el.querySelector('[data-xlesson]'); if (old && +old.dataset.xlesson === n) return; if (old) old.remove();
    const lv = lvOf(n), sc = (window.KX_ATELIER || { scenarios: [] }).scenarios.find((s) => s.lv === lv);
    const items = [
      u.listen && ['聴', 'Laboratoire d’écoute', `« ${plain(u.listen.title)} » : vitesse, répétition, shadowing.`, `#labo-u${n}`],
      ['書', 'Écrire avec cette unité', 'Un court texte qui emploie sa grammaire, avec vérifications et consigne de correction.', `#redaction-unite-${n}`],
      sc && ['話', 'Converser', `Scénario de niveau ${lv} : ${sc.t}.`, `#conversation-${sc.id}`],
      u.reading && ['読', 'Lire', `« ${plain(u.reading.title)} », puis vos propres lectures.`, `#unite-${n}/lecture`],
      ['図', 'Carte de l’unité', 'Grammaire, kanji, prérequis et contrastes reliés.', `#carte-${n}`],
      u.kanji && u.kanji.length && ['字', 'Tracer ses kanji', `${u.kanji.map((k) => k[0]).slice(0, 6).join(' ')}…`, `#ecrire-${encodeURIComponent(u.kanji[0][0])}`],
    ].filter(Boolean);
    const box = document.createElement('section'); box.className = 'xlesson card panel'; box.dataset.xlesson = n; box.setAttribute('aria-label', 'Prolonger la leçon');
    box.innerHTML = `<h2>Pratiquer l’unité ${n} autrement</h2>
      <div class="xlgrid">${items.map(([kj, t, d, href]) => `<a class="xlitem" href="${esc(href)}"><span class="kj" aria-hidden="true">${kj}</span><b>${esc(t)}</b><span>${esc(d)}</span></a>`).join('')}</div>`;
    el.appendChild(box);
  });
})();
