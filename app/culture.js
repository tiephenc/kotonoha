/* KOTONOHA · culture japonaise : calendrier sourcé et kamon historiques.
   Jours fériés : règles de la loi sur les jours fériés nationaux (国民の祝日に関する法律), telles que présentées par
   le Cabinet Office ; dates d'équinoxe publiées par l'Observatoire astronomique national (国立天文台, 暦要項).
   Fêtes et coutumes (年中行事) : dates usuelles, variables selon les régions pour certaines (お盆).
   Kamon : dessins simplifiés réalisés pour KOTONOHA d'après des motifs historiques documentés. Les badges
   « kamon » de la page Progrès sont, eux, des créations originales générées (ils ne correspondent à aucun clan). */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const SRC = {
    cao: ['Cabinet Office · 国民の祝日について', 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html'],
    nao: ['国立天文台 · 暦要項', 'https://eco.mtk.nao.ac.jp/koyomi/yoko/'],
    wiki: (t) => ['Wikipedia (ja) · ' + t, 'https://ja.wikipedia.org/wiki/' + encodeURIComponent(t)],
  };
  const EQUINOX = { 2026: ['03-20', '09-23'], 2027: ['03-21', '09-23'], 2028: ['03-20', '09-22'] };
  const pad = (n) => String(n).padStart(2, '0');
  const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const nthMonday = (y, m, n) => { const d = new Date(y, m - 1, 1); const off = (8 - d.getDay()) % 7; return 1 + off + (n - 1) * 7; };

  function holidays(y) {
    const H = new Map(), add = (m, d, j, f) => H.set(key(y, m, d), { j, f, t: 'shuku', src: SRC.cao });
    add(1, 1, '元日{がんじつ}', 'Jour de l’an.');
    add(1, nthMonday(y, 1, 2), '成人{せいじん}の日{ひ}', 'Jour des adultes : on célèbre celles et ceux qui atteignent la majorité.');
    add(2, 11, '建国記念{けんこくきねん}の日{ひ}', 'Fondation de l’État (date traditionnelle).');
    add(2, 23, '天皇誕生日{てんのうたんじょうび}', 'Anniversaire de l’empereur actuel.');
    if (EQUINOX[y]) { const [s, a] = EQUINOX[y]; add(+s.slice(0, 2), +s.slice(3), '春分{しゅんぶん}の日{ひ}', 'Équinoxe de printemps ; période de visite des tombes (お彼岸{ひがん}).'); add(+a.slice(0, 2), +a.slice(3), '秋分{しゅうぶん}の日{ひ}', 'Équinoxe d’automne ; on honore les ancêtres.'); }
    add(4, 29, '昭和{しょうわ}の日{ひ}', 'Jour de Shōwa : début de la « Golden Week ».');
    add(5, 3, '憲法記念日{けんぽうきねんび}', 'Anniversaire de la Constitution de 1947.');
    add(5, 4, 'みどりの日{ひ}', 'Jour de la verdure.');
    add(5, 5, 'こどもの日{ひ}', 'Jour des enfants ; on hisse des carpes en tissu (鯉{こい}のぼり).');
    add(7, nthMonday(y, 7, 3), '海{うみ}の日{ひ}', 'Jour de la mer.');
    add(8, 11, '山{やま}の日{ひ}', 'Jour de la montagne.');
    add(9, nthMonday(y, 9, 3), '敬老{けいろう}の日{ひ}', 'Jour du respect des personnes âgées.');
    add(10, nthMonday(y, 10, 2), 'スポーツの日{ひ}', 'Jour du sport.');
    add(11, 3, '文化{ぶんか}の日{ひ}', 'Jour de la culture.');
    add(11, 23, '勤労感謝{きんろうかんしゃ}の日{ひ}', 'Fête du travail et de la gratitude.');
    // 国民の休日 : un jour ordinaire pris entre deux jours fériés devient chômé.
    for (const k of [...H.keys()]) { const d = new Date(k + 'T00:00:00'); const n1 = new Date(d); n1.setDate(d.getDate() + 1); const n2 = new Date(d); n2.setDate(d.getDate() + 2);
      const k1 = key(n1.getFullYear(), n1.getMonth() + 1, n1.getDate()), k2 = key(n2.getFullYear(), n2.getMonth() + 1, n2.getDate());
      if (!H.has(k1) && H.has(k2) && n1.getDay() !== 0) H.set(k1, { j: '国民{こくみん}の休日{きゅうじつ}', f: 'Jour chômé pris entre deux jours fériés.', t: 'shuku', src: SRC.cao }); }
    // 振替休日 : un jour férié tombant un dimanche est reporté au premier jour suivant non férié.
    for (const k of [...H.keys()].sort()) { const d = new Date(k + 'T00:00:00'); if (d.getDay() !== 0) continue;
      const n = new Date(d); do { n.setDate(n.getDate() + 1); } while (H.has(key(n.getFullYear(), n.getMonth() + 1, n.getDate())));
      H.set(key(n.getFullYear(), n.getMonth() + 1, n.getDate()), { j: '振替休日{ふりかえきゅうじつ}', f: 'Jour de remplacement d’un jour férié tombé un dimanche.', t: 'shuku', src: SRC.cao }); }
    return H;
  }
  function customs(y) {
    const C = [
      ['02-03', '節分{せつぶん}', 'Veille du printemps (立春{りっしゅん}) : on lance des haricots en criant 「鬼{おに}は外{そと}、福{ふく}は内{うち}」.', '節分', y >= 2026 && y <= 2028],
      ['03-03', 'ひな祭{まつ}り', 'Fête des filles : on expose des poupées (雛人形{ひなにんぎょう}).', '雛祭り', true],
      ['05-05', '端午{たんご}の節句{せっく}', 'Fête des garçons, devenue こどもの日 ; casques et carpes en tissu.', '端午', true],
      ['07-07', '七夕{たなばた}', 'Fête des étoiles : on accroche des vœux écrits sur des bandes de papier (短冊{たんざく}).', '七夕', true],
      ['08-13', 'お盆{ぼん}（〜16日）', 'On accueille les esprits des ancêtres ; dans certaines régions, en juillet.', '盆', true],
      ['11-15', '七五三{しちごさん}', 'Les enfants de 3, 5 et 7 ans sont conduits au sanctuaire.', '七五三', true],
      ['12-31', '大晦日{おおみそか}', 'Dernier jour de l’année : soba et cloches des temples (除夜{じょや}の鐘{かね}).', '大晦日', true],
    ];
    const M = { 2026: '09-25', 2027: '09-15' };
    const out = C.filter((c) => c[4]).map(([d, j, f, w]) => ({ k: `${y}-${d}`, j, f, t: 'gyoji', src: SRC.wiki(w) }));
    if (M[y]) out.push({ k: `${y}-${M[y]}`, j: '中秋{ちゅうしゅう}の名月{めいげつ}', f: 'Pleine lune de mi-automne : on admire la lune (お月見{つきみ}) avec des dango.', t: 'gyoji', src: SRC.nao });
    return out;
  }
  function events(from, days) {
    const out = [], y0 = new Date(from).getFullYear();
    for (const y of [y0, y0 + 1]) { holidays(y).forEach((v, k) => out.push(Object.assign({ k }, v))); customs(y).forEach((e) => out.push(e)); }
    const a = K.dayKey(from), b = K.dayKey(from + days * 864e5);
    return out.filter((e) => e.k >= a && e.k <= b).sort((p, q) => p.k.localeCompare(q.k) || (p.t === 'shuku' ? -1 : 1));
  }


  function render(el) {
    const now = Date.now(), up = events(now, 60), year = events(now, 365);
    const row = (e) => { const d = new Date(e.k + 'T00:00:00'); return `<li class="t-${e.t}"><time datetime="${e.k}">${d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}</time>
      <span class="jp">${ruby(e.j)}</span><span class="tag">${e.t === 'shuku' ? '祝日 · férié' : '行事 · coutume'}</span><span class="d">${ruby(e.f)}</span>
      <a class="small" href="${esc(e.src[1])}" target="_blank" rel="noopener noreferrer">${esc(e.src[0])}</a></li>`; };
    el.innerHTML = `<div class="eyebrow">Culture</div><h1>Le Japon au fil de l’année</h1>
      <p class="muted">Jours fériés et coutumes, avec leurs sources. Les jours fériés suivent la loi japonaise (reports du dimanche compris) ; les dates d’équinoxe sont celles publiées par l’Observatoire national ; certaines coutumes varient selon les régions.</p>
      <div class="card panel"><h2>Dans les deux prochains mois</h2>${up.length ? `<ul class="xcult">${up.map(row).join('')}</ul>` : '<p class="small muted">Rien de particulier.</p>'}</div>
      <details class="card panel"><summary><h2>Toute l’année à venir</h2></summary><ul class="xcult">${year.map(row).join('')}</ul></details>`;
  }

  K.view({ name: 'culture', title: 'Culture', nav: 'aujourdhui', match: (h) => h === 'culture', render });
  K.on('aujourdhui', (el) => {
    if (el.querySelector('[data-xcult]')) return;
    const e = events(Date.now(), 14)[0]; if (!e) return;
    const d = new Date(e.k + 'T00:00:00'), box = document.createElement('a');
    box.className = 'xcultnote'; box.href = '#culture'; box.dataset.xcult = '1';
    box.innerHTML = `<span class="eyebrow">Bientôt au Japon</span><span><span class="jp">${ruby(e.j)}</span> · ${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>`;
    el.appendChild(box);
  });
  K.on('progres', (el) => {
    K.tile(el, { id: 'culture', grid: '[data-xhub]', href: '#culture', kj: '暦', title: 'Culture', text: 'Fêtes, jours fériés et saisons du Japon, avec leurs sources.' });
  });
  K.culture = { holidays, events };
})();
