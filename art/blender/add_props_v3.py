# Ajustes v3: calendário de papel na parede (à direita do monitor) e troféu "Projeto do Ano" na mesa (à esquerda).
# Uso: blender -b desk.blend --python add_props_v3.py   (salva o desk.blend)
import bpy
import bmesh
import math

ROOT = r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d"
exec(open(ROOT + r"\helpers.py", encoding="utf8").read())

DESK = 0.75
WALL_Y = 0.425  # face da parede voltada para a câmera


def textured(name, image_file, rough=0.6):
    """Material com imagem no nó "Atlas" (o bake_pipeline religa esse nó ao UV original)."""
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Roughness"].default_value = rough
    img = bpy.data.images.get(image_file) or bpy.data.images.load(ROOT + "\\" + image_file)
    img.reload()
    t = m.node_tree.nodes.get("Atlas") or m.node_tree.nodes.new("ShaderNodeTexImage")
    t.name = "Atlas"
    t.image = img
    m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    return m


def plane(name, w, h, loc, material, collection="Props"):
    """Plano vertical virado para a câmera (-Y), com UV 0..1 (topo da imagem para cima)."""
    remove(name)
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=(math.radians(90), 0, 0))
    o = bpy.context.active_object
    o.name = o.data.name = name
    o.scale = (w, h, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    return link(o, collection)


def purge(prefixes):
    for o in list(bpy.data.objects):
        if o.name.startswith(prefixes):
            bpy.data.objects.remove(o, do_unlink=True)


purge(("Calendario", "Trofeu"))

# ================= calendário de papel na parede =================
CX, CW, CH = 0.37, 0.14, 0.197  # proporção da textura 512x720; visível também na pose final da câmera
CTOP = 1.012  # abaixo do suporte da prateleira (z 1.04)
CZ = CTOP - CH / 2
PAPER = mat("Calendario_Papel", (0.86, 0.83, 0.75), rough=0.8)
DARK = mat("Calendario_Espiral", (0.08, 0.08, 0.09), rough=0.35)
plane("Calendario_Folha", CW, CH, (CX, WALL_Y - 0.0035, CZ), textured("Calendario_Folha", "calendario.png", rough=0.75))
# folhas de baixo, um pouco maiores e mais claras nas bordas
box("Calendario_Bloco", (CW + 0.002, 0.003, CH + 0.003), (CX, WALL_Y - 0.0016, CZ - 0.0015), "Props", PAPER)
box("Calendario_Topo", (CW + 0.004, 0.006, 0.014), (CX, WALL_Y - 0.003, CTOP + 0.004), "Props", mat("Calendario_Capa", (0.55, 0.06, 0.06), rough=0.5), bevel=0.001)
for i in range(9):
    x = CX - CW / 2 + 0.012 + i * (CW - 0.024) / 8
    remove(f"Calendario_Argola_{i}")
    bpy.ops.mesh.primitive_torus_add(major_radius=0.0045, minor_radius=0.0009, major_segments=16, minor_segments=6,
                                     location=(x, WALL_Y - 0.006, CTOP), rotation=(0, math.radians(90), 0))
    r = bpy.context.active_object
    r.name = f"Calendario_Argola_{i}"
    r.data.materials.append(DARK)
    link(r, "Props")
cyl("Calendario_Prego", 0.0022, 0.012, (CX, WALL_Y - 0.006, CTOP + 0.02), "Props", mat("Calendario_Prego", (0.5, 0.5, 0.52), rough=0.4),
    verts=12, rot=(math.radians(90), 0, 0))

# ================= troféu "Projeto do Ano" na mesa =================
TX, TY = -0.37, 0.22
GOLD = mat("Trofeu_Ouro", (0.83, 0.58, 0.18), rough=0.35)  # sem metal: o bake só guarda luz difusa
WOOD = mat("Trofeu_Base", (0.04, 0.035, 0.03), rough=0.45)
box("Trofeu_Base", (0.075, 0.075, 0.03), (TX, TY, DESK + 0.015), "Props", WOOD, bevel=0.002)
box("Trofeu_Base2", (0.05, 0.05, 0.012), (TX, TY, DESK + 0.036), "Props", WOOD, bevel=0.0015)
plane("Trofeu_Placa", 0.06, 0.0188, (TX, TY - 0.0376, DESK + 0.015), textured("Trofeu_Placa", "placa_trofeu.png", rough=0.4))
cyl("Trofeu_Haste", 0.006, 0.03, (TX, TY, DESK + 0.057), "Props", GOLD, verts=24)
remove("Trofeu_No")
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.011, location=(TX, TY, DESK + 0.074), segments=24, ring_count=12)
knot = bpy.context.active_object
knot.name = knot.data.name = "Trofeu_No"
knot.scale = (1, 1, 0.6)
knot.data.materials.append(GOLD)
link(knot, "Props")

# taça: perfil girado (lathe) com espessura
profile = [(0.004, 0.0), (0.016, 0.006), (0.026, 0.02), (0.032, 0.04), (0.035, 0.062)]
bm = bmesh.new()
rings = []
SEG = 40
for r, z in profile:
    rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / SEG), r * math.sin(2 * math.pi * k / SEG), z)) for k in range(SEG)])
for a, b in zip(rings, rings[1:]):
    for k in range(SEG):
        bm.faces.new((a[k], a[(k + 1) % SEG], b[(k + 1) % SEG], b[k]))
bm.faces.new(list(reversed(rings[0])))
me = bpy.data.meshes.new("Trofeu_Taca")
bm.to_mesh(me)
bm.free()
cup = bpy.data.objects.new("Trofeu_Taca", me)
coll("Props").objects.link(cup)
cup.location = (TX, TY, DESK + 0.08)
cup.data.materials.append(GOLD)
sol = cup.modifiers.new("Espessura", "SOLIDIFY")
sol.thickness = 0.002
shade_smooth(cup, 60)
for side in (-1, 1):
    n = f"Trofeu_Alca_{'E' if side < 0 else 'D'}"
    remove(n)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.013, minor_radius=0.0026, major_segments=24, minor_segments=8,
                                     location=(TX + side * 0.034, TY, DESK + 0.118), rotation=(math.radians(90), 0, 0))
    h = bpy.context.active_object
    h.name = h.data.name = n
    h.scale = (0.8, 1.2, 1)
    h.data.materials.append(GOLD)
    link(h, "Props")
for o in bpy.data.objects:
    if o.name.startswith("Trofeu_") and o.type == "MESH" and o.name not in ("Trofeu_Base", "Trofeu_Base2", "Trofeu_Placa"):
        shade_smooth(o, 60)

bpy.ops.wm.save_mainfile()
print("RESULT", sorted(o.name for o in bpy.data.objects if o.name.startswith(("Calendario", "Trofeu"))))
