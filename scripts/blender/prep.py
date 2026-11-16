# Step 1: weld the armoured samurai into one mesh, lighten it, stand him on the ground, save a working .blend
import bpy, numpy as np
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/mnt/user-data/uploads/samurai_sentinel.glb')
objs=[o for o in bpy.context.scene.objects if o.type=='MESH']
me=objs[0].data
print('uv layers', [l.name for l in me.uv_layers])
if len(me.uv_layers)>1:
    n=len(me.loops); a=np.empty(n*2); b=np.empty(n*2)
    me.uv_layers[0].data.foreach_get('uv',a)
    for l in me.uv_layers[1:]:
        l.data.foreach_get('uv',b); print(' ', l.name, 'max diff vs uv0', float(np.abs(a-b).max()))
bpy.ops.object.select_all(action='DESELECT')
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active=objs[0]
bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
bpy.ops.object.join(); ob=bpy.context.object; ob.name='Sentinel'
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.remove_doubles(threshold=0.00002); bpy.ops.object.mode_set(mode='OBJECT')
print('after weld tris', sum(len(p.vertices)-2 for p in ob.data.polygons), 'verts', len(ob.data.vertices))
d=ob.modifiers.new('dec','DECIMATE'); d.ratio=0.24
bpy.ops.object.modifier_apply(modifier='dec')
while len(ob.data.uv_layers)>1: ob.data.uv_layers.remove(ob.data.uv_layers[-1])
for v in ob.data.vertices: v.co.z+=0.952
print('final tris', sum(len(p.vertices)-2 for p in ob.data.polygons), 'verts', len(ob.data.vertices))
for o in list(bpy.context.scene.objects):
    if o is not ob: bpy.data.objects.remove(o)
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/rig/work/sentinel_base.blend')
