#!/usr/bin/env node
/**
 * setup-blender-mcp.mjs — print/check Blender MCP prerequisites for Grudge.
 *
 * Does not install Blender itself. Checks uvx / blender-mcp / addon file
 * and prints Grok config.toml snippet.
 */
import { existsSync } from "node:fs";
import { spawnSync as spawn } from "node:child_process";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const addonPath = join(root, "tools", "grudge-convert", "blender", "addon.py");

function which(cmd) {
  const r = spawn(process.platform === "win32" ? "where" : "which", [cmd], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.status !== 0) return null;
  return (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean) || null;
}

const uvx =
  which("uvx") ||
  (existsSync(join(homedir(), ".local", "bin", "uvx.exe"))
    ? join(homedir(), ".local", "bin", "uvx.exe")
    : null) ||
  (existsSync(join(homedir(), ".local", "bin", "uvx"))
    ? join(homedir(), ".local", "bin", "uvx")
    : null);

const blenderMcp =
  which("blender-mcp") ||
  (existsSync(
    join(
      homedir(),
      "AppData",
      "Local",
      "Programs",
      "Python",
      "Python313",
      "Scripts",
      "blender-mcp.exe",
    ),
  )
    ? join(
        homedir(),
        "AppData",
        "Local",
        "Programs",
        "Python",
        "Python313",
        "Scripts",
        "blender-mcp.exe",
      )
    : null);

const blenderCandidates = [
  process.env.BLENDER_PATH,
  process.env.GRUDGE_BLENDER,
  which("blender"),
  "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
  "C:\\Program Files\\Blender Foundation\\Blender 4.2\\blender.exe",
].filter(Boolean);
const blender = blenderCandidates.find((p) => p && existsSync(p)) || null;

console.log("Blender MCP setup (Grudge)\n");
console.log(`  uvx:         ${uvx || "MISSING — install https://docs.astral.sh/uv/"}`);
console.log(`  blender-mcp: ${blenderMcp || "MISSING — uvx blender-mcp  or  pipx install blender-mcp"}`);
console.log(`  blender.exe: ${blender || "MISSING — install Blender 4.x; set BLENDER_PATH"}`);
console.log(`  addon.py:    ${existsSync(addonPath) ? addonPath : "MISSING — run: npm run blender:mcp:install-addon"}`);
console.log(`  socket:      BLENDER_HOST=${process.env.BLENDER_HOST || "localhost"} BLENDER_PORT=${process.env.BLENDER_PORT || "9876"}`);

console.log(`
Grok config.toml snippet:

[mcp_servers.blender]
command = ${JSON.stringify(uvx || "uvx")}
args = ["--python", "3.11", "blender-mcp"]
env = { DISABLE_TELEMETRY = "true", UV_PYTHON_PREFERENCE = "only-managed" }
enabled = true
startup_timeout_sec = 120
tool_timeout_sec = 600

Steps:
  1. Install full Blender (blender.exe must exist).
  2. npm run blender:mcp:install-addon
  3. Blender → Edit → Preferences → Add-ons → Install addon.py → enable "Blender MCP"
  4. N-panel → BlenderMCP → Connect
  5. Restart Grok; search_tool "blender"
  6. After MCP cleanup/export, always: npm run convert -- glb2glb ...
`);

const missing = !uvx || !blender;
process.exitCode = missing ? 2 : 0;
