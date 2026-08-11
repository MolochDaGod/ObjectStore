/**
 * AI worker helper — registry of Grudge AI workers (editor + ops) and how to run them.
 * Extends existing: js/grudge6-prefab-anim-worker.js, fleet-env-doctor, craft consolidation.
 * Does not invent a parallel agent platform.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { OBJECTSTORE_ROOT } from './node-helper.mjs';
import { smokeUrl } from './deploy-helper.mjs';

/** Machine-readable worker registry (ObjectStore-centric) */
export const AI_WORKERS = {
  'prefab-anim': {
    id: 'prefab-anim',
    label: 'grudge6 Prefab + Animation worker',
    kind: 'browser+batch',
    module: 'js/grudge6-prefab-anim-worker.js',
    rules: 'js/grudge6-prefab-anim-rules.js',
    surface: 'https://info.grudge-studio.com/grudge6-editor.html',
    batch: 'scripts/wire-skill-prefab-anims.mjs',
    npm: ['wire:skill-prefab-anims', 'test:grudge6-editor'],
    actions: ['audit', 'fillNullsLocal', 'exportPatchJson', 'gameReadyTests', 'playSkill'],
    docs: 'docs/GRUDGE6_EDITOR_PREFAB_WORKER.md',
    cdnWrite: false,
  },
  'fleet-env': {
    id: 'fleet-env',
    label: 'Fleet env doctor (credentials, no secrets printed)',
    kind: 'cli',
    module: 'scripts/fleet-env-doctor.mjs',
    npm: ['fleet:doctor'],
    actions: ['probeTokens', 'probeR2'],
    docs: null,
    cdnWrite: false,
  },
  'deploy-ops': {
    id: 'deploy-ops',
    label: 'Deploy system helper (WCS / info / craft / ui)',
    kind: 'cli',
    module: 'scripts/helpers/deploy-helper.mjs',
    npm: ['helper', 'deploy:helper'],
    actions: ['list', 'smoke', 'run'],
    docs: 'docs/HELPERS_SSOT.md',
    cdnWrite: false,
  },
  'craft-consolidate': {
    id: 'craft-consolidate',
    label: 'Craft · WCS · Main Panel consolidation',
    kind: 'docs+surfaces',
    docs: 'docs/CRAFT_WCS_CONSOLIDATION_SSOT.md',
    smoke: [
      'https://wcs.grudge-studio.com/',
      'https://grudgewarlords.com/craft/',
      'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft',
      'https://info.grudge-studio.com/main-panel.html',
    ],
    actions: ['smokeSurfaces'],
    npm: ['helper'],
    cdnWrite: false,
  },
  'asset-fleet-audit': {
    id: 'asset-fleet-audit',
    label: 'Asset fleet audit (era + game-ready)',
    kind: 'cli',
    module: 'scripts/asset-fleet-audit.mjs',
    npm: ['audit:assets', 'audit:assets:smoke'],
    actions: ['audit', 'cdn', 'purgeDry'],
    docs: 'docs/ASSET_FLEET_AUDIT.md',
    cdnWrite: false,
  },
};

export function listWorkers() {
  return Object.values(AI_WORKERS).map((w) => ({
    id: w.id,
    label: w.label,
    kind: w.kind,
    npm: w.npm || [],
    module: w.module || null,
    surface: w.surface || null,
    filesOk: checkWorkerFiles(w),
  }));
}

export function checkWorkerFiles(w) {
  const files = [w.module, w.rules, w.batch, w.docs].filter(Boolean);
  const missing = [];
  for (const f of files) {
    const abs = path.isAbsolute(f) ? f : path.join(OBJECTSTORE_ROOT, f);
    if (!fs.existsSync(abs)) missing.push(f);
  }
  return { ok: missing.length === 0, missing };
}

export function printWorkerList() {
  console.log('══ AI worker helper ══\n');
  for (const w of listWorkers()) {
    const mark = w.filesOk.ok ? '●' : '○';
    console.log(`  ${mark} ${w.id.padEnd(20)} ${w.label}`);
    console.log(`      kind ${w.kind}`);
    if (w.module) console.log(`      module ${w.module}`);
    if (w.surface) console.log(`      live   ${w.surface}`);
    if (w.npm?.length) console.log(`      npm    ${w.npm.map((n) => 'npm run ' + n).join(' · ')}`);
    if (!w.filesOk.ok) console.log(`      missing ${w.filesOk.missing.join(', ')}`);
    console.log('');
  }
  console.log('  Run batch:  npm run helper -- ai run prefab-anim');
  console.log('  Smoke:      npm run helper -- ai smoke [id]\n');
  return 0;
}

export async function smokeWorker(id) {
  const w = AI_WORKERS[id];
  if (!w) throw new Error(`Unknown worker: ${id}`);
  const urls = [];
  if (w.surface) urls.push(w.surface);
  if (w.smoke) urls.push(...w.smoke);
  if (!urls.length) {
    console.log(`  [${id}] no smoke URLs — files only`);
    const f = checkWorkerFiles(w);
    console.log(`  files ${f.ok ? 'OK' : 'MISSING: ' + f.missing.join(', ')}`);
    return f.ok ? 0 : 1;
  }
  let fail = 0;
  console.log(`  [${id}] smoke`);
  for (const u of urls) {
    const r = await smokeUrl(u);
    if (!r.ok) fail++;
    console.log(`    ${r.ok ? '✓' : '✗'} ${r.status || '—'} ${u}${r.title ? ' · ' + r.title : ''}${r.error ? ' · ' + r.error : ''}`);
  }
  const f = checkWorkerFiles(w);
  if (!f.ok) {
    fail++;
    console.log(`    ✗ missing files: ${f.missing.join(', ')}`);
  }
  return fail ? 1 : 0;
}

export function runWorker(id, extraArgs = []) {
  const w = AI_WORKERS[id];
  if (!w) throw new Error(`Unknown worker: ${id}`);
  // Prefer first npm script that maps to a real package script
  if (id === 'prefab-anim') {
    const script = path.join(OBJECTSTORE_ROOT, 'scripts/wire-skill-prefab-anims.mjs');
    const args = ['node', script, ...(extraArgs.length ? extraArgs : ['--report-only'])];
    console.log(`  → ${args.join(' ')}`);
    const r = spawnSync(args[0], args.slice(1), { cwd: OBJECTSTORE_ROOT, stdio: 'inherit', shell: true });
    return r.status === 0 ? 0 : 1;
  }
  if (id === 'fleet-env') {
    const r = spawnSync('node', [path.join(OBJECTSTORE_ROOT, 'scripts/fleet-env-doctor.mjs')], {
      cwd: OBJECTSTORE_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    return r.status === 0 ? 0 : 1;
  }
  if (id === 'asset-fleet-audit') {
    const r = spawnSync('node', [path.join(OBJECTSTORE_ROOT, 'scripts/asset-fleet-audit.mjs'), '--max', '100'], {
      cwd: OBJECTSTORE_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    return r.status === 0 ? 0 : 1;
  }
  if (id === 'deploy-ops') {
    const r = spawnSync('node', [path.join(OBJECTSTORE_ROOT, 'scripts/helpers/deploy-helper.mjs'), 'list'], {
      cwd: OBJECTSTORE_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    return r.status === 0 ? 0 : 1;
  }
  if (id === 'craft-consolidate') {
    return smokeWorker(id);
  }
  console.log(`  No run handler for ${id} — see npm scripts: ${(w.npm || []).join(', ')}`);
  return 1;
}

export default { AI_WORKERS, listWorkers, printWorkerList, smokeWorker, runWorker };
