"""
Blender headless export script — Classic 64 Asset Pack
Exports a single .blend file to GLB with correct N64-style scale.

Usage (called by import-classic64.mjs):
  blender --background <file.blend> --python blend-to-glb.py -- <output.glb>

N64 scale note: Classic 64 assets are modelled at 1 unit = 1 meter in Blender,
so no scale correction is needed. We apply a visual scale of 1.0 and export
with Y-up → Z-up conversion off (GLB uses Y-up by default).
"""

import bpy
import sys
import os

# Get output path from args after '--'
argv = sys.argv
try:
    sep = argv.index('--')
    out_path = argv[sep + 1]
except (ValueError, IndexError):
    print("ERROR: No output path provided after --")
    sys.exit(1)

# Clear default scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# The .blend file is already open (passed via --background <file>)
# Select all mesh objects
bpy.ops.object.select_all(action='SELECT')

# Apply scale to all objects so GLB has correct measurements
for obj in bpy.context.selected_objects:
    if obj.type == 'MESH':
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.transform_apply(scale=True)

# Export to GLB
os.makedirs(os.path.dirname(out_path), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    use_selection=False,
    export_apply=True,           # apply modifiers
    export_texcoords=True,
    export_normals=True,
    export_materials='EXPORT',
    export_colors=True,
    export_cameras=False,
    export_lights=False,
    export_yup=True,             # GLB standard is Y-up
    export_animations=False,     # static asset pack
)

print(f"EXPORTED: {out_path}")
