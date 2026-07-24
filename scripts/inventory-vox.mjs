/**
 * MagicaVoxel .vox inventory — SIZE/XYZI counts for multi-model packs.
 * Usage: node scripts/inventory-vox.mjs path/to/Models.vox
 */
import fs from "fs";
import path from "path";

const file = process.argv[2] || "D:/Games/Models/_models_unzip/Models.vox";
if (!fs.existsSync(file)) {
  console.error("missing", file);
  process.exit(1);
}
const buf = fs.readFileSync(file);
const magic = buf.toString("ascii", 0, 4);
const ver = buf.readInt32LE(4);
if (magic !== "VOX ") {
  console.error("not a VOX file", magic);
  process.exit(1);
}

function readChunk(offset) {
  if (offset + 12 > buf.length) return null;
  const id = buf.toString("ascii", offset, offset + 4);
  const contentSize = buf.readInt32LE(offset + 4);
  const childrenSize = buf.readInt32LE(offset + 8);
  return {
    id,
    contentSize,
    childrenSize,
    contentStart: offset + 12,
    next: offset + 12 + contentSize + childrenSize,
  };
}

const main = readChunk(8);
const stats = {};
const models = [];
const names = [];
if (main?.id === "MAIN") {
  let p = main.contentStart + main.contentSize;
  const childEnd = p + main.childrenSize;
  while (p + 12 <= childEnd && p + 12 <= buf.length) {
    const c = readChunk(p);
    if (!c) break;
    stats[c.id] = (stats[c.id] || 0) + 1;
    if (c.id === "SIZE" && c.contentSize >= 12) {
      models.push({
        x: buf.readInt32LE(c.contentStart),
        y: buf.readInt32LE(c.contentStart + 4),
        z: buf.readInt32LE(c.contentStart + 8),
      });
    }
    // nTRN often holds name string after dict
    if (c.id === "nTRN" && c.contentSize > 8) {
      try {
        // node id int32 + dict: num pairs, then key/val strings (uint32 len + bytes)
        let o = c.contentStart + 4;
        const n = buf.readInt32LE(o);
        o += 4;
        for (let i = 0; i < n && o + 4 <= c.contentStart + c.contentSize; i++) {
          const klen = buf.readInt32LE(o);
          o += 4;
          const key = buf.toString("utf8", o, o + klen);
          o += klen;
          const vlen = buf.readInt32LE(o);
          o += 4;
          const val = buf.toString("utf8", o, o + vlen);
          o += vlen;
          if (key === "_name" && val) names.push(val);
        }
      } catch {
        /* ignore */
      }
    }
    if (c.next <= p) break;
    p = c.next;
  }
}

const inventory = {
  file: path.resolve(file),
  magic,
  version: ver,
  bytes: buf.length,
  chunkCounts: stats,
  modelCount: models.length,
  namedNodes: names,
  models: models.map((m, i) => ({
    index: i,
    size: m,
    volume: m.x * m.y * m.z,
    name: names[i] || null,
  })),
};

// Prefer D:/Games/Models/library/inventory when under Models tree
const modelsRoot = file.replace(/\\/g, "/").match(/^(.*\/Models)\//i)?.[1];
const outDir = modelsRoot
  ? path.join(modelsRoot, "library", "inventory")
  : path.join(path.dirname(file), "inventory");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, path.basename(file, path.extname(file)) + ".inventory.json");
fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2));
console.log(JSON.stringify({ outPath, modelCount: models.length, chunks: stats, named: names.length }, null, 2));
