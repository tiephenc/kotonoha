// Vérification rapide avant toute publication : syntaxe du script de index.html et des modules,
// intégrité des données pédagogiques. Les tests navigateur se lancent à part (npm test).
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let ok = true;
const run = (label, cmd, args, input) => {
  try { const out = execFileSync(cmd, args, { cwd: root, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }); console.log(`✓ ${label}${out.trim() ? ' · ' + out.trim().split('\n').pop().slice(0, 140) : ''}`); }
  catch (e) { ok = false; console.error(`✗ ${label}\n${(e.stderr || e.stdout || e.message).toString().trim()}`); }
};
run('JavaScript de index.html', process.execPath, ['.claude/hooks/check-index-js.mjs'], JSON.stringify({ tool_input: { file_path: join(root, 'index.html') } }));
for (const f of readdirSync(join(root, 'app')).filter((f) => f.endsWith('.js'))) run(`app/${f}`, process.execPath, ['--check', join('app', f)]);
run('sw.js', process.execPath, ['--check', 'sw.js']);
run('Intégrité des données', process.execPath, ['tools/data-integrity.mjs']);
process.exit(ok ? 0 : 1);
