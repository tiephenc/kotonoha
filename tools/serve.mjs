// Serveur statique local pour le développement et les tests (127.0.0.1 uniquement, lecture seule).
//   node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const port = Number(process.argv[2] || process.env.PORT || 8765);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wasm': 'application/wasm', '.md': 'text/plain; charset=utf-8',
};
const DENY = /(^|[\\/])(\.git|\.claude|node_modules|backups|tools|tests|test-results|playwright-report)([\\/]|$)|(^|[\\/])\.[^\\/]+$/i; // insensible à la casse (NTFS)

createServer(async (req, res) => {
  // Hôte vérifié : protège contre le rebinding DNS.
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) { res.writeHead(421).end('Hôte refusé'); return; }
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root + sep) || DENY.test(file.slice(root.length))) { res.writeHead(403).end('Interdit'); return; }
    const s = await stat(file);
    if (!s.isFile()) { res.writeHead(404).end('Introuvable'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(file));
  } catch (e) { res.writeHead(404).end('Introuvable'); }
}).listen(port, '127.0.0.1', () => console.log(`KOTONOHA : http://127.0.0.1:${port}/`));
