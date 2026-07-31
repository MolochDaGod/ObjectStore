/**
 * load-fleet-env.mjs — Grudge Studio local credential bridge (ops only).
 *
 * Loads KEY=VALUE files from the machine vault pattern and aliases into the
 * standard process.env names used by R2 S3 scripts, cf-admin, and workers.
 *
 * NEVER logs secret values. Only key names / set|missing status.
 *
 * Priority (later does not override earlier when already set):
 *   1. process.env (already injected by shell / CI)
 *   2. Desktop vault files (secretnow.txt preferred)
 *   3. Repo-local .env / .dev.vars
 *   4. Legacy Grudge-Engine-Web .env (if present)
 *
 * Canonical vault (this machine):
 *   %USERPROFILE%\Desktop\secretnow.txt
 * Fallbacks: Desktop\secret.txt, Desktop\newenv.txt
 *
 * Aliases applied after load (fill empty targets only):
 *   CF_ACCOUNT_ID              → CLOUDFLARE_ACCOUNT_ID, R2_ACCOUNT_ID
 *   OBJECT_STORAGE_KEY         → R2_ACCESS_KEY_ID
 *   OBJECT_STORAGE_SECRET      → R2_SECRET_ACCESS_KEY
 *   OBJECT_STORAGE_BUCKET      → R2_BUCKET_NAME  (else R2_BUCKET_ASSETS)
 *   OBJECT_STORAGE_ENDPOINT    → R2_ENDPOINT (also parse account id if needed)
 *   CLOUDFLARE_USER_API / CF_WORKER_R2_API / CF_DNS_API_TOKEN → CLOUDFLARE_API_TOKEN
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const HOME = os.homedir();
const DESKTOP = path.join(HOME, "Desktop");

/** Ordered vault candidates — first files that exist are merged. */
export const FLEET_ENV_CANDIDATES = [
  path.join(DESKTOP, "secretnow.txt"),
  path.join(DESKTOP, "secret.txt"),
  path.join(DESKTOP, "newenv.txt"),
  path.join(process.cwd(), ".env"),
  path.join(process.cwd(), ".dev.vars"),
  path.join(process.cwd(), ".env.local"),
  "D:/Grudge-Engine-Web/.env",
  path.join(HOME, "Documents", "1111111", "GrudgeBuilder", ".env"),
];

/**
 * Parse KEY=VALUE lines. Skips comments / blanks. Strips optional quotes.
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
export function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const out = {};
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch {
    return {};
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (v.length) out[m[1]] = v;
  }
  return out;
}

/**
 * Set process.env[key] only if currently empty.
 * @param {string} key
 * @param {string|undefined} value
 */
function setIfEmpty(key, value) {
  if (!value) return false;
  if (process.env[key] && String(process.env[key]).trim() !== "") return false;
  process.env[key] = value;
  return true;
}

/**
 * Apply fleet aliases so scripts can use either secretnow or AWS-style names.
 */
export function applyFleetAliases() {
  const e = process.env;

  // Account id
  setIfEmpty("CLOUDFLARE_ACCOUNT_ID", e.CF_ACCOUNT_ID || e.R2_ACCOUNT_ID);
  setIfEmpty("CF_ACCOUNT_ID", e.CLOUDFLARE_ACCOUNT_ID || e.R2_ACCOUNT_ID);
  setIfEmpty("R2_ACCOUNT_ID", e.CLOUDFLARE_ACCOUNT_ID || e.CF_ACCOUNT_ID);

  // S3-compatible R2 keys (secretnow uses OBJECT_STORAGE_*)
  setIfEmpty("R2_ACCESS_KEY_ID", e.OBJECT_STORAGE_KEY || e.AWS_ACCESS_KEY_ID);
  setIfEmpty("R2_SECRET_ACCESS_KEY", e.OBJECT_STORAGE_SECRET || e.AWS_SECRET_ACCESS_KEY);
  setIfEmpty("OBJECT_STORAGE_KEY", e.R2_ACCESS_KEY_ID);
  setIfEmpty("OBJECT_STORAGE_SECRET", e.R2_SECRET_ACCESS_KEY);

  // Bucket
  setIfEmpty(
    "R2_BUCKET_NAME",
    e.OBJECT_STORAGE_BUCKET || e.R2_BUCKET_ASSETS || e.R2_BUCKET || "grudge-assets",
  );
  setIfEmpty("OBJECT_STORAGE_BUCKET", e.R2_BUCKET_NAME || e.R2_BUCKET_ASSETS);
  setIfEmpty("R2_BUCKET_ASSETS", e.R2_BUCKET_NAME || e.OBJECT_STORAGE_BUCKET);

  // Endpoint / public CDN
  setIfEmpty("R2_ENDPOINT", e.OBJECT_STORAGE_ENDPOINT);
  setIfEmpty("OBJECT_STORAGE_ENDPOINT", e.R2_ENDPOINT);
  setIfEmpty(
    "OBJECT_STORAGE_PUBLIC_URL",
    e.OBJECT_STORAGE_PUBLIC_R2_URL || e.ASSETS_CDN || "https://assets.grudge-studio.com",
  );

  // Parse account id from endpoint if still missing:
  // https://<accountid>.r2.cloudflarestorage.com
  if (!e.CLOUDFLARE_ACCOUNT_ID && !e.CF_ACCOUNT_ID) {
    const ep = e.R2_ENDPOINT || e.OBJECT_STORAGE_ENDPOINT || "";
    const m = ep.match(/https?:\/\/([a-f0-9]{32})\.r2\.cloudflarestorage\.com/i);
    if (m) {
      setIfEmpty("CLOUDFLARE_ACCOUNT_ID", m[1]);
      setIfEmpty("CF_ACCOUNT_ID", m[1]);
    }
  }

  // Cloudflare API tokens (admin / DNS / worker R2)
  setIfEmpty(
    "CLOUDFLARE_API_TOKEN",
    e.CLOUDFLARE_ADMIN_TOKEN ||
      e.CF_WORKER_R2_API ||
      e.CF_DNS_API_TOKEN ||
      e.CLOUDFLARE_USER_API,
  );
  setIfEmpty("CLOUDFLARE_ZONE_ID", e.CF_ZONE_ID);

  // Auth / accounts (server-side ops — never ship JWT_SECRET to browsers)
  setIfEmpty("GRUDGE_AUTH_URL", e.GRUDGE_AUTH_URL || "https://id.grudge-studio.com");
  setIfEmpty("OBJECTSTORE_WORKER_URL", e.OBJECTSTORE_WORKER_URL);
}

/**
 * Load vault files into process.env (fill empties only), then aliases.
 * @param {{ candidates?: string[], quiet?: boolean }} [opts]
 * @returns {{ loadedFiles: string[], status: Record<string, boolean> }}
 */
export function loadFleetEnv(opts = {}) {
  const candidates = opts.candidates || FLEET_ENV_CANDIDATES;
  const loadedFiles = [];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const map = loadEnvFile(file);
    let n = 0;
    for (const [k, v] of Object.entries(map)) {
      if (setIfEmpty(k, v)) n++;
    }
    if (n > 0 || Object.keys(map).length > 0) loadedFiles.push(file);
  }

  applyFleetAliases();

  const status = {
    CLOUDFLARE_ACCOUNT_ID: !!(
      process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID
    ),
    R2_ACCESS_KEY_ID: !!(
      process.env.R2_ACCESS_KEY_ID || process.env.OBJECT_STORAGE_KEY
    ),
    R2_SECRET_ACCESS_KEY: !!(
      process.env.R2_SECRET_ACCESS_KEY || process.env.OBJECT_STORAGE_SECRET
    ),
    R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
    CLOUDFLARE_API_TOKEN: !!process.env.CLOUDFLARE_API_TOKEN,
    OBJECTSTORE_API_KEY: !!process.env.OBJECTSTORE_API_KEY,
    GRUDGE_AUTH_URL: !!process.env.GRUDGE_AUTH_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    INTERNAL_API_KEY: !!process.env.INTERNAL_API_KEY,
  };

  if (!opts.quiet) {
    console.log(
      "[fleet-env] loaded files:",
      loadedFiles.length
        ? loadedFiles.map((f) => path.basename(f)).join(", ")
        : "(none — relying on process.env)",
    );
    console.log(
      "[fleet-env] status:",
      Object.entries(status)
        .map(([k, ok]) => `${k}=${ok ? "set" : "missing"}`)
        .join(" "),
    );
  }

  return { loadedFiles, status };
}

/**
 * Resolve R2 S3 client options from env (after loadFleetEnv).
 * @returns {{ accountId: string, accessKeyId: string, secretAccessKey: string, bucket: string, endpoint: string } | null}
 */
export function resolveR2S3Config() {
  loadFleetEnv({ quiet: true });
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || "";
  const accessKeyId =
    process.env.R2_ACCESS_KEY_ID || process.env.OBJECT_STORAGE_KEY || "";
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY || process.env.OBJECT_STORAGE_SECRET || "";
  const bucket =
    process.env.R2_BUCKET_NAME ||
    process.env.OBJECT_STORAGE_BUCKET ||
    process.env.R2_BUCKET_ASSETS ||
    "grudge-assets";
  const endpoint =
    process.env.R2_ENDPOINT ||
    process.env.OBJECT_STORAGE_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, endpoint };
}

export default loadFleetEnv;
