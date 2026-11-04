/* Kotonoha · service worker : le site reste utilisable hors connexion.
   Page et modules app/ : réseau d'abord (les mises à jour arrivent tout de suite et restent cohérentes entre elles),
   copie locale sinon. Autres fichiers du site et polices Google : copie locale d'abord.
   Comptes, Ko-fi et autres services : jamais mis en cache. */
const VERSION='kotonoha-2026-11-04-carnet';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png',
  './app/plus.js','./app/fox.js','./app/temps.js','./app/kamon-data.js','./app/kamon.js','./app/voyage-data.js','./app/voyage.js','./app/detente.js','./app/jeux.js','./app/lecture.js','./app/atelier-data.js','./app/atelier.js','./app/carte.js','./app/culture.js','./app/carnet.js','./app/visu.js','./app/lecons.js','./app/home.js','./app/focus.js','./app/plus.css','./app/theme.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const netFirst=(r,key)=>fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(key||r,cp));}return res;}).catch(()=>caches.match(key||r,{ignoreSearch:true}));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){e.respondWith(netFirst(r,'./index.html'));return;}
    if(/\/app\/[^/]+\.(js|css)$/.test(u.pathname)){e.respondWith(netFirst(r));return;}
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));}return res;})));return;}
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res;})));}
});
