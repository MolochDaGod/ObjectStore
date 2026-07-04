/**
 * Cached texture atlases for baking into game-ready GLBs.
 * Replaces uMMORPG 1x1 yellow placeholder data-URIs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import sharp from 'sharp';
import {
  CDN_PRIMARY,
  MODELS_DIR,
  ROOT,
  TOON_RTS_PACK,
  detectRaceFromName,
} from './model-game-utils.mjs';

const TEXTURES_DIR = path.join(MODELS_DIR, 'textures');
const PLACEHOLDER_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

const RACE_TGA_CANDIDATES = {
  barbarian: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/brb/Materials/BRB_StandardUnits_texture.tga',
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/brb/Materials/Color/textures/BRB_Standard_Units_brown.tga',
  ],
  orc: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/orc/Materials/textures/ORC_StandardUnits.tga',
  ],
  human: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/wk/Materials/textures/WK_Standard_Units.tga',
  ],
  elf: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/elf/Materials/ELF_WoodElves_Texture.tga',
  ],
  undead: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/ud/Materials/UD_Standard_Units.tga',
  ],
  dwarf: [
    'api/threejs-player-and-grass/threejs-player-and-grass/dist/assets/race-characters/dwf/Materials/DWF_Standard_Units.tga',
  ],
};

const cache = new Map();
let io = null;

async function getIO() {
  if (!io) io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  return io;
}

export function isPlaceholderDataUri(uri = '') {
  if (!uri || !/^data:/i.test(uri)) return false;
  if (uri.includes(PLACEHOLDER_B64)) return true;
  try {
    const b64 = uri.split(',')[1] || '';
    const buf = Buffer.from(b64, 'base64');
    return buf.length <= 120;
  } catch {
    return false;
  }
}

export function isPlaceholderImageBuffer(buf) {
  return buf && buf.length <= 120;
}

async function extractFirstTextureFromGlb(glbPath) {
  const reader = await getIO();
  const abs = path.isAbsolute(glbPath) ? glbPath : path.join(ROOT, glbPath);
  const doc = await reader.read(abs);
  const tex = doc.getRoot().listTextures()[0];
  if (!tex?.getImage()) return null;
  return { buffer: Buffer.from(tex.getImage()), mimeType: tex.getMimeType() || 'image/png' };
}

async function fetchRaceGlbTexture(race) {
  const url = `${TOON_RTS_PACK}/characters/${race}.glb`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = path.join(TEXTURES_DIR, `_tmp_${race}.glb`);
  fs.mkdirSync(TEXTURES_DIR, { recursive: true });
  fs.writeFileSync(tmp, buf);
  try {
    return await extractFirstTextureFromGlb(tmp);
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* ignore */ }
  }
}

/** Minimal uncompressed RGBA TGA reader (type 2, 32-bit). */
function readTgaRgba(buf) {
  if (buf.length < 18 || buf[0] !== 0) return null;
  const type = buf[2];
  if (type !== 2) return null;
  const width = buf.readUInt16LE(12);
  const height = buf.readUInt16LE(14);
  const bpp = buf[8];
  if (bpp !== 32 && bpp !== 24) return null;
  const offset = 18 + buf[0];
  const pixels = width * height;
  const out = Buffer.alloc(pixels * 4);
  let src = offset;
  for (let i = 0; i < pixels; i++) {
    const b = buf[src++];
    const g = buf[src++];
    const r = buf[src++];
    const a = bpp === 32 ? buf[src++] : 255;
    const di = i * 4;
    out[di] = r; out[di + 1] = g; out[di + 2] = b; out[di + 3] = a;
  }
  return { width, height, data: out };
}

async function loadTgaAsPng(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return null;
  const raw = fs.readFileSync(abs);
  const tga = readTgaRgba(raw);
  if (!tga) return null;
  const png = await sharp(tga.data, {
    raw: { width: tga.width, height: tga.height, channels: 4 },
  }).png().toBuffer();
  return { buffer: png, mimeType: 'image/png' };
}

async function loadRaceTexture(race) {
  for (const rel of RACE_TGA_CANDIDATES[race] || []) {
    const tga = await loadTgaAsPng(rel);
    if (tga) return tga;
  }
  return fetchRaceGlbTexture(race);
}

async function toGameTexture(entry) {
  let png = entry.buffer;
  if (entry.mimeType !== 'image/png') {
    png = await sharp(entry.buffer).png({ quality: 92, compressionLevel: 9 }).toBuffer();
  }
  const meta = await sharp(png).metadata();
  if ((meta.width || 0) > 1024 || (meta.height || 0) > 1024) {
    png = await sharp(png)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .png({ quality: 92, compressionLevel: 9 })
      .toBuffer();
  }
  return { buffer: png, mimeType: 'image/png' };
}

export async function getAtlasTexture(key) {
  if (cache.has(key)) return cache.get(key);

  let entry = null;
  if (key === 'bl-fantasy') {
    entry = await extractFirstTextureFromGlb('models/weapons/axe/Axe.glb');
  } else if (RACE_TGA_CANDIDATES[key]) {
    entry = await loadRaceTexture(key);
  }

  if (!entry?.buffer || isPlaceholderImageBuffer(entry.buffer)) {
    throw new Error(`Atlas "${key}" unavailable`);
  }

  const tex = await toGameTexture(entry);
  cache.set(key, tex);

  fs.mkdirSync(TEXTURES_DIR, { recursive: true });
  fs.writeFileSync(path.join(TEXTURES_DIR, `${key}.png`), tex.buffer);

  return tex;
}

export function resolveWeaponAtlasKey(name = '', relPath = '') {
  const race = detectRaceFromName(name) || detectRaceFromName(path.basename(relPath));
  if (race) return race;
  if (/^orc_/i.test(name)) return 'orc';
  return 'bl-fantasy';
}

export async function preloadWeaponAtlases() {
  const keys = ['bl-fantasy', 'barbarian', 'orc', 'human', 'elf', 'undead', 'dwarf'];
  const loaded = {};
  for (const key of keys) {
    try {
      await getAtlasTexture(key);
      loaded[key] = true;
    } catch (err) {
      loaded[key] = err.message;
    }
  }
  return loaded;
}