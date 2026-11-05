/* KOTONOHA · Kitsune, le renard guide.
   Retour au dessin d'origine (kitsune() de index.html) : masque géométrique crème, flamme et marques vermillon,
   col teint à vagues seigaiha. Six poses qui ne changent que le regard, les oreilles, l'inclinaison et un objet :
   accueil, etude (pinceau), focus (lanterne), repos (thé), sommeil, celebration.
   Couleurs par classes CSS (jour et nuit) ; animations coupées par prefers-reduced-motion.
   KX.fox(pose, { size, label, cls }) renvoie un SVG prêt à insérer. */
(function () {
  'use strict';
  const K = window.KX;
  const ear = (side) => side === 'l'
    ? '<g class="ear l"><path class="fc" d="M70 28 L178 168 L52 206 Z"/><path class="fi" d="M84 64 L150 160 L74 184 Z"/></g>'
    : '<g class="ear r"><path class="fc" d="M330 28 L222 168 L348 206 Z"/><path class="fi" d="M316 64 L250 160 L326 184 Z"/></g>';
  const face = '<path class="fc" d="M48 168 L8 264 L92 270 Z"/><path class="fc" d="M352 168 L392 264 L308 270 Z"/>'
    + '<path class="fc" d="M44 166 L356 166 L332 250 L262 334 L200 404 L138 334 L68 250 Z"/><path class="fm" d="M144 300 L256 300 L200 382 Z"/>'
    + '<path class="fr" d="M200 180 C216 200 216 222 200 244 C184 222 184 200 200 180 Z"/><circle class="fr" cx="172" cy="196" r="6"/><circle class="fr" cx="228" cy="196" r="6"/>'
    + '<path class="sr" d="M98 232 L178 214" stroke-width="7"/><path class="sr" d="M302 232 L222 214" stroke-width="7"/>'
    + '<path class="sr" d="M120 290 L96 300 M122 304 L100 318 M280 290 L304 300 M278 304 L300 318" stroke-width="5"/>'
    + '<path class="fi" d="M184 368 L216 368 L200 388 Z"/>';
  const EYES = {
    sharp: '<g class="eyes"><path class="fi" d="M116 248 L180 232 L170 262 Z"/><path class="fi" d="M284 248 L220 232 L230 262 Z"/><circle class="fc" cx="160" cy="246" r="4"/><circle class="fc" cx="240" cy="246" r="4"/></g>',
    down: '<g class="eyes"><path class="fi" d="M118 252 L180 240 L172 262 Z"/><path class="fi" d="M282 252 L220 240 L228 262 Z"/><circle class="fc" cx="164" cy="254" r="3.5"/><circle class="fc" cx="236" cy="254" r="3.5"/></g>',
    narrow: '<g class="eyes"><path class="fi" d="M116 250 L182 238 L174 254 Z"/><path class="fi" d="M284 250 L218 238 L226 254 Z"/></g>',
    calm: '<g class="eyes"><path class="si" d="M126 250 Q148 262 170 250" stroke-width="9"/><path class="si" d="M274 250 Q252 262 230 250" stroke-width="9"/></g>',
    sleep: '<g class="eyes"><path class="si" d="M126 256 Q148 266 170 256" stroke-width="7"/><path class="si" d="M274 256 Q252 266 230 256" stroke-width="7"/></g>',
    joy: '<g class="eyes"><path class="si" d="M124 254 Q148 228 172 250" stroke-width="10"/><path class="si" d="M276 254 Q252 228 228 250" stroke-width="10"/></g>',
  };
  const MOUTH = {
    rest: '<path class="si" d="M200 388 L200 398 M184 404 Q200 394 216 404" stroke-width="4"/>',
    smile: '<path class="si" d="M200 388 L200 396 M182 400 Q200 414 218 400" stroke-width="4"/>',
    open: '<path class="si" d="M200 388 L200 396" stroke-width="4"/><path class="fi" d="M184 400 Q200 424 216 400 Z"/>',
  };
  const collar = '<path class="fk" d="M56 396 Q200 470 344 396 L380 450 L20 450 Z"/>'
    + '<g class="sc" stroke-width="3" fill="none" opacity=".9"><path d="M70 450 a26 26 0 0 1 52 0 M122 450 a26 26 0 0 1 52 0 M174 450 a26 26 0 0 1 52 0 M226 450 a26 26 0 0 1 52 0 M278 450 a26 26 0 0 1 52 0"/><path d="M82 450 a14 14 0 0 1 28 0 M134 450 a14 14 0 0 1 28 0 M186 450 a14 14 0 0 1 28 0 M238 450 a14 14 0 0 1 28 0 M290 450 a14 14 0 0 1 28 0"/></g>';
  const head = (eyes, mouth) => `${ear('l')}${ear('r')}${face}${EYES[eyes]}${MOUTH[mouth]}`;
  const leaf = (x, y, c, i) => `<path class="${c}" style="animation-delay:${i * .16}s" d="M${x} ${y - 14} C${x + 9} ${y - 6} ${x + 9} ${y + 6} ${x} ${y + 14} C${x - 9} ${y + 6} ${x - 9} ${y - 6} ${x} ${y - 14} Z"/>`;
  const PROPS = {
    brush: '<g class="fx-brush"><path class="fw" d="M256 466 L263 471 L346 334 L339 329 Z"/><path class="fi" d="M339 329 L346 334 L364 298 Q354 298 339 329 Z"/></g>',
    lantern: '<g class="fx-lantern"><circle class="fglow" cx="352" cy="352" r="62"/><path class="si" d="M352 278 V298" stroke-width="3"/><rect class="fi" x="338" y="294" width="28" height="7"/><rect class="fr" x="326" y="300" width="52" height="74" rx="22"/><path class="sc" d="M328 324 H376 M328 350 H376" stroke-width="2.5"/><rect class="fi" x="338" y="372" width="28" height="7"/></g>',
    tea: '<g class="fx-tea"><path class="fsteam" d="M316 332 q-10 -14 0 -28 q10 -14 0 -28 M336 334 q-10 -14 0 -28 q10 -14 0 -28" stroke-width="4" fill="none"/><path class="fw" d="M290 350 H366 L356 404 Q328 414 300 404 Z"/><path class="fr" d="M296 372 H360 L357 386 H299 Z"/></g>',
    zzz: '<g class="fx-zzz"><path class="si" d="M318 120 h22 l-22 24 h22" stroke-width="5"/><path class="si" d="M352 76 h16 l-16 18 h16" stroke-width="4"/><path class="si" d="M376 40 h11 l-11 12 h11" stroke-width="3"/></g>',
    sparks: '<g class="fx-spark">' + [[40, 90, 'fr'], [362, 96, 'fglowd'], [26, 330, 'fglowd'], [376, 300, 'fr'], [200, 14, 'fglowd']].map(([x, y, c], i) => leaf(x, y, c, i)).join('') + '</g>',
  };
  const POSES = {
    accueil: { eyes: 'sharp', mouth: 'rest', tilt: -3 },
    etude: { eyes: 'down', mouth: 'rest', tilt: 4, prop: 'brush' },
    focus: { eyes: 'narrow', mouth: 'rest', tilt: 0, prop: 'lantern', back: true },
    repos: { eyes: 'calm', mouth: 'smile', tilt: -5, prop: 'tea' },
    sommeil: { eyes: 'sleep', mouth: 'rest', tilt: 9, prop: 'zzz' },
    celebration: { eyes: 'joy', mouth: 'open', tilt: 0, prop: 'sparks', back: true },
  };
  const LABEL = { accueil: 'Kitsune vous accueille', etude: 'Kitsune étudie, pinceau en main', repos: 'Kitsune prend le thé', sommeil: 'Kitsune dort', celebration: 'Kitsune célèbre la séance terminée', focus: 'Kitsune se concentre près de sa lanterne' };
  function fox(pose = 'accueil', o = {}) {
    const p = POSES[pose] ? pose : 'accueil', P = POSES[p], prop = P.prop ? PROPS[P.prop] : '';
    const label = o.label || LABEL[p];
    return `<svg class="fox kit p-${p}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 400 470" ${o.size ? `width="${o.size}" height="${Math.round(o.size * 470 / 400)}"` : ''} role="img" aria-label="${K.esc(label)}">`
      + `${P.back ? prop : ''}<g class="fx-head" style="--tilt:${P.tilt}deg">${head(P.eyes, P.mouth)}</g>${collar}${P.back ? '' : prop}</svg>`;
  }
  K.fox = fox;

  // L'ancien appel kitsune(mood) reçoit le même renard, dans la pose qui convient au moment.
  window.kitsune = function (mood) {
    let ph = null; try { ph = typeof focState === 'function' ? focState().cur.ph : null; } catch (e) {}
    const inFocus = (typeof FZ !== 'undefined' && FZ.open) || document.querySelector('#focpanel.on');
    if (inFocus || ph === 'work' || ph === 'brk') return fox(ph === 'brk' ? 'repos' : ph === 'wdone' || ph === 'bdone' ? 'celebration' : 'focus');
    return fox(mood === 'joie' ? 'celebration' : mood === 'calme' ? 'repos' : 'accueil');
  };

  // Marque de l'en-tête : la tête seule.
  const brand = document.querySelector('.brand');
  if (brand && !brand.querySelector('.xbrandfox')) brand.insertAdjacentHTML('afterbegin', `<svg class="xbrandfox kit" viewBox="0 20 400 400" aria-hidden="true">${head('sharp', 'rest')}</svg>`);
})();
