#!/usr/bin/env node
/**
 * csv-to-json.mjs — Reads CSV files from data/csv/ and generates
 * master JSON files in api/v1/. Auto-generates GRUDGE UUIDs for rows
 * that don't already have one.
 *
 * Usage:
 *   node scripts/csv-to-json.mjs           # convert all CSVs
 *   node scripts/csv-to-json.mjs --dry     # preview without writing
 *
 * UUID format: {PREFIX}-{TIMESTAMP}-{SEQ}-{HASH}
 *   PREFIX: ITEM, BLDG, MNT, RECP, MATL, etc.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');
const CSV_DIR = join(ROOT, 'data', 'csv');
const API_DIR = join(ROOT, 'api', 'v1');
const DRY = process.argv.includes('--dry');

// ── UUID Generator ──
const TS = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
let seqCounter = 0;

function generateUUID(prefix, name) {
  const seq = String(seqCounter++).padStart(6, '0');
  const hash = createHash('md5').update(name + seq).digest('hex').slice(0, 8).toUpperCase();
  return `${prefix}-${TS}-${seq}-${hash}`;
}

// ── CSV Parser (handles quoted fields with commas) ──
function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      let v = (vals[i] || '').trim();
      // Auto-type numbers
      if (/^\d+$/.test(v)) v = parseInt(v, 10);
      else if (/^\d+\.\d+$/.test(v)) v = parseFloat(v);
      obj[h] = v;
    });
    return obj;
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += c;
  }
  result.push(current);
  return result;
}

// ── Converters ──
const CONVERTERS = {
  't0-items.csv': (rows) => {
    const PREFIX = 'ITEM';
    const items = rows.map(r => ({
      uuid: r.uuid || generateUUID(PREFIX, r.name),
      name: r.name,
      baseName: r.baseName || r.name,
      category: r.category,
      type: r.type || 'weapon',
      tier: r.tier || 0,
      tierLabel: r.tierLabel || 'Starter',
      tierColor: r.tierColor || '#5c5040',
      damage: r.damage || 0,
      speed: r.speed || 1.0,
      defense: r.defense || 0,
      iconUrl: r.iconUrl || '',
      craftedBy: r.craftedBy || null,
      description: r.description || '',
      tags: typeof r.tags === 'string' ? r.tags.split(';').map(t => t.trim()) : [],
    }));
    return {
      file: 'master-t0-items.json',
      data: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        description: 'T0 Starter items — crude/broken gear every player begins with',
        totalItems: items.length,
        items,
      }
    };
  },

  'buildings.csv': (rows) => {
    const items = rows.map(r => ({
      uuid: r.uuid || generateUUID('BLDG', r.name),
      name: r.name,
      category: r.category || 'building',
      profession: r.profession || 'none',
      tier: r.tier || 0,
      iconUrl: r.iconUrl || '',
      description: r.description || '',
      buildMaterials: typeof r.buildMaterials === 'string'
        ? r.buildMaterials.split(';').map(m => {
            const match = m.trim().match(/^(.+)\s+x(\d+)$/);
            return match ? { name: match[1], quantity: parseInt(match[2]) } : { name: m.trim(), quantity: 1 };
          })
        : [],
      tags: typeof r.tags === 'string' ? r.tags.split(';').map(t => t.trim()) : [],
    }));
    return {
      file: 'master-buildings.json',
      data: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        description: 'Buildings, crafting stations, storage, and utility structures',
        totalBuildings: items.length,
        categories: {
          crafting_station: { name: 'Crafting Stations', count: items.filter(i => i.category === 'crafting_station').length },
          storage: { name: 'Storage', count: items.filter(i => i.category === 'storage').length },
          territory: { name: 'Territory', count: items.filter(i => i.category === 'territory').length },
          utility: { name: 'Utility', count: items.filter(i => i.category === 'utility').length },
        },
        buildings: items,
      }
    };
  },

  'mounts.csv': (rows) => {
    const items = rows.map(r => ({
      uuid: r.uuid || generateUUID('MNT', r.name),
      name: r.name,
      race: r.race || 'any',
      levelReq: r.levelReq || 10,
      speed: r.speed || 1.5,
      iconUrl: r.iconUrl || '',
      description: r.description || '',
      obtainedFrom: r.obtainedFrom || '',
      tags: typeof r.tags === 'string' ? r.tags.split(';').map(t => t.trim()) : [],
    }));
    return {
      file: 'master-mounts.json',
      data: {
        version: '1.0.0',
        generated: new Date().toISOString(),
        description: 'Mounts — race-specific and universal rideable creatures and vehicles',
        totalMounts: items.length,
        mounts: items,
      }
    };
  },
};

// ── Main ──
console.log(`[csv-to-json] Scanning ${CSV_DIR}`);
const csvFiles = readdirSync(CSV_DIR).filter(f => f.endsWith('.csv'));
console.log(`[csv-to-json] Found ${csvFiles.length} CSV files: ${csvFiles.join(', ')}`);

for (const csvFile of csvFiles) {
  const converter = CONVERTERS[csvFile];
  if (!converter) { console.warn(`[csv-to-json] No converter for ${csvFile}, skipping`); continue; }

  const raw = readFileSync(join(CSV_DIR, csvFile), 'utf-8');
  const rows = parseCSV(raw);
  console.log(`[csv-to-json] ${csvFile}: ${rows.length} rows`);

  const result = converter(rows);
  const outPath = join(API_DIR, result.file);
  const json = JSON.stringify(result.data, null, 2);

  if (DRY) {
    console.log(`[csv-to-json] DRY: would write ${outPath} (${json.length} bytes, ${rows.length} items)`);
  } else {
    writeFileSync(outPath, json);
    console.log(`[csv-to-json] Wrote ${result.file} (${json.length} bytes, ${rows.length} items)`);
  }

  // Write back UUIDs to CSV if any were generated
  if (!DRY) {
    const items = result.data.items || result.data.buildings || result.data.mounts || [];
    const headers = parseCSVLine(raw.split('\n')[0]);
    const uuidIdx = headers.indexOf('uuid');
    if (uuidIdx >= 0) {
      const csvLines = raw.replace(/\r/g, '').split('\n').filter(l => l.trim());
      const newLines = [csvLines[0]];
      for (let i = 0; i < items.length; i++) {
        const fields = parseCSVLine(csvLines[i + 1] || '');
        if (!fields[uuidIdx] || fields[uuidIdx].trim() === '') fields[uuidIdx] = items[i].uuid;
        newLines.push(fields.join(','));
      }
      writeFileSync(join(CSV_DIR, csvFile), newLines.join('\n') + '\n');
    }
  }
}

console.log('[csv-to-json] Done.');
