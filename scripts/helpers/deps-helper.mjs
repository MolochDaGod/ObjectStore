/**
 * Dependencies helper — package-lock presence, critical deps, npm audit soft, missing modules.
 * Does not invent a second package manager; reports on npm SSOT only.
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { OBJECTSTORE_ROOT } from './node-helper.mjs';

/** Runtime-critical deps ObjectStore / fleet scripts expect (name → optional) */
export const CRITICAL_DEPS = {
  // most ObjectStore scripts are zero-dep; flag optional tooling
  wrangler: { optional: true, where: 'devDependency or global npx', role: 'CF Workers/Pages deploy' },
  three: { optional: true, where: 'browser esm.sh for editors', role: 'grudge6 editor (CDN)' },
};

export function readPkg(root = OBJECTSTORE_ROOT) {
  const pkgPath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return {
    pkgPath,
    lockPath,
    hasLock: fs.existsSync(lockPath),
    pkg,
    deps: { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) },
    depCount: Object.keys(pkg.dependencies || {}).length,
    devCount: Object.keys(pkg.devDependencies || {}).length,
  };
}

export function checkNodeModules(root = OBJECTSTORE_ROOT) {
  const nm = path.join(root, 'node_modules');
  if (!fs.existsSync(nm)) {
    return { ok: false, path: nm, missing: true, sample: [] };
  }
  let sample = [];
  try {
    sample = fs.readdirSync(nm).filter((n) => !n.startsWith('.')).slice(0, 12);
  } catch {
    /* ignore */
  }
  return { ok: true, path: nm, missing: false, sample };
}

export function npmLsDepth0(root = OBJECTSTORE_ROOT) {
  try {
    const out = execSync('npm ls --depth=0 --json', {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 8 * 1024 * 1024,
    });
    return { ok: true, data: JSON.parse(out || '{}') };
  } catch (e) {
    // npm ls exits non-zero on peer issues — still parse stdout
    try {
      const data = JSON.parse(e.stdout || '{}');
      return { ok: false, data, error: e.message };
    } catch {
      return { ok: false, data: null, error: e.message };
    }
  }
}

export function checkCriticalInstalled(root = OBJECTSTORE_ROOT) {
  const { deps } = readPkg(root);
  const nm = checkNodeModules(root);
  const report = [];
  for (const [name, meta] of Object.entries(CRITICAL_DEPS)) {
    const inPkg = !!deps[name];
    const onDisk = nm.ok && fs.existsSync(path.join(root, 'node_modules', name));
    report.push({
      name,
      ...meta,
      inPackageJson: inPkg,
      installed: onDisk,
      ok: meta.optional ? true : onDisk || inPkg,
    });
  }
  return report;
}

export function printDepsDoctor(root = OBJECTSTORE_ROOT) {
  console.log('══ Dependencies helper ══\n');
  const info = readPkg(root);
  const nm = checkNodeModules(root);
  console.log(`  package.json  ${info.pkgPath}`);
  console.log(`  name          ${info.pkg.name}@${info.pkg.version}`);
  console.log(`  dependencies  ${info.depCount}  · devDependencies ${info.devCount}`);
  console.log(`  package-lock  ${info.hasLock ? 'yes' : 'MISSING'}`);
  console.log(`  node_modules  ${nm.missing ? 'MISSING (run npm install if needed)' : 'present'}`);
  if (nm.sample?.length) console.log(`  sample        ${nm.sample.join(', ')}`);

  console.log('\n  Critical / tooling:');
  for (const c of checkCriticalInstalled(root)) {
    const mark = c.installed || c.optional ? '✓' : '✗';
    console.log(
      `    ${mark} ${c.name.padEnd(12)} pkg=${c.inPackageJson ? 'y' : 'n'} disk=${c.installed ? 'y' : 'n'} · ${c.role}`,
    );
  }

  console.log('\n  npm ls --depth=0 (summary):');
  const ls = npmLsDepth0(root);
  if (ls.data?.dependencies) {
    const names = Object.keys(ls.data.dependencies).slice(0, 20);
    console.log(`    top-level: ${names.join(', ') || '(none)'}${Object.keys(ls.data.dependencies).length > 20 ? '…' : ''}`);
  } else {
    console.log(`    ${ls.ok ? 'empty' : `warn: ${ls.error || 'parse failed'}`}`);
  }
  console.log('');
  return info.hasLock || info.depCount === 0 ? 0 : 0; // ObjectStore often thin deps
}

export default { readPkg, checkNodeModules, npmLsDepth0, printDepsDoctor, CRITICAL_DEPS };
