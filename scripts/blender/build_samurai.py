"""Models the armoured samurai and his katana from scratch and exports them as one GLB.

Everything is built here from plain numbers — no imported meshes, no asset libraries.
Run:  pip install bpy && python3 scripts/blender/build_samurai.py
Out:  public/assets/models/samurai.glb   (node "SwordArm" is the pivot for the cut)
"""
import math, os
import bpy
from mathutils import Vector, Euler

OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'assets', 'models', 'samurai.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def material(name, color, metallic=0.0, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = strength
    return m


LACQUER = material('Lacquer', (0.012, 0.010, 0.012), 0.55, 0.32)
BLOOD = material('BloodLacquer', (0.16, 0.012, 0.02), 0.4, 0.38)
LACE = material('Lacing', (0.33, 0.012, 0.025), 0.0, 0.8, (0.5, 0.01, 0.03), 0.06)
CLOTH = material('Cloth', (0.02, 0.016, 0.018), 0.0, 0.92)
SASH = material('Sash', (0.3, 0.015, 0.03), 0.0, 0.85)
GOLD = material('Gold', (0.83, 0.56, 0.2), 1.0, 0.3)
STEEL = material('Steel', (0.86, 0.87, 0.9), 1.0, 0.14)
EYE = material('Eye', (1, 0.3, 0.25), 0.0, 0.4, (1, 0.16, 0.12), 14.0)
MASK = material('Mask', (0.03, 0.008, 0.01), 0.5, 0.3)

parts, arm_parts = [], []


def finish(obj, mat, bevel=0.004, smooth=True, group=None):
    obj.data.materials.clear(); obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new('bevel', 'BEVEL'); mod.width = bevel; mod.segments = 2; mod.limit_method = 'ANGLE'
    if smooth:
        for p in obj.data.polygons: p.use_smooth = True
    (parts if group is None else group).append(obj)
    return obj


def mesh_obj(name, verts, faces):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
    return ob


def solid(obj, t):
    m = obj.modifiers.new('solid', 'SOLIDIFY'); m.thickness = t; m.offset = -1
    return obj


def band(name, z0, z1, r0, r1, a0, a1, mat, squash=0.78, segs=14, t=0.012, centre=(0, 0), group=None, bevel=0.003):
    """A conical strip around the body: radius r0 at height z0 to r1 at z1, from angle a0 to a1 (0 = front)."""
    verts, faces = [], []
    for i in range(segs + 1):
        a = math.radians(a0 + (a1 - a0) * i / segs)
        for z, r in ((z0, r0), (z1, r1)):
            verts.append((centre[0] + math.sin(a) * r, centre[1] - math.cos(a) * r * squash, z))
    for i in range(segs):
        faces.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
    return finish(solid(mesh_obj(name, verts, faces), t), mat, bevel, group=group)


def limb(name, p1, p2, r1, r2, mat, verts=16, group=None, squash=1.0):
    p1, p2 = Vector(p1), Vector(p2)
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=(p2 - p1).length, location=(p1 + p2) / 2)
    ob = bpy.context.object; ob.name = name
    ob.rotation_euler = (p2 - p1).to_track_quat('Z', 'Y').to_euler()
    ob.scale.y = squash
    return finish(ob, mat, 0.004, group=group)


def box(name, size, loc, mat, rot=(0, 0, 0), bevel=0.006, group=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.object; ob.name = name; ob.scale = size
    return finish(ob, mat, bevel, smooth=False, group=group)


def ball(name, radius, loc, scale, mat, group=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=16, radius=radius, location=loc)
    ob = bpy.context.object; ob.name = name; ob.scale = scale
    return finish(ob, mat, 0, group=group)


def lames(name, n, z_top, drop, r_top, flare, a0, a1, centre=(0, 0), squash=0.78, group=None, mat=LACQUER):
    """A hanging run of overlapping armour plates with red lacing showing between them."""
    for i in range(n):
        z = z_top - i * drop
        r = r_top + i * flare
        band(f'{name}{i}', z, z - drop * 1.18, r, r + flare * 1.25, a0, a1, mat, squash, centre=centre, group=group)
        band(f'{name}lace{i}', z - drop * 0.06, z - drop * 0.3, r + 0.0125, r + 0.0125 + flare * 0.3, a0 + 2, a1 - 2, LACE, squash, t=0.002, centre=centre, group=group, bevel=0)


# ---------------------------------------------------------------- body
limb('torso', (0, 0, 1.04), (0, 0, 1.5), 0.17, 0.215, CLOTH, squash=0.72)
limb('neck', (0, 0, 1.5), (0, 0, 1.6), 0.062, 0.055, CLOTH)
ball('head', 0.1, (0, 0, 1.675), (0.92, 1, 1.08), CLOTH)
for s in (-1, 1):
    limb(f'thigh{s}', (0.1 * s, 0, 1.02), (0.17 * s, -0.02, 0.52), 0.125, 0.09, CLOTH)
    limb(f'shin{s}', (0.17 * s, -0.02, 0.52), (0.2 * s, 0.0, 0.07), 0.07, 0.05, CLOTH)
    limb(f'foot{s}', (0.2 * s, 0.06, 0.04), (0.2 * s, -0.2, 0.03), 0.06, 0.04, LACQUER, squash=0.6)
    # shin guards, knee caps, thigh guards
    limb(f'suneate{s}', (0.172 * s, -0.022, 0.5), (0.2 * s, -0.004, 0.1), 0.083, 0.062, LACQUER)
    for k in range(4):
        limb(f'shinband{s}{k}', (0.176 * s, -0.02, 0.44 - k * 0.09), (0.18 * s, -0.018, 0.425 - k * 0.09), 0.086 - k * 0.005, 0.085 - k * 0.005, GOLD)
    ball(f'knee{s}', 0.07, (0.17 * s, -0.07, 0.53), (1, 0.6, 1.15), BLOOD)
    lames(f'haidate{s}', 4, 0.96, 0.095, 0.11, 0.004, -70, 70, centre=(0.135 * s, -0.012), squash=0.95)

# sash and cuirass
band('obi', 1.1, 1.02, 0.2, 0.2, -180, 180, SASH, 0.74, segs=40, t=0.02)
for i in range(5):
    z = 1.11 + i * 0.075
    r = 0.205 + 0.012 * i
    band(f'do{i}', z + 0.086, z, r + 0.008, r, -180, 180, LACQUER, 0.74, segs=40)
    band(f'dolace{i}', z + 0.02, z + 0.004, r + 0.0135, r + 0.0135, -180, 180, LACE, 0.74, segs=40, t=0.002, bevel=0)
box('chestplate', (0.26, 0.03, 0.1), (0, -0.168, 1.47), BLOOD, rot=(math.radians(-8), 0, 0), bevel=0.012)
for s in (-1, 1):
    box(f'strap{s}', (0.05, 0.3, 0.03), (0.12 * s, -0.01, 1.535), LACQUER, bevel=0.012)

# tassets round the waist
for k, ang in enumerate((-150, -100, -50, 0, 50, 100, 150)):
    lames(f'kusazuri{k}', 5, 1.04, 0.074, 0.212, 0.013, ang - 21, ang + 21, squash=0.76)

# left arm, hand resting at the scabbard
limb('armL1', (0.255, 0, 1.47), (0.335, -0.02, 1.2), 0.062, 0.05, CLOTH)
limb('armL2', (0.335, -0.02, 1.2), (0.25, -0.15, 1.02), 0.05, 0.04, CLOTH)
limb('koteL', (0.33, -0.03, 1.17), (0.262, -0.135, 1.045), 0.06, 0.05, LACQUER)
ball('handL', 0.045, (0.24, -0.165, 1.0), (1, 1, 0.8), CLOTH)

# shoulder guards
for s in (-1, 1):
    lames(f'sode{s}', 6, 1.535, 0.062, 0.115, 0.006, 90 * s - 82, 90 * s + 82, centre=(0.215 * s, 0.0), squash=1.0,
          group=parts if s == 1 else None)

# ---------------------------------------------------------------- helmet
ball('bowl', 0.128, (0, 0.004, 1.7), (1, 1.06, 0.93), LACQUER)
for k in range(8):                                         # ridges over the bowl
    a = math.radians(k * 45)
    pts = [(math.sin(a) * 0.131 * math.sin(t), 0.004 - math.cos(a) * 0.139 * math.sin(t), 1.7 + 0.121 * math.cos(t)) for t in [0.12 + j * 0.25 for j in range(6)]]
    for j in range(5):
        limb(f'ridge{k}{j}', pts[j], pts[j + 1], 0.004, 0.004, GOLD, verts=6)
limb('tehen', (0, 0.004, 1.815), (0, 0.004, 1.84), 0.02, 0.012, GOLD)
band('brim', 1.715, 1.675, 0.13, 0.185, -62, 62, LACQUER, 0.95, t=0.008)
lames('shikoro', 4, 1.69, 0.047, 0.14, 0.021, 58, 302, squash=1.0)
for s in (-1, 1):
    box(f'fuki{s}', (0.012, 0.075, 0.085), (0.168 * s, -0.115, 1.655), BLOOD, rot=(0, 0, math.radians(-38 * s)), bevel=0.006)

# crest: two long horns and a centre blade
def horn(sign):
    left, right = [], []
    for i in range(25):
        t = i / 24
        x = sign * (0.022 + 0.2 * t ** 0.85); z = 1.79 + 0.34 * t ** 1.25
        w = 0.03 * (1 - t) ** 0.8 + 0.002
        left.append((x - w * 0.9, -0.136 - 0.02 * t, z + w * 0.5)); right.append((x + w * 0.9, -0.136 - 0.02 * t, z - w * 0.5))
    verts = left + right
    faces = [(i, i + 1, 25 + i + 1, 25 + i) for i in range(24)]
    finish(solid(mesh_obj(f'horn{sign}', verts, faces), 0.007), GOLD, 0.002)
horn(-1); horn(1)
finish(solid(mesh_obj('crest', [(-0.02, -0.14, 1.79), (0.02, -0.14, 1.79), (0.012, -0.15, 1.9), (0, -0.155, 1.97), (-0.012, -0.15, 1.9)], [(0, 1, 2, 3, 4)]), 0.006), BLOOD, 0.002)

# face guard, nose, throat plates, eyes
ball('menpo', 0.1, (0, -0.038, 1.628), (0.93, 0.95, 0.72), MASK)
limb('nose', (0, -0.118, 1.665), (0, -0.142, 1.63), 0.012, 0.022, MASK, verts=8)
box('teeth', (0.07, 0.01, 0.012), (0, -0.128, 1.598), GOLD, bevel=0.003)
lames('throat', 2, 1.575, 0.04, 0.085, 0.012, -60, 60, squash=1.0)
for s in (-1, 1):
    box(f'eye{s}', (0.042, 0.02, 0.008), (0.043 * s, -0.112, 1.684), EYE, rot=(0, math.radians(-13 * s), 0), bevel=0)

# empty scabbard at the left hip
limb('saya', (0.19, -0.2, 1.03), (0.42, 0.42, 0.82), 0.019, 0.015, LACQUER, squash=0.6)
limb('sayatip', (0.42, 0.42, 0.82), (0.428, 0.44, 0.813), 0.016, 0.012, GOLD, squash=0.6)
limb('sayaband', (0.215, -0.13, 1.007), (0.228, -0.095, 0.995), 0.022, 0.022, GOLD, squash=0.6)

# ---------------------------------------------------------------- sword arm (local space, shoulder at origin, pointing up)
A = arm_parts
limb('armR1', (0, 0, 0), (0, -0.03, 0.3), 0.064, 0.05, CLOTH, group=A)
limb('armR2', (0, -0.03, 0.3), (0, -0.1, 0.53), 0.05, 0.04, CLOTH, group=A)
limb('koteR', (0, -0.04, 0.32), (0, -0.092, 0.5), 0.06, 0.05, LACQUER, group=A)
for k in range(3):
    limb(f'koteband{k}', (0, -0.05 - k * 0.018, 0.35 + k * 0.06), (0, -0.054 - k * 0.018, 0.365 + k * 0.06), 0.062 - k * 0.003, 0.061 - k * 0.003, GOLD, group=A)
ball('handR', 0.046, (0, -0.105, 0.565), (1, 1, 1.1), CLOTH, group=A)

GX, GY = 0.0, -0.105                                       # grip line
limb('tsuka', (GX, GY, 0.47), (GX, GY, 0.73), 0.017, 0.016, SASH, verts=10, group=A, squash=0.72)
for k in range(9):                                         # handle wrap
    limb(f'wrap{k}', (GX, GY, 0.485 + k * 0.027), (GX, GY, 0.495 + k * 0.027), 0.0185, 0.0185, LACQUER, verts=10, group=A, squash=0.72)
limb('kashira', (GX, GY, 0.455), (GX, GY, 0.472), 0.016, 0.019, GOLD, verts=10, group=A, squash=0.72)
limb('tsuba', (GX, GY, 0.732), (GX, GY, 0.741), 0.05, 0.05, GOLD, verts=24, group=A, squash=0.82)
limb('habaki', (GX, GY, 0.741), (GX, GY, 0.77), 0.017, 0.015, GOLD, verts=8, group=A, squash=0.4)

# blade: a ridged cross-section swept along a gentle curve, edge leading (+X)
def blade():
    rings, n, z0, length = [], 40, 0.745, 0.82
    for i in range(n + 1):
        s = i / n
        z = z0 + length * s
        back = -0.075 * s * s                               # the curve of the blade
        k = 1.0 if s < 0.93 else max((1 - s) / 0.07, 0.02)  # the point
        w = 0.0165 * (1 - 0.25 * s)
        edge = back + w * (2 * k - 1) if s >= 0.93 else back + w
        rings.append([(edge + GX, GY, z), (back + w * 0.25 * k + GX, GY - 0.0036 * k, z), (back - w + GX, GY - 0.003 * k, z),
                      (back - w + GX, GY + 0.003 * k, z), (back + w * 0.25 * k + GX, GY + 0.0036 * k, z)])
    verts = [v for r in rings for v in r]
    faces = [(i * 5 + j, i * 5 + (j + 1) % 5, (i + 1) * 5 + (j + 1) % 5, (i + 1) * 5 + j) for i in range(n) for j in range(5)]
    faces += [tuple(range(4, -1, -1)), tuple(range(n * 5, n * 5 + 5))]
    ob = mesh_obj('blade', verts, faces)
    ob.data.materials.append(STEEL)
    for p in ob.data.polygons: p.use_smooth = False
    A.append(ob)
blade()


# ---------------------------------------------------------------- assemble + export
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target='MESH')                  # bake bevels / thickness
    bpy.ops.object.join()
    ob = bpy.context.object; ob.name = name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return ob

body = join(parts, 'Body')
arm_mesh = join(arm_parts, 'ArmMesh')
root = bpy.data.objects.new('Samurai', None); scene.collection.objects.link(root)
pivot = bpy.data.objects.new('SwordArm', None); scene.collection.objects.link(pivot)
pivot.location = (-0.255, 0.0, 1.47)
body.parent = root; pivot.parent = root; arm_mesh.parent = pivot

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.abspath(OUT), export_format='GLB', export_apply=True, export_yup=True,
                          export_materials='EXPORT', export_normals=True, export_texcoords=False)
tris = sum(len(p.vertices) - 2 for o in (body, arm_mesh) for p in o.data.polygons)
print('triangles:', tris, '| size KB:', os.path.getsize(os.path.abspath(OUT)) // 1024)
