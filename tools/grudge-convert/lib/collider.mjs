/**
 * Bake production colliders from mesh AABB / capsule hints.
 * Writes glTF extras + optional companion .collider.json for game loaders.
 */
import { writeFileSync } from "node:fs";

/**
 * @param {import('@gltf-transform/core').Document} document
 * @param {{ capsule?: boolean, padding?: number, yHip?: boolean }} opts
 */
export function bakeColliders(document, opts = {}) {
  const { capsule = true, padding = 0.02, yHip = true, characterHeight = 0 } = opts;
  const root = document.getRoot();
  const colliders = [];

  for (const mesh of root.listMeshes()) {
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    let has = false;

    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute("POSITION");
      if (!pos) continue;
      // Always walk float elements (correct after quantize + scale bake)
      const count = pos.getCount();
      if (!count) continue;
      has = true;
      const el = [0, 0, 0];
      for (let i = 0; i < count; i++) {
        pos.getElement(i, el);
        if (el[0] < min[0]) min[0] = el[0];
        if (el[1] < min[1]) min[1] = el[1];
        if (el[2] < min[2]) min[2] = el[2];
        if (el[0] > max[0]) max[0] = el[0];
        if (el[1] > max[1]) max[1] = el[1];
        if (el[2] > max[2]) max[2] = el[2];
      }
    }
    if (!has) continue;

    const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    // Skip degenerate / empty equip stubs so companion JSON stays accurate
    if (!Number.isFinite(size[0]) || !Number.isFinite(size[1]) || size[1] < 1e-5) {
      continue;
    }
    const center = [
      (min[0] + max[0]) / 2,
      (min[1] + max[1]) / 2,
      (min[2] + max[2]) / 2,
    ];
    const radius = Math.max(size[0], size[2]) * 0.5 + padding;
    const height = Math.max(0.01, size[1] - radius * 2);

    const collider = {
      mesh: mesh.getName() || "mesh",
      type: capsule ? "capsule" : "box",
      center,
      size,
      min,
      max,
      capsule: capsule
        ? {
            align: "Y",
            radius: Number(radius.toFixed(4)),
            height: Number(height.toFixed(4)),
            /** Hips-aligned: center Y shifted toward upper half for humanoids */
            offsetY: yHip ? Number((center[1] * 0.15).toFixed(4)) : 0,
          }
        : null,
      box: {
        halfExtents: size.map((s) => Number((s / 2 + padding).toFixed(4))),
      },
    };
    colliders.push(collider);

    // Attach to first node that uses this mesh
    for (const node of root.listNodes()) {
      if (node.getMesh() === mesh) {
        const extras = { ...(node.getExtras() || {}) };
        extras.grudgeCollider = collider;
        node.setExtras(extras);
        break;
      }
    }
  }

  // Scene-level aggregate (character root capsule)
  if (colliders.length) {
    let gmin = [Infinity, Infinity, Infinity];
    let gmax = [-Infinity, -Infinity, -Infinity];
    for (const c of colliders) {
      for (let i = 0; i < 3; i++) {
        gmin[i] = Math.min(gmin[i], c.min[i]);
        gmax[i] = Math.max(gmax[i], c.max[i]);
      }
    }
    const gsize = [gmax[0] - gmin[0], gmax[1] - gmin[1], gmax[2] - gmin[2]];
    const gcenter = [
      (gmin[0] + gmax[0]) / 2,
      (gmin[1] + gmax[1]) / 2,
      (gmin[2] + gmax[2]) / 2,
    ];
    // Full mesh AABB is often huge (weapons / cloth). Prefer production
    // character capsule when --height was used.
    let radius;
    let height;
    let center;
    let size;
    if (characterHeight > 0) {
      radius = 0.35;
      height = Math.max(0.01, characterHeight - radius * 2);
      center = [0, characterHeight / 2, 0];
      size = [radius * 2, characterHeight, radius * 2];
    } else {
      radius = Math.max(gsize[0], gsize[2]) * 0.5 + padding;
      // Cap absurd weapon-inflated radii for gameplay
      radius = Math.min(radius, Math.max(gsize[1] * 0.35, 0.5));
      height = Math.max(0.01, gsize[1] - radius * 2);
      center = gcenter.map((n) => Number(n.toFixed(4)));
      size = gsize.map((n) => Number(n.toFixed(4)));
    }
    const rootCollider = {
      type: "capsule",
      role: "character_root",
      center: center.map((n) => Number(Number(n).toFixed(4))),
      size: size.map((n) => Number(Number(n).toFixed(4))),
      capsule: {
        align: "Y",
        radius: Number(radius.toFixed(4)),
        height: Number(height.toFixed(4)),
      },
      practice: "Attach Cannon/Rapier body to hips/Y root; do not per-mesh armor RB on grudge6.",
    };

    for (const scene of root.listScenes()) {
      const extras = { ...(scene.getExtras() || {}) };
      extras.grudgeColliders = colliders;
      extras.grudgeRootCollider = rootCollider;
      scene.setExtras(extras);
    }

    return { colliders, rootCollider };
  }

  return { colliders: [], rootCollider: null };
}

export function writeColliderCompanion(outGlbPath, payload) {
  const p = outGlbPath.replace(/\.glb$/i, ".collider.json").replace(/\.gltf$/i, ".collider.json");
  writeFileSync(
    p,
    JSON.stringify(
      {
        version: 1,
        generator: "@grudge-studio/asset-convert",
        ...payload,
      },
      null,
      2,
    ),
  );
  return p;
}
