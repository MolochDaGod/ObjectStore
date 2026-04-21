#!/usr/bin/env node
/**
 * Case-preserving `gdevelop` -> `grudgedot` rewriter.
 *
 * Rewrites file CONTENTS (not filenames) across a tree, preserving case:
 *   GDEVELOP           -> GRUDGEDOT
 *   GDevelopAssistant  -> grudgedotLauncher    (special: project-name hyphen-dropped)
 *   GDevelop           -> grudgeDot
 *   gdevelop           -> grudgedot
 *
 * Hard skiplist (files/paths that intentionally keep `gdevelop`):
 *   - Any path matching SKIP_PATTERNS below
 *   - Binary files (.png/.jpg/.glb/.mp3/…)
 *   - node_modules, .git, dist, build, .vite, .next, .turbo, coverage
 *
 * Soft skiplist (warn but still rewrite):
 *   - package-lock.json  (rewritten; npm install will overwrite anyway)
 *
 * Usage:
 *   node scripts/rename-gdevelop.mjs [root]          # dry-run by default
 *   node scripts/rename-gdevelop.mjs [root] --write  # apply changes
 *   node scripts/rename-gdevelop.mjs [root] --stats  # just counts per file
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const root = args.find((a) => !a.startsWith('--')) || process.cwd();
const WRITE = args.includes('--write');
const STATS_ONLY = args.includes('--stats');

// ── Skip lists ───────────────────────────────────────────────────────

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.vite', '.next', '.turbo',
  'coverage', '.vercel', '.wrangler', '.cache', '.local', 'out',
]);

const SKIP_PATTERNS = [
  // Files whose purpose is to DOCUMENT the rename (keep verbatim mentions)
  /CLOUDFLARE_ADOPTION\.md$/i,
  /CLOUDFLARE_DNS_PLAN\.md$/i,
  /RENAME_.*\.md$/i,
  /MIGRATION.*\.md$/i,

  // DB migration snapshots — renaming would corrupt migration history
  /migrations[\\/].*snapshot.*\.json$/i,
  /migrations[\\/]meta/i,

  // The rename tool itself
  /rename-gdevelop\.mjs$/i,

  // CF-admin uses "gdevelop-audit" as a tool command name; it's a legitimate
  // reference to the old name for audit purposes.
  /scripts[\\/]cf-admin\.mjs$/i,
];

const TEXT_EXT = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.d.ts',
  '.json', '.yaml', '.yml', '.toml', '.md', '.txt', '.html', '.htm',
  '.css', '.scss', '.sass', '.less',
  '.sh', '.bash', '.ps1', '.bat', '.cmd',
  '.env', '.example', '.template',
  '.sql', '.prisma', '.graphql', '.gql',
  '.xml', '.svg', '.rss', '.atom',
]);

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name) || name.startsWith('.');
}

function shouldSkipFile(fullPath) {
  if (SKIP_PATTERNS.some((re) => re.test(fullPath))) return true;
  const ext = path.extname(fullPath).toLowerCase();
  if (!ext) return false;      // allow extensionless config files
  if (!TEXT_EXT.has(ext)) return true;
  return false;
}

// ── Case-preserving rewrite ──────────────────────────────────────────

function rewrite(content) {
  // Order matters: most specific first.
  let n = 0;
  const apply = (re, replacer) => {
    content = content.replace(re, (...m) => { n++; return replacer(...m); });
  };

  // Special compound: GDevelopAssistant -> grudgedot-launcher (lower) / GrudgeDotLauncher (Pascal)
  apply(/GDevelopAssistant/g, () => 'grudgedot-launcher');
  apply(/gdevelop-assistant/g, () => 'grudgedot-launcher');
  apply(/GDEVELOP_ASSISTANT/g, () => 'GRUDGEDOT_LAUNCHER');

  // All-caps
  apply(/GDEVELOP/g, () => 'GRUDGEDOT');

  // Pascal
  apply(/GDevelop/g, () => 'grudgeDot');

  // Lowercase
  apply(/gdevelop/g, () => 'grudgedot');

  return { content, hits: n };
}

// ── Walker ────────────────────────────────────────────────────────────

function* walk(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (shouldSkipDir(e.name)) continue;
      yield* walk(full);
    } else if (e.isFile()) {
      yield full;
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────

const rootAbs = path.resolve(root);
console.log(`root:   ${rootAbs}`);
console.log(`mode:   ${WRITE ? 'WRITE (applying changes)' : STATS_ONLY ? 'STATS' : 'DRY-RUN'}`);
console.log('');

let totalFiles = 0, changedFiles = 0, totalHits = 0;
const perFile = [];

for (const file of walk(rootAbs)) {
  if (shouldSkipFile(file)) continue;
  totalFiles++;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch { continue; }
  if (!/gdevelop/i.test(text)) continue;

  const { content, hits } = rewrite(text);
  if (hits === 0) continue;

  changedFiles++;
  totalHits += hits;
  perFile.push({ file: path.relative(rootAbs, file), hits });

  if (WRITE) {
    fs.writeFileSync(file, content, 'utf8');
  }
}

perFile.sort((a, b) => b.hits - a.hits);
for (const p of perFile) {
  console.log(`  ${String(p.hits).padStart(4)}  ${p.file}`);
}

console.log('');
console.log(`files scanned: ${totalFiles}`);
console.log(`files with hits: ${changedFiles}`);
console.log(`total replacements: ${totalHits}`);
if (!WRITE && !STATS_ONLY) console.log('\n(dry-run — pass --write to apply)');
