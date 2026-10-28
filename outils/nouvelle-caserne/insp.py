import bpy, os, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
f = sys.argv[sys.argv.index("--") + 1]
bpy.ops.import_scene.gltf(filepath=f)
from mathutils import Vector
L = []
for o in bpy.context.scene.objects:
    if o.type != "MESH": continue
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    xs = [v.x for v in bb]; ys = [v.y for v in bb]; zs = [v.z for v in bb]
    L.append(((max(xs)-min(xs))*(max(zs)-min(zs)), o.name, round(min(xs),1), round(max(xs),1), round(min(ys),1), round(max(ys),1), round(min(zs),1), round(max(zs),1)))
L.sort(reverse=True)
for l in L[:8]: print("BB", l)
