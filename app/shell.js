/* KOTONOHA · coque de l'application : six onglets, sous-rubriques, jour et nuit, reprise de séance.
   Les écrans existants ne changent pas d'adresse ; ce module décide seulement quel onglet est allumé,
   ajoute la bande de sous-rubriques en tête de l'écran et mémorise la dernière activité d'apprentissage. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;

  /* ---------- Onglets ---------- */
  const TABS = {
    aujourdhui: { k: '今日', t: 'Aujourd’hui', big: '今日' },
    apprendre: { k: '学', t: 'Apprendre', big: '学ぶ', sub: [['parcours', 'Parcours'], ['vocab', 'Vocabulaire'], ['lire', 'Lire'], ['carte', 'Carte du parcours']] },
    pratiquer: { k: '練', t: 'Pratiquer', big: '練習', sub: [['revision', 'Réviser'], ['entrainer', 'S’entraîner'], ['atelier', 'Atelier'], ['examens', 'Examens blancs'], ['erreurs', 'Carnet d’erreurs']] },
    voyager: { k: '旅', t: 'Voyager', big: '旅', sub: [['voyage', 'Carte du voyage'], ['kamon', 'Kamon'], ['culture', 'Culture']] },
    detente: { k: '憩', t: 'Détente', big: '憩い', sub: [['detente', 'Salle lofi'], ['detente-jeux', 'Jeux']] },
    profil: { k: '私', t: 'Profil', big: '私', sub: [['profil', 'Profil'], ['progres', 'Progrès'], ['maitrise', 'Maîtrise'], ['calendrier', 'Calendrier'], ['carnet', 'Carnet']] },
  };
  function tabOf(h, view) {
    if (/^(aujourdhui|defi)$/.test(h)) return 'aujourdhui';
    if (/^(unite-|parcours|vocab|lire|lecture|carte|lv-)/.test(h)) return 'apprendre';
    if (/^(revision|entrainer|examens|ecrire|labo|erreurs|atelier|redaction|conversation|paquets)/.test(h)) return 'pratiquer';
    if (/^(voyage|kamon|culture)/.test(h)) return 'voyager';
    if (/^detente/.test(h)) return 'detente';
    if (/^(profil|progres|maitrise|calendrier|carnet|apropos|soutenir|mentions|export)/.test(h)) return 'profil';
    return ({ parcours: 'apprendre', vocab: 'apprendre', revision: 'pratiquer', entrainer: 'pratiquer', progres: 'profil', profil: 'profil' })[view] || 'apprendre';
  }
  const SUBOF = (h) => (h === 'examens' ? 'examens' : /^detente-/.test(h) ? 'detente-jeux' : h.replace(/[-/].*$/, '').replace(/^unite$/, 'parcours').replace(/^revision$/, 'revision'));

  function paint(h, view) {
    const tab = tabOf(h, view), T = TABS[tab];
    document.body.dataset.tab = tab;
    document.querySelectorAll('nav.main a[data-tab]').forEach((a) => { if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    let big = document.querySelector('.xbigk');
    if (!big) { big = document.createElement('div'); big.className = 'xbigk'; big.setAttribute('aria-hidden', 'true'); const m = document.querySelector('main.wrap'); m.insertBefore(big, m.firstChild); }
    big.textContent = T.big; big.lang = 'ja';
    const sec = document.querySelector('main section.view.on');
    if (sec && T.sub && !sec.querySelector(':scope > .xsub')) {
      const cur = SUBOF(h);
      const nav = document.createElement('nav'); nav.className = 'xsub'; nav.setAttribute('aria-label', 'Rubrique ' + T.t);
      nav.innerHTML = T.sub.map(([id, t]) => `<a href="#${id}"${cur === id ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('');
      sec.insertBefore(nav, sec.firstChild);
    }
  }
  const after0 = K.after;
  K.after = function (h, view) { after0.call(K, h, view); try { paint(h, view); remember(h); } catch (e) { console.error(e); } };

  /* ---------- Reprise : la dernière activité d'apprentissage ---------- */
  const LEARN = /^(unite-|revision|entrainer|examens|ecrire|labo|erreurs|vocab|lire|lecture|atelier|redaction|conversation|defi)/;
  function remember(h) {
    if (!LEARN.test(h)) return;
    const sec = document.querySelector('main section.view.on'), h1 = sec && sec.querySelector('h1');
    const T = TABS[tabOf(h, '')], sub = T && T.sub ? (T.sub.find(([id]) => id === SUBOF(h)) || [])[1] : '';
    let title = h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : (sub || T && T.t || h);
    const m = h.match(/^unite-(\d+)/); if (m) title = 'Unité ' + m[1] + (h1 ? ' · ' + title : '');
    const x = K.st(); x.last = { h, t: Date.now(), title: title.slice(0, 90) };
  }
  K.ago = function (t) {
    const m = Math.round((Date.now() - t) / 60000);
    return m < 1 ? 'à l’instant' : m < 60 ? `il y a ${m} min` : `il y a ${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  };

  /* Transition de vue : une seule à la fois, et aucune promesse rejetée laissée sans réponse. */
  let curVT = null;
  function vt(fn) {
    try { if (curVT) curVT.skipTransition(); } catch (e) {}
    const t = document.startViewTransition(fn); curVT = t;
    [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    t.finished.then(() => { if (curVT === t) curVT = null; }, () => { if (curVT === t) curVT = null; });
    return t;
  }

  /* ---------- Jour et nuit : le même izakaya à deux moments ----------
     « Automatique » suit l'heure locale (nuit de 19 h à 7 h) ; la lanterne de l'en-tête force jour ou nuit. */
  const isNightHour = () => { const h = new Date().getHours(); return h >= 19 || h < 7; };
  window.themeOf = function () {
    const t = S.theme || 'auto';
    if (t === 'soir' || t === 'nuit') return 'nuit';
    if (t === 'affiche' || t === 'jour') return 'jour';
    return isNightHour() ? 'nuit' : 'jour';
  };
  const LAMP = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2.5"/><path d="M8.5 4.5h7"/><path d="M7.2 7.5C7.2 6 9.3 4.5 12 4.5s4.8 1.5 4.8 3v8c0 1.5-2.1 3-4.8 3s-4.8-1.5-4.8-3z"/><path d="M7.4 10h9.2M7.4 13.5h9.2"/><path d="M8.5 18.5h7M12 18.5V21"/></svg>';
  function lampLabel() { return document.documentElement.dataset.theme === 'nuit' ? 'Passer à l’ambiance de jour' : 'Passer à l’ambiance de nuit'; }
  function setupHeader() {
    const wrap = document.querySelector('header.top .wrap'); if (!wrap || wrap.querySelector('.hdrtools')) return;
    const tools = document.createElement('div'); tools.className = 'hdrtools';
    ['palbtn', 'focbtn', 'supbtn'].forEach((id) => { const b = document.getElementById(id); if (b) tools.appendChild(b); });
    const lamp = document.createElement('button'); lamp.type = 'button'; lamp.className = 'xlampbtn'; lamp.id = 'xlamp'; lamp.innerHTML = LAMP;
    lamp.setAttribute('aria-label', lampLabel()); lamp.title = lampLabel();
    lamp.onclick = () => {
      S.theme = document.documentElement.dataset.theme === 'nuit' ? 'jour' : 'nuit'; save();
      const go = () => { applyTheme(); lamp.setAttribute('aria-label', lampLabel()); lamp.title = lampLabel(); if (location.hash.replace('#', '') === 'aujourdhui' || !location.hash) route(); };
      if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) vt(go); else go();
    };
    const sup = tools.querySelector('#supbtn'); tools.insertBefore(lamp, sup || null);
    const hud = document.getElementById('hud'); if (hud) tools.appendChild(hud);
    wrap.appendChild(tools);
  }
  setupHeader();
  try { applyTheme(); } catch (e) {}
  setInterval(() => { if ((S.theme || 'auto') === 'auto') { const was = document.documentElement.dataset.theme; applyTheme(); if (was !== document.documentElement.dataset.theme && document.getElementById('v-aujourdhui').classList.contains('on')) route(); } }, 5 * 60e3);

  /* ---------- Mouvement : transitions d'onglet et parallaxe ---------- */
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('nav.main a[href^="#"], .xsub a[href^="#"]');
    if (!a || !document.startViewTransition || calm() || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const to = a.getAttribute('href'); if (to === location.hash) return;
    e.preventDefault();
    vt(() => new Promise((res) => {
      const done = () => requestAnimationFrame(() => res());
      addEventListener('hashchange', done, { once: true }); setTimeout(res, 400);
      location.hash = to;
    }));
  });
  let raf = 0;
  addEventListener('scroll', () => {
    if (raf || calm()) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const op = document.querySelector('#v-aujourdhui.on .xopen');
      if (op) { const y = Math.max(0, Math.min(scrollY, op.offsetHeight));
        op.querySelectorAll('.xopen-type span').forEach((s, i) => { s.style.transform = `translate3d(${(i ? 1 : -1) * y * .12}px, ${y * .28}px, 0)`; });
        const f = op.querySelector('.xopen-fox'); if (f) f.style.transform = `translate3d(0, ${-y * .14}px, 0)`;
        const fd = op.querySelector('.xopen-field'); if (fd) fd.style.transform = `translate3d(0, ${y * .18}px, 0)`; }
      document.querySelectorAll('.xgarden [data-depth]').forEach((l) => {
        const r = l.parentNode.getBoundingClientRect(), off = (innerHeight - r.top) * +l.dataset.depth;
        l.style.transform = `translate3d(0, ${Math.max(0, Math.min(36, 36 - off * .5)).toFixed(1)}px, 0)`;
      });
    });
  }, { passive: true });
  // Largeur de la barre de défilement : les sections pleine largeur (100vw) la retranchent, pour ne jamais déborder.
  const sbw = () => document.documentElement.style.setProperty('--sbw', Math.max(0, innerWidth - document.documentElement.clientWidth) + 'px');
  sbw(); addEventListener('resize', sbw, { passive: true }); new ResizeObserver(sbw).observe(document.body);
  K.shell = { tabOf, TABS };
})();
