/**
 * Stable paths for Toon_RTS author pack.
 * Prefer the junction / extract — never invent a second author tree.
 */
import fs from "node:fs";
import path from "node:path";

export const PROD_ROOT = "C:\\Users\\nugye\\Desktop\\grudgeproduction";
export const ZIP_PATH = path.join(PROD_ROOT, "Toon_RTS.zip");
/** Junction → extract (preferred working root). */
export const AUTHOR_ROOT = path.join(PROD_ROOT, "Toon_RTS");
export const EXTRACT_ROOT = path.join(PROD_ROOT, "Toon_RTS_extract", "Toon_RTS");

export const RACES = [
  { folder: "WesternKingdoms", prefix: "WK_", short: "wk", libraryId: "human" },
  { folder: "Barbarians", prefix: "BRB_", short: "brb", libraryId: "barbarian" },
  { folder: "Elves", prefix: "ELF_", short: "elf", libraryId: "elf" },
  { folder: "Dwarves", prefix: "DWF_", short: "dwf", libraryId: "dwarf" },
  { folder: "Orcs", prefix: "ORC_", short: "orc", libraryId: "orc" },
  { folder: "Undead", prefix: "UD_", short: "ud", libraryId: "undead" },
];

export function resolveAuthorRoot(override) {
  if (override && fs.existsSync(override)) return path.resolve(override);
  if (fs.existsSync(AUTHOR_ROOT)) return AUTHOR_ROOT;
  if (fs.existsSync(EXTRACT_ROOT)) return EXTRACT_ROOT;
  return null;
}

export function assertAuthorRoot(override) {
  const root = resolveAuthorRoot(override);
  if (!root) {
    throw new Error(
      `Toon_RTS author root not found.\n` +
        `  Expected junction: ${AUTHOR_ROOT}\n` +
        `  Or extract:        ${EXTRACT_ROOT}\n` +
        `  Zip (extract first): ${ZIP_PATH}`,
    );
  }
  return root;
}

export function walkFiles(dir, filterFn, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(full, filterFn, acc);
    else if (!filterFn || filterFn(full, ent.name)) acc.push(full);
  }
  return acc;
}
