# Uso: blender -b desk_bake.blend --python bake_run.py -- <grupo|export>
import bpy, sys, json
ROOT = r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d"
exec(open(ROOT + r"\bake_pipeline.py", encoding="utf8").read())
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "OPTIX"
prefs.get_devices()
for d in prefs.devices:
    d.use = d.type == "OPTIX"
arg = sys.argv[sys.argv.index("--") + 1]
if arg == "export":
    print("RESULT", json.dumps({"glb_mb": finalize_and_export()}))
else:
    t = bake(arg)
    png = denoise(arg)
    bpy.ops.wm.save_mainfile()
    print("RESULT", json.dumps({"group": arg, "bake_s": t, "png": png}))
