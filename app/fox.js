/* KOTONOHA · Kitsune, le compagnon de voyage.
   Un personnage unique : pelage roux, plastron crème, écharpe vermillon et sacoche de voyageur.
   Poses : accueil, etude, repos, sommeil, celebration, focus. Animations CSS (queue, clignement, respiration),
   coupées si prefers-reduced-motion. KX.fox(pose, { size, label }) renvoie un SVG prêt à insérer. */
(function () {
  'use strict';
  const K = window.KX;
  const C = { fur: '#E2773A', furD: '#B8552A', cream: '#FFF1DC', ink: '#2A1C17', scarf: '#C8372D', blush: '#F2A08F', bag: '#8A5A2B' };

  const tail = (extra = '') => `<g class="fx-tail" ${extra}><path d="M128 156 C176 156 194 112 168 82 C163 103 152 120 132 126 Z" fill="${C.fur}"/><path d="M168 82 C181 95 186 114 175 129 C171 112 168 99 160 89 Z" fill="${C.cream}"/></g>`;
  const body = `<path d="M68 178 C60 142 72 112 100 108 C128 112 140 142 132 178 Z" fill="${C.fur}"/><path d="M87 178 C83 152 90 128 100 124 C110 128 117 152 113 178 Z" fill="${C.cream}"/>`;
  const paws = `<ellipse cx="86" cy="178" rx="10" ry="5.5" fill="${C.furD}"/><ellipse cx="114" cy="178" rx="10" ry="5.5" fill="${C.furD}"/>`;
  const bag = `<path d="M128 140 l14 4 l-3 16 l-15 -3 Z" fill="${C.bag}"/><path d="M80 110 L130 142" stroke="${C.bag}" stroke-width="3" stroke-linecap="round"/>`;
  const scarf = `<path d="M74 104 C90 113 110 113 126 104 L128 113 C110 122 90 122 72 113 Z" fill="${C.scarf}"/><path class="fx-knot" d="M110 115 L121 137 L109 132 L104 140 L102 118 Z" fill="${C.scarf}"/>`;
  const head = `<g class="fx-ears"><path d="M68 64 L60 20 L92 48 Z" fill="${C.fur}"/><path d="M70 57 L65 31 L85 48 Z" fill="${C.ink}" opacity=".8"/>
      <path d="M132 64 L140 20 L108 48 Z" fill="${C.fur}"/><path d="M130 57 L135 31 L115 48 Z" fill="${C.ink}" opacity=".8"/></g>
    <path d="M60 72 C60 48 80 40 100 40 C120 40 140 48 140 72 C140 95 121 109 100 111 C79 109 60 95 60 72 Z" fill="${C.fur}"/>
    <path d="M66 84 C76 100 89 108 100 109 C111 108 124 100 134 84 C122 93 111 95 100 92 C89 95 78 93 66 84 Z" fill="${C.cream}"/>
    <path d="M92 58 C95 52 105 52 108 58" stroke="${C.cream}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
    <ellipse cx="100" cy="91" rx="4.6" ry="3.4" fill="${C.ink}"/>
    <ellipse cx="78" cy="88" rx="7" ry="4" fill="${C.blush}" opacity=".55"/><ellipse cx="122" cy="88" rx="7" ry="4" fill="${C.blush}" opacity=".55"/>`;
  const EYES = {
    open: `<g class="fx-blink"><ellipse cx="85" cy="75" rx="5" ry="6.5" fill="${C.ink}"/><ellipse cx="115" cy="75" rx="5" ry="6.5" fill="${C.ink}"/><circle cx="86.8" cy="72.6" r="1.8" fill="#fff"/><circle cx="116.8" cy="72.6" r="1.8" fill="#fff"/></g>`,
    happy: `<path d="M78 77 Q85 68 92 77 M108 77 Q115 68 122 77" stroke="${C.ink}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
    closed: `<path d="M78 75 Q85 80 92 75 M108 75 Q115 80 122 75" stroke="${C.ink}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
    down: `<g class="fx-blink"><ellipse cx="86" cy="78" rx="4.6" ry="5" fill="${C.ink}"/><ellipse cx="114" cy="78" rx="4.6" ry="5" fill="${C.ink}"/></g>`,
  };
  const MOUTH = { smile: `<path d="M95 96 Q100 101 105 96" stroke="${C.ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    open: `<path d="M94 96 Q100 106 106 96 Z" fill="${C.ink}"/><path d="M97 100 Q100 104 103 100" fill="${C.scarf}"/>`,
    calm: `<path d="M97 97 L103 97" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>` };

  function sitting(eyes, mouth, front = '', back = '', armL = '', armR = '') {
    return `${back}${tail()}<g class="fx-body">${body}${bag}${armL}${armR}${paws}</g>${front}<g class="fx-head">${head}${EYES[eyes]}${MOUTH[mouth]}${scarf}</g>`;
  }
  const POSES = {
    accueil: () => sitting('open', 'smile', '', '', '',
      `<g class="fx-wave"><path d="M128 124 C140 114 146 100 142 86" stroke="${C.fur}" stroke-width="13" stroke-linecap="round" fill="none"/><ellipse cx="141" cy="83" rx="8" ry="7" fill="${C.furD}"/></g>`),
    etude: () => sitting('down', 'calm',
      `<g class="fx-book"><path d="M66 150 L100 158 L134 150 L134 172 L100 180 L66 172 Z" fill="#FFFDF7" stroke="${C.ink}" stroke-width="2"/><path d="M100 158 L100 180" stroke="${C.ink}" stroke-width="2"/>
        <path class="fx-page" d="M100 158 L130 151 L130 171 L100 178 Z" fill="#F4E7CF" stroke="${C.ink}" stroke-width="1.4"/>
        <path d="M74 158 L94 162 M74 164 L94 168 M106 162 L124 158" stroke="${C.ai || '#2C4A7E'}" stroke-width="1.6" opacity=".6"/></g>
       <g fill="none" stroke="${C.ink}" stroke-width="2.4"><circle cx="85" cy="77" r="10"/><circle cx="115" cy="77" r="10"/><path d="M95 77 L105 77"/></g>`),
    repos: () => sitting('happy', 'smile',
      `<g><path d="M112 150 h26 v12 a13 13 0 0 1 -26 0 Z" fill="#F7F1E6" stroke="${C.ink}" stroke-width="2"/><path d="M138 154 a6 6 0 0 1 0 10" stroke="${C.ink}" stroke-width="2" fill="none"/><ellipse cx="125" cy="151" rx="12" ry="2.6" fill="#7A9A4A"/>
        <g class="fx-steam" stroke="${C.ink}" stroke-width="2" fill="none" opacity=".45" stroke-linecap="round"><path d="M119 143 c-4 -6 4 -10 0 -16"/><path d="M128 141 c-4 -6 4 -10 0 -16"/></g></g>`),
    sommeil: () => `<g class="fx-breathe"><path d="M150 168 C186 168 192 128 164 112 C170 134 160 150 134 154 Z" fill="${C.fur}"/>
        <ellipse cx="108" cy="150" rx="58" ry="30" fill="${C.fur}"/><path d="M60 158 C80 176 140 180 168 160 C150 168 90 170 60 158 Z" fill="${C.cream}"/>
        <g transform="translate(-26 64) scale(.82)">${head}${EYES.closed}${MOUTH.calm}${scarf}</g></g>
        <g class="fx-zzz" font-family="Shippori Mincho B1, serif" font-weight="800" fill="${C.ink}" opacity=".7"><text x="118" y="70" font-size="20">z</text><text x="134" y="52" font-size="15">z</text><text x="146" y="38" font-size="11">z</text></g>`,
    celebration: () => `<g class="fx-jump">${sitting('happy', 'open', '', '',
        `<path d="M72 124 C60 110 54 94 58 80" stroke="${C.fur}" stroke-width="13" stroke-linecap="round" fill="none"/><ellipse cx="58" cy="77" rx="8" ry="7" fill="${C.furD}"/>`,
        `<path d="M128 124 C140 110 146 94 142 80" stroke="${C.fur}" stroke-width="13" stroke-linecap="round" fill="none"/><ellipse cx="142" cy="77" rx="8" ry="7" fill="${C.furD}"/>`)}</g>
        <g class="fx-spark">${[[34, 50, '#D6A13A'], [168, 44, '#C8372D'], [26, 110, '#2C4A7E'], [176, 108, '#5E7D3A'], [100, 16, '#D6A13A']].map(([x, y, c], i) => `<path style="animation-delay:${i * .18}s" d="M${x} ${y - 8} L${x + 2.4} ${y - 2.4} L${x + 8} ${y} L${x + 2.4} ${y + 2.4} L${x} ${y + 8} L${x - 2.4} ${y + 2.4} L${x - 8} ${y} L${x - 2.4} ${y - 2.4} Z" fill="${c}"/>`).join('')}</g>`,
    focus: () => `<g class="fx-glow"><circle cx="36" cy="132" r="30" fill="#F2C46A" opacity=".25"/></g>
        <g class="fx-lantern"><path d="M36 104 v6" stroke="${C.ink}" stroke-width="2"/><rect x="22" y="110" width="28" height="36" rx="12" fill="${C.scarf}"/><path d="M22 122 h28 M22 134 h28" stroke="#FFF1DC" stroke-width="1.4" opacity=".7"/><rect x="28" y="146" width="16" height="4" rx="1" fill="${C.ink}"/></g>
        <g class="fx-breathe">${sitting('closed', 'calm')}</g>`,
  };
  function fox(pose = 'accueil', o = {}) {
    const p = POSES[pose] ? pose : 'accueil';
    const label = o.label || ({ accueil: 'Kitsune vous salue', etude: 'Kitsune étudie', repos: 'Kitsune prend le thé', sommeil: 'Kitsune dort', celebration: 'Kitsune fait la fête', focus: 'Kitsune se concentre' })[p];
    return `<svg class="fox kit p-${p}${o.cls ? ' ' + o.cls : ''}" viewBox="0 0 200 200" ${o.size ? `width="${o.size}" height="${o.size}"` : ''} role="img" aria-label="${K.esc(label)}"><ellipse cx="102" cy="186" rx="58" ry="7" fill="#1D1A2C" opacity=".12"/>${POSES[p]()}</svg>`;
  }
  K.fox = fox;

  // L'ancien renard (kitsune(mood)) est remplacé partout par le nouveau personnage.
  window.kitsune = function (mood) {
    let ph = null; try { ph = typeof focState === 'function' ? focState().cur.ph : null; } catch (e) {}
    if (document.querySelector('#focpanel.on') || ph === 'work' || ph === 'brk') return fox(ph === 'brk' ? 'repos' : ph === 'wdone' || ph === 'bdone' ? 'celebration' : 'focus');
    return fox(mood === 'joie' ? 'celebration' : 'accueil');
  };

  // Tête de renard dans l'en-tête, à côté de 言の葉.
  const brand = document.querySelector('.brand');
  if (brand && !brand.querySelector('.xbrandfox')) brand.insertAdjacentHTML('afterbegin', `<svg class="xbrandfox" viewBox="56 16 88 100" aria-hidden="true">${head}${EYES.happy}${MOUTH.smile}</svg>`);
})();
