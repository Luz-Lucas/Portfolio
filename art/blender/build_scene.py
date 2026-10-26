# Constrói a cena da escrivaninha anos 90 (Z para cima, observador em -Y).
import bpy, bmesh, math, random
from mathutils import Vector

exec(open(r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\helpers.py", encoding="utf8").read())

random.seed(95)

# ---------- limpar ----------
for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    bpy.data.collections.remove(c)
for block in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
    for d in list(block):
        block.remove(d)

sc = bpy.context.scene
sc.unit_settings.system = "METRIC"

# ---------- materiais ----------
BEIGE = mat("Plastico_Bege", (0.69, 0.64, 0.52), rough=0.55)
BEIGE_DARK = mat("Plastico_Bege_Escuro", (0.52, 0.48, 0.39), rough=0.6)
KEYCAP = mat("Tecla", (0.72, 0.68, 0.57), rough=0.5)
KEYCAP_DARK = mat("Tecla_Escura", (0.42, 0.40, 0.36), rough=0.5)
WOOD = mat("Madeira", (0.32, 0.18, 0.09), rough=0.45)
WALL = mat("Parede", (0.10, 0.10, 0.11), rough=0.9)
FLOOR = mat("Piso", (0.05, 0.04, 0.035), rough=0.8)
METAL = mat("Metal_Luminaria", (0.12, 0.12, 0.13), rough=0.35, metal=0.9)
SCREEN = mat("Tela", (0.02, 0.03, 0.03), rough=0.12)
LED = mat("LED", (0.05, 0.15, 0.05), rough=0.3)
CABLE = mat("Cabo", (0.03, 0.03, 0.03), rough=0.6)
PAD = mat("Mousepad", (0.04, 0.05, 0.08), rough=0.9)
CD = mat("CD", (0.8, 0.8, 0.85), rough=0.08, metal=1.0)
MUG = mat("Caneca", (0.55, 0.12, 0.08), rough=0.35)
BULB = mat("Lampada", (1, 0.9, 0.7), emission=(1, 0.75, 0.45), strength=8)
FLOPPY_COLORS = [(0.05, 0.05, 0.06), (0.1, 0.18, 0.4), (0.45, 0.08, 0.06), (0.6, 0.6, 0.6)]
BOOK_COLORS = [(0.35, 0.06, 0.05), (0.08, 0.14, 0.3), (0.12, 0.22, 0.12), (0.5, 0.4, 0.2),
               (0.2, 0.2, 0.22), (0.45, 0.3, 0.1), (0.6, 0.55, 0.45), (0.25, 0.08, 0.2)]

# ---------- sala ----------
box("Parede", (5, 0.05, 3.2), (0, 0.45, 1.6), "Room", WALL)
box("Piso", (5, 3, 0.02), (0, -0.8, -0.01), "Room", FLOOR)

# ---------- mesa ----------
DESK_TOP = 0.75
box("Mesa_Tampo", (1.6, 0.78, 0.04), (0, 0.02, DESK_TOP - 0.02), "Desk", WOOD, bevel=0.006)
for x in (-0.76, 0.76):
    box(f"Mesa_Lateral_{'E' if x < 0 else 'D'}", (0.04, 0.72, DESK_TOP - 0.04), (x, 0.02, (DESK_TOP - 0.04) / 2), "Desk", WOOD)
box("Mesa_Fundo", (1.48, 0.02, 0.4), (0, 0.38, DESK_TOP - 0.24), "Desk", WOOD)

# ---------- gabinete horizontal ----------
CX = -0.02
CASE_H = 0.115
case = box("Gabinete", (0.44, 0.40, CASE_H), (CX, 0.0, DESK_TOP + CASE_H / 2), "Computer", BEIGE, bevel=0.008, segments=3)
cz = DESK_TOP + CASE_H / 2
front = -0.20
# frente: drives, botão, grade
box("Drive_Disquete", (0.11, 0.01, 0.022), (CX - 0.12, front - 0.002, cz + 0.022), "Computer", BEIGE_DARK, bevel=0.002)
box("Drive_Disquete_Fenda", (0.085, 0.012, 0.004), (CX - 0.12, front - 0.003, cz + 0.025), "Computer", CABLE)
box("Drive_CD", (0.15, 0.01, 0.026), (CX - 0.10, front - 0.002, cz - 0.022), "Computer", BEIGE_DARK, bevel=0.002)
box("Gabinete_Botao", (0.022, 0.012, 0.022), (CX + 0.17, front - 0.004, cz + 0.02), "Computer", BEIGE_DARK, bevel=0.003)
box("Gabinete_Logo", (0.05, 0.004, 0.012), (CX + 0.12, front - 0.002, cz + 0.032), "Computer", mat("Logo", (0.15, 0.25, 0.5), rough=0.4))
for i in range(6):
    box(f"Gabinete_Grade_{i}", (0.12, 0.006, 0.003), (CX + 0.12, front - 0.002, cz - 0.004 - i * 0.008), "Computer", BEIGE_DARK)

# ---------- monitor CRT ----------
MZ = DESK_TOP + CASE_H + 0.025 + 0.18  # centro vertical do monitor
cyl("Monitor_Base", 0.12, 0.018, (CX, -0.04, DESK_TOP + CASE_H + 0.009), "Computer", BEIGE, verts=48)
cyl("Monitor_Pescoco", 0.07, 0.03, (CX, -0.04, DESK_TOP + CASE_H + 0.03), "Computer", BEIGE_DARK, verts=32)

FRONT_Y = -0.16
shell = box("Monitor_Moldura", (0.40, 0.09, 0.36), (CX, FRONT_Y + 0.045, MZ), "Computer", BEIGE, bevel=0.018, segments=4)
# abertura da tela (boolean)
cut = box("_corte", (0.316, 0.2, 0.24), (CX, FRONT_Y, MZ + 0.015), "Computer", None, bevel=0.012, segments=3)
b = shell.modifiers.new("Abertura", "BOOLEAN")
b.object = cut
b.operation = "DIFFERENCE"
shell.modifiers.move(1, 0)
apply_mods(shell)
bpy.data.objects.remove(cut, do_unlink=True)

# carcaça traseira afunilada (tubo)
remove("Monitor_Tubo")
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    if v.co.y > 0:  # face traseira menor
        v.co.x *= 0.62
        v.co.z *= 0.62
        v.co.z -= 0.04
me = bpy.data.meshes.new("Monitor_Tubo")
bm.to_mesh(me)
bm.free()
tube = bpy.data.objects.new("Monitor_Tubo", me)
coll("Computer").objects.link(tube)
tube.scale = (0.38, 0.30, 0.34)
tube.location = (CX, FRONT_Y + 0.09 + 0.15, MZ - 0.005)
bpy.context.view_layer.objects.active = tube
tube.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
tb = tube.modifiers.new("Bevel", "BEVEL")
tb.width = 0.015
tb.segments = 3
me.materials.append(BEIGE)
for i in range(7):
    box(f"Monitor_Ventilacao_{i}", (0.004, 0.12, 0.004), (CX - 0.07 + i * 0.022, FRONT_Y + 0.28, MZ + 0.116), "Computer", BEIGE_DARK)

# tela levemente convexa (UV 0..1)
SCR_W, SCR_H = 0.30, 0.225
SCR_Z = MZ + 0.015
remove("Screen")
bpy.ops.mesh.primitive_grid_add(x_subdivisions=24, y_subdivisions=18, size=1)
scr = bpy.context.active_object
scr.name = "Screen"
scr.data.name = "Screen"
for v in scr.data.vertices:
    x, z = v.co.x * SCR_W, v.co.y * SCR_H
    bulge = 0.012 * (1 - (2 * v.co.x) ** 2) * (1 - (2 * v.co.y) ** 2)
    v.co = Vector((x, -bulge, z))
scr.location = (CX, FRONT_Y + 0.022, SCR_Z)
scr.data.materials.append(SCREEN)
shade_smooth(scr, 80)
link(scr, "Computer")
# moldura interna escura ao redor do vidro
box("Monitor_Borda_Tela", (0.318, 0.01, 0.243), (CX, FRONT_Y + 0.027, SCR_Z), "Computer", mat("Borda_Tela", (0.05, 0.05, 0.05), rough=0.6))

# botões e LED sob a tela
BTN_Z = MZ - 0.15
for i, x in enumerate((0.05, 0.075, 0.10)):
    box(f"Monitor_Botao_{i}", (0.014, 0.008, 0.008), (CX + x, FRONT_Y - 0.002, BTN_Z), "Computer", BEIGE_DARK, bevel=0.002)
box("Monitor_Liga", (0.024, 0.01, 0.016), (CX + 0.15, FRONT_Y - 0.003, BTN_Z), "Computer", BEIGE_DARK, bevel=0.003)
led = box("PowerLED", (0.006, 0.004, 0.006), (CX + 0.125, FRONT_Y - 0.003, BTN_Z), "Computer", LED)
box("Monitor_Marca", (0.06, 0.003, 0.008), (CX - 0.13, FRONT_Y - 0.001, BTN_Z), "Computer", BEIGE_DARK)

# ---------- teclado ----------
KY, KZ = -0.38, DESK_TOP + 0.016
kb = box("Teclado", (0.46, 0.17, 0.028), (CX, KY, KZ), "Computer", BEIGE, bevel=0.006, segments=3, rot=(math.radians(4), 0, 0))
keycap_mesh = None
rows = [(15, 0.0), (15, 0.0), (14, 0.012), (13, 0.018), (12, 0.024)]
pitch = 0.0185
for r, (n, off) in enumerate(rows):
    for c in range(n):
        name = f"Tecla_{r}_{c}"
        x = CX - 0.20 + off + c * pitch
        if x > CX + 0.08:  # bloco numérico separado
            x += 0.012
        y = KY - 0.055 + r * 0.023
        z = KZ + 0.017 + (y - KY) * math.tan(math.radians(4))
        k = box(name, (0.0165, 0.0165, 0.01), (x, y, z), "Computer", KEYCAP_DARK if (c == 0 or c == n - 1) else KEYCAP,
                bevel=0.003, segments=2)
# barra de espaço
box("Tecla_Espaco", (0.12, 0.0165, 0.01), (CX - 0.07, KY - 0.078, KZ + 0.016), "Computer", KEYCAP, bevel=0.003)

# ---------- mouse ----------
box("Mousepad", (0.22, 0.19, 0.004), (0.36, -0.36, DESK_TOP + 0.002), "Props", PAD, bevel=0.01, segments=4)
remove("Mouse")
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=32, ring_count=16, location=(0.36, -0.37, DESK_TOP + 0.016))
mouse = bpy.context.active_object
mouse.name = "Mouse"
mouse.scale = (0.032, 0.055, 0.018)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
for v in mouse.data.vertices:
    if v.co.z < -0.004:
        v.co.z = -0.004
mouse.data.materials.append(BEIGE)
shade_smooth(mouse, 60)
link(mouse, "Props")
box("Mouse_Divisao", (0.0015, 0.03, 0.002), (0.36, -0.345, DESK_TOP + 0.033), "Props", BEIGE_DARK)

# ---------- cabos ----------
curve_tube("Cabo_Mouse", [(0.36, -0.32, DESK_TOP + 0.01), (0.33, -0.2, DESK_TOP + 0.004), (0.24, -0.1, DESK_TOP + 0.004), (0.2, 0.15, DESK_TOP + 0.03)], 0.0022, "Props", CABLE)
curve_tube("Cabo_Teclado", [(CX - 0.1, KY + 0.085, KZ), (CX - 0.18, -0.24, DESK_TOP + 0.004), (CX - 0.28, -0.05, DESK_TOP + 0.004), (CX - 0.24, 0.2, DESK_TOP + 0.03)], 0.0025, "Props", CABLE)
curve_tube("Cabo_Monitor", [(CX + 0.05, 0.18, MZ - 0.1), (CX + 0.12, 0.3, MZ - 0.25), (CX + 0.1, 0.25, DESK_TOP + 0.06), (CX + 0.06, 0.2, DESK_TOP + 0.08)], 0.004, "Props", CABLE)

# ---------- luminária articulada ----------
LX, LY = -0.62, 0.16
cyl("Luminaria_Base", 0.07, 0.02, (LX, LY, DESK_TOP + 0.01), "Props", METAL, verts=48)
j1 = Vector((LX, LY, DESK_TOP + 0.03))
j2 = Vector((LX + 0.05, LY - 0.02, DESK_TOP + 0.42))
j3 = Vector((-0.38, -0.02, DESK_TOP + 0.56))
for i, (a, b2) in enumerate(((j1, j2), (j2, j3))):
    curve_tube(f"Luminaria_Braco_{i}", [tuple(a), tuple((a + b2) / 2), tuple(b2)], 0.006, "Props", METAL)
    remove(f"Luminaria_Junta_{i}")
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=b2)
    bpy.context.active_object.name = f"Luminaria_Junta_{i}"
    bpy.context.active_object.data.materials.append(METAL)
    link(bpy.context.active_object, "Props")
# cúpula cônica apontando para a mesa
remove("Luminaria_Cupula")
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.075, radius2=0.025, depth=0.11, end_fill_type="NOTHING", location=j3 + Vector((0.03, -0.02, -0.05)))
shade = bpy.context.active_object
shade.name = "Luminaria_Cupula"
shade.rotation_euler = (math.radians(-20), math.radians(-35), 0)
sol = shade.modifiers.new("Espessura", "SOLIDIFY")
sol.thickness = 0.002
shade.data.materials.append(METAL)
shade_smooth(shade, 60)
link(shade, "Props")
remove("Luminaria_Lampada")
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.02, location=shade.location + Vector((0.012, -0.006, -0.02)))
bulb = bpy.context.active_object
bulb.name = "Luminaria_Lampada"
bulb.data.materials.append(BULB)
link(bulb, "Props")

# ---------- disquetes e CDs ----------
for i in range(5):
    m = mat(f"Disquete_{i}", FLOPPY_COLORS[i % len(FLOPPY_COLORS)], rough=0.4)
    rz = math.radians(random.uniform(-14, 14))
    d = box(f"Disquete_{i}", (0.09, 0.094, 0.0033), (-0.46 + random.uniform(-0.01, 0.01), -0.16 + random.uniform(-0.01, 0.01), DESK_TOP + 0.002 + i * 0.0034), "Props", m, rot=(0, 0, rz))
    box(f"Disquete_Etiqueta_{i}", (0.07, 0.05, 0.0005), d.location + Vector((0, 0.012, 0.0018)), "Props", mat("Etiqueta", (0.85, 0.83, 0.75), rough=0.8), rot=(0, 0, rz))
for i, (x, y, r) in enumerate(((-0.52, -0.40, 10), (-0.42, -0.47, -25), (-0.57, -0.30, 40))):
    cyl(f"CD_{i}", 0.06, 0.0012, (x, y, DESK_TOP + 0.0006 + i * 0.0013), "Props", CD, verts=64, rot=(0, 0, math.radians(r)))
    cyl(f"CD_Furo_{i}", 0.0075, 0.0016, (x, y, DESK_TOP + 0.0006 + i * 0.0013), "Props", mat("CD_Centro", (0.9, 0.9, 0.9), rough=0.3), verts=24)
# tubo de pôster (como na referência)
cyl("Tubo_Poster", 0.028, 0.26, (-0.40, -0.05, DESK_TOP + 0.028), "Props", mat("Tubo", (0.75, 0.42, 0.25), rough=0.6), rot=(0, math.radians(90), math.radians(25)))

# ---------- caneca (no lugar da caixa do Win95) ----------
cyl("Caneca", 0.038, 0.095, (0.43, 0.06, DESK_TOP + 0.0475), "Props", MUG, verts=48)
remove("Caneca_Alca")
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.006, location=(0.47, 0.06, DESK_TOP + 0.05), rotation=(math.radians(90), 0, 0))
bpy.context.active_object.name = "Caneca_Alca"
bpy.context.active_object.data.materials.append(MUG)
link(bpy.context.active_object, "Props")

# ---------- estante com livros ----------
SX0, SX1, SY = 0.86, 1.56, 0.29
box("Estante_Lateral_E", (0.02, 0.30, 2.0), (SX0, SY, 1.0), "Room", WOOD)
box("Estante_Lateral_D", (0.02, 0.30, 2.0), (SX1, SY, 1.0), "Room", WOOD)
box("Estante_Fundo", (SX1 - SX0, 0.01, 2.0), ((SX0 + SX1) / 2, SY + 0.145, 1.0), "Room", WOOD)
for i, z in enumerate((0.02, 0.42, 0.82, 1.22, 1.62, 1.99)):
    box(f"Estante_Prateleira_{i}", (SX1 - SX0, 0.30, 0.02), ((SX0 + SX1) / 2, SY, z), "Room", WOOD)
    if z > 1.9:
        continue
    x = SX0 + 0.02
    j = 0
    while x < SX1 - 0.06:
        w = random.uniform(0.02, 0.045)
        h = random.uniform(0.2, 0.32)
        lean = math.radians(random.uniform(-4, 4)) if random.random() < 0.2 else 0
        box(f"Livro_{i}_{j}", (w, random.uniform(0.17, 0.22), h), (x + w / 2, SY + 0.02, z + 0.01 + h / 2), "Room",
            mat(f"Livro_{(i * 7 + j) % len(BOOK_COLORS)}", BOOK_COLORS[(i * 7 + j) % len(BOOK_COLORS)], rough=0.7), rot=(0, lean, 0))
        x += w + random.uniform(0.001, 0.004)
        j += 1
        if random.random() < 0.08:
            x += 0.08  # espaço vazio

# ---------- câmeras ----------
SCREEN_CENTER = Vector((CX, FRONT_Y + 0.02, SCR_Z))
for name, dist, dz in (("CamEnd", 0.575, 0.01), ("CamStart", 0.78, 0.045)):
    remove(name)
    cd = bpy.data.cameras.new(name)
    cd.sensor_fit = "VERTICAL"
    cd.angle_y = math.radians(35)
    cd.clip_start = 0.01
    cd.clip_end = 20
    cam = bpy.data.objects.new(name, cd)
    coll("Cameras").objects.link(cam)
    cam.location = SCREEN_CENTER + Vector((0, -dist, dz))
    direction = SCREEN_CENTER - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
sc.camera = bpy.data.objects["CamStart"]
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080

bpy.ops.wm.save_as_mainfile(filepath=ROOT + r"\desk.blend")
result = {"objects": len(bpy.data.objects), "screen_center": list(SCREEN_CENTER)}
