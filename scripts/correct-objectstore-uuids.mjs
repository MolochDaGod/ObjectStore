#!/usr/bin/env node
/**
 * Align ObjectStore D1 `assets` to the same deterministic asset UUID as
 * RTS-Grudge asset_registry: sha1("grudge-asset:" + key) → UUID v5.
 *
 * Does not invent a second table. Adds grudge_uuid; rewrites id when unique.
 * HEADs CDN for size=0 rows.
 *
 *   node scripts/correct-objectstore-uuids.mjs --dry-run
 *   node scripts/correct-objectstore-uuids.mjs
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const DRY = process.argv.includes("--dry-run");
const DB = process.env.D1_DATABASE_NAME || "grudge-objectstore";
const CDN = (process.env.ASSET_CDN_BASE || "https://assets.grudge-studio.com").replace(/\/$/, "");
const BATCH = 50;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "ee475864561b02d4588180b8b9acf694";

function buildDeterministicUuid(r2Key) {
  const seed = `grudge-asset:${String(r2Key || "").replace(/^\/+/, "")}`;
  const bytes = crypto.createHash("sha1").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function wranglerEnv() {
  return { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT };
}

function wranglerJson(sql) {
  const quoted = sql.replace(/"/g, '\\"');
  const out = execSync(`wrangler d1 execute ${DB} --remote --command "${quoted}" --json`, {
    cwd: ROOT,
    encoding: "utf8",
    env: wranglerEnv(),
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180000,
  });
  const text = String(out);
  const iArr = text.indexOf("[");
  const iObj = text.indexOf("{");
  const i = iArr === -1 ? iObj : iObj === -1 ? iArr : Math.min(iArr, iObj);
  if (i < 0) throw new Error("no JSON: " + text.slice(0, 240));
  return JSON.parse(text.slice(i));
}

function wranglerRun(sql, label) {
  const tmp = path.join(os.tmpdir(), `grudge-os-uuid-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  fs.writeFileSync(tmp, sql);
  try {
    if (DRY) {
      console.log(`  [dry] ${label} (${sql.split("\n").length} stmts)`);
      return;
    }
    execSync(`wrangler d1 execute ${DB} --remote --file=${tmp} --yes`, {
      cwd: ROOT,
      env: wranglerEnv(),
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

function escape(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function parseRows(json) {
  const blocks = Array.isArray(json) ? json : [json];
  const rows = [];
  for (const b of blocks) {
    const inner = Array.isArray(b?.results)
      ? b.results
      : Array.isArray(b?.result?.[0]?.results)
        ? b.result[0].results
        : Array.isArray(b?.result)
          ? b.result
          : [];
    for (const r of inner) {
      if (r && (r.key || r.id)) rows.push(r);
    }
  }
  return rows;
}

async function headCdn(key) {
  try {
    const r = await fetch(`${CDN}/${key}`, {
      method: "HEAD",
      headers: { Referer: `${CDN}/`, "User-Agent": "grudge-os-uuid/1" },
    });
    const len = Number(r.headers.get("content-length") || 0);
    const ct = String(r.headers.get("content-type") || "");
    if (r.status === 404) return { status: "missing", size: 0, ct };
    if (ct.includes("text/html") || len === 44089) return { status: "html_fake", size: len, ct };
    return { status: r.ok ? "real" : "unknown", size: len, ct };
  } catch {
    return { status: "unknown", size: 0, ct: "" };
  }
}

async function main() {
  console.log(`D1 ${DB} dry=${DRY}`);

  if (!DRY) {
    try {
      wranglerRun("ALTER TABLE assets ADD COLUMN grudge_uuid TEXT;", "ALTER grudge_uuid");
    } catch (e) {
      const msg = String(e?.stderr || e?.message || e);
      if (/duplicate column/i.test(msg)) console.log("  skip ALTER grudge_uuid");
      else throw e;
    }
    try {
      wranglerRun("CREATE INDEX IF NOT EXISTS idx_assets_grudge_uuid ON assets(grudge_uuid);", "index uuid");
    } catch (e) {
      console.warn("  index", e?.message || e);
    }
  }

  const rows = [];
  const PAGE = 400;
  for (let offset = 0; offset < 30000; offset += PAGE) {
    const dumped = wranglerJson(
      `SELECT id, key, size FROM assets ORDER BY key LIMIT ${PAGE} OFFSET ${offset};`,
    );
    const chunk = parseRows(dumped);
    rows.push(...chunk);
    console.log(`  +${chunk.length} (total ${rows.length})`);
    if (chunk.length < PAGE) break;
  }
  console.log(`rows ${rows.length}`);

  const taken = new Set(rows.map((r) => r.id));
  const uuidStmts = [];
  let idRewrite = 0;
  let uuidStamp = 0;
  for (const r of rows) {
    const key = String(r.key || "").replace(/^\/+/, "");
    if (!key) continue;
    const uuid = buildDeterministicUuid(key);
    uuidStamp++;
    if (r.id !== uuid && !taken.has(uuid)) {
      taken.delete(r.id);
      taken.add(uuid);
      idRewrite++;
      uuidStmts.push(
        `UPDATE assets SET id=${escape(uuid)}, grudge_uuid=${escape(uuid)}, updated_at=datetime('now') WHERE id=${escape(r.id)};`,
      );
    } else {
      uuidStmts.push(
        `UPDATE assets SET grudge_uuid=${escape(uuid)}, updated_at=datetime('now') WHERE id=${escape(r.id)};`,
      );
    }
  }
  console.log(`uuid stamps ${uuidStamp}  id rewrites ${idRewrite}`);

  for (let i = 0; i < uuidStmts.length; i += BATCH) {
    wranglerRun(uuidStmts.slice(i, i + BATCH).join("\n"), `uuid batch ${i / BATCH + 1}`);
  }

  const empty = rows.filter((r) => !r.size || Number(r.size) === 0);
  console.log(`HEAD empty-size ${empty.length}…`);
  const sizeStmts = [];
  let cursor = 0;
  const conc = 16;
  let real = 0;
  let missing = 0;
  let fake = 0;
  async function worker() {
    while (cursor < empty.length) {
      const idx = cursor++;
      const r = empty[idx];
      const h = await headCdn(r.key);
      if (h.status === "real") real++;
      else if (h.status === "missing") missing++;
      else if (h.status === "html_fake") fake++;
      if (idx < 30 || h.status !== "real") {
        console.log(`  ${h.status.padEnd(10)} ${String(h.size).padStart(10)}  ${r.key}`);
      }
      if (h.size > 0) {
        sizeStmts.push(`UPDATE assets SET size=${h.size} WHERE key=${escape(r.key)};`);
      }
    }
  }
  await Promise.all(Array.from({ length: conc }, worker));
  console.log(`HEAD real=${real} missing=${missing} html_fake=${fake}`);
  for (let i = 0; i < sizeStmts.length; i += BATCH) {
    wranglerRun(sizeStmts.slice(i, i + BATCH).join("\n"), `size batch ${i / BATCH + 1}`);
  }

  const summary = wranglerJson(
    `SELECT COUNT(*) AS n, SUM(CASE WHEN grudge_uuid IS NULL OR grudge_uuid='' THEN 1 ELSE 0 END) AS uuid_empty, SUM(CASE WHEN size IS NULL OR size=0 THEN 1 ELSE 0 END) AS size_empty FROM assets;`,
  );
  console.log("summary", JSON.stringify(parseRows(summary)[0] || summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
