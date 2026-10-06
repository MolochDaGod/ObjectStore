import addon_utils, traceback
from pathlib import Path
import bpy
LOG = Path.home()/".grok"/"long-running-background-tasks"/"blender-mcp-force.log"
READY = Path.home()/".grok"/"long-running-background-tasks"/"blender-mcp-ready.flag"
PORT=9876
def log(*a):
    m=" ".join(map(str,a)); print("KEEP",m,flush=True)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a",encoding="utf-8") as f: f.write(m+"\n")
log("boot", bpy.app.version_string)
addon_utils.enable("blender_mcp", default_set=True, persistent=True)
log("enabled")
def start():
    try:
        import blender_mcp as bm
        Server = getattr(bm, "BlenderMCPServer", None)
        if not Server:
            bpy.ops.blendermcp.start_server()
            running=bool(getattr(bpy.context.scene,"blendermcp_server_running",False))
            READY.write_text(f"ops {running}\n",encoding="utf-8"); log("ops",running); return None
        old=getattr(bpy.types,"blendermcp_server",None)
        if old:
            try: old.stop()
            except Exception: pass
        srv=Server(host="127.0.0.1", port=PORT)
        bpy.types.blendermcp_server=srv
        srv.start()
        bpy.context.scene.blendermcp_port=PORT
        bpy.context.scene.blendermcp_server_running=bool(srv.running)
        log("running", bool(srv.running), "sock", bool(srv.socket))
        READY.write_text(f"ok {bool(srv.running)}\n",encoding="utf-8")
    except Exception as e:
        log("fail", e); traceback.print_exc(); READY.write_text(f"fail {e}\n",encoding="utf-8")
    return None
def heartbeat():
    srv=getattr(bpy.types,"blendermcp_server",None)
    log("hb", bool(srv and srv.running)); return 20.0
bpy.app.timers.register(start, first_interval=2.0)
bpy.app.timers.register(heartbeat, first_interval=20.0)
log("timers")
