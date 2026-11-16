# Scene props for the site: the lantern, the resting-place diorama, and the guardian's own helmet cut free for the grave.
import bpy, bmesh, os, sys
W = '/home/claude/rig/work/'; U = '/mnt/user-data/uploads/'
def reset(): bpy.ops.wm.read_factory_settings(use_empty=True)
def shrink(limit):
    for im in bpy.data.images:
        w, h = im.size
        if max(w, h) > limit:
            k = limit / max(w, h); im.scale(max(int(w * k), 1), max(int(h * k), 1))
def export(name, sel=None):
    if sel is not None:
        bpy.ops.object.select_all(action='DESELECT')
        for o in sel: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=W + name, export_format='GLB', export_yup=True, export_image_format='WEBP', export_image_quality=82,
                              use_selection=sel is not None, export_animations=False)
    print(name, os.path.getsize(W + name) // 1024, 'KB')

what = sys.argv[-1]
if what in ('lantern', 'all'):
    reset(); bpy.ops.import_scene.gltf(filepath=U + 'old_japanese_lantern.glb')
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and 'Floor' in o.name: bpy.data.objects.remove(o)
    shrink(1024)
    for o in bpy.data.objects:
        if o.type == 'MESH': print('lantern', o.name, [round(c, 2) for c in o.dimensions], [round(c, 2) for c in o.matrix_world.translation])
    export('lantern.glb')
if what in ('finale', 'all'):
    reset(); bpy.ops.import_scene.gltf(filepath=U + 'its_finally_over.glb')
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name.startswith('Katana'): bpy.data.objects.remove(o)
    shrink(1024)
    import mathutils
    mn = mathutils.Vector((1e9,) * 3); mx = -mn
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        for c in o.bound_box:
            p = o.matrix_world @ mathutils.Vector(c)
            for i in range(3): mn[i] = min(mn[i], p[i]); mx[i] = max(mx[i], p[i])
        if any(k in o.name for k in ('Grave', 'Cliff', 'Umbrella1', 'Tree_base', 'Ashes')):
            bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
            print('finale', o.name, [round(min(p[i] for p in bb), 2) for i in range(3)], [round(max(p[i] for p in bb), 2) for i in range(3)])
    print('finale bounds', [round(c, 2) for c in mn], [round(c, 2) for c in mx])
    export('finale.glb')
if what in ('kabuto', 'all'):
    bpy.ops.wm.open_mainfile(filepath=W + 'sentinel_base.blend')
    ob = [o for o in bpy.data.objects if o.type == 'MESH'][0]
    exec(open('/home/claude/rig/scripts/pbr.py').read())
    ob.data.materials.clear(); ob.data.materials.append(pbr('Armour', W + 'sent_albedo.jpg', W + 'sent_rough.png', W + 'sent_normal_s.png', metallic=0.75))
    bm = bmesh.new(); bm.from_mesh(ob.data)
    # keep the bowl, crest and neck guard: everything above a plane that runs from the brow at the front down to the nape
    kill = [v for v in bm.verts if v.co.z < 1.60 - min(max(v.co.y, -0.2), 0.2) * 0.35 or (abs(v.co.x) < 0.1 and v.co.y < -0.03 and v.co.z < 1.70) or abs(v.co.x) > 0.3]
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    # drop the small fragments the cut leaves floating
    seen = set()
    for v in list(bm.verts):
        if v in seen or not v.is_valid: continue
        comp = [v]; seen.add(v); k = 0
        while k < len(comp):
            for e in comp[k].link_edges:
                o = e.other_vert(comp[k])
                if o not in seen: seen.add(o); comp.append(o)
            k += 1
        if len(comp) < 900: bmesh.ops.delete(bm, geom=comp, context='VERTS')
    for v in bm.verts: v.co.z -= 1.58
    bm.to_mesh(ob.data); bm.free(); ob.name = 'Kabuto'
    print('kabuto verts', len(ob.data.vertices), [round(c, 2) for c in ob.dimensions])
    export('kabuto.glb', [ob])
