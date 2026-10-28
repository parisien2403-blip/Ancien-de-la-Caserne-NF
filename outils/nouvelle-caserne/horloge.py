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
    def prisme(s, m, profil, x0, x1, uv=2.0):
        """un profil fermé [(y, z), …] extrudé de x0 à x1 (un toit, une corniche moulurée)"""
        b = s._b(m); g = [b.verts.new((x0, y, z)) for y, z in profil]; d = [b.verts.new((x1, y, z)) for y, z in profil]; n = len(profil)
        b.faces.new(g[::-1]); b.faces.new(d)
        for i in range(n): b.faces.new((g[i], g[(i + 1) % n], d[(i + 1) % n], d[i]))
        s._uv(b, g + d, uv)
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

def construire(sortie=None):
    """d'après la photo de la cour d'honneur : 14 travées symétriques autour du passage —
    depuis le milieu : N (porte-fenêtre), B (porte-fenêtre et balcon-caisson blanc), S (deux petites fenêtres jumelles cerclées de blanc), N, S, B, N ;
    le socle de pierre (le passage des véhicules, deux portes de chaque côté), sa corniche ; sept étages de brique :
    au 1er, la brique à refends et l'horloge au-dessus du passage ; du 2e au 5e (au 6e pour les travées B du bord), les balcons-caissons ;
    au 6e, le grand balcon (le « sur-balcon ») du corps central, ses deux fenêtres cintrées ; deux larges bandeaux blancs ;
    le 7e (l'attique) : le haut enduit de blanc ; la corniche, le toit mansardé en ardoise et ses cheminées."""
    global SOCLE
    BRIQUE = mat_tex("nc_brique", "brique", .9, 1.0); SOCLEM = mat_tex("nc_socle", "socle", .85, 1.2); PIERRE = mat_tex("nc_pierre", "pierre", .7, .6)
    ARDOISE = mat_tex("nc_ardoise", "ardoise", .6, 1.0)
    VITRE = mat("nc_vitre", (.10, .13, .17), .08, .2); MENUIS = mat("nc_menuiserie", (.94, .93, .9), .45); FER = mat("nc_fer", (.05, .05, .055), .4, .7)
    ZINC = mat("nc_zinc", (.42, .45, .48), .4, .7); CADRAN = mat("nc_cadran", (.97, .96, .93), .3); LANT = mat("nc_lanterne", (1, .93, .75), .3)
    RIDEAU = mat("nc_rideau", (.86, .84, .78), .9); STORE = mat("nc_store", (.62, .52, .38), .85); BOIS = mat("nc_bois_porte", (.20, .13, .09), .6)
    ROUGE = mat("nc_rouge", (.55, .16, .1), .55); POT = mat("nc_pot", (.62, .27, .16), .8); PLAQUE = mat("nc_plaque", (.93, .93, .9), .5); SOMBRE = mat("nc_sombre", (.12, .11, .1), .9)
    import random; rnd = random.Random(18)
    A = Atelier(); SOCLE = 5.6; FL = (H - SOCLE) / 7
    zf = lambda k: SOCLE + (k - 1) * FL                        # (le plancher de l'étage k, de 1 à 7)
    CEN = 2 * PAS                                              # (le corps central : les quatre travées du milieu, en avant de 20 cm)
    yF = lambda x: Y0 - .2 if abs(x) < CEN - 1e-6 else Y0       # (le nu de la façade)
    YV = Y0 + RET - .03                                        # (les vitres)
    TYPES = {.5: "N", 1.5: "B", 2.5: "S", 3.5: "N", 4.5: "S", 5.5: "B", 6.5: "N"}
    baies = [((b - 6.5) * PAS, TYPES[abs(b - 6.5)], abs(b - 6.5)) for b in range(14)]
    nuit = []                                                  # (les vitres, pour les allumer la nuit dans le jeu)
    def ouverture(x, k, t, o):
        z = zf(k)
        if t == "S": return [(x - .6, x + .6, z + 1.25, z + 2.25)]
        if k == 6 and t == "B" and o < 2: return [(x - .68, x + .68, z + .12, z + 1.9)] + [(x - .68 * math.sin(math.pi * (i + 1) / 13), x + .68 * math.sin(math.pi * (i + 1) / 13), z + 1.9, z + 1.9 + .68 * math.cos(math.pi * (i + .5) / 13 - math.pi / 2) + .001) for i in range(0)]
        return [(x - .68, x + .68, z + .12, z + 2.25)]
    trous = []
    for k in range(1, 8):
        for x, t, o in baies:
            trous += ouverture(x, k, t, o)
            if k == 6 and t == "B" and o < 2:   # (la fenêtre cintrée : le demi-cercle, en tranches)
                for i in range(10):
                    a0, a1 = i / 10, (i + 1) / 10; hw = .68 * math.sqrt(max(0, 1 - ((a0 + a1) / 2) ** 2))
                    trous.append((x - hw, x + hw, zf(6) + 1.9 + .68 * a0, zf(6) + 1.9 + .68 * a1))
    # ---- les étages : la brique (le haut de l'attique enduit de blanc), percée ; le corps central en avant ----
    ZBL = zf(7) + 2.0
    for x0, x1 in ((-W / 2, -CEN), (-CEN, CEN), (CEN, W / 2)):
        y0 = yF((x0 + x1) / 2)
        tr = [t for t in trous if t[1] > x0 and t[0] < x1]
        mur_perce(A, BRIQUE, x0, x1, zf(2), ZBL, y0, Y0 + RET, tr)
        mur_perce(A, PIERRE, x0, x1, ZBL, H, y0, Y0 + RET, tr)
        # le 1er étage : la brique à refends (de larges assises de 38 cm, des rainures de 4 cm)
        mur_perce(A, BRIQUE, x0, x1, zf(1), zf(2), y0 + .03, Y0 + RET, tr)
        z = zf(1)
        while z < zf(2) - .1:
            for a, b, h0, h1 in __import__("porche").cases(x0, x1, z, min(z + .34, zf(2)), tr): A.de(BRIQUE, a, b, y0, y0 + .03, h0, h1)
            z += .38
    A.de(BRIQUE, -W / 2, W / 2, Y0 + RET, Y0 + P - RET, SOCLE, H)   # (la masse ; derrière : la façade sur la deuxième cour, verso.py)
    for x in (-CEN, CEN): A.de(BRIQUE, x - .001, x + .001, Y0 - .2, Y0, zf(1), H)   # (les retours du corps central)
    # ---- les fenêtres ----
    def croisee(x0, x1, z0, z1, yv, petitsbois=3):
        for xx in (x0, x1 - .07, (x0 + x1) / 2 - .035): A.de(MENUIS, xx, xx + .07, yv - .06, yv, z0, z1, 1)
        for zz in [z0, z1 - .07] + [z0 + (z1 - z0) * i / petitsbois for i in range(1, petitsbois)]: A.de(MENUIS, x0, x1, yv - .06, yv, zz, zz + .05, 1)
    def vitre(x0, x1, z0, z1):
        r = rnd.random(); m = STORE if r < .07 else RIDEAU if r < .55 else VITRE
        A.de(m, x0, x1, YV, YV + .03, z0, z1, 1); nuit.append([(x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0])
    def garde_corps(x, z, yy, larg=1.36, haut=.95):
        for i in range(int(larg / .12) + 1): A.de(FER, x - larg / 2 + i * .12, x - larg / 2 + i * .12 + .018, yy - .04, yy - .02, z, z + haut, 1)
        A.de(FER, x - larg / 2 - .02, x + larg / 2 + .02, yy - .05, yy - .01, z + haut - .04, z + haut, 1); A.de(FER, x - larg / 2, x + larg / 2, yy - .05, yy - .01, z + .1, z + .13, 1)
        A.de(FER, x - larg / 2, x + larg / 2, yy - .05, yy - .01, z + haut - .3, z + haut - .27, 1)
    for k in range(1, 8):
        z = zf(k)
        for x, t, o in baies:
            yf = yF(x)
            if t == "S":
                # deux petites fenêtres jumelles dans un cadre de pierre blanche, un meneau au milieu
                vitre(x - .6, x + .6, z + 1.25, z + 2.25)
                for xx0, xx1 in ((x - .6, x - .1), (x + .1, x + .6)): croisee(xx0, xx1, z + 1.25, z + 2.25, YV, 2)
                A.de(PIERRE, x - .1, x + .1, yf - .02, YV, z + 1.25, z + 2.25)
                A.de(PIERRE, x - .74, x + .74, yf - .06, yf + .05, z + 2.25, z + 2.38); A.de(PIERRE, x - .78, x + .78, yf - .1, yf + .05, z + 1.12, z + 1.25)
                for s in (-1, 1): A.de(PIERRE, x + s * .67 - .07, x + s * .67 + .07, yf - .06, yf + .05, z + 1.25, z + 2.25)
                continue
            arc = k == 6 and t == "B" and o < 2
            zh = z + (1.9 if arc else 2.25)
            vitre(x - .68, x + .68, z + .12, zh); croisee(x - .68, x + .68, z + .12, zh, YV)
            A.de(PIERRE, x - .78, x + .78, yf - .08, yf + .05, z + .04, z + .12)                         # (l'appui, mince)
            if arc:
                # la fenêtre cintrée : le haut en demi-cercle (vitre et petit-bois), l'archivolte blanche, le pilastre blanc qui monte au-dessus
                for i in range(10):
                    a0, a1 = i / 10, (i + 1) / 10; hw = .68 * math.sqrt(max(0, 1 - ((a0 + a1) / 2) ** 2))
                    A.de(VITRE, x - hw, x + hw, YV, YV + .03, zh + .68 * a0, zh + .68 * a1, 1)
                for i in range(18):
                    a = math.pi * (i + .5) / 18; c = (x - .86 * math.cos(a), zh + .86 * math.sin(a))
                    A.boite(PIERRE, .26, .16, .32, c[0], yf - .04, c[1], rot=Matrix.Rotation(-(math.pi / 2 - a), 3, "Y"), uv=1)
                for s in (-1, 1): A.de(PIERRE, x + s * .79 - .09, x + s * .79 + .09, yf - .12, yf + .04, z + .12, zh)
                A.de(PIERRE, x - .14, x + .14, yf - .12, yf + .02, zh + 1.0, zf(7) - .2)
                nuit[-1][3] += .4; nuit[-1][1] += .2
            elif k == 6 and t == "B" or (2 <= k <= 5 and t == "B"):
                # le balcon-caisson blanc : la dalle, le garde-corps plein, son chaperon
                A.de(PIERRE, x - 1.15, x + 1.15, yf - .85, yf, z - .18, z); A.de(PIERRE, x - 1.15, x + 1.15, yf - .85, yf - .73, z, z + 1.0)
                for s in (-1, 1): A.de(PIERRE, x + s * 1.15 - (.12 if s > 0 else 0), x + s * 1.15 + (0 if s > 0 else .12), yf - .73, yf, z, z + 1.0)
                A.de(PIERRE, x - 1.2, x + 1.2, yf - .9, yf - .68, z + 1.0, z + 1.07)
                if rnd.random() < .3:   # (des pots de fleurs sur le rebord)
                    for i in range(3): A.de(POT, x - .6 + i * .45, x - .4 + i * .45, yf - .85, yf - .7, z + 1.07, z + 1.25); A.de(ROUGE, x - .62 + i * .45, x - .38 + i * .45, yf - .86, yf - .69, z + 1.25, z + 1.38, 1)
            elif not (k == 6 and t == "B"):
                garde_corps(x, z + .12, yf)                                                                 # (la barre d'appui des portes-fenêtres)
                if k == 7 and o < 2: A.de(PIERRE, x - .9, x + .9, yf - .35, yf, z - .05, z + .1)
    # ---- le 6e : le grand balcon du corps central (garde-corps plein ; au milieu, une grille), les deux caissons des fenêtres cintrées ----
    z6 = zf(6); yc = Y0 - .2
    A.de(PIERRE, -CEN - .3, CEN + .3, yc - .75, yc, z6 - .2, z6)
    for x0, x1 in ((-CEN - .3, -PAS), (PAS, CEN + .3)): A.de(PIERRE, x0, x1, yc - .75, yc - .63, z6, z6 + .95); A.de(PIERRE, x0 - .03, x1 + .03, yc - .8, yc - .58, z6 + .95, z6 + 1.02)
    A.de(PIERRE, -PAS, PAS, yc - .75, yc - .63, z6, z6 + .18); garde_corps(0, z6 + .18, yc - .63, 2 * PAS, .8)
    for s in (-1, 1):
        x = s * 1.5 * PAS; A.de(PIERRE, x - 1.3, x + 1.3, yc - 1.1, yc, z6 - .25, z6); A.de(PIERRE, x - 1.3, x + 1.3, yc - 1.1, yc - .98, z6, z6 + 1.0)
        for t in (-1, 1): A.de(PIERRE, x + t * 1.3 - (.12 if t > 0 else 0), x + t * 1.3 + (0 if t > 0 else .12), yc - .98, yc - .75, z6, z6 + 1.0)
        A.de(PIERRE, x - 1.35, x + 1.35, yc - 1.15, yc - .93, z6 + 1.0, z6 + 1.07)
        A.de(FER, x - .7, x + .7, yc - 1.0, yc - .97, z6 + 1.07, z6 + 1.1, 1)
        for i in range(12): A.de(FER, x - .66 + i * .12, x - .64 + i * .12, yc - .99, yc - .97, z6 + 1.07, z6 + 1.3, 1)
    # ---- les bandeaux blancs (au 6e, au 7e), la corniche du socle, la corniche du haut ----
    for zb, ep, sa in ((z6 - .3, .42, .45), (zf(7) - .25, .38, .4)):
        A.de(PIERRE, -W / 2 - .1, W / 2 + .1, Y0 - sa, Y0 + .05, zb, zb + ep); A.de(PIERRE, -W / 2 - .1, W / 2 + .1, Y0 - sa - .06, Y0 - sa + .1, zb + ep - .08, zb + ep)
        A.de(PIERRE, -CEN, CEN, Y0 - .2 - sa, Y0 - .15, zb, zb + ep)
    A.de(PIERRE, -W / 2 - .15, W / 2 + .15, Y0 - .45, Y0 + .1, SOCLE - .14, SOCLE + .16); A.de(ZINC, -W / 2 - .15, W / 2 + .15, Y0 - .47, Y0 + .1, SOCLE + .16, SOCLE + .19, 1)
    A.de(PIERRE, -W / 2 - .2, W / 2 + .2, Y0 - .55, Y0 + .1, H - .12, H + .3); A.de(PIERRE, -W / 2 - .12, W / 2 + .12, Y0 - .38, Y0, H - .3, H - .12)
    A.de(ZINC, -W / 2 - .2, W / 2 + .2, Y0 - .62, Y0 - .45, H + .12, H + .3, 1)
    for x in (-W / 2 + .2, W / 2 - .2): A.cylindre(ZINC, .065, H - SOCLE, x, Y0 - .14, SOCLE + (H - SOCLE) / 2)
    # ---- le socle de pierre : le passage des véhicules, deux portes de chaque côté ----
    PH, PL = 4.4, 2.7
    portes = [(s * 5.1, s * 7.3) for s in (-1, 1)] + [(s * 8.0, s * 10.2) for s in (-1, 1)]
    portes = [tuple(sorted(p)) for p in portes]
    trS = [(-PL, PL, 0, PH)] + [(a, b, 0, 3.6) for a, b in portes]
    mur_perce(A, SOCLEM, -W / 2, W / 2, 0, SOCLE, Y0, Y0 + RET, trS)
    mur_perce(A, SOCLEM, -W / 2, W / 2, 0, SOCLE, Y0 + RET, Y0 + P - RET, [(-PL, PL, 0, PH)])
    A.de(PIERRE, -PL, PL, Y0, Y0 + P, PH, PH + .1)                                                   # (le plafond du passage)
    for a, b in portes:
        vitree = abs(a) < 7.5
        A.de(BOIS, a, b, Y0 + RET - .04, Y0 + RET, 0, 3.6, 1)
        for xx in (a, b - .1, (a + b) / 2 - .05): A.de(BOIS, xx, xx + .1, Y0 + RET - .1, Y0 + RET - .04, 0, 3.6, 1)
        for zz in (0, 2.75, 3.5) if vitree else (0, 2.5, 3.5): A.de(BOIS, a, b, Y0 + RET - .1, Y0 + RET - .04, zz, zz + .1, 1)
        zv0 = 1.0 if vitree else 2.6
        for xx0, xx1 in ((a + .1, (a + b) / 2 - .05), ((a + b) / 2 + .05, b - .1)):
            A.de(VITRE, xx0, xx1, Y0 + RET - .05, Y0 + RET - .04, zv0, 2.75 if vitree else 3.5, 1)
            for i in range(1, 3): A.de(BOIS, xx0, xx1, Y0 + RET - .08, Y0 + RET - .05, zv0 + (2.75 - zv0 if vitree else .9) * i / 3, zv0 + (2.75 - zv0 if vitree else .9) * i / 3 + .04, 1)
        A.de(VITRE, a + .1, b - .1, Y0 + RET - .05, Y0 + RET - .04, 2.85, 3.5, 1)
    # (les petites choses du socle : la plaque au-dessus du passage, le disque rouge et blanc à gauche, la plaque sombre à droite)
    A.de(PLAQUE, -.3, .3, Y0 - .03, Y0, 4.75, 5.15, 1)
    A.cylindre(ROUGE, .2, .03, -3.1, Y0 - .02, 2.2, axe="y", n=24); A.cylindre(PLAQUE, .15, .03, -3.1, Y0 - .03, 2.2, axe="y", n=24)
    A.de(SOMBRE, 2.85, 3.25, Y0 - .03, Y0, 1.95, 2.2, 1)
    # ---- l'horloge : au 1er étage, juste au-dessus du passage, entre les deux fenêtres du milieu ----
    zc = zf(1) + 1.3; yh = Y0 - .2
    A.cylindre(CADRAN, .45, .1, 0, yh - .05, zc, axe="y", n=48); A.tore(FER, .47, .045, 0, yh - .1, zc)
    for i in range(12):
        a = i * math.pi / 6; L = .09 if i % 3 == 0 else .05
        A.boite(FER, .035, .02, L, .37 * math.sin(a), yh - .11, zc + .37 * math.cos(a), rot=Matrix.Rotation(a, 3, "Y"), uv=1)
    A.boite(FER, .03, .02, .27, -.05, yh - .13, zc + .12, rot=Matrix.Rotation(.35, 3, "Y"), uv=1)
    A.boite(FER, .045, .02, .19, .08, yh - .14, zc - .03, rot=Matrix.Rotation(2.1, 3, "Y"), uv=1)
    # ---- la lanterne murale (à droite, au 2e) ----
    x = 7.8; zl = zf(2) + 1.1
    A.de(FER, x - .03, x + .03, Y0 - .45, Y0, zl + .45, zl + .5, 1); A.de(LANT, x - .13, x + .13, Y0 - .58, Y0 - .32, zl, zl + .42, 1)
    A.de(FER, x - .16, x + .16, Y0 - .61, Y0 - .29, zl + .42, zl + .47, 1); A.de(FER, x - .05, x + .05, Y0 - .5, Y0 - .4, zl - .12, zl, 1)
    # ---- le toit mansardé en ardoise, ses cheminées de brique et leurs pots ----
    A.prisme(ARDOISE, [(Y0 - .3, H + .3), (Y0 + 1.3, H + 3.2), (Y0 + P - 1.3, H + 3.2), (Y0 + P + .3, H + .3)], -W / 2, W / 2)
    for x in (-17.5, -9.0, 3.5, 14.0):
        A.de(BRIQUE, x - .7, x + .7, Y0 + 2.5, Y0 + 3.3, H + 1.5, H + 4.6); A.de(PIERRE, x - .78, x + .78, Y0 + 2.42, Y0 + 3.38, H + 4.6, H + 4.75)
        for i in range(3): A.cylindre(POT, .1, .45, x - .4 + i * .4, Y0 + 2.9, H + 4.98, n=10)
    if sortie:
        import json; open(sortie, "w").write(json.dumps([[round(v, 3) for v in f] for f in nuit]))
    return A.objets("horloge")
