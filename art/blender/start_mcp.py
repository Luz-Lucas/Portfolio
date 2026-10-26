# Habilita o add-on MCP e inicia o servidor quando a interface estiver pronta.
import addon_utils, bpy

addon_utils.enable("bl_ext.user_default.mcp", default_set=False)

def _start():
    try:
        bpy.ops.blmcp.server_start()
    except Exception as ex:
        print("MCP start error:", ex)
    return None

bpy.app.timers.register(_start, first_interval=2.0)
