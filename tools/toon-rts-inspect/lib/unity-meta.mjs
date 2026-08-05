/**
 * Parse Unity .meta (YAML-ish) without full UnityYAML.
 * ModelImporter.internalIDToNameTable is the agent-readable mesh/bone SSOT for FBX.
 */
import fs from "node:fs";

/**
 * @param {string} metaPath
 * @returns {{
 *   guid?: string,
 *   importer?: string,
 *   names: string[],
 *   bones: string[],
 *   meshes: string[],
 *   materials: string[],
 *   rawGuid?: string,
 * }}
 */
export function parseUnityMeta(metaPath) {
  const text = fs.readFileSync(metaPath, "utf8");
  const guid = text.match(/^guid:\s*([a-f0-9]+)/m)?.[1];
  let importer = "unknown";
  if (/ModelImporter:/m.test(text)) importer = "ModelImporter";
  else if (/TextureImporter:/m.test(text)) importer = "TextureImporter";
  else if (/NativeFormatImporter:/m.test(text)) importer = "NativeFormatImporter";
  else if (/DefaultImporter:/m.test(text)) importer = "DefaultImporter";
  else if (/PrefabImporter:/m.test(text)) importer = "PrefabImporter";

  const names = [];
  for (const m of text.matchAll(/^\s*second:\s*(.+)\s*$/gm)) {
    const v = m[1].trim();
    if (!v || v.startsWith("{")) continue;
    names.push(v);
  }

  const bones = names.filter(
    (n) =>
      /^Bip001/i.test(n) ||
      /^Bone_/i.test(n) ||
      /hand_container|shield_container|Quiver/i.test(n) ||
      n === "//RootNode",
  );
  const meshes = names.filter(
    (n) =>
      !bones.includes(n) &&
      n !== "//RootNode" &&
      !/^Bip001/i.test(n),
  );

  // external material refs in meta
  const materials = [];
  for (const m of text.matchAll(/guid:\s*([a-f0-9]{32})/g)) {
    materials.push(m[1]);
  }

  return {
    guid,
    importer,
    names: [...new Set(names)],
    bones: [...new Set(bones)],
    meshes: [...new Set(meshes)],
    materials: [...new Set(materials)],
  };
}

/**
 * Parse Unity .mat (YAML) for name + texture property hints.
 * @param {string} matPath
 */
export function parseUnityMat(matPath) {
  const text = fs.readFileSync(matPath, "utf8");
  const name = text.match(/m_Name:\s*(.+)/)?.[1]?.trim();
  const shader = text.match(/m_Shader:\s*\{([^}]+)\}/)?.[1]?.trim();
  const keywords = text.match(/m_ShaderKeywords:\s*(.+)/)?.[1]?.trim();
  const texEnvs = [];
  // crude: lines under m_TexEnvs "- _MainTex:" style
  for (const m of text.matchAll(/- (_\w+):\s*\n\s*m_Texture:\s*\{([^}]*)\}/g)) {
    texEnvs.push({ prop: m[1], texture: m[2].trim() });
  }
  // also bare texture guids near MainTex
  const mainTexGuid = text.match(/_MainTex:[\s\S]*?guid:\s*([a-f0-9]{32})/)?.[1];
  return {
    name: name || pathBase(matPath),
    shader,
    keywords,
    mainTexGuid,
    texEnvs,
    path: matPath,
  };
}

function pathBase(p) {
  return p.replace(/\\/g, "/").split("/").pop().replace(/\.mat$/i, "");
}
