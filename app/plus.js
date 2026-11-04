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
    onMatch(re, fn) { (hooks.__re = hooks.__re || []).push([re, fn]); },
    after(h, view) {
      if (!views.some((v) => v.match(h))) document.title = 'Kotonoha · réviser le JLPT du N4 au N2';
      // Les crochets sont indexés par écran exact (« entrainer », « progres »…), pas par rubrique de navigation.
      (hooks.__re || []).forEach(([re, fn]) => { if (re.test(h)) { const on = document.querySelector('main section.view.on'); try { on && fn(on, h); } catch (e) { console.error(e); } } });
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
  /* Zoom et déplacement d'un SVG (molette, pincement, glisser, clavier + − 0 et flèches).
     Un glisser de plus de 5 px n'est pas pris pour un clic. */
  KX.panzoom = function (svg, o = {}) {
    const vb0 = svg.viewBox.baseVal, base = { x: vb0.x, y: vb0.y, w: vb0.width, h: vb0.height };
    const min = o.min || 1, max = o.max || 6; let s = 1, cx = base.x + base.w / 2, cy = base.y + base.h / 2;
    const apply = () => { const w = base.w / s, h = base.h / s; cx = Math.min(base.x + base.w - w / 2, Math.max(base.x + w / 2, cx)); cy = Math.min(base.y + base.h - h / 2, Math.max(base.y + h / 2, cy)); svg.setAttribute('viewBox', `${cx - w / 2} ${cy - h / 2} ${w} ${h}`); o.onChange && o.onChange(s); };
    const toSvg = (ex, ey) => { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return { x: vb.x + (ex - r.left) / r.width * vb.width, y: vb.y + (ey - r.top) / r.height * vb.height }; };
    const zoomAt = (f, px, py) => { const ns = Math.min(max, Math.max(min, s * f)); if (ns === s) return; const p = px != null ? toSvg(px, py) : { x: cx, y: cy }; cx = p.x + (cx - p.x) * s / ns; cy = p.y + (cy - p.y) * s / ns; s = ns; apply(); };
    svg.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
    const pts = new Map(); let moved = 0, last = null, pinch = null;
    svg.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; last = { x: e.clientX, y: e.clientY }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); } });
    svg.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt(d / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2); pinch = d; moved += 10; return; }
      if (pts.size !== 1 || !last) return;
      const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 5) { if (!svg.hasPointerCapture(e.pointerId)) try { svg.setPointerCapture(e.pointerId); } catch (x) {} cx -= dx / r.width * vb.width; cy -= dy / r.height * vb.height; apply(); svg.classList.add('panning'); }
      last = { x: e.clientX, y: e.clientY };
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { last = null; setTimeout(() => svg.classList.remove('panning'), 0); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('click', (e) => { if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
    svg.addEventListener('keydown', (e) => {
      const st = base.w / s / 10;
      const m = { '+': () => zoomAt(1.25), '=': () => zoomAt(1.25), '-': () => zoomAt(0.8), '0': () => { s = 1; cx = base.x + base.w / 2; cy = base.y + base.h / 2; apply(); },
        ArrowLeft: () => { cx -= st; apply(); }, ArrowRight: () => { cx += st; apply(); }, ArrowUp: () => { cy -= st; apply(); }, ArrowDown: () => { cy += st; apply(); } }[e.key];
      if (m && e.target === svg) { e.preventDefault(); m(); }
    });
    return { zoomIn: () => zoomAt(1.4), zoomOut: () => zoomAt(1 / 1.4), reset: () => { s = 1; cx = base.x + base.w / 2; cy = base.y + base.h / 2; apply(); }, focus: (x, y, z) => { s = Math.min(max, Math.max(min, z || s)); cx = x; cy = y; apply(); }, scale: () => s };
  };

  window.KX = KX;
  // Libellé du rail latéral pour la salle de détente (les autres espaces reprennent celui de leur rubrique).
  try { if (typeof RAILS === 'object' && RAILS && !RAILS.detente) RAILS.detente = ['休', 'Salle de détente']; } catch (e) {}
})();
