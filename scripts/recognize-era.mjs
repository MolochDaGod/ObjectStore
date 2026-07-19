#!/usr/bin/env node
/**
 * Classify an R2-relative path or free-text tags into era + media dims.
 * Uses api/v1/era-recognition.json (no parallel rules).
 *
 * Usage:
 *   node scripts/recognize-era.mjs --path models/grudge6/races/WK_Characters.glb
 *   node scripts/recognize-era.mjs --text "spaceship fighter sci-fi"
 *   node scripts/recognize-era.mjs --path sprites/characters/orc.png --json
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RULES_PATH = join(ROOT, "api", "v1", "era-recognition.json");
const TAXONOMY_PATH = join(ROOT, "api", "v1", "era-asset-taxonomy.json");

function loadJson(p) {
  if (!existsSync(p)) throw new Error(`Missing ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
}

function parseArgs(argv) {
  const out = { path: null, text: "", json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--path") out.path = argv[++i];
    else if (a === "--text") out.text = argv[++i] || "";
    else if (a === "--json") out.json = true;
    else if (!a.startsWith("--") && !out.path) out.path = a;
  }
  return out;
}

function recognize({ path: r2Path, text }, rules, taxonomy) {
  const pathNorm = (r2Path || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const hay = `${pathNorm} ${text || ""}`.toLowerCase();
  let era = rules.defaultEra || "shared";
  let confidence = 0.2;
  let style = null;
  let dim = "unknown";
  let sector = null;
  const tags = [];

  for (const rule of rules.pathRules || []) {
    const re = new RegExp(rule.match, "i");
    if (pathNorm && re.test(pathNorm)) {
      if ((rule.confidence ?? 0.5) >= confidence) {
        era = rule.era;
        confidence = rule.confidence ?? 0.5;
        if (rule.style) style = rule.style;
        if (rule.dim) dim = rule.dim;
      }
    }
  }

  for (const rule of rules.keywordRules || []) {
    const hits = (rule.any || []).filter((k) => hay.includes(String(k).toLowerCase()));
    if (!hits.length) continue;
    const w = (rule.weight || 1) * hits.length * 0.1;
    if (rule.era && w + 0.4 > confidence) {
      era = rule.era;
      confidence = Math.min(1, confidence + w);
    }
    if (rule.style) style = rule.style;
    if (rule.dim) dim = rule.dim;
  }

  const ext = extname(pathNorm).toLowerCase();
  for (const hint of rules.mediaTypeHints || []) {
    if ((hint.ext || []).includes(ext)) {
      if (hint.dim) dim = hint.dim;
      if (hint.category && dim === "unknown") dim = hint.category;
    }
  }

  for (const id of rules.sectorRecognition?.warlordsOpenWorld || []) {
    if (hay.includes(id)) {
      sector = id;
      era = "warlords";
      confidence = Math.max(confidence, 0.95);
      break;
    }
  }

  tags.push(`era:${era}`);
  if (style) tags.push(`style:${style}`);
  if (dim && dim !== "unknown") tags.push(`dim:${dim}`);
  if (sector) tags.push(`sector:${sector}`);

  const eraDef = taxonomy?.eras?.[era] || taxonomy?.eras?.shared;
  let suggestedR2Prefix =
    eraDef?.uploadPrefixes?.characters ||
    eraDef?.cdnRoots?.[0] ||
    "models/";
  if (dim === "2d" && era === "shared") suggestedR2Prefix = "icons/";
  if (sector) suggestedR2Prefix = `models/environment/sectors/${sector}/`;

  return {
    path: pathNorm || null,
    era,
    style,
    dim,
    sector,
    tags,
    suggestedR2Prefix,
    confidence: Math.round(confidence * 100) / 100,
    catalogs: eraDef?.catalogs || [],
  };
}

const args = parseArgs(process.argv);
if (!args.path && !args.text) {
  console.error("Usage: node scripts/recognize-era.mjs --path <r2-relative> [--text ...] [--json]");
  process.exit(1);
}

const rules = loadJson(RULES_PATH);
const taxonomy = loadJson(TAXONOMY_PATH);
const result = recognize(args, rules, taxonomy);

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Grudge era recognition");
  console.log(`  path:        ${result.path || "(text only)"}`);
  console.log(`  era:         ${result.era}  (confidence ${result.confidence})`);
  console.log(`  dim:         ${result.dim}`);
  console.log(`  style:       ${result.style || "—"}`);
  console.log(`  sector:      ${result.sector || "—"}`);
  console.log(`  tags:        ${result.tags.join(", ")}`);
  console.log(`  R2 prefix:   ${result.suggestedR2Prefix}`);
  if (result.catalogs?.length) {
    console.log(`  catalogs:    ${result.catalogs.slice(0, 6).join(", ")}`);
  }
}

process.exit(0);
