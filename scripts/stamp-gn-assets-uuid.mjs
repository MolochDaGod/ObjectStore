#!/usr/bin/env node
/**
 * Stamp gn_assets.grudge_uuid with the same UUID v5 as asset_registry:
 * sha1("grudge-asset:" + r2_key||path)
 *
 *   node scripts/stamp-gn-assets-uuid.mjs
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DB = "grudge-objectstore";
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "ee475864561b02d4588180b8b9acf694";
const BATCH = 50;
const DRY = process.argv.includes("--dry-run");

function uuidFromKey(key) {
  const seed = `grudge-asset:${String(key || "").replace(/^\/+/, "")}`;
  const bytes = crypto.createHash("sha1").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function env() {
  return { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT };
}

function wranglerJson(sql) {
  const quoted = sql.replace(/"/g, '\\"');
  const out = execSync(`wrangler d1 execute ${DB} --remote --command "${quoted}" --json`, {
    cwd: ROOT,
    encoding: "utf8",
    env: env(),
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000,
  });
  const text = String(out);
  const i = text.indexOf("[");
  return JSON.parse(text.slice(i));
}

function wranglerRun(sql, label) {
  const tmp = path.join(os.tmpdir(), `gn-uuid-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  fs.writeFileSync(tmp, sql);
  try {
    if (DRY) {
      console.log(`  [dry] ${label}`);
      return;
    }
    execSync(`wrangler d1 execute ${DB} --remote --file=${tmp} --yes`, {
      cwd: ROOT,
      env: env(),
      stdio: "inherit",
      timeout: 180000,
    });
    console.log(`  ok ${label}`);
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* */
    }
  }
}

function esc(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function rows(json) {
  const blocks = Array.isArray(json) ? json : [json];
  const out = [];
  for (const b of blocks) {
    const inner = b?.results || b?.result?.[0]?.results || [];
    out.push(...inner);
  }
  return out;
}

async function main() {
  try {
    wranglerRun("ALTER TABLE gn_assets ADD COLUMN grudge_uuid TEXT;", "ALTER gn_assets.grudge_uuid");
  } catch (e) {
    const msg = String(e?.stderr || e?.stdout || e?.message || e);
    if (!/duplicate column/i.test(msg)) throw e;
    console.log("  skip ALTER (exists)");
  }

  const all = [];
  const PAGE = 400;
  for (let off = 0; off < 20000; off += PAGE) {
    const chunk = rows(
      wranglerJson(`SELECT id, path, r2_key FROM gn_assets ORDER BY id LIMIT ${PAGE} OFFSET ${off};`),
    );
    all.push(...chunk);
    console.log(`  +${chunk.length} (${all.length})`);
    if (chunk.length < PAGE) break;
  }

  const stmts = [];
  for (const r of all) {
    const key = String(r.r2_key || r.path || "").replace(/^\/+/, "");
    if (!key) continue;
    stmts.push(`UPDATE gn_assets SET grudge_uuid=${esc(uuidFromKey(key))} WHERE id=${esc(r.id)};`);
  }
  console.log(`stamps ${stmts.length}`);
  for (let i = 0; i < stmts.length; i += BATCH) {
    wranglerRun(stmts.slice(i, i + BATCH).join("\n"), `gn uuid ${i / BATCH + 1}`);
  }
  const sum = rows(
    wranglerJson(
      `SELECT COUNT(*) n, SUM(CASE WHEN grudge_uuid IS NULL OR grudge_uuid='' THEN 1 ELSE 0 END) uuid_empty FROM gn_assets;`,
    ),
  );
  console.log("summary", sum[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
