#!/usr/bin/env node
/**
 * Re-bake Warlords unique entity GLBs: texture WebP ≤1024 + meshopt.
 * Source list: ObjectStore warlords-entity-prefabs.json (cdn_ready + entities/*.glb).
 *
 *   node scripts/bake-warlords-entities.mjs              # download + convert
 *   node scripts/bake-warlords-entities.mjs --limit 3    # pilot
 *   node scripts/bake-warlords-entities.mjs --upload     # wrangler R2 put same keys
 *   node scripts/bake-warlords-entities.mjs --skip-download  # reuse work dir
 */
import { spawn } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONVERT = join(ROOT, "tools/grudge-convert/bin/grudge-convert.mjs");
const WORK = join(ROOT, "dist/warlords-entities-bake");
const LIST_URL =
  process.env.WARLORDS_PREFABS_URL ||
  "https://objectstore.grudge-studio.com/api/v1/warlords-entity-prefabs.json";
const BUCKET = process.env.R2_BUCKET || "grudge-assets";

function has(flag) {
  return process.argv.includes(flag);
}
function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  if (i === -1) return fallback;
  return process.argv[i + 1] ?? fallback;
}

function okEntityUrl(u) {
  if (!u) return false;
  const s = String(u).toLowerCase();
  if (!s.endsWith(".glb")) return false;
  if (s.includes("/prod/gltf/characters/")) return false;
  if (s.includes("free_survival")) return false;
  if (s.includes("_characters.glb")) return false;
  return s.includes("/models/warlords/entities/") || s.includes("/warlords/entities/");
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd || ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        BLENDER_PATH:
          process.env.BLENDER_PATH ||
          "C:\\Users\\nugye\\tools\\Blender\\blender.exe",
      },
      // Windows: npx/wrangler are .cmd shims — need shell.
      shell: opts.shell ?? process.platform === "win32",
    });
    child.on("error", reject);
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      out += d;
      process.stdout.write(d);
    });
    child.stderr.on("data", (d) => {
      err += d;
      process.stderr.write(d);
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ out, err });
      else reject(new Error(`${cmd} ${args.join(" ")} → ${code}\n${err || out}`));
    });
  });
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const buf = readFileSync(dest);
  if (buf.length < 100 || buf[0] !== 0x67 || buf[1] !== 0x6c || buf[2] !== 0x54) {
    throw new Error(`Not glTF binary: ${url} (${buf.length} bytes)`);
  }
  return buf.length;
}

function convertArgs(row, src, dest) {
  const args = ["glb2glb", src, "-o", dest, "--texture-size", "1024", "--texture-format", "webp"];
  const kind = String(row.kind || "");
  const h = Number(row.heightM);
  if (kind === "unit" || kind === "mount") {
    const height = Number.isFinite(h) && h > 0.4 && h < 4 ? h : kind === "mount" ? 1.8 : 1.8;
    args.push("--height", String(height));
  } else if (kind === "structure" || kind === "siege" || kind === "vehicle") {
    args.push("--box-collider");
    // SI height only when catalog gives a sane prop height (not hero yardstick noise)
    if (Number.isFinite(h) && h >= 0.5 && h <= 40) {
      args.push("--height", String(h));
    }
  }
  return args;
}

async function main() {
  mkdirSync(WORK, { recursive: true });
  mkdirSync(join(WORK, "in"), { recursive: true });
  mkdirSync(join(WORK, "out"), { recursive: true });

  let rows;
  const localList = join("C:/Users/nugye/tmp/warlords-entity-bake-list.json");
  if (existsSync(localList) && has("--from-local-list")) {
    rows = JSON.parse(readFileSync(localList, "utf8"));
  } else {
    const res = await fetch(LIST_URL);
    if (!res.ok) throw new Error(`prefab index ${res.status}`);
    const json = await res.json();
    rows = (json.prefabs || [])
      .filter((p) => p.mesh?.status === "cdn_ready" && okEntityUrl(p.mesh.cdnUrl))
      .map((p) => ({
        id: p.id,
        kind: p.kind,
        name: p.displayName || p.name,
        cdnUrl: p.mesh.cdnUrl,
        r2Key: p.mesh.r2Key,
        heightM: p.si?.heightM,
      }));
  }

  const limit = Number(arg("--limit", "0")) || 0;
  if (limit > 0) rows = rows.slice(0, limit);

  console.log(`bake-warlords-entities: ${rows.length} unique entity GLBs`);
  const report = [];

  for (const row of rows) {
    const slug = basename(String(row.r2Key || row.cdnUrl).replace(/\\/g, "/"), ".glb");
    const src = join(WORK, "in", `${slug}.glb`);
    const dest = join(WORK, "out", `${slug}.glb`);
    const entry = { slug, id: row.id, kind: row.kind, r2Key: row.r2Key, ok: false };

    try {
      if (!has("--skip-download") || !existsSync(src)) {
        process.stdout.write(`↓ ${slug} … `);
        entry.inBytes = await download(row.cdnUrl, src);
        console.log(`${entry.inBytes} B`);
      } else {
        entry.inBytes = statSync(src).size;
        console.log(`= ${slug} reuse ${entry.inBytes} B`);
      }

      if (has("--skip-convert") && existsSync(dest)) {
        entry.outBytes = statSync(dest).size;
        entry.ratio = Number((entry.outBytes / entry.inBytes).toFixed(3));
        entry.ok = true;
        console.log(`= ${slug} reuse out ${entry.outBytes} B`);
      } else {
        process.stdout.write(`⚙ ${slug} … `);
        const args = convertArgs(row, src, dest);
        await run(process.execPath, [CONVERT, ...args]);
        entry.outBytes = statSync(dest).size;
        entry.ratio = Number((entry.outBytes / entry.inBytes).toFixed(3));
        entry.ok = true;
        console.log(`→ ${entry.outBytes} B (${entry.ratio}×)`);
      }

      if (has("--upload") && row.r2Key) {
        process.stdout.write(`↑ ${row.r2Key} … `);
        const wrangler =
          process.env.WRANGLER_BIN ||
          (process.platform === "win32" ? "wrangler.cmd" : "wrangler");
        await run(
          wrangler,
          [
            "r2",
            "object",
            "put",
            `${BUCKET}/${row.r2Key}`,
            "--file",
            dest,
            "--content-type",
            "model/gltf-binary",
            "--remote",
          ],
          { shell: true }
        );
        const col = dest.replace(/\.glb$/i, ".collider.json");
        if (existsSync(col)) {
          await run(
            wrangler,
            [
              "r2",
              "object",
              "put",
              `${BUCKET}/${row.r2Key.replace(/\.glb$/i, ".collider.json")}`,
              "--file",
              col,
              "--content-type",
              "application/json",
              "--remote",
            ],
            { shell: true }
          );
        }
        console.log("ok");
        entry.uploaded = true;
      }
    } catch (e) {
      entry.error = String(e.message || e).slice(0, 500);
      console.error(`✗ ${slug}: ${entry.error}`);
    }
    report.push(entry);
  }

  const summary = {
    at: new Date().toISOString(),
    total: report.length,
    ok: report.filter((r) => r.ok).length,
    uploaded: report.filter((r) => r.uploaded).length,
    failed: report.filter((r) => !r.ok).length,
    rows: report,
  };
  writeFileSync(join(WORK, "report.json"), JSON.stringify(summary, null, 2));
  console.log(
    `\nDone: ${summary.ok}/${summary.total} converted, ${summary.uploaded} uploaded, ${summary.failed} failed`
  );
  console.log(`Report: ${join(WORK, "report.json")}`);
  if (summary.failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
