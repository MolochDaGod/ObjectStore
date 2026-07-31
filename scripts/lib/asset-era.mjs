/**
 * Era classification for Grudge Studio assets.
 * Era is metadata — never packed into UUID alone.
 */

/** @typedef {'grudge6'|'tvs'|'warlords'|'legacy'|'gamedata'|'ui'|'audio'|'vfx'|'unknown'} AssetEra */

/**
 * @param {string} keyOrPath - r2Key or relative path
 * @returns {AssetEra}
 */
export function classifyEra(keyOrPath) {
  const p = (keyOrPath || "").replace(/\\/g, "/").toLowerCase();

  if (
    p.includes("master-") ||
    p.includes("gamedata") ||
    p.includes("/api/v1/") ||
    p.endsWith(".json") && (p.includes("recipe") || p.includes("profession") || p.includes("weapon"))
  ) {
    if (p.includes("models/") || p.includes("textures/")) {
      /* fall through for model json */
    } else if (p.endsWith(".json") || p.includes("api/v1")) {
      return "gamedata";
    }
  }

  if (
    p.includes("grudge6") ||
    /\/(wk|brb|elf|dwf|orc|ud)_/.test(p) ||
    p.includes("toon-rts") ||
    p.includes("toon_rts")
  ) {
    return "grudge6";
  }

  if (
    p.includes("voxels/tvs") ||
    p.includes("voxel-knights") ||
    p.includes("voxel-rangers") ||
    p.includes("voxel-wizards") ||
    p.includes("voxel-cathedral") ||
    p.includes("/tvs/")
  ) {
    return "tvs";
  }

  if (
    p.includes("warlords") ||
    p.includes("haven_shore") ||
    p.includes("pirate-islands") ||
    p.includes("lobby/pirate")
  ) {
    return "warlords";
  }

  if (
    p.includes("/vfx/") ||
    p.includes("3dfx") ||
    p.includes("effects/") ||
    p.includes("shaders/")
  ) {
    return "vfx";
  }

  if (
    p.includes("/icons/") ||
    p.includes("/ui/") ||
    p.includes("/sprites/") ||
    p.includes("/backgrounds/") ||
    p.includes("/branding/")
  ) {
    return "ui";
  }

  if (
    p.includes("/audio/") ||
    p.includes("/sfx/") ||
    p.includes("/music/") ||
    /\.(mp3|ogg|wav|flac)$/.test(p)
  ) {
    return "audio";
  }

  if (
    p.includes("fresh grudge") ||
    p.includes("grudge-legacy") ||
    p.includes("unity") ||
    p.includes("kaykit") ||
    p.includes("meshy") ||
    p.includes("staging") ||
    p.includes("raw/") ||
    p.includes("/fbx/") && !p.includes("grudge6")
  ) {
    return "legacy";
  }

  if (p.includes("models/") || p.includes("characters/") || p.includes("creatures/")) {
    return "legacy";
  }

  return "unknown";
}

export const ERA_LABELS = {
  grudge6: "Grudge6 / Toon RTS modular races",
  tvs: "TVS voxel explorers (GrudgeDot CDN)",
  warlords: "Warlords island / session packs",
  legacy: "Legacy Unity / unconverted / staging",
  gamedata: "JSON definitions (items, recipes, skills)",
  ui: "Icons, sprites, HUD, backgrounds",
  audio: "SFX / BGM",
  vfx: "VFX meshes / sheets / shaders",
  unknown: "Unclassified path",
};
