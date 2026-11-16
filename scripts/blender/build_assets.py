"""Models every 3D asset on the site from scratch and exports them as GLB files.

  samurai.glb     armoured samurai + katana ("SwordArm" is the pivot for the strike)
  torii_gate.glb  timber gate on stone footings with two stone lanterns ("LanternL/R" mark the lights)
  sakura_tree.glb two gnarled cherry trees ("TreeA_trunk/_blossom", "TreeB_trunk/_blossom")

Nothing is imported: geometry comes from the numbers below, textures from textures.py.
Run:  pip install bpy numpy pillow && python3 scripts/blender/build_assets.py
"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector

sys.path.insert(0, os.path.dirname(__file__))
import textures

TEX = textures.build()
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'models'))
os.makedirs(OUT, exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def pbr(name, albedo=None, rough=None, normal=None, color=(1, 1, 1), metallic=0.0, roughness=0.5, coat=0.0, nstrength=0.6,
        emit=None, strength=0.0, alpha=False, aniso=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = metallic
    b.inputs['Roughness'].default_value = roughness
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.12
    if aniso:
        b.inputs['Anisotropic'].default_value = aniso

    def tex(key, colour):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(TEX[key])
        if not colour: n.image.colorspace_settings.name = 'Non-Color'
        return n
    if albedo:
        a = tex(albedo, True); nt.links.new(a.outputs['Color'], b.inputs['Base Color'])
        if alpha:
            nt.links.new(a.outputs['Alpha'], b.inputs['Alpha']); m.blend_method = 'CLIP'; m.alpha_threshold = 0.5
    if rough:
        nt.links.new(tex(rough, False).outputs['Color'], b.inputs['Roughness'])
    if normal:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = nstrength
        nt.links.new(tex(normal, False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    m.use_backface_culling = not alpha
    return m


class Kit:
    """Small modelling helpers bound to one scene."""
    def __init__(self, scene):
        self.scene, self.parts = scene, []

    def finish(self, ob, mat, bevel=0.004, smooth=True, group=None):
        ob.data.materials.clear(); ob.data.materials.append(mat)
        if bevel:
            mod = ob.modifiers.new('bevel', 'BEVEL'); mod.width = bevel; mod.segments = 2; mod.limit_method = 'ANGLE'
        for p in ob.data.polygons: p.use_smooth = smooth
        (self.parts if group is None else group).append(ob)
        return ob

    def mesh(self, name, verts, faces, uvs=None):
        me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update()
        layer = me.uv_layers.new(name='UVMap')
        for loop in me.loops:
            v = me.vertices[loop.vertex_index].co
            layer.data[loop.index].uv = uvs[loop.vertex_index] if uvs else (v.x * 3 + v.y * 3, v.z * 3)
        ob = bpy.data.objects.new(name, me); self.scene.collection.objects.link(ob)
        return ob

    def solid(self, ob, t):
        m = ob.modifiers.new('solid', 'SOLIDIFY'); m.thickness = t; m.offset = -1
        return ob

    def band(self, name, z0, z1, r0, r1, a0, a1, mat, squash=0.78, segs=14, t=0.012, centre=(0, 0), group=None, bevel=0.003, tile=1.9):
        verts, faces, uvs = [], [], []
        arc = math.radians(abs(a1 - a0)) * (r0 + r1) / 2
        for i in range(segs + 1):
            a = math.radians(a0 + (a1 - a0) * i / segs)
            for k, (z, r) in enumerate(((z0, r0), (z1, r1))):
                verts.append((centre[0] + math.sin(a) * r, centre[1] - math.cos(a) * r * squash, z))
                uvs.append((i / segs * arc * tile, k * abs(z0 - z1) * tile + 0.02))
        for i in range(segs):
            faces.append((i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2))
        return self.finish(self.solid(self.mesh(name, verts, faces, uvs), t), mat, bevel, group=group)

    def limb(self, name, p1, p2, r1, r2, mat, verts=16, group=None, squash=1.0, bevel=0.004):
        p1, p2 = Vector(p1), Vector(p2)
        bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r1, radius2=r2, depth=(p2 - p1).length, location=(p1 + p2) / 2)
        ob = bpy.context.object; ob.name = name
        ob.rotation_euler = (p2 - p1).to_track_quat('Z', 'Y').to_euler(); ob.scale.y = squash
        return self.finish(ob, mat, bevel, group=group)

    def box(self, name, size, loc, mat, rot=(0, 0, 0), bevel=0.006, group=None):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
        ob = bpy.context.object; ob.name = name; ob.scale = size
        return self.finish(ob, mat, bevel, smooth=False, group=group)

    def ball(self, name, radius, loc, scale, mat, group=None, seg=28):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, radius=radius, location=loc)
        ob = bpy.context.object; ob.name = name; ob.scale = scale
        return self.finish(ob, mat, 0, group=group)

    def lames(self, name, n, z_top, drop, r_top, flare, a0, a1, mat, centre=(0, 0), squash=0.78, group=None):
        for i in range(n):
            z, r = z_top - i * drop, r_top + i * flare
            self.band(f'{name}{i}', z, z - drop * 1.16, r, r + flare * 1.25, a0, a1, mat, squash, centre=centre, group=group)

    def join(self, objs, name):
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.convert(target='MESH'); bpy.ops.object.join()
        ob = bpy.context.object; ob.name = name
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        return ob


def export(name):
    bpy.ops.object.select_all(action='SELECT')
    path = os.path.join(OUT, name)
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_apply=True, export_yup=True, export_image_format='JPEG',
                              export_jpeg_quality=82, export_draco_mesh_compression_enable=False)   # this Blender build ships without the Draco library
    print(f'{name}: {os.path.getsize(path) // 1024} KB')


# =====================================================================  SAMURAI
def samurai():
    K = Kit(reset())
    ARMOR = pbr('Armour', 'armor_a', 'armor_r', 'armor_n', metallic=0.5, coat=0.35, nstrength=0.28)
    LACQ = pbr('Lacquer', 'lacq_a', 'lacq_r', 'lacq_n', metallic=0.6, coat=0.5, nstrength=0.35)
    REDL = pbr('RedLacquer', 'redl_a', 'lacq_r', 'lacq_n', metallic=0.45, coat=0.5, nstrength=0.35)
    IRON = pbr('Iron', 'iron_a', 'iron_r', 'iron_n', metallic=0.9, nstrength=0.7)
    BRASS = pbr('Brass', 'brass_a', 'brass_r', 'iron_n', metallic=1.0, nstrength=0.5)
    CLOTH = pbr('Cloth', 'cloth_a', None, 'cloth_n', roughness=0.9, nstrength=0.8)
    SILK = pbr('Silk', 'silk_a', None, 'silk_n', roughness=0.7, nstrength=0.9)
    SAME = pbr('RaySkin', 'same_a', None, 'same_n', roughness=0.55, nstrength=1.0)
    STEEL = pbr('Steel', 'steel_a', 'steel_r', 'steel_n', metallic=0.98, nstrength=0.25)
    EYE = pbr('Eye', color=(1, 0.2, 0.15), emit=(1, 0.1, 0.06), strength=6.0)
    A = []                                                      # the sword arm

    # --- under-body: torso, neck, head, wide hakama trousers
    K.limb('torso', (0, 0, 1.06), (0, 0.005, 1.5), 0.16, 0.2, CLOTH, squash=0.72)
    K.limb('neck', (0, 0, 1.5), (0, -0.01, 1.61), 0.06, 0.054, CLOTH)
    K.ball('head', 0.1, (0, -0.01, 1.685), (0.92, 1, 1.08), CLOTH)
    for s in (-1, 1):
        K.limb(f'hakama{s}', (0.105 * s, 0, 1.03), (0.205 * s, 0.01, 0.3), 0.13, 0.2, CLOTH, verts=20, squash=0.85)
        for k in range(7):                                      # pleats
            a = (k - 3) * 0.3
            K.limb(f'pleat{s}{k}', (0.105 * s + math.sin(a) * 0.12, -math.cos(a) * 0.105, 1.0), (0.205 * s + math.sin(a) * 0.196, 0.01 - math.cos(a) * 0.168, 0.31), 0.012, 0.022, CLOTH, verts=6)
        K.limb(f'shin{s}', (0.2 * s, 0.01, 0.46), (0.215 * s, 0.02, 0.08), 0.082, 0.062, CLOTH)
        for k in range(5):                                      # splinted shin guard
            a = (k - 2) * 0.5
            K.box(f'splint{s}{k}', (0.03, 0.012, 0.3), (0.207 * s + math.sin(a) * 0.08, 0.015 - math.cos(a) * 0.08, 0.26), IRON, rot=(0, 0, a), bevel=0.004)
        K.ball(f'knee{s}', 0.066, (0.2 * s, -0.05, 0.46), (1, 0.7, 1.2), LACQ)
        K.limb(f'foot{s}', (0.215 * s, 0.075, 0.045), (0.225 * s, -0.19, 0.03), 0.058, 0.04, CLOTH, squash=0.62)
        K.box(f'sole{s}', (0.11, 0.3, 0.014), (0.22 * s, -0.06, 0.007), LACQ, bevel=0.005)
        K.lames(f'haidate{s}', 4, 1.0, 0.1, 0.125, 0.006, -75, 75, ARMOR, centre=(0.125 * s, -0.01), squash=0.95)

    # --- sash, cuirass, tassets
    K.band('obi', 1.12, 1.02, 0.195, 0.195, -180, 180, SILK, 0.76, segs=36, t=0.022, tile=8)
    K.limb('knot', (-0.06, -0.165, 1.07), (0.06, -0.165, 1.07), 0.03, 0.03, SILK, verts=10)
    for s in (-1, 1):
        K.limb(f'tail{s}', (0.03 * s, -0.17, 1.06), (0.07 * s, -0.19, 0.84), 0.022, 0.014, SILK, verts=8, squash=0.4)
    for i in range(5):
        z, r = 1.115 + i * 0.078, 0.2 + 0.013 * i
        K.band(f'do{i}', z + 0.09, z, r + 0.008, r, -180, 180, ARMOR, 0.75, segs=36)
    K.box('munaita', (0.27, 0.03, 0.1), (0, -0.165, 1.485), REDL, rot=(math.radians(-8), 0, 0), bevel=0.014)
    for s in (-1, 1):
        K.box(f'strap{s}', (0.055, 0.3, 0.03), (0.12 * s, -0.01, 1.545), LACQ, bevel=0.012)
    for k, ang in enumerate((-152, -102, -51, 0, 51, 102, 152)):
        K.lames(f'kusazuri{k}', 5, 1.04, 0.078, 0.208, 0.015, ang - 22, ang + 22, ARMOR, squash=0.78)

    # --- cloak down the back, with folds and a torn hem
    cols, rows, verts, faces, uvs = 22, 26, [], [], []
    for j in range(rows + 1):
        v = j / rows
        for i in range(cols + 1):
            u = i / cols - 0.5
            width = 0.52 + 0.5 * v
            fold = math.sin(u * 19 + v * 2.0) * 0.022 * (0.4 + v) + math.sin(u * 7 - v * 3) * 0.03 * v
            hem = (0.05 * abs(math.sin(i * 1.7)) + 0.03 * math.sin(i * 0.9)) if j == rows else 0
            verts.append((u * width + 0.05 * v * v, 0.13 + 0.16 * v + fold + 0.2 * v * v, 1.54 - 1.02 * v + hem))
            uvs.append((u * 3, v * 5))
    for j in range(rows):
        for i in range(cols):
            a = j * (cols + 1) + i
            faces.append((a, a + 1, a + cols + 2, a + cols + 1))
    cloak = K.finish(K.solid(K.mesh('cloak', verts, faces, uvs), 0.006), pbr('Cloak', 'silk_a', None, 'cloth_n', color=(1, 1, 1), roughness=0.85, nstrength=0.8), 0)
    cloak.data.materials[0].use_backface_culling = False

    # --- left arm, fist closed on the mouth of the scabbard
    K.limb('armL1', (0.25, 0, 1.47), (0.33, -0.03, 1.21), 0.064, 0.052, CLOTH)
    K.limb('armL2', (0.33, -0.03, 1.21), (0.245, -0.16, 1.035), 0.052, 0.04, CLOTH)
    K.limb('koteL', (0.327, -0.04, 1.18), (0.258, -0.142, 1.06), 0.062, 0.05, ARMOR)

    def fist(pos, group, grip=(0, 0, 1)):
        g = Vector(grip).normalized(); px, py, pz = pos
        side = Vector((1, 0, 0)) if abs(g.x) < 0.9 else Vector((0, 1, 0))
        K.box('palm', (0.075, 0.05, 0.09), pos, CLOTH, bevel=0.012, group=group)
        for f in range(4):
            off = (f - 1.5) * 0.021
            base = Vector(pos) + g * off + Vector((0, -0.032, 0))
            K.limb(f'fing{f}a', base + side * -0.036, base + side * 0.0, 0.0105, 0.0105, CLOTH, verts=8, group=group)
            K.limb(f'fing{f}b', base + side * 0.0, base + side * 0.03 + Vector((0, 0.022, 0)), 0.0105, 0.0095, CLOTH, verts=8, group=group)
        K.limb('thumb', Vector(pos) + Vector((-0.03, -0.025, 0.03)), Vector(pos) + Vector((0.012, -0.045, 0.045)), 0.0125, 0.011, CLOTH, verts=8, group=group)
        K.box('tekko', (0.08, 0.02, 0.085), (px, py + 0.03, pz), LACQ, bevel=0.008, group=group)
    fist((0.235, -0.175, 1.01), None, grip=(0.33, 0.86, -0.3))

    # --- shoulder guards
    for s in (-1, 1):
        K.lames(f'sode{s}', 7, 1.55, 0.06, 0.12, 0.007, 90 * s - 84, 90 * s + 84, ARMOR, centre=(0.215 * s, 0.0), squash=1.0)
        K.box(f'sodecap{s}', (0.2, 0.26, 0.022), (0.235 * s, 0, 1.557), REDL, rot=(0, math.radians(10 * s), 0), bevel=0.01)

    # --- helmet
    K.ball('bowl', 0.13, (0, -0.004, 1.71), (1, 1.07, 0.92), LACQ)
    for k in range(16):
        a = math.radians(k * 22.5)
        pts = [(math.sin(a) * 0.133 * math.sin(t), -0.004 - math.cos(a) * 0.142 * math.sin(t), 1.71 + 0.122 * math.cos(t)) for t in [0.14 + j * 0.24 for j in range(6)]]
        for j in range(5):
            K.limb(f'ridge{k}{j}', pts[j], pts[j + 1], 0.0032, 0.0032, IRON, verts=5, bevel=0)
    K.limb('tehen', (0, -0.004, 1.825), (0, -0.004, 1.85), 0.022, 0.013, BRASS)
    K.band('brim', 1.722, 1.678, 0.132, 0.195, -64, 64, LACQ, 0.95, t=0.008)
    K.lames('shikoro', 5, 1.7, 0.044, 0.142, 0.024, 56, 304, ARMOR, squash=1.0)
    for s in (-1, 1):
        K.box(f'fuki{s}', (0.012, 0.085, 0.1), (0.172 * s, -0.125, 1.665), REDL, rot=(0, 0, math.radians(-40 * s)), bevel=0.006)

    def horn(sign):
        left, right, uv = [], [], []
        for i in range(31):
            t = i / 30
            x = sign * (0.02 + 0.21 * t ** 0.82); z = 1.795 + 0.38 * t ** 1.3
            w = 0.034 * (1 - t) ** 0.75 + 0.0015
            left.append((x - w * 0.9, -0.142 - 0.03 * t, z + w * 0.5)); right.append((x + w * 0.9, -0.142 - 0.03 * t, z - w * 0.5))
        K.finish(K.solid(K.mesh(f'horn{sign}', left + right, [(i, i + 1, 32 + i, 31 + i) for i in range(30)]), 0.006), BRASS, 0.002)
    horn(-1); horn(1)
    K.finish(K.solid(K.mesh('crest', [(-0.022, -0.146, 1.79), (0.022, -0.146, 1.79), (0.013, -0.156, 1.92), (0, -0.16, 2.0), (-0.013, -0.156, 1.92)], [(0, 1, 2, 3, 4)]), 0.006), REDL, 0.002)

    # --- war mask: jaw, cheeks, nose, bared teeth, throat guard, eyes
    K.ball('menpo', 0.1, (0, -0.04, 1.63), (0.95, 0.96, 0.74), IRON)
    for s in (-1, 1):
        K.ball(f'cheek{s}', 0.04, (0.052 * s, -0.098, 1.648), (1, 0.6, 0.8), IRON, seg=14)
        K.limb(f'whisker{s}', (0.02 * s, -0.132, 1.622), (0.1 * s, -0.11, 1.6), 0.008, 0.002, BRASS, verts=6)
        K.box(f'eye{s}', (0.036, 0.016, 0.007), (0.043 * s, -0.106, 1.69), EYE, rot=(0, math.radians(-14 * s), 0), bevel=0)
    K.limb('nose', (0, -0.118, 1.672), (0, -0.146, 1.634), 0.011, 0.023, IRON, verts=8)
    for k in range(7):
        K.box(f'tooth{k}', (0.009, 0.008, 0.016 if k in (1, 5) else 0.011), ((k - 3) * 0.0115, -0.131 + abs(k - 3) * 0.003, 1.603), SAME, bevel=0.002)
    K.lames('throat', 3, 1.58, 0.038, 0.088, 0.014, -62, 62, ARMOR, squash=1.0)

    # --- the scabbard, thrust through the sash
    K.limb('saya', (0.2, -0.22, 1.035), (0.47, 0.5, 0.8), 0.021, 0.016, REDL, squash=0.62, verts=14)
    K.limb('koiguchi', (0.193, -0.238, 1.041), (0.2, -0.22, 1.035), 0.023, 0.023, BRASS, squash=0.62, verts=14)
    K.limb('kojiri', (0.47, 0.5, 0.8), (0.48, 0.527, 0.791), 0.017, 0.012, IRON, squash=0.62, verts=14)
    for k in range(4):
        p = Vector((0.2, -0.22, 1.035)).lerp(Vector((0.47, 0.5, 0.8)), 0.12 + k * 0.035)
        q = Vector((0.2, -0.22, 1.035)).lerp(Vector((0.47, 0.5, 0.8)), 0.14 + k * 0.035)
        K.limb(f'sageo{k}', p, q, 0.0235, 0.0235, SILK, squash=0.62, verts=14)

    # --- sword arm (local space: shoulder at the origin, forearm and blade pointing up)
    K.limb('armR1', (0, 0, 0), (0, -0.03, 0.3), 0.066, 0.052, CLOTH, group=A)
    K.limb('armR2', (0, -0.03, 0.3), (0, -0.1, 0.52), 0.052, 0.042, CLOTH, group=A)
    K.limb('koteR', (0, -0.04, 0.31), (0, -0.094, 0.5), 0.062, 0.052, ARMOR, group=A)
    GY = -0.11
    fist((0, GY + 0.012, 0.56), A)

    # katana — handle: ray skin core, crossed silk wrap, iron pommel and collar
    K.limb('same', (0, GY, 0.45), (0, GY, 0.725), 0.0165, 0.0155, SAME, verts=12, group=A, squash=0.7)
    n_wrap = 11
    for k in range(n_wrap):
        z = 0.462 + k * 0.024
        for face in (-1, 1):
            for tilt in (-1, 1):
                K.box(f'ito{k}{face}{tilt}', (0.04, 0.0035, 0.0095), (0, GY + face * 0.0125, z), SILK, rot=(0, math.radians(38 * tilt), 0), bevel=0.0012, group=A)
        for side in (-1, 1):
            K.box(f'itoedge{k}{side}', (0.004, 0.026, 0.015), (side * 0.0172, GY, z + 0.012), SILK, bevel=0.0012, group=A)
    K.limb('kashira', (0, GY, 0.428), (0, GY, 0.452), 0.014, 0.0195, IRON, verts=12, group=A, squash=0.72)
    K.ball('mon', 0.008, (0, GY - 0.0135, 0.44), (1, 0.3, 1), BRASS, group=A, seg=10)
    K.limb('fuchi', (0, GY, 0.722), (0, GY, 0.738), 0.0185, 0.0185, IRON, verts=12, group=A, squash=0.72)
    for face in (-1, 1):
        K.ball(f'menuki{face}', 0.007, (0.004 * face, GY + face * 0.014, 0.59), (0.7, 0.4, 2.2), BRASS, group=A, seg=10)
    # guard: a four-lobed iron plate with a raised rim
    ring, n = [], 48
    for i in range(n):
        a = i / n * math.tau
        r = 0.047 * (1 + 0.1 * math.cos(4 * a))
        ring.append((math.cos(a) * r, GY + math.sin(a) * r * 0.86, 0.742))
    K.finish(K.solid(K.mesh('tsuba', ring + [(0, GY, 0.742)], [(i, (i + 1) % n, n) for i in range(n)]), 0.006), IRON, 0.0015, group=A)
    K.limb('seppa', (0, GY, 0.7485), (0, GY, 0.7505), 0.021, 0.021, BRASS, verts=16, group=A, squash=0.5, bevel=0)
    K.limb('habaki', (0, GY, 0.75), (0, GY, 0.778), 0.0172, 0.0152, BRASS, verts=8, group=A, squash=0.36, bevel=0.001)

    # blade: ridged section swept along a shallow curve, edge leading (+X), with a true point
    rings, uvs, n, z0, length = [], [], 48, 0.752, 0.84
    for i in range(n + 1):
        s = i / n; z = z0 + length * s
        back = -0.08 * s * s
        k = 1.0 if s < 0.94 else max(((1 - s) / 0.06) ** 0.8, 0.06)
        w = 0.0165 * (1 - 0.22 * s)
        edge = back - w + 2 * w * k
        ridge = back - w + 0.62 * 2 * w * k
        rings.append([(edge, GY, z), (ridge, GY - 0.0035 * k, z), (back - w, GY - 0.0029 * k, z), (back - w, GY + 0.0029 * k, z), (ridge, GY + 0.0035 * k, z)])
        uvs += [(s, 0.0), (s, 0.6), (s, 1.0), (s, 1.0), (s, 0.6)]
    verts = [v for r in rings for v in r]
    faces = [(i * 5 + j, i * 5 + (j + 1) % 5, (i + 1) * 5 + (j + 1) % 5, (i + 1) * 5 + j) for i in range(n) for j in range(5)]
    faces += [(4, 3, 2, 1, 0), tuple(range(n * 5, n * 5 + 5))]
    blade = K.mesh('blade', verts, faces, uvs); blade.data.materials.append(STEEL)
    for p in blade.data.polygons: p.use_smooth = False
    A.append(blade)

    body, arm = K.join(K.parts, 'Body'), K.join(A, 'ArmMesh')
    root = bpy.data.objects.new('Samurai', None); K.scene.collection.objects.link(root)
    pivot = bpy.data.objects.new('SwordArm', None); K.scene.collection.objects.link(pivot)
    pivot.location = (-0.25, 0.0, 1.47)
    body.parent = root; pivot.parent = root; arm.parent = pivot
    export('samurai.glb')


# =====================================================================  TORII + LANTERNS
def torii():
    K = Kit(reset())
    WOOD = pbr('Timber', 'wood_a', 'wood_r', 'wood_n', nstrength=1.0)
    DARK = pbr('DarkTimber', 'dwood_a', 'wood_r', 'wood_n', nstrength=1.0)
    STONE = pbr('Stone', 'stone_a', 'stone_r', 'stone_n', nstrength=1.0)
    BRASS = pbr('Brass', 'brass_a', 'brass_r', None, metallic=1.0)
    GLOW = pbr('LanternGlow', color=(1, 0.42, 0.12), emit=(1, 0.33, 0.0), strength=7.0)
    W, H = 3.6, 8.2                                             # half span, pillar height

    def beam(name, z, h, depth, half, rise, mat, over=0.0, roof=0.0):
        """A lintel swept along X that lifts towards its ends."""
        verts, faces, uvs, n = [], [], [], 40
        for i in range(n + 1):
            u = i / n * 2 - 1
            x = u * (half + over)
            lift = rise * abs(u) ** 2.4
            d = depth / 2
            ring = [(x, -d, z + lift), (x, d, z + lift), (x, d + roof, z + h + lift * 1.15), (x, 0, z + h * (1.25 if roof else 1) + lift * 1.15), (x, -d - roof, z + h + lift * 1.15)]
            verts += ring; uvs += [(x * 0.35, k * 0.2) for k in range(5)]
        for i in range(n):
            for j in range(5):
                faces.append((i * 5 + j, i * 5 + (j + 1) % 5, (i + 1) * 5 + (j + 1) % 5, (i + 1) * 5 + j))
        faces += [(4, 3, 2, 1, 0), tuple(range(n * 5, n * 5 + 5))]
        return K.finish(K.mesh(name, verts, faces, uvs), mat, 0.02, smooth=False)

    for s in (-1, 1):
        K.limb(f'pillar{s}', (W * s, 0, 0.5), (W * s * 0.965, 0, H), 0.44, 0.36, WOOD, verts=28, bevel=0)
        K.limb(f'footing{s}', (W * s, 0, 0), (W * s, 0, 0.62), 0.74, 0.56, STONE, verts=28, bevel=0.03)
        K.limb(f'collar{s}', (W * s * 0.997, 0, 0.6), (W * s * 0.996, 0, 0.78), 0.47, 0.455, DARK, verts=28, bevel=0.01)
        K.limb(f'cap{s}', (W * s * 0.966, 0, H - 0.1), (W * s * 0.965, 0, H + 0.12), 0.43, 0.47, DARK, verts=28, bevel=0.01)
        for side in (-1, 1):                                    # wedges through the tie beam
            K.box(f'wedge{s}{side}', (0.14, 0.34, 0.5), (W * s * 0.972 + 0.5 * side, 0, 6.38), DARK, rot=(0, math.radians(8 * side), 0), bevel=0.02)
    K.box('tie', (W * 2 + 1.9, 0.34, 0.62), (0, 0, 6.35), WOOD, bevel=0.03)
    K.box('post', (0.42, 0.3, 1.2), (0, 0, 7.25), WOOD, bevel=0.03)
    K.box('plaque', (1.05, 0.12, 1.5), (0, -0.24, 7.2), DARK, bevel=0.03)
    K.box('plaqueframe', (1.2, 0.08, 1.65), (0, -0.19, 7.2), BRASS, bevel=0.02)
    beam('lintel', H + 0.1, 0.5, 0.62, W, 0.75, WOOD, over=1.45)
    beam('cap', H + 0.62, 0.42, 0.78, W, 0.86, DARK, over=1.75, roof=0.16)

    def lantern(x, y, tag):
        g = []
        hexa = dict(verts=6, group=g, bevel=0.02)
        K.limb('base', (x, y, 0), (x, y, 0.28), 0.62, 0.5, STONE, **hexa)
        K.limb('shaft', (x, y, 0.28), (x, y, 1.55), 0.2, 0.17, STONE, verts=12, group=g, bevel=0.01)
        K.limb('ring', (x, y, 0.86), (x, y, 0.98), 0.24, 0.24, STONE, verts=12, group=g, bevel=0.02)
        K.limb('table', (x, y, 1.55), (x, y, 1.8), 0.3, 0.56, STONE, **hexa)
        for k in range(6):
            a = math.radians(k * 60 + 30)
            K.box(f'stile{k}', (0.09, 0.09, 0.62), (x + math.cos(a) * 0.4, y + math.sin(a) * 0.4, 2.11), STONE, rot=(0, 0, a), bevel=0.012, group=g)
        K.limb('light', (x, y, 1.82), (x, y, 2.4), 0.33, 0.33, GLOW, verts=6, group=g, bevel=0)
        K.limb('roof', (x, y, 2.42), (x, y, 2.95), 0.86, 0.14, STONE, **hexa)
        K.limb('eave', (x, y, 2.36), (x, y, 2.44), 0.8, 0.88, STONE, **hexa)
        K.ball('finial', 0.17, (x, y, 3.1), (1, 1, 1.35), STONE, group=g, seg=12)
        ob = K.join(g, f'Lantern{tag}Mesh')
        marker = bpy.data.objects.new(f'Lantern{tag}', None); K.scene.collection.objects.link(marker); marker.location = (x, y, 2.1)
        return ob
    lantern(-W - 2.6, -2.2, 'L'); lantern(W + 2.6, -2.2, 'R')
    K.join(K.parts, 'Gate')
    export('torii_gate.glb')


# =====================================================================  SAKURA
def sakura():
    K = Kit(reset())
    BARK = pbr('Bark', 'bark_a', None, 'bark_n', roughness=0.92, nstrength=1.4)
    BLOSSOM = pbr('Blossom', 'blossom', roughness=0.7, alpha=True)

    def tree(tag, seed):
        rnd = random.Random(seed)
        bm = bmesh.new(); skin = bm.verts.layers.skin.verify()
        tips = []

        def grow(v0, direction, length, radius, depth):
            steps, v = 3, v0
            for k in range(steps):                               # each branch wanders as it goes
                direction = (direction + Vector((rnd.uniform(-0.35, 0.35), rnd.uniform(-0.35, 0.35), rnd.uniform(-0.05, 0.25)))).normalized()
                nv = bm.verts.new(v.co + direction * length / steps)
                r = radius * (1 - 0.22 * (k + 1) / steps)
                nv[skin].radius = (r, r); bm.edges.new((v, nv)); v = nv
            if depth == 0 or radius < 0.035:
                tips.append((v.co.copy(), length)); return
            if depth <= 2: tips.append((v.co.copy(), length * 0.8))
            for _ in range(2 if depth > 3 else rnd.choice((2, 3))):
                nd = (direction + Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.15, 0.6)))).normalized()
                grow(v, nd, length * rnd.uniform(0.62, 0.8), radius * rnd.uniform(0.55, 0.7), depth - 1)

        root = bm.verts.new((0, 0, -0.3)); root[skin].radius = (0.42, 0.42); root[skin].use_root = True
        base = bm.verts.new((rnd.uniform(-0.1, 0.1), rnd.uniform(-0.1, 0.1), 0.5)); base[skin].radius = (0.3, 0.3); bm.edges.new((root, base))
        grow(base, Vector((rnd.uniform(-0.25, 0.25), rnd.uniform(-0.25, 0.25), 1)).normalized(), 2.1, 0.26, 4)
        me = bpy.data.meshes.new(f'{tag}_trunk'); bm.to_mesh(me); bm.free()
        trunk = bpy.data.objects.new(f'{tag}_trunk', me); K.scene.collection.objects.link(trunk)
        trunk.modifiers.new('skin', 'SKIN'); dec = trunk.modifiers.new('dec', 'DECIMATE'); dec.ratio = 0.5
        bpy.context.view_layer.objects.active = trunk; trunk.select_set(True)
        bpy.ops.object.convert(target='MESH')
        layer = trunk.data.uv_layers.new(name='UVMap')
        for loop in trunk.data.loops:
            c = trunk.data.vertices[loop.vertex_index].co
            layer.data[loop.index].uv = (math.atan2(c.y, c.x) / math.tau * 3, c.z * 0.9)
        trunk.data.materials.append(BARK)
        for p in trunk.data.polygons: p.use_smooth = True
        trunk.select_set(False)

        # blossom: clouds of small textured cards around every branch tip
        verts, faces, uvs = [], [], []
        for centre, spread in tips:
            for _ in range(int(9 + spread * 9)):
                c = centre + Vector((rnd.gauss(0, 1), rnd.gauss(0, 1), rnd.gauss(0.15, 0.7))) * spread * 0.55
                size = rnd.uniform(0.34, 0.6)
                n = Vector((rnd.uniform(-1, 1), rnd.uniform(-1, 1), rnd.uniform(-0.3, 1))).normalized()
                t = n.orthogonal().normalized(); b = n.cross(t)
                i = len(verts)
                verts += [tuple(c + (-t - b) * size), tuple(c + (t - b) * size), tuple(c + (t + b) * size), tuple(c + (-t + b) * size)]
                uvs += [(0, 0), (1, 0), (1, 1), (0, 1)]; faces.append((i, i + 1, i + 2, i + 3))
        leaves = K.mesh(f'{tag}_blossom', verts, faces, uvs); leaves.data.materials.append(BLOSSOM)
        print(tag, 'trunk tris', sum(len(p.vertices) - 2 for p in trunk.data.polygons), 'cards', len(faces))

    tree('TreeA', 3); tree('TreeB', 11)
    for i, ob in enumerate(o for o in K.scene.objects if o.name.startswith('TreeB')): ob.location.x = 12
    export('sakura_tree.glb')


samurai(); torii(); sakura()
