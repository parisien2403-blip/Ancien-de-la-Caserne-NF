"""La nouvelle caserne — un intérieur (salle des fêtes, mess, étages, cave, appartement) : celui de 1990, exporté du jeu (géométrie et textures exactes),
repris dans Blender : rangé, regroupé par matière, images de 1024 px au plus ; exporté pour le jeu. Puis retouché : chaque matière reçoit son relief (retouche.py)."""
import bpy, os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
args = sys.argv[sys.argv.index("--") + 1:]
NOM, OUT = args[0], args[1]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(D, NOM + "-1990.glb"))
ms = [o for o in sc.objects if o.type == "MESH"]
bpy.ops.object.select_all(action="DESELECT")
for o in ms: o.select_set(True)
bpy.context.view_layer.objects.active = ms[0]
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in [o for o in sc.objects if o.type != "MESH"]: bpy.data.objects.remove(o)
parMat = {}
for o in ms:
    m = o.active_material.name if o.active_material else "_"
    if len(o.material_slots) > 1: m = "multi:" + o.name
    parMat.setdefault(m, []).append(o)
for m, liste in parMat.items():
    if len(liste) < 2: continue
    bpy.ops.object.select_all(action="DESELECT")
    for o in liste: o.select_set(True)
    bpy.context.view_layer.objects.active = liste[0]; bpy.ops.object.join()
for im in bpy.data.images:
    if im.size[0] > 1024 or im.size[1] > 1024:
        k = 1024 / max(im.size); im.scale(max(1, int(im.size[0] * k)), max(1, int(im.size[1] * k)))
import retouche; retouche.retoucher(sc)
print(NOM, "objets", len([o for o in sc.objects if o.type == "MESH"]))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, NOM + ".glb"), export_format="GLB", export_image_format="WEBP", export_apply=True, export_yup=True, export_cameras=False, export_lights=False)
print("FINI")
