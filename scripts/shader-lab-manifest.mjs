#!/usr/bin/env node
// Regenerate api/v1/shader-lab/manifest.json from the GLSL files living
// alongside it. Safe to run after adding or removing a shader — the
// output is a pure index with channel/author/shadertoy/license metadata
// extracted from each file's header comments.
//
// Usage:
//   npm run shader-lab:manifest
//   node scripts/shader-lab-manifest.mjs
//
// Channel header format (upstream lo-th/Shader.lab convention):
//   // ------------------ channel define
//   // 0_# noise #_0
//   // 1_# tex02 #_1
//   // ------------------
//
// `noise`, `tex*`, `bump`, `basic`, `stone`, `cartographer`, `orion` are
// flat textures under shader-lab/textures/. `cube_<name>` bindings map
// to a 6-face cubemap under shader-lab/textures/cube/<name>/. Buffer
// bindings (`buffer_*`, `bufferFULL_*`, `buffer64_*`) are multi-pass
// render targets fed by a sibling shader.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SHADER_ROOT = join(REPO_ROOT, 'api', 'v1', 'shader-lab');
const CATEGORIES = ['basic', 'advanced', 'function', 'hdr', 'test', 'texture', 'glsl'];

const CHANNEL_RE = /^\s*\/\/\s*(\d)_#\s*([\w-]+)\s*#_\1\s*$/m;
const AUTHOR_RE  = /^\s*\/\/\s*Author\s*:\s*(.+?)\s*$/im;
const URL_RE     = /(https?:\/\/(?:www\.)?shadertoy\.com\/view\/[A-Za-z0-9]+)/;
const LICENSE_RE = /^\s*\/\/\s*License\s*:\s*(.+?)\s*$/im;

function classifyBinding(name) {
  if (name.startsWith('buffer_') || name.startsWith('bufferFULL_') || name.startsWith('buffer64_')) return 'buffer';
  if (name.startsWith('cube_')) return 'cubemap';
  return 'texture';
}

function parseShader(src) {
  const channels = [];
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(CHANNEL_RE);
    if (m) channels.push({ slot: Number(m[1]), kind: classifyBinding(m[2]), name: m[2] });
  }
  const author  = (src.match(AUTHOR_RE)  || [])[1] || null;
  const url     = (src.match(URL_RE)     || [])[1] || null;
  const license = (src.match(LICENSE_RE) || [])[1] || null;
  return {
    channels: channels.sort((a, b) => a.slot - b.slot),
    author,
    shadertoyUrl: url,
    license,
    byteSize: Buffer.byteLength(src, 'utf8'),
  };
}

async function scanCategory(cat) {
  const dir = join(SHADER_ROOT, cat);
  const entries = await readdir(dir).catch(() => []);
  const out = [];
  for (const file of entries) {
    if (!file.endsWith('.glsl')) continue;
    const full = join(dir, file);
    const src = await readFile(full, 'utf8');
    const parsed = parseShader(src);
    out.push({
      category: cat,
      name: file.replace(/\.glsl$/, ''),
      path: `shader-lab/${cat}/${file}`,
      url: `https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/${cat}/${file}`,
      ...parsed,
    });
  }
  return out;
}

async function main() {
  const all = [];
  for (const cat of CATEGORIES) all.push(...await scanCategory(cat));

  const channelUsage = new Map();
  for (const s of all) {
    for (const c of s.channels) {
      const key = `${c.kind}:${c.name}`;
      channelUsage.set(key, (channelUsage.get(key) || 0) + 1);
    }
  }

  const manifest = {
    source: 'https://github.com/lo-th/Shader.lab',
    servedAt: 'https://molochdagod.github.io/ObjectStore/api/v1/shader-lab/',
    texturesServedAt: 'https://assets.grudge-studio.com/shader-lab/textures/',
    sharedVertexShader: 'shader-lab/basic/basic_vs.glsl',
    generatedAt: new Date().toISOString(),
    counts: {
      shaders: all.length,
      byCategory: Object.fromEntries(CATEGORIES.map(c => [c, all.filter(s => s.category === c).length])),
      withAuthor: all.filter(s => s.author).length,
      withShadertoyUrl: all.filter(s => s.shadertoyUrl).length,
      withLicense: all.filter(s => s.license).length,
    },
    channelVocabulary: Object.fromEntries(
      [...channelUsage.entries()].sort((a, b) => b[1] - a[1])
    ),
    shaders: all.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
  };

  const out = join(SHADER_ROOT, 'manifest.json');
  await writeFile(out, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${relative(REPO_ROOT, out)}`);
  console.log(`  ${manifest.counts.shaders} shaders across ${CATEGORIES.length} categories`);
  console.log(`  ${manifest.counts.withAuthor} with Author, ${manifest.counts.withShadertoyUrl} with shadertoy URL, ${manifest.counts.withLicense} with License`);
  console.log(`  ${Object.keys(manifest.channelVocabulary).length} unique channel bindings`);
}

main().catch(err => { console.error(err); process.exit(1); });
