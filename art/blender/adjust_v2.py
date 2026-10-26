# Ajustes pedidos: mesa maior, CDs na mesa, livros reais, caneca temática com café e fumaça,
# teclado com layout completo e mouse melhor.
import bpy, bmesh, math, random
from mathutils import Vector, Matrix

exec(open(r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\helpers.py", encoding="utf8").read())
random.seed(42)
sc = bpy.data.scenes["Scene"]
DESK = 0.75
CX = -0.02
FONTS = r"C:\Windows\Fonts"


def font(name):
    path = f"{FONTS}\\{name}.ttf"
    for f in bpy.data.fonts:
        if f.filepath == path:
            return f
    return bpy.data.fonts.load(path)


def purge(prefixes):
    for o in list(bpy.data.objects):
        if o.name.startswith(prefixes):
            bpy.data.objects.remove(o, do_unlink=True)


# ================= mesa maior =================
top = bpy.data.objects["Mesa_Tampo"]
top.scale = (1.0, 1.0, 1.0)
top.location = (0.0, -0.05, DESK - 0.02)
top.dimensions = (1.8, 0.95, 0.04)
for side, x in (("E", -0.86), ("D", 0.86)):
    o = bpy.data.objects[f"Mesa_Lateral_{side}"]
    o.location = (x, -0.05, o.location.z)
    o.dimensions = (0.04, 0.88, o.dimensions.z)
bpy.data.objects["Mesa_Fundo"].dimensions = (1.68, 0.02, 0.4)
FRONT_EDGE = -0.05 - 0.475  # -0.525

# ================= CDs dentro da mesa =================
for i, (x, y, r) in enumerate(((-0.66, -0.34, 10), (-0.57, -0.40, -25), (-0.72, -0.24, 40))):
    for n in (f"CD_{i}", f"CD_Furo_{i}"):
        o = bpy.data.objects[n]
        o.location.x, o.location.y = x, y

# ================= teclado (layout AT de 101 teclas) =================
purge(("Tecla", "Teclado"))
U = 0.019
CAP = 0.0172
KY = -0.36
TILT = math.radians(4)
LIGHT = bpy.data.materials["Tecla"]
DARK = bpy.data.materials["Tecla_Escura"]
BEIGE = bpy.data.materials["Plastico_Bege"]

# (x em unidades, linha, largura, altura, escura?) — linha 0 = fileira do espaço (mais perto do usuário)
keys = []
def row(r, items, x=0.0):
    for w, dark in items:
        if w < 0:
            x += -w
            continue
        keys.append((x, r, w, 1, dark))
        x += w

row(5.5, [(1, 1), (-1, 0)] + [(1, 0)] * 4 + [(-0.5, 0)] + [(1, 1)] * 4 + [(-0.5, 0)] + [(1, 0)] * 4)
row(4, [(1, 0)] * 13 + [(2, 1)])
row(3, [(1.5, 1)] + [(1, 0)] * 12 + [(1.5, 1)])
row(2, [(1.75, 1)] + [(1, 0)] * 11 + [(2.25, 1)])
row(1, [(2.25, 1)] + [(1, 0)] * 10 + [(2.75, 1)])
row(0, [(1.5, 1), (-1, 0), (1.5, 1), (7, 0), (1.5, 1), (-1, 0), (1.5, 1)])
NAV = 15.5
row(5.5, [(1, 1)] * 3, NAV)
row(4, [(1, 1)] * 3, NAV)
row(3, [(1, 1)] * 3, NAV)
row(1, [(1, 1)], NAV + 1)
row(0, [(1, 1)] * 3, NAV)
NUM = 19.0
row(4, [(1, 1)] * 4, NUM)
row(3, [(1, 0)] * 3, NUM)
row(2, [(1, 0)] * 3, NUM)
row(1, [(1, 0)] * 3, NUM)
row(0, [(2, 0), (1, 0)], NUM)
keys.append((NUM + 3, 2, 1, 2, 1))  # + (2 de altura)
keys.append((NUM + 3, 0, 1, 2, 1))  # Enter do numpad

TOTAL_U = 23.0
x0 = CX - TOTAL_U * U / 2
y_front = KY - 0.075
BOARD_TOP = DESK + 0.026
bm = bmesh.new()
for (kx, r, w, h, dark) in keys:
    sx, sy = w * U - (U - CAP), h * U - (U - CAP)
    cx = x0 + (kx + w / 2) * U
    cy = y_front + (r + h / 2) * U + 0.006
    geom = bmesh.ops.create_cube(bm, size=1.0)
    verts = geom["verts"]
    for v in verts:
        top_v = v.co.z > 0
        shrink = 0.8 if top_v else 1.0  # tecla levemente cônica
        v.co.x = v.co.x * sx * (shrink if w < 1.6 else 0.94 if top_v else 1.0)
        v.co.y = v.co.y * sy * (shrink if h == 1 else 0.94 if top_v else 1.0)
        v.co.z = v.co.z * 0.011
        v.co += Vector((cx, cy, BOARD_TOP + 0.0055))
    faces = {f for v in verts for f in v.link_faces}
    for f in faces:
        f.material_index = 1 if dark else 0
me = bpy.data.meshes.new("Teclado_Teclas")
bm.to_mesh(me)
bm.free()
me.materials.append(LIGHT)
me.materials.append(DARK)
caps = bpy.data.objects.new("Teclado_Teclas", me)
coll("Computer").objects.link(caps)
bev = caps.modifiers.new("Bevel", "BEVEL")
bev.width = 0.0016
bev.segments = 2

board = box("Teclado", (TOTAL_U * U + 0.03, 6.5 * U + 0.03, 0.026), (CX, y_front + 3.25 * U + 0.006, DESK + 0.013), "Computer", BEIGE, bevel=0.005, segments=3)
for i, dx in enumerate((0.0, 0.016, 0.032)):  # LEDs Num/Caps/Scroll
    box(f"Teclado_LED_{i}", (0.006, 0.003, 0.0015), (x0 + (NUM + 0.6) * U + dx, y_front + 6.6 * U, BOARD_TOP + 0.0008), "Computer", bpy.data.materials["LED"])

pivot = Matrix.Translation(Vector((CX, y_front, DESK)))
rot = pivot @ Matrix.Rotation(TILT, 4, "X") @ pivot.inverted()
for o in [caps, board] + [bpy.data.objects[f"Teclado_LED_{i}"] for i in range(3)]:
    o.matrix_world = rot @ o.matrix_world

# cabo do teclado sai do fundo do teclado para o gabinete
cab = bpy.data.objects["Cabo_Teclado"].data.splines[0].bezier_points
pts = [(CX - 0.05, y_front + 6.5 * U + 0.02, DESK + 0.02), (CX - 0.12, -0.17, DESK + 0.004), (CX - 0.27, -0.06, DESK + 0.004), (CX - 0.24, 0.2, DESK + 0.03)]
for bp, p in zip(cab, pts):
    bp.co = p

# ================= mouse =================
purge(("Mouse",))
MX, MY = 0.36, -0.38
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co.x *= 0.058
    v.co.y *= 0.098
    v.co.z *= 0.036
    if v.co.z > 0 and v.co.y > 0:
        v.co.z -= 0.010  # frente mais baixa (botões)
    if v.co.z > 0 and v.co.y < 0:
        v.co.z -= 0.004
me = bpy.data.meshes.new("Mouse")
bm.to_mesh(me)
bm.free()
mouse = bpy.data.objects.new("Mouse", me)
coll("Props").objects.link(mouse)
sub = mouse.modifiers.new("Sub", "SUBSURF")
sub.levels = sub.render_levels = 3
apply_mods(mouse)
zmin = min(v.co.z for v in me.vertices)
for v in me.vertices:
    if v.co.z < zmin + 0.004:
        v.co.z = zmin + 0.004
mouse.location = (MX, MY, DESK + 0.004 - (zmin + 0.004))
me.materials.append(BEIGE)
shade_smooth(mouse, 80)
bpy.context.view_layer.update()


def surface_z(x, y):
    hit, loc, *_ = mouse.ray_cast(mouse.matrix_world.inverted() @ Vector((x, y, 1.0)), Vector((0, 0, -1)))
    return (mouse.matrix_world @ loc).z if hit else DESK + 0.02


GROOVE = mat("Mouse_Divisao", (0.2, 0.18, 0.14), rough=0.6)
split_y = MY + 0.012
for i in range(9):  # divisão entre botões e corpo, acompanhando a curvatura
    x = MX - 0.022 + i * 0.0055
    box(f"Mouse_Divisao_H_{i}", (0.006, 0.0012, 0.004), (x, split_y, surface_z(x, split_y) - 0.0012), "Props", GROOVE)
for i in range(6):  # divisão entre botão esquerdo e direito
    y = split_y + 0.004 + i * 0.006
    box(f"Mouse_Divisao_V_{i}", (0.0012, 0.0065, 0.004), (MX, y, surface_z(MX, y) - 0.0012), "Props", GROOVE)
box("Mousepad", (0.22, 0.20, 0.004), (MX, MY + 0.005, DESK + 0.002), "Props", bpy.data.materials["Mousepad"], bevel=0.01, segments=4)
cm = bpy.data.objects["Cabo_Mouse"].data.splines[0].bezier_points
for bp, p in zip(cm, [(MX, MY + 0.05, DESK + 0.008), (MX - 0.02, -0.22, DESK + 0.004), (0.24, -0.1, DESK + 0.004), (0.2, 0.15, DESK + 0.03)]):
    bp.co = p

# ================= livros reais (atlas de lombadas) =================
BOOKS_LOW = [
    ("The C Programming Language", "Kernighan & Ritchie", (0.93, 0.93, 0.9), (0.08, 0.2, 0.6), "arialbd", 0.022, 0.235),
    ("Structure and Interpretation of Computer Programs", "Abelson & Sussman", (0.33, 0.14, 0.45), (1, 1, 1), "timesbd", 0.034, 0.235),
    ("Clean Code", "Robert C. Martin", (0.12, 0.12, 0.14), (0.95, 0.55, 0.15), "arialbd", 0.03, 0.235),
    ("The Pragmatic Programmer", "Hunt & Thomas", (0.07, 0.07, 0.07), (0.95, 0.95, 0.95), "georgiab", 0.028, 0.235),
    ("Design Patterns", "Gamma, Helm, Johnson, Vlissides", (0.9, 0.88, 0.82), (0.1, 0.1, 0.1), "timesbd", 0.03, 0.24),
    ("Neuromancer", "William Gibson", (0.04, 0.18, 0.22), (0.3, 0.95, 0.8), "consolab", 0.022, 0.2),
    ("Duna", "Frank Herbert", (0.78, 0.47, 0.16), (0.15, 0.08, 0.02), "georgiab", 0.042, 0.23),
    ("O Guia do Mochileiro das Galáxias", "Douglas Adams", (0.08, 0.08, 0.08), (0.6, 0.92, 0.2), "arialbd", 0.03, 0.21),
    ("Snow Crash", "Neal Stephenson", (0.86, 0.86, 0.88), (0.1, 0.1, 0.1), "impact", 0.032, 0.23),
    ("Refactoring", "Martin Fowler", (0.5, 0.08, 0.08), (1, 1, 1), "georgiab", 0.026, 0.24),
    ("Eloquent JavaScript", "Marijn Haverbeke", (0.96, 0.84, 0.32), (0.08, 0.08, 0.08), "verdanab", 0.026, 0.235),
    ("1984", "George Orwell", (0.85, 0.1, 0.1), (1, 1, 1), "impact", 0.022, 0.2),
]
STACK = [  # deitados
    ("Introduction to Algorithms", "CLRS", (0.12, 0.25, 0.5), (1, 1, 1), "timesbd", 0.24, 0.05),
    ("Code Complete", "Steve McConnell", (0.1, 0.1, 0.12), (0.92, 0.8, 0.3), "arialbd", 0.23, 0.042),
    ("O Senhor dos Anéis", "J.R.R. Tolkien", (0.22, 0.1, 0.05), (0.92, 0.76, 0.4), "georgiab", 0.22, 0.055),
]
BOOKS_HIGH = [
    ("Designing Data-Intensive Applications", "Martin Kleppmann", (0.65, 0.15, 0.1), (1, 1, 1), "arialbd", 0.036, 0.24),
    ("The Mythical Man-Month", "Frederick P. Brooks Jr.", (0.75, 0.2, 0.1), (0.98, 0.95, 0.85), "georgiab", 0.02, 0.235),
    ("You Don't Know JS", "Kyle Simpson", (0.98, 0.85, 0.1), (0.05, 0.05, 0.05), "impact", 0.018, 0.23),
    ("Fundação", "Isaac Asimov", (0.1, 0.15, 0.35), (0.92, 0.8, 0.5), "timesbd", 0.026, 0.21),
    ("Eu, Robô", "Isaac Asimov", (0.6, 0.6, 0.62), (0.1, 0.1, 0.15), "verdanab", 0.024, 0.2),
    ("Jogador Nº 1", "Ernest Cline", (0.1, 0.2, 0.6), (1, 0.85, 0.2), "verdanab", 0.03, 0.22),
    ("Androides Sonham com Ovelhas Elétricas?", "Philip K. Dick", (0.55, 0.75, 0.8), (0.05, 0.05, 0.1), "arialbd", 0.026, 0.21),
    ("Masters of Doom", "David Kushner", (0.1, 0.05, 0.05), (0.92, 0.2, 0.1), "impact", 0.032, 0.235),
    ("Hackers", "Steven Levy", (0.95, 0.95, 0.92), (0.0, 0.4, 0.1), "courbd", 0.026, 0.22),
    ("Fahrenheit 451", "Ray Bradbury", (0.95, 0.5, 0.1), (0.05, 0.05, 0.05), "arialbd", 0.022, 0.2),
    ("Code Complete", "Steve McConnell", (0.1, 0.1, 0.12), (0.92, 0.8, 0.3), "arialbd", 0.04, 0.24),
    ("Code: The Hidden Language", "Charles Petzold", (0.85, 0.82, 0.75), (0.15, 0.25, 0.45), "georgiab", 0.028, 0.23),
]

ATLAS_PX = 2048
PX_PER_M = 1600.0
cells = []  # (book, x_px, y_px, w_px, h_px, horizontal)
cursor_x, cursor_y, row_h = 8, 8, 0
for b in BOOKS_LOW + STACK + BOOKS_HIGH:  # mesma ordem em que os livros são criados
    horizontal = b[5] > b[6]
    w_px, h_px = int(b[5] * PX_PER_M), int(b[6] * PX_PER_M)
    if cursor_x + w_px > ATLAS_PX - 8:
        cursor_x, cursor_y, row_h = 8, cursor_y + row_h + 8, 0
    cells.append((b, cursor_x, cursor_y, w_px, h_px, horizontal))
    cursor_x += w_px + 8
    row_h = max(row_h, h_px)
PAGES = (8, cursor_y + row_h + 8, 64, 64)  # bloco creme das páginas
LABEL = (8, PAGES[1] + 72, 1024, 256)      # rótulo da caneca (volta completa)

# ---- cena auxiliar para renderizar o atlas ----
old = bpy.data.scenes.get("Atlas")
if old:
    for o in list(old.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.scenes.remove(old)
atlas = bpy.data.scenes.new("Atlas")
S = 0.001  # 1 px = 1 mm na cena do atlas


def emit(name, color):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = (*color, 1)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(e.outputs[0], out.inputs[0])
    return m


def rect(name, x, y, w, h, color, z=0.0):
    me = bpy.data.meshes.new(name)
    cx, cy = (x + w / 2) * S, (ATLAS_PX - (y + h / 2)) * S
    hw, hh = w * S / 2, h * S / 2
    me.from_pydata([(cx - hw, cy - hh, z), (cx + hw, cy - hh, z), (cx + hw, cy + hh, z), (cx - hw, cy + hh, z)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new(name, me)
    me.materials.append(emit(f"atlas_{name}", color))
    atlas.collection.objects.link(o)
    return o


def text(name, body, fnt, color, cx_px, cy_px, max_w_px, max_h_px, vertical, z=0.001):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.font = font(fnt)
    cu.align_x, cu.align_y = "CENTER", "CENTER"
    cu.size = 0.05
    o = bpy.data.objects.new(name, cu)
    cu.materials.append(emit(f"atlas_txt_{name}", color))
    atlas.collection.objects.link(o)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    tw, th = o.evaluated_get(dg).dimensions.x, o.evaluated_get(dg).dimensions.y
    along, across = (max_h_px, max_w_px) if vertical else (max_w_px, max_h_px)
    k = min(along * S / max(tw, 1e-6), across * S / max(th, 1e-6))
    o.scale = (k, k, 1)
    if vertical:
        o.rotation_euler = (0, 0, math.radians(-90))
    o.location = (cx_px * S, (ATLAS_PX - cy_px) * S, z)
    return o


rect("bg", 0, 0, ATLAS_PX, ATLAS_PX, (0.5, 0.5, 0.5), z=-0.002)
for i, (b, x, y, w, h, horiz) in enumerate(cells):
    title, author, bg, fg, fnt = b[:5]
    rect(f"cell_{i}", x, y, w, h, bg)
    if horiz:
        text(f"t_{i}", title, fnt, fg, x + w * 0.38, y + h / 2, w * 0.6, h * 0.55, False)
        text(f"a_{i}", author, fnt, fg, x + w * 0.86, y + h / 2, w * 0.18, h * 0.35, False)
    else:
        text(f"t_{i}", title, fnt, fg, x + w / 2, y + h * 0.40, w * 0.62, h * 0.58, True)
        text(f"a_{i}", author, fnt, fg, x + w / 2, y + h * 0.85, w * 0.4, h * 0.17, True)
        rect(f"band_{i}", x, y + h * 0.035, w, h * 0.012, fg, z=0.0005)
rect("pages", *PAGES, (0.86, 0.82, 0.7))
# rótulo da caneca: branco com uma janelinha Win95 "café.exe" virada para a câmera (u ≈ 0.70)
lx, ly, lw, lh = LABEL
rect("label_bg", lx, ly, lw, lh, (0.95, 0.94, 0.9))
wx = lx + int(lw * 0.70) - 150
rect("win_frame", wx, ly + 46, 300, 170, (0.75, 0.75, 0.75), z=0.0003)
rect("win_title", wx + 4, ly + 50, 292, 30, (0.0, 0.0, 0.5), z=0.0006)
text("win_title_t", "café.exe", "tahomabd", (1, 1, 1), wx + 70, ly + 65, 120, 22, False, z=0.0009)
for k, dx in enumerate((262, 236)):
    rect(f"win_btn_{k}", wx + dx, ly + 54, 22, 20, (0.75, 0.75, 0.75), z=0.0009)
text("win_x", "x", "tahomabd", (0, 0, 0), wx + 273, ly + 63, 14, 16, False, z=0.0012)
text("win_body", "C:\\> preparando café...", "consolab", (0, 0, 0), wx + 150, ly + 112, 270, 26, False, z=0.0009)
rect("win_bar", wx + 20, ly + 150, 260, 30, (1, 1, 1), z=0.0006)
for k in range(7):
    rect(f"win_bar_{k}", wx + 24 + k * 26, ly + 154, 22, 22, (0.0, 0.0, 0.5), z=0.0009)
text("mug_tag", "HELLO, WORLD", "impact", (0.0, 0.0, 0.5), lx + int(lw * 0.20), ly + lh / 2, 300, 60, False, z=0.0009)

cam_d = bpy.data.cameras.new("AtlasCam")
cam_d.type = "ORTHO"
cam_d.ortho_scale = ATLAS_PX * S
cam = bpy.data.objects.new("AtlasCam", cam_d)
atlas.collection.objects.link(cam)
cam.location = (ATLAS_PX * S / 2, ATLAS_PX * S / 2, 1)
atlas.camera = cam
atlas.render.engine = "BLENDER_EEVEE"
atlas.render.resolution_x = atlas.render.resolution_y = ATLAS_PX
atlas.render.resolution_percentage = 100
atlas.view_settings.view_transform = "Standard"
atlas.render.film_transparent = False
atlas.render.image_settings.file_format = "PNG"
atlas.render.filepath = ROOT + r"\atlas_livros.png"
win = bpy.context.window
prev = win.scene
win.scene = atlas
bpy.ops.render.render(write_still=True, scene="Atlas")
win.scene = prev
for o in list(atlas.objects):
    bpy.data.objects.remove(o, do_unlink=True)
bpy.data.scenes.remove(atlas)

img = bpy.data.images.get("atlas_livros.png")
if img:
    img.reload()
else:
    img = bpy.data.images.load(ROOT + r"\atlas_livros.png")
ATLAS_MAT = bpy.data.materials.get("Atlas_Livros") or bpy.data.materials.new("Atlas_Livros")
ATLAS_MAT.use_nodes = True
nt = ATLAS_MAT.node_tree
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Roughness"].default_value = 0.65
tex = nt.nodes.get("Atlas") or nt.nodes.new("ShaderNodeTexImage")
tex.name = "Atlas"
tex.image = img
tex.interpolation = "Linear"
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])


def uv_rect(px):
    x, y, w, h = px
    return (x / ATLAS_PX, 1 - (y + h) / ATLAS_PX, (x + w) / ATLAS_PX, 1 - y / ATLAS_PX)


def make_book(name, size, loc, cell, rot_y=0.0):
    _, x, y, w, h, horiz = cell
    sx, sy, sz = size
    spine = uv_rect((x, y, w, h))
    cover = uv_rect((x + 1, y + 1, max(2, w - 2), 4))  # faixa lisa no topo da célula
    pages = uv_rect((PAGES[0] + 4, PAGES[1] + 4, 56, 56))
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz))
    uv = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        n = f.normal
        if n.y < -0.9:  # lombada
            u0, v0, u1, v1 = spine
            for l in f.loops:
                l[uv].uv = (u0 + (l.vert.co.x / sx + 0.5) * (u1 - u0), v0 + (l.vert.co.z / sz + 0.5) * (v1 - v0))
        else:
            u0, v0, u1, v1 = pages if (n.y > 0.9 or (n.z > 0.9 and not horiz)) else cover
            for l, (a, b) in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
                l[uv].uv = (u0 + a * (u1 - u0), v0 + b * (v1 - v0))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(ATLAS_MAT)
    o = bpy.data.objects.new(name, me)
    coll("Room").objects.link(o)
    o.location = loc
    o.rotation_euler = (0, rot_y, 0)
    return o


purge(("Livro_",))
WY = 0.31
shelves = {o.name: o for o in bpy.data.objects if o.name in ("Prateleira_0", "Prateleira_1")}
x0s, x1s = 0.30, 1.05
cell_iter = iter(cells)
for shelf_name, books in (("Prateleira_0", BOOKS_LOW), ("Prateleira_1", BOOKS_HIGH)):
    z_top = shelves[shelf_name].location.z + 0.011
    x = x0s + 0.015
    for j, b in enumerate(books):
        cell = next(cell_iter)
        w, h = b[5], b[6]
        depth = random.uniform(0.15, 0.18)
        lean = math.radians(-10) if (shelf_name == "Prateleira_1" and j == len(books) - 1) else 0.0
        make_book(f"Livro_{shelf_name[-1]}_{j}", (w, depth, h), (x + w / 2, WY - 0.02 + (0.18 - depth) / 2, z_top + h / 2), cell, lean)
        x += w + random.uniform(0.0008, 0.003)
    if shelf_name == "Prateleira_0":
        stack_x = x + 0.02 + 0.12
        zz = z_top
        for s, b in enumerate(STACK):
            cell = next(cell_iter)
            w, h = b[5], b[6]
            make_book(f"Livro_0_pilha_{s}", (w, 0.16, h), (stack_x + random.uniform(-0.01, 0.01), WY - 0.02, zz + h / 2), cell)
            zz += h + 0.0005

# ================= caneca temática com café e fumaça =================
purge(("Caneca", "Cafe", "Vapor"))
MUGX, MUGY = 0.45, 0.04
R, RIN, H, SEG = 0.04, 0.0365, 0.096, 64
bm = bmesh.new()
uv = bm.loops.layers.uv.new("UVMap")
outer_b = [bm.verts.new((R * math.cos(2 * math.pi * i / SEG), R * math.sin(2 * math.pi * i / SEG), 0)) for i in range(SEG)]
outer_t = [bm.verts.new((R * math.cos(2 * math.pi * i / SEG), R * math.sin(2 * math.pi * i / SEG), H)) for i in range(SEG)]
inner_t = [bm.verts.new((RIN * math.cos(2 * math.pi * i / SEG), RIN * math.sin(2 * math.pi * i / SEG), H)) for i in range(SEG)]
inner_b = [bm.verts.new((RIN * math.cos(2 * math.pi * i / SEG), RIN * math.sin(2 * math.pi * i / SEG), 0.007)) for i in range(SEG)]
label = uv_rect(LABEL)
white = uv_rect((LABEL[0] + 2, LABEL[1] + 2, 6, 6))
for i in range(SEG):
    j = (i + 1) % SEG
    side = bm.faces.new((outer_b[i], outer_b[j], outer_t[j], outer_t[i]))
    u_a, u_b = i / SEG, (i + 1) / SEG
    for l, (a, b) in zip(side.loops, ((u_a, 0), (u_b, 0), (u_b, 1), (u_a, 1))):
        l[uv].uv = (label[0] + a * (label[2] - label[0]), label[1] + b * (label[3] - label[1]))
    for quad in ((outer_t[i], outer_t[j], inner_t[j], inner_t[i]), (inner_t[i], inner_t[j], inner_b[j], inner_b[i])):
        f = bm.faces.new(quad)
        for l in f.loops:
            l[uv].uv = (white[0], white[1])
bot = bm.faces.new(list(reversed(outer_b)))
inb = bm.faces.new(inner_b)
for f in (bot, inb):
    for l in f.loops:
        l[uv].uv = (white[0], white[1])
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
me = bpy.data.meshes.new("Caneca")
bm.to_mesh(me)
bm.free()
MUG_MAT = bpy.data.materials.get("Caneca_Rotulo") or bpy.data.materials.new("Caneca_Rotulo")
MUG_MAT.use_nodes = True
mb = MUG_MAT.node_tree.nodes["Principled BSDF"]
mb.inputs["Roughness"].default_value = 0.22
mt = MUG_MAT.node_tree.nodes.get("Atlas") or MUG_MAT.node_tree.nodes.new("ShaderNodeTexImage")
mt.name = "Atlas"
mt.image = img
MUG_MAT.node_tree.links.new(mt.outputs["Color"], mb.inputs["Base Color"])
me.materials.append(MUG_MAT)
mug = bpy.data.objects.new("Caneca", me)
coll("Props").objects.link(mug)
mug.location = (MUGX, MUGY, DESK)
shade_smooth(mug, 50)
bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0065, major_segments=32, minor_segments=12,
                                 location=(MUGX + R + 0.012, MUGY, DESK + 0.05), rotation=(math.radians(90), 0, 0))
handle = bpy.context.active_object
handle.name = "Caneca_Alca"
handle.data.materials.append(mat("Caneca_Branca", (0.95, 0.94, 0.9), rough=0.22))
shade_smooth(handle, 60)
link(handle, "Props")
cyl("Cafe", RIN - 0.0005, 0.002, (MUGX, MUGY, DESK + H - 0.013), "Props", mat("Cafe", (0.06, 0.03, 0.015), rough=0.12), verts=64)

# fumaça: fitas onduladas semitransparentes (no site são animadas por shader)
VAPOR = bpy.data.materials.get("Vapor") or bpy.data.materials.new("Vapor")
VAPOR.use_nodes = True
vt = VAPOR.node_tree
vt.nodes.clear()
out = vt.nodes.new("ShaderNodeOutputMaterial")
pb = vt.nodes.new("ShaderNodeBsdfPrincipled")
pb.inputs["Base Color"].default_value = (1, 1, 1, 1)
pb.inputs["Emission Color"].default_value = (1, 0.95, 0.9, 1)
pb.inputs["Emission Strength"].default_value = 0.15
uvn = vt.nodes.new("ShaderNodeTexCoord")
sep = vt.nodes.new("ShaderNodeSeparateXYZ")
vt.links.new(uvn.outputs["UV"], sep.inputs[0])
sinv = vt.nodes.new("ShaderNodeMath"); sinv.operation = "MULTIPLY"; sinv.inputs[1].default_value = math.pi
vt.links.new(sep.outputs["Y"], sinv.inputs[0])
sn = vt.nodes.new("ShaderNodeMath"); sn.operation = "SINE"
vt.links.new(sinv.outputs[0], sn.inputs[0])
across = vt.nodes.new("ShaderNodeMath"); across.operation = "MULTIPLY"; across.inputs[1].default_value = math.pi
vt.links.new(sep.outputs["X"], across.inputs[0])
sx_ = vt.nodes.new("ShaderNodeMath"); sx_.operation = "SINE"
vt.links.new(across.outputs[0], sx_.inputs[0])
noise = vt.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 6
vt.links.new(uvn.outputs["UV"], noise.inputs["Vector"])
m1 = vt.nodes.new("ShaderNodeMath"); m1.operation = "MULTIPLY"
vt.links.new(sn.outputs[0], m1.inputs[0]); vt.links.new(sx_.outputs[0], m1.inputs[1])
m2 = vt.nodes.new("ShaderNodeMath"); m2.operation = "MULTIPLY"
vt.links.new(m1.outputs[0], m2.inputs[0]); vt.links.new(noise.outputs["Fac"], m2.inputs[1])
m3 = vt.nodes.new("ShaderNodeMath"); m3.operation = "MULTIPLY"; m3.inputs[1].default_value = 0.55
vt.links.new(m2.outputs[0], m3.inputs[0])
vt.links.new(m3.outputs[0], pb.inputs["Alpha"])
vt.links.new(pb.outputs[0], out.inputs[0])
try:
    VAPOR.surface_render_method = "BLENDED"
except Exception:
    VAPOR.blend_method = "BLEND"

for k in range(3):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=2, y_subdivisions=24, size=1)
    v = bpy.context.active_object
    v.name = f"Vapor_{k}"
    ph = k * 2.1
    for vert in v.data.vertices:
        t = vert.co.y + 0.5  # 0..1 ao longo da altura
        w = 0.016 * (0.6 + t)
        vert.co = Vector((vert.co.x * w + 0.008 * math.sin(t * 7 + ph), 0.006 * math.cos(t * 5 + ph), t * 0.13))
    v.location = (MUGX + (k - 1) * 0.009, MUGY + (k - 1) * 0.004, DESK + H - 0.01)
    v.rotation_euler = (0, 0, math.radians(-20 + k * 25))
    v.data.materials.append(VAPOR)
    v.visible_shadow = False
    shade_smooth(v, 80)
    link(v, "Props")

bpy.ops.wm.save_mainfile()
result = {"keys": len(keys), "books": len(cells), "atlas": ROOT + r"\atlas_livros.png"}
