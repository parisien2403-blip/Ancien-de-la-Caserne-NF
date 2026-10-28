import bpy, os, sys, math
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
OUT = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
import horloge, cotes, entree, facade_rue
horloge.construire(os.path.join(OUT, "fenetres-horloge.json")); cotes.construire(); entree.construire(); facade_rue.construire()
import retouche; retouche.retoucher(sc)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0))
w = bpy.data.worlds.new("ciel"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (.5, .62, .8, 1); w.node_tree.nodes["Background"].inputs["Strength"].default_value = .8
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), math.radians(-25), math.radians(-25))); bpy.context.object.data.energy = 3.5
vues = [(a, b, c) for a, b, c in [("t-horloge.png", (0, -14, 9), (0, 18, 14)), ("t-horloge-bas.png", (2, 6, 4), (0, 18, 6)), ("t-garages.png", (-2, 10, 6), (12, -2, 4)), ("t-entree.png", (0, -37, 6.5), (0, -29.35, 7.3)), ("t-toit.png", (30, -10, 40), (0, 22, 25)), ("t-lune.png", (-1.2, -32.5, 7.2), (-1.2, -29.35, 7.2)), ("t-rue.png", (14, -52, 8), (0, -29.35, 11)), ("t-rue-haut.png", (8, -40, 22), (0, -29.35, 23))] if not sys.argv[-1].startswith("seul") or a[:-4] in sys.argv[-1].split(",")]
for nom, pos, vise in vues:
    bpy.ops.object.camera_add(location=pos); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 24
    cible = bpy.data.objects.new("cible", None); cible.location = vise; sc.collection.objects.link(cible)
    tc = cam.constraints.new("TRACK_TO"); tc.target = cible; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
    sc.render.engine = "CYCLES"; sc.cycles.samples = 10; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False
    sc.render.resolution_x, sc.render.resolution_y = 1000, 650
    sc.render.filepath = os.path.join(OUT, nom); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam); bpy.data.objects.remove(cible)
print("FINI")
