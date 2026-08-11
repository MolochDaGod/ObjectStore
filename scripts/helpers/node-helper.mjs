/**
 * Node helper — engines, version gates, path, platform.
 * SSOT for agent/ops “is this machine ready to run ObjectStore scripts?”
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const OBJECTSTORE_ROOT = path.resolve(__dirname, '../..');

export const NODE_MIN_MAJOR = 20;
export const NODE_RECOMMENDED = '20.x or 22.x LTS';

export function nodeVersion() {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  return { major, minor, patch, raw: process.versions.node, v8: process.versions.v8 };
}

export function checkNodeEngines(pkgPath = path.join(OBJECTSTORE_ROOT, 'package.json')) {
  const issues = [];
  const v = nodeVersion();
  if (v.major < NODE_MIN_MAJOR) {
    issues.push(`Node ${v.raw} < required ${NODE_MIN_MAJOR}+ (${NODE_RECOMMENDED})`);
  }
  let engines = null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    engines = pkg.engines || null;
    if (engines?.node) {
      // soft check: ">=20" style
      const m = String(engines.node).match(/(\d+)/);
      if (m && v.major < Number(m[1])) {
        issues.push(`package.json engines.node=${engines.node} not satisfied by ${v.raw}`);
      }
    }
  } catch (e) {
    issues.push(`read package.json: ${e.message}`);
  }
  return {
    ok: issues.length === 0,
    version: v,
    engines,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    root: OBJECTSTORE_ROOT,
    issues,
  };
}

export function which(cmd) {
  try {
    const out = execSync(
      process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return out.trim().split(/\r?\n/)[0] || null;
  } catch {
    return null;
  }
}

export function toolPathReport() {
  const tools = ['node', 'npm', 'npx', 'git', 'wrangler', 'vercel', 'pwsh', 'blender'];
  const map = {};
  for (const t of tools) {
    map[t] = which(t);
  }
  // node/npm always via process
  map.node = map.node || process.execPath;
  return map;
}

export function printNodeDoctor() {
  const r = checkNodeEngines();
  const tools = toolPathReport();
  console.log('══ Node helper ══\n');
  console.log(`  Node ${r.version.raw}  (${r.ok ? 'OK' : 'FAIL'})  · ${NODE_RECOMMENDED}`);
  console.log(`  Platform ${r.platform}/${r.arch}`);
  console.log(`  CWD ${r.cwd}`);
  console.log(`  ObjectStore root ${r.root}`);
  if (r.engines) console.log(`  engines ${JSON.stringify(r.engines)}`);
  console.log('\n  Tool paths:');
  for (const [k, v] of Object.entries(tools)) {
    console.log(`    ${v ? '✓' : '✗'} ${k.padEnd(10)} ${v || 'not found'}`);
  }
  if (r.issues.length) {
    console.log('\n  Issues:');
    for (const i of r.issues) console.log(`    · ${i}`);
  }
  console.log('');
  return r.ok ? 0 : 1;
}

export default { checkNodeEngines, nodeVersion, toolPathReport, printNodeDoctor, OBJECTSTORE_ROOT };
