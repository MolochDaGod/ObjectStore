#!/usr/bin/env node
/**
 * Bake 256² Super Terrain channel / kind albedo PNGs (not 20 MB Ground_N).
 * Usage: node scripts/bake-super-terrain-surfaces.mjs
 */
import { createWriteStream, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "dist", "super-terrain", "textures");

const CHANNELS = {
  grass: [0x4f, 0x7d, 0x32],
  rock: [0x77, 0x73, 0x6c],
  soil: [0x60, 0x47, 0x33],
  snow: [0xdc, 0xe4, 0xee],
};

const KINDS = {
  "harbor-atoll": [0xd4, 0xc4, 0x9a],
  "volcanic-ridge": [0x6b, 0x1c, 0x08],
  "frozen-fjord": [0xe8, 0xee, 0xf4],
  "alpine-mesh": [0x5a, 0x54, 0x4c],
  "granite-csg": [0x77, 0x73, 0x6c],
  "spline-forest": [0x1a, 0x3d, 0x14],
  "tunnel-cavern": [0x3a, 0x34, 0x2c],
};

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const tag = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tag, data])), 0);
  return Buffer.concat([len, tag, data, crc]);
}

function writePng(path, size, rgbAt) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = rgbAt(x, y);
      const i = row + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  mkdirSync(dirname(path), { recursive: true });
  const ws = createWriteStream(path);
  ws.end(png);
}

function grain(base, x, y, seed) {
  const n = Math.sin(x * 0.17 + y * 0.31 + seed) * 43758.5453;
  const f = n - Math.floor(n);
  const d = 0.78 + f * 0.36;
  return base.map((c) => Math.max(0, Math.min(255, Math.round(c * d))));
}

const SIZE = 256;
mkdirSync(OUT, { recursive: true });
for (const [name, rgb] of Object.entries(CHANNELS)) {
  const dest = join(OUT, `channel-${name}.png`);
  writePng(dest, SIZE, (x, y) => grain(rgb, x, y, 1));
  console.log("wrote", dest);
}
for (const [name, rgb] of Object.entries(KINDS)) {
  const dest = join(OUT, `kind-${name}.png`);
  writePng(dest, SIZE, (x, y) => grain(rgb, x, y, 3));
  console.log("wrote", dest);
}
console.log("ok", OUT);
