#!/usr/bin/env node
/**
 * blender-run-python.mjs — run a .py script headless via Blender.
 * Usage: node scripts/blender-run-python.mjs scripts/foo.py [-- extra args...]
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findBlender() {
  const cands = [
    process.env.BLENDER_PATH,
    process.env.GRUDGE_BLENDER,
    "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.4\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
    "/usr/bin/blender",
    "/Applications/Blender.app/Contents/MacOS/Blender",
  ].filter(Boolean);
  for (const p of cands) {
    if (existsSync(p)) return p;
  }
  // PATH
  const r = spawnSync(process.platform === "win32" ? "where" : "which", ["blender"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.status === 0) {
    const line = (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (line && existsSync(line)) return line;
  }
  return null;
}

const argv = process.argv.slice(2);
if (!argv.length) {
  console.error("Usage: node scripts/blender-run-python.mjs <script.py> [-- blender-python-args...]");
  process.exit(1);
}

const dash = argv.indexOf("--");
const script = resolve(argv[0]);
const pyArgs = dash === -1 ? argv.slice(1) : argv.slice(dash + 1);

const blender = findBlender();
if (!blender) {
  console.error("Blender not found. Set BLENDER_PATH to blender.exe");
  process.exit(2);
}
if (!existsSync(script)) {
  console.error("Script not found:", script);
  process.exit(1);
}

const args = ["-b", "--python", script];
if (pyArgs.length) args.push("--", ...pyArgs);

console.log("→", blender, args.join(" "));
const r = spawnSync(blender, args, { stdio: "inherit", windowsHide: true });
process.exit(r.status ?? 1);
