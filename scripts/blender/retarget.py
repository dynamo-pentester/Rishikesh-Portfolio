# Builds a Mixamo-shaped skeleton inside the armoured samurai, binds the armour to it, transfers five
# motion-capture clips onto it, fits the katana and scabbard from the motion itself, and exports one GLB.
import bpy, math, json, os, glob, numpy as np
from mathutils import Vector, Matrix, Quaternion

W = '/home/claude/rig/work/'
CLIPS = {'Idle': '2hand_Idle', 'Draw': 'Withdrawing_Sword', 'Slash': 'Stable_Sword_Inward_Slash', 'Sheathe': 'Sheathing_Sword'}
bpy.ops.wm.open_mainfile(filepath=W + 'sentinel_base.blend')
scene = bpy.context.scene; scene.render.fps = 30
body = bpy.data.objects['Sentinel']

def pbr(name, albedo=None, rough=None, normal=None, color=(1, 1, 1), metallic=0.0, roughness=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Metallic'].default_value = metallic; b.inputs['Roughness'].default_value = roughness
    def tex(p, c):
        n = nt.nodes.new('ShaderNodeTexImage'); n.image = bpy.data.images.load(p)
        if not c: n.image.colorspace_settings.name = 'Non-Color'
        return n
    if albedo: nt.links.new(tex(albedo, True).outputs['Color'], b.inputs['Base Color'])
    if rough: nt.links.new(tex(rough, False).outputs['Color'], b.inputs['Roughness'])
    if normal:
        nm = nt.nodes.new('ShaderNodeNormalMap'); nt.links.new(tex(normal, False).outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = strength
    return m
body.data.materials.clear()
body.data.materials.append(pbr('Armour', W + 'sent_albedo.jpg', W + 'sent_rough.png', W + 'sent_normal_s.png', metallic=0.75))
for p in body.data.polygons: p.use_smooth = True

# ---------------------------------------------------------------- skeleton: Mixamo's names and hierarchy, the Sentinel's proportions
J = {
    'Hips': ((0, 0.02, 0.92), (0, 0.02, 1.02), None), 'Spine': ((0, 0.02, 1.02), (0, 0.02, 1.12), 'Hips'), 'Spine1': ((0, 0.02, 1.12), (0, 0.02, 1.24), 'Spine'),
    'Spine2': ((0, 0.02, 1.24), (0, 0.02, 1.42), 'Spine1'), 'Neck': ((0, 0.02, 1.42), (0, 0.0, 1.5), 'Spine2'), 'Head': ((0, 0.0, 1.5), (0, 0.0, 1.72), 'Neck'),
}
for s, n in ((1, 'Left'), (-1, 'Right')):
    J[f'{n}Shoulder'] = ((0.05 * s, 0.03, 1.38), (0.19 * s, 0.04, 1.33), 'Spine2')
    J[f'{n}Arm'] = ((0.19 * s, 0.04, 1.33), (0.47 * s, 0.04, 1.26), f'{n}Shoulder')
    J[f'{n}ForeArm'] = ((0.47 * s, 0.04, 1.26), (0.74 * s, 0.0, 1.23), f'{n}Arm')
    J[f'{n}Hand'] = ((0.74 * s, 0.0, 1.23), (0.8 * s, -0.01, 1.225), f'{n}ForeArm')
    J[f'{n}Fingers'] = ((0.8 * s, -0.01, 1.225), (0.87 * s, -0.02, 1.2), f'{n}Hand')
    J[f'{n}UpLeg'] = ((0.11 * s, 0.02, 0.9), (0.17 * s, 0.0, 0.5), 'Hips')
    J[f'{n}Leg'] = ((0.17 * s, 0.0, 0.5), (0.2 * s, 0.03, 0.1), f'{n}UpLeg')
    J[f'{n}Foot'] = ((0.2 * s, 0.03, 0.1), (0.2 * s, -0.1, 0.03), f'{n}Leg')
    J[f'{n}ToeBase'] = ((0.2 * s, -0.1, 0.03), (0.2 * s, -0.19, 0.02), f'{n}Foot')
arm_data = bpy.data.armatures.new('Rig'); rig = bpy.data.objects.new('Rig', arm_data); scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='EDIT')
for name, (h, t, par) in J.items():
    b = arm_data.edit_bones.new(name); b.head, b.tail = h, t
for name, (h, t, par) in J.items():
    if par:
        b = arm_data.edit_bones[name]; b.parent = arm_data.edit_bones[par]; b.use_connect = (Vector(J[par][1]) - Vector(h)).length < 1e-4
bpy.ops.object.mode_set(mode='OBJECT')

# ---------------------------------------------------------------- weights
n = len(body.data.vertices); co = np.empty(n * 3); body.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
RAD = {'Hips': 0.2, 'Spine': 0.19, 'Spine1': 0.2, 'Spine2': 0.21, 'Neck': 0.09, 'Head': 0.16, 'Arm': 0.075, 'ForeArm': 0.06, 'Hand': 0.06, 'Fingers': 0.05,
       'UpLeg': 0.11, 'Leg': 0.085, 'Foot': 0.08, 'ToeBase': 0.07}
deform = [b for b in J if 'Shoulder' not in b]
side = lambda b: 'L' if b.startswith('Left') else ('R' if b.startswith('Right') else '')
key = lambda b: b.replace('Left', '').replace('Right', '')
Wt = np.zeros((n, len(deform)))
for k, name in enumerate(deform):
    a, b = np.array(J[name][0]), np.array(J[name][1]); ab = b - a
    t = np.clip(((co - a) @ ab) / (ab @ ab), 0, 1)
    d = np.maximum(np.linalg.norm(co - (a + t[:, None] * ab), axis=1) - RAD[key(name)], 0) + 0.012
    w = 1 / d ** 5
    if side(name) == 'L': w[co[:, 0] < -0.01] = 0
    if side(name) == 'R': w[co[:, 0] > 0.01] = 0
    Wt[:, k] = w
h = co[:, 2]; ax = np.abs(co[:, 0])
def only(mask, keys):
    keep = [i for i, b in enumerate(deform) if key(b) in keys]; other = [i for i in range(len(deform)) if i not in keep]
    Wt[np.ix_(mask, other)] = 0
only(h > 1.5, ['Head'])
only((h > 1.44) & (h <= 1.5) & (ax < 0.22), ['Head', 'Neck', 'Spine2'])
only((ax > 0.805) & (h > 1.1), ['Fingers'])
only((ax > 0.7) & (ax <= 0.805) & (h > 1.1), ['Hand', 'Fingers'])
only((ax > 0.32) & (h > 1.08) & (h < 1.5), ['Arm', 'ForeArm', 'Hand', 'Fingers'])
only(h < 0.06, ['Foot', 'ToeBase'])
only((h < 0.86) & (h >= 0.06), ['Hips', 'UpLeg', 'Leg', 'Foot', 'ToeBase'])
only((h >= 0.5) & (h < 0.86) & (ax < 0.31), ['Hips', 'UpLeg'])
Wt[(h >= 0.6) & (h < 0.86), deform.index('Hips')] *= 3.0
top = np.sort(Wt, axis=1)[:, -3][:, None]; Wt[Wt < top] = 0
Wt /= Wt.sum(1, keepdims=True); Wt[Wt < 0.03] = 0; Wt /= Wt.sum(1, keepdims=True)
for k, name in enumerate(deform):
    g = body.vertex_groups.new(name=name); idx = np.nonzero(Wt[:, k])[0]; r = np.round(Wt[idx, k], 2)
    for wv in np.unique(r):
        if wv > 0: g.add(idx[r == wv].tolist(), float(wv), 'REPLACE')
body.modifiers.new('Armature', 'ARMATURE').object = rig; body.parent = rig

# ---------------------------------------------------------------- transfer the motion
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE')
pb = rig.pose.bones
for b in pb: b.rotation_mode = 'QUATERNION'
order = list(J)                                               # parents before children
rest = {b: rig.data.bones[b].matrix_local.to_3x3() for b in order}
SRC = {b: 'mixamorig:' + b for b in order if 'Fingers' not in b}
K = 0.92 / 1.043                                              # leg-length ratio: how far the hips travel
rig.animation_data_create(); meta = {}

def rot(o, pose_bone):
    return (o.matrix_world.to_3x3() @ pose_bone.matrix.to_3x3()).to_quaternion().to_matrix()

for clip, fname in CLIPS.items():
    path = glob.glob(f'/mnt/user-data/uploads/*{fname}.fbx')[0]
    before = set(bpy.data.objects)
    bpy.ops.object.mode_set(mode='OBJECT'); bpy.ops.import_scene.fbx(filepath=path)
    src = [o for o in bpy.data.objects if o not in before and o.type == 'ARMATURE'][0]
    f0, f1 = (int(v) for v in src.animation_data.action.frame_range)
    srest = {b: (src.matrix_world.to_3x3() @ src.data.bones[n].matrix_local.to_3x3()).to_quaternion().to_matrix() for b, n in SRC.items()}
    srest['LeftFingers'] = (src.matrix_world.to_3x3() @ src.data.bones['mixamorig:LeftHandMiddle2'].matrix_local.to_3x3()).to_quaternion().to_matrix()
    srest['RightFingers'] = (src.matrix_world.to_3x3() @ src.data.bones['mixamorig:RightHandMiddle2'].matrix_local.to_3x3()).to_quaternion().to_matrix()
    hips0 = src.matrix_world @ src.data.bones['mixamorig:Hips'].head_local
    act = bpy.data.actions.new(clip); rig.animation_data.action = act
    bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE')
    frames = list(range(f0, f1 + 1, 2))
    for i, f in enumerate(frames):
        scene.frame_set(f); want = {}
        for b in order:
            if 'Fingers' in b:                                 # one bone closes the whole hand: follow the middle finger's second joint, softened
                sp = src.pose.bones['mixamorig:' + b.replace('Fingers', 'HandMiddle2')]
                D = (rot(src, sp) @ srest[b].inverted()).to_quaternion()
                D = want[b.replace('Fingers', 'Hand')][1].slerp(D, 0.6)
            else:
                D = (rot(src, src.pose.bones[SRC[b]]) @ srest[b].inverted()).to_quaternion()
            want[b] = (D.to_matrix() @ rest[b], D)
            par = J[b][2]
            basis = (rest[b].inverted() @ want[b][0]) if par is None else ((want[par][0] @ rest[par].inverted() @ rest[b]).inverted() @ want[b][0])
            pb[b].rotation_quaternion = basis.to_quaternion(); pb[b].keyframe_insert('rotation_quaternion', frame=i)
        p = src.matrix_world @ src.pose.bones['mixamorig:Hips'].head
        delta = Vector(((p.x - hips0.x) * K, (p.y - hips0.y) * K, (p.z - hips0.z) * K))
        pb['Hips'].location = rest['Hips'].inverted() @ delta; pb['Hips'].keyframe_insert('location', frame=i)
    meta[clip] = {'frames': len(frames), 'duration': round((len(frames) - 1) / 30, 3)}
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.data.objects.remove(src)
    tr = rig.animation_data.nla_tracks.new(); tr.name = clip; tr.strips.new(clip, 0, act); rig.animation_data.action = None
    print(clip, meta[clip])

# a plain upright stand, built by hand: legs and spine as modelled, arms lowered, left hand towards the hilt
from math import radians
from mathutils import Quaternion
act = bpy.data.actions.new('Stand'); rig.animation_data.action = act
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE')
def arm(side, sign, fore):
    a = Quaternion((0, 1, 0), radians(74 * sign)); f = Quaternion((1, 0, 0), radians(fore)) @ a
    return {side + 'Arm': a, side + 'ForeArm': f, side + 'Hand': f, side + 'Fingers': f}
DS = {**arm('Left', 1, -40), **arm('Right', -1, -14)}
for fr in (0, 30):
    want = {}
    for b in order:
        D = DS.get(b, Quaternion())
        want[b] = (D.to_matrix() @ rest[b], D)
        par = J[b][2]
        basis = (rest[b].inverted() @ want[b][0]) if par is None else ((want[par][0] @ rest[par].inverted() @ rest[b]).inverted() @ want[b][0])
        pb[b].rotation_quaternion = basis.to_quaternion(); pb[b].keyframe_insert('rotation_quaternion', frame=fr)
    pb['Hips'].location = (0, 0, 0); pb['Hips'].keyframe_insert('location', frame=fr)
meta['Stand'] = {'frames': 2, 'duration': 1.0}
bpy.ops.object.mode_set(mode='OBJECT')
tr = rig.animation_data.nla_tracks.new(); tr.name = 'Stand'; tr.strips.new('Stand', 0, act); rig.animation_data.action = None

scene.render.fps = 30

# ---------------------------------------------------------------- props, fitted from the motion
def play(clip, frame):
    rig.animation_data.action = bpy.data.actions[clip]
    for t in rig.animation_data.nla_tracks: t.mute = True
    scene.frame_set(frame); bpy.context.view_layer.update()
def palm(nm):
    m = rig.matrix_world @ rig.pose.bones[f'{nm}Hand'].matrix; s = 1 if nm == 'Left' else -1
    return m @ Vector((0, 0.075, 0)) + Vector((0, 0, -0.035))
def bone_parent(ob, bone):
    bpy.context.view_layer.update(); mw = ob.matrix_world.copy(); ob.parent = rig; ob.parent_type = 'BONE'; ob.parent_bone = bone
    bpy.context.view_layer.update(); ob.matrix_world = mw
def kat_matrix(grip, direction, edge):
    y = Vector(direction).normalized(); z = Vector(edge); z = (z - y * z.dot(y)).normalized(); x = y.cross(z)
    m = Matrix((x, y, z)).transposed().to_4x4(); m.translation = Vector(grip); return m

before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath='/mnt/user-data/uploads/e21028d8-samurai_sword.glb')
sw = [o for o in bpy.data.objects if o not in before and o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in sw: o.select_set(True)
bpy.context.view_layer.objects.active = sw[0]
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM'); bpy.ops.object.join(); katana = bpy.context.object; katana.name = 'KatanaHand'
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in [o for o in bpy.data.objects if o not in before and o is not katana]: bpy.data.objects.remove(o)
for im in bpy.data.images:
    if max(im.size) > 1024: im.scale(1024, 1024)
S = 0.0037
for v in katana.data.vertices:
    c = v.co; v.co = Vector((c.x * S, -(c.y - 84.0) * S, (c.z + 4.0) * S))
katana.data.flip_normals()

kv = np.array([v.co[:] for v in katana.data.vertices]); bl = kv[kv[:, 1] > 0.17]
ys = np.linspace(0.15, bl[:, 1].max() + 0.02, 22)
zc = np.polyval(np.polyfit(ys, [(lambda q: (q[:, 2].max() + q[:, 2].min()) / 2)(bl[np.argsort(np.abs(bl[:, 1] - y))[:8]]) for y in ys], 2), ys)
verts, faces, R = [], [], 12
for i, y in enumerate(ys):
    for k in range(R):
        a = k / R * math.tau; verts.append((math.cos(a) * 0.0125, y, zc[i] + math.sin(a) * (0.019 - 0.004 * i / 21)))
for i in range(len(ys) - 1):
    for k in range(R): faces.append((i * R + k, i * R + (k + 1) % R, (i + 1) * R + (k + 1) % R, (i + 1) * R + k))
faces.append(tuple(range((len(ys) - 1) * R, len(ys) * R)))
sm = bpy.data.meshes.new('Saya'); sm.from_pydata(verts, [], faces); sm.update()
saya = bpy.data.objects.new('Saya', sm); scene.collection.objects.link(saya)
saya.data.materials.append(pbr('SayaLacquer', color=(0.012, 0.01, 0.012), metallic=0.3, roughness=0.22))
saya.data.materials.append(pbr('SayaCord', color=(0.28, 0.012, 0.02), roughness=0.8))
for p in saya.data.polygons:
    p.use_smooth = True; yc = sum(sm.vertices[i].co.y for i in p.vertices) / len(p.vertices)
    p.material_index = 1 if (yc < 0.19 or 0.27 < yc < 0.33) else 0

# rest pose (arms out, palms down): the fist is just below the knuckles, the blade points forward past the thumb
rig.animation_data.action = None
for t in rig.animation_data.nla_tracks: t.mute = True
for b_ in rig.pose.bones: b_.rotation_quaternion = (1, 0, 0, 0); b_.location = (0, 0, 0)
scene.frame_set(0); bpy.context.view_layer.update()
katana.matrix_world = kat_matrix((-0.805, 0.0, 1.2), (0.0, -1.0, 0.0), (-1.0, 0.0, -0.15)) @ Matrix.Translation((0, -0.04, 0))
bone_parent(katana, 'RightHand')
def in_hand(): bpy.context.view_layer.update(); return katana.matrix_world.copy()

# the moment the hand takes the hilt in the draw: right palm closest to the left hip. The scabbard goes exactly where the sword is then.
best = (9, 0)
for f in range(0, int(meta['Draw']['frames'] * 0.7)):
    play('Draw', f)
    hip = rig.matrix_world @ rig.pose.bones['LeftUpLeg'].matrix @ Vector((0, 0, 0))
    dist = (palm('Right') - (hip + Vector((0.08, -0.12, 0.08)))).length
    if dist < best[0]: best = (dist, f)
meta['Draw']['grab'] = round(best[1] / 30, 3)
play('Draw', best[1]); m = in_hand(); m = Matrix.Translation(m.translation) @ m.to_quaternion().to_matrix().to_4x4()
print('grab frame', best, 'blade dir at grab', tuple(round(v, 2) for v in (m.to_3x3() @ Vector((0, 1, 0)))))
saya.matrix_world = m; bone_parent(saya, 'Hips')
sheathed = katana.copy(); sheathed.data = katana.data; sheathed.name = 'KatanaSheathed'; scene.collection.objects.link(sheathed)
sheathed.matrix_world = m; bone_parent(sheathed, 'Hips')
# and the moment it goes home again when sheathing
best = (9, 0)
for f in range(int(meta['Sheathe']['frames'] * 0.3), meta['Sheathe']['frames']):
    play('Sheathe', f)
    dist = ((katana.matrix_world.translation) - (sheathed.matrix_world.translation)).length
    if dist < best[0]: best = (dist, f)
meta['Sheathe']['home'] = round(best[1] / 30, 3); print('sheathe home', best)

rig.animation_data.action = None
for b_ in rig.pose.bones: b_.rotation_quaternion = (1, 0, 0, 0); b_.location = (0, 0, 0)
for t in rig.animation_data.nla_tracks: t.mute = False
bpy.ops.wm.save_as_mainfile(filepath=W + 'sentinel_rigged.blend')
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=W + 'guardian.glb', export_format='GLB', export_apply=False, export_yup=True, export_image_format='JPEG', export_jpeg_quality=80,
                          export_animations=True, export_animation_mode='NLA_TRACKS', export_skins=True, export_force_sampling=True, export_frame_range=False)
json.dump(meta, open(W + 'guardian.json', 'w'), indent=1)
print('guardian.glb', os.path.getsize(W + 'guardian.glb') // 1024, 'KB', meta)
