"""La nouvelle caserne — toute la carte extérieure, d'un seul tenant : la rue du Faubourg-Poissonnière, le porche, la cour d'honneur,
la deuxième et la troisième cour. Point de départ : la caserne de 1990, exportée du jeu (géométrie et textures exactes : grande-1990.glb, rue-1990.glb),
reprise dans Blender ; les bâtiments refaits en relief (horloge.py, cotes.py, porche.py…) remplacent les anciens ; le tout est regroupé, allégé, exporté.
La rue est posée à sa vraie place : décalée de 41,35 m (PORCHE_DZ dans matrice.js) — Blender : y = -z du jeu."""
import bpy, bmesh, os, sys, math
from mathutils import Vector
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = args[0] if args else D
RENDU = "--rendu" in args
PORCHE_DZ = 41.35; YP = -15.65          # (le devant du porche côté cour : z = 15,65 du jeu)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def importer(fichier, etiquette, dy=0.0):
    avant = set(sc.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(D, fichier)); neufs = [o for o in sc.objects if o not in avant]
    for o in neufs:
        o["src"] = etiquette
        if o.parent is None: o.location.y += dy
    return neufs

def aplatir(objs):
    """chaque objet : seul, sans parent, ses transformations appliquées (coordonnées du monde)"""
    bpy.ops.object.select_all(action="DESELECT")
    ms = [o for o in objs if o.type == "MESH"]
    for o in ms: o.select_set(True)
    bpy.context.view_layer.objects.active = ms[0]
    bpy.ops.object.make_single_user(object=True, obdata=True)
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in [o for o in sc.objects if o.type == "EMPTY"]: bpy.data.objects.remove(o)

def boite_de(o):
    vs = [Vector(c) for c in o.bound_box]   # (transformations appliquées : coordonnées du monde)
    return (min(v.x for v in vs), max(v.x for v in vs), min(v.y for v in vs), max(v.y for v in vs), min(v.z for v in vs), max(v.z for v in vs))

def retirer(pred, quoi):
    vieux = [o for o in sc.objects if o.type == "MESH" and pred(o)]
    print(quoi, ":", len(vieux)); [bpy.data.objects.remove(o) for o in vieux]

def couper(o, y, garder_moins):
    """coupe le maillage par le plan y = cte ; garde le côté y < cte (garder_moins) ou y > cte"""
    bm = bmesh.new(); bm.from_mesh(o.data)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, y, 0), plane_no=(0, 1, 0), clear_inner=not garder_moins, clear_outer=garder_moins)
    bm.to_mesh(o.data); bm.free()

# ---------- 1) la caserne de 1990 : la cour et les cours de derrière ; la rue, à sa place ----------
G = importer("grande-1990.glb", "g")
R = importer("rue-1990.glb", "r", dy=-PORCHE_DZ)
aplatir(list(sc.objects))
src = lambda o: o.get("src")

# ---------- 2) d'un seul tenant : ce qui était en double, ou du décor de fond, s'en va ----------
# (côté rue : tout ce qui est derrière la façade du porche — la cour peinte, le bout des rues voisines qui passait dans la caserne)
retirer(lambda o: src(o) == "r" and boite_de(o)[2] > YP - .05, "rue : décor de fond, derrière le porche")
# (côté cour : le passage du porche recopié — on garde celui de la rue, le même, à la même place)
retirer(lambda o: src(o) == "g" and (lambda b: max(abs(b[0]), abs(b[1])) <= 2.45 and b[2] >= -29.7 and b[3] <= -15.25 and b[5] <= 4.5)(boite_de(o)), "cour : passage du porche recopié")
# (les logos des voitures garées, restés seuls au sol : les voitures sont remises par le jeu)
for o in [o for o in sc.objects if o.type == "MESH" and src(o) == "g" and len(o.data.vertices) == 4 and o.active_material and o.active_material.blend_method == "BLEND"]:
    b = boite_de(o)
    if abs((b[0] + b[1]) / 2) < 10.5 and .3 < (b[4] + b[5]) / 2 < 1.6: bpy.data.objects.remove(o)
# (la façade du porche côté rue : sa face arrière s'arrête derrière la façade de la cour, pour ne pas la cacher)
for o in [o for o in sc.objects if o.type == "MESH" and src(o) == "r"]:
    b = boite_de(o)
    if b[0] < -20 and b[1] > 20 and b[2] < -29 and b[3] > YP - .4 and b[5] > 15:
        for v in o.data.vertices:
            if v.co.y > YP - .1: v.co.y = YP - .1
        print("façade du porche (côté rue) : raccourcie", o.name)
# (les deux grands sols : chacun s'arrête au porche — sinon bitume et pavés se disputent la même place)
sols = sorted([o for o in sc.objects if o.type == "MESH" and (lambda b: b[5] - b[4] < .01 and abs(b[4]) < .005 and (b[1] - b[0]) * (b[3] - b[2]) > 5000)(boite_de(o))], key=lambda o: -len(o.data.vertices))
for o in sols:
    if src(o) == "r": couper(o, YP, True); print("sol de la rue : coupé au porche")
    elif src(o) == "g": couper(o, YP, False); print("sol de la cour : coupé au porche")

# ---------- 2 bis) les pavés posés au hasard, en relief (texture et carte de relief) : la cour d'honneur, la deuxième cour ----------
import horloge
PAVES = horloge.mat_tex("nc_paves", "paves", .9, 1.0)
def image_de(o):
    m = o.active_material
    if m and m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image: return n.image
    return None
plats = [o for o in sc.objects if o.type == "MESH" and src(o) == "g" and (lambda b: b[5] - b[4] < .02 and abs(b[4]) < .05 and (b[1] - b[0]) * (b[3] - b[2]) > 150)(boite_de(o))]
ref = image_de(max(plats, key=lambda o: (lambda b: (b[1] - b[0]) * (b[3] - b[2]))(boite_de(o))))   # (l'image des pavés de 1990, celle du plus grand sol de la cour)
for o in plats:
    if ref and image_de(o) == ref:
        o.data.materials.clear(); o.data.materials.append(PAVES)
        for a in list(o.data.color_attributes): o.data.color_attributes.remove(a)
        horloge.uv_boite_monde(o, 2.0); print("pavés posés au hasard :", o.name, [round(v, 1) for v in boite_de(o)[:4]])

# ---------- 3) les bâtiments refaits en relief ----------
import horloge, cotes, porche
retirer(lambda o: src(o) == "g" and (lambda b: b[0] >= -22.7 and b[1] <= 22.7 and b[2] >= 16.2 and b[3] <= 30.7 and b[4] >= -.2 and b[5] <= 28.5)(boite_de(o)), "horloge : anciens morceaux")
horloge.construire(os.path.join(OUT, "fenetres-horloge.json"))
for cote in (-1, 1):
    f = cotes.envergure(cote); retirer(lambda o: src(o) == "g" and f([Vector(c) for c in o.bound_box]), "côté %+d : anciens morceaux" % cote)
cotes.construire()
for nom, f in [("porche", porche.envergure_porche), ("aile S", porche.envergure_aile(-1)), ("aile R", porche.envergure_aile(1))]:
    retirer(lambda o: src(o) == "g" and f([Vector(c) for c in o.bound_box]), nom + " : anciens morceaux")
porche.construire()
import facade_rue
retirer(lambda o: src(o) == "r" and facade_rue.envergure(boite_de(o)), "rue : la façade de 1990, son toit")
facade_rue.construire()
import entree
retirer(lambda o: src(o) == "r" and entree.ancienne_photo(o, boite_de(o)), "entrée : la photo plate du porche")
entree.construire()
import verso
retirer(lambda o: src(o) == "g" and verso.envergure_face([Vector(c) for c in o.bound_box]), "bâtiment d'en face (2e cour) : anciens morceaux")
verso.construire()

# ---------- 4) regroupé par matière (beaucoup moins d'objets à dessiner), images de 1024 px au plus ----------
objs = [o for o in sc.objects if o.type == "MESH"]
print("OBJETS", len(objs), "MATIERES", len(bpy.data.materials), "IMAGES", len(bpy.data.images))
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
# ---------- 4 bis) la retouche de tout le reste (rue, troisième cour, toits, trottoirs…) : chaque matière son relief, chaque arête son chanfrein ----------
import retouche; retouche.retoucher(sc)
print("APRES REGROUPEMENT", len([o for o in sc.objects if o.type == "MESH"]))
for im in bpy.data.images:
    if im.size[0] > 1024 or im.size[1] > 1024:
        k = 1024 / max(im.size); im.scale(max(1, int(im.size[0] * k)), max(1, int(im.size[1] * k)))

if RENDU:
    w = bpy.data.worlds.new("ciel"); sc.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (.5, .62, .8, 1); w.node_tree.nodes["Background"].inputs["Strength"].default_value = .7
    bpy.ops.object.light_add(type="SUN", rotation=(math.radians(55), math.radians(-20), math.radians(-30))); bpy.context.object.data.energy = 3.2
    vues = [("nc-vue-cour.png", (3, 6, 3), (0, -15, 9)), ("nc-vue-rue.png", (6, -50, 4), (0, -27, 8)), ("nc-vue-haut.png", (60, -60, 90), (0, 30, 0))]
    for nom, pos, vise in vues:
        bpy.ops.object.camera_add(location=pos); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 22
        cible = bpy.data.objects.new("cible", None); cible.location = vise; sc.collection.objects.link(cible)
        tc = cam.constraints.new("TRACK_TO"); tc.target = cible; tc.track_axis = "TRACK_NEGATIVE_Z"; tc.up_axis = "UP_Y"
        sc.render.engine = "CYCLES"; sc.cycles.samples = 12; sc.cycles.device = "CPU"; sc.cycles.use_denoising = False
        sc.render.resolution_x, sc.render.resolution_y = 1100, 700
        sc.render.filepath = os.path.join(OUT, nom); bpy.ops.render.render(write_still=True)
        bpy.data.objects.remove(cam); bpy.data.objects.remove(cible)

bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "carte.glb"), export_format="GLB", export_image_format=os.environ.get("FMT", "WEBP"), export_apply=True, export_yup=True, export_cameras=False, export_lights=False)
print("FINI")
