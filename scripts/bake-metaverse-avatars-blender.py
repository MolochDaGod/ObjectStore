"""Bake all 6 metaverse avatars inside Blender (Store or desktop)."""
import importlib.util
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OBJECTSTORE = os.environ.get("OBJECTSTORE_ROOT", os.path.join(SCRIPT_DIR, ".."))
RTS = os.environ.get("RTS_ROOT", os.path.join(OBJECTSTORE, "..", "RTS-Grudge"))

spec = importlib.util.spec_from_file_location(
    "bake_avatar",
    os.path.join(SCRIPT_DIR, "blender-bake-metaverse-avatar.py"),
)
bake_mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bake_mod)

RACES = [
    ("human", "WK_Characters.fbx"),
    ("barbarian", "BRB_Characters.fbx"),
    ("orc", "ORC_Characters.fbx"),
    ("undead", "UD_Characters.fbx"),
    ("elf", "ELF_Characters.fbx"),
    ("dwarf", "DWF_Characters.fbx"),
]

FBX_ROOT = os.path.join(RTS, "client", "public", "models", "grudge6", "races")
OUT_ROOT = os.path.join(OBJECTSTORE, "models", "grudge6", "metaverse")
PARAGON = os.path.join(OBJECTSTORE, "models", "animations", "source", "paragon", "shared-locomotion")
ROKOKO = os.path.join(OBJECTSTORE, "models", "animations", "source", "rokoko", "mixamo", "combat", "Boxing_mixamo.fbx")

sources = []
for clip_name, paragon_file in bake_mod.DEFAULT_ANIM_PICKS:
    if clip_name == "attack":
        sources.append((clip_name, ROKOKO))
    else:
        sources.append((clip_name, os.path.join(PARAGON, paragon_file)))

os.makedirs(OUT_ROOT, exist_ok=True)
manifest = []

for race_id, fbx_name in RACES:
    target = os.path.join(FBX_ROOT, fbx_name)
    out = os.path.join(OUT_ROOT, f"{race_id}.glb")
    if not os.path.isfile(target):
        print(f"MISS {target}")
        continue
    print(f"\n=== {race_id} ===")
    result = bake_mod.bake_avatar(target, out, sources)
    print("BAKE_OK", result)
    manifest.append({
        "raceId": race_id,
        "file": f"{race_id}.glb",
        "cdnUrl": f"https://assets.grudge-studio.com/models/grudge6/metaverse/{race_id}.glb",
        "clips": result.get("clip_names", []),
    })

with open(os.path.join(OUT_ROOT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump({
        "version": "1.0.0",
        "skeleton": "Bip001",
        "cdnBase": "https://assets.grudge-studio.com/models/grudge6/metaverse",
        "avatars": manifest,
    }, f, indent=2)

print(f"\nDONE {len(manifest)} avatars → {OUT_ROOT}")