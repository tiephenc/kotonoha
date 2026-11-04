/* KOTONOHA · atelier : expression écrite et conversation.
   Honnêteté : les vérifications automatiques portent sur la forme (longueur, registre, ponctuation, points visés,
   mots hors dictionnaire) et ne sont jamais présentées comme une correction. La correction détaillée passe :
   - par Claude si la page tourne dans un artefact claude.ai qui expose window.claude.complete (aucune clé côté site) ;
   - sinon par une consigne prête à copier dans l'assistant ou à remettre à un enseignant, puis à recoller ici. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc, D = window.KX_ATELIER || { sujets: [], scenarios: [] };
  const canAI = () => !!(window.claude && typeof window.claude.complete === 'function');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const pref = { get(k, d) { try { const v = localStorage.getItem('kotonoha.atelier.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('kotonoha.atelier.' + k, JSON.stringify(v)); } catch (e) {} } };
  const redacs = () => K.local.get('redactions', []);
  const saveRedacs = (L) => K.local.set('redactions', L.slice(-200));
  const LV = ['N4', 'N3', 'N2'];
  /* Sujet d'écriture tiré d'une unité : ses points de grammaire deviennent les points visés. */
  function unitSujet(id) {
    const m = /^unite-(\d+)$/.exec(id || ''); if (!m) return null; const n = +m[1], u = UNITS[n]; if (!u || !u.grammar || !u.vocab) return null;
    const cores = [];
    u.grammar.forEach((g) => plain(g.pat).replace(/[（(][^)）]*[)）]/g, '').split(/[\/／・、,\s]+/).forEach((p) => { const c = p.replace(/[〜～…]/g, '').trim(); if (c.length >= 2 && /[ぁ-ん]/.test(c) && !cores.includes(c)) cores.push(c); }));
    const g = cores.slice(0, 3), lv = lvOf(n);
    return { id: 'unite-' + n, lv, t: `Écrire avec l’unité ${n}`, c: `Écrivez un court texte (cinq phrases ou plus) en employant les points de grammaire de l’unité ${n} : ${SYL[n] ? SYL[n].t : ''}.`, g, m: g.map((x) => [x]), u: g.map(() => n), len: lv === 'N4' ? [120, 250] : lv === 'N3' ? [200, 400] : [300, 600] };
  }
  const sujetOf = (id) => D.sujets.find((s) => s.id === id) || unitSujet(id);

  /* ---------- Vérifications locales ---------- */
  const POLI = /(です|ます|ました|ません|でした|ましょう|ませんでした|ください|でしょう)$/;
  const NEUTRE = /(だ|である|だった|ではない|じゃない|った|いた|えた|んだ|のだ|だろう|ない|なかった|[うくすつぬぶむるぐ]|い)$/;
  function endings(text) {
    const S2 = plain(text).split(/[。！？!?\n]+/).map((s) => s.trim().replace(/[」』）)\s]+$/, '').replace(/(よね|ね|よ|か|な|けど|が)$/, '')).filter((s) => s.length > 1);
    let p = 0, n = 0; S2.forEach((s) => { if (POLI.test(s)) p++; else if (NEUTRE.test(s)) n++; });
    return { p, n, total: S2.length };
  }
  function unitFor(pat) {
    for (const n of Object.keys(UNITS)) { const u = UNITS[n]; if (u.grammar && u.grammar.some((g) => plain(g.pat).includes(pat))) return n; }
    return null;
  }
  function checks(text, suj) {
    const out = [], P = plain(text), len = P.replace(/\s/g, '').length;
    if (suj && suj.len) out.push({ k: len < suj.len[0] ? 'info' : 'ok', t: `Longueur : ${len} caractères (objectif ${suj.len[0]} à ${suj.len[1]}).` });
    const e = endings(text);
    if (e.p && e.n) out.push({ k: 'style', t: `Registre : ${e.p} phrase${e.p > 1 ? 's' : ''} en です・ます et ${e.n} en forme neutre. Dans un texte suivi, on garde en général un seul registre (sauf citation).` });
    else if (e.total) out.push({ k: 'ok', t: `Registre homogène : ${e.p ? 'です・ます' : 'forme neutre'}.` });
    if (/[ぁ-んァ-ン一-鿿][,.](?!\d)/.test(P)) out.push({ k: 'style', t: 'Ponctuation : en japonais, on écrit 、 et 。 plutôt que la virgule et le point latins.' });
    if (/[ぁ-んァ-ン一-鿿][!?]/.test(P)) out.push({ k: 'style', t: 'Ponctuation : préférez ！ et ？ (pleine chasse) dans un texte japonais.' });
    if (/[ぁ-んァ-ン一-鿿] +[ぁ-んァ-ン一-鿿]/.test(P)) out.push({ k: 'style', t: 'Espaces : le japonais s’écrit sans espace entre les mots.' });
    const dup = P.match(/([をがはにでへと])\1/); if (dup) out.push({ k: 'typo', t: `Particule doublée : « ${dup[0]} » (faute de frappe ?).` });
    if (len > 20 && !/[。！？!?]\s*$/.test(P.trim())) out.push({ k: 'style', t: 'La dernière phrase ne se termine pas par 。.' });
    if (suj && suj.g) suj.g.forEach((g, i) => { const hit = ((suj.m && suj.m[i]) || [g]).some((x) => P.includes(x)); out.push({ k: hit ? 'ok' : 'info', t: `Point visé « 〜${g} » : ${hit ? 'utilisé' : 'pas encore utilisé'}.` }); });
    if (K.lecture && len) {
      const a = K.lecture.analyse(text), off = a.words.filter((w) => !w.lv).map((w) => w.w);
      if (off.length) out.push({ k: 'info', t: `Mots absents du dictionnaire du site (à vérifier : orthographe, mot rare ou nom propre) : ${off.slice(0, 12).join('、')}${off.length > 12 ? '…' : ''}` });
      const kr = [...P].filter((c) => /[一-鿿]/.test(c)).length / Math.max(1, len);
      out.push({ k: 'info', t: `Kanji : ${Math.round(kr * 100)} % des caractères.` });
    }
    return out;
  }
  const BADGE = { ok: ['✓', 'Vérifié'], info: ['i', 'Information'], style: ['≈', 'Style'], typo: ['!', 'À vérifier'] };
  const checksHtml = (L) => `<ul class="xchecks">${L.map((c) => `<li class="c-${c.k}"><span class="b" aria-label="${BADGE[c.k][1]}">${BADGE[c.k][0]}</span>${esc(c.t)}</li>`).join('')}</ul>
    <p class="small muted">Vérifications automatiques de la forme uniquement : elles ne corrigent ni la grammaire ni le sens.</p>`;

  function correctionPrompt(text, suj, lv) {
    return `Tu es professeur de japonais pour des francophones. Corrige ce texte écrit par un apprenant de niveau JLPT ${lv}.
${suj ? `Sujet : ${suj.t} — ${suj.c}${suj.g ? ` (points visés : ${suj.g.map((g) => '〜' + g).join(', ')})` : ''}\n` : ''}
Règles :
1. Distingue clairement les ERREURS (grammaire, particules, conjugaison, vocabulaire, kanji, registre incohérent) des VARIANTES STYLISTIQUES acceptables. Ne présente jamais une variante acceptable comme une faute, et n'invente pas d'erreur.
2. Pour chaque erreur : l'extrait fautif, la correction, une explication courte en français.
3. Propose ensuite une version complète reformulée de façon naturelle, au même niveau.
4. Termine par deux ou trois points réussis.
Réponds en français (exemples en japonais).

Texte :
${text}`;
  }

  /* ---------- Vues : atelier (hub) ---------- */
  function renderHub(el) {
    const R = redacs().slice().reverse(), lv = curLv();
    el.innerHTML = `<div class="eyebrow">S’entraîner</div><h1>Atelier</h1>
      <p class="muted">Produire du japonais : écrire sur un sujet, puis le faire corriger ; converser dans des situations réelles, avec des explications après les échanges.</p>
      <h2 class="xh2">Écrire</h2>
      ${LV.map((L) => `<details class="card panel xread"${L === lv ? ' open' : ''}><summary><h2><span class="tag">${L}</span> Sujets</h2></summary>
        <div class="xsujets">${D.sujets.filter((s) => s.lv === L).map((s) => `<a class="xsujet" href="#redaction-${s.id}"><b>${esc(s.t)}</b><span class="small muted">${esc(s.c)}</span><span class="small">${s.len[0]}–${s.len[1]} caractères · ${s.g.map((g) => '〜' + esc(g)).join(' · ')}</span></a>`).join('')}</div></details>`).join('')}
      <p><a class="btn sec" href="#redaction-libre">Écrire librement</a></p>
      <div class="card panel"><h2>Mes productions</h2>${R.length ? `<ul class="xhist">${R.slice(0, 40).map((r) => `<li><a href="#redaction-${esc(r.sujet || 'libre')}~${esc(r.id)}"><b>${esc(r.titre)}</b></a> <span class="small muted">${new Date(r.at).toLocaleDateString('fr-FR')} · ${+r.len || 0} caractères${r.corr ? ' · corrigée' : ''}</span></li>`).join('')}</ul>` : '<p class="small muted">Aucune production enregistrée.</p>'}</div>
      <h2 class="xh2">Converser</h2>
      <div class="xsujets">${D.scenarios.map((s) => `<a class="xsujet" href="#conversation-${s.id}"><b>${esc(s.t)}</b><span class="small muted">${esc(s.role)}</span><span class="small"><span class="tag">${s.lv}</span> ${esc(s.cat)} · registre ${esc(s.reg)}</span></a>`).join('')}</div>
      <div class="card panel"><h2>Conversation libre</h2>
        ${canAI() ? '<p>Discutez librement avec Claude, à votre niveau ; corrections à la fin si vous le souhaitez.</p><a class="btn" href="#conversation-libre">Commencer</a>'
        : `<p class="small muted">La conversation libre demande un assistant conversationnel. KOTONOHA n’en embarque pas (aucune clé d’API dans le site). Vous pouvez préparer une consigne de jeu de rôle et la coller dans l’assistant de votre choix.</p>
          <form id="xrp" class="xform"><div class="xrow"><label>Niveau<select name="lv">${LV.map((L) => `<option${L === lv ? ' selected' : ''}>${L}</option>`).join('')}</select></label><label>Situation<input name="sit" maxlength="120" placeholder="Ex. : au guichet d’une gare" required></label></div>
          <button class="btn sec" type="submit">Préparer la consigne</button></form><div id="xrpout"></div>`}</div>`;
    const f = el.querySelector('#xrp');
    if (f) f.onsubmit = (e) => {
      e.preventDefault(); const d = new FormData(f);
      const p = `Joue avec moi un jeu de rôle en japonais. Situation : ${d.get('sit')}. Mon niveau : JLPT ${d.get('lv')}. Parle uniquement en japonais adapté à ce niveau, une réplique courte à la fois, et attends ma réponse. Ne me corrige pas pendant l'échange. Quand j'écris « おわり », arrête et donne en français : mes erreurs réelles (avec correction et explication), les tournures maladroites mais acceptables, et des formulations plus naturelles.`;
      el.querySelector('#xrpout').innerHTML = `<textarea readonly rows="6" class="xprompt">${esc(p)}</textarea><div class="toolbar"><button class="btn" type="button" id="xrpc">Copier la consigne</button><span class="small muted" role="status" id="xrpm"></span></div>`;
      el.querySelector('#xrpc').onclick = () => copy(p, el.querySelector('#xrpm'));
    };
  }
  async function copy(t, msg) { try { await navigator.clipboard.writeText(t); msg.textContent = 'Copiée.'; } catch (e) { msg.textContent = 'Copie impossible ici : sélectionnez le texte et copiez-le.'; } }

  /* ---------- Rédaction ---------- */
  function renderRedaction(el, h) {
    const [sid, rid] = h.slice(10).split('~');
    const suj = sujetOf(sid) || null;
    const L = redacs(); const prev = rid ? L.find((r) => r.id === rid) : null;
    const draftKey = 'brouillon-' + (suj ? suj.id : 'libre');
    const lv = suj ? suj.lv : curLv();
    const text0 = prev ? prev.texte : K.local.get(draftKey, '');
    const aides = suj ? suj.g.map((g, i) => { const n = (suj.u && suj.u[i]) || unitFor(g); return `<li>〜${esc(g)}${n ? ` · <a href="#unite-${n}">unité ${n}</a>` : ''}</li>`; }).join('') : '';
    el.innerHTML = `<a class="back-link" href="#atelier">Retour à l’atelier</a>
      <div class="eyebrow">Écrire · ${lv}</div><h1>${esc(suj ? suj.t : prev ? prev.titre : 'Texte libre')}</h1>
      ${suj ? `<p class="muted">${esc(suj.c)}</p>` : '<p class="muted">Écrivez sur le sujet de votre choix.</p>'}
      ${suj ? `<details class="card panel"><summary>Aide facultative</summary><p class="small">Points de grammaire à essayer :</p><ul class="small">${aides}</ul>
        <p class="small muted">Registre conseillé : ${lv === 'N2' ? 'forme neutre (だ・である) pour un texte argumenté, ou です・ます, mais un seul des deux' : 'です・ます, du début à la fin'}.</p></details>` : ''}
      <div class="card panel">
        ${!suj && !prev ? '<label class="xlab">Titre<input id="xtitre" maxlength="80" placeholder="Titre de votre texte"></label>' : ''}
        <label class="xlab">Votre texte<textarea id="xtxt" rows="10" lang="ja" maxlength="4000" spellcheck="false">${esc(text0)}</textarea></label>
        <p class="small muted" id="xcount" aria-live="polite"></p>
        <div class="toolbar"><button class="btn" id="xchk" type="button">Vérifier la forme</button><button class="btn sec" id="xsav" type="button">${prev ? 'Mettre à jour' : 'Enregistrer'}</button><span class="small muted" id="xmsg" role="status"></span></div>
        <div id="xres"></div></div>
      <div class="card panel"><h2>Correction détaillée</h2>
        ${canAI() ? '<p class="small muted">Correction par Claude : erreurs réelles distinguées des variantes stylistiques, reformulation naturelle, explications.</p><button class="btn" id="xai" type="button">Demander la correction</button>'
        : '<p class="small muted">KOTONOHA n’embarque pas de correcteur automatique (aucune clé d’API dans le site). Copiez la consigne ci-dessous dans un assistant IA ou remettez le texte à un enseignant, puis collez la correction reçue pour la garder avec votre texte.</p><button class="btn sec" id="xprm" type="button">Préparer la consigne de correction</button><div id="xprmout"></div>'}
        <label class="xlab">Correction reçue<textarea id="xcorr" rows="8" maxlength="12000">${esc(prev && prev.corr ? prev.corr : '')}</textarea></label>
        <div class="toolbar"><button class="btn sec" id="xsavc" type="button">Enregistrer la correction</button><span class="small muted" id="xmsg2" role="status"></span></div></div>`;
    const ta = el.querySelector('#xtxt'), count = el.querySelector('#xcount');
    const upd = () => { const n = plain(ta.value).replace(/\s/g, '').length; count.textContent = `${n} caractères${suj ? ` · objectif ${suj.len[0]} à ${suj.len[1]}` : ''}`; };
    upd();
    let dt; ta.oninput = () => { upd(); clearTimeout(dt); if (!prev) dt = setTimeout(() => K.local.set(draftKey, ta.value), 600); };
    el.querySelector('#xchk').onclick = () => { el.querySelector('#xres').innerHTML = ta.value.trim() ? checksHtml(checks(ta.value, suj)) : '<p class="small">Écrivez d’abord quelques phrases.</p>'; };
    let cur = prev ? prev.id : null;
    function store(extra) {
      const text = ta.value.trim(); if (!text) { el.querySelector('#xmsg').textContent = 'Le texte est vide.'; return null; }
      const L2 = redacs(); let r = cur ? L2.find((x) => x.id === cur) : null;
      const titre = suj ? suj.t : (el.querySelector('#xtitre') && el.querySelector('#xtitre').value.trim()) || (prev && prev.titre) || 'Texte libre';
      if (!r) { r = { id: K.uid(), sujet: suj ? suj.id : 'libre', titre, lv, at: Date.now() }; L2.push(r); cur = r.id; }
      Object.assign(r, { texte: text, len: plain(text).replace(/\s/g, '').length, maj: Date.now() }, extra || {});
      saveRedacs(L2); if (!prev) K.local.set(draftKey, '');
      return r;
    }
    el.querySelector('#xsav').onclick = () => { if (store()) el.querySelector('#xmsg').textContent = 'Enregistré dans « Mes productions ».'; };
    el.querySelector('#xsavc').onclick = () => { const c = el.querySelector('#xcorr').value.trim(); if (!c) { el.querySelector('#xmsg2').textContent = 'Collez d’abord la correction.'; return; } if (store({ corr: c })) el.querySelector('#xmsg2').textContent = 'Correction enregistrée avec le texte.'; };
    const pb = el.querySelector('#xprm');
    if (pb) pb.onclick = () => {
      if (!ta.value.trim()) { el.querySelector('#xprmout').innerHTML = '<p class="small">Écrivez d’abord votre texte.</p>'; return; }
      const p = correctionPrompt(ta.value.trim(), suj, lv);
      el.querySelector('#xprmout').innerHTML = `<textarea readonly rows="8" class="xprompt">${esc(p)}</textarea><div class="toolbar"><button class="btn" type="button" id="xcp">Copier</button><span class="small muted" id="xcpm" role="status"></span></div>`;
      el.querySelector('#xcp').onclick = () => copy(p, el.querySelector('#xcpm'));
    };
    const ai = el.querySelector('#xai');
    if (ai) ai.onclick = async () => {
      if (!ta.value.trim()) return; ai.disabled = true; ai.textContent = 'Correction en cours…';
      try { const r = await window.claude.complete(correctionPrompt(ta.value.trim(), suj, lv)); el.querySelector('#xcorr').value = String(r || '').slice(0, 12000); store({ corr: el.querySelector('#xcorr').value, via: 'claude' }); el.querySelector('#xmsg2').textContent = 'Correction reçue et enregistrée.'; }
      catch (e) { el.querySelector('#xmsg2').textContent = 'La correction n’a pas pu être obtenue. Réessayez plus tard.'; }
      ai.disabled = false; ai.textContent = 'Demander la correction';
    };
  }

  /* ---------- Conversation guidée ---------- */
  const STAT = { ok: ['Naturel', 'ok'], mid: ['Possible, mais…', 'mid'], no: ['À revoir', 'no'] };
  function shuffled(arr, seed) { const a = arr.map((x, i) => [x, i]); let s = seed; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const polite = (t) => { const e = endings(t); return e.p > 0 && e.n === 0 ? 'poli' : e.n > 0 && e.p === 0 ? 'neutre' : e.p && e.n ? 'mixte' : null; };
  function renderConversation(el, h) {
    const sc = D.scenarios.find((s) => 'conversation-' + s.id === h);
    const C = { i: 0, picks: [], mode: pref.get('mode', 'guide'), expl: pref.get('expl', true), tts: pref.get('tts', false), seed: Date.now() % 233280 };
    el.innerHTML = `<a class="back-link" href="#atelier">Retour à l’atelier</a>
      <div class="eyebrow">Converser · <span class="tag">${sc.lv}</span> ${esc(sc.cat)} · registre ${esc(sc.reg)}</div><h1>${esc(sc.t)}</h1>
      <p class="muted">${esc(sc.role)}</p>
      <div class="toolbar xconvopts">
        <div class="seg" role="group" aria-label="Mode"><button type="button" data-m="guide" aria-pressed="${C.mode === 'guide'}">Réponses proposées</button><button type="button" data-m="libre" aria-pressed="${C.mode === 'libre'}">Réponse libre</button></div>
        <label class="chk small"><input type="checkbox" id="xexpl" ${C.expl ? 'checked' : ''}> Explications après chaque réplique</label>
        <label class="chk small"><input type="checkbox" id="xtts" ${C.tts ? 'checked' : ''}> Lire les répliques à voix haute</label>
      </div>
      <div class="xchat" id="xchat" aria-live="polite"></div><div id="xact"></div>`;
    const chat = el.querySelector('#xchat'), act = el.querySelector('#xact');
    el.querySelectorAll('[data-m]').forEach((b) => b.onclick = () => { C.mode = b.dataset.m; pref.set('mode', C.mode); el.querySelectorAll('[data-m]').forEach((x) => x.setAttribute('aria-pressed', x === b)); if (C.i < sc.turns.length) actions(); });
    el.querySelector('#xexpl').onchange = (e) => { C.expl = e.target.checked; pref.set('expl', C.expl); };
    el.querySelector('#xtts').onchange = (e) => { C.tts = e.target.checked; pref.set('tts', C.tts); };
    function bubble(who, html, cls = '') { const d = document.createElement('div'); d.className = 'xb ' + who + ' ' + cls; d.innerHTML = html; chat.appendChild(d); d.scrollIntoView({ block: 'nearest', behavior: K.reduced() ? 'auto' : 'smooth' }); return d; }
    function partner() {
      const t = sc.turns[C.i];
      bubble('them', `<span class="who">${ruby(t.p)}</span><span class="jp">${rubyW(t.l)}</span><button type="button" class="btn-ghost small xsay" aria-label="Écouter la réplique">Écouter</button>`).querySelector('.xsay').onclick = () => sayText(t.l);
      if (C.tts && typeof sayText === 'function') sayText(t.l);
      actions();
    }
    function actions() {
      const t = sc.turns[C.i];
      if (C.mode === 'guide') {
        act.innerHTML = `<div class="xopts" role="group" aria-label="Choisissez votre réponse">${shuffled(t.o, C.seed + C.i).map(([o, i]) => `<button type="button" class="xopt" data-i="${i}" lang="ja">${ruby(o[0])}</button>`).join('')}</div>`;
        act.querySelectorAll('.xopt').forEach((b) => b.onclick = () => answer(+b.dataset.i));
        act.querySelector('.xopt').focus({ preventScroll: true });
      } else {
        act.innerHTML = `<form class="xfree"><label class="xlab">Votre réponse (en japonais)<textarea rows="2" lang="ja" maxlength="400" required></textarea></label>
          <div class="toolbar"><button class="btn" type="submit">Répondre</button>${SR ? '<button type="button" class="btn sec xmic" aria-pressed="false">Dicter</button>' : ''}</div>
          ${SR ? '<p class="small muted">La dictée utilise la reconnaissance vocale du navigateur ; selon le navigateur, l’audio peut être envoyé à son éditeur (Google pour Chrome).</p>' : ''}</form>`;
        const f = act.querySelector('form'), ta = f.querySelector('textarea');
        f.onsubmit = (e) => { e.preventDefault(); const v = ta.value.trim(); if (v) answerFree(v); };
        const mic = act.querySelector('.xmic');
        if (mic) mic.onclick = () => {
          try { const r = new SR(); r.lang = 'ja-JP'; r.interimResults = false; mic.setAttribute('aria-pressed', 'true'); mic.textContent = 'Écoute…';
            r.onresult = (e) => { ta.value += e.results[0][0].transcript; }; r.onend = () => { mic.setAttribute('aria-pressed', 'false'); mic.textContent = 'Dicter'; }; r.onerror = r.onend; r.start(); }
          catch (e) { mic.textContent = 'Dictée indisponible'; mic.disabled = true; }
        };
        ta.focus({ preventScroll: true });
      }
    }
    function answer(i) {
      const t = sc.turns[C.i], o = t.o[i]; C.picks.push({ i, free: null });
      const fb = C.expl ? `<span class="xfb s-${o[1]}"><b>${STAT[o[1]][0]}</b> ${esc(o[2])}</span>` : '';
      bubble('me', `<span class="jp">${ruby(o[0])}</span>${fb}`, 's-' + o[1]);
      next();
    }
    function answerFree(v) {
      const t = sc.turns[C.i]; C.picks.push({ i: null, free: v });
      const want = /poli/.test(sc.reg) ? 'poli' : 'neutre', got = polite(v);
      const note = got && got !== want && got !== null ? `<span class="xfb s-mid">Registre : ${got === 'mixte' ? 'mélange de formes polies et neutres' : got === 'poli' ? 'forme polie' : 'forme neutre'} ; la situation demande plutôt ${want === 'poli' ? 'la forme polie (です・ます)' : 'la forme neutre, entre amis'}.</span>` : '';
      const sugg = C.expl ? `<span class="xfb s-ok">Réponses naturelles possibles : ${t.o.filter((o) => o[1] === 'ok').map((o) => `<span class="jp">${ruby(o[0])}</span>`).join(' ／ ')}</span>` : '';
      bubble('me', `<span class="jp">${esc(v)}</span>${note}${sugg}`);
      next();
    }
    function next() { C.i++; act.innerHTML = ''; if (C.i < sc.turns.length) setTimeout(partner, K.reduced() ? 0 : 450); else end(); }
    function end() {
      const L = K.local.get('conversations', []); L.push({ id: K.uid(), sc: sc.id, at: Date.now(), mode: C.mode, picks: C.picks.map((p) => p.free != null ? { free: p.free.slice(0, 400) } : { i: p.i }) }); K.local.set('conversations', L.slice(-200));
      act.innerHTML = `<div class="card panel xrecap"><h2>Bilan de l’échange</h2>
        <ol>${sc.turns.map((t, k) => { const p = C.picks[k] || {}; const o = p.i != null ? t.o[p.i] : null;
          return `<li><p class="jp small">${ruby(t.l)}</p><p>Vous : <span class="jp">${o ? ruby(o[0]) : esc(p.free || '—')}</span>${o ? ` <span class="xfb s-${o[1]}"><b>${STAT[o[1]][0]}</b> ${esc(o[2])}</span>` : ''}</p>
            <p class="small">Possibles : ${t.o.filter((x) => x[1] === 'ok').map((x) => `<span class="jp">${ruby(x[0])}</span>`).join(' ／ ')}</p>
            <details class="small"><summary>Toutes les explications</summary><ul>${t.o.map((x) => `<li><span class="jp">${ruby(x[0])}</span> — <b>${STAT[x[1]][0]}</b> ${esc(x[2])}</li>`).join('')}</ul></details></li>`; }).join('')}</ol>
        <h3>Expressions utiles</h3><ul class="small">${sc.expr.map(([j, f]) => `<li><span class="jp">${ruby(j)}</span> : ${esc(f)}</li>`).join('')}</ul>
        <div class="toolbar"><button class="btn" type="button" id="xagain">Rejouer</button><a class="btn sec" href="#atelier">Retour à l’atelier</a></div></div>`;
      act.querySelector('#xagain').onclick = () => renderConversation(el, h);
    }
    partner();
  }

  /* ---------- Conversation libre (seulement si window.claude.complete existe) ---------- */
  function renderLibre(el) {
    if (!canAI()) { el.innerHTML = '<a class="back-link" href="#atelier">Retour à l’atelier</a><h1>Conversation libre</h1><p class="muted">Indisponible ici : cette fonction n’existe que lorsque KOTONOHA tourne dans un artefact claude.ai. Utilisez la consigne de jeu de rôle depuis l’atelier.</p>'; return; }
    const lv = curLv(), H = [];
    el.innerHTML = `<a class="back-link" href="#atelier">Retour à l’atelier</a><div class="eyebrow">Converser · ${lv}</div><h1>Conversation libre</h1>
      <p class="muted">Écrivez en japonais. Les corrections viennent à la fin, sur demande.</p>
      <div class="xchat" id="xchat" aria-live="polite"></div>
      <form class="xfree"><label class="xlab">Votre message<textarea rows="2" lang="ja" maxlength="400" required></textarea></label><div class="toolbar"><button class="btn" type="submit">Envoyer</button><button class="btn sec" type="button" id="xfin">Terminer et corriger</button></div></form>`;
    const chat = el.querySelector('#xchat'), f = el.querySelector('form'), ta = f.querySelector('textarea');
    const add = (who, t) => { const d = document.createElement('div'); d.className = 'xb ' + who; d.innerHTML = `<span class="jp">${esc(t)}</span>`; chat.appendChild(d); d.scrollIntoView({ block: 'nearest' }); };
    const sys = `Tu es un partenaire de conversation japonais bienveillant. Niveau de l'apprenant : JLPT ${lv}. Réponds uniquement en japonais simple adapté à ce niveau, en une ou deux phrases, et pose une question pour relancer. Ne corrige pas pendant l'échange.`;
    f.onsubmit = async (e) => {
      e.preventDefault(); const v = ta.value.trim(); if (!v) return; ta.value = ''; add('me', v); H.push(['Apprenant', v]);
      try { const r = await window.claude.complete(`${sys}\n\nÉchange :\n${H.map(([w, t]) => w + ' : ' + t).join('\n')}\nPartenaire :`); H.push(['Partenaire', String(r).trim()]); add('them', String(r).trim()); }
      catch (x) { add('them', '（応答を取得できませんでした）'); }
    };
    el.querySelector('#xfin').onclick = async () => {
      if (!H.length) return;
      try { const r = await window.claude.complete(`Voici un échange en japonais entre un apprenant (JLPT ${lv}) et un partenaire.\n${H.map(([w, t]) => w + ' : ' + t).join('\n')}\n\nEn français : liste les erreurs réelles de l'apprenant (extrait, correction, explication), puis les tournures acceptables mais améliorables, sans inventer d'erreur.`); add('them', String(r)); }
      catch (x) { add('them', 'Correction indisponible pour le moment.'); }
    };
  }

  K.view({ name: 'atelier', title: 'Atelier', nav: 'entrainer', match: (h) => h === 'atelier', render: renderHub });
  K.view({ name: 'redaction', title: 'Écrire', nav: 'entrainer', match: (h) => /^redaction-[a-z0-9-]+(~[a-z0-9]+)?$/.test(h) && (h.slice(10).split('~')[0] === 'libre' || !!sujetOf(h.slice(10).split('~')[0])), render: renderRedaction });
  K.view({ name: 'conversation', title: 'Converser', nav: 'entrainer', match: (h) => D.scenarios.some((s) => h === 'conversation-' + s.id), render: renderConversation });
  K.view({ name: 'conversation-libre', title: 'Conversation libre', nav: 'entrainer', match: (h) => h === 'conversation-libre', render: renderLibre });
  K.on('entrainer', (el) => {
    const n = redacs().length;
    K.tile(el, { id: 'atelier', href: '#atelier', kj: '話', title: 'Atelier', text: `Écrire sur un sujet et converser en situation, avec explications.${n ? ` ${n} production${n > 1 ? 's' : ''}.` : ''}` });
  });
  K.atelier = { checks, endings, correctionPrompt };
})();
