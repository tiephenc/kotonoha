// Hook PostToolUse (Edit|Write) : après une modification de index.html,
// vérifie que les scripts intégrés restent syntaxiquement valides.
// Ne modifie rien. Code de sortie 2 = erreur de syntaxe signalée à Claude.
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';

let input = '';
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
const file = input?.tool_input?.file_path || '';
if (!/[\\/]index\.html$/i.test(file)) process.exit(0);

let html;
try { html = readFileSync(file, 'utf8'); } catch { process.exit(0); }

// Scripts classiques intégrés (sans src, sans type JSON / module).
const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const errors = [];
let m, n = 0;
while ((m = re.exec(html))) {
  const attrs = m[1] || '';
  if (/\bsrc=/i.test(attrs) || /type=["']?(application\/(ld\+)?json|module)/i.test(attrs)) continue;
  n++;
  const line = html.slice(0, m.index).split('\n').length;
  try { new Script(m[2], { filename: `index.html (script ${n}, ligne ${line})` }); }
  catch (e) { errors.push(`${e.name}: ${e.message}\n${(e.stack || '').split('\n').slice(0, 3).join('\n')}`); }
}

if (errors.length) {
  process.stderr.write(`index.html : le JavaScript intégré ne compile plus.\n${errors.join('\n\n')}\n`);
  process.exit(2);
}
process.exit(0);
