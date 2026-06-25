"""
Bake grudge6 race FBX + retargeted locomotion clips → single GLB avatar per race.
Each output GLB contains mesh, Bip001 skeleton, and clips: idle, walk, run, hit, attack.

Headless:
  blender --background --python scripts/blender-bake-metaverse-avatar.py -- \\
    --race human --target path/to/WK_Characters.fbx --out path/to/human.glb

Store Blender (this machine):
  npm run bake:metaverse:store
"""
import importlib.util
import os
import sys
import argparse
import bpy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RETARGET_PY = os.path.join(SCRIPT_DIR, "blender-retarget-to-bip001.py")


def load_retarget_module():
    spec = importlib.util.spec_from_file_location("blender_retarget_bip001", RETARGET_PY)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


DEFAULT_ANIM_PICKS = [
    ("idle", "bound__Bound.fbx"),
    ("walk", "walk__Jog_Fwd.fbx"),
    ("run", "run__Run_Fwd.fbx"),
    ("hit", "hit__HitReact_Left.fbx"),
    ("attack", None),  # filled from rokoko below
]


def bake_clip_onto_target(mod, tgt_arm_obj, source_path, clip_name):
    """Retarget one source FBX onto existing target armature; keep prior actions."""
    src_scale = 0.01 if any(
        k in source_path.replace("\\", "/").lower()
        for k in ("mixamo", "paragon", "rokoko", "ue", "manny")
    ) else 1.0

    src_arm_obj = mod.import_fbx(source_path, global_scale=src_scale)
    if not src_arm_obj:
        raise RuntimeError(f"No armature in source: {source_path}")
    src_arm_obj.name = "SOURCE_ARM"

    pairs = mod.build_remap(src_arm_obj, tgt_arm_obj)
    if len(pairs) < 8:
        raise RuntimeError(f"Too few bone pairs ({len(pairs)}) for {clip_name}")

    src_action = None
    if src_arm_obj.animation_data and src_arm_obj.animation_data.action:
        src_action = src_arm_obj.animation_data.action
    elif bpy.data.actions:
        src_action = bpy.data.actions[-1]
    if not src_action:
        raise RuntimeError(f"No action on source: {source_path}")

    if not src_arm_obj.animation_data:
        src_arm_obj.animation_data_create()
    src_arm_obj.animation_data.action = src_action

    frame_start = int(src_action.frame_range[0])
    frame_end = int(src_action.frame_range[1])
    bpy.context.scene.frame_start = frame_start
    bpy.context.scene.frame_end = frame_end

    bpy.context.view_layer.objects.active = tgt_arm_obj
    bpy.ops.object.mode_set(mode="POSE")
    for src_bone, tgt_bone in pairs:
        pb = tgt_arm_obj.pose.bones.get(tgt_bone)
        if not pb:
            continue
        c_rot = pb.constraints.new("COPY_ROTATION")
        c_rot.name = f"retarget_rot_{clip_name}_{tgt_bone}"
        c_rot.target = src_arm_obj
        c_rot.subtarget = src_bone
        c_rot.target_space = "LOCAL"
        c_rot.owner_space = "LOCAL"

    bpy.ops.object.mode_set(mode="OBJECT")
    for obj in bpy.context.selected_objects:
        obj.select_set(False)
    tgt_arm_obj.select_set(True)
    bpy.context.view_layer.objects.active = tgt_arm_obj

    if clip_name in bpy.data.actions:
        bpy.data.actions.remove(bpy.data.actions[clip_name])

    bpy.ops.nla.bake(
        frame_start=frame_start,
        frame_end=frame_end,
        only_selected=False,
        visual_keying=False,
        clear_constraints=True,
        bake_types={"POSE"},
    )

    baked_action = None
    if tgt_arm_obj.animation_data and tgt_arm_obj.animation_data.action:
        baked_action = tgt_arm_obj.animation_data.action
        baked_action.name = clip_name
        mod.strip_non_rotation_fcurves(baked_action, tgt_arm_obj)

    bpy.data.objects.remove(src_arm_obj, do_unlink=True)
    return {
        "clip": clip_name,
        "frames": frame_end - frame_start + 1,
        "pairs": len(pairs),
    }


def prepare_target_mesh(mod, target_path, target_height=1.75):
    """Import race FBX, scale to metres, ground feet at origin."""
    mod.clear_scene()
    tgt_arm_obj = mod.import_fbx(target_path)
    if not tgt_arm_obj:
        raise RuntimeError(f"No armature in target: {target_path}")
    tgt_arm_obj.name = "AVATAR_ARM"

    # Normalize: grudge6 FBX units vary; fit ~1.75m tall
    bpy.context.view_layer.update()
    ys = []
    mw = tgt_arm_obj.matrix_world
    for bone in tgt_arm_obj.pose.bones:
        ys.append((mw @ bone.head).y)
        ys.append((mw @ bone.tail).y)
    height = max(ys) - min(ys) if ys else 0
    if height > 0:
        scale = target_height / height
        tgt_arm_obj.scale = (scale, scale, scale)
        bpy.context.view_layer.update()

    # Ground all mesh objects
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
        min_z = min(v.co.z for v in obj.data.vertices) if obj.data.vertices else 0
        obj.location.z -= min_z

    return tgt_arm_obj


def bake_avatar(target_path, out_path, anim_sources, target_height=1.75):
    mod = load_retarget_module()
    tgt_arm_obj = prepare_target_mesh(mod, target_path, target_height)

    baked = []
    for clip_name, src_path in anim_sources:
        if not src_path or not os.path.isfile(src_path):
            print(f"BAKE_SKIP {clip_name} missing source")
            continue
        print(f"BAKE_CLIP {clip_name} <- {os.path.basename(src_path)}")
        info = bake_clip_onto_target(mod, tgt_arm_obj, src_path, clip_name)
        baked.append(info)

    if not baked:
        raise RuntimeError("No clips baked")

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        use_selection=False,
        export_animations=True,
        export_skins=True,
        export_morph=False,
        export_cameras=False,
        export_lights=False,
    )

    return {"out": out_path, "clips": baked, "clip_names": [b["clip"] for b in baked]}


def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    p = argparse.ArgumentParser()
    p.add_argument("--race", default="human")
    p.add_argument("--target", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--paragon-dir", default="")
    p.add_argument("--rokoko-attack", default="")
    return p.parse_args(argv)


if __name__ == "__main__":
    args = parse_args()
    paragon = args.paragon_dir or os.path.join(
        SCRIPT_DIR, "..", "models", "animations", "source", "paragon", "shared-locomotion"
    )
    rokoko_attack = args.rokoko_attack or os.path.join(
        SCRIPT_DIR, "..", "models", "animations", "source", "rokoko", "mixamo", "combat", "Boxing_mixamo.fbx"
    )

    sources = []
    for clip_name, paragon_file in DEFAULT_ANIM_PICKS:
        if clip_name == "attack":
            sources.append((clip_name, rokoko_attack))
        else:
            sources.append((clip_name, os.path.join(paragon, paragon_file)))

    result = bake_avatar(args.target, args.out, sources)
    print("BAKE_OK", result)