/* KOTONOHA · espace Lire : textes du parcours, lectures personnelles et actualités.
   - Les textes du parcours (UNITS[n].reading, 157 unités) restent dans les unités ; cet espace les recense.
   - « Mes lectures » : l'apprenant colle un extrait qu'il lit (article, page…) avec sa source et sa date.
     Le texte reste sur l'appareil (KX.local) : rien n'est republié. Le dictionnaire du site (linkW/rubyW
     de index.html : correspondance la plus longue, déflexion, segmentation ICU) rend chaque mot cliquable.
   - Aucune question n'est inventée pour un texte externe : des questions-guides génériques et un résumé personnel. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const MAXLEN = 8000;
  const SOURCES = [
    { name: 'NHK NEWS WEB EASY', url: 'https://www3.nhk.or.jp/news/easy/', lv: 'N4–N3', note: 'Actualités réécrites en japonais simple, avec furigana, par la NHK.' },
    { name: 'MATCHA やさしい日本語', url: 'https://matcha-jp.com/easy', lv: 'N4–N3', note: 'Culture et voyage au Japon, en japonais simple avec furigana.' },
    { name: 'NHK NEWS WEB', url: 'https://www3.nhk.or.jp/news/', lv: 'N2 et plus', note: 'Actualités générales de la NHK, japonais standard.' },
  ];
  const lectures = () => K.local.get('lectures', []);
  const saveLectures = (L) => { if (!K.local.set('lectures', L)) K.toast('Espace de stockage plein : exportez puis supprimez d’anciennes lectures.'); };

  /* ---------- Analyse d'un texte ---------- */
  function analyse(text) {
    dic();
    WREG.length = 0;
    const linked = linkW(text);
    const words = [], seen = new Set();
    linked.replace(/\u0001(\d+)\u0002([^\u0003]*)\u0003/g, (a, i, surf) => { const w = WREG[+i]; if (!seen.has(w)) { seen.add(w); words.push({ w, surf: plain(surf) }); } return a; });
    const kanji = [...new Set([...plain(text)].filter((c) => /[一-鿿々]/.test(c)))];
    const lvOfWord = (w) => {
      const es = DIC.get(w) || [];
      const v = es.find((e) => e.k === 'v'); if (v) return lvOf(v.u);
      const c = es.find((e) => e.k === 'c'); if (c) return c.corpus === 'jm' ? 'fréq.' : 'Core';
      const a = es.find((e) => e.k === 'a'); if (a) return a.deck;
      return null;
    };
    words.forEach((x) => { x.lv = lvOfWord(x.w); x.es = (DIC.get(x.w) || []).slice(0, 2); const s = x.es.find((e) => e.id && S.srs[e.id]); x.known = !!(s && isSeen(S.srs[s.id])) || !!(S.mots && S.mots['m:' + x.w]); });
    const knownK = (c) => N5K.has(c) || (KJ.get(c) && S.srs[KJ.get(c).id] && isSeen(S.srs[KJ.get(c).id]));
    const kInfo = kanji.map((c) => ({ c, known: knownK(c), info: KJ.get(c) || null }));
    // Estimation : part de vocabulaire N2/inconnu et de kanji hors des unités. Indicative.
    const n = words.length || 1;
    const hard = words.filter((x) => x.lv === 'N2' || x.lv === 'fréq.' || x.lv === null).length / n;
    const mid = words.filter((x) => x.lv === 'N3').length / n;
    const kOut = kInfo.length ? kInfo.filter((k) => !k.info && !N5K.has(k.c)).length / kInfo.length : 0;
    const score = hard * 0.6 + kOut * 0.3 + mid * 0.1;
    const est = !words.length ? '—' : score < 0.18 ? 'N4 environ' : score < 0.32 ? 'N3 environ' : 'N2 ou plus';
    return { words, kInfo, est, chars: plain(text).replace(/\s/g, '').length };
  }

  /* ---------- Vues ---------- */
  function regularWithReading(lv) { return regularOf(lv).filter((n) => UNITS[n] && UNITS[n].reading); }
  function renderHub(el) {
    const L = lectures().slice().sort((a, b) => b.added - a.added);
    const lvBlock = (lv) => {
      const U = regularWithReading(lv), done = U.filter((n) => S.units[n] && S.units[n].done && S.units[n].done.lecture).length;
      return `<details class="card panel xread"${lv === curLv() ? ' open' : ''}><summary><h2><span class="tag">${lv}</span> ${U.length} textes · ${done} lu${done > 1 ? 's' : ''}</h2></summary>
        <ol class="xtexts">${U.map((n) => { const r = UNITS[n].reading, d = S.units[n] && S.units[n].done && S.units[n].done.lecture;
          return `<li${d ? ' class="done"' : ''}><a href="#unite-${n}/lecture"><span class="jp">${ruby(r.title)}</span><small>Unité ${n} · ${r.qs ? r.qs.length : 0} question${r.qs && r.qs.length > 1 ? 's' : ''}${d ? ' · lu' : ''}</small></a></li>`; }).join('')}</ol></details>`;
    };
    el.innerHTML = `<div class="eyebrow">S’entraîner</div><h1>Lire</h1>
      <p class="muted">Les textes du parcours, gradués du N4 au N2, avec questions et corrections ; et vos propres lectures (actualités, articles, pages), analysées par le dictionnaire du site.</p>
      <div class="grid2">
        <div class="card panel"><h2>Ajouter une lecture</h2>
          <form id="xlf" class="xform">
            <label>Titre<input name="title" required maxlength="120" placeholder="Ex. : 桜の開花、平年より早く"></label>
            <div class="xrow"><label>Source<input name="source" maxlength="80" placeholder="Ex. : NHK NEWS WEB EASY"></label><label>Date de publication<input type="date" name="pub"></label></div>
            <label>Adresse (facultative)<input type="url" name="url" maxlength="400" placeholder="https://…"></label>
            <label>Texte japonais (extrait, ${MAXLEN} caractères au plus)<textarea name="text" required maxlength="${MAXLEN}" rows="7" lang="ja"></textarea></label>
            <label class="chk"><input type="checkbox" name="news"> C’est une actualité</label>
            <button class="btn" type="submit">Analyser et lire</button>
            <p class="small muted">Le texte reste sur cet appareil (inclus dans l’export de vos données). Ne republiez pas d’articles protégés : gardez des extraits pour votre étude.</p>
          </form></div>
        <div class="card panel"><h2>Actualités en japonais</h2>
          <ul class="xsrc">${SOURCES.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a> <span class="tag">${esc(s.lv)}</span><br><span class="small muted">${esc(s.note)}</span></li>`).join('')}</ul>
          <p class="small muted">Ouvrez une source, choisissez un article, copiez un extrait et collez-le ici avec la source et la date. KOTONOHA ne récupère ni ne republie aucun article.</p></div>
      </div>
      <div class="card panel"><h2>Mes lectures</h2>${L.length ? `<ul class="xhist">${L.map((x) => `<li><a href="#lire-${esc(x.id)}"><b lang="ja">${esc(x.title)}</b></a> <span class="small muted">${x.news ? 'Actualité · ' : ''}${esc(x.source || 'source non précisée')}${x.pub ? ' · publié le ' + new Date(x.pub + 'T00:00:00').toLocaleDateString('fr-FR') : ''} · ${esc(x.est || '')} · ${+x.reads || 0} lecture${(+x.reads || 0) > 1 ? 's' : ''}</span></li>`).join('')}</ul>` : '<p class="small muted">Aucune lecture personnelle pour l’instant.</p>'}</div>
      <h2 class="xh2">Textes du parcours</h2>${['N4', 'N3', 'N2'].map(lvBlock).join('')}`;
    el.querySelector('#xlf').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target), text = String(f.get('text') || '').slice(0, MAXLEN).trim();
      if (!/[ぁ-んァ-ン一-鿿]/.test(text)) { K.toast('Le texte ne contient pas de japonais.'); return; }
      let url = String(f.get('url') || '').trim();
      if (url && !/^https?:\/\//i.test(url)) { K.toast('L’adresse doit commencer par https://'); return; }
      const a = analyse(text);
      const x = { id: K.uid(), title: String(f.get('title')).slice(0, 120), source: String(f.get('source') || '').slice(0, 80), url, pub: String(f.get('pub') || ''), news: !!f.get('news'), text, added: Date.now(), est: a.est, reads: 0, summary: '', notes: '' };
      const L2 = lectures(); L2.push(x); saveLectures(L2);
      location.hash = '#lire-' + x.id;
    };
  }

  const GUIDE = [['誰{だれ}が？', 'Qui ?'], ['何{なに}を？', 'Quoi ?'], ['いつ？', 'Quand ?'], ['どこで？', 'Où ?'], ['なぜ？', 'Pourquoi ?'], ['どうなる？', 'Et ensuite ?']];
  function renderReader(el, h) {
    const id = h.slice(5), L = lectures(), x = L.find((y) => y.id === id);
    if (!x) { el.innerHTML = '<h1>Lecture introuvable</h1><p><a href="#lire">Retour à Lire</a></p>'; return; }
    x.reads = (x.reads || 0) + 1; x.last = Date.now(); saveLectures(L);
    const a = analyse(x.text);
    const paras = x.text.split(/\n\s*\n|\n/).filter((p) => p.trim());
    const unknownFirst = a.words.slice().sort((p, q) => (p.known - q.known));
    el.innerHTML = `<a class="back-link" href="#lire">Retour à Lire</a>
      <div class="eyebrow">${x.news ? 'Actualité' : 'Lecture'} · ${esc(x.source || 'source non précisée')}${x.pub ? ' · publié le ' + new Date(x.pub + 'T00:00:00').toLocaleDateString('fr-FR') : ''}</div>
      <h1 class="xrtitle" lang="ja">${esc(x.title)}</h1>
      <div class="xstats"><div><b>${esc(a.est)}</b><span>niveau estimé (indicatif, d’après le vocabulaire reconnu)</span></div><div><b>${a.chars}</b><span>caractères</span></div><div><b>${a.words.length}</b><span>mots reconnus</span></div><div><b>${a.kInfo.filter((k) => !k.known).length}</b><span>kanji à découvrir</span></div></div>
      ${K.safeUrl(x.url) ? `<p class="small">Source : <a href="${esc(K.safeUrl(x.url))}" target="_blank" rel="noopener noreferrer">${esc(x.url)}</a></p>` : ''}
      <div class="card xtextbox" lang="ja">${paras.map((p) => `<p>${rubyW(p)}</p>`).join('')}</div>
      <p class="small muted">Touchez un mot souligné pour sa lecture, son sens, ses kanji et l’ajouter à vos révisions. Les mots absents du dictionnaire du site restent cliquables quand le navigateur sait les découper, avec un lien vers Jisho.</p>
      <div class="grid2">
        <div class="card panel"><h2>Vocabulaire du texte</h2>
          <table class="xvoc"><thead><tr><th>Mot</th><th>Lecture</th><th>Sens</th><th>Niveau</th></tr></thead><tbody>
          ${unknownFirst.slice(0, 80).map((v) => { const e = v.es[0] || {}; return `<tr${v.known ? ' class="known"' : ''}><td><span class="w jp" data-w="${esc(v.w)}" tabindex="0" role="button">${esc(v.w)}</span>${v.surf !== v.w ? `<small> (${esc(v.surf)})</small>` : ''}</td><td class="jp">${esc(e.r || '')}</td><td>${esc((e.g || '—').slice(0, 80))}</td><td>${v.lv ? `<span class="tag">${esc(v.lv)}</span>` : '<span class="small muted">hors dico</span>'}</td></tr>`; }).join('')}
          </tbody></table>
          ${a.words.length > 80 ? `<p class="small muted">${a.words.length - 80} autres mots non affichés.</p>` : ''}
          <p class="small muted">« fréq. » : JMdict, sens anglais d’origine. Les mots déjà appris sont grisés.</p></div>
        <div class="card panel"><h2>Kanji</h2><div class="xkanji">${a.kInfo.map((k) => `<span class="${k.known ? 'known' : ''}" title="${k.info ? esc(k.info.m + ' · ' + k.info.on) : 'hors des unités'}"><span class="w jp" data-w="${esc(k.c)}" tabindex="0" role="button">${esc(k.c)}</span></span>`).join('')}</div>
          <p class="small muted">En clair : kanji N5 ou déjà révisés.</p></div>
      </div>
      <div class="card panel"><h2>Comprendre</h2>
        <p class="small muted">Questions-guides à se poser (aucune question n’est générée automatiquement pour un texte externe) :</p>
        <ul class="xguide">${GUIDE.map(([j, f]) => `<li><span class="jp">${ruby(j)}</span> <span class="muted">${f}</span></li>`).join('')}</ul>
        <label class="xlab">Mon résumé (en français ou en japonais)<textarea id="xsum" rows="4" maxlength="3000">${esc(x.summary || '')}</textarea></label>
        <label class="xlab">Mes notes et questions<textarea id="xnotes" rows="3" maxlength="3000">${esc(x.notes || '')}</textarea></label>
        <div class="toolbar"><button class="btn" id="xsave">Enregistrer</button><span class="small muted" id="xmsg" role="status"></span><button class="btn-ghost small" id="xdel" style="margin-left:auto">Supprimer cette lecture</button></div></div>`;
    const msg = el.querySelector('#xmsg');
    el.querySelector('#xsave').onclick = () => { const L2 = lectures(), y = L2.find((z) => z.id === id); y.summary = el.querySelector('#xsum').value.slice(0, 3000); y.notes = el.querySelector('#xnotes').value.slice(0, 3000); saveLectures(L2); msg.textContent = 'Enregistré.'; };
    el.querySelector('#xdel').onclick = () => {
      msg.innerHTML = 'Supprimer définitivement cette lecture de l’appareil ? <button class="btn sec" id="xdy">Supprimer</button> <button class="btn-ghost" id="xdn">Annuler</button>';
      el.querySelector('#xdn').onclick = () => { msg.textContent = ''; };
      el.querySelector('#xdy').onclick = () => { saveLectures(lectures().filter((z) => z.id !== id)); location.hash = '#lire'; };
    };
  }

  K.view({ name: 'lire', title: 'Lire', nav: 'entrainer', match: (h) => h === 'lire', render: renderHub });
  K.view({ name: 'lecture', title: 'Lecture', nav: 'entrainer', match: (h) => /^lire-[a-z0-9]+$/.test(h), render: renderReader });
  K.on('entrainer', (el) => {
    const n = lectures().length;
    K.tile(el, { id: 'lire', href: '#lire', kj: '読', title: 'Lire', text: `Textes du parcours N4 à N2 et vos lectures (actualités comprises) avec dictionnaire.${n ? ` ${n} lecture${n > 1 ? 's' : ''} personnelle${n > 1 ? 's' : ''}.` : ''}` });
  });
  K.lecture = { analyse };
})();
