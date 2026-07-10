/**
 * Deploy slim ObjectStore static slice to Cloudflare Pages project
 * `grudge-objectstore` (custom domain: browse.grudge-studio.com).
 *
 * Full icons live on assets.grudge-studio.com — do not ship the 1GB+ icons tree.
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DST = join(ROOT, '.pages-deploy');

const ROOT_FILES = [
  'WEAPON_SKILLS.html',
  'GRUDGE6_Characters.html',
  'GRUDGE_Item_Database.html',
  'index.html',
  'hub.html',
  'favicon.svg',
  'favicon.ico',
];

const API_FILES = [
  'master-weaponSkills.json',
  'weapons.json',
  't0-weapons.json',
  'weaponSkills.json',
  'classes.json',
  'races.json',
  'grudge6-characters.json',
];

const JS_FILES = ['weapon-skill-tree.js', 'nav.js'];

rmSync(DST, { recursive: true, force: true });
mkdirSync(join(DST, 'js'), { recursive: true });
mkdirSync(join(DST, 'api', 'v1'), { recursive: true });

for (const f of ROOT_FILES) {
  const src = join(ROOT, f);
  if (existsSync(src)) cpSync(src, join(DST, f));
}
for (const f of JS_FILES) {
  const src = join(ROOT, 'js', f);
  if (existsSync(src)) cpSync(src, join(DST, 'js', f));
}
for (const f of API_FILES) {
  const src = join(ROOT, 'api', 'v1', f);
  if (existsSync(src)) cpSync(src, join(DST, 'api', 'v1', f));
}

writeFileSync(
  join(DST, '_headers'),
  `/*
  Access-Control-Allow-Origin: *

/api/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
`
);

// Do NOT add _redirects for /WEAPON_SKILLS → .html; CF Pages pretty-URLs already
// map /WEAPON_SKILLS ↔ WEAPON_SKILLS.html and a rewrite causes a 308 loop.

console.log('Staging ready:', DST);
const r = spawnSync(
  'npx',
  ['wrangler', 'pages', 'deploy', DST, '--project-name=grudge-objectstore', '--branch=main', '--commit-dirty=true'],
  { cwd: ROOT, stdio: 'inherit', shell: true }
);
process.exit(r.status ?? 1);
