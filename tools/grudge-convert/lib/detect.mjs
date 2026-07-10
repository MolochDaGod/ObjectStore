/**
 * Detect external conversion backends on PATH / common install locations.
 * Prefer env overrides, then PATH, then known Windows install roots, then
 * npm-packaged FBX2glTF binaries (node_modules/fbx2gltf).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.status !== 0) return null;
  const line = (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean);
  return line || null;
}

function firstExisting(paths) {
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

/** Scan Program Files for Blender X.Y\blender.exe */
function scanBlenderInstalls() {
  const roots = [
    "C:\\Program Files\\Blender Foundation",
    "C:\\Program Files (x86)\\Blender Foundation",
    join(homedir(), "AppData", "Local", "Programs", "Blender Foundation"),
    "/Applications",
  ];
  const found = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    let entries = [];
    try {
      entries = readdirSync(root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const name = ent.name;
      if (!/^Blender\s/i.test(name) && name !== "Blender.app") continue;
      const candidates = [
        join(root, name, "blender.exe"),
        join(root, name, "blender"),
        join(root, name, "Contents", "MacOS", "Blender"),
      ];
      // Nested version folder (empty shell installs sometimes leave Blender 4.5/4.5/)
      try {
        for (const sub of readdirSync(join(root, name), { withFileTypes: true })) {
          if (sub.isDirectory()) {
            candidates.push(join(root, name, sub.name, "blender.exe"));
            candidates.push(join(root, name, sub.name, "blender"));
          }
        }
      } catch {
        /* */
      }
      const hit = firstExisting(candidates);
      if (hit) found.push(hit);
    }
  }
  return found;
}

/** Resolve FBX2glTF from npm package fbx2gltf if installed */
function resolveNpmFbx2gltf() {
  const binName = process.platform === "win32" ? "FBX2glTF.exe" : "FBX2glTF";
  const platformDir =
    process.platform === "win32"
      ? "Windows_NT"
      : process.platform === "darwin"
        ? "Darwin"
        : "Linux";

  const tryPkg = (pkgRoot) => {
    if (!pkgRoot) return null;
    const p = join(pkgRoot, "bin", platformDir, binName);
    return existsSync(p) ? p : null;
  };

  // 1) optionalDependency of this package
  try {
    const pkgJson = require.resolve("fbx2gltf/package.json");
    const hit = tryPkg(dirname(pkgJson));
    if (hit) return hit;
  } catch {
    /* not installed here */
  }

  // 2) Walk up from tools/grudge-convert → monorepo node_modules
  const walkRoots = [
    join(__dirname, ".."),
    join(__dirname, "..", "..", ".."), // ObjectStore
    join(__dirname, "..", "..", "..", ".."), // Documents/1111111
    process.cwd(),
    join(homedir(), "npm-global", "node_modules"),
    join(homedir(), "AppData", "Roaming", "npm", "node_modules"),
  ];
  for (const root of walkRoots) {
    const hit = tryPkg(join(root, "node_modules", "fbx2gltf"));
    if (hit) return hit;
    // grudge-arena / other siblings often have it
    const sibling = tryPkg(join(root, "grudge-arena", "node_modules", "fbx2gltf"));
    if (sibling) return sibling;
  }

  return null;
}

const FBX2GLTF_CANDIDATES = () =>
  [
    process.env.FBX2GLTF_PATH,
    process.env.GRUDGE_FBX2GLTF,
    which("FBX2glTF"),
    which("fbx2gltf"),
    resolveNpmFbx2gltf(),
    join(homedir(), "tools", "FBX2glTF", "FBX2glTF.exe"),
    join(homedir(), "tools", "FBX2glTF", "FBX2glTF"),
    "C:\\Tools\\FBX2glTF\\FBX2glTF.exe",
    "C:\\Program Files\\FBX2glTF\\FBX2glTF.exe",
    "D:\\FBX2glTF.exe",
    join(homedir(), "Documents", "1111111", "grudge-arena", "node_modules", "fbx2gltf", "bin", "Windows_NT", "FBX2glTF.exe"),
    join(homedir(), "npm-global", "node_modules", "fbx2gltf", "bin", "Windows_NT", "FBX2glTF.exe"),
  ].filter(Boolean);

function readBlenderPathFile() {
  try {
    const p = join(__dirname, "..", ".blender-path");
    if (existsSync(p)) {
      const line = readFileSync(p, "utf8")
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find(Boolean);
      return line || null;
    }
  } catch {
    /* */
  }
  return null;
}

/** Microsoft Store package (may Access Denied when spawned outside alias) */
function scanStoreBlender() {
  const root = "C:\\Program Files\\WindowsApps";
  if (!existsSync(root)) return [];
  try {
    const dirs = readdirSync(root, { withFileTypes: true }).filter(
      (d) => d.isDirectory() && /BlenderFoundation\.Blender/i.test(d.name),
    );
    return dirs
      .map((d) => join(root, d.name, "Blender", "blender.exe"))
      .filter((p) => existsSync(p));
  } catch {
    return [];
  }
}

const BLENDER_CANDIDATES = () =>
  [
    process.env.BLENDER_PATH,
    process.env.GRUDGE_BLENDER,
    readBlenderPathFile(),
    which("blender"),
    join(homedir(), "tools", "Blender", "blender.exe"),
    "C:\\Users\\nugye\\tools\\Blender\\blender.exe",
    ...scanBlenderInstalls(),
    ...scanStoreBlender(),
    "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.4\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.3\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.1\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
    "C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe",
    "/usr/bin/blender",
    "/Applications/Blender.app/Contents/MacOS/Blender",
  ].filter(Boolean);

export function detectFbx2gltf() {
  for (const p of FBX2GLTF_CANDIDATES()) {
    if (p && existsSync(p)) {
      return { available: true, path: p, name: "fbx2gltf" };
    }
  }
  return {
    available: false,
    path: null,
    name: "fbx2gltf",
    reason:
      "FBX2glTF binary not found. Set FBX2GLTF_PATH or: npm i fbx2gltf (in tools/grudge-convert).",
  };
}

export function detectBlender() {
  for (const p of BLENDER_CANDIDATES()) {
    if (p && existsSync(p)) {
      return { available: true, path: p, name: "blender" };
    }
  }
  return {
    available: false,
    path: null,
    name: "blender",
    reason: "Blender not found. Set BLENDER_PATH for OBJ/BLEND/FBX-export and FBX fallback.",
  };
}

export function detectTooling() {
  return {
    fbx2gltf: detectFbx2gltf(),
    blender: detectBlender(),
    node: { available: true, version: process.version },
    packageDir: join(__dirname, ".."),
  };
}

export function runCmd(bin, args, opts = {}) {
  const r = spawnSync(bin, args, {
    encoding: "utf8",
    windowsHide: true,
    timeout: opts.timeoutMs ?? 300_000,
    maxBuffer: 32 * 1024 * 1024,
    cwd: opts.cwd,
  });
  return {
    code: r.status ?? -1,
    stdout: r.stdout || "",
    stderr: r.stderr || "",
    error: r.error?.message,
  };
}
