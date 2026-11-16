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
