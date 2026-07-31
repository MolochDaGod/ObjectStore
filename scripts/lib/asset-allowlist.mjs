/**
 * Load and match asset allowlist (never auto-purge).
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { classifyEra } from "./asset-era.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = join(__dirname, "..", "..", "config", "asset-allowlist.json");

/**
 * @param {string} [configPath]
 */
export function loadAllowlist(configPath = DEFAULT_PATH) {
  if (!existsSync(configPath)) {
    return {
      pathPrefixes: [],
      pathIncludes: [],
      extensionsAlwaysKeep: [],
      erasProtected: [],
    };
  }
  return JSON.parse(readFileSync(configPath, "utf8"));
}

/**
 * @param {string} path
 * @param {ReturnType<typeof loadAllowlist>} allow
 */
export function isAllowlisted(path, allow) {
  const p = (path || "").replace(/\\/g, "/").toLowerCase();
  const era = classifyEra(p);

  if (allow.erasProtected?.includes(era)) return true;

  for (const pre of allow.pathPrefixes || []) {
    if (p.includes(pre.toLowerCase().replace(/\\/g, "/"))) return true;
  }
  for (const inc of allow.pathIncludes || []) {
    if (p.includes(String(inc).toLowerCase())) return true;
  }
  const ext = (p.match(/(\.[a-z0-9]+)$/) || [])[1];
  if (ext && (allow.extensionsAlwaysKeep || []).map((e) => e.toLowerCase()).includes(ext)) {
    return true;
  }
  return false;
}
