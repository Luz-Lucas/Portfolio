# Ajustes v4: moldura do monitor mais fina com tela maior, e caneca mais perto do monitor
# (para a câmera final ficar centralizada na tela com a caneca e a luminária no quadro).
# Uso: blender -b desk.blend --python monitor_v4.py   (salva o desk.blend)
import bpy

ROOT = r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d"
exec(open(ROOT + r"\helpers.py", encoding="utf8").read())

CX = -0.02
FRONT_Y = -0.16
MZ = 1.07  # centro vertical da moldura (z 0.89 .. 1.25)

# ---------- moldura com abertura maior (bordas laterais e superior finas) ----------
old = bpy.data.objects["Monitor_Moldura"]
beige = old.data.materials[0]
bpy.data.objects.remove(old, do_unlink=True)
OPEN_W, OPEN_H = 0.356, 0.276
OPEN_Z = 1.25 - 0.022 - OPEN_H / 2  # 2,2 cm de borda no topo; o queixo embaixo guarda os botões
shell = box("Monitor_Moldura", (0.40, 0.09, 0.36), (CX, FRONT_Y + 0.045, MZ), "Computer", beige, bevel=0.018, segments=4)
cut = box("_corte", (OPEN_W, 0.2, OPEN_H), (CX, FRONT_Y, OPEN_Z), "Computer", None, bevel=0.012, segments=3)
b = shell.modifiers.new("Abertura", "BOOLEAN")
b.object = cut
b.operation = "DIFFERENCE"
shell.modifiers.move(1, 0)
apply_mods(shell)
bpy.data.objects.remove(cut, do_unlink=True)

# ---------- tela 4:3 maior, levemente convexa (UV 0..1) ----------
SCR_W, SCR_H = 0.34, 0.255
scr = bpy.data.objects["Screen"]
for v in scr.data.vertices:
    gx, gz = v.co.x / 0.30, v.co.z / 0.225  # volta para a grade -0.5..0.5 da v3
    bulge = 0.012 * (1 - (2 * gx) ** 2) * (1 - (2 * gz) ** 2)
    v.co.x, v.co.y, v.co.z = gx * SCR_W, -bulge, gz * SCR_H
scr.location = (CX, FRONT_Y + 0.022, OPEN_Z)
borda = bpy.data.objects["Monitor_Borda_Tela"]
bmat = borda.data.materials[0]
box("Monitor_Borda_Tela", (OPEN_W + 0.002, 0.01, OPEN_H + 0.003), (CX, FRONT_Y + 0.027, OPEN_Z), "Computer", bmat)

# ---------- caneca (com café e fumaça) mais perto do monitor ----------
DX = -0.09
for o in bpy.data.objects:
    if o.name.startswith(("Caneca", "Cafe", "Vapor")):
        o.location.x += DX

bpy.ops.wm.save_mainfile()
print("RESULT", {"open_z": round(OPEN_Z, 4), "screen": (SCR_W, SCR_H), "mug_x": round(bpy.data.objects["Caneca"].location.x, 3)})
