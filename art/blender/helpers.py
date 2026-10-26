# Helpers compartilhados pelos scripts de modelagem (executados via MCP).
import bpy
import bmesh
import math
from mathutils import Vector

ROOT = r"C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d"


def coll(name):
    c = bpy.data.collections.get(name)
    if not c:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def link(obj, collection):
    for c in obj.users_collection:
        c.objects.unlink(obj)
    coll(collection).objects.link(obj)
    return obj


def remove(name):
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)


def mat(name, color=(0.8, 0.8, 0.8), rough=0.5, metal=0.0, emission=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emission:
        b.inputs["Emission Color"].default_value = (*emission, 1)
        b.inputs["Emission Strength"].default_value = strength
    return m


def box(name, size, loc, collection, material=None, bevel=0.0, segments=2, rot=(0, 0, 0)):
    remove(name)
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.data.name = name
    o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = o.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
    if material:
        o.data.materials.append(material)
    link(o, collection)
    return o


def cyl(name, r, depth, loc, collection, material=None, verts=32, rot=(0, 0, 0)):
    remove(name)
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.active_object
    o.name = name
    o.data.name = name
    if material:
        o.data.materials.append(material)
    link(o, collection)
    return o


def shade_smooth(o, angle=35):
    o.data.shade_smooth()
    try:
        bpy.context.view_layer.objects.active = o
        bpy.ops.object.shade_auto_smooth(angle=math.radians(angle))
    except Exception:
        pass


def apply_mods(o):
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def curve_tube(name, points, radius, collection, material=None, res=8):
    remove(name)
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.resolution_u = res
    sp = cu.splines.new("BEZIER")
    sp.bezier_points.add(len(points) - 1)
    for bp, p in zip(sp.bezier_points, points):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = "AUTO"
    o = bpy.data.objects.new(name, cu)
    if material:
        cu.materials.append(material)
    coll(collection).objects.link(o)
    return o
