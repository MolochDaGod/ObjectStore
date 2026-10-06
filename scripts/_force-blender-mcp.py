"""Force-restart BlenderMCP socket on :9876 and keep GUI alive."""
import addon_utils, traceback, bpy, time

MOD = "blender_mcp"
PORT = 9876

def log(*a):
    print("BLENDER_MCP_FORCE", *a, flush=True)

try:
    addon_utils.enable(MOD, default_set=True, persistent=True)
    log("enabled", MOD)
except Exception as e:
    log("enable_fail", e)

scene = bpy.context.scene
try:
    if hasattr(scene, "blendermcp_port"):
        scene.blendermcp_port = PORT
except Exception:
    pass

# Stop if a stale server object exists
try:
    bpy.ops.blendermcp.stop_server()
    log("stop_ok")
    time.sleep(0.3)
except Exception as e:
    log("stop_skip", e)

try:
    bpy.ops.blendermcp.start_server()
    log("start_ok")
except Exception as e:
    log("start_fail", e)
    traceback.print_exc()

running = bool(getattr(scene, "blendermcp_server_running", False))
log("ready", "port", PORT, "running", running)
