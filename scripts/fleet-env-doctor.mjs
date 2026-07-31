#!/usr/bin/env node
/**
 * fleet-env-doctor.mjs — status-only probe of Grudge local credentials.
 * NEVER prints secret values — only set/missing, lengths, HTTP status.
 *
 * Usage:
 *   node scripts/fleet-env-doctor.mjs
 *   npm run fleet:doctor
 */

import path from "node:path";
import os from "node:os";
import { loadFleetEnv, resolveR2S3Config, FLEET_ENV_CANDIDATES } from "./lib/load-fleet-env.mjs";
import { listR2Objects } from "./lib/r2-s3-sigv4.mjs";

const DESKTOP = path.join(os.homedir(), "Desktop");

function ok(b) {
  return b ? "OK" : "FAIL";
}

async function verifyCfToken(label, token) {
  if (!token) return { label, status: "missing" };
  try {
    const r = await fetch(
      "https://api.cloudflare.com/client/v4/user/tokens/verify",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const j = await r.json().catch(() => ({}));
    const active = j.result?.status === "active" || j.success === true;
    return {
      label,
      status: active ? "active" : `HTTP ${r.status}`,
      len: token.length,
    };
  } catch (e) {
    return { label, status: `error: ${e.message}`, len: token.length };
  }
}

async function main() {
  console.log("══ Grudge fleet env doctor (no secrets printed) ══\n");

  const { loadedFiles, status } = loadFleetEnv({ quiet: true });
  console.log("Vault / env files loaded:");
  for (const f of FLEET_ENV_CANDIDATES) {
    const exists = await import("node:fs").then((fs) => fs.existsSync(f));
    const used = loadedFiles.includes(f);
    console.log(`  ${exists ? "●" : "○"} ${f}${used ? "  (used)" : ""}`);
  }

  console.log("\nCore status:");
  for (const [k, v] of Object.entries(status)) {
    console.log(`  ${v ? "✓" : "✗"} ${k}`);
  }

  const r2 = resolveR2S3Config();
  console.log("\nR2 S3 bridge:");
  console.log(`  config: ${r2 ? "resolved" : "MISSING"}`);
  if (r2) {
    console.log(`  bucket: ${r2.bucket}`);
    console.log(`  endpoint: ${r2.endpoint ? "set" : "missing"}`);
    console.log(`  accessKeyId len: ${r2.accessKeyId.length}`);
    console.log(`  secretAccessKey len: ${r2.secretAccessKey.length}`);
  }

  // CF token probes (names from env after load)
  console.log("\nCloudflare API tokens (verify):");
  const probes = await Promise.all([
    verifyCfToken("CF_WORKER_R2_API", process.env.CF_WORKER_R2_API),
    verifyCfToken("CF_AI_WORKERS_API", process.env.CF_AI_WORKERS_API),
    verifyCfToken("CF_DNS_API_TOKEN", process.env.CF_DNS_API_TOKEN),
    verifyCfToken("CLOUDFLARE_USER_API", process.env.CLOUDFLARE_USER_API),
    verifyCfToken(
      "CLOUDFLARE_API_TOKEN",
      process.env.CLOUDFLARE_API_TOKEN,
    ),
  ]);
  for (const p of probes) {
    console.log(
      `  ${p.status === "active" ? "✓" : "✗"} ${p.label}: ${p.status}${p.len ? ` (len=${p.len})` : ""}`,
    );
  }

  // Live R2 smoke (tiny)
  console.log("\nLive R2 list smoke (prefix models/, max 3):");
  try {
    const listed = await listR2Objects({ prefix: "models/", max: 3 });
    console.log(`  ${ok(listed.count > 0)} count=${listed.count} bucket=${listed.bucket}`);
    for (const k of listed.keys.slice(0, 3)) {
      console.log(`    ${k.size.toString().padStart(8)}  ${k.key}`);
    }
  } catch (e) {
    console.log(`  FAIL ${e.message.slice(0, 160)}`);
  }

  // Account / identity endpoints (public)
  console.log("\nPublic account bridges:");
  for (const [name, url] of [
    ["id.grudge-studio.com/login", "https://id.grudge-studio.com/login"],
    [
      "Railway health",
      "https://grudge-api-production-0d46.up.railway.app/api/health",
    ],
    ["assets CDN root", "https://assets.grudge-studio.com/"],
    [
      "ObjectStore worker",
      process.env.OBJECTSTORE_WORKER_URL ||
        "https://objectstore.grudge-studio.com",
    ],
  ]) {
    try {
      const r = await fetch(url, { method: "GET", redirect: "manual" });
      console.log(`  ${(r.status >= 200 && r.status < 400) || r.status === 302 || r.status === 301 ? "✓" : "✗"} ${name}: HTTP ${r.status}`);
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }

  console.log("\nDesktop vault:");
  for (const name of ["secretnow.txt", "secret.txt", "newenv.txt"]) {
    const p = path.join(DESKTOP, name);
    try {
      const st = await import("node:fs").then((fs) => fs.statSync(p));
      console.log(`  ✓ ${name} (${st.size} bytes)`);
    } catch {
      console.log(`  ○ ${name} (missing)`);
    }
  }

  console.log(`
Ops cheatsheet (no secrets):
  npm run fleet:doctor
  npm run r2:list:env
  npm run r2:list -- --prefix models/ --max 20
  npm run creeps:mirror && npm run creeps:mirror:upload
  npm run audit:assets:smoke

Account stay-logged-in (browser):
  id.grudge-studio.com → JWT keys:
  grudge_auth_token · grudge_session_token · grudge.token · sso_token

Rotate if exposed/expired: CF_DNS_API_TOKEN, CLOUDFLARE_USER_API, OBJECTSTORE_API_KEY
`);

  const hardFail =
    !r2 ||
    !status.R2_ACCESS_KEY_ID ||
    !status.CLOUDFLARE_ACCOUNT_ID;
  process.exit(hardFail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
