/* KOTONOHA · noyau des espaces complémentaires (app/*.js).
   Chaque module déclare ses vues avec KX.view() ; le routeur de index.html les affiche (KX.match / KX.show)
   et appelle KX.after() après chaque rendu pour que les modules ajoutent leurs tuiles aux hubs existants.
   Données :
   - KX.st()   → S.x : petites données synchronisées avec la progression (comptes Firebase/Supabase compris) ;
   - KX.local  → textes longs (rédactions, carnet, lectures) gardés sur cet appareil et inclus dans l'export. */
(function () {
  'use strict';
  const LOCAL_KEY = 'kotonoha.plus.v1';
  const views = [];
  const hooks = {};

  function readLocal() { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {}; } catch (e) { return {}; } }
  let LOCAL = readLocal();
  function writeLocal() { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(LOCAL)); return true; } catch (e) { return false; } }

  const KX = {
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

    /* --- vues --- */
    view(def) { views.push(def); },
    match(h) { return views.some((v) => v.match(h)); },
    show(h) {
      const def = views.find((v) => v.match(h));
      const id = 'v-x-' + def.name;
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement('section');
        el.className = 'view xview';
        el.id = id;
        const main = document.querySelector('main.wrap');
        main.insertBefore(el, main.querySelector('footer'));
      }
      el.classList.add('on');
      try { def.render(el, h); }
      catch (e) { console.error(e); el.innerHTML = `<h1>Oups</h1><p class="muted">Cet espace n’a pas pu s’afficher. Vos données ne sont pas touchées.</p><p class="small muted">${KX.esc(e.message)}</p>`; }
      document.title = (def.title ? def.title + ' · ' : '') + 'Kotonoha';
      return def.nav || 'entrainer';
    },
    on(view, fn) { (hooks[view] = hooks[view] || []).push(fn); },
    after(h, view) {
      if (!views.some((v) => v.match(h))) document.title = 'Kotonoha · réviser le JLPT du N4 au N2';
      // Les crochets sont indexés par écran exact (« entrainer », « progres »…), pas par rubrique de navigation.
      const el = document.getElementById('v-' + h);
      if (!el || !el.classList.contains('on')) return;
      (hooks[h] || []).forEach((fn) => { try { fn(el, h); } catch (e) { console.error(e); } });
    },

    /* Ajoute une tuile « station » dans la grille d'un hub, sans doublon. */
    tile(el, { id, href, kj, title, text, grid }) {
      if (!el || el.querySelector('[data-xtile="' + id + '"]')) return;
      let g = grid ? el.querySelector(grid) : el.querySelector('.grid2');
      if (!g) { g = document.createElement('div'); g.className = 'grid2'; g.style.marginTop = '14px'; el.appendChild(g); }
      const a = document.createElement('a');
      a.className = 'card station';
      a.href = href;
      a.dataset.xtile = id;
      a.innerHTML = `<span class="kjb" aria-hidden="true">${KX.esc(kj)}</span><div><h2>${KX.esc(title)}</h2><p class="small muted">${text}</p></div>`;
      g.appendChild(a);
    },

    /* --- données synchronisées (S.x) --- */
    st() { if (typeof S !== 'object') return {}; S.x = S.x && typeof S.x === 'object' ? S.x : {}; return S.x; },
    save() { if (typeof save === 'function') save(); },

    /* --- données locales (textes longs) --- */
    local: {
      get(k, d) { return LOCAL[k] !== undefined ? LOCAL[k] : d; },
      set(k, v) { LOCAL[k] = v; return writeLocal(); },
    },
    exportLocal() { return JSON.parse(JSON.stringify(LOCAL)); },
    importLocal(o) {
      if (!o || typeof o !== 'object' || Array.isArray(o)) return false;
      // Fusion prudente : les éléments importés s'ajoutent, rien n'est supprimé.
      // Forme validée : identifiants simples, nombres réels, adresses http(s) uniquement.
      const clean = (x) => {
        if (!x || typeof x !== 'object' || Array.isArray(x)) return null;
        const y = {};
        for (const [k2, v] of Object.entries(x)) {
          if (k2 === 'id') { if (!/^[a-z0-9]{4,40}$/i.test(String(v))) return null; y.id = String(v); }
          else if (k2 === 'url') y.url = KX.safeUrl(v);
          else if (typeof v === 'number' || typeof v === 'boolean') y[k2] = Number.isFinite(+v) ? v : 0;
          else if (typeof v === 'string') y[k2] = v.slice(0, 20000);
          else if (Array.isArray(v)) y[k2] = v.slice(0, 500);
          else if (v && typeof v === 'object') y[k2] = v;
        }
        return y;
      };
      for (const k of Object.keys(o)) {
        if (!/^[a-z0-9-]{1,40}$/i.test(k)) continue;
        const cur = LOCAL[k], inc = Array.isArray(o[k]) ? o[k].map(clean).filter(Boolean) : typeof o[k] === 'string' ? o[k].slice(0, 20000) : null;
        if (inc === null) continue;
        if (Array.isArray(cur) && Array.isArray(inc)) {
          const ids = new Set(cur.map((x) => x && x.id));
          LOCAL[k] = cur.concat(inc.filter((x) => !(x && ids.has(x.id))));
        } else if (cur === undefined) LOCAL[k] = inc;
      }
      return writeLocal();
    },

    /* --- utilitaires --- */
    safeUrl(u) { u = String(u || ''); return /^https?:\/\//i.test(u) ? u : ''; },
    uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    dayKey(t = Date.now()) { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
    fmtMin(sec) { const m = Math.round(sec / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); },
    reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; },
    toast(t) { if (typeof toast === 'function') toast(t); },
  };
  window.KX = KX;
  // Libellé du rail latéral pour la salle de détente (les autres espaces reprennent celui de leur rubrique).
  try { if (typeof RAILS === 'object' && RAILS && !RAILS.detente) RAILS.detente = ['休', 'Salle de détente']; } catch (e) {}
})();
