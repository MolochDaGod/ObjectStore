/**
 * Package helper — package.json inventory: scripts, engines, exports, workspaces.
 */
import fs from 'node:fs';
import path from 'node:path';
import { OBJECTSTORE_ROOT } from './node-helper.mjs';
import { readPkg } from './deps-helper.mjs';

/** Script groups agents should know */
export const SCRIPT_GROUPS = {
  doctor: [/doctor/, /fleet:doctor/, /helper/, /validate/, /test:grudge6/],
  deploy: [/^deploy:/, /^deploy$/, /worker:deploy/, /deploy:browse/, /deploy:helper/, /deploy:smoke/],
  assets: [/convert/, /bake/, /r2:/, /assets:/, /packages:/, /wire:/],
  catalog: [/generate:master/, /consolidate/, /build:games/, /validate:catalog/],
  helper: [/^helper/, /wire:skill-prefab/, /test:grudge6/],
};

export function listScripts(root = OBJECTSTORE_ROOT) {
  const { pkg } = readPkg(root);
  const scripts = pkg.scripts || {};
  const grouped = { other: [] };
  for (const k of Object.keys(SCRIPT_GROUPS)) grouped[k] = [];

  for (const [name, cmd] of Object.entries(scripts)) {
    let hit = false;
    for (const [g, patterns] of Object.entries(SCRIPT_GROUPS)) {
      if (patterns.some((re) => re.test(name))) {
        grouped[g].push({ name, cmd });
        hit = true;
        break;
      }
    }
    if (!hit) grouped.other.push({ name, cmd });
  }
  return { scripts, grouped, count: Object.keys(scripts).length };
}

export function packageMeta(root = OBJECTSTORE_ROOT) {
  const { pkg, pkgPath, hasLock } = readPkg(root);
  return {
    path: pkgPath,
    name: pkg.name,
    version: pkg.version,
    type: pkg.type || 'commonjs',
    engines: pkg.engines || null,
    exports: pkg.exports ? Object.keys(pkg.exports) : null,
    hasLock,
    private: !!pkg.private,
    description: pkg.description || '',
  };
}

export function printPackageDoctor(root = OBJECTSTORE_ROOT, opts = {}) {
  const meta = packageMeta(root);
  const { grouped, count } = listScripts(root);
  console.log('══ Package helper ══\n');
  console.log(`  ${meta.name}@${meta.version}  type=${meta.type}`);
  console.log(`  ${meta.path}`);
  if (meta.description) console.log(`  ${meta.description.slice(0, 100)}`);
  console.log(`  scripts: ${count}`);
  if (meta.engines) console.log(`  engines: ${JSON.stringify(meta.engines)}`);
  if (meta.exports) console.log(`  exports: ${meta.exports.join(', ')}`);

  const show = opts.all ? ['doctor', 'deploy', 'assets', 'catalog', 'helper', 'other'] : ['doctor', 'deploy', 'helper', 'assets'];
  for (const g of show) {
    const rows = grouped[g] || [];
    if (!rows.length) continue;
    console.log(`\n  [${g}] (${rows.length})`);
    for (const r of rows.slice(0, opts.limit || 24)) {
      const cmd = r.cmd.length > 72 ? r.cmd.slice(0, 70) + '…' : r.cmd;
      console.log(`    npm run ${r.name.padEnd(28)} → ${cmd}`);
    }
    if (rows.length > (opts.limit || 24)) console.log(`    … +${rows.length - (opts.limit || 24)} more`);
  }
  console.log('');
  return 0;
}

export default { listScripts, packageMeta, printPackageDoctor, SCRIPT_GROUPS };
