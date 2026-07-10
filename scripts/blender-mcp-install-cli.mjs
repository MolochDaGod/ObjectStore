#!/usr/bin/env node
/**
 * Download ahujasid/blender-mcp addon.py into tools/grudge-convert/blender/
 */
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "tools", "grudge-convert", "blender");
const outFile = join(outDir, "addon.py");
const url =
  process.env.BLENDER_MCP_ADDON_URL ||
  "https://raw.githubusercontent.com/ahujasid/blender-mcp/main/addon.py";

await fs.mkdir(outDir, { recursive: true });
console.log("Fetching", url);
const res = await fetch(url);
if (!res.ok) {
  console.error("Download failed", res.status, res.statusText);
  process.exit(1);
}
const text = await res.text();
if (!text.includes("bl_info") && !text.includes("BlenderMCP") && text.length < 500) {
  console.error("Unexpected addon content (too short or missing markers)");
  process.exit(1);
}
await fs.writeFile(outFile, text, "utf8");
console.log("Wrote", outFile);
console.log(`
Install in Blender:
  Edit → Preferences → Add-ons → Install… → select this file
  Enable "Interface: Blender MCP"
  3D View N-panel → BlenderMCP → Connect
`);
