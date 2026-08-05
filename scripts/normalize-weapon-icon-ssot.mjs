/**
 * Normalize weapon/item icon URLs to Desktop pack + ICON CDN SSOT.
 *
 * Rules:
 * 1. Desktop pack basenames are truth (shield_4 not shield_04; staff_2 not staff_02).
 * 2. Pack icons use assets CDN under game-assets/icons/pack/ (lib/icon-resolver.js).
 * 3. Do NOT rewrite tools/ (often only on /icons/tools/, not game-assets).
 * 4. Do NOT bulk-rewrite github.io in asset-registry / models3d (legacy R2 backfill).
 *
 * Usage: node scripts/normalize-weapon-icon-ssot.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const TARGETS = [
  "api/v1/master-items.json",
  "api/v1/master-registry.json",
  "api/v1/master-item-prefabs.json",
  "api/v1/master-weapon-prefabs.json",
  "api/v1/master-weapons.json",
  "api/v1/master-artifacts.json",
  "api/v1/t0-weapons.json",
  "api/v1/master-t0-t1-addendum.json",
];

/** exact string replacements, order matters */
const REPLACEMENTS = [
  ["pack/weapons/shield_04.png", "pack/weapons/shield_4.png"],
  ["pack/weapons/staff_02.png", "pack/weapons/staff_2.png"],
  ["pack/weapons/staff_01.png", "pack/weapons/staff_1.png"],
  [
    "https://assets.grudge-studio.com/icons/pack/",
    "https://assets.grudge-studio.com/game-assets/icons/pack/",
  ],
  [
    "https://info.grudge-studio.com/icons/pack/",
    "https://assets.grudge-studio.com/game-assets/icons/pack/",
  ],
  [
    "https://assets.grudge-studio.com/icons/496_rpg_icons/",
    "https://assets.grudge-studio.com/game-assets/icons/496_rpg_icons/",
  ],
];

let total = 0;
for (const rel of TARGETS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.log("skip missing", rel);
    continue;
  }
  let raw = fs.readFileSync(full, "utf8");
  const before = raw;
  for (const [from, to] of REPLACEMENTS) {
    const n = raw.split(from).length - 1;
    if (n > 0) {
      raw = raw.split(from).join(to);
      total += n;
      console.log(`${rel}: ${n} × ${from} → ${to}`);
    }
  }
  if (raw !== before) fs.writeFileSync(full, raw);
  else console.log(`${rel}: noop`);
}
console.log("total replacements:", total);
