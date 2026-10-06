"""Enable blender_mcp and start the addon socket on :9876.

GUI only. Headless `blender -b` cannot run the MCP command loop.
Called by: npm run blender:mcp:start  (ObjectStore)
"""
import addon_utils
import traceback

import bpy

MOD = "blender_mcp"
PORT = 9876


def log(*parts):
    print("BLENDER_MCP_START", *parts, flush=True)


log("background", bool(bpy.app.background), "blender", bpy.app.version_string)

try:
    loaded_default, loaded_state = addon_utils.check(MOD)
    if loaded_state:
        log("ALREADY_ENABLED", MOD)
    else:
        addon_utils.enable(MOD, default_set=True, persistent=True)
        log("ENABLE_OK", MOD)
except Exception as exc:
    log("ENABLE_FAIL", exc)
    traceback.print_exc()

try:
    bpy.ops.wm.save_userpref()
    log("USERPREF_SAVED")
except Exception as exc:
    log("USERPREF_SKIP", exc)

try:
    scene = bpy.context.scene
    if hasattr(scene, "blendermcp_port"):
        scene.blendermcp_port = PORT
        scene.blendermcp_auto_start_server = True
    server = getattr(bpy.types, "blendermcp_server", None)
    already = bool(server and getattr(server, "running", False))
    if already:
        log("ALREADY_RUNNING", "port", getattr(scene, "blendermcp_port", PORT))
    else:
        bpy.ops.blendermcp.start_server()
        log("START_CALLED")
    running = bool(getattr(bpy.context.scene, "blendermcp_server_running", False))
    log("MCP_READY", "port", PORT, "running", running)
except Exception as exc:
    log("START_FAIL", exc)
    traceback.print_exc()
