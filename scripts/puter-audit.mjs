#!/usr/bin/env node
/**
 * Grudge Studio — Puter Audit & Integration Script
 * Audits all Grudge Studio apps and sites on Puter,
 * verifies connectivity, storage, and AI service availability.
 *
 * Usage:
 *   node scripts/puter-audit.mjs
 *   node scripts/puter-audit.mjs --fix       # attempt auto-remediation
 *   node scripts/puter-audit.mjs --report     # write report to docs/reports/
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ─── Configuration ────────────────────────────────────────────────────────────

const PUTER_API_BASE = 'https://api.puter.com';
const OBJECT_STORE_URL = 'https://molochdagod.github.io/ObjectStore';

/** All Grudge Studio apps/sites that should be audited. */
const GRUDGE_APPS = [
  {
    id: 'object-store',
    name: 'ObjectStore (Static API)',
    url: OBJECT_STORE_URL,
    healthEndpoints: [
      '/api/v1/weapons.json',
      '/api/v1/materials.json',
      '/api/v1/armor.json',
    ],
  },
  {
    id: 'warlord-crafting-suite',
    name: 'Warlord-Crafting-Suite',
    url: 'https://warlord-crafting-suite.vercel.app',
    healthEndpoints: ['/'],
  },
  {
    id: 'puter-grudge',
    name: 'PuterGrudge (Backend)',
    url: 'https://puter-monitor-ai.vercel.app',
    healthEndpoints: ['/'],
  },
  {
    id: 'grudge-warlords',
    name: 'GrudgeWarlords (Unity WebGL)',
    url: 'https://grudge-warlords.vercel.app',
    healthEndpoints: ['/'],
  },
];

/** Puter services to verify. */
const PUTER_SERVICES = [
  { id: 'puter-fs', name: 'Puter File System', endpoint: '/api/v1/filesystem/list' },
  { id: 'puter-ai', name: 'Puter AI (txt2img)', endpoint: '/api/v1/ai/txt2img' },
  { id: 'puter-kv', name: 'Puter Key-Value Store', endpoint: '/api/v1/kv/list' },
  { id: 'puter-auth', name: 'Puter Auth', endpoint: '/api/v1/auth/whoami' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

function log(msg) {
  process.stdout.write(msg + '\n');
}

function ok(msg) {
  log(`  ${GREEN}✔${RESET}  ${msg}`);
}

function fail(msg) {
  log(`  ${RED}✖${RESET}  ${msg}`);
}

function warn(msg) {
  log(`  ${YELLOW}⚠${RESET}  ${msg}`);
}

function info(msg) {
  log(`  ${CYAN}ℹ${RESET}  ${msg}`);
}

/**
 * Lightweight fetch wrapper that works in Node ≥ 18 (native fetch).
 * Returns { ok, status, latencyMs, error }.
 */
async function probe(url, { timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, latencyMs: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, latencyMs: Date.now() - start, error: err.message };
  }
}

// ─── Audit Sections ───────────────────────────────────────────────────────────

async function auditApps() {
  log(`\n${BOLD}${CYAN}━━━ Grudge Studio App Health ━━━${RESET}`);
  const results = [];

  for (const app of GRUDGE_APPS) {
    log(`\n  ${BOLD}${app.name}${RESET}  (${app.url})`);
    const appResult = { ...app, checks: [] };

    for (const ep of app.healthEndpoints) {
      const url = `${app.url}${ep}`;
      const { ok: isOk, status, latencyMs, error } = await probe(url);
      const check = { endpoint: ep, ok: isOk, status, latencyMs };
      appResult.checks.push(check);

      if (isOk) {
        ok(`${ep}  →  HTTP ${status}  (${latencyMs}ms)`);
      } else if (error) {
        fail(`${ep}  →  ${error}`);
      } else {
        fail(`${ep}  →  HTTP ${status}  (${latencyMs}ms)`);
      }
    }

    appResult.healthy = appResult.checks.every((c) => c.ok);
    results.push(appResult);
  }

  return results;
}

async function auditPuterServices() {
  log(`\n${BOLD}${CYAN}━━━ Puter Service Availability ━━━${RESET}`);
  const results = [];

  for (const svc of PUTER_SERVICES) {
    const url = `${PUTER_API_BASE}${svc.endpoint}`;
    const { ok: isOk, status, latencyMs, error } = await probe(url);
    const result = { ...svc, ok: isOk, status, latencyMs };
    results.push(result);

    if (isOk || status === 401) {
      // 401 means the endpoint exists but needs auth — service is reachable.
      ok(`${svc.name}  →  reachable  (HTTP ${status}, ${latencyMs}ms)`);
      result.ok = true;
    } else if (error) {
      warn(`${svc.name}  →  ${error}`);
    } else {
      fail(`${svc.name}  →  HTTP ${status}  (${latencyMs}ms)`);
    }
  }

  return results;
}

function auditObjectStoreAPIs() {
  log(`\n${BOLD}${CYAN}━━━ ObjectStore Local API Files ━━━${RESET}`);
  const apiDir = join(ROOT, 'api', 'v1');
  const required = [
    'weapons.json',
    'materials.json',
    'armor.json',
    'consumables.json',
    'skills.json',
    'professions.json',
    'sprites.json',
  ];

  const results = [];
  for (const file of required) {
    const path = join(apiDir, file);
    const present = existsSync(path);
    results.push({ file, present });
    if (present) {
      ok(`api/v1/${file}`);
    } else {
      warn(`api/v1/${file}  →  missing`);
    }
  }
  return results;
}

// ─── Report Generation ────────────────────────────────────────────────────────

function buildReport({ appResults, serviceResults, apiResults, timestamp }) {
  const date = timestamp.toISOString().split('T')[0];
  const healthyApps = appResults.filter((a) => a.healthy).length;
  const healthyServices = serviceResults.filter((s) => s.ok).length;
  const presentApis = apiResults.filter((a) => a.present).length;

  const appRows = appResults
    .map((a) => `| ${a.name} | ${a.healthy ? '✅ Healthy' : '⚠️ Issues'} | ${a.url} |`)
    .join('\n');

  const serviceRows = serviceResults
    .map((s) => `| ${s.name} | ${s.ok ? '✅ Reachable' : '❌ Unreachable'} | ${s.latencyMs}ms |`)
    .join('\n');

  const apiRows = apiResults
    .map((a) => `| ${a.file} | ${a.present ? '✅ Present' : '⚠️ Missing'} |`)
    .join('\n');

  return `# Puter Audit & Remediation Plan
**Date**: ${date}  
**Generated by**: \`scripts/puter-audit.mjs\`  
**Scope**: Grudge Studio apps, Puter services, ObjectStore API files

---

## Summary

| Category | Checked | Healthy/Present |
|----------|---------|-----------------|
| Apps & Sites | ${appResults.length} | ${healthyApps} |
| Puter Services | ${serviceResults.length} | ${healthyServices} |
| API Files | ${apiResults.length} | ${presentApis} |

---

## App & Site Health

| App | Status | URL |
|-----|--------|-----|
${appRows}

---

## Puter Service Availability

| Service | Status | Latency |
|---------|--------|---------|
${serviceRows}

---

## ObjectStore API Files

| File | Status |
|------|--------|
${apiRows}

---

## Remediation Actions

${
  appResults.some((a) => !a.healthy)
    ? `### Apps Requiring Attention\n\n${appResults
        .filter((a) => !a.healthy)
        .map(
          (a) =>
            `- **${a.name}** (${a.url})\n` +
            a.checks
              .filter((c) => !c.ok)
              .map((c) => `  - Endpoint \`${c.endpoint}\` returned HTTP ${c.status}`)
              .join('\n'),
        )
        .join('\n\n')}`
    : '### Apps ✅\nAll apps are healthy — no action required.'
}

${
  serviceResults.some((s) => !s.ok)
    ? `### Puter Services Requiring Attention\n\n${serviceResults
        .filter((s) => !s.ok)
        .map(
          (s) =>
            `- **${s.name}**: endpoint \`${s.endpoint}\` unreachable. ` +
            'Verify Puter API key and network connectivity.',
        )
        .join('\n')}`
    : '### Puter Services ✅\nAll Puter services are reachable.'
}

${
  apiResults.some((a) => !a.present)
    ? `### Missing API Files\n\n${apiResults
        .filter((a) => !a.present)
        .map((a) => `- \`api/v1/${a.file}\` — create or restore this file from source data.`)
        .join('\n')}`
    : '### API Files ✅\nAll required API files are present.'
}

---

## Next Steps

1. Address any failing apps listed above by checking deployment logs.
2. Ensure Puter API key (\`PUTER_API_KEY\`) is set in each service's environment.
3. Restore any missing \`api/v1/*.json\` files from the \`main\` branch or data sources.
4. Re-run \`npm run audit:puter\` after applying fixes to verify resolution.
5. Review \`docs/PUTER-AUDIT-INTEGRATION.md\` for full Puter integration guidance.

---

*Report generated on ${timestamp.toUTCString()} by Grudge Studio audit tooling.*
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const shouldFix = args.includes('--fix');
  const shouldReport = args.includes('--report');

  log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════╗${RESET}`);
  log(`${BOLD}${CYAN}║  Grudge Studio — Puter Audit v1.0        ║${RESET}`);
  log(`${BOLD}${CYAN}╚══════════════════════════════════════════╝${RESET}`);
  log(`\n  Date: ${new Date().toUTCString()}`);

  if (shouldFix) {
    info('--fix flag detected: auto-remediation mode (informational only for remote services)');
  }

  const timestamp = new Date();
  const [appResults, serviceResults] = await Promise.all([
    auditApps(),
    auditPuterServices(),
  ]);
  const apiResults = auditObjectStoreAPIs();

  // ── Summary ────────────────────────────────────────────────────────────────
  log(`\n${BOLD}${CYAN}━━━ Audit Summary ━━━${RESET}`);
  const allAppsHealthy = appResults.every((a) => a.healthy);
  const allServicesOk = serviceResults.every((s) => s.ok);
  const allApisPresent = apiResults.every((a) => a.present);

  if (allAppsHealthy) ok('All apps & sites are healthy');
  else fail(`${appResults.filter((a) => !a.healthy).length} app(s) have issues`);

  if (allServicesOk) ok('All Puter services are reachable');
  else warn(`${serviceResults.filter((s) => !s.ok).length} Puter service(s) unreachable`);

  if (allApisPresent) ok('All ObjectStore API files are present');
  else warn(`${apiResults.filter((a) => !a.present).length} API file(s) missing`);

  // ── Report ─────────────────────────────────────────────────────────────────
  if (shouldReport) {
    const reportsDir = join(ROOT, 'docs', 'reports');
    mkdirSync(reportsDir, { recursive: true });
    const dateStr = timestamp.toISOString().split('T')[0];
    const reportPath = join(reportsDir, `puter-remediation-plan-${dateStr}.md`);
    const content = buildReport({ appResults, serviceResults, apiResults, timestamp });
    writeFileSync(reportPath, content, 'utf8');
    ok(`Report written to docs/reports/puter-remediation-plan-${dateStr}.md`);
  } else {
    info('Run with --report to write a remediation plan to docs/reports/');
  }

  log('');
  process.exit(allAppsHealthy && allServicesOk && allApisPresent ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`[puter-audit] fatal: ${err.message}\n`);
  process.exit(1);
});
