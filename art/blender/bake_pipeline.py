# Pipeline de bake: une os objetos estáticos em 3 grupos, assa a iluminação,
# remove o ruído (OIDN) e exporta o .glb. Cada etapa roda numa chamada separada.
import bpy, math, os, time

ROOT = r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d"
GROUPS = ("Fundo", "Computador", "Objetos")
EXPORT = ["Bake_Fundo", "Bake_Computador", "Bake_Objetos", "Screen", "PowerLED", "Vapor_0", "Vapor_1", "Vapor_2", "CamStart", "CamEnd"]


def scene():
    return bpy.data.scenes["Scene"]


def prepare():
    sc = scene()
    if bpy.context.object and bpy.context.object.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.data.objects.remove(bpy.data.objects["Piso"], do_unlink=True)
    wall = bpy.data.objects["Parede"]
    wall.dimensions = (2.6, wall.dimensions.y, 1.5)
    wall.location.z = 1.30

    def group_of(o):
        if o.type not in {"MESH", "CURVE"} or o.name in {"Screen", "PowerLED"} or o.name.startswith("Vapor"):
            return None
        cols = {c.name for c in o.users_collection}
        if o.name.startswith(("Prateleira", "Livro")):
            return "Objetos"
        if cols & {"Room", "Desk"}:
            return "Fundo"
        if "Computer" in cols:
            return "Computador"
        if "Props" in cols:
            return "Objetos"
        return None

    groups = {}
    for o in list(sc.objects):
        g = group_of(o)
        if g:
            groups.setdefault(g, []).append(o)
    for g, objs in groups.items():
        bpy.ops.object.select_all(action="DESELECT")
        for o in objs:
            o.hide_set(False)
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.make_single_user(object=True, obdata=True, material=False)
        bpy.ops.object.convert(target="MESH")
        objs = list(bpy.context.selected_objects)
        for o in objs:
            if "UVMap" not in o.data.uv_layers:
                if len(o.data.uv_layers):
                    o.data.uv_layers[0].name = "UVMap"
                else:
                    o.data.uv_layers.new(name="UVMap")
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        j = bpy.context.active_object
        j.name = j.data.name = f"Bake_{g}"
        for slot in j.material_slots:
            if slot.material is None:
                slot.material = bpy.data.materials["Plastico_Bege"]
        bake_uv = j.data.uv_layers.new(name="Bake")
        j.data.uv_layers.active = bake_uv
        j.data.uv_layers["UVMap"].active_render = True
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.002, area_weight=0.0, scale_to_bounds=False)
        bpy.ops.uv.pack_islands(margin=0.003, rotate=True)
        bpy.ops.object.mode_set(mode="OBJECT")
    for mname in ("Atlas_Livros", "Caneca_Rotulo"):
        nt = bpy.data.materials[mname].node_tree
        uvn = nt.nodes.get("UV_Original") or nt.nodes.new("ShaderNodeUVMap")
        uvn.name = "UV_Original"
        uvn.uv_map = "UVMap"
        nt.links.new(uvn.outputs["UV"], nt.nodes["Atlas"].inputs["Vector"])
    bpy.data.objects["Luz_Tela"].data.energy = 0
    sc.render.engine = "CYCLES"
    sc.cycles.device = "GPU"
    b = sc.render.bake
    b.use_pass_direct = b.use_pass_indirect = b.use_pass_diffuse = b.use_pass_emit = True
    b.use_pass_glossy = b.use_pass_transmission = False
    b.margin = 8


def bake(g, samples=1024, size=2048):
    sc = scene()
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.005
    obj = bpy.data.objects[f"Bake_{g}"]
    img = bpy.data.images.get(f"bake_{g}") or bpy.data.images.new(f"bake_{g}", size, size, alpha=False, float_buffer=True)
    for slot in obj.material_slots:
        nt = slot.material.node_tree
        n = nt.nodes.get("BakeTarget") or nt.nodes.new("ShaderNodeTexImage")
        n.name = "BakeTarget"
        n.image = img
        nt.nodes.active = n
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    obj.data.uv_layers.active = obj.data.uv_layers["Bake"]
    t = time.time()
    bpy.ops.object.bake(type="COMBINED", margin=8, use_clear=True)
    img.filepath_raw = ROOT + f"\\bake_{g}.exr"
    img.file_format = "OPEN_EXR"
    img.save()
    return round(time.time() - t, 1)


def denoise(g):
    """OIDN no lightmap via compositor; salva PNG com a curva AgX da cena principal."""
    src = bpy.data.images.load(ROOT + f"\\bake_{g}.exr", check_existing=False)
    w, h = src.size
    den = bpy.data.scenes.get("Denoise") or bpy.data.scenes.new("Denoise")
    den.render.resolution_x, den.render.resolution_y = w, h
    den.render.resolution_percentage = 100
    if not den.camera:
        cam = bpy.data.objects.new("DenoiseCam", bpy.data.cameras.new("DenoiseCam"))
        den.collection.objects.link(cam)
        den.camera = cam
    den.render.engine = "CYCLES"
    den.cycles.samples = 1
    den.view_settings.view_transform = scene().view_settings.view_transform
    den.view_settings.look = scene().view_settings.look
    den.render.use_compositing = True
    ng = bpy.data.node_groups.get("DenoiseTree") or bpy.data.node_groups.new("DenoiseTree", "CompositorNodeTree")
    ng.nodes.clear()
    if not ng.interface.items_tree:
        ng.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
    inp = ng.nodes.new("CompositorNodeImage")
    inp.image = src
    dn = ng.nodes.new("CompositorNodeDenoise")
    out = ng.nodes.new("NodeGroupOutput")
    ng.links.new(inp.outputs["Image"], dn.inputs["Image"])
    ng.links.new(dn.outputs["Image"], out.inputs[0])
    den.compositing_node_group = ng
    den.render.image_settings.file_format = "PNG"
    den.render.image_settings.color_depth = "8"
    den.render.image_settings.color_mode = "RGB"
    den.render.filepath = ROOT + f"\\bake_{g}.png"
    bpy.ops.render.render(write_still=True, scene=den.name)
    bpy.data.images.remove(src)
    return den.render.filepath


def finalize_and_export():
    for g in GROUPS:
        path = ROOT + f"\\bake_{g}.png"
        old = bpy.data.images.get(f"bake_{g}.png")
        if old:
            bpy.data.images.remove(old)
        png = bpy.data.images.load(path)
        png.name = f"bake_{g}.png"
        m = bpy.data.materials.get(f"Baked_{g}") or bpy.data.materials.new(f"Baked_{g}")
        m.use_nodes = True
        nt = m.node_tree
        bsdf = nt.nodes["Principled BSDF"]
        bsdf.inputs["Roughness"].default_value = 1.0
        tex = nt.nodes.get("Img") or nt.nodes.new("ShaderNodeTexImage")
        tex.name = "Img"
        tex.image = png
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        me = bpy.data.objects[f"Bake_{g}"].data
        me.materials.clear()
        me.materials.append(m)
        for p in me.polygons:
            p.material_index = 0
        if "UVMap" in me.uv_layers:
            me.uv_layers.remove(me.uv_layers["UVMap"])
        me.uv_layers["Bake"].name = "UVMap"
    den = bpy.data.scenes.get("Denoise")
    if den:
        bpy.data.scenes.remove(den)
    bpy.ops.object.select_all(action="DESELECT")
    for n in EXPORT:
        o = bpy.data.objects[n]
        o.hide_set(False)
        o.select_set(True)
    bpy.context.view_layer.objects.active = bpy.data.objects["Bake_Fundo"]
    bpy.ops.wm.save_mainfile()
    bpy.ops.export_scene.gltf(filepath=ROOT + r"\desk-raw.glb", export_format="GLB", use_selection=True,
                              export_cameras=True, export_lights=False, export_apply=True, export_yup=True,
                              export_image_format="AUTO")
    return round(os.path.getsize(ROOT + r"\desk-raw.glb") / 1048576, 2)
