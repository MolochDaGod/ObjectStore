"""Force-start BlenderMCP socket on :9876 (GUI only)."""
import addon_utils
import traceback
from pathlib import Path

import bpy

MOD = "blender_mcp"
PORT = 9876
LOG = Path.home() / ".grok" / "long-running-background-tasks" / "blender-mcp-force.log"
READY = Path.home() / ".grok" / "long-running-background-tasks" / "blender-mcp-ready.flag"


def log(*parts):
    msg = " ".join(str(p) for p in parts)
    print("BLENDER_MCP_FORCE", msg, flush=True)
    try:
        LOG.parent.mkdir(parents=True, exist_ok=True)
        with LOG.open("a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception:
        pass


log("boot", bpy.app.version_string, "bg", bool(bpy.app.background))

try:
    addon_utils.enable(MOD, default_set=True, persistent=True)
    log("enable_ok")
except Exception as e:
    log("enable_fail", e)
    traceback.print_exc()


def start_server():
    try:
        # Import after enable so BlenderMCPServer exists
        import blender_mcp

        # Prefer addon module's class
        Server = None
        for mod in addon_utils.modules():
            if getattr(mod, "__name__", "") == MOD or "blender_mcp" in str(getattr(mod, "__file__", "")):
                Server = getattr(mod, "BlenderMCPServer", None)
                if Server:
                    break
        if Server is None:
            # Fallback: already registered singleton path via operator
            try:
                bpy.ops.blendermcp.start_server()
                running = bool(getattr(bpy.context.scene, "blendermcp_server_running", False))
                log("ops_start", running)
                if running:
                    READY.write_text("ok\n", encoding="utf-8")
                return None
            except Exception as e:
                log("ops_fail", e)
                traceback.print_exc()
                return None

        # Stop stale instance
        if hasattr(bpy.types, "blendermcp_server") and bpy.types.blendermcp_server:
            try:
                bpy.types.blendermcp_server.stop()
            except Exception:
                pass

        srv = Server(host="127.0.0.1", port=PORT)
        bpy.types.blendermcp_server = srv
        srv.start()
        try:
            bpy.context.scene.blendermcp_port = PORT
            bpy.context.scene.blendermcp_server_running = bool(srv.running)
        except Exception as e:
            log("scene_flag_skip", e)

        log("server_running", bool(srv.running), "port", PORT)
        if srv.running:
            READY.write_text(f"ok port={PORT}\n", encoding="utf-8")
        else:
            READY.write_text("fail not running\n", encoding="utf-8")
    except Exception as e:
        log("start_fail", e)
        traceback.print_exc()
        try:
            READY.write_text(f"fail {e}\n", encoding="utf-8")
        except Exception:
            pass
    return None


try:
    bpy.app.timers.register(start_server, first_interval=1.5)
    log("timer_registered")
except Exception as e:
    log("timer_fail", e)
    start_server()
