/**
 * Deployment system helper — registry of Grudge craft/UI/ObjectStore deploy targets.
 * Extends existing scripts (deploy-pages, wrangler pages) — does not invent hosts.
 *
 * Usage:
 *   node scripts/helpers/deploy-helper.mjs list
 *   node scripts/helpers/deploy-helper.mjs smoke
 *   node scripts/helpers/deploy-helper.mjs run wcs
 *   node scripts/helpers/deploy-helper.mjs run objectstore-pages --dry
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { OBJECTSTORE_ROOT, which } from './node-helper.mjs';

const HOME = os.homedir();

/**
 * Canonical deploy targets for craft consolidation + ObjectStore.
 * path: local dir; cmd: default deploy argv; smoke: URL after deploy
 */
export const DEPLOY_TARGETS = {
  wcs: {
    id: 'wcs',
    label: 'WCS brand hub (Cloudflare Pages)',
    live: 'https://wcs.grudge-studio.com/',
    smoke: [
      'https://wcs.grudge-studio.com/',
      'https://wcs.grudge-studio.com/craft',
    ],
    rootCandidates: [
      'F:\\GitHub\\grudge-wcs',
      path.join(HOME, 'GitHub', 'grudge-wcs'),
      path.resolve(OBJECTSTORE_ROOT, '../grudge-wcs'),
    ],
    deployDir: 'pages-wcs',
    cmd: (root) => [
      'npx',
      'wrangler',
      'pages',
      'deploy',
      path.join(root, 'pages-wcs'),
      '--project-name=grudge-wcs',
      '--branch=production',
      '--commit-dirty=true',
    ],
    notes: 'Do not deploy Betta Vite dist/ here — hub only',
  },
  'objectstore-pages': {
    id: 'objectstore-pages',
    label: 'ObjectStore GitHub Pages (info mirror path)',
    live: 'https://info.grudge-studio.com/',
    smoke: [
      'https://info.grudge-studio.com/main-panel.html',
      'https://info.grudge-studio.com/grudge6-editor.html',
      'https://info.grudge-studio.com/api/v1/grudge6-editor-ssot.json',
    ],
    rootCandidates: [OBJECTSTORE_ROOT],
    cmd: (root) => ['npm', 'run', 'deploy:pages'],
    cwd: true,
    notes: 'Uses scripts/deploy-pages.mjs or deploy-gh-pages — intentional only',
  },
  'objectstore-vercel': {
    id: 'objectstore-vercel',
    label: 'ObjectStore Vercel (info.grudge-studio.com)',
    live: 'https://info.grudge-studio.com/',
    smoke: [
      'https://info.grudge-studio.com/main-panel.html',
      'https://info.grudge-studio.com/wcs.html',
    ],
    rootCandidates: [OBJECTSTORE_ROOT],
    cmd: () => ['npx', 'vercel', '--prod', '--yes'],
    cwd: true,
    notes: 'Requires vercel link; prefer intentional single-intent deploy',
  },
  craft: {
    id: 'craft',
    label: 'Warlords craft suite (GrudgeBuilder public/craft)',
    live: 'https://grudgewarlords.com/craft/',
    smoke: ['https://grudgewarlords.com/craft/'],
    rootCandidates: [
      'F:\\GitHub\\GrudgeBuilder',
      path.join(HOME, 'GitHub', 'GrudgeBuilder'),
      path.resolve(OBJECTSTORE_ROOT, '../GrudgeBuilder'),
    ],
    cmd: () => ['npx', 'vercel', '--prod', '--yes'],
    cwd: true,
    notes: 'Full Vercel project grudge-builder — confirm scope before --prod',
  },
  'ui-main-panel': {
    id: 'ui-main-panel',
    label: 'UI host main-panel (grudge-ui-editor)',
    live: 'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft',
    smoke: [
      'https://ui.grudge-studio.com/main-panel.html',
      'https://ui.grudge-studio.com/main-panel.html?era=warlords&tab=craft',
    ],
    rootCandidates: [
      'F:\\GitHub\\grudge-ui-editor',
      path.join(HOME, 'GitHub', 'grudge-ui-editor'),
      path.resolve(OBJECTSTORE_ROOT, '../grudge-ui-editor'),
    ],
    cmd: () => ['npx', 'vercel', '--prod', '--yes'],
    cwd: true,
    notes: 'Production main-panel SSOT host',
  },
  gcs: {
    id: 'gcs',
    label: 'GCS Warlords hub (character.grudge-studio.com)',
    live: 'https://character.grudge-studio.com/hub',
    smoke: [
      'https://character.grudge-studio.com/',
      'https://character.grudge-studio.com/hub',
    ],
    rootCandidates: [
      'F:\\GitHub\\GCS',
      path.join(HOME, 'GitHub', 'GCS'),
      path.resolve(OBJECTSTORE_ROOT, '../GCS'),
    ],
    cmd: () => ['npx', 'vercel', '--prod', '--yes'],
    cwd: true,
    notes: '4-slot roster + craft/main-panel/WCS connectors — not a second craft app',
  },
};

function resolveRoot(target) {
  for (const c of target.rootCandidates || []) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

export function listDeployTargets() {
  return Object.values(DEPLOY_TARGETS).map((t) => {
    const root = resolveRoot(t);
    return {
      id: t.id,
      label: t.label,
      live: t.live,
      root: root || '(missing local repo)',
      ready: !!root,
      notes: t.notes || '',
    };
  });
}

export async function smokeUrl(url, opts = {}) {
  const timeout = opts.timeout || 20000;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetch(url, {
      method: opts.method || 'GET',
      redirect: 'follow',
      signal: ac.signal,
      headers: { 'User-Agent': 'grudge-deploy-helper/1.0' },
    });
    const text = await r.text().catch(() => '');
    const title = (text.match(/<title[^>]*>([^<]+)/i) || [])[1] || '';
    return {
      url,
      ok: r.ok,
      status: r.status,
      finalUrl: r.url,
      title: title.trim().slice(0, 80),
      bytes: text.length,
    };
  } catch (e) {
    return { url, ok: false, status: 0, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

export async function smokeTarget(id) {
  const t = DEPLOY_TARGETS[id];
  if (!t) throw new Error(`Unknown target: ${id}`);
  const urls = t.smoke || [t.live];
  const results = [];
  for (const u of urls) {
    results.push(await smokeUrl(u));
  }
  return { id, results, ok: results.every((r) => r.ok) };
}

export async function smokeAll() {
  const out = [];
  for (const id of Object.keys(DEPLOY_TARGETS)) {
    out.push(await smokeTarget(id));
  }
  return out;
}

export function runDeploy(id, { dry = false } = {}) {
  const t = DEPLOY_TARGETS[id];
  if (!t) throw new Error(`Unknown target: ${id}. Use: ${Object.keys(DEPLOY_TARGETS).join(', ')}`);
  const root = resolveRoot(t);
  if (!root) {
    return { ok: false, error: `Local repo not found for ${id}`, candidates: t.rootCandidates };
  }
  const argv = t.cmd(root);
  const cwd = t.cwd ? root : process.cwd();
  console.log(`\n→ Deploy ${t.label}`);
  console.log(`  root  ${root}`);
  console.log(`  cwd   ${cwd}`);
  console.log(`  cmd   ${argv.join(' ')}`);
  if (dry) {
    console.log('  (dry-run — not executed)\n');
    return { ok: true, dry: true, argv, cwd };
  }
  const [bin, ...args] = argv;
  const r = spawnSync(bin, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || 'ee475864561b02d4588180b8b9acf694',
    },
  });
  return { ok: r.status === 0, status: r.status, argv, cwd };
}

export function printDeployList() {
  console.log('══ Deploy helper ══\n');
  console.log(`  wrangler: ${which('wrangler') || 'npx wrangler'}`);
  console.log(`  vercel:   ${which('vercel') || 'npx vercel'}\n`);
  for (const row of listDeployTargets()) {
    console.log(`  ${row.ready ? '●' : '○'} ${row.id.padEnd(20)} ${row.label}`);
    console.log(`      live  ${row.live}`);
    console.log(`      root  ${row.root}`);
    if (row.notes) console.log(`      note  ${row.notes}`);
    console.log('');
  }
  console.log('  Run:  npm run helper -- deploy run <id>');
  console.log('  Dry:  npm run helper -- deploy run <id> --dry');
  console.log('  Smoke: npm run helper -- deploy smoke [id]\n');
  return 0;
}

export async function printDeploySmoke(id) {
  console.log('══ Deploy smoke ══\n');
  const rows = id ? [await smokeTarget(id)] : await smokeAll();
  let fail = 0;
  for (const row of rows) {
    console.log(`  [${row.id}] ${row.ok ? 'PASS' : 'FAIL'}`);
    for (const r of row.results) {
      if (!r.ok) fail++;
      console.log(
        `    ${r.ok ? '✓' : '✗'} ${r.status || '—'} ${r.url}` +
          (r.title ? `  · ${r.title}` : '') +
          (r.error ? `  · ${r.error}` : ''),
      );
    }
    console.log('');
  }
  return fail ? 1 : 0;
}

// CLI when run directly
const isMain =
  process.argv[1] &&
  path.normalize(process.argv[1]).includes(`${path.sep}deploy-helper.mjs`);

if (isMain) {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'list' || !cmd) {
    process.exit(printDeployList());
  } else if (cmd === 'smoke') {
    process.exit(await printDeploySmoke(a));
  } else if (cmd === 'run') {
    const dry = process.argv.includes('--dry');
    const r = runDeploy(a, { dry });
    if (!r.ok) {
      console.error(r.error || `exit ${r.status}`);
      process.exit(1);
    }
    process.exit(0);
  } else {
    console.log('Usage: deploy-helper list | smoke [id] | run <id> [--dry]');
    process.exit(1);
  }
}

export default { DEPLOY_TARGETS, listDeployTargets, smokeTarget, smokeAll, runDeploy, printDeployList };
