/* KOTONOHA · carnet personnel : notes libres datées (questions, remarques, phrases entendues…).
   Stockées sur l'appareil (KX.local 'carnet'), incluses dans l'export de sauvegarde. */
(function () {
  'use strict';
  const K = window.KX, esc = K.esc;
  const notes = () => K.local.get('carnet', []);
  const store = (L) => K.local.set('carnet', L.slice(-1000));
  const tagsOf = (s) => [...new Set(String(s || '').split(/[,#\s]+/).map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 8);

  function render(el) {
    let q = '', edit = null;
    const draw = () => {
      const L = notes().slice().sort((a, b) => b.at - a.at);
      const F = q ? L.filter((n) => (String(n.titre) + ' ' + String(n.texte) + ' ' + (Array.isArray(n.tags) ? n.tags.join(' ') : '')).toLowerCase().includes(q.toLowerCase())) : L;
      const cur = edit ? L.find((n) => n.id === edit) : null;
      el.innerHTML = `<div class="eyebrow">Profil</div><h1>Carnet</h1>
        <p class="muted">Vos notes libres : questions à poser, nuances repérées, phrases entendues, objectifs. Elles restent sur cet appareil et sont incluses dans l’export de vos données.</p>
        <div class="card panel"><h2>${cur ? 'Modifier la note' : 'Nouvelle note'}</h2>
          <form id="xcf" class="xform"><label>Titre<input name="titre" maxlength="120" required value="${esc(cur ? cur.titre : '')}"></label>
            <label>Note<textarea name="texte" rows="5" maxlength="6000" required>${esc(cur ? cur.texte : '')}</textarea></label>
            <label>Étiquettes (séparées par des virgules)<input name="tags" maxlength="120" value="${esc(cur && Array.isArray(cur.tags) ? cur.tags.join(', ') : '')}" placeholder="grammaire, questions"></label>
            <div class="toolbar"><button class="btn" type="submit">${cur ? 'Enregistrer' : 'Ajouter'}</button>${cur ? '<button class="btn-ghost" type="button" id="xccancel">Annuler</button>' : ''}<span class="small muted" role="status" id="xcm"></span></div></form></div>
        <div class="card panel"><div class="toolbar"><h2 style="margin-right:auto">${L.length} note${L.length > 1 ? 's' : ''}</h2><input type="search" id="xcq" placeholder="Rechercher" aria-label="Rechercher dans le carnet" value="${esc(q)}"></div>
          ${F.length ? `<ul class="xnotes">${F.map((n) => `<li><div class="xnh"><b>${esc(n.titre)}</b><span class="small muted">${new Date(n.at).toLocaleDateString('fr-FR')}</span></div>
            <p>${esc(n.texte || '').replace(/\n/g, '<br>')}</p>${Array.isArray(n.tags) && n.tags.length ? `<p class="small">${n.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join(' ')}</p>` : ''}
            <div class="toolbar"><button class="btn-ghost small" data-ed="${esc(n.id)}">Modifier</button><button class="btn-ghost small" data-del="${esc(n.id)}">Supprimer</button></div></li>`).join('')}</ul>` : `<p class="small muted">${q ? 'Aucune note ne correspond.' : 'Aucune note pour l’instant.'}</p>`}</div>`;
      el.querySelector('#xcf').onsubmit = (e) => {
        e.preventDefault(); const f = new FormData(e.target), L2 = notes();
        const data = { titre: String(f.get('titre')).slice(0, 120), texte: String(f.get('texte')).slice(0, 6000), tags: tagsOf(f.get('tags')) };
        if (edit) Object.assign(L2.find((n) => n.id === edit) || {}, data, { maj: Date.now() }); else L2.push(Object.assign({ id: K.uid(), at: Date.now() }, data));
        store(L2); edit = null; draw(); el.querySelector('#xcm').textContent = 'Note enregistrée.';
      };
      const cc = el.querySelector('#xccancel'); if (cc) cc.onclick = () => { edit = null; draw(); };
      el.querySelector('#xcq').oninput = (e) => { q = e.target.value; const pos = e.target.selectionStart; draw(); const s = el.querySelector('#xcq'); s.focus(); s.setSelectionRange(pos, pos); };
      el.querySelectorAll('[data-ed]').forEach((b) => b.onclick = () => { edit = b.dataset.ed; draw(); el.querySelector('#xcf [name=titre]').focus(); });
      el.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
        const bar = b.parentElement; bar.innerHTML = 'Supprimer cette note ? <button class="btn sec small" data-y>Supprimer</button> <button class="btn-ghost small" data-n>Annuler</button>';
        bar.querySelector('[data-n]').onclick = draw;
        bar.querySelector('[data-y]').onclick = () => { store(notes().filter((n) => n.id !== b.dataset.del)); draw(); };
      });
    };
    draw();
  }
  K.view({ name: 'carnet', title: 'Carnet', nav: 'profil', match: (h) => h === 'carnet', render });
  K.on('profil', (el) => {
    const n = notes().length;
    if (el.querySelector('[data-xtile="carnet"]')) return;
    const g = document.createElement('div'); g.className = 'grid2'; g.dataset.xhubp = '1';
    const h1 = el.querySelector('h1'); if (h1 && h1.nextElementSibling) h1.nextElementSibling.after(g); else el.prepend(g);
    K.tile(el, { id: 'carnet', grid: '[data-xhubp]', href: '#carnet', kj: '帳', title: 'Carnet', text: n ? `${n} note${n > 1 ? 's' : ''} personnelle${n > 1 ? 's' : ''}.` : 'Vos notes libres, datées et étiquetées.' });
  });
})();
