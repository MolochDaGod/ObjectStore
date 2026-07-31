#!/usr/bin/env node
/**
 * List R2 objects (wrangler has no `r2 object list` — use S3 API).
 *
 * Credentials via scripts/lib/load-fleet-env.mjs (Desktop secretnow.txt pattern):
 *   CF_ACCOUNT_ID / CLOUDFLARE_ACCOUNT_ID
 *   OBJECT_STORAGE_KEY → R2_ACCESS_KEY_ID
 *   OBJECT_STORAGE_SECRET → R2_SECRET_ACCESS_KEY
 *   OBJECT_STORAGE_BUCKET / R2_BUCKET_ASSETS → R2_BUCKET_NAME
 *
 * Usage:
 *   node scripts/r2-list-objects.mjs
 *   node scripts/r2-list-objects.mjs --prefix models/creeps/
 *   node scripts/r2-list-objects.mjs --prefix models/ --max 200 --out docs/reports/r2-list.json
 *   node scripts/r2-list-objects.mjs --dry-env   # print whether env is set (no secrets)
 *
 * Also writes a flat key list for asset-fleet-audit --r2-keys-file
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  loadFleetEnv,
  resolveR2S3Config,
} from "./lib/load-fleet-env.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const val = (n, d) => {
  const i = args.findIndex((a) => a === n || a.startsWith(`${n}=`));
  if (i < 0) return d;
  if (args[i].includes("=")) return args[i].split("=").slice(1).join("=");
  return args[i + 1] ?? d;
};

// Bridge: secretnow / vault → process.env aliases (never prints values)
loadFleetEnv({ quiet: flag("--help") });
const r2 = resolveR2S3Config();

const ACCOUNT = r2?.accountId || "";
const KEY = r2?.accessKeyId || "";
const SECRET = r2?.secretAccessKey || "";
const BUCKET = r2?.bucket || process.env.R2_BUCKET_NAME || "grudge-assets";
const ENDPOINT =
  r2?.endpoint ||
  (ACCOUNT ? `https://${ACCOUNT}.r2.cloudflarestorage.com` : "");
const PREFIX = val("--prefix", "");
const MAX = parseInt(val("--max", "5000"), 10) || 5000;
const OUT = val(
  "--out",
  join(ROOT, "docs", "reports", "r2-object-list-latest.json"),
);

if (flag("--dry-env") || flag("--help")) {
  console.log(`R2 list helper (fleet env bridge)

Env (after load-fleet-env):
  CLOUDFLARE_ACCOUNT_ID = ${ACCOUNT ? "set" : "MISSING"}
  R2_ACCESS_KEY_ID      = ${KEY ? "set" : "MISSING"}
  R2_SECRET_ACCESS_KEY  = ${SECRET ? "set" : "MISSING"}
  R2_BUCKET_NAME        = ${BUCKET}
  R2_ENDPOINT           = ${ENDPOINT ? "set" : "MISSING"}

Vault: Desktop\\secretnow.txt  (OBJECT_STORAGE_* + CF_ACCOUNT_ID)
Aliases: OBJECT_STORAGE_KEY→R2_ACCESS_KEY_ID, CF_ACCOUNT_ID→CLOUDFLARE_ACCOUNT_ID

Note: wrangler 4.x has no "r2 object list". Use this script (S3 ListObjectsV2).

Mirror creeps:
  npm run creeps:mirror
`);
  if (flag("--help")) process.exit(0);
  if (!ACCOUNT || !KEY || !SECRET) process.exit(1);
  process.exit(0);
}

if (!ACCOUNT || !KEY || !SECRET) {
  console.error(
    "[r2-list] Missing R2 S3 credentials after fleet env load.",
  );
  console.error(
    "[r2-list] Expected Desktop\\secretnow.txt OBJECT_STORAGE_KEY/SECRET + CF_ACCOUNT_ID",
  );
  console.error("[r2-list] Run with --dry-env for status. No objects listed.");
  // Write empty report so audit can still run offline
  const empty = {
    generatedAt: new Date().toISOString(),
    error: "missing-credentials",
    bucket: BUCKET,
    prefix: PREFIX,
    keys: [],
    count: 0,
  };
  const dir = dirname(OUT);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(OUT, JSON.stringify(empty, null, 2));
  process.exit(2);
}

async function main() {
  // Prefer pure SigV4 (no @aws-sdk) — disk-full / broken node_modules safe.
  // Fall back to SDK if present and importable.
  let keys = [];
  let used = "sigv4";
  try {
    const { listR2Objects } = await import("./lib/r2-s3-sigv4.mjs");
    const listed = await listR2Objects({
      prefix: PREFIX,
      max: MAX,
      bucket: BUCKET,
    });
    keys = listed.keys;
  } catch (sigErr) {
    try {
      const mod = await import("@aws-sdk/client-s3");
      const client = new mod.S3Client({
        region: "auto",
        endpoint: ENDPOINT,
        credentials: { accessKeyId: KEY, secretAccessKey: SECRET },
      });
      used = "aws-sdk";
      let token;
      do {
        const res = await client.send(
          new mod.ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: PREFIX || undefined,
            ContinuationToken: token,
            MaxKeys: Math.min(1000, MAX - keys.length),
          }),
        );
        for (const o of res.Contents || []) {
          if (o.Key) {
            keys.push({
              key: o.Key,
              size: o.Size || 0,
              lastModified: o.LastModified?.toISOString?.() || null,
            });
          }
        }
        token = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (token && keys.length < MAX);
    } catch (sdkErr) {
      console.error("[r2-list] SigV4 failed:", sigErr.message);
      console.error("[r2-list] SDK fallback failed:", sdkErr.message);
      process.exit(3);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    bucket: BUCKET,
    prefix: PREFIX,
    count: keys.length,
    transport: used,
    keys,
  };

  const dir = dirname(OUT);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2));
  const flat = join(dir, "r2-keys-flat.txt");
  writeFileSync(flat, keys.map((k) => k.key).join("\n") + "\n");

  console.log(`[r2-list] ${keys.length} objects → ${OUT}`);
  console.log(`[r2-list] flat keys → ${flat}`);
  // Sample
  for (const k of keys.slice(0, 15)) {
    console.log(`  ${k.size.toString().padStart(10)}  ${k.key}`);
  }
  if (keys.length > 15) console.log(`  … +${keys.length - 15} more`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
