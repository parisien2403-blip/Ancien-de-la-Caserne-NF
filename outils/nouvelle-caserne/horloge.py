"""Le bâtiment de l'horloge (au fond de la cour d'honneur), en vrai relief — mêmes cotes que dans matrice.js (toileFondCour, facadePercee) :
44 m de large, 27 m de haut, 12 m de profondeur ; socle de pierre de 6,4 m, sept étages de brique, 14 travées ;
fenêtres de 1,5 × 1,85 m, balcons blancs une travée sur deux ; au milieu du socle, le passage carré (4,8 × 4,4 m) et l'horloge au-dessus.
Repère de Blender : la façade est le plan y = 18 (dans le jeu : z = -18), tournée vers -y (vers la cour) ; z vers le haut.
Tout est construit directement en quelques maillages (un par matière) : rapide à fabriquer, léger pour le téléphone."""
import bpy, bmesh, math, os
from mathutils import Matrix, Vector

D = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(D, "tex")
Y0 = 18.0; W = 44.0; H = 27.0; P = 12.0; SOCLE = 6.4
PAS = W / 14; FW, FH = 1.5, 1.85; RET = .25          # (RET : le retrait des fenêtres dans le mur)

def mat_tex(nom, image, rug=.85, force=1.0):
    if nom in bpy.data.materials: return bpy.data.materials[nom]   # (une seule fois par matière, pour tous les bâtiments)
    m = bpy.data.materials.new(nom); m.use_nodes = True; nt = m.node_tree; p = nt.nodes["Principled BSDF"]
    ti = nt.nodes.new("ShaderNodeTexImage"); ti.image = bpy.data.images.load(os.path.join(TEX, image + ".png")); nt.links.new(ti.outputs["Color"], p.inputs["Base Color"])
    tn = nt.nodes.new("ShaderNodeTexImage"); tn.image = bpy.data.images.load(os.path.join(TEX, image + "_n.png")); tn.image.colorspace_settings.name = "Non-Color"
    nm = nt.nodes.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = force; nt.links.new(tn.outputs["Color"], nm.inputs["Color"]); nt.links.new(nm.outputs["Normal"], p.inputs["Normal"])
    p.inputs["Roughness"].default_value = rug; return m

def mat(nom, c, rug=.6, met=0.0):
    if nom in bpy.data.materials: return bpy.data.materials[nom]
    m = bpy.data.materials.new(nom); m.use_nodes = True; p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = list(c) + [1]; p.inputs["Roughness"].default_value = rug; p.inputs["Metallic"].default_value = met; return m

def uv_boite_monde(o, taille=2.0):
    """des coordonnées de texture « en boîte », en mètres, sur un objet déjà en coordonnées du monde"""
    bm = bmesh.new(); bm.from_mesh(o.data); uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
        for l in f.loops:
            v = l.vert.co; a, c = ((v.y, v.z) if ax == 0 else (v.x, v.z) if ax == 1 else (v.x, v.y)); l[uv].uv = (a / taille, c / taille)
    bm.to_mesh(o.data); bm.free()

class Atelier:
    """des boîtes (et quelques cylindres), rangées par matière, chacune dans son maillage"""
    def __init__(s): s.bm = {}
    def _b(s, m):
        if m not in s.bm: b = bmesh.new(); b.loops.layers.uv.verify(); s.bm[m] = b
        return s.bm[m]
    def boite(s, m, sx, sy, sz, x, y, z, rot=None, uv=2.0):
        b = s._b(m); r = bmesh.ops.create_cube(b, size=1.0)
        M = Matrix.Translation((x, y, z)) @ (rot.to_4x4() if rot else Matrix.Identity(4)) @ Matrix.Diagonal((sx, sy, sz, 1))
        bmesh.ops.transform(b, matrix=M, verts=r["verts"]); s._uv(b, r["verts"], uv)
    def de(s, m, x0, x1, y0, y1, z0, z1, uv=2.0):
        if x1 - x0 > 1e-4 and y1 - y0 > 1e-4 and z1 - z0 > 1e-4: s.boite(m, x1 - x0, y1 - y0, z1 - z0, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, uv=uv)
    def cylindre(s, m, r, h, x, y, z, axe="z", n=16):
        b = s._b(m); res = bmesh.ops.create_cone(b, cap_ends=True, segments=n, radius1=r, radius2=r, depth=h)
        R = Matrix.Identity(4) if axe == "z" else Matrix.Rotation(math.pi / 2, 4, "X")
        bmesh.ops.transform(b, matrix=Matrix.Translation((x, y, z)) @ R, verts=res["verts"]); s._uv(b, res["verts"], 1.0)
    def tore(s, m, R, r, x, y, z):
        b = s._b(m); n1, n2 = 40, 8; vs = []
        for i in range(n1):
            a = 2 * math.pi * i / n1; ligne = []
            for j in range(n2):
                c = 2 * math.pi * j / n2; ligne.append(b.verts.new((x + (R + r * math.cos(c)) * math.cos(a), y + r * math.sin(c), z + (R + r * math.cos(c)) * math.sin(a))))
            vs.append(ligne)
        for i in range(n1):
            for j in range(n2): b.faces.new((vs[i][j], vs[(i + 1) % n1][j], vs[(i + 1) % n1][(j + 1) % n2], vs[i][(j + 1) % n2]))
    def _uv(s, b, verts, taille):
        uv = b.loops.layers.uv.active; vs = set(verts)
        for f in {f for v in verts for f in v.link_faces}:
            if not all(v in vs for v in f.verts): continue
            f.normal_update(); n = f.normal; ax = max(range(3), key=lambda i: abs(n[i]))
            for l in f.loops:
                v = l.vert.co; a, c = ((v.y, v.z) if ax == 0 else (v.x, v.z) if ax == 1 else (v.x, v.y)); l[uv].uv = (a / taille, c / taille)
    def objets(s, nom):
        out = []
        for m, b in s.bm.items():
            bmesh.ops.recalc_face_normals(b, faces=b.faces)
            me = bpy.data.meshes.new(nom + "_" + m.name); b.to_mesh(me); b.free(); me.materials.append(m)
            o = bpy.data.objects.new(nom + "_" + m.name, me); bpy.context.scene.collection.objects.link(o); out.append(o)
        return out

def mur_perce(A, m, x0, x1, z0, z1, yA, yB, trous, uv=2.0):
    """un pan de mur (de yA à yB d'épaisseur) percé de trous rectangulaires [x0, x1, z0, z1] : découpé en cases, sans les trous"""
    xs = sorted({x0, x1, *[t[0] for t in trous], *[t[1] for t in trous]}); zs = sorted({z0, z1, *[t[2] for t in trous], *[t[3] for t in trous]})
    xs = [x for x in xs if x0 <= x <= x1]; zs = [z for z in zs if z0 <= z <= z1]
    for i in range(len(xs) - 1):
        for j in range(len(zs) - 1):
            cx, cz = (xs[i] + xs[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2
            if any(t[0] < cx < t[1] and t[2] < cz < t[3] for t in trous): continue
            A.de(m, xs[i], xs[i + 1], yA, yB, zs[j], zs[j + 1], uv)

def construire():
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); SOCLEM = mat_tex("nc_socle", "socle", .85, 1.2); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45); FER = mat("nc_fer", (.05, .05, .055), .4, .7)
    ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7); CADRAN = mat("nc_cadran", (.97, .96, .93), .3); LANT = mat("nc_lanterne", (1, .93, .75), .3)
    A = Atelier()
    xs = [-W / 2 + (c + .5) * PAS for c in range(14)]
    ztop = lambda r: H - (34 + r * 112) / 40          # le haut de la fenêtre de l'étage r (0 = le plus haut)
    fen = [(x - FW / 2, x + FW / 2, ztop(r) - FH, ztop(r)) for r in range(7) for x in xs]
    # ---- les étages de brique : la façade percée de ses 98 fenêtres, la masse derrière, les tableaux des fenêtres ----
    mur_perce(A, BRIQUE, -W / 2, W / 2, SOCLE, H, Y0, Y0 + RET, fen)
    A.de(BRIQUE, -W / 2, W / 2, Y0 + RET, Y0 + P - RET, SOCLE, H)   # (derrière : la façade sur la deuxième cour, verso.py)
    for r in range(7):
        zt = ztop(r); zb = zt - FH
        for c, x in enumerate(xs):
            A.de(VITRE, x - FW / 2, x + FW / 2, Y0 + RET - .03, Y0 + RET, zb, zt, 1)
            A.de(MENUIS, x - .03, x + .03, Y0 + RET - .08, Y0 + RET - .03, zb, zt, 1); A.de(MENUIS, x - FW / 2, x + FW / 2, Y0 + RET - .08, Y0 + RET - .03, zt - .58, zt - .52, 1)
            for s in (-1, 1): A.de(MENUIS, x + s * (FW / 2) - (.07 if s > 0 else 0), x + s * (FW / 2) + (0 if s > 0 else .07), Y0 + RET - .08, Y0 + RET - .03, zb, zt, 1)
            A.de(MENUIS, x - FW / 2, x + FW / 2, Y0 + RET - .08, Y0 + RET - .03, zt - .07, zt, 1); A.de(MENUIS, x - FW / 2, x + FW / 2, Y0 + RET - .08, Y0 + RET - .03, zb, zb + .07, 1)
            A.de(PIERRE, x - FW / 2 - .15, x + FW / 2 + .15, Y0 - .2, Y0 + .1, zb - .12, zb)                 # l'appui
            A.de(PIERRE, x - FW / 2 - .17, x + FW / 2 + .17, Y0 - .1, Y0 + .02, zt, zt + .26)               # le linteau
            A.de(PIERRE, x - .13, x + .13, Y0 - .15, Y0 + .02, zt - .04, zt + .32)                          # sa clé
            for s in (-1, 1): A.de(PIERRE, x + s * (FW / 2 + .05) - .05, x + s * (FW / 2 + .05) + .05, Y0 - .05, Y0 + .02, zb, zt)   # le chambranle
            if c % 2 == 1:   # le balcon : la dalle blanche sur ses consoles, la grille en fer forgé
                A.de(PIERRE, x - 1.15, x + 1.15, Y0 - .9, Y0, zb - .16, zb)
                for s in (-1, 1): A.de(PIERRE, x + s * .8 - .07, x + s * .8 + .07, Y0 - .5, Y0, zb - .44, zb - .16)
                for k in range(17): A.de(FER, x - 1.09 + k * .135, x - 1.068 + k * .135, Y0 - .87, Y0 - .848, zb, zb + .9, 1)
                A.de(FER, x - 1.12, x + 1.12, Y0 - .885, Y0 - .835, zb + .88, zb + .93, 1); A.de(FER, x - 1.12, x + 1.12, Y0 - .875, Y0 - .845, zb + .08, zb + .11, 1)
                for s in (-1, 1): A.de(FER, x + s * 1.12 - .015, x + s * 1.12 + .015, Y0 - .87, Y0, zb + .88, zb + .93, 1)
            else:            # une barre d'appui en fer
                for k in range(9): A.de(FER, x - .61 + k * .15, x - .59 + k * .15, Y0 - .03, Y0 - .01, zb, zb + .55, 1)
                A.de(FER, x - .63, x + .63, Y0 - .04, Y0 - .005, zb + .53, zb + .57, 1)
    # ---- la corniche du socle, le bandeau ; l'acrotère et son chéneau en haut ----
    A.de(PIERRE, -W / 2 - .15, W / 2 + .15, Y0 - .37, Y0 + .1, SOCLE - .06, SOCLE + .26); A.de(PIERRE, -W / 2 - .1, W / 2 + .1, Y0 - .28, Y0, SOCLE - .2, SOCLE - .06)
    A.de(PIERRE, -W / 2 - .2, W / 2 + .2, Y0 - .38, Y0 + .1, H - .4, H + .05); A.de(PIERRE, -W / 2 - .15, W / 2 + .15, Y0 - .3, Y0, H - .55, H - .4)
    A.de(ZINC, -W / 2 - .1, W / 2 + .1, Y0 - .42, Y0 - .2, H - .72, H - .55, 1)
    for x in (-W / 2 + .18, -W / 2 + 4 * PAS, W / 2 - 4 * PAS, W / 2 - .18): A.cylindre(ZINC, .06, H - SOCLE - .75, x, Y0 - .12, SOCLE + (H - SOCLE - .75) / 2)
    # ---- le socle de pierre : percé du passage, des portes et des baies ----
    baies = [(s * (d + L / 2) / 40, L / 40) for s in (-1, 1) for d, L in ((124, 66), (220, 110), (400, 110), (580, 110), (760, 110))]
    trous = [(-2.4, 2.4, 0, 4.4)] + [(x - l / 2, x + l / 2, 0 if l < 2 else 1.0, 4.5) for x, l in baies]
    mur_perce(A, SOCLEM, -W / 2, W / 2, 0, SOCLE, Y0, Y0 + RET, trous)
    mur_perce(A, SOCLEM, -W / 2, W / 2, 0, SOCLE, Y0 + RET, Y0 + P - RET, [(-2.4, 2.4, 0, 4.4)])
    for x, l in baies:
        z0 = 0 if l < 2 else 1.0
        A.de(VITRE, x - l / 2, x + l / 2, Y0 + RET - .03, Y0 + RET, z0, 4.5, 1)
        for xx in (x - l / 2, x - .035, x + l / 2 - .07): A.de(MENUIS, xx, xx + .07, Y0 + RET - .08, Y0 + RET - .03, z0, 4.5, 1)
        for zz in (z0, (z0 + 4.5) / 2 + .6, 3.7, 4.43): A.de(MENUIS, x - l / 2, x + l / 2, Y0 + RET - .08, Y0 + RET - .03, zz, zz + .07, 1)
        A.de(PIERRE, x - l / 2 - .15, x + l / 2 + .15, Y0 - .12, Y0 + .05, 4.5, 4.66)
        if z0: A.de(PIERRE, x - l / 2 - .1, x + l / 2 + .1, Y0 - .2, Y0 + .1, .88, 1.0)
    # ---- le passage : son linteau, son plafond ----
    A.de(PIERRE, -2.8, 2.8, Y0 - .2, Y0 + .1, 4.45, 4.9); A.de(PIERRE, -2.4, 2.4, Y0, Y0 + P, 4.4, 4.5)
    # ---- l'horloge, au-dessus du passage ----
    zc = 5.65
    A.cylindre(CADRAN, .66, .1, 0, Y0 - .05, zc, axe="y", n=48); A.tore(FER, .68, .055, 0, Y0 - .1, zc)
    for i in range(12):
        a = i * math.pi / 6; L = .13 if i % 3 == 0 else .07
        A.boite(FER, .045, .02, L, .53 * math.sin(a), Y0 - .11, zc + .53 * math.cos(a), rot=Matrix.Rotation(-a, 3, "Y"), uv=1)
    A.boite(FER, .04, .02, .36, 0, Y0 - .13, zc + .17, uv=1)                                                       # la grande aiguille (midi)
    A.boite(FER, .055, .02, .26, .11, Y0 - .14, zc - .05, rot=Matrix.Rotation(2.0, 3, "Y"), uv=1)                  # la petite (quatre heures)
    # ---- deux lanternes murales de part et d'autre du passage ----
    for s in (-1, 1):
        x = s * 3.3; A.de(FER, x - .03, x + .03, Y0 - .32, Y0, 3.27, 3.33, 1)
        A.de(LANT, x - .14, x + .14, Y0 - .5, Y0 - .22, 2.95, 3.37, 1); A.de(FER, x - .17, x + .17, Y0 - .53, Y0 - .19, 3.37, 3.43, 1); A.de(FER, x - .15, x + .15, Y0 - .51, Y0 - .21, 2.9, 2.95, 1)
    # ---- le toit (terrasse) ----
    A.de(ZINC, -W / 2, W / 2, Y0 + .1, Y0 + P, H, H + .1)
    return A.objets("horloge")
