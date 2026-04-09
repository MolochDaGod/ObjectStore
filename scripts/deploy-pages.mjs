#!/usr/bin/env node
/**
 * ObjectStore — Deploy to GitHub Pages (no Actions required)
 *
 * Creates/updates a `gh-pages` branch with only the files needed for GitHub Pages:
 * - api/v1/*.json (game data API)
 * - sdk/ (JavaScript SDK)
 * - docs/ (documentation)
 * - HTML pages (index, 2D_MODELS, etc.)
 * - css/, js/ (page assets)
 * - openapi.yaml, sw.js
 *
 * Binary assets (icons, sprites, images, models, audio, video) are excluded —
 * they're served from R2 CDN (assets.grudge-studio.com).
 *
 * Usage: node scripts/deploy-pages.mjs
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: 'pipe', ...opts }).trim();
}

console.log('Deploying ObjectStore to GitHub Pages (gh-pages branch)...\n');

// Get current commit info
const commitSha = run('git rev-parse --short HEAD');
const commitMsg = run('git log -1 --pretty=%s');

// Ensure we're on main
const branch = run('git branch --show-current');
if (branch !== 'main') {
  console.error(`ERROR: Must be on main branch (currently on ${branch})`);
  process.exit(1);
}

// Create a temporary worktree for gh-pages
const tmpDir = join(ROOT, '.gh-pages-tmp');

try {
  // Clean up any previous attempt
  try { run(`git worktree remove "${tmpDir}" --force`); } catch {}

  // Check if gh-pages branch exists
  let branchExists = false;
  try {
    run('git rev-parse --verify gh-pages');
    branchExists = true;
  } catch {}

  if (branchExists) {
    run(`git worktree add "${tmpDir}" gh-pages`);
  } else {
    run(`git worktree add --orphan "${tmpDir}" gh-pages`);
  }

  // Clean the worktree (remove everything)
  const cleanCmd = process.platform === 'win32'
    ? `powershell -Command "Get-ChildItem '${tmpDir}' -Exclude .git | Remove-Item -Recurse -Force"`
    : `find "${tmpDir}" -mindepth 1 -not -path "${tmpDir}/.git*" -delete`;
  try { execSync(cleanCmd, { stdio: 'pipe' }); } catch {}

  // Files/dirs to include on Pages (lightweight — JSON + HTML + JS + CSS)
  const includes = [
    'api/',           // JSON game data (23MB)
    'sdk/',           // JavaScript SDK
    'docs/',          // Documentation HTML
    'css/',           // Stylesheets
    'js/',            // Client-side JS
    'mcp/',           // MCP server
    'integrations/',  // Integration examples
    'branding/',      // Favicons + logos (3MB)
    'openapi.yaml',
    'sw.js',
    'README.md',
    'AGENTS.md',
    'AGENT-CONTEXT.md',
    'package.json',
  ];

  // Copy HTML files from root
  const robocopyOpts = '/S /NJH /NJS /NP /NFL /NDL';

  for (const item of includes) {
    const src = join(ROOT, item);
    const dest = join(tmpDir, item);
    if (item.endsWith('/')) {
      try {
        run(`robocopy "${src}" "${dest}" ${robocopyOpts}`, { stdio: 'pipe' });
      } catch (e) {
        // robocopy returns non-zero on success (1 = files copied)
        if (e.status > 7) throw e;
      }
    } else {
      try {
        run(`copy "${src}" "${dest}"`, { stdio: 'pipe' });
      } catch {}
    }
  }

  // Copy HTML files from root
  try {
    run(`robocopy "${ROOT}" "${tmpDir}" *.html ${robocopyOpts}`, { stdio: 'pipe' });
  } catch (e) {
    if (e.status > 7) throw e;
  }

  // Commit and push
  run(`git -C "${tmpDir}" add -A`);
  
  try {
    run(`git -C "${tmpDir}" commit -m "deploy: ${commitMsg} (${commitSha})\n\nCo-Authored-By: Oz <oz-agent@warp.dev>"`);
    run(`git push origin gh-pages --force`);
    console.log('\nDeployed to gh-pages branch!');
  } catch (e) {
    if (e.message?.includes('nothing to commit')) {
      console.log('\nNo changes to deploy.');
    } else {
      throw e;
    }
  }

} finally {
  // Clean up worktree
  try { run(`git worktree remove "${tmpDir}" --force`); } catch {}
}

console.log('Done. Configure Pages source: gh-pages branch, / (root)');
