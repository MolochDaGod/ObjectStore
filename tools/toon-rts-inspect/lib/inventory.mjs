import fs from "node:fs";
import path from "node:path";
import { RACES, walkFiles } from "./paths.mjs";
import { parseUnityMeta, parseUnityMat } from "./unity-meta.mjs";

/**
 * Full author-pack inventory for agent + human.
 * @param {string} root
 */
export function buildInventory(root) {
  const races = [];
  for (const r of RACES) {
    const raceDir = path.join(root, r.folder);
    if (!fs.existsSync(raceDir)) {
      races.push({ ...r, missing: true });
      continue;
    }

    const fbx = walkFiles(raceDir, (f) => /\.fbx$/i.test(f) && !/\.meta$/i.test(f));
    const tga = walkFiles(raceDir, (f) => /\.tga$/i.test(f));
    const mats = walkFiles(raceDir, (f) => /\.mat$/i.test(f));
    const metas = walkFiles(raceDir, (f) => /\.meta$/i.test(f));
    const controllers = walkFiles(raceDir, (f) => /\.controller$/i.test(f));

    const charFbx = fbx.find((f) => /Characters_customizable\.FBX$/i.test(f));
    const charMeta = charFbx ? `${charFbx}.meta` : null;
    let meshTable = null;
    if (charMeta && fs.existsSync(charMeta)) {
      const parsed = parseUnityMeta(charMeta);
      meshTable = {
        meta: charMeta,
        guid: parsed.guid,
        boneCount: parsed.bones.length,
        meshPartCount: parsed.meshes.length,
        bones: parsed.bones,
        meshParts: parsed.meshes,
      };
    }

    const materialBrief = mats.slice(0, 40).map((m) => {
      try {
        return parseUnityMat(m);
      } catch {
        return { path: m, error: true };
      }
    });

    races.push({
      ...r,
      missing: false,
      paths: {
        raceDir,
        characterFbx: charFbx || null,
        characterMeta: charMeta && fs.existsSync(charMeta) ? charMeta : null,
      },
      counts: {
        fbx: fbx.length,
        tga: tga.length,
        mat: mats.length,
        meta: metas.length,
        controller: controllers.length,
      },
      fbx: fbx.map((f) => ({
        rel: path.relative(root, f),
        bytes: fs.statSync(f).size,
      })),
      textures: tga.map((f) => ({
        rel: path.relative(root, f),
        bytes: fs.statSync(f).size,
      })),
      meshTable,
      materials: materialBrief,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    authorRoot: root,
    raceCount: races.filter((r) => !r.missing).length,
    races,
  };
}
