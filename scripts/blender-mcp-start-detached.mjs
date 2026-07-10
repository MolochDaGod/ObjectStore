#!/usr/bin/env node
/**
 * Remind / optional spawn of blender-mcp server.
 * Prefer Grok/Claude MCP config (uvx blender-mcp) over manual start.
 * The Blender *addon* must still be Connect'd inside Blender UI.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:os";
import { homedir } from "node:os";

const uvx =
  process.env.UVX_PATH ||
  (existsSync(join(homedir(), ".local", "bin", "uvx.exe"))
    ? join(homedir(), ".local", "bin", "uvx.exe")
    : "uvx");

console.log(`
Blender MCP:
  - MCP process is normally started by Grok via [mcp_servers.blender]
  - Inside Blender: N-panel → BlenderMCP → Connect (port 9876)

If you need a manual server process:
  ${uvx} --python 3.11 blender-mcp

Detaching is usually unnecessary when Grok owns the MCP server.
`);

if (process.argv.includes("--spawn")) {
  const child = spawn(uvx, ["--python", "3.11", "blender-mcp"], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    env: { ...process.env, DISABLE_TELEMETRY: "true" },
  });
  child.unref();
  console.log("Spawned blender-mcp pid", child.pid);
}
