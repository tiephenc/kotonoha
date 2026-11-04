// Empreintes et volumes des données pédagogiques intégrées à index.html.
//   node tools/data-integrity.mjs                  → compare à tools/data-baseline.json (code 1 si écart)
//   node tools/data-integrity.mjs --write-baseline → (ré)écrit la référence (à faire seulement après validation)
//   node tools/data-integrity.mjs --file X.html    → analyse un autre fichier
// Lecture seule sur index.html. Les données sont évaluées dans un bac à sable vm sans accès au DOM ni au réseau.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fileArg = args.includes('--file') ? args[args.indexOf('--file') + 1] : join(root, 'index.html');
const baselinePath = join(root, 'tools', 'data-baseline.json');
const html = readFileSync(fileArg, 'utf8');

const sha = s => createHash('sha256').update(s).digest('hex');
const between = (a, b) => {
  const i = html.indexOf(a); if (i < 0) throw new Error(`Repère introuvable : ${a}`);
  const j = html.indexOf(b, i); if (j < 0) throw new Error(`Repère introuvable : ${b}`);
  return html.slice(i, j);
};
const lineOf = (a) => { const i = html.indexOf(a); if (i < 0) throw new Error(`Repère introuvable : ${a}`); return html.slice(i, html.indexOf('\n', i)); };

// Zone « programme » : de START jusqu'aux utilitaires DOM (LEVELS, MODULES, N3/N4/N2, UNITS, SORT, GLOSES…).
const zone = between('const START = ', 'const $ = (s,el');
const names = ['LEVELS', 'PHASES', 'MODULES', 'N3', 'N4', 'N2', 'SYL', 'UNITS', 'ANKI', 'KDECK', 'SORT', 'GLOSES'];
const ctx = runInNewContext(`${zone}\n;({${names.join(',')}})`, { Date, Math, JSON, Set, Map, Object, Array, String, Number }, { timeout: 10000 });

const ev = (line, name) => runInNewContext(`${line.replace(/^window\./, 'var ')}\n;${name}`, {}, { timeout: 10000 });
const JMV = ev(lineOf('window.JMV='), 'JMV');
const ANKID = ev(lineOf('const ANKID='), 'ANKID');
const KVG = ev(lineOf('const KVG='), 'KVG');

const units = Object.values(ctx.UNITS);
const count = (f) => units.reduce((n, u) => n + f(u), 0);
const arr = (x) => (Array.isArray(x) ? x.length : 0);

const report = {
  fichier: fileArg.replace(root, '.'),
  volumes: {
    unites: units.length,
    pointsDeGrammaire: count(u => arr(u.grammar)),
    exemplesDeGrammaire: count(u => (u.grammar || []).reduce((n, g) => n + arr(g.ex), 0)),
    vocabulaireDesUnites: count(u => arr(u.vocab)),
    kanjiDesUnites: count(u => arr(u.kanji)),
    exercicesSort: Object.values(ctx.SORT).reduce((n, v) => n + arr(v), 0),
    modules: ctx.MODULES.length,
    jmvNotes: arr(JMV.notes),
    jmvListes: arr(JMV.lists),
    kanjiVG: Object.keys(KVG).length,
    ankiPaquets: arr(ANKID.decks),
    ankiNotes: (ANKID.decks || []).reduce((n, d) => n + arr(d.notes), 0),
  },
  empreintes: {},
};
for (const n of names) report.empreintes[n] = sha(JSON.stringify(ctx[n]));
report.empreintes.JMV = sha(JSON.stringify(JMV));
report.empreintes.ANKID = sha(JSON.stringify(ANKID));
report.empreintes.KVG = sha(JSON.stringify(KVG));
// Identifiants : aucun doublon ni disparition.
const jmvIds = (JMV.notes || []).map(n => n[0]);
report.volumes.jmvIdentifiantsUniques = new Set(jmvIds).size;
report.empreintes.jmvIdentifiants = sha(JSON.stringify([...jmvIds].sort()));

if (args.includes('--write-baseline')) {
  writeFileSync(baselinePath, JSON.stringify({ date: new Date().toISOString(), ...report }, null, 2) + '\n');
  console.log('Référence écrite :', baselinePath);
  console.log(JSON.stringify(report.volumes, null, 2));
  process.exit(0);
}
if (!existsSync(baselinePath)) { console.log(JSON.stringify(report, null, 2)); console.log('Aucune référence : lancer avec --write-baseline.'); process.exit(0); }

const base = JSON.parse(readFileSync(baselinePath, 'utf8'));
const diffs = [];
for (const k of Object.keys(base.volumes)) if (base.volumes[k] !== report.volumes[k]) diffs.push(`volume ${k} : ${base.volumes[k]} → ${report.volumes[k]}`);
for (const k of Object.keys(base.empreintes)) if (base.empreintes[k] !== report.empreintes[k]) diffs.push(`empreinte ${k} modifiée`);
if (diffs.length) { console.error('ÉCART avec la référence du ' + base.date + ' :\n- ' + diffs.join('\n- ')); process.exit(1); }
console.log(`Données intactes (référence du ${base.date}) :`, JSON.stringify(report.volumes));
