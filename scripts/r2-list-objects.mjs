#!/usr/bin/env node
/**
 * List R2 objects (wrangler has no `r2 object list` — use S3 API).
 *
 * Env (R2 S3 credentials):
 *   CLOUDFLARE_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME          (default grudge-assets)
 *
 * Usage:
 *   node scripts/r2-list-objects.mjs
 *   node scripts/r2-list-objects.mjs --prefix models/creeps/
 *   node scripts/r2-list-objects.mjs --prefix models/ --max 200 --out docs/reports/r2-list.json
 *   node scripts/r2-list-objects.mjs --dry-env   # print whether env is set
 *
 * Also writes a flat key list for asset-fleet-audit --r2-keys-file
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

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

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
const KEY = process.env.R2_ACCESS_KEY_ID || process.env.OBJECT_STORAGE_KEY;
const SECRET =
  process.env.R2_SECRET_ACCESS_KEY || process.env.OBJECT_STORAGE_SECRET;
const BUCKET = process.env.R2_BUCKET_NAME || "grudge-assets";
const PREFIX = val("--prefix", "");
const MAX = parseInt(val("--max", "5000"), 10) || 5000;
const OUT = val(
  "--out",
  join(ROOT, "docs", "reports", "r2-object-list-latest.json"),
);

if (flag("--dry-env") || flag("--help")) {
  console.log(`R2 list helper

Env:
  CLOUDFLARE_ACCOUNT_ID = ${ACCOUNT ? "set" : "MISSING"}
  R2_ACCESS_KEY_ID      = ${KEY ? "set" : "MISSING"}
  R2_SECRET_ACCESS_KEY  = ${SECRET ? "set" : "MISSING"}
  R2_BUCKET_NAME        = ${BUCKET}

Note: wrangler 4.x has no "r2 object list". Use this script (S3 ListObjectsV2)
or AWS CLI:
  aws s3api list-objects-v2 --bucket grudge-assets --prefix models/ \\
    --endpoint-url https://$ACCOUNT.r2.cloudflarestorage.com

Mirror creeps:
  npm run creeps:mirror
`);
  if (flag("--help")) process.exit(0);
  if (!ACCOUNT || !KEY || !SECRET) process.exit(1);
}

if (!ACCOUNT || !KEY || !SECRET) {
  console.error(
    "[r2-list] Missing R2 S3 credentials. Set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY",
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
  let S3Client, ListObjectsV2Command;
  try {
    const mod = await import("@aws-sdk/client-s3");
    S3Client = mod.S3Client;
    ListObjectsV2Command = mod.ListObjectsV2Command;
  } catch {
    console.error(
      "[r2-list] Install @aws-sdk/client-s3: npm i -D @aws-sdk/client-s3",
    );
    process.exit(3);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: KEY, secretAccessKey: SECRET },
  });

  const keys = [];
  let token;
  do {
    const res = await client.send(
      new ListObjectsV2Command({
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

  const report = {
    generatedAt: new Date().toISOString(),
    bucket: BUCKET,
    prefix: PREFIX,
    count: keys.length,
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
