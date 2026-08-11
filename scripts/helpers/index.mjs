#!/usr/bin/env node
/**
 * Grudge ObjectStore helper CLI — single entry for agents/ops.
 *
 *   npm run helper -- doctor
 *   npm run helper -- node
 *   npm run helper -- deps
 *   npm run helper -- package
 *   npm run helper -- package --all
 *   npm run helper -- deploy list
 *   npm run helper -- deploy smoke
 *   npm run helper -- deploy smoke wcs
 *   npm run helper -- deploy run wcs --dry
 *   npm run helper -- ai list
 *   npm run helper -- ai smoke
 *   npm run helper -- ai run prefab-anim
 *
 * SSOT: docs/HELPERS_SSOT.md
 */
import { printNodeDoctor } from './node-helper.mjs';
import { printDepsDoctor } from './deps-helper.mjs';
import { printPackageDoctor } from './package-helper.mjs';
import { printDeployList, printDeploySmoke, runDeploy } from './deploy-helper.mjs';
import { printWorkerList, smokeWorker, runWorker, AI_WORKERS } from './ai-worker-helper.mjs';

const args = process.argv.slice(2);
const cmd = (args[0] || 'doctor').toLowerCase();
const rest = args.slice(1);

function help() {
  console.log(`
Grudge helpers — ObjectStore ops toolkit

  doctor              Node + deps + package + deploy list + AI workers
  node                Node version / tool paths
  deps                package-lock, node_modules, critical deps
  package [--all]     npm scripts inventory
  deploy list         Deploy target registry
  deploy smoke [id]   HEAD/GET live URLs
  deploy run <id> [--dry]
  ai list             AI worker registry
  ai smoke [id]       Smoke worker surfaces
  ai run <id>         Run worker batch (prefab-anim, fleet-env, …)

Deploy ids: wcs | objectstore-pages | objectstore-vercel | craft | ui-main-panel
AI ids:     ${Object.keys(AI_WORKERS).join(' | ')}
`);
}

async function doctor() {
  console.log('══ Grudge helper doctor (all) ══\n');
  let code = 0;
  code |= printNodeDoctor();
  code |= printDepsDoctor();
  code |= printPackageDoctor(undefined, { limit: 12 });
  code |= printDeployList();
  code |= printWorkerList();
  console.log('══ deploy smoke (quick) ══\n');
  code |= await printDeploySmoke('wcs');
  return code ? 1 : 0;
}

async function main() {
  switch (cmd) {
    case 'help':
    case '-h':
    case '--help':
      help();
      return 0;
    case 'doctor':
    case 'all':
      return doctor();
    case 'node':
      return printNodeDoctor();
    case 'deps':
    case 'dependencies':
      return printDepsDoctor();
    case 'package':
    case 'pkg':
      return printPackageDoctor(undefined, {
        all: rest.includes('--all'),
        limit: rest.includes('--all') ? 80 : 24,
      });
    case 'deploy': {
      const sub = (rest[0] || 'list').toLowerCase();
      if (sub === 'list') return printDeployList();
      if (sub === 'smoke') return printDeploySmoke(rest[1]);
      if (sub === 'run') {
        const dry = rest.includes('--dry');
        const id = rest.find((a) => a !== 'run' && a !== '--dry' && !a.startsWith('-'));
        if (!id) {
          console.error('deploy run <id> [--dry]');
          return 1;
        }
        const r = runDeploy(id, { dry });
        if (!r.ok) {
          console.error(r.error || `exit ${r.status}`);
          return 1;
        }
        return 0;
      }
      help();
      return 1;
    }
    case 'ai':
    case 'worker':
    case 'ai-worker': {
      const sub = (rest[0] || 'list').toLowerCase();
      if (sub === 'list') return printWorkerList();
      if (sub === 'smoke') {
        if (rest[1]) return smokeWorker(rest[1]);
        let fail = 0;
        for (const id of Object.keys(AI_WORKERS)) {
          fail |= await smokeWorker(id);
          console.log('');
        }
        return fail ? 1 : 0;
      }
      if (sub === 'run') {
        const id = rest[1];
        if (!id) {
          console.error('ai run <id>');
          return 1;
        }
        return runWorker(id, rest.slice(2));
      }
      help();
      return 1;
    }
    default:
      console.error(`Unknown command: ${cmd}`);
      help();
      return 1;
  }
}

const code = await main();
process.exit(code ?? 0);
