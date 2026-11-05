// Dessins faits pour KOTONOHA d'après les motifs traditionnels (aucun fichier libre disponible), viewBox 0 0 100 100.
const P = 'var(--kmp,#FCF7EE)';
const rot = (s, n, a0 = 0) => [...Array(n)].map((_, i) => `<g transform="rotate(${a0 + i * 360 / n} 50 50)">${s}</g>`).join('');
module.exports = {
  // 桔梗紋 (campanule) : cinq pétales pointus séparés par un fin liseré, nervures et étoile centrale en réserve.
  kikyo: rot('<path d="M50 49 L33.2 24.5 C35.4 15.5 42 9.6 47.6 8.2 L50 3 L52.4 8.2 C58 9.6 64.6 15.5 66.8 24.5 Z"/>', 5)
    + rot(`<path d="M50 40 L50 16" stroke="${P}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`, 5)
    + rot(`<path d="M50 50 L47.2 38 L50 33 L52.8 38 Z" fill="${P}"/>`, 5, 36),
  // 一文字に三つ星 (Mōri) : trait 一 au pinceau, trois astres en triangle.
  mitsuboshi: '<path d="M10 24 C10 18 15 16 20 17 C38 20 62 20 80 17 C86 16 91 19 90 25 C89 30 84 31 80 30 C62 28 38 28 20 30 C15 31 10 29 10 24 Z"/>'
    + '<circle cx="50" cy="52" r="12.5"/><circle cx="29" cy="76" r="12.5"/><circle cx="71" cy="76" r="12.5"/>',
  // 違い鷹の羽 (Asano) : deux plumes de faucon croisées, hampe et barbes en réserve.
  takanoha: (() => {
    const f = `<path d="M50 4 C61 16 63 40 61 62 C60 76 56 88 50 96 C44 88 40 76 39 62 C37 40 39 16 50 4 Z"/>`
      + `<path d="M50 10 L50 94" stroke="${P}" stroke-width="2" fill="none"/>`
      + [24, 36, 48, 60, 72].map((y) => `<path d="M40 ${y + 7} L50 ${y} L60 ${y + 7}" stroke="${P}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>`).join('')
      + `<path d="M58 30 L63 27 M42 30 L37 27 M60 52 L64.5 50 M40 52 L35.5 50" stroke="${P}" stroke-width="2.4"/>`;
    return `<g transform="rotate(-30 50 50)">${f}</g><g transform="rotate(30 50 50)"><path d="M50 4 C61 16 63 40 61 62 C60 76 56 88 50 96 C44 88 40 76 39 62 C37 40 39 16 50 4 Z" fill="none" stroke="${P}" stroke-width="4"/>${f}</g>`;
  })(),
  // 鶴丸 : grue dont les ailes déployées forment un cercle, tête au sommet, rémiges en bas.
  tsuru: (() => {
    const wing = `<path d="M48 13 C30 14 13 28 10 48 C8 64 15 79 28 87 L32 82 L34 89 L39 84 L41 91 L45 86 L47 92 C43 82 38 76 30 70 C21 61 19 47 25 35 C31 24 40 20 48 21 Z"/>`;
    return wing + `<g transform="translate(100 0) scale(-1 1)">${wing}</g>`
      + `<path d="M50 8 C56 8 60 12 60 18 C60 22 57 25 54 27 L50 40 L46 27 C43 25 40 22 40 18 C40 12 44 8 50 8 Z"/>`
      + `<circle cx="50" cy="15.5" r="3.4" fill="${P}"/>`
      + `<path d="M44 74 L40 84 L46 80 L50 90 L54 80 L60 84 L56 74 C53 76 47 76 44 74 Z"/>`;
  })(),
  // 笹竜胆 : trois fleurs de gentiane en éventail au-dessus de cinq feuilles de bambou.
  rindo: (() => {
    const fl = `<path d="M50 46 C45 40 42 32 42 24 L43.5 15 L46.5 21 L50 12 L53.5 21 L56.5 15 L58 24 C58 32 55 40 50 46 Z"/><path d="M50 44 L50 22" stroke="${P}" stroke-width="1.8" fill="none"/>`;
    const lf = `<path d="M50 52 C44 62 43 76 50 94 C57 76 56 62 50 52 Z"/><path d="M50 56 L50 88" stroke="${P}" stroke-width="1.6" fill="none"/>`;
    return [-38, 0, 38].map((a) => `<g transform="rotate(${a} 50 50)">${fl}</g>`).join('')
      + [-62, -31, 0, 31, 62].map((a) => `<g transform="rotate(${a} 50 50)">${lf}</g>`).join('')
      + `<circle cx="50" cy="50" r="4.5"/>`;
  })(),
};
