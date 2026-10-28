"""La nouvelle caserne — la cour d'honneur, étape 1 : la cour de 1990 (exportée du jeu, géométrie et textures exactes),
reprise dans Blender : rangée, allégée, puis réexportée pour le jeu. Les bâtiments seront ensuite refaits un à un, en relief."""
import bpy, os, sys, math
D = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = args[0] if args else D
RENDU = "--rendu" in args

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=os.path.join(D, "cour-1990.glb"))
# ---- les bâtiments refaits en relief remplacent les anciens (des boîtes peintes) ----
sys.path.insert(0, D)
from mathutils import Vector
def dedans(o, x0, x1, y0, y1, z0, z1):
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return all(x0 <= v.x <= x1 and y0 <= v.y <= y1 and z0 <= v.z <= z1 for v in bb)
# (les logos des voitures garées, restés seuls au sol : les voitures, elles, sont remises par le jeu)
for o in [o for o in sc.objects if o.type == "MESH" and len(o.data.vertices) == 4 and o.active_material and o.active_material.blend_method == "BLEND"]:
    bb = [o.matrix_world @ Vector(c) for c in o.bound_box]; c = sum(bb, Vector()) / 8
    if abs(c.x) < 10.5 and .3 < c.z < 1.6: bpy.data.objects.remove(o)
import horloge
vieux = [o for o in sc.objects if o.type == "MESH" and dedans(o, -22.7, 22.7, 17.2, 30.7, -.2, 28.5)]
print("HORLOGE : anciens morceaux retirés", len(vieux))
for o in vieux: bpy.data.objects.remove(o)
horloge.construire()
import cotes
for cote in (-1, 1):
    dedans_c = cotes.envergure(cote)
    vieux = [o for o in sc.objects if o.type == "MESH" and not o.name.startswith(("horloge_", "cote")) and dedans_c([o.matrix_world @ Vector(c) for c in o.bound_box])]
    print("COTE", cote, ": anciens morceaux retirés", len(vieux), sorted(round(max((o.matrix_world @ Vector(c)).z for c in o.bound_box), 1) for o in vieux)[:40])
    for o in vieux: bpy.data.objects.remove(o)
cotes.construire()
import porche
for nom, f in [("porche", porche.envergure_porche), ("aile S", porche.envergure_aile(-1)), ("aile R", porche.envergure_aile(1))]:
    vieux = [o for o in sc.objects if o.type == "MESH" and not o.name.startswith(("horloge_", "cote", "porche_")) and f([o.matrix_world @ Vector(c) for c in o.bound_box])]
    print(nom.upper(), ": anciens morceaux retirés", len(vieux))
    for o in vieux: bpy.data.objects.remove(o)
porche.construire()
objs = [o for o in sc.objects if o.type == "MESH"]
print("OBJETS", len(objs), "MATIERES", len(bpy.data.materials), "IMAGES", len(bpy.data.images))

# 1) on applique toutes les transformations, puis on regroupe les morceaux par matière (beaucoup moins d'objets à dessiner pour le téléphone)
bpy.ops.object.select_all(action="DESELECT")
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active = objs[0]
bpy.ops.object.make_single_user(object=True, obdata=True)
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")   # (d'abord détachés de leurs groupes, en gardant leur place)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
parMat = {}
for o in objs:
    m = o.active_material.name if o.active_material else "_"
    if len(o.material_slots) > 1: m = "multi:" + o.name
    parMat.setdefault(m, []).append(o)
for m, liste in parMat.items():
    if len(liste) < 2: continue
    bpy.ops.object.select_all(action="DESELECT")
    for o in liste: o.select_set(True)
    bpy.context.view_layer.objects.active = liste[0]; bpy.ops.object.join()
for o in [o for o in sc.objects if o.type == "EMPTY"]: bpy.data.objects.remove(o)
print("APRES REGROUPEMENT", len([o for o in sc.objects if o.type == "MESH"]))

# 2) les images : 1024 px au plus
for im in bpy.data.images: print("IMG", im.name, im.size[0], im.size[1], im.alpha_mode, im.depth)
for im in bpy.data.images:
    if im.size[0] > 1024 or im.size[1] > 1024:
        k = 1024 / max(im.size); im.scale(max(1, int(im.size[0] * k)), max(1, int(im.size[1] * k)))

if RENDU:
    w = bpy.data.worlds.new("ciel"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (.5, .62, .8, 1); w.node_tree.nodes["Background"].inputs["Strength"].default_value = .7
    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(55), math.radians(-20), math.radians(-30))); bpy.context.object.data.energy = 3.2
    bpy.ops.object.camera_add(location=(3, 6, 3)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 22
    # (le jeu : y vers le haut, la cour vers -z ; Blender : z vers le haut — l'import a tourné la scène : la cour s'étend vers +y)
    cible = bpy.data.objects.new("cible", None); cible.location = (0, -15, 9); sc.collection.objects.link(cible)
    tc = cam.constraints.new("TRACK_TO"); tc.target = cible; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    sc.render.engine = "CYCLES"; sc.cycles.samples = 16; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = 1280, 800
    sc.render.filepath = os.path.join(OUT, "nc-cour-blender.png"); bpy.ops.render.render(write_still=True)

bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "cour.glb"), export_format="GLB", export_image_format=os.environ.get("FMT", "AUTO"), export_apply=True, export_yup=True)
print("FINI")
